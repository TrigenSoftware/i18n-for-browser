# i18n-for-browser

[![NPM version][npm]][npm-url]
[![Dependencies status][deps]][deps-url]
[![Build status][build]][build-url]
[![Coverage status][coverage]][coverage-url]
[![Dependabot badge][dependabot]][dependabot-url]
[![Documentation badge][documentation]][documentation-url]

[npm]: https://img.shields.io/npm/v/i18n-for-browser.svg
[npm-url]: https://npmjs.com/package/i18n-for-browser

[deps]: https://david-dm.org/TrigenSoftware/i18n-for-browser.svg
[deps-url]: https://david-dm.org/TrigenSoftware/i18n-for-browser

[build]: http://img.shields.io/travis/com/TrigenSoftware/i18n-for-browser/master.svg
[build-url]: https://travis-ci.com/TrigenSoftware/i18n-for-browser

[coverage]: https://img.shields.io/coveralls/TrigenSoftware/i18n-for-browser.svg
[coverage-url]: https://coveralls.io/r/TrigenSoftware/i18n-for-browser

[dependabot]: https://api.dependabot.com/badges/status?host=github&repo=TrigenSoftware/i18n-for-browser
[dependabot-url]: https://dependabot.com/

[documentation]: https://img.shields.io/badge/API-Documentation-2b7489.svg
[documentation-url]: https://trigensoftware.github.io/i18n-for-browser

Modern translation module for web.

## Install

```sh
npm i i18n-for-browser
# or
yarn add i18n-for-browser
```

## CDN

`i18n-for-browser` is also available on [unpkg.com](https://unpkg.com/i18n-for-browser) as UMD, which exposes global object `i18n`.

```html
<script src="https://unpkg.com/i18n-for-browser?main=umd"></script>
```

## API

Module exposes next API:

```js
export default globalConfig;
export {
    I18nConfigInstance,
    I18nPluralLocale,
    I18nLocale,
    I18nLangLocales,
    I18nLocales,
    I18nFallbacks,
    I18nUnknownPhraseListener,
    I18nProcessor,
    I18nConfig,
    I18nForkConfig,
    I18nParams,
    I18nPluralParams,
    pluralIntervalProcessor,
    mustacheProcessor,
    __,
    __mf,
    __n,
    __m
};
```

[Description of this methods you can find in Documentation.](https://trigensoftware.github.io/i18n-for-browser/index.html)

Shirt description:

### [i18n](https://trigensoftware.github.io/i18n-for-browser/modules/_src_methods_common_.html#globalconfig)

Global config. Instanse of [`Config`](https://trigensoftware.github.io/i18n-for-browser/classes/_src_config_.config.html).

<details>
    <summary>Usage example</summary>

```js
import i18n, {
    pluralIntervalProcessor,
    __,
    __n
} from 'i18n-for-browser';

/**
 * Set global config.
 */
i18n.configure({
    /**
     * Store of translations.
     */
    locales: {
        'en': {
            /**
             * Simple translation example.
             */
            'cat': 'cat',
            /**
             * Plutal translation example.
             */
            '%s cats': {
                'one': '%s cat',
                'other': '%s cats'
            },
            /* ... */
        },
        'ru': {
            /**
             * Пример простого перевода.
             */
            'cat': 'кошка',
            /**
             * Пример перевода множественного числа.
             */
            '%s cats': {
                'one': '%s кошка',
                'few': '%s кошки',
                'many': '%s кошек',
                'other': '%s кошка'
            },
            /* ... */
        }
    },
    /**
	 * Cookie name to store locale.
	 */
    cookieName: 'yourcookiename'
});

console.log(__('cat')); // Uses global config.

/**
 * Create config fork with some overrides. 
 */
const i18nFork = i18n.fork({
    /**
	 * List of post processors.
	 */
    processors: [pluralIntervalProcessor]
});
/**
 * Bind new config to method.
 */
const __pi = i18nFork.bind(__n);

/**
 * Now you able to use plural intervals.
 */
console.log(
    __pi('[0] no dog|[2,5] some dogs|[6,11] many dogs|[12,36] dozens of dogs|a horde of %s dogs|[100,] too many dogs', 3) // Uses bound config.
);
```

</details>

### [__()](https://trigensoftware.github.io/i18n-for-browser/modules/_src_methods____.html#__)

Translates a single phrase and adds it to locales if unknown.

<details>
    <summary>Usage example</summary>

```js
/**
 * Basic usage 
 */
__('cat')
/**
 * As template string
 */
__`cat`
/**
 * Supports sprintf formatting
 */
__('%d cats', 3)
/**
 * Sprintf formatting with template string
 */
__`${3} cats`
/**
 * Sprintf formatting with few arguments
 */
__('%d cats with %s', 3, 'long tails')
/**
 * Mustache templates are supported with `mustacheProcessor`
 */
__('Hello {{name}}', { name: 'Marcus' })
/**
 * First argument as object with specified locale
 */
__({ phrase: 'Hello', locale: 'ru' })
```

</details>

### [__mf()](https://trigensoftware.github.io/i18n-for-browser/modules/_src_methods___mf_.html#__mf)

Supports the advanced MessageFormat as provided by excellent messageformat module. You should definetly head over to messageformat.github.io for a guide to MessageFormat. `i18n-for-browser` takes care of `new MessageFormat('en').compile(msg);` with the current msg loaded from it's json files and cache that complied fn in memory. So in short you might use it similar to `__()` plus extra object to accomblish MessageFormat's formating.

<details>
    <summary>Usage example</summary>

```js
/**
 * Basic usage, also works as raw `__` method
 */
__mf('cat')
/**
 * Basic replacement
 */
__mf('Hello {name}', { name: 'Marcus' })
/**
 * Also work with sprintf formatting
 */
__mf('Hello {name}, how was your %s?', 'test', { name: 'Marcus' })
```

</details>

### [__n()](https://trigensoftware.github.io/i18n-for-browser/modules/_src_methods___n_.html#__n)

Plurals translation of a single phrase. Singular and plural forms will get added to locales if unknown. Returns translated parsed and substituted string based on `count` parameter.

<details>
    <summary>Usage example</summary>

```js
/**
 * Basic usage
 */
__('%s cats', 2)
/**
 * As template string
 */
__`${3} cats`
/**
 * Can work without translation in config
 */
__('%d dog', '%d dogs', 3)
/**
 * First argument as object with specified locale
 */
__n({ singular: '%s cat', plural: '%s cats', locale: 'nl', count: 3 })
```

</details>

### [__m()](https://trigensoftware.github.io/i18n-for-browser/modules/_src_methods___m_.html#__m)

Returns a map of translations for a given phrase in each language.

<details>
    <summary>Usage example</summary>

```js
/**
 * Basic usage
 */
__m(__, 'Hello')
```

</details>

## Express middleware helper

To provide translations to client from your express app you can use this helper.

```js
import i18nExpressHelper from 'i18n-for-browser/lib/middleware';
// or 
const i18nExpressHelper = require('i18n-for-browser/lib/middleware');
// ...
// Before this `i18n` should already initialized.
app.use(i18nExpressHelper(i18nNodeConfig));
// ...
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
