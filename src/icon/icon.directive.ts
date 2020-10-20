import { AfterViewInit, Directive, ElementRef, HostBinding, Input } from "@angular/core";
import { IconService } from "./icon.service";
import { getAttributes } from "@carbon/icon-helpers";

/**
 * A directive for applying styling to an input element.
 *
 * Example:
 *
 * ```html
 * <input ibmText/>
 * ```
 *
 * See the [vanilla carbon docs](http://www.carbondesignsystem.com/components/text-input/code) for more detail.
 */
@Directive({
	selector: "[ibmIcon]"
})
export class IconDirective implements AfterViewInit {
	static titleIdCounter = 0;

	@Input() ibmIcon = "";

	@Input() size = "16";

	@Input() title = "";

	@Input() ariaLabel = "";

	@Input() ariaLabelledBy = "";

	@Input() ariaHidden = "";

	@Input() isFocusable = false;

	constructor(
		protected elementRef: ElementRef,
		protected iconService: IconService
	) {}

	ngAfterViewInit() {
		const root = this.elementRef.nativeElement;

		const icon = this.iconService.get(this.ibmIcon, this.size.toString());

		const domParser = new DOMParser();
		const rawSVG = icon.svg;
		const svgElement = domParser.parseFromString(rawSVG, "image/svg+xml").documentElement;

		let node = root.tagName.toUpperCase() !== "SVG" ? svgElement : svgElement.firstChild;
		while (node) {
			// importNode makes a clone of the node
			// this ensures we keep looping over the nodes in the parsed document
			root.appendChild(root.ownerDocument.importNode(node, true));
			node = node.nextSibling;
		}

		const svg = root.tagName.toUpperCase() !== "SVG" ? svgElement : root;
		svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

		const attributes = getAttributes({
			width: icon.attrs.height,
			height: icon.attrs.height,
			viewBox: icon.attrs.viewBox,
			title: this.title,
			"aria-label": this.ariaLabel,
			"aria-labelledby": this.ariaLabelledBy,
			"aria-hidden": this.ariaHidden,
			focusable: this.isFocusable.toString()
		});

		const attrKeys = Object.keys(attributes);
		for (let i = 0; i < attrKeys.length; i++) {
			const key = attrKeys[i];
			const value = attributes[key];

			if (key === "title") {
				continue;
			}

			if (value) {
				svg.setAttribute(key, value);
			}
		}

		if (attributes["title"]) {
			const title = document.createElement("title");
			title.textContent = attributes.title;
			IconDirective.titleIdCounter++;
			title.setAttribute("id", `${icon.name}-title-${IconDirective.titleIdCounter}`);
			// title must be first for screen readers
			svg.insertBefore(title, svg.firstElementChild);
			svg.setAttribute("aria-labelledby", `${icon.name}-title-${IconDirective.titleIdCounter}`);
		}
	}
}
