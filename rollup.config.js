import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import minify from 'rollup-plugin-babel-minify';
import eslint from 'rollup-plugin-eslint';
import pkg from './package.json';

const plugins = [
	eslint({
		exclude:      'node_modules/**',
		throwOnError: process.env.ROLLUP_WATCH != 'true'
	}),
	resolve({
		preferBuiltins: false
	}),
	commonjs(),
	json({
		preferConst: true
	}),
	babel(Object.assign({
		babelrc: false,
		exclude: 'node_modules/**'
	}, pkg.babel, {
		presets: pkg.babel.presets.map(_ => (
			_ == 'es2015'
				? 'es2015-rollup'
				: _
		))
	}))
];

const dependencies = Object.keys(pkg.dependencies);

function external(id) {
	return dependencies.some(_ =>
		_ == id || id.indexOf(`${_}/`) == 0
	);
}

export default [{
	input:  'src/index.js',
	plugins,
	external,
	output: [{
		file:      pkg.main,
		format:    'cjs',
		sourcemap: true
	}, {
		file:      pkg.module,
		format:    'es',
		sourcemap: true
	}]
}, {
	input:   'src/index.js',
	plugins: [...plugins, minify()],
	output:  {
		file:      pkg.browser,
		format:    'umd',
		name:      'i18n',
		sourcemap: true
	}
}, {
	input:  'src/middleware.js',
	plugins,
	external,
	output: [{
		file:      'lib/middleware.js',
		format:    'cjs',
		sourcemap: true
	}]
}];
