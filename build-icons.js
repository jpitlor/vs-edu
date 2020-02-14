const fs = require("fs");
const path = require("path");

function getFontAwesomeIcon(icon) {
	return fs.readFileSync(
		path.join(
			__dirname,
			"node_modules",
			"@fortawesome",
			"fontawesome-pro",
			"svgs",
			"regular",
			`${icon}.svg`
		),
		{ encoding: "utf-8" }
	);
}

function buildIcon(svg, lighten = false) {
	return `
		<svg
			xmlns="http://www.w3.org/2000/svg"
			${lighten ? `fill="white" fill-opacity="0.5"` : ""} 
			width="100" 
			height="100" 
			viewBox="-10 -10 120 120"
		>
			${svg.replace("<svg", `<svg width="100" height="100"`)}
		</svg>
	`;
}

fs.mkdirSync(path.join(__dirname, "media", "light"));
fs.mkdirSync(path.join(__dirname, "media", "dark"));

JSON.parse(
	fs.readFileSync(path.join(__dirname, "media", "icons.json"), {
		encoding: "utf-8"
	})
).forEach(icon => {
	const svg = getFontAwesomeIcon(icon);

	// The only exception to the sizing is graduation-cap - that needs
	// to be full size
	fs.writeFileSync(
		path.join(__dirname, "media", "light", `${icon}.svg`),
		icon === "graduation-cap" ? svg : buildIcon(svg)
	);
	fs.writeFileSync(
		path.join(__dirname, "media", "dark", `${icon}.svg`),
		icon === "graduation-cap" ? svg : buildIcon(svg, true)
	);
});
