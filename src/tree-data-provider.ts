import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

interface Test {
	levelName: string;
	levelNumber: string;
	testName?: string;
	testNumber?: string;
}

export class TestDataProvider implements vscode.TreeDataProvider<Test> {
	private _onDidChangeTreeData: vscode.EventEmitter<Test | undefined> = new vscode.EventEmitter<Test | undefined>();
	readonly onDidChangeTreeData: vscode.Event<Test | undefined> = this._onDidChangeTreeData.event;
	
	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getChildren(element?: Test): Test[] {
		// TODO: Make paths configurable in options
		const courseFolder = 'courses';
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders) {
			return [];
		}
	
		if (element === null || element === undefined) {
			return fs
				.readdirSync(path.join(workspaceFolders[0].uri.fsPath, courseFolder))
				.map(c => /(\d+) (.+)/.exec(c))
				.filter(<T>(x: T | null): x is T => x !== null)
				.map(([, levelNumber, levelName]) => ({levelName, levelNumber}));
		} else {
			if (element.testName) {
				return [];
			}
			
			return fs
				.readdirSync(path.join(workspaceFolders[0].uri.fsPath, courseFolder, `${element.levelNumber} ${element.levelName}`))
				.map(c => /(\d+) (.+)/.exec(c))
				.filter(<T>(x: T | null): x is T => x !== null)
				.map(([, testNumber, testName]) => ({
					levelName: element.levelName,
					levelNumber: element.levelNumber, 
					testName, 
					testNumber,
				}));
		}
	}
	
	getTreeItem(element: Test): vscode.TreeItem {
		const collapsibleState = this.getChildren(element).length > 0 
			? vscode.TreeItemCollapsibleState.Collapsed 
			: vscode.TreeItemCollapsibleState.None;
		return new vscode.TreeItem(element.testName || element.levelName, collapsibleState);
	}
	
	getParent(element: Test): Test {
		return {
			levelName: element.levelName,
			levelNumber: element.levelNumber,
		};
	}
}