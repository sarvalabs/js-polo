// Build the CommonJS and the ES module forms of the package.
// The ES module folder gets a package.json with "type": "module". Node then
// loads the .js files in that folder as ES modules.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const tsc = path.join(root, 'node_modules', 'typescript', 'bin', 'tsc');

fs.rmSync(path.join(root, 'dist'), { recursive: true, force: true });

for (const config of ['tsconfig.cjs.json', 'tsconfig.esm.json']) {
	execFileSync(process.execPath, [tsc, '-p', path.join(root, config)], { stdio: 'inherit' });
}

fs.writeFileSync(path.join(root, 'dist', 'cjs', 'package.json'), JSON.stringify({ type: 'commonjs' }) + '\n');
fs.writeFileSync(path.join(root, 'dist', 'esm', 'package.json'), JSON.stringify({ type: 'module' }) + '\n');
