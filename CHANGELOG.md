# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

<!--

DO NOT TOUCH. SAVE IT ON TOP.

## [semver] - date
### Added
- ...

### Changed
- ...

### Fixed
- ...

### Removed
- ...

-->

## [2.1.0] - 2020-05-22
### Changed
- Dependencies update.

## [2.0.0] - 2020-03-18
### Added
- Babel module.

### Removed
- Drop Node 8 support.

## [1.1.0] - 2019-06-09
### Added
- `trigen-scripts` dev tool.

### Changed
- Dependencies update.

## [1.0.1] - 2018-11-20
### Fixed
- Template literal tag typings fix.

## [1.0.0] - 2018-11-15
### Added
- `size-limit`
- [Greenkeeper](https://greenkeeper.io/)
- `__m` instead of `__l` and `__h`.
- `unknownPhraseListener`

### Changed
- Rewritten to TypeScript.
- Improvements for tree-shaking: `__`, `__n`, `__mf` and `__m` now are importable functions; Mustaches and plural intervals moved to pluggable postprocessor-functions.  
- Tests and code coverage with `jest`.
- `cookie` option -> `cookieName`.
- `objectNotation` option now is `boolean`, `.` is constant separator.

### Fixed
- `parsePluralInterval`

### Removed
- `__l` and `__h`.
- `localeChangeListener`
- Getting `count` for plurals from named values.
- `globalize` option.

## [0.9.7] - 2017-11-08
### Added
- Code coverage with `nyc`.
- Integration with [Coveralls](https://coveralls.io).

### Changed
- `"browser"` property in `package.json` renamed to `"umd"` due to webpack uses `"browser"` first.
- Link to UMD bundle on [unpkg.com](https://unpkg.com) changed.

### Fixed
- UMD bundle fixed.
