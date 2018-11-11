import globals from 'rollup-plugin-node-globals';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import minify from 'rollup-plugin-babel-minify';
import json from 'rollup-plugin-json';
import tslint from 'rollup-plugin-tslint';
import { DEFAULT_EXTENSIONS } from '@babel/core';
import pkg from './package.json';

const plugins = [
	tslint({
		exclude:    ['**/*.json', 'node_modules/**'],
		throwError: process.env.ROLLUP_WATCH != 'true'
	}),
	json({
		preferConst: true
	}),
	commonjs(),
	typescript(),
	babel({
		extensions: [
			...DEFAULT_EXTENSIONS,
			'ts',
			'tsx'
		],
		runtimeHelpers: true
	}),
	resolve({
		preferBuiltins: false
	}),
	globals()
];
const dependencies = Object.keys(pkg.dependencies);

function external(id) {
	return dependencies.some(_ =>
		_ == id || id.indexOf(`${_}/`) == 0
	);
}

export default [{
	input:     'src/index.ts',
	plugins,
	external,
	output:    [{
		file:      pkg.main,
		format:    'cjs',
		exports:   'named',
		sourcemap: 'inline'
	}, {
		file:      pkg.module,
		format:    'es',
		sourcemap: 'inline'
	}]
}, {
	input:   'src/index.ts',
	plugins: [...plugins, minify()],
	output:  {
		file:      pkg.umd,
		format:    'umd',
		exports:   'named',
		name:      'i18n',
		sourcemap: 'inline'
	}
}, {
	input:  'src/middleware.ts',
	plugins,
	external,
	output: [{
		file:      'lib/middleware.ts',
		format:    'cjs',
		sourcemap: 'inline'
	}]
}];
