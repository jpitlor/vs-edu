import * as path from "path";

export function icon(variant: string, icon: string): string {
	return path.join(
		__filename,
		"..",
		"..",
		"node_modules",
		"@fortawesome",
		"fontawesome-pro",
		"svgs",
		variant,
		icon + ".svg"
	);
}
