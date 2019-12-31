import cli from './cli';
import compileFileToBinary from '../compiler';

const [firstArg, targetDir] = cli(process.argv, ['sourcePath', 'targetDir']);

compileFileToBinary(firstArg, targetDir);
