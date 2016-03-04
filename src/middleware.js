/**
 * Express middleware
 * 
 * @param  {Object} config [i18n-node config]
 * @return {Function}
 */
export default function i18nForBrowser(config) {

	var configForBrowser = { 
		globalize:      true,
		locales:        {},
		fallbacks:      config.fallbacks,
		cookie:         config.cookie,
		queryParameter: config.queryParameter,
		objectNotation: config.objectNotation
	};

	return (request, response, next) => {

		response.locals.initI18nForBrowser = () => {
			
			var locale = request.locale;
	        request.locale = false;
	        var catalog    = request.getCatalog();
	        request.locale = locale; 

	        Object.keys(catalog).forEach((_locale) => {
                
                if (_locale != locale) {
                	catalog[_locale] = {};
                }
            });

	        configForBrowser.defaultLocale = locale;
	        configForBrowser.locales       = catalog;

	        return `<script>var I18N = ${JSON.stringify(configForBrowser)};</script>`;
		};

		next();
	};
}