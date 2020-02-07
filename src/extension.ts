import * as vscode from 'vscode';

import {treeDataProvider} from './tree-data-provider';

export function activate(context: vscode.ExtensionContext) {
	vscode.window.createTreeView("vs-edu", {treeDataProvider, showCollapseAll: true});
}

// this method is called when your extension is deactivated
export function deactivate() {}
