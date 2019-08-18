import MakePlural from 'make-plural-compiler';
import MessageFormat from 'messageformat';
import plurals from 'cldr-core/supplemental/plurals.json';
import Config, {
	IConfig,
	ILocales,
	IFallbacks,
	IUnknownPhraseListener,
	IProcessor
} from './config';
import {
	IPlurals,
	isStringsArray,
	preProcess,
	postProcess,
	getSingularFromPlurals,
	tryParseFloat,
	translate
} from './core';

export {
	pluralIntervalProcessor,
	mustacheProcessor
} from './processors';

export interface IParams {
	phrase: string;
	locale?: string;
}

export interface IPluralParams {
	singular: string;
	plural?: string;
	count?: number|string;
	locale?: string;
}

const messageFormatInstanceForLocale: Record<string, MessageFormat> = {};
const pluralsInstanceForLocale: Record<string, MakePlural> = {};
const globalConfig = new Config();

export {
	globalConfig as default,
	IConfig,
	ILocales,
	IFallbacks,
	IUnknownPhraseListener,
	IProcessor
};

/**
 * Helper to get config from context.
 * @param  context - Function context.
 * @return Config.
 */
function getConfigFromContext(context: any): Config {
	return context instanceof Config
		? context
		: globalConfig;
}

/**
 * Translates a single phrase and adds it to locales if unknown.
 * @param  phraseOrParams - Phrase to translate or params.
 * @param  values - Values to print.
 * @return Returns translated parsed and substituted string.
 */
export function __(phraseOrParams: string|TemplateStringsArray|IParams, ...values) {

	const config = getConfigFromContext(this);
	const {
		defaultLocale
	} = config;
	let locale = defaultLocale;
	let phrase: string = null;
	let translated: string|IPlurals = null;
	let namedValues = null;

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

	// get translated message with locale
	translated = translate(config, locale, phrase);

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

/**
 * Supports the advanced MessageFormat as provided by excellent messageformat module.
 * You should definetly head over to messageformat.github.io for a guide to MessageFormat.
 * `i18n-for-browser` takes care of `new MessageFormat('en').compile(msg);`
 * with the current msg loaded from it's json files and cache that complied fn in memory.
 * So in short you might use it similar to `__()` plus extra object to accomblish MessageFormat's formating.
 * @param  phraseOrParams - Phrase to translate or params.
 * @param  values - Values to print.
 * @return Translate.
 */
export function __mf(phraseOrParams: string|TemplateStringsArray|IParams, ...values) {

	const config = getConfigFromContext(this);
	const {
		defaultLocale
	} = config;
	let locale = defaultLocale;
	let phrase: string = null;
	let translated: string|IPlurals = null;
	let namedValues = null;
	let mf = null;
	let f = null;

	// called like __mf({ phrase: 'Hello', locale: 'en' })
	if (typeof phraseOrParams === 'object' && !isStringsArray(phraseOrParams)) {

		phrase = phraseOrParams.phrase;

		if (typeof phraseOrParams.locale === 'string') {
			locale = phraseOrParams.locale;
		}
	// else called like __mf('Hello') or __`Hello`
	} else {
		phrase = preProcess(phraseOrParams);
	}

	// get translated message with locale
	translated = translate(config, locale, phrase);

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

	// let's try to cache that function
	if (mf.compiledFunctions[translated]) {
		f = mf.compiledFunctions[translated];
	} else {
		f = mf.compile(translated);
		mf.compiledFunctions[translated] = f;
	}

	// Accept an object with named values as the last parameter
	if (typeof values[values.length - 1] === 'object') {
		namedValues = values.pop();
	}

	return postProcess(config, f(namedValues), namedValues, values);
}

/**
 * Plurals translation of a single phrase.
 * Singular and plural forms will get added to locales if unknown.
 * Returns translated parsed and substituted string based on `count` parameter.
 * @param  params - Translate params.
 * @param  count - Target count.
 * @param  values - Values to print.
 * @return Translate.
 */
export function __n(
	params: IPluralParams,
	count?: string|number,
	...values
): string;

/**
 * Plurals translation of a single phrase.
 * Singular and plural forms will get added to locales if unknown.
 * Returns translated parsed and substituted string based on `count` parameter.
 * @param  singularOrStrings - Singular form to translate, or array of strings.
 * @param  count - Target count.
 * @param  values - Values to print.
 * @return Translate.
 */
export function __n(
	singularOrStrings: string|TemplateStringsArray,
	count: string|number,
	...values
): string;

/**
 * Plurals translation of a single phrase.
 * Singular and plural forms will get added to locales if unknown.
 * Returns translated parsed and substituted string based on `count` parameter.
 * @param  singular - Singular form to translate.
 * @param  plural - Plural form to translate.
 * @param  count - Target count.
 * @param  values - Values to print.
 * @return Translate.
 */
export function __n(
	singular: string,
	plural: string,
	count: string|number,
	...values
): string;

/**
 * Plurals translation of a single phrase.
 * Singular and plural forms will get added to locales if unknown.
 * Returns translated parsed and substituted string based on `count` parameter.
 * @param  singularOrParams - Singular form to translate or params.
 * @param  pluralOrCount - Plural form to translate or target count.
 * @param  count - Target count.
 * @param  values - Values to print.
 * @return Translate.
 */
export function __n(
	singularOrParams: string|TemplateStringsArray|IPluralParams,
	pluralOrCount?: string|number,
	count?: string|number,
	...values
) {

	const config = getConfigFromContext(this);
	const {
		defaultLocale
	} = config;
	let locale = defaultLocale;
	let singular: string = null;
	let plural: string = null;
	let countNumber: number = null;
	let translated = null;
	let namedValues = null;
	// some template engines pass all values as strings -> so we try to convert them to numbers
	const [
		pluralOrCountNumber,
		pluralOrCountIsNumber
	] = tryParseFloat(pluralOrCount);

	// called like __n({ singular: '%s cat', plural: '%s cats', locale: 'en' }, 3)
	if (typeof singularOrParams === 'object' && !isStringsArray(singularOrParams)) {

		values.unshift(count);
		singular = singularOrParams.singular;

		if (typeof singularOrParams.locale === 'string') {
			locale = singularOrParams.locale;
		}

		if (typeof singularOrParams.plural === 'string') {
			plural = singularOrParams.plural;
		}

		if (pluralOrCountIsNumber) {
			countNumber = pluralOrCountNumber;
		// called like __n({singular: '%s cat', plural: '%s cats', locale: 'en', count: 3})
		} else {

			values.unshift(pluralOrCount);

			const [
				maybeNumber,
				isNumber
			] = tryParseFloat(singularOrParams.count);

			if (isNumber) {
				countNumber = maybeNumber;
			}
		}

	} else {

		singular = preProcess(singularOrParams);

		// called like __n('cat', 3) or __n`cat ${3}`
		if (pluralOrCountIsNumber) {
			values.unshift(count);
			// we add same string as default
			// which efectivly copies the key to the plural.value
			// this is for initialization of new empty translations
			plural = singular;
			countNumber = pluralOrCountNumber;
		} else {

			const [
				maybeNumber,
				isNumber
			] = tryParseFloat(count);

			// called like __n('%s cat', '%s cats', 3)
			if (isNumber && typeof pluralOrCount === 'string') {
				plural = pluralOrCount;
				countNumber = maybeNumber;
			}
		}
	}

	translated = translate(config, locale, singular, plural);

	// find the correct plural rule for given locale
	if (typeof translated === 'object') {

		let p = null;

		// create a new Plural for locale
		// and try to cache instance
		if (pluralsInstanceForLocale[locale]) {
			p = pluralsInstanceForLocale[locale];
		} else {
			MakePlural.load(plurals);
			p = new MakePlural(locale).compile();
			pluralsInstanceForLocale[locale] = p;
		}

		// fallback to 'other' on case of missing translations
		translated = translated[p(countNumber)] || translated.other;
	}

	// Accept an object with named values as the last parameter
	if (typeof values[values.length - 1] === 'object') {
		namedValues = values.pop();
	}

	return postProcess(config, translated, namedValues, values, countNumber);
}

/**
 * Returns a map of translations for a given phrase in each language.
 * @param  phrase - Phrase to translate.
 * @return Map of translations.
 */
export function __m(phrase: string) {

	const config = getConfigFromContext(this);
	const translate = config.bind(__);

	return config.getLocales().sort().reduce<ILocales>((translations, locale) => {
		translations[locale] = translate({
			phrase,
			locale
		});
		return translations;
	}, {});
}
