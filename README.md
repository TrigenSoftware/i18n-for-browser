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
    I18nConfig,
    IConfig,
    ILocales,
    IFallbacks,
    IUnknownPhraseListener,
    IProcessor,
    IParams,
    IPluralParams,
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

### [i18n](https://trigensoftware.github.io/i18n-for-browser/modules/_index_.html#globalconfig)

Global config. Instanse of [`Config`](https://trigensoftware.github.io/i18n-for-browser/classes/_config_.config.html).

### [__()](https://trigensoftware.github.io/i18n-for-browser/modules/_index_.html#__)

Translates a single phrase and adds it to locales if unknown.

### [__mf()](https://trigensoftware.github.io/i18n-for-browser/modules/_index_.html#__mf)

Supports the advanced MessageFormat as provided by excellent messageformat module. You should definetly head over to messageformat.github.io for a guide to MessageFormat. `i18n-for-browser` takes care of `new MessageFormat('en').compile(msg);` with the current msg loaded from it's json files and cache that complied fn in memory. So in short you might use it similar to `__()` plus extra object to accomblish MessageFormat's formating.

### [__n()](https://trigensoftware.github.io/i18n-for-browser/modules/_index_.html#__n)

Plurals translation of a single phrase. Singular and plural forms will get added to locales if unknown. Returns translated parsed and substituted string based on `count` parameter.

### [__m()](https://trigensoftware.github.io/i18n-for-browser/modules/_index_.html#__m)

Returns a map of translations for a given phrase in each language.

## Usage example

```js
import i18n, {
    pluralIntervalProcessor,
    __,
    __n
} from 'i18n-for-browser';

i18n.configure({
    // store of translations
    locales: {
        'en': {/* ... */},
        'ru': {/* ... */}
    },
    // sets a custom cookie name to read/write locale  - defaults to NULL
    cookieName: 'yourcookiename',
});

console.log(__('cat'));
// or
console.log(__`cat`);

console.log(__n('one cat', '%d cats', 3));
// or
console.log(__n`${3} dogs`);

const i18nDe = i18n.fork({
    locales: {
        'de': {/* ... */}
    }
});
const __de = i18nDe.bind(__);

console.log(__de`Hello`);

const i18nPi = i18n.fork({
    processors: [pluralIntervalProcessor]
});
const __pi = i18nPi.bind(__n);

console.log(__pi('[0] no dog|[2,5] some dogs|[6,11] many dogs|[12,36] dozens of dogs|a horde of %s dogs|[100,] too many dogs', 3));
```

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
