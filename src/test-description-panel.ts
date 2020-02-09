import * as vscode from "vscode";
import * as path from "path";
import { Test } from "./extension";

export class TestDescriptionPanel {
	public static readonly viewType = "eduTest";
	public static currentPanel: TestDescriptionPanel | undefined;

	private readonly _textDocument: vscode.TextDocument;
	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionPath: string;
	private _disposables: vscode.Disposable[] = [];

	constructor(
		panel: vscode.WebviewPanel,
		textDocument: vscode.TextDocument,
		extensionPath: string,
		test: Test
	) {
		this._panel = panel;
		this._textDocument = textDocument;
		this._extensionPath = extensionPath;

		this._update(test);
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
		this._panel.onDidChangeViewState(
			() => (this._panel.visible ? this._update(test) : undefined),
			null,
			this._disposables
		);
		this._panel.webview.onDidReceiveMessage(
			() => vscode.commands.executeCommand("vsEdu.runTest", test),
			null,
			this._disposables
		);
	}

	public static async createOrShow(extensionPath: string, test: Test) {
		const courseFolder: string = vscode.workspace.getConfiguration("vsEdu").get("courses") || "courses";
		const workspaces = vscode.workspace.workspaceFolders;

		if (TestDescriptionPanel.currentPanel) {
			vscode.window.showTextDocument(
				TestDescriptionPanel.currentPanel._textDocument,
				vscode.ViewColumn.Active
			);
			TestDescriptionPanel.currentPanel._panel.reveal(vscode.ViewColumn.Beside);
			return;
		}

		if (!workspaces) {
			return;
		}

		const { testName, testNumber, levelName, levelNumber, filePath } = test;
		const newFile = path.join(workspaces[0].uri.fsPath, courseFolder, `${levelNumber} ${levelName}`, `${testNumber} ${testName}`, 'index.js');
		const textDocument = await vscode.workspace.openTextDocument(
			filePath || vscode.Uri.parse(`file:${newFile.replace(/\/$/, '')}`)
		);

		await vscode.window.showTextDocument(textDocument, vscode.ViewColumn.Active);
		const panel = vscode.window.createWebviewPanel(
			TestDescriptionPanel.viewType,
			testName || levelName,
			vscode.ViewColumn.Beside,
			{
				enableScripts: true,
				localResourceRoots: vscode.workspace.workspaceFolders?.map(f => f.uri)
			}
		);

		TestDescriptionPanel.currentPanel = new TestDescriptionPanel(
			panel,
			textDocument,
			extensionPath,
			test
		);
	}

	public dispose() {
		TestDescriptionPanel.currentPanel = undefined;

		this._panel.dispose();
		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _update(test: Test) {
		const webview = this._panel.webview;
		this._panel.title = test.testName || test.levelName;

		const scriptPathOnDisk = vscode.Uri.file(
			path.join(this._extensionPath, "media", "main.js")
		);
		const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
		const nonce = getNonce();
		this._panel.webview.html = `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">

                    <!--
                    Use a content security policy to only allow loading images from https or from our extension directory,
                    and only allow scripts that have a specific nonce.
                    -->
                    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">

                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Cat Coding</title>
                </head>
                <body>
                    <h1>Hello, world!</h1>
                    <script nonce="${nonce}" src="${scriptUri}"></script>
                </body>
            </html>
        `;
	}
}

function getNonce() {
	let text = "";
	const possible =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
