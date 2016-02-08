/**
 * @author      Created by Dan Green <danon0404@gmail.com> on 2016-01-05.
 * @link        https://github.com/TrigenSoftware/i18n-browser
 * @license     http://opensource.org/licenses/MIT
 *
 * @version     0.1.0
 */

import { vsprintf } from 'sprintf-js';
import Mustache     from 'mustache';
import Url          from 'url';

var localeChangeListener = () => {},
	defaultLocale  = 'en',
	locales        = {},  
	fallbacks      = {}, 
	cookiename     = null, 
	objectNotation = false;

// Silent configure if I18N object is exist.
if (typeof global.I18N == "object") {
	configure(I18N);
}

/**
 * Configure i18n with given options.
 * 
 * @param  {Object} options
 */
export function configure(options) {

	// read languages locales
	if (typeof options.locales == 'object') {
		locales = options.locales;
	}

	// sets a custom cookie name to parse locale settings from
	if (typeof options.cookie == 'string') { 
		cookiename = options.cookie;
	}

	// setting defaultLocale
	if (typeof options.defaultLocale == 'string') {
		defaultLocale = options.defaultLocale;
	}

	// enable object notation?
	if (typeof options.objectNotation != 'undefined') { 
		objectNotation = options.objectNotation;
	}

	if (objectNotation === true) {
		objectNotation = '.';
	}

	// read language fallback map
	if (typeof options.fallbacks == 'object') {
		fallbacks =  options.fallbacks;
	}

	// globalize
	if (options.globalize === true) {
		globalize();
	}

	defaultLocale = getCookie(cookiename) || defaultLocale;

	// get default locale from url
	if (options.defaultLocaleFromQuery === true && typeof location != "undefined") {

		var localeFromQuery = Url(location.href).query.locale;

		if (typeof localeFromQuery == "string") {
			defaultLocale = localeFromQuery;
		}
	}
}

/**
 * Inject `__` and `__n` functions to global scope.
 * 
 */
export function globalize() {
	global.__  = applyAPItoObject(__);
	global.__n = applyAPItoObject(__n);
}

/**
 * Translates a single phrase and adds it to locales if unknown. 
 * Returns translated parsed and substituted string.
 * 
 * @param  {String}    phrase
 * @param  {...Object} params
 * @return {String}    translate
 */
export function __(phrase, ...params) {

	var translated, namedValues;

	// Accept an object with named values as the last parameter
	if (typeof params[params.length - 1] == "object") {
		namedValues = params.pop();
	}

	// called like __({phrase: "Hello", locale: "en"})
	if (typeof phrase === 'object') {

		if (typeof phrase.locale === 'string' && typeof phrase.phrase === 'string') {
			translated = translate(phrase.locale, phrase.phrase);
		}
	}
	// called like __("Hello")
	else {
		// get translated message with locale
		translated = translate(defaultLocale, phrase);
	}

	// if the translated string contains {{Mustache}} patterns we render it as a mini tempalate
	if (/\{\{.*\}\}/.test(translated)) {
		translated = Mustache.render(translated, namedValues);
	}

	// if we have extra arguments with values to get replaced,
	// an additional substition injects those strings afterwards
	if (/%/.test(translated) && params && params.length > 0) {
		translated = vsprintf(translated, params);
	}

	return translated;
}

/**
 * Plurals translation of a single phrase. 
 * Singular and plural forms will get added to locales if unknown. 
 * Returns translated parsed and substituted string based on `count` parameter.
 * 
 * @param  {String}    singular
 * @param  {String}    plural  
 * @param  {Number}    count   
 * @param  {...Object} params  
 * @return {String}    translate
 */
export function __n(singular, plural, count, ...params) {

	var translated, namedValues;

	// Accept an object with named values as the last parameter
	if (typeof params[params.length - 1] == "object") {
		namedValues = params.pop();
	}

	// called like __n({singular: "%s cat", plural: "%s cats", locale: "en"}, 3)
	if (typeof singular === 'object') {

		if (typeof singular.locale === 'string' && typeof singular.singular === 'string' && typeof singular.plural === 'string') {
			translated = translate(singular.locale, singular.singular, singular.plural);
		}

		params.unshift(count);

		// some template engines pass all values as strings -> so we try to convert them to numbers
		if (typeof plural === 'number' || parseInt(plural, 10)+"" === plural) {
			count = plural;
		}

		// called like __n({singular: "%s cat", plural: "%s cats", locale: "en", count: 3})
		if (typeof singular.count === 'number' || typeof singular.count === 'string') {
			count = singular.count;
			params.unshift(plural);
		}
	}
	else {
		// called like	__n('cat', 3)
		if (typeof plural === 'number' || parseInt(plural, 10)+"" === plural) {
			count = plural;
			params.unshift(count);
			params.unshift(plural);
		}
		// called like __n('%s cat', '%s cats', 3)
		// get translated message with locale from scope (deprecated) or object
		translated = translate(defaultLocale, singular, plural);
	}
	if (count === null) {
		count = namedValues.count;
	}

	// parse translation and replace all digets '%d' by `count`
	// this also replaces extra strings '%%s' to parseble '%s' for next step
	// simplest 2 form implementation of plural, like https://developer.mozilla.org/en/docs/Localization_and_Plurals#Plural_rule_.231_.282_forms.29
	if (count > 1) {
		translated = vsprintf(translated.other, [parseInt(count, 10)]);
	} else {
		translated = vsprintf(translated.one, [parseInt(count, 10)]);
	}

	// if the translated string contains {{Mustache}} patterns we render it as a mini tempalate
	if (/\{\{.*\}\}/.test(translated)) {
		translated = Mustache.render(translated, namedValues);
	}

	// if we have extra arguments with strings to get replaced,
	// an additional substition injects those strings afterwards
	if (/%/.test(translated) && params.length) {
		translated = vsprintf(translated, params);
	}

	return translated;
}

/**
 * Set function to call when locale will change.
 * 
 * @param  {Function} listener
 */
export function onLocaleChange(listener) {
	localeChangeListener = listener;
}

/**
 * Set current locale.
 * 
 * @param  {String} locale
 * @return {String} locale
 */
export function setLocale(locale) {

	var fallback = fallbacks[locale];

	if (typeof locales[locale] != "object" && typeof fallback == "string") {
		locale = fallback;
	}

	// called like setLocale('en')
	if (typeof locales[locale] == "object") {

		if (cookiename !== null) {
			setCookie(cookiename, defaultLocale, {
			    expires: 3600 * 24 * 31 * 12 * 100,
			    path:    "/"
			});
		}

		localeChangeListener(defaultLocale = locale);
	}

	return defaultLocale;
}

/**
 * Get current locale.
 * 
 * @return {String}
 */
export function getLocale() {
	return defaultLocale;
}

/**
 * Get array of available locales.
 * 
 * @return {Array<String>}
 */
export function getLocales() {
	return Object.keys(locales);
}

/**
 * Returns a whole catalog optionally based on given locale.
 * 
 * @param  {String} locale
 * @return {Object|Array}
 */
export function getCatalog(locale) {

	if (typeof locale == "undefined") {
		return locales;
	}

	var fallback = fallbacks[locale];

	if (typeof locales[locale] != "object" && typeof fallback == "string") {
		locale = fallback;
	}

	var catalog = locales[locale];

	// called like setLocale('en')
	if (typeof catalog == "object") {
		return catalog;
	}

	return false;
}

/**
 * Add new translations.
 * 
 * @param {String} locale
 * @param {Object} catalog
 */
export function addLocale(locale, catalog) {
	locales[locale] = catalog;
}

/**
 * Remove translations.
 * 
 * @param  {String}
 */
export function removeLocale(locale) {
	delete locales[locale];
}


function applyAPItoObject(object) {

	object.onLocaleChange = onLocaleChange;
	object.setLocale      = setLocale;
	object.getLocale      = getLocale
	object.getLocales     = getLocales;
	object.getCatalog     = getCatalog;
	object.addLocale      = addLocale;
	object.removeLocale   = removeLocale;

	return object;
}

function setCookie(name, value, options) {

	if (typeof document == "undefined") {
		return;
	}

	options = options || {};

	var expires = options.expires;

	if (typeof expires == "number" && expires) {

  		var d = new Date();

    	d.setTime(d.getTime() + expires * 1000);
    	expires = options.expires = d;
  	}

	if (expires && expires.toUTCString) {
		options.expires = expires.toUTCString();
	}

	value = encodeURIComponent(value);

	var updatedCookie = name + "=" + value;

	for (var propName in options) {
  		
  		updatedCookie += "; " + propName;
    	
    	var propValue = options[propName];
    	
    	if (propValue !== true) {
    		updatedCookie += "=" + propValue;
      	}
    }

	document.cookie = updatedCookie;
}

function getCookie(name) {

	if (typeof document == "undefined" || name == null) {
		return false;
	}

	var matches = document.cookie.match(new RegExp(
		"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	));

	return matches ? decodeURIComponent(matches[1]) : false;
}


function translate(locale, singular, plural) {

	var fallback = fallbacks[locale],
		defaultSingular = singular,
		defaultPlural   = plural;

	if (typeof locale == "undefined") {
		locale = defaultLocale;
	}

	if (typeof locales[locale] != "object" && typeof fallback == "string") {
		locale = fallback;
	}

	if (typeof locales[locale] != "object") {
		locale = defaultLocale;
	}

	if (objectNotation) {

    	var indexOfColon = singular.indexOf(':');
    	// We compare against 0 instead of -1 because we don't really expect the string to start with ':'.
    	if (0 < indexOfColon) {
    		defaultSingular = singular.substring(indexOfColon + 1);
    		singular = singular.substring(0, indexOfColon);
    	}

    	if (plural && typeof plural !== 'number') {

      		indexOfColon = plural.indexOf(':');

      		if (0 < indexOfColon) {
		        defaultPlural = plural.substring(indexOfColon + 1);
		        plural        = plural.substring(0, indexOfColon);
			}
		}
	}

	var accessor = localeAccessor(locale, singular),
		mutator  = localeMutator(locale, singular);

	if (plural && !accessor()) {
		mutator({
			'one':   defaultSingular || singular,
			'other': defaultPlural   || plural
		});
	}

	if (!accessor()) {
		mutator(defaultSingular || singular);
	}

	return accessor();
}

/**
 * Allows delayed access to translations nested inside objects.
 * @param {String} locale The locale to use.
 * @param {String} singular The singular term to look up.
 * @param {Boolean} [allowDelayedTraversal=true] Is delayed traversal of the tree allowed?
 * This parameter is used internally. It allows to signal the accessor that
 * a translation was not found in the initial lookup and that an invocation
 * of the accessor may trigger another traversal of the tree.
 * @returns {Function} A function that, when invoked, returns the current value stored
 * in the object at the requested location.
 */
function localeAccessor(locale, singular, allowDelayedTraversal) {

	// Bail out on non-existent locales to defend against internal errors.
	if (typeof locales[locale] != "object") {
		return Function.prototype;
	}

	// Handle object lookup notation
	var indexOfDot = objectNotation && singular.indexOf(objectNotation);

	if (objectNotation && (0 < indexOfDot && indexOfDot < singular.length)) {

		// If delayed traversal wasn't specifically forbidden, it is allowed.
		if (typeof allowDelayedTraversal == "undefined") {
			allowDelayedTraversal = true;
		}

		// The accessor we're trying to find and which we want to return.
		var accessor = null;
		// An accessor that returns null.
		var nullAccessor = () => null;
		// Do we need to re-traverse the tree upon invocation of the accessor?
		var reTraverse = false;

		// Split the provided term and run the callback for each subterm.
		singular.split(objectNotation).reduce((object, index) => {
			// Make the accessor return null.
			accessor = nullAccessor;
			// If our current target object (in the locale tree) doesn't exist or
			// it doesn't have the next subterm as a member...
			if (null === object || !object.hasOwnProperty(index)) {
				// ...remember that we need retraversal (because we didn't find our target).
				reTraverse = allowDelayedTraversal;
				// Return null to avoid deeper iterations.
				return null;
			}
			// We can traverse deeper, so we generate an accessor for this current level.
			accessor = () => object[index];
			// Return a reference to the next deeper level in the locale tree.
			return object[index];

		}, locales[locale]);

		// Return the requested accessor.
		return () =>
			// If we need to re-traverse (because we didn't find our target term)
			// traverse again and return the new result (but don't allow further iterations)
			// or return the previously found accessor if it was already valid.
			( reTraverse ) ? localeAccessor(locale, singular, false)() : accessor()
		;
	} else {
		// No object notation, just return an accessor that performs array lookup.
		return () => locales[locale][singular];
	}
}

/**
 * Allows delayed mutation of a translation nested inside objects.
 * @description Construction of the mutator will attempt to locate the requested term
 * inside the object, but if part of the branch does not exist yet, it will not be
 * created until the mutator is actually invoked. At that point, re-traversal of the
 * tree is performed and missing parts along the branch will be created.
 * @param {String} locale The locale to use.
 * @param {String} singular The singular term to look up.
 * @param {Boolean} [allowBranching=false] Is the mutator allowed to create previously
 * non-existent branches along the requested locale path?
 * @returns {Function} A function that takes one argument. When the function is
 * invoked, the targeted translation term will be set to the given value inside the locale table.
 */
function localeMutator(locale, singular, allowBranching) {

	// Bail out on non-existent locales to defend against internal errors.
	if (typeof locales[locale] != "object") {
		return Function.prototype;
	}

	// Handle object lookup notation
	var indexOfDot = objectNotation && singular.indexOf(objectNotation);

	if (objectNotation && (0 < indexOfDot && indexOfDot < singular.length)) {

		// If branching wasn't specifically allowed, disable it.
		if (typeof allowBranching == "undefined") {
			allowBranching = false;
		}

		// This will become the function we want to return.
		var accessor = null;
		// An accessor that takes one argument and returns null.
		var nullAccessor = () => null;
		// Are we going to need to re-traverse the tree when the mutator is invoked?
		var reTraverse = false;

		// Split the provided term and run the callback for each subterm.
		singular.split(objectNotation).reduce((object, index) => {
			// Make the mutator do nothing.
			accessor = nullAccessor;
			// If our current target object (in the locale tree) doesn't exist or
			// it doesn't have the next subterm as a member...
			if (null === object || !object.hasOwnProperty(index)) {
				// ...check if we're allowed to create new branches.
				if (allowBranching) {
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
			accessor = value => object[index] = value;
			// Return a reference to the next deeper level in the locale tree.
			return object[index];

		}, locales[locale]);

		// Return the final mutator.
		return value =>
			// If we need to re-traverse the tree
			// invoke the search again, but allow branching this time (because here the mutator is being invoked)
			// otherwise, just change the value directly.
			( reTraverse ) ? localeMutator(locale, singular, true)(value) : accessor(value)
		;

	} else {
		// No object notation, just return a mutator that performs array lookup and changes the value.
		return value => locales[locale][singular] = value;
	}
}