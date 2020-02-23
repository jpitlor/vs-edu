import * as path from "path";
import * as vscode from "vscode";

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
	return vscode.workspace.fs.readDirectory(vscode.Uri.parse(path.join(rootDirectory().fsPath, dir)));
}
