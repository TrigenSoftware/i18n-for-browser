import {
	getConfigFromContext
} from './common';

/**
 * Get map of translations for a given phrase in each language.
 * @param method - Source translation method to use.
 * @param args - Method arguments.
 * @returns Map of translations.
 */
export function __m<T extends (...args: any) => any>(method: T, ...args: Parameters<T>) {
	const config = getConfigFromContext(this).fork();
	const translations = config.getLocales().sort().reduce<Record<string, string>>((translations, locale) => {
		config.setLocale(locale);
		translations[locale] = method.apply(config, args);
		return translations;
	}, {});

	config.destroy();

	return translations;
}
