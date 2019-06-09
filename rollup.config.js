import {
	external
} from '@trigen/scripts-plugin-rollup/helpers';
import tslint from 'rollup-plugin-tslint';
import json from 'rollup-plugin-json';
import commonjs from 'rollup-plugin-commonjs';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import typescript from 'rollup-plugin-typescript2';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import minify from 'rollup-plugin-babel-minify';
import { DEFAULT_EXTENSIONS } from '@babel/core';
import pkg from './package.json';

function getPlugins(standalone) {
	return [
		tslint({
			exclude:    ['**/*.json', 'node_modules/**'],
			throwError: true
		}),
		json({
			preferConst: true
		}),
		commonjs(),
		standalone && globals(),
		standalone && builtins(),
		typescript(),
		babel({
			extensions: [
				...DEFAULT_EXTENSIONS,
				'ts',
				'tsx'
			],
			runtimeHelpers: true
		}),
		standalone && resolve({
			preferBuiltins: false
		}),
		standalone && minify()
	].filter(Boolean);
}

export default [{
	input:     'src/index.ts',
	plugins:   getPlugins(),
	external:  external(pkg, true),
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
	plugins: getPlugins(true),
	output:  {
		file:      pkg.umd,
		format:    'umd',
		exports:   'named',
		name:      'i18n',
		sourcemap: 'inline'
	}
}, {
	input:    'src/middleware.ts',
	plugins:  getPlugins(),
	external: external(pkg, true),
	output:   [{
		file:      'lib/middleware.js',
		format:    'cjs',
		sourcemap: 'inline'
	}]
}];
