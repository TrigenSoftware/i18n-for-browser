[![NPM](https://nodei.co/npm/i18n-for-browser.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/i18n-for-browser/)

# i18n-for-browser
Implementation of [`i18n-node`](https://github.com/mashpie/i18n-node) designed for client-side.


## Install
```sh
npm install i18n-for-browser
```

## Test
```sh
npm test
```

## Load
```js
// load modules
import * as i18n from 'i18n-for-browser';
```

now you are ready to use a `i18n.__('Hello')`. 


## Configure

Some options same as in [`i18n-node`](https://github.com/mashpie/i18n-node), except

```js
i18n.configure({
	// store of translations
	locales: {
		'en': {...},
		'ru': {...}
	},

	// sets a custom cookie name to read/write locale  - defaults to NULL
	cookie: 'yourcookiename',

	// injects `__` and `__n` functions to global scope
	// some methods like `setLocale` are injected to this functions
	// e.g. `__.getLocale()`
	// defaults to false
	globalize: true
});
```

Properties necessary for work with fs (`directory`, `updateFiles`, `indent`, `extenstion`, `prefix`) are skipped.

Also you can use auto-configuration: just define variable `I18N` with configuration before importing the module.

```js
const I18N = {
	locales: {
		'en': {...},
		'ru': {...}
	},
	globalize: true
};

...

import 'i18n-for-browser';

console.log(`${__('Hello')}!`);

```


## API


### __(phrase, ...params)

[See i18n-node.](https://github.com/mashpie/i18n-node#i18n__)


### __n(singular, plural, count, ...params)

[See i18n-node.](https://github.com/mashpie/i18n-node#i18n__n)


### __mf(phrase, ...params)

[See i18n-node.](https://github.com/mashpie/i18n-node#i18n__mf)


### __l(phrase)

[See i18n-node.](https://github.com/mashpie/i18n-node#i18n__l)


### __h(phrase)

[See i18n-node.](https://github.com/mashpie/i18n-node#i18n__h)


### setLocale(locale)

[See i18n-node.](https://github.com/mashpie/i18n-node#i18nsetlocale) Also this function write new locale to cookies if `cookiename` is setted.


### onLocaleChange(listener)

Set function to call when locale was change.

For example if you provide only needed translation via `I18N` object.
```js
const I18N = {
	cookiename: 'locale',
	globalize:  true
	...
};

...

import 'i18n-for-browser';

__.onLocaleChange(location.reload.bind(location));

...

$(".language-picker__language__en").click((e) => {
	__.setLocale('en');
});

```

Also it very comfortable to use it with react:
```js
class App extends React.Component {

	...

	componentDidMount() {
		__.onLocaleChange(this.forceUpdate.bind(this));
	}

	...

}
```


### getLocale()

[See i18n-node.](https://github.com/mashpie/i18n-node#i18ngetlocale)


### getLocales()

Get list of available locales.


### getCatalog(locale)

[See i18n-node.](https://github.com/mashpie/i18n-node#i18ngetcatalog)


### addLocale(locale, catalog)

Dynamically adding/replacing of locale


### removeLocale(locale)

Remove locale by key.


## Express middleware helper

To provide translations to client from your express app you can use this helper.

```js
import i18nExpressHelper from 'i18n-for-browser/lib/middleware';
// or 
// const i18nExpressHelper = require('i18n-for-browser/lib/middleware’).default;
...
// Before this `i18n` should already initialized.
app.use(i18nExpressHelper(i18nNodeConfig));
...
```

```html
<!DOCTYPE html>
<html>
    <head>
        <title>views/layout.ejs</title>
        <%- initI18nForBrowser() %>
        <script src="js-file-with-imported-i18n-for-browser.js"></script>
    </head>
    <body>
        <%- body %>
    </body>
</html>
```