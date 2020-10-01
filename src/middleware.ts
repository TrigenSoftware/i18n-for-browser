import {
	I18nConfig,
	I18nLocales
} from './types';

/**
 * Express middleware
 * @param config - i18n-node config
 * @returns Express middleware function.
 */
export default function i18nForBrowser(config: any) {
	const configForBrowser: I18nConfig = {
		locales:        {},
		fallbacks:      config.fallbacks,
		cookieName:     config.cookie,
		queryParameter: config.queryParameter,
		objectNotation: Boolean(config.objectNotation)
	};

	return (request, response, next) => {
		response.locals.initI18nForBrowser = () => {

			const targetLocale: string = request.locale;
			const targetCatalog: I18nLocales = {};

			request.locale = false;

			const fullCatalog = request.getCatalog();

			request.locale = targetLocale;

			Object.entries(fullCatalog).forEach(([locale, catalog]: [string, I18nLocales]) => {
				targetCatalog[locale] = locale === targetLocale
					? catalog
					: {};
			});

			configForBrowser.defaultLocale = targetLocale;
			configForBrowser.locales = targetCatalog;

			return `<script>var I18N = ${JSON.stringify(configForBrowser)};</script>`;
		};

		next();
	};
}
