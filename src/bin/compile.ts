import * as assert from 'assert';
import compileFileToBinary from '../compiler';

const HELP_FLAG = '--help';

const printUsageMessage = () => {
  console.log('Usage: node compile.js [source] [out-dir]');
};

const validateArg = (argName: string, value: string) => {
  assert.ok(value, `Missing argument: ${argName}`);
  printUsageMessage();
  process.exit(1);
};

const [, , firstArg, targetDir] = process.argv;

if (firstArg === HELP_FLAG) {
  printUsageMessage();
  process.exit(0);
}

validateArg('sourcePath', firstArg);
validateArg('targetDir', targetDir);

compileFileToBinary(firstArg, targetDir);
