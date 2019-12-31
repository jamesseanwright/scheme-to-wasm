import * as fs from 'fs';
import * as path from 'path';
import cli from './cli';

const [targetDir] = cli(process.argv, ['targetDir']);

console.log(`👢  Bootstrapping app in ${targetDir}...`);

['html.js', 'index.js'].forEach(filename => {
  console.log(`${filename}  ➡  ${targetDir}`);
  fs.copyFileSync(
    path.resolve(__dirname, '..', 'runner', filename),
    path.resolve(targetDir, filename),
  );
});

// TODO: reference entry point env var
console.log(`✅  Boostrapped! You can run your app with:\nnode ${targetDir}`);
