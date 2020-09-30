import {
	vsprintf
} from 'sprintf-js';
import {
	I18nLocale,
	I18nPluralLocale
} from './types';
import Config from './config';

const SEPARATOR = '.';
const DEFAULT_VALUE_SEPARATOR = ':';
const NOOP = () => null;

/**
 * Check data type.
 * @param maybeStrings - Maybe array of strings.
 * @returns Given data is array of strings.
 */
export function isStringsArray(maybeStrings: any): maybeStrings is TemplateStringsArray | string[] {
	return Array.isArray(maybeStrings);
}

/**
 * Handling of template literals.
 * @param text - Text or text parts.
 * @returns Processed text.
 */
export function preProcess<T>(text: T | TemplateStringsArray | string[]): T | string {
	if (isStringsArray(text)) {
		return text.join(
			text.hasOwnProperty('raw')
				? '%s'
				: ''
		);
	}

	return text;
}

/**
 * Handling of templates.
 * @param text - Text to process.
 * @param namedValues - Named values for mustache.
 * @param values - List of values for vsprintf.
 * @param count - Plural param.
 * @returns Processed text.
 */
export function postProcess(config: Config, text: string, namedValues: any, values: any[], count?: number) {
	let processedText = config.processors.reduce(
		(text, processor) => processor(text, namedValues, values, count),
		text
	);

	// replace the counter
	if (typeof count === 'number') {
		processedText = vsprintf(processedText, [count]);
	}

	// if we have extra arguments with values to get replaced,
	// an additional substition injects those strings afterwards
	if (/%/.test(processedText) && values.length) {
		processedText = vsprintf(processedText, values);
	}

	return String(processedText);
}

/**
 * Get singular from plurals object.
 * @param plurals - Plurals object to get sigular form.
 * @returns Singular.
 */
export function getSingularFromPlurals(plurals: I18nPluralLocale) {
	if (typeof plurals.one !== 'undefined') {
		return plurals.one;
	}
	// in case there is no 'one' but an 'other' rule
	if (typeof plurals.other !== 'undefined') {
		return plurals.other;
	}

	return null;
}

/**
 * Parse float from string, if `num` is `string`.
 * @param num - Number or string to handle.
 * @returns Maybe number and number is or not.
 */
export function tryParseFloat(num: string | number): [number, boolean] {
	if (typeof num === 'number') {
		return [
			num,
			true
		];
	}

	const maybeNumber = parseFloat(num);
	const isNumberLike = num === String(maybeNumber);

	return [
		maybeNumber,
		isNumberLike
	];
}

/**
 * Core translate function.
 * @param config - Config object.
 * @param locale - Target locale.
 * @param singular - Singular form.
 * @param plural - Plural form.
 * @returns Translation.
 */
export function translate(config: Config, locale: string, singular: string, plural?: string) {
	const {
		objectNotation
	} = config;
	const targetLocale = config.getLocale(true, locale);
	let targetSingular = singular;
	let targetPlural = plural;
	let defaultSingular = targetSingular;
	let defaultPlural = targetPlural;

	if (objectNotation) {
		let indexOfColon = targetSingular.indexOf(DEFAULT_VALUE_SEPARATOR);

		// We compare against 0 instead of -1 because we don't really expect the string to start with ':'.
		if (indexOfColon > 0) {
			defaultSingular = targetSingular.substring(indexOfColon + 1);
			targetSingular = targetSingular.substring(0, indexOfColon);
		}

		if (targetPlural && typeof targetPlural !== 'number') {
			indexOfColon = targetPlural.indexOf(DEFAULT_VALUE_SEPARATOR);

			if (indexOfColon > 0) {
				defaultPlural = targetPlural.substring(indexOfColon + 1);
				targetPlural = targetPlural.substring(0, indexOfColon);
			}
		}
	}

	const accessor = localeAccessor(config, targetLocale, targetSingular, true);
	const mutator = localeMutator(config, targetLocale, targetSingular, false);
	const accessFirstTry = accessor();

	if (targetPlural && (
		!accessFirstTry || typeof accessFirstTry !== 'object'
	)) {
		mutator({
			one:   defaultSingular || targetSingular,
			other: defaultPlural || targetPlural
		});
	}

	if (!accessor()) {
		mutator(defaultSingular || targetSingular);
	}

	return accessor();
}

/**
 * Get singluar or plurls object.
 * @param result - Singluar or plurls object.
 * @returns Valid result.
 */
function getValidResult(result: I18nLocale) {
	return typeof result === 'string'
		|| result !== null && typeof result === 'object'
		&& (result.hasOwnProperty('one') || result.hasOwnProperty('other'))
			? result
			: null;
}

/**
 * Allows delayed access to translations nested inside objects.
 * @param config - Config object.
 * @param locale - The locale to use.
 * @param singular - The singular term to look up.
 * @param allowDelayedTraversal - Is delayed traversal of the tree allowed?
 * This parameter is used internally. It allows to signal the accessor that
 * a translation was not found in the initial lookup and that an invocation
 * of the accessor may trigger another traversal of the tree.
 * @returns A function that, when invoked, returns the current value stored
 * in the object at the requested location.
 */
function localeAccessor(
	config: Config,
	locale: string,
	singular: string,
	allowDelayedTraversal = true
): () => I18nLocale {
	const {
		locales,
		objectNotation
	} = config;

	// Bail out on non-existent locales to defend against internal errors.
	if (typeof locales[locale] !== 'object') {
		return NOOP;
	}

	// Handle object lookup notation
	const indexOfSeparator = objectNotation && singular.lastIndexOf(SEPARATOR);

	if (objectNotation && (indexOfSeparator > 0 && indexOfSeparator < singular.length - 1)) {
		// The accessor we're trying to find and which we want to return.
		let accessor;
		// Do we need to re-traverse the tree upon invocation of the accessor?
		let reTraverse = false;

		// Split the provided term and run the callback for each subterm.
		singular.split(SEPARATOR).reduce((object, index) => {
			// Make the accessor return null.
			accessor = NOOP;

			// If our current target object (in the locale tree) doesn't exist or
			// it doesn't have the next subterm as a member...
			if (object === null || !object.hasOwnProperty(index)) {
				// ...remember that we need retraversal (because we didn't find our target).
				reTraverse = allowDelayedTraversal;
				// Return null to avoid deeper iterations.
				return null;
			}
			// We can traverse deeper, so we generate an accessor for this current level.
			accessor = () => getValidResult(object[index]);
			// Return a reference to the next deeper level in the locale tree.
			return object[index];

		}, locales[locale]);

		// Return the requested accessor.
		return () => (
			// If we need to re-traverse (because we didn't find our target term)
			// traverse again and return the new result (but don't allow further iterations)
			// or return the previously found accessor if it was already valid.
			reTraverse ? localeAccessor(config, locale, singular, false)() : accessor()
		);
	}
	// No object notation, just return an accessor that performs array lookup.
	return () => getValidResult(locales[locale][singular]);
}

/**
 * Allows delayed mutation of a translation nested inside objects.
 * @description Construction of the mutator will attempt to locate the requested term
 * inside the object, but if part of the branch does not exist yet, it will not be
 * created until the mutator is actually invoked. At that point, re-traversal of the
 * tree is performed and missing parts along the branch will be created.
 * @param config - Config object.
 * @param locale - The locale to use.
 * @param singular - The singular term to look up.
 * @param allowBranching - Is the mutator allowed to create previously
 * non-existent branches along the requested locale path?
 * @returns A function that takes one argument. When the function is
 * invoked, the targeted translation term will be set to the given value inside the locale table.
 */
function localeMutator(
	config: Config,
	locale: string,
	singular: string,
	allowBranching = false
): (input: I18nLocale) => I18nLocale {
	const {
		locales,
		objectNotation,
		unknownPhraseListener
	} = config;
	const withUnknownPhraseListener = typeof unknownPhraseListener === 'function';

	// Bail out on non-existent locales to defend against internal errors.
	if (typeof locales[locale] !== 'object') {
		return NOOP;
	}

	// Handle object lookup notation
	const indexOfSeparator = objectNotation && singular.lastIndexOf(SEPARATOR);

	if (objectNotation && (indexOfSeparator > 0 && indexOfSeparator < singular.length - 1)) {
		// This will become the function we want to return.
		let accessor;
		// Fix object path.
		let fixObject = () => ({});
		// Are we going to need to re-traverse the tree when the mutator is invoked?
		let reTraverse = false;

		// Split the provided term and run the callback for each subterm.
		singular.split(SEPARATOR).reduce((prevObject, index) => {
			let object = prevObject;

			// Make the mutator do nothing.
			accessor = NOOP;

			// If our current target object (in the locale tree) doesn't exist or
			// it doesn't have the next subterm as a member...
			if (object === null || !object.hasOwnProperty(index)) {
				// ...check if we're allowed to create new branches.
				if (allowBranching) {
					// Fix `object` if `object` is not Object.
					if (object === null || typeof object !== 'object') {
						object = fixObject();
					}
					// If we are allowed to, create a new object along the path.
					object[index] = {};
				} else {
					// If we aren't allowed, remember that we need to re-traverse later on and...
					reTraverse = true;
					// ...return null to make the next iteration bail our early on.
					return null;
				}
			}
			// Generate a mutator for the current level.
			accessor = withUnknownPhraseListener
				? (value) => {
					unknownPhraseListener(locale, singular, value);
					return object[index] = value;
				}
				: value => (object[index] = value);
			// Generate a fixer for the current level.
			fixObject = () => (object[index] = {});
			// Return a reference to the next deeper level in the locale tree.
			return object[index];

		}, locales[locale]);

		// Return the final mutator.
		return value => (
			// If we need to re-traverse the tree
			// invoke the search again, but allow branching this time (because here the mutator is being invoked)
			// otherwise, just change the value directly.
			reTraverse ? localeMutator(config, locale, singular, true)(value) : accessor(value)
		);
	}
	// No object notation, just return a mutator that performs array lookup and changes the value.
	return withUnknownPhraseListener
		? (value) => {
			unknownPhraseListener(locale, singular, value);
			return locales[locale][singular] = value;
		}
		: value => (locales[locale][singular] = value);
}
