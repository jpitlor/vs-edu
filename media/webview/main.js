// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function() {
	const vscode = acquireVsCodeApi();
	const state = vscode.getState();
	const button = document.querySelector(".run-button-container button");

	button.className = state.testState || "";
	button.addEventListener("click", () => {
		vscode.postMessage({ command: "runTest" });
	});

	window.addEventListener("message", event => {
		document.write(JSON.stringify(message));
		const message = event.data;
		switch (message.command) {
			case "setTestState":
				button.className = message.value;
				vscode.setState({ testState: message.value });
				break;
		}
	});
})();
