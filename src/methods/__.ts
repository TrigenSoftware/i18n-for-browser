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

/**
 * Translates a single phrase and adds it to locales if unknown.
 * @param phraseOrParams - Phrase to translate or params.
 * @param values - Values to print.
 * @returns Translated parsed and substituted string.
 */
export function __(phraseOrParams: string | TemplateStringsArray | I18nParams, ...values) {
	const config = getConfigFromContext(this);
	// get translated message with locale
	let [translated] = getTranslateFromConfig(config, phraseOrParams);
	let namedValues;

	// postprocess to get compatible to plurals
	if (typeof translated === 'object') {
		translated = getSingularFromPlurals(translated);
	}

	// Accept an object with named values as the last parameter
	if (typeof values[values.length - 1] === 'object') {
		namedValues = values.pop();
	}

	return postProcess(config, translated, namedValues, values);
}
