import * as vscode from "vscode";
import * as marked from "marked";
import { Test, Env } from "./extension";
import { getEnv, testEquals, testFilePath, extensionFilePath, readExtensionFile, readWorkspaceFile } from "./util";

let _test: Test | undefined;
let textDocument: vscode.TextDocument | undefined;
let panel: vscode.WebviewPanel | undefined;
let disposables: vscode.Disposable[] = [];

export function testOpened(test: Test): boolean {
	return _test?.number === test.number && _test?.level.number === test.level.number;
}

export function postMessage(message: object) {
	panel?.webview.postMessage(message);
}

export async function openTest(test: Test, _panel?: vscode.WebviewPanel) {
	const courseFolder: string = getEnv(Env.COURSE_DIRECTORY);

	if (!_panel && textDocument && panel && testEquals(test, _test)) {
		vscode.window.showTextDocument(textDocument, vscode.ViewColumn.One);
		panel.reveal(vscode.ViewColumn.Two);
		return;
	}

	_test = test;
	textDocument = await vscode.workspace.openTextDocument(testFilePath(test, "index.js"));

	await vscode.window.showTextDocument(textDocument, vscode.ViewColumn.One);
	panel = _panel || panel || vscode.window.createWebviewPanel(
		"eduTest",
		`${test.name} Instructions`,
		vscode.ViewColumn.Two,
		{
			enableScripts: true,
			localResourceRoots: [extensionFilePath("media")]
		}
	);

	const scriptUri = panel.webview.asWebviewUri(extensionFilePath("media", "main.js"));
	const stylesUri = panel.webview.asWebviewUri(extensionFilePath("media", "main.css"));

	// Icons from FA Free
	const faTimes = await readExtensionFile("media", "times-solid.svg");
	const faCheck = await readExtensionFile("media", "check-solid.svg");

	const readme = await readWorkspaceFile(
		courseFolder,
		`${test.level.number} ${test.level.name}`,
		`${test.number} ${test.name}`,
		"README.md"
	);
	const contentSecurityPolicy = `
		default-src 'none'; 
		img-src ${panel.webview.cspSource} https:;
		script-src ${panel.webview.cspSource};
		style-src ${panel.webview.cspSource};
	`;
	
	panel.title = `${test.name} Instructions`;
	panel.webview.html = /* html */ `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy}">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>${test.name}</title>
				<link href="${stylesUri}" rel="stylesheet" type="text/css" />
			</head>
			<body>
				${marked(readme)}
				<div class="run-button-container">
					<button>
						Run ${test.name}
						&nbsp;&nbsp;
						<svg class="fa-times">${faTimes}</svg>
						<svg class="fa-check">${faCheck}</svg>
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

	postMessage({command: "setTest", value: test});
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
	_test = undefined;
}
