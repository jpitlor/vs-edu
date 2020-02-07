import * as vscode from 'vscode';

import {TestDataProvider} from './tree-data-provider';

export function activate(context: vscode.ExtensionContext) {
	const testDataProvider = new TestDataProvider();
	vscode.window.registerTreeDataProvider("eduTests", testDataProvider);
	vscode.commands.registerCommand("vsEdu.refresh", () => testDataProvider.refresh());
}
