import * as path from "path";
import * as vscode from "vscode";

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
