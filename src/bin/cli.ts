import * as assert from 'assert';

const HELP_FLAG = '--help';

const printUsageMessage = (scriptName: string, argNames: string[]) => {
  console.log(`Usage: node ${scriptName} ${argNames.map(a => `[${a}]`).join(' ')}`);
};

const validateArg = (argName: string, value: string) => {
  assert.ok(value, `Missing argument: ${argName}`);
};

const cli = (
  argv: string[],
  argNames: string[],
) => {
  const [, scriptName, ...args] = process.argv;

  if (args[0] === HELP_FLAG) {
    printUsageMessage(scriptName, argNames);
    process.exit(0);
  }

  try {
    argNames.forEach((argName, i) => {
      validateArg(argName, args[i]);
    });

    return args;
  } catch (e) {
    console.error(e);
    printUsageMessage(scriptName, argNames);
    process.exit(1);
  }
};

export default cli;
