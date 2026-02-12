use std::sync::Arc;

use nalgebra::{Matrix3, Rotation3, Unit, UnitQuaternion, Vector3};

#[derive(Debug, Copy, Clone)]
pub struct Pose {
    pub position: Vector3<f64>,
    pub rotation: UnitQuaternion<f64>,
}

pub trait Frame: Send + Sync {
    fn name(&self) -> &str;
    // Returns the parent frame, or None if this is a root frame
    // also is &dyn Frame to allow for dynamic dispatch and trait objects
    fn parent(&self) -> Option<&dyn Frame>;
    // Returns the pose of this frame relative to its parent at time t
    fn pose(&self, t: f64) -> Pose;
}

pub struct RotatingFrame {
    name: String,
    parent: Arc<dyn Frame>,
    omega: Vector3<f64>, // radians per second in the desired axis of rotation
    t0: f64,    // reference time for zero rotation
    q0: UnitQuaternion<f64>, // initial rotation at time t0
}

impl Frame for RotatingFrame {
    fn name(&self) -> &str {
        &self.name
    }

    fn parent(&self) -> Option<&dyn Frame> {
        Some(self.parent.as_ref())
    }

    fn pose(&self, t: f64) -> Pose {
        let rate = self.omega.norm();
        if rate < f64::EPSILON {
            return Pose { position: Vector3::zeros(), rotation: self.q0 };
        }
        let angle = rate * (t - self.t0);
        let axis = Unit::new_normalize(self.omega);
        let rotation = UnitQuaternion::from_axis_angle(&axis, angle) * self.q0;
        Pose { position: Vector3::zeros(), rotation }
    }
}

const EARTH_ROT_RATE: f64 = 7.292_115_0e-5; // rad/s
impl RotatingFrame {
    pub fn new (name: &str, parent: Arc<dyn Frame>, omega: Vector3<f64>, t0: f64, q0: UnitQuaternion<f64>) -> Self {
        Self { name: name.to_string(), parent, omega, t0, q0 }
    }

    pub fn ecef(parent: Arc<dyn Frame>, t0: f64) -> Self {
        Self {
            name: "ECEF".to_string(),
            parent,
            omega: Vector3::new(0.0, 0.0, EARTH_ROT_RATE), // Earth's rotation rate, rad/s
            t0,
            q0: UnitQuaternion::identity(),
        }
    }
}

const EARTH_RADIUS: f64 = 6_371.0; // kilometers

// ECI and SEZ are both fixed frames, so they can be implemented as FixedFrame with appropriate offsets
pub struct FixedFrame {
    name: String,
    parent: Option<Arc<dyn Frame>>,
    offset: Pose,
}

impl Frame for FixedFrame {
    fn name(&self) -> &str { &self.name }
    fn parent(&self) -> Option<&dyn Frame> {
        self.parent.as_ref().map(|p| p.as_ref())
    }
    fn pose(&self, _t: f64) -> Pose { self.offset }
}

impl FixedFrame {
    pub fn new(name: &str, parent: Option<Arc<dyn Frame>>, offset: Pose) -> Self {
        Self { name: name.to_string(), parent, offset }
    }

    pub fn eci() -> Self {
        Self {
            name: "ECI".to_string(),
            parent: None,
            offset: Pose {
                position: Vector3::zeros(),
                rotation: UnitQuaternion::identity(),
            },
        }
    }

    pub fn sez(name: &str, ecef: Arc<dyn Frame>, lat: f64, lon: f64, alt: f64) -> Self {
        let r = EARTH_RADIUS + alt;
        let position = Vector3::new(
            r * lat.cos() * lon.cos(),
            r * lat.cos() * lon.sin(),
            r * lat.sin(),
        );
        Self {
            name: name.to_string(),
            parent: Some(ecef),
            offset: Pose { position, rotation: sez_rotation(lat, lon) },
        }
    }
}

// helper functions

pub fn frame_to_root(frame: &dyn Frame, v: Vector3<f64>, t: f64) -> (Vector3<f64>, UnitQuaternion<f64>) {
    let pose = frame.pose(t);

    // Essentially, we are taking the rotation of frame 2 with respect to frame 1,
    // and applying it to the vector v, which is in frame 2's coordinates.
    // So, frame 2 coords -> frame 1 coords:
    // This is done using v' = qvq^-1, where q is quaternion representing the rotation of frame 2 with respect to frame 1.
    let rotated = pose.rotation.transform_vector(&v);
    let translated = rotated + pose.position;

    match frame.parent() {
        Some(parent) => {
            let (parent_v, parent_q) = frame_to_root(parent, translated, t);
            // Accumulate rotations: parent_q takes us from parent to root, pose.rotation takes us from frame to parent
            let accumulated_q = parent_q * pose.rotation;
            (parent_v, accumulated_q)
        }
        None => (translated, pose.rotation),
    }
}

pub fn root_to_frame(frame: &dyn Frame, v: Vector3<f64>, t: f64) -> (Vector3<f64>, UnitQuaternion<f64>) {
    match frame.parent() {
        None => {
            // Root frame: apply its own inverse pose
            let pose = frame.pose(t);
            let translated = v - pose.position;
            let rotated = pose.rotation.inverse().transform_vector(&translated);
            (rotated, pose.rotation.inverse())
        }
        Some(parent) => {
            // First, recursively get v in the parent frame's coordinates
            let (in_parent_coords, parent_q) = root_to_frame(parent, v, t);
            // Then, transform from parent's coords to this frame's coords using the inverse of this frame's pose
            let pose = frame.pose(t);
            let translated = in_parent_coords - pose.position;
            let rotated = pose.rotation.inverse().transform_vector(&translated);
            // Accumulate inverse rotations
            let accumulated_q = pose.rotation.inverse() * parent_q;
            (rotated, accumulated_q)
        }
    }
}

// sez rotation helper
fn sez_rotation(lat: f64, lon: f64) -> UnitQuaternion<f64> {
    // Express SEZ basis vectors in ECEF, these become the rows of R
    let s = Vector3::new( lat.sin() * lon.cos(),  lat.sin() * lon.sin(), -lat.cos());
    let e = Vector3::new(-lon.sin(),               lon.cos(),              0.0      );
    let z = Vector3::new( lat.cos() * lon.cos(),  lat.cos() * lon.sin(),  lat.sin());

    let mat = Matrix3::from_columns(&[s, e, z]);
    UnitQuaternion::from_rotation_matrix(&Rotation3::from_matrix_unchecked(mat))
}