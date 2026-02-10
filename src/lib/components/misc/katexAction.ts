
import katex from 'katex';
import 'katex/dist/katex.min.css'; // Don't forget the CSS!

interface LatexActionParams {
	data: string;
	options?: katex.KatexOptions;
}

export function latex(node: HTMLElement, { data, options }: LatexActionParams) {
	// Helper function to render
	const render = (tex: string, opts?: katex.KatexOptions) => {
		try {
			katex.render(tex, node, opts);
		} catch (e) {
			// Handle errors gracefully (e.g., show raw TeX)
			node.textContent = tex; 
		}
	};

	// Initial render
	render(data, options);

	return {
		// Update when arguments change
		update({ data: newData, options: newOptions }: LatexActionParams) {
			render(newData, newOptions);
		}
	};
}