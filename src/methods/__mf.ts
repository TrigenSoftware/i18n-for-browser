import MessageFormat from 'messageformat';
import {
	I18nParams
} from '../types';
import {
	getSingularFromPlurals,
	postProcess
} from '../core';
import {
	getConfigFromContext,
	getTranslateFromConfig
} from './common';

const messageFormatInstanceForLocale: Record<string, MessageFormat> = {};

/**
 * Supports the advanced MessageFormat as provided by excellent messageformat module.
 * You should definetly head over to messageformat.github.io for a guide to MessageFormat.
 * `i18n-for-browser` takes care of `new MessageFormat('en').compile(msg);`
 * with the current msg loaded from it's json files and cache that complied fn in memory.
 * So in short you might use it similar to `__()` plus extra object to accomblish MessageFormat's formating.
 * @param phraseOrParams - Phrase to translate or params.
 * @param values - Values to print.
 * @returns Translate.
 */
export function __mf(phraseOrParams: string | TemplateStringsArray | I18nParams, ...values) {
	const config = getConfigFromContext(this);
	// get translated message with locale
	let [
		translated,
		locale
	] = getTranslateFromConfig(config, phraseOrParams);
	let namedValues;
	let mf;
	let f;

	// postprocess to get compatible to plurals
	if (typeof translated === 'object') {
		translated = getSingularFromPlurals(translated);
	}

	// now head over to MessageFormat
	// and try to cache instance
	if (messageFormatInstanceForLocale[locale]) {
		mf = messageFormatInstanceForLocale[locale];
	} else {
		mf = new MessageFormat(locale);
		mf.compiledFunctions = {};
		messageFormatInstanceForLocale[locale] = mf;
	}

	const cacheKey = String(translated);

	// let's try to cache that function
	if (mf.compiledFunctions[cacheKey]) {
		f = mf.compiledFunctions[cacheKey];
	} else {
		f = mf.compile(translated);
		mf.compiledFunctions[cacheKey] = f;
	}

	// Accept an object with named values as the last parameter
	if (typeof values[values.length - 1] === 'object') {
		namedValues = values.pop();
	}

	return postProcess(config, f(namedValues), namedValues, values);
}
