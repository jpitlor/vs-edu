import * as path from "path";
import * as vscode from "vscode";
import { Test, Env } from "./extension";

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

export function rootDirectory(): vscode.Uri {
	const rootDir = vscode.workspace.workspaceFolders?.[0].uri;
	
	if (!rootDir) {
		vscode.window.showErrorMessage("VS Edu doesn't work if you don't have a folder open");
		throw new Error("VS Edu doesn't work if you don't have a folder open");
	}

	return rootDir;
}

export function get(key: string): string {
	return vscode.workspace.getConfiguration('vsEdu').get(key) || "";
}

export function readDirectory(dir: string): Thenable<[string, vscode.FileType][]> {
	return vscode.workspace.fs.readDirectory(vscode.Uri.parse(path.join(rootDirectory().fsPath, dir)));
}

export async function getLevels(): Promise<Test[]> {
	return (await readDirectory(get(Env.TEST_DIRECTORY)))
		.map(([l]) => /^(\d+) (.*)$/.exec(l))
		.filter(<T>(x: T | null): x is T => x !== undefined)
		.map(([, levelNumber, levelName]) => ({levelName, levelNumber}));
}

export async function getTestsInLevel(levelNumber: string): Promise<Test[]> {
	const levels = await readDirectory(get(Env.TEST_DIRECTORY));
	const levelName = levels
		.map(([l]) => new RegExp(`^${levelNumber} `).exec(l))
		.filter(<T>(x: T | null): x is T => x !== undefined)
		.map(([, name]) => name)[0];

	return (await readDirectory(path.join(get(Env.TEST_DIRECTORY), `${levelNumber} ${levelName}`))).map(([test]) => {
		const [, testNumber, testName] = /^(\d+) (.*)$/.exec(test) || [];
		return {levelNumber, levelName, testNumber, testName};
	});
}