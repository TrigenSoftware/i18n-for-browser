import Cookies from 'js-cookie';
import {
	I18nConfig,
	I18nForkConfig,
	I18nLocales,
	I18nLangLocales,
	I18nFallbacks,
	I18nUnknownPhraseListener,
	I18nProcessor,
	I18nForkLinkedFields
} from './types';

const COOKIES_LIFE_TIME = 3600;
const IS_BROWSER = typeof window !== 'undefined';

export default class Config implements I18nConfig {

	defaultLocale = 'en';
	locales: I18nLocales = {};
	fallbacks: I18nFallbacks = {};
	objectNotation = false;
	cookieName: string = null;
	queryParameter = 'locale';
	unknownPhraseListener: I18nUnknownPhraseListener = null;
	processors: I18nProcessor[] = [];
	isDestroyed = false;

	private readonly isConstructed: boolean = false;
	private isFork = false;
	private forks: Config[] = [];
	private forkLinkedFields: I18nForkLinkedFields = {
		defaultLocale:         true,
		locales:               true,
		unknownPhraseListener: true
	};

	constructor(config: I18nConfig = {}, isFork = false) {
		this.onUnknownPhrase = this.onUnknownPhrase.bind(this);
		this.setLocale = this.setLocale.bind(this);
		this.getLocale = this.getLocale.bind(this);
		this.getLocales = this.getLocales.bind(this);
		this.getCatalog = this.getCatalog.bind(this);
		this.addLocale = this.addLocale.bind(this);
		this.removeLocale = this.removeLocale.bind(this);
		this.isFork = isFork;
		this.configure(config);
		this.isConstructed = true;
	}

	/**
	 * Change config.
	 * @param config - Config options.
	 * @returns Config.
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
	}: I18nConfig) {
		const {
			isConstructed,
			isFork,
			forkLinkedFields
		} = this;
		const linkedField = !isConstructed || !isFork;

		// setting defaultLocale
		if (typeof defaultLocale === 'string') {
			this.defaultLocale = defaultLocale;
			forkLinkedFields.defaultLocale = linkedField;
		}

		// read languages locales
		if (typeof locales === 'object') {
			this.locales = locales;
			forkLinkedFields.locales = linkedField;
		}

		// read language fallback map
		if (typeof fallbacks === 'object') {
			this.fallbacks = fallbacks;
		}

		if (!isFork || !isConstructed) {
			// enable object notation?
			if (typeof objectNotation === 'boolean') {
				this.objectNotation = objectNotation;
			}

			// sets a custom cookie name to parse locale settings from
			if (typeof cookieName === 'string') {
				this.cookieName = cookieName;
			}
		}

		if (!isFork) {
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
				const localeFromQuery = new URLSearchParams(location.search).get(key);

				if (typeof localeFromQuery === 'string') {
					this.defaultLocale = localeFromQuery;
				}
			}
		}

		if (Array.isArray(processors)) {
			this.processors = processors;
		}

		if (typeof unknownPhraseListener === 'function') {
			this.unknownPhraseListener = unknownPhraseListener;
			forkLinkedFields.unknownPhraseListener = linkedField;
		}

		const defaultLocaleIsLinked = forkLinkedFields.defaultLocale;

		this.setLocale(this.defaultLocale);
		forkLinkedFields.defaultLocale = defaultLocaleIsLinked;

		return this;
	}

	/**
	 * Destroy instance.
	 */
	destroy() {
		this.isDestroyed = true;
		this.defaultLocale = null;
		this.locales = null;
		this.fallbacks = null;
		this.objectNotation = null;
		this.cookieName = null;
		this.queryParameter = null;
		this.unknownPhraseListener = null;
		this.processors = null;
		this.forks = null;
		this.isFork = null;
		this.forkLinkedFields = null;
	}

	/**
	 * Copy current config with some overrides.
	 * @param config - Config with overrides.
	 * @returns Forked config.
	 */
	fork(config?: I18nForkConfig, hard?: boolean): Config;

	/**
	 * Copy current config with some overrides.
	 * @param config - Config with overrides.
	 * @param hard - Do hard fork without linked fields.
	 * @returns Forked config.
	 */
	fork(config: I18nConfig, hard: true): Config;

	/**
	 * Copy current config with some overrides.
	 * @param config - Config with overrides.
	 * @param hard - Do hard fork without linked fields.
	 * @returns Forked config.
	 */
	fork(config: I18nConfig = {}, hard = false) {
		const soft = !hard;
		const forkedConfig = new Config(this, soft).configure(config);

		if (soft) {
			this.forks.push(forkedConfig);
		}

		return forkedConfig;
	}

	/**
	 * Call given method for all forks.
	 * @param caller - Function to call method of fork.
	 * @param flagName - Flag name to check ability to call method.
	 */
	private callForkMethod(
		caller: (fork: Config) => void,
		flagName: keyof I18nForkLinkedFields
	) {
		this.forks = this.forks.filter((fork) => {
			if (fork.isDestroyed) {
				return false;
			}

			if (fork.forkLinkedFields[flagName]) {
				fork.isFork = false;
				caller(fork);
				fork.isFork = true;
			}

			return true;
		});
	}

	/**
	 * Create translate function copy, binded to another config.
	 * @param fn - Translate function.
	 * @returns Binded function.
	 */
	bind<T extends Function>(fn: T): T;

	/**
	 * Create translate functions copy, binded to another config.
	 * @param fns - Translate functions.
	 * @returns Binded functions.
	 */
	bind<
		A extends Function,
		B extends Function,
		C extends Function,
		D extends Function
	>(fns: [A?, B?, C?, D?]): [A?, B?, C?, D?];

	/**
	 * Create translate function(s) copy, binded to another config.
	 * @param fnOrFns - Translate function(s).
	 * @returns Binded function(s).
	 */
	bind(fnOrFns: Function | Function[]) {
		if (Array.isArray(fnOrFns)) {
			return fnOrFns.map(fn => this.bind(fn));
		}

		const { source } = fnOrFns as any;
		const fnSource = typeof source === 'function'
			? source
			: fnOrFns;
		const bindedFn = fnSource.bind(this);

		bindedFn.source = fnSource;

		return bindedFn;
	}

	/**
	 * Set function to call when unknown phrase was translated.
	 * @param listener - Locale change listener.
	 * @returns Config.
	 */
	onUnknownPhrase(listener: I18nUnknownPhraseListener) {
		const {
			isFork,
			forkLinkedFields
		} = this;
		const linkedField = !isFork;

		forkLinkedFields.unknownPhraseListener = linkedField;
		this.unknownPhraseListener = listener;

		this.callForkMethod(
			fork => fork.onUnknownPhrase(listener),
			'unknownPhraseListener'
		);

		return this;
	}

	/**
	 * Set current locale.
	 * @param locale - Locale to set.
	 * @returns Config.
	 */
	setLocale(locale: string) {
		const {
			isFork,
			forkLinkedFields,
			locales,
			cookieName
		} = this;
		const linkedField = !isFork;
		const nextLocale = this.getLocale(true, locale, true);

		forkLinkedFields.defaultLocale = linkedField;

		// called like setLocale('en')
		if (typeof locales[nextLocale] === 'object') {
			this.defaultLocale = nextLocale;

			if (IS_BROWSER && cookieName) {
				Cookies.set(cookieName, nextLocale, {
					expires: COOKIES_LIFE_TIME,
					path:    '/'
				});
			}
		}

		this.callForkMethod(
			fork => fork.setLocale(locale),
			'defaultLocale'
		);

		return this;
	}

	/**
	 * Get current locale.
	 * @param checkFallback - Flag to use fallback or not.
	 * @param localeToCheck - Locale to handle.
	 * @param strict - Should fall back to default locale or not.
	 * @returns Current locale.
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
	 * Get available locales.
	 * @returns Available locales.
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
	 * Get whole catalog optionally based on given locale.
	 * @param locale - Locale to get sub-catalog.
	 * @returns Catalog.
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
	 * @param locale - Locale to add.
	 * @param catalog - Catalog for localte to add.
	 * @returns Config.
	 */
	addLocale(locale: string, catalog: I18nLangLocales) {
		const {
			isFork,
			forkLinkedFields,
			locales
		} = this;
		const linkedField = !isFork;

		forkLinkedFields.locales = linkedField;
		locales[locale] = catalog;

		// No need `callForkMethod` due to `locales` is object.

		return this;
	}

	/**
	 * Remove translations.
	 * @param locale - Locale to remove.
	 * @returns Config.
	 */
	removeLocale(locale: string) {
		const {
			isFork,
			forkLinkedFields,
			locales
		} = this;
		const linkedField = !isFork;

		forkLinkedFields.locales = linkedField;
		delete locales[locale];

		// No need `callForkMethod` due to `locales` is object.

		return this;
	}
}
