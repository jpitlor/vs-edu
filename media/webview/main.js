// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    const vscode = acquireVsCodeApi();
	document.querySelector('.run-button-container button').addEventListener('click', () => {
		vscode.postMessage({command: 'runTest'});
	});
}());