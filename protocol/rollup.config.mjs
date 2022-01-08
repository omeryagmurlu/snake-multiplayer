// rollup.config.js
import { globbySync as globby } from 'globby';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import nodePolyfills from 'rollup-plugin-polyfill-node';

import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json'))

export default [
    // browser-friendly builds
    {
        input: 'src/index.ts',
        output: [{
            name: 'snake-multiplayer-protocol',
            file: pkg.browser['dist/index.js'], // from package.json
            format: 'umd'
        },
        {
            file: pkg.browser['dist/index.esm.js'], // from package.json
            format: 'es'
        }],
        plugins: [
            typescript({ tsconfig: './tsconfig.json' }),
            nodePolyfills(),
            nodeResolve(),
            commonjs(), // so Rollup can convert to ES module
        ]
    },

    // CommonJS (for Node) and ES module (for bundlers) build.
    // (We could have three entries in the configuration array
    // instead of two, but it's quicker to generate multiple
    // builds from a single configuration where possible, using
    // an array for the `output` option, where we can specify 
    // `file` and `format` for each target)
    {
        input: 'src/index.ts',
        output: [
            { file: pkg.main, format: 'cjs' }, // from package.json
            { file: pkg.module, format: 'es' } // from package.json
        ],
        plugins: [
            typescript({ tsconfig: './tsconfig.json' }),
            nodeResolve(),
            commonjs(), // so Rollup can convert to ES module
        ]
    },

    ...globby(['src/interfaces/*.ts', 'src/classes/*.ts']).map(path => ({
        input: path,
        output: [
            { file: path.replace('src', 'dist').replace('.ts', '.js'), format: 'cjs' },
            { file: path.replace('src', 'dist').replace('.ts', '.esm.js'), format: 'es' }
        ],
        plugins: [
            typescript(),
            nodeResolve(),
            commonjs(), // so Rollup can convert to ES module
        ]
    }))
];