import cli from './cli';
import compileFileToBinary from '../compiler';

const [sourcePath, targetDir] = cli(process.argv, ['sourcePath', 'targetDir']);

compileFileToBinary(sourcePath, targetDir);
