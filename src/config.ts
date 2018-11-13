import { parse as parseUrl } from 'url';
import Cookies from 'js-cookie';
import { IPlurals } from './core';

export interface ILocales {
	[key: string]: number|string|ILocales;
}

export type IFallbacks = Record<string, string>;

export type IUnknownPhraseListener = (locale: string, phrase: string, value: string|IPlurals) => void;

export type IProcessor = (text: string, namedValues: any, values: any[], count?: number) => string;

export interface IConfig {
	/**
	 * Default locale to use.
	 */
	defaultLocale?: string;
	/**
	 * Store of translations.
	 */
	locales?: ILocales;
	/**
	 * Fallbacks map for locales.
	 */
	fallbacks?: IFallbacks;
	/**
	 * Translate phrases or get phrases by keys.
	 */
	objectNotation?: boolean;
	/**
	 * Cookie name to store locale.
	 */
	cookieName?: string;
	/**
	 * Query parameter to get locale.
	 */
	queryParameter?: string;
	/**
	 * Unknown phrases listener.
	 */
	unknownPhraseListener?: IUnknownPhraseListener;
	/**
	 * List of post processors.
	 */
	processors?: IProcessor[];
}

const COOKIES_LIFE_TIME = 3600;
const IS_BROWSER = typeof document !== 'undefined'
	&& typeof location !== 'undefined';

export default class Config implements IConfig {

	defaultLocale = 'en';
	locales: ILocales = {};
	fallbacks: IFallbacks = {};
	objectNotation = false;
	cookieName: string = null;
	queryParameter = 'locale';
	unknownPhraseListener: IUnknownPhraseListener = null;
	processors: IProcessor[] = [];

	constructor(config: IConfig = {}) {
		this.configure(config);
		this.onUnknownPhrase = this.onUnknownPhrase.bind(this);
		this.setLocale = this.setLocale.bind(this);
		this.getLocale = this.getLocale.bind(this);
		this.getLocales = this.getLocales.bind(this);
		this.getCatalog = this.getCatalog.bind(this);
		this.addLocale = this.addLocale.bind(this);
		this.removeLocale = this.removeLocale.bind(this);
	}

	/**
	 * Change config.
	 * @param  config - Config options.
	 * @return Config.
	 */
	configure({
		defaultLocale,
		locales,
		fallbacks,
		objectNotation,
		cookieName,
		queryParameter,
		unknownPhraseListener,
		processors
	}: IConfig) {

		// setting defaultLocale
		if (typeof defaultLocale === 'string') {
			this.defaultLocale = defaultLocale;
		}

		// read languages locales
		if (typeof locales === 'object') {
			this.locales = locales;
		}

		// read language fallback map
		if (typeof fallbacks === 'object') {
			this.fallbacks = fallbacks;
		}

		// enable object notation?
		if (typeof objectNotation === 'boolean') {
			this.objectNotation = objectNotation;
		}

		// sets a custom cookie name to parse locale settings from
		if (typeof cookieName === 'string') {
			this.cookieName = cookieName;
		}

		const localeFromCookies = IS_BROWSER && Cookies.get(this.cookieName);

		if (typeof localeFromCookies === 'string') {
			this.defaultLocale = localeFromCookies;
		}

		// get default locale from url
		const typeofQueryParameter = typeof queryParameter;

		if (IS_BROWSER && typeofQueryParameter !== 'undefined') {

			const key = typeofQueryParameter === 'string'
				? queryParameter
				: 'locale';
			const localeFromQuery = parseUrl(location.href, true).query[key];

			if (typeof localeFromQuery === 'string') {
				this.defaultLocale = localeFromQuery;
			}
		}

		if (Array.isArray(processors)) {
			this.processors = processors;
		}

		if (typeof unknownPhraseListener === 'function') {
			this.unknownPhraseListener = unknownPhraseListener;
		}

		this.setLocale(this.defaultLocale);

		return this;
	}

	destroy() {
		this.defaultLocale = null;
		this.locales = null;
		this.fallbacks = null;
		this.objectNotation = null;
		this.cookieName = null;
		this.queryParameter = null;
		this.unknownPhraseListener = null;
		this.processors = null;
	}

	/**
	 * Copy current config with some overrides.
	 * @param  config - Config with overrides.
	 * @return Forked config.
	 */
	fork(config: IConfig) {
		return new Config(this).configure(config);
	}

	bind<T extends (...args: any[]) => any>(fn: T): T {

		const { source } = fn as any;
		const fnSource = typeof source === 'function'
			? source
			: fn;
		const bindedFn = fnSource.bind(this);

		bindedFn.source = fnSource;

		return bindedFn;
	}

	/**
	 * Set function to call when unknown phrase was translated.
	 * @param  listener - Locale change listener.
	 * @return Config.
	 */
	onUnknownPhrase(listener: IUnknownPhraseListener) {
		this.unknownPhraseListener = listener;
		return this;
	}

	/**
	 * Set current locale.
	 * @param  locale - Locale to set.
	 * @return Config.
	 */
	setLocale(locale: string) {

		const {
			locales,
			cookieName
		} = this;
		const nextLocale = this.getLocale(true, locale, true);

		// called like setLocale('en')
		if (typeof locales[nextLocale] === 'object') {

			this.defaultLocale = nextLocale;

			if (IS_BROWSER && cookieName !== null) {
				Cookies.set(cookieName, nextLocale, {
					expires: COOKIES_LIFE_TIME,
					path:    '/'
				});
			}
		}

		return this;
	}

	/**
	 * Get current locale.
	 * @param  checkFallback - Flag to use fallback or not.
	 * @param  localeToCheck - Locale to handle.
	 * @param  strict - Should fall back to default locale or not.
	 * @return Current locale.
	 */
	getLocale(checkFallback?: true, localeToCheck?: string, strict = false): string {

		if (checkFallback === true) {

			const {
				defaultLocale,
				locales,
				fallbacks
			} = this;
			let locale = localeToCheck;

			if (typeof locale !== 'string') {
				locale = defaultLocale;
			}

			if (typeof locales[locale] !== 'object'
				&& typeof fallbacks[locale] === 'string'
			) {
				locale = fallbacks[locale];
			}

			if (!strict && typeof locales[locale] !== 'object') {
				locale = defaultLocale;
			}

			return locale;
		}

		return this.defaultLocale;
	}

	/**
	 * Get array of available locales.
	 * @return Available locales.
	 */
	getLocales() {

		const {
			locales
		} = this;

		return Object.keys(locales).filter(_ =>
			typeof locales[_] === 'object'
		);
	}

	/**
	 * Returns a whole catalog optionally based on given locale.
	 * @param  locale - Locale to get sub-catalog.
	 * @return Catalog.
	 */
	getCatalog(locale?: string) {

		const {
			locales
		} = this;

		if (typeof locale === 'undefined') {
			return locales;
		}

		const targetLocale = this.getLocale(true, locale, true);
		const catalog = locales[targetLocale];

		if (typeof catalog === 'object') {
			return catalog;
		}

		return null;
	}

	/**
	 * Add new translations.
	 * @param  locale - Locale to add.
	 * @param  catalog - Catalog for localte to add.
	 * @return Config.
	 */
	addLocale(locale: string, catalog: ILocales) {
		this.locales[locale] = catalog;
		return this;
	}

	/**
	 * Remove translations.
	 * @param  locale - Locale to remove.
	 * @return Config.
	 */
	removeLocale(locale: string) {
		Reflect.deleteProperty(this.locales, locale);
		return this;
	}
}