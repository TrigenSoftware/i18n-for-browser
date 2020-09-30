import MakePlural from 'make-plural-compiler';
import plurals from 'cldr-core/supplemental/plurals.json';
import {
	I18nPluralParams
} from '../types';
import {
	isStringsArray,
	tryParseFloat,
	translate,
	preProcess,
	postProcess
} from '../core';
import {
	getConfigFromContext
} from './common';

const pluralsInstanceForLocale: Record<string, MakePlural> = {};

/**
 * Plurals translation of a single phrase.
 * Singular and plural forms will get added to locales if unknown.
 * @param params - Translate params.
 * @param count - Target count.
 * @param values - Values to print.
 * @returns Translated parsed and substituted string based on `count` parameter.
 */
export function __n(
	params: I18nPluralParams,
	count?: string | number,
	...values
): string;

/**
 * Plurals translation of a single phrase.
 * Singular and plural forms will get added to locales if unknown.
 * @param singularOrStrings - Singular form to translate, or array of strings.
 * @param count - Target count.
 * @param values - Values to print.
 * @returns Translated parsed and substituted string based on `count` parameter.
 */
export function __n(
	singularOrStrings: string | TemplateStringsArray,
	count: string | number,
	...values
): string;

/**
 * Plurals translation of a single phrase.
 * Singular and plural forms will get added to locales if unknown.
 * @param singular - Singular form to translate.
 * @param plural - Plural form to translate.
 * @param count - Target count.
 * @param values - Values to print.
 * @returns Translated parsed and substituted string based on `count` parameter.
 */
export function __n(
	singular: string,
	plural: string,
	count: string | number,
	...values
): string;

/**
 * Plurals translation of a single phrase.
 * Singular and plural forms will get added to locales if unknown.
 * @param singularOrParams - Singular form to translate or params.
 * @param pluralOrCount - Plural form to translate or target count.
 * @param count - Target count.
 * @param values - Values to print.
 * @returns Translated parsed and substituted string based on `count` parameter.
 */
export function __n(
	singularOrParams: string | TemplateStringsArray | I18nPluralParams,
	pluralOrCount?: string | number,
	count?: string | number,
	...values
) {
	const config = getConfigFromContext(this);
	const {
		defaultLocale
	} = config;
	let locale = defaultLocale;
	let singular: string;
	let plural: string;
	let countNumber: number;
	let translated;
	let namedValues;
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
		let p;

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
