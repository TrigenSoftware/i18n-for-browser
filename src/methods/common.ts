import {
	I18nParams,
	I18nLocale
} from '../types';
import Config from '../config';
import {
	isStringsArray,
	preProcess,
	translate
} from '../core';

export const globalConfig = new Config();

export function getConfigFromContext(context: any): Config {
	return context instanceof Config
		? context
		: globalConfig;
}

export function getTranslateFromConfig(
	config: Config,
	phraseOrParams: string | TemplateStringsArray | I18nParams
): [I18nLocale, string] {
	let locale = config.defaultLocale;
	let phrase: string;

	// called like __({ phrase: 'Hello', locale: 'en' })
	if (typeof phraseOrParams === 'object' && !isStringsArray(phraseOrParams)) {
		phrase = phraseOrParams.phrase;

		if (typeof phraseOrParams.locale === 'string') {
			locale = phraseOrParams.locale;
		}
	// called like __('Hello') or __`Hello`
	} else {
		phrase = preProcess(phraseOrParams);
	}

	return [
		// get translated message with locale
		translate(config, locale, phrase),
		locale
	];
}
