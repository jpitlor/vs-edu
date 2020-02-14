import * as vscode from "vscode";
import * as _ from "lodash";
import { get } from "./util";
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

let _repo: Repo = { levels: [], tests: {}, files: {} };

export async function refresh() {
	const repo: Repo = { levels: [], tests: {}, files: {} };
	const courseDirectory = get(Env.COURSE_DIRECTORY);
	const files = (await vscode
		.workspace
		.findFiles(`${courseDirectory}/**/*`))
		.map(fileToTest);

	repo.files = _.groupBy(files, f => `${f.levelNumber}-${f.testNumber}`);
	repo.tests = _.groupBy(
		_.uniqBy(files, "testNumber").map(t => ({ ...t, filePath: undefined })),
		"levelNumber"
	);
	repo.levels = _.uniqBy(
		files.map(f => ({ levelName: f.levelName, levelNumber: f.levelNumber })),
		"levelNumber"
	);

	_repo = repo;
}

export function getLevels(): Test[] {
	return _repo.levels;
}

export function getTests(levelNumber: string): Test[] {
	return _repo.tests[levelNumber];
}

export function getReadme(test: Test): Test | undefined {
	return _repo.files[`${test.levelNumber}-${test.testNumber}`]
		.find(t => t.filePath?.path.includes("README.md"));
}

export function getFiles(levelNumber: string, testNumber?: string): Test[] {
	return testNumber ? _repo.files[`${levelNumber}-${testNumber}`] : [];
}