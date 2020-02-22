import * as vscode from "vscode";
import * as path from "path";
import * as marked from "marked";
import { Test, Env } from "./extension";
import { get, rootDirectory } from "./util";

let textDocument: vscode.TextDocument | undefined;
let panel: vscode.WebviewPanel | undefined;
let disposables: vscode.Disposable[] = [];

export function postMessage(message: object) {
	panel?.webview.postMessage(message);
}

export async function openTest(extensionPath: string, test: Test) {
	const courseFolder: string = get(Env.COURSE_DIRECTORY);

	if (textDocument && panel) {
		vscode.window.showTextDocument(textDocument, vscode.ViewColumn.One);
		panel.reveal(vscode.ViewColumn.Two);
		return;
	}

	const { testName, testNumber, levelName, levelNumber, filePath } = test;
	const newFile = path.join(
		rootDirectory().fsPath,
		courseFolder,
		`${levelNumber} ${levelName}`,
		`${testNumber} ${testName}`,
		"index.js"
	);
	textDocument = await vscode.workspace.openTextDocument(
		filePath || vscode.Uri.parse(`file:${newFile.replace(/\/$/, "")}`)
	);

	await vscode.window.showTextDocument(textDocument, vscode.ViewColumn.One);
	panel = vscode.window.createWebviewPanel(
		"eduTest",
		testName || levelName,
		vscode.ViewColumn.Two,
		{
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.file(path.join(extensionPath, "media", "webview"))
			]
		}
	);

	const scriptUri = panel.webview.asWebviewUri(
		vscode.Uri.file(
			path.join(extensionPath, "media", "webview", "main.js")
		)
	);
	const stylesUri = panel.webview.asWebviewUri(
		vscode.Uri.file(
			path.join(extensionPath, "media", "webview", "main.css")
		)
	);
	const readme = marked(
		(
			await vscode.workspace.fs.readFile(
				vscode.Uri.parse(
					"file:" +
						path.join(
							rootDirectory().fsPath,
							courseFolder,
							`${levelNumber} ${levelName}`,
							`${testNumber} ${testName}`,
							"README.md"
						)
				)
			)
		).toString()
	);
	const contentSecurityPolicy = `
		default-src 'none'; 
		img-src ${panel.webview.cspSource} https:;
		script-src ${panel.webview.cspSource};
		style-src ${panel.webview.cspSource};
	`;
	
	panel.title = test.testName || test.levelName;
	panel.webview.html = /* html */ `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
				Use a content security policy to only allow loading images from https or from our extension directory,
				and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy}">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>${test.testName || test.levelName}</title>
				<link href="${stylesUri}" rel="stylesheet" type="text/css" />
			</head>
			<body>
				${readme}
				<div class="run-button-container">
					<button>
						Run ${test.testName || test.levelName}
						&nbsp;&nbsp;
						<div class="spinner">
							<div class="bounce1"></div>
							<div class="bounce2"></div>
							<div class="bounce3"></div>
						</div>
					</button>
				</div>
				<script src="${scriptUri}"></script>
			</body>
		</html>
	`;

	panel.onDidDispose(() => dispose(), null, disposables);
	panel.webview.onDidReceiveMessage(
		() => vscode.commands.executeCommand("vsEdu.runTest", test),
		null,
		disposables
	);
}

function dispose() {
	panel?.dispose();
	while (disposables.length) {
		const x = disposables.pop();
		if (x) {
			x.dispose();
		}
	}

	panel = undefined;
	textDocument = undefined;
}
