import * as vscode from 'vscode';

import {treeDataProvider} from './tree-data-provider';

export function activate(context: vscode.ExtensionContext) {
	vscode.window.registerTreeDataProvider("eduTests", treeDataProvider);
}
