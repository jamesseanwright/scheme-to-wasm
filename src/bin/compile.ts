import * as assert from 'assert';
import compileFileToBinary from '../compiler';

const HELP_FLAG = '--help';

const printUsageMessage = () => {
  console.log('Usage: node compile.js [source] [out-dir]');
};

const validateArg = (argName: string, value: string) => {
  assert.ok(value, `Missing argument: ${argName}`);
};

// TODO: provide default target dir
const [, , firstArg, targetDir] = process.argv;

if (firstArg === HELP_FLAG) {
  printUsageMessage();
  process.exit(0);
}

try {
  validateArg('sourcePath', firstArg);
  validateArg('targetDir', targetDir);
} catch (e) {
  console.error(e);
  printUsageMessage();
  process.exit(1);
}

compileFileToBinary(firstArg, targetDir);
