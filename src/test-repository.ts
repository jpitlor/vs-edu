import * as vscode from "vscode";
import * as path from "path";
import * as _ from "lodash";
import { get, readDirectory } from "./util";
import { Env, Test } from "./extension";

interface Level {
	[levelNumber: string]: Test[];
}

interface TestFiles {
	[levelDashTestNumber: string]: Test[];
}

interface Repo {
	levels: Test[];
	tests: Level;
	files: TestFiles;
}

function fileToTest(filePath: vscode.Uri): Test {
	const [, levelNumber, levelName, testNumber, testName] =
		/(\d+) ([^/]+)\/(\d+) ([^/]+)/.exec(filePath.path) || [];
	return { levelName, levelNumber, testName, testNumber, filePath };
}

export class TestRepository {
	private static _repo: Repo = { levels: [], tests: {}, files: {} };

	static async refresh() {
		const repo: Repo = { levels: [], tests: {}, files: {} };
		const courseDirectory = get(Env.COURSE_DIRECTORY);
		const files = (
			await vscode.workspace.findFiles(`${courseDirectory}/**/*`)
		).map(fileToTest);

		repo.files = _.groupBy(files, f => `${f.levelNumber}-${f.testNumber}`);
		repo.tests = _.groupBy(
			_.uniqBy(files, "testNumber").map(t => ({ ...t, filePath: undefined })),
			"levelNumber"
		);
		repo.levels = _.uniqBy(
			files.map(f => ({ levelName: f.levelName, levelNumber: f.levelNumber })),
			"levelNumber"
		);

		this._repo = repo;
	}

	static getLevels(): Test[] {
		return this._repo.levels;
	}

	static getTests(levelNumber: string): Test[] {
		return this._repo.tests[levelNumber];
	}

	static getReadme(test: Test): Test | undefined {
		return this._repo.files[`${test.levelNumber}-${test.testNumber}`].find(t =>
			t.filePath?.path.includes("README.md")
		);
	}

	static getFiles(levelNumber: string, testNumber?: string): Test[] {
		return testNumber ? this._repo.files[`${levelNumber}-${testNumber}`] : [];
	}
}
