import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import pkg from './package.json';

export default {
	input:    'src/index.js',
	plugins:  [
		resolve(),
		commonjs(),
		json({
			preferConst: true
		}),
		babel(Object.assign({
			babelrc: false,
			exclude: 'node_modules/**'
		}, pkg.babel, {
			presets: Object.assign(pkg.babel.presets, [
				["es2015", {
					modules: false
				}]
			])
		}))
	],
	external: Object.keys(pkg.dependencies),
	output:   [{
		file:      pkg.main,
		format:    'cjs',
		sourcemap: true
	}, {
		file:      pkg.module,
		format:    'es',
		sourcemap: true
	}]
};
