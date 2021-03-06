import i18n, {
	__,
	__n
} from '../src';
import enLocales from './locales/en.json';
import deLocales from './locales/de.json';
import frLocales from './locales/fr.json';
import ruLocales from './locales/ru.json';

const CONFIG = {
	defaultLocale: 'en',
	locales:       {
		en: enLocales,
		de: deLocales,
		fr: frLocales,
		ru: ruLocales
	},
	fallbacks:     { 'nl': 'de' }
};

describe('Config', () => {
	beforeEach(() => {
		i18n.configure(CONFIG);
	});

	describe('#configure()', () => {
		it('should set fallback locale', () => {
			i18n.configure({
				...CONFIG,
				defaultLocale: 'nl'
			});
			expect(i18n.getLocale()).toBe('de');
		});
	});

	describe('#setLocale() and #getLocale()', () => {
		it('getLocale should return default setting', () => {
			expect(i18n.getLocale()).toBe('en');
		});

		it('getLocale should return the new setting', () => {
			i18n.setLocale('de');
			expect(i18n.getLocale()).toBe('de');
		});

		it('setLocale should return a fallback value', () => {
			i18n.setLocale('nl');
			expect(i18n.getLocale()).toBe('de');
		});
	});

	describe('#getCatalog()', () => {
		it('should return all catalogs when invoked with empty parameters', () => {
			const catalogs = i18n.getCatalog();

			expect(catalogs).toHaveProperty('en');
			expect(catalogs.en).toHaveProperty('Hello', 'Hello');
			expect(catalogs).toHaveProperty('de');
			expect(catalogs.de).toHaveProperty('Hello', 'Hallo');
		});

		it('should return just the DE catalog when invoked with "de" as parameter', () => {
			expect(i18n.getCatalog('en')).toHaveProperty('Hello', 'Hello');
		});

		it('should return just the EN catalog when invoked with "en" as parameter', () => {
			expect(i18n.getCatalog('de')).toHaveProperty('Hello', 'Hallo');
		});

		it('should return just the DE catalog when invoked with a (fallback) "nl" as parameter', () => {
			expect(i18n.getCatalog('nl')).toHaveProperty('Hello', 'Hallo');
		});

		it('should return null when invoked with unsupported locale as parameter', () => {
			expect(i18n.getCatalog('oO')).toBe(null);
		});
	});

	describe('#fork()', () => {
		it('should create correct fork', () => {
			const nlI18n = i18n.fork({
				fallbacks: { 'nl': 'en' }
			});

			i18n.setLocale('ru');

			expect(nlI18n.getLocale()).toBe('ru');
			expect(i18n.getLocale()).toBe('ru');
		});

		it('should unlink fields from fork by config', () => {
			const nlI18n = i18n.fork({
				defaultLocale: 'nl',
				fallbacks:     { 'nl': 'en' }
			});

			i18n.setLocale('ru');

			expect(nlI18n.getLocale()).toBe('en');
			expect(i18n.getLocale()).toBe('ru');

			const fn = jest.fn();

			i18n.onUnknownPhrase(fn);

			expect(nlI18n.unknownPhraseListener).toBe(fn);
			expect(i18n.unknownPhraseListener).toBe(fn);
		});

		it('should unlink fields from fork by methods', () => {
			const nlI18n = i18n.fork({
				fallbacks: { 'nl': 'en' }
			});

			i18n.setLocale('nl');

			expect(nlI18n.getLocale()).toBe('en');
			expect(i18n.getLocale()).toBe('de');

			nlI18n.setLocale('ru');

			expect(nlI18n.getLocale()).toBe('ru');
			expect(i18n.getLocale()).toBe('de');

			const fn = jest.fn();
			const fn2 = jest.fn();

			i18n.onUnknownPhrase(fn);

			expect(nlI18n.unknownPhraseListener).toBe(fn);
			expect(i18n.unknownPhraseListener).toBe(fn);

			nlI18n.onUnknownPhrase(fn2);

			expect(nlI18n.unknownPhraseListener).toBe(fn2);
			expect(i18n.unknownPhraseListener).toBe(fn);
		});

		it('should create correct hard fork', () => {
			const nlI18n = i18n.fork({
				defaultLocale: 'nl',
				fallbacks:     { 'nl': 'en' },
				objectNotation: true
			}, true);

			i18n.setLocale('ru');

			expect(nlI18n.getLocale()).toBe('en');
			expect(i18n.getLocale()).toBe('ru');
		});
	});

	describe('#bind()', () => {
		it('should correct bind config to translate function', () => {
			const nlI18n = i18n.fork({
				defaultLocale: 'nl'
			});

			i18n.setLocale('ru');

			const __nl = nlI18n.bind(__);

			expect(__nl('Hello')).toBe('Hallo');
			expect(__('Hello')).toBe('Привет');
		});

		it('should correct bind config to translate function', () => {
			const [
				__nl,
				__nln
			] = i18n.fork({
				defaultLocale: 'nl'
			}).bind([__, __n]);

			i18n.setLocale('fr');

			expect(__nl('Hello')).toBe('Hallo');
			expect(__nln('%s cat', 2)).toBe('2 Katzen');
			expect(__('Hello')).toBe('Bonjour');
		});
	});

	describe('#onUnknownPhrase()', () => {
		it('should call handler on unknown phrase', () => {
			const fn = jest.fn();

			i18n.setLocale('en');
			i18n.onUnknownPhrase(fn);

			expect(__('unknown')).toBe('unknown');
			expect(__n('one doggo', '%d doggos', 2)).toBe('2 doggos');
			expect(__n({
				singular: 'one catto',
				plural:   '%d cattos',
				count:    2
			})).toBe('2 cattos');

			expect(fn.mock.calls).toEqual([
				['en', 'unknown', 'unknown'],
				['en', 'one doggo', {
					'one':   'one doggo',
					'other': '%d doggos'
				}],
				['en', 'one catto', {
					'one':   'one catto',
					'other': '%d cattos'
				}]
			]);
		});
	});
});
