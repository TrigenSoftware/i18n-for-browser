/**
 * Plural locale descriptor.
 */
export interface I18nPluralLocale {
	one?: string;
	few?: string;
	many?: string;
	other?: string;
}

/**
 * Locale descriptor.
 */
export type I18nLocale = string | I18nPluralLocale;

/**
 * Language locales.
 */
export interface I18nLangLocales {
	[key: string]: I18nLocale | I18nLangLocales;
}

/**
 * All locales.
 */
export interface I18nLocales {
	[key: string]: I18nLangLocales;
}

/**
 * Language fallbacks map.
 */
export type I18nFallbacks = Record<string, string>;

/**
 * Unknown phrase listener.
 */
export type I18nUnknownPhraseListener = (
	locale: string,
	phrase: string,
	value: I18nLocale
) => void;

/**
 * Custom locale post processor.
 */
export type I18nProcessor = (
	text: string,
	namedValues: any,
	values: any[],
	count?: number
) => string;

/**
 * I18n instance config.
 */
export interface I18nConfig {
	/**
	 * Default locale to use.
	 */
	defaultLocale?: string;
	/**
	 * Store of translations.
	 */
	locales?: I18nLocales;
	/**
	 * Fallbacks map for locales.
	 */
	fallbacks?: I18nFallbacks;
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
	unknownPhraseListener?: I18nUnknownPhraseListener;
	/**
	 * List of post processors.
	 */
	processors?: I18nProcessor[];
}

/**
 * I18n fork instance config.
 */
export type I18nForkConfig = Pick<
	I18nConfig,
	Exclude<
		keyof I18nConfig,
		'objectNotation' | 'cookieName' | 'queryParameter'
	>
>;

/**
 * I18n fork instance linked fields.
 */
export interface I18nForkLinkedFields {
	defaultLocale: boolean;
	locales: boolean;
	unknownPhraseListener: boolean;
}

/**
 * Translate params.
 */
export interface I18nParams {
	phrase: string;
	locale?: string;
}

/**
 * Plural translate params.
 */
export interface I18nPluralParams {
	singular: string;
	plural?: string;
	count?: number | string;
	locale?: string;
}
