/**
 * Express middleware
 *
 * @param  {Object} config [i18n-node config]
 * @return {Function}
 */
export default function i18nForBrowser(config) {

	const configForBrowser = {
		globalize:      true,
		locales:        {},
		fallbacks:      config.fallbacks,
		cookie:         config.cookie,
		queryParameter: config.queryParameter,
		objectNotation: config.objectNotation
	};

	return (request, response, next) => {

		response.locals.initI18nForBrowser = () => {

			const locale = request.locale;

			request.locale = false;

			const _catalog = request.getCatalog();

			request.locale = locale;

			const catalog = {};

			Object.keys(_catalog).forEach((_locale) => {
				catalog[_locale] = _locale == locale
					? _catalog[_locale]
					: {};
			});

			configForBrowser.defaultLocale = locale;
			configForBrowser.locales = catalog;

			return `<script>var I18N = ${JSON.stringify(configForBrowser)};</script>`;
		};

		next();
	};
}
