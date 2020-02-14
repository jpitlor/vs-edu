import * as vscode from "vscode";
import * as path from "path";
import { Test } from "./extension";
import { TestRepository } from "./test-repository";

export class TreeViewDataProvider implements vscode.TreeDataProvider<Test> {
	private _onDidChangeTreeData: vscode.EventEmitter<Test | undefined> = new vscode.EventEmitter<Test | undefined>();
	readonly onDidChangeTreeData: vscode.Event<Test | undefined> = this._onDidChangeTreeData.event;

	public constructor(private readonly extensionPath: string) {}

	refresh(): void {
		TestRepository.refresh().then(() => this._onDidChangeTreeData.fire());
	}

	async getChildren(element?: Test): Promise<Test[]> {
		// If element is root, return the levels
		if (element === null || element === undefined) {
			return TestRepository.getLevels();
		}

		// All files are leaves
		if (element.filePath) {
			return [];
		}

		// If element is a test, return the files
		if (element.testNumber) {
			return TestRepository.getFiles(element.levelNumber, element.testNumber);
		}

		// If element is a level, return the tests
		return TestRepository.getTests(element.levelNumber);
	}

	async getTreeItem(element: Test): Promise<TestTreeItem> {
		return new TestTreeItem(element, this.extensionPath);
	}

	getParent(element: Test): Test | null {
		if (element.filePath) {
			return {
				levelName: element.levelName,
				levelNumber: element.levelNumber,
				testName: element.testName,
				testNumber: element.testNumber
			};
		} else if (element.testNumber) {
			return {
				levelName: element.levelName,
				levelNumber: element.levelNumber
			};
		} else {
			return null;
		}
	}
}

class TestTreeItem extends vscode.TreeItem {
	constructor(
		private readonly test: Test,
		private readonly extensionPath: string,
	) {
		super(test.testName || test.levelName);
	}

	private readonly isLeaf = this.test.filePath
		|| TestRepository.getFiles(this.test.levelNumber, this.test.testNumber).length === 2;

	collapsibleState = this.isLeaf
		? vscode.TreeItemCollapsibleState.None
		: vscode.TreeItemCollapsibleState.Collapsed;

	command = this.isLeaf
		? { command: "vsEdu.openTest", title: "Open Test", arguments: [this.test] }
		: undefined;

	contextValue = this.test.filePath?.path.includes("README.md") ? "test" : "file";

	iconPath = {
		light: path.resolve(this.extensionPath, "media", "light", "question.svg"),
		dark: path.resolve(this.extensionPath, "media", "dark", "question.svg")
	};
}
