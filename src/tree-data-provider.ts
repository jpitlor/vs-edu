import * as vscode from "vscode";
import * as fs from "fs";

function getChildren(element: string): vscode.ProviderResult<string[]> {

}

function getTreeItem(element: string): vscode.TreeItem {
	const workspaces = vscode.workspace.workspaceFolders?.map(f => f.uri.path);
}

function getParent(element: string): vscode.ProviderResult<string> {

}


export const treeDataProvider: vscode.TreeDataProvider<string> = {
	getChildren,
	getTreeItem,
	getParent,
};
