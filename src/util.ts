import * as path from "path";
import * as vscode from "vscode";
import { Test, Env } from "./extension";

let extensionPath: string;
export function InitUtils(context: vscode.ExtensionContext) {
	extensionPath = context.extensionPath;
}

export function getExtensionPath(): string {
	return extensionPath;
}

export function rootDirectory(): vscode.Uri {
	const rootDir = vscode.workspace.workspaceFolders?.[0].uri;
	
	if (!rootDir) {
		const error = "VS Edu doesn't work if you don't have a folder open";
		vscode.window.showErrorMessage(error);
		throw new Error(error);
	}

	return rootDir;
}

export function getEnv(key: string): string {
	const envVar = vscode.workspace.getConfiguration("vsEdu").get<string>(key);

	if (!envVar) {
		const error = "There's a mistake in the code. You tried to access an environment variable that doesn't exist!";
		vscode.window.showErrorMessage(error);
		throw new Error(error);
	}

	return envVar;
}

export function readDirectory(dir: string): Thenable<[string, vscode.FileType][]> {
	return vscode.workspace.fs.readDirectory(
		vscode.Uri.parse(path.join(rootDirectory().fsPath, dir))
	);
}

export async function readWorkspaceFile(...file: string[]): Promise<string> {
	const f = await vscode.workspace.fs.readFile(
		vscode.Uri.file(
			path.join(rootDirectory().fsPath, ...file)
		)
	);

	return f.toString();
}

export async function readExtensionFile(...file: string[]): Promise<string> {
	const f = await vscode.workspace.fs.readFile(
		vscode.Uri.file(
			path.join(extensionPath, ...file)
		)
	);

	return f.toString();
}

export function testFilePath(test: Test): vscode.Uri {
	const courseFolder: string = getEnv(Env.COURSE_DIRECTORY);
	return vscode.Uri.file(
		path.join(
			rootDirectory().fsPath,
			courseFolder,
			`${test.levelNumber} ${test.levelName}`,
			`${test.testNumber} ${test.testName}`,
			test.filePath || "index.js"
		)
	);
}

export function extensionFilePath(...folders: string[]): vscode.Uri {
	return vscode.Uri.file(path.join(extensionPath, ...folders));
}

export function testEquals(t1: Test, t2?: Test): boolean {
	return t2 !== undefined && t1.levelNumber === t2.levelNumber && t1.testNumber === t2.testNumber;
}
