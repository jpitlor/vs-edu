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
	
	getTreeItem(element: Test): TestTreeItem {
		const isLeaf = this.getChildren(element).length === 0;

		const collapsibleState = isLeaf 
			? vscode.TreeItemCollapsibleState.None 
			: vscode.TreeItemCollapsibleState.Collapsed;
		const command = isLeaf
			? {
				command: "vsEdu.openTest",
				title: "",
				arguments: [element.levelNumber, element.testNumber]
			}
			: undefined;
		return new TestTreeItem(element.testName || element.levelName, collapsibleState, command);
	}
	
	getParent(element: Test): Test {
		return {
			levelName: element.levelName,
			levelNumber: element.levelNumber,
		};
	}
}

export class TestTreeItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
	}

	get tooltip(): string {
		return this.label;
	}

	get description(): string {
		return this.label;
	}

	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', 'edit.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'edit.svg')
	};
}
