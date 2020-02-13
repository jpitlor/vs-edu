import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { Test } from "./extension";

export class TestDataProvider implements vscode.TreeDataProvider<Test> {
	private _onDidChangeTreeData: vscode.EventEmitter<Test | undefined> = new vscode.EventEmitter<Test | undefined>();
	readonly onDidChangeTreeData: vscode.Event<Test | undefined> = this._onDidChangeTreeData.event;

	public constructor(private readonly extensionPath: string) {}
	
	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	async getChildren(element?: Test): Promise<Test[]> {
		const courseFolder: string = vscode.workspace.getConfiguration('vsEdu').get('courses') || 'courses';
		const workspaceFolders = vscode.workspace.workspaceFolders;

		// If the user hasn't opened a folder, return nothing
		if (!workspaceFolders) {
			return [];
		}
	
		// If element is root, return the levels
		if (element === null || element === undefined) {
			return fs
				.readdirSync(path.join(workspaceFolders[0].uri.fsPath, courseFolder))
				.map(c => /(\d+) (.+)/.exec(c))
				.filter(<T>(x: T | null): x is T => x !== null)
				.map(([, levelNumber, levelName]) => ({levelName, levelNumber}));
		} 

		// If element is a test, return the files if there is more than 1.
		if (element.testName) {
			const files = await vscode.workspace.findFiles(
				`${courseFolder}/${element.levelNumber} ${element.levelName}/${element.testNumber} ${element.testName}`,
				'**/README.md'
			);
				
			return files.length > 2 
				? files.map(filePath => ({...element, filePath}))
				: [];
		}
		
		// If element is a level, return the tests
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
	
	async getTreeItem(element: Test): Promise<TestTreeItem> {
		const courseFolder: string = vscode.workspace.getConfiguration('vsEdu').get('courses') || 'courses';
		const isLeaf = (await this.getChildren(element)).length === 0;

		if (!element.filePath) {
			// If there's only 1 file, it still needs added to the element
			element.filePath = (await vscode.workspace.findFiles(
				`${courseFolder}/${element.levelNumber} ${element.levelName}/${element.testNumber} ${element.testName}`,
				'**/README.md'
			))[0];
		}

		const collapsibleState = isLeaf 
			? vscode.TreeItemCollapsibleState.None 
			: vscode.TreeItemCollapsibleState.Collapsed;
		const command = isLeaf
			? {
				command: "vsEdu.openTest",
				title: "",
				arguments: [element]
			}
			: undefined;
		return new TestTreeItem(element.testName || element.levelName, collapsibleState, element, this.extensionPath, command);
	}
	
	getParent(element: Test): Test | null {
		if (element.filePath) {
			return {
				levelName: element.levelName,
				levelNumber: element.levelNumber,
				testName: element.testName,
				testNumber: element.testNumber,
			};
		} else if (element.testNumber) {
			return {
				levelName: element.levelName,
				levelNumber: element.levelNumber,
			};
		} else {
			return null;
		}
	}
}

export class TestTreeItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		private readonly test: Test,
		private readonly extensionPath: string,
		public readonly command?: vscode.Command,
	) {
		super(label, collapsibleState);
	}

	contextValue = this.test.filePath ? 'file' : 'test';

	iconPath = {
		light: path.resolve(this.extensionPath, "media", "light", "question.svg"),
		dark: path.resolve(this.extensionPath, "media", "dark", "question.svg")
	};
}
