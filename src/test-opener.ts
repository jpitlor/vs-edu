import * as vscode from "vscode";
import * as marked from "marked";
import { Test, Env } from "./extension";
import { getEnv, testEquals, testFilePath, extensionFilePath, readExtensionFile, readWorkspaceFile } from "./util";

let _test: Test | undefined;
let textDocument: vscode.TextDocument | undefined;
let panel: vscode.WebviewPanel | undefined;
let disposables: vscode.Disposable[] = [];

export function testOpened(test: Test): boolean {
	return _test?.testNumber === test.testNumber && _test?.levelNumber === test.levelNumber;
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

	if (!test.testNumber || !test.testName) {
		// Levels aren't valid to open
		return;
	}

	_test = test;
	textDocument = await vscode.workspace.openTextDocument(testFilePath(test));

	await vscode.window.showTextDocument(textDocument, vscode.ViewColumn.One);
	panel = _panel || panel || vscode.window.createWebviewPanel(
		"eduTest",
		`${test.testName} Instructions`,
		vscode.ViewColumn.Two,
		{
			enableScripts: true,
			localResourceRoots: [
				extensionFilePath("media", "webview"),
				extensionFilePath("media", "dark")
			]
		}
	);

	const scriptUri = panel.webview.asWebviewUri(extensionFilePath("media", "webview", "main.js"));
	const stylesUri = panel.webview.asWebviewUri(extensionFilePath("media", "webview", "main.css"));
	const faTimes = await readExtensionFile("media", "dark", "times.svg");
	const faCheck = await readExtensionFile("media", "dark", "check.svg");

	const readme = await readWorkspaceFile(
		courseFolder,
		`${test.levelNumber} ${test.levelName}`,
		`${test.testNumber} ${test.testName}`,
		"README.md"
	);
	const contentSecurityPolicy = `
		default-src 'none'; 
		img-src ${panel.webview.cspSource} https:;
		script-src ${panel.webview.cspSource};
		style-src ${panel.webview.cspSource};
	`;
	
	panel.title = `${test.testName} Instructions`;
	panel.webview.html = /* html */ `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy}">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>${test.testName}</title>
				<link href="${stylesUri}" rel="stylesheet" type="text/css" />
			</head>
			<body>
				${marked(readme)}
				<div class="run-button-container">
					<button>
						Run ${test.testName}
						&nbsp;&nbsp;
						<svg class="fa-times">${faTimes.replace("fill=\"white\"", "fill=\"#ba000d\"")}</svg>
						<svg class="fa-check">${faCheck.replace("fill=\"white\"", "fill=\"#087f23\"")}</svg>
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
}
