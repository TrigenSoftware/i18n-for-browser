import i18n, {
	mustacheProcessor,
	pluralIntervalProcessor,
	__,
	__mf,
	__n,
	__m
} from '../src';
import enLocales from './locales/en.json';
import deLocales from './locales/de.json';
import frLocales from './locales/fr.json';
import ruLocales from './locales/ru.json';

const CONFIG = {
	locales:    {
		en: enLocales,
		de: deLocales,
		fr: frLocales,
		ru: ruLocales
	},
	fallbacks:  { 'nl': 'de' },
	processors: [
		mustacheProcessor,
		pluralIntervalProcessor
	]
};

describe('API', () => {

	beforeEach(() => {
		i18n.configure({
			...CONFIG,
			objectNotation: false
		});
	});

	describe('__()', () => {

		it('should return en translations as expected', () => {
			i18n.setLocale('en');
			expect(__('Hello')).toBe('Hello');
			expect(__('Hello %s, how are you today?', 'Marcus')).toBe('Hello Marcus, how are you today?');
			expect(
				__('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend'))
			).toBe('Hello Marcus, how are you today? How was your weekend.');
		});

		it('should return en translations as expected, using mustached messages', () => {
			i18n.setLocale('en');
			expect(__('Hello {{name}}', { name: 'Marcus' })).toBe('Hello Marcus');
			expect(
				__('Hello {{name}}, how was your %s?', __('weekend'), { name: 'Marcus' })
			).toBe('Hello Marcus, how was your weekend?');
		});

		it('should return de translations as expected', () => {
			i18n.setLocale('de');
			expect(__('Hello')).toBe('Hallo');
			expect(__('Hello %s, how are you today?', 'Marcus')).toBe('Hallo Marcus, wie geht es dir heute?');
			expect(
				__('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend'))
			).toBe('Hallo Marcus, wie geht es dir heute? Wie war dein Wochenende.');
		});

		it('should return de translations as expected, using mustached messages', () => {
			i18n.setLocale('de');
			// named only
			expect(__('Hello {{name}}', { name: 'Marcus' })).toBe('Hallo Marcus');
			// named + sprintf
			expect(
				__('Hello {{name}}, how was your %s?', __('weekend'), { name: 'Marcus' })
			).toBe('Hallo Marcus, wie war dein Wochenende?');
			// nested
			expect(
				__(__('Hello {{name}}, how was your %s?', { name: 'Marcus' }), __('weekend'))
			).toBe('Hallo Marcus, wie war dein Wochenende?');
		});

		it('should correct switch languages', () => {
			i18n.setLocale('en');
			expect(__('Hello')).toBe('Hello');
			i18n.setLocale('de');
			expect(__('Hello')).toBe('Hallo');
		});

		it('should test the ordering in sprintf', () => {
			i18n.setLocale('en');
			expect(__('ordered arguments', 'First', 'Second')).toBe('Second then First');
			i18n.setLocale('de');
			expect(__('ordered arguments', 'First', 'Second')).toBe('First then Second');
		});

		it('should test more complex sprintf examples', () => {
			i18n.setLocale('en');
			expect(__('ordered arguments with numbers', 'First', 2, 123.456)).toBe('2 then First then 123.46');
			i18n.setLocale('de');
			expect(__('ordered arguments with numbers', 'First', 2, 123.456)).toBe('First then 2 then 123.46');
		});

		it('should allow for repeated references to the same argument.', () => {
			i18n.setLocale('en');
			expect(__('repeated argument', 'repeated')).toBe('repeated, repeated, repeated');
		});

		it('should also return translations when iterating thru variables values', () => {

			const greetings = ['Hi', 'Hello', 'Howdy'];
			const greetingsDE = ['Hi', 'Hallo', 'Hallöchen'];
			let i = 0;

			i18n.setLocale('en');
			for (i = 0; i < greetings.length; i++) {
				expect(greetings[i]).toBe(__(greetings[i]));
			}

			i18n.setLocale('de');
			for (i = 0; i < greetings.length; i++) {
				expect(greetingsDE[i]).toBe(__(greetings[i]));
			}
		});

		it('should be possible to use an json object as 1st parameter to specifiy a certain locale for that lookup', () => {

			expect(__({
				phrase: 'Hello',
				locale: 'en'
			})).toBe('Hello');

			expect(__({
				phrase: 'Hello',
				locale: 'de'
			})).toBe('Hallo');

			// passing specific locale
			expect(__({ phrase: 'Hello', locale: 'de' })).toBe('Hallo');
			expect(__({ phrase: 'Hello %s', locale: 'de' }, 'Marcus')).toBe('Hallo Marcus');
			expect(__({ phrase: 'Hello {{name}}', locale: 'de' }, { name: 'Marcus' })).toBe('Hallo Marcus');

			expect(__({ phrase: 'Hello', locale: 'en' })).toBe('Hello');
			expect(__({ phrase: 'Hello %s', locale: 'en' }, 'Marcus')).toBe('Hello Marcus');
			expect(__({ phrase: 'Hello {{name}}', locale: 'en' }, { name: 'Marcus' })).toBe('Hello Marcus');

			expect(__({ phrase: 'Hello', locale: 'nl' })).toBe('Hallo');
			expect(__({ phrase: 'Hello %s', locale: 'nl' }, 'Marcus')).toBe('Hallo Marcus');
			expect(__({ phrase: 'Hello {{name}}', locale: 'nl' }, { name: 'Marcus' })).toBe('Hallo Marcus');
		});

		it('should work as template literal tag', () => {
			i18n.setLocale('en');
			expect(__`Hello`).toBe('Hello');
			expect(
				__`Hello ${'guest'}, how are you today? How was your ${'day'}.`
			).toBe('Hello guest, how are you today? How was your day.');
		});

		describe('objectNotation', () => {

			beforeEach(() => {
				i18n.configure({
					...CONFIG,
					objectNotation: true
				});

				const catalog = i18n.getCatalog('en');

				Reflect.deleteProperty(catalog.nested as object, 'path');
			});

			it('should return translations as expected, using object traversal notation', () => {

				i18n.setLocale('en');

				expect(__('format.date')).toBe('MM/DD/YYYY');
				expect(__('format.time')).toBe('h:mm:ss a');

				expect(__('greeting.formal')).toBe('Hello');
				expect(__('greeting.informal')).toBe('Hi');
				expect(__('greeting.placeholder.formal', 'Marcus')).toBe('Hello Marcus');
				expect(__('greeting.placeholder.informal', 'Marcus')).toBe('Hi Marcus');
				expect(__('greeting.placeholder.loud', 'Marcus')).toBe('greeting.placeholder.loud');

				i18n.setLocale('de');

				expect(__('format.date')).toBe('DD.MM.YYYY');
				expect(__('format.time')).toBe('hh:mm:ss');
			});

			it('should return translations as expected, when dot is first or last character', () => {
				i18n.setLocale('en');
				expect(__('. is first character')).toBe('Dot is first character');
				expect(__('last character is .')).toBe('last character is Dot');
				expect(__('few sentences. with .')).toBe('few sentences with Dot');
			});

			it('should correctly mutate locales', () => {
				i18n.setLocale('en');
				expect(__('nested.path')).toBe('nested.path');
				expect(__('nested.path.sub:value')).toBe('value');
				expect(__('nested.path.sub')).toBe('value');
				expect(__('nested.path')).toBe('nested.path');
			});
		});
	});

	describe('__n()', () => {

		it('should return singular or plural form based on last parameter', () => {

			i18n.setLocale('en');

			let singular = __n('%s cat', '%s cats', 1);
			let plural = __n('%s cat', '%s cats', 3);

			expect(singular).toBe('1 cat');
			expect(plural).toBe('3 cats');

			i18n.setLocale('de');
			singular = __n('%s cat', '%s cats', 1);
			plural = __n('%s cat', '%s cats', 3);

			expect(singular).toBe('1 Katze');
			expect(plural).toBe('3 Katzen');
		});

		it('should correctly handle float numbers', () => {

			i18n.setLocale('en');

			expect(__n('%s dollar', 1)).toBe('1 dollar');
			expect(__n('%s dollar', 2.5)).toBe('2.5 dollars');
		});

		it('should return substituted phrases when used nested', () => {

			i18n.setLocale('en');

			let singular = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, __('tree'));
			let plural = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, __('tree'));

			expect(singular).toBe('There is one monkey in the tree');
			expect(plural).toBe('There are 3 monkeys in the tree');

			i18n.setLocale('de');
			singular = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, __('tree'));
			plural = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, __('tree'));

			expect(singular).toBe('Im Baum sitzt ein Affe');
			expect(plural).toBe('Im Baum sitzen 3 Affen');
		});

		it('won\'t return substitutions when not masked by an extra %', () => {

			i18n.setLocale('en');

			let singular = __n('There is one monkey in the %s', 'There are %d monkeys in the %s', 1, __('tree'));
			let plural = __n('There is one monkey in the %s', 'There are %d monkeys in the %s', 3, __('tree'));

			expect(singular).toBe('There is one monkey in the 1');
			expect(plural).toBe('There are 3 monkeys in the undefined');

			i18n.setLocale('de');
			singular = __n('There is one monkey in the %s', 'There are %d monkeys in the %s', 1, __('tree'));
			plural = __n('There is one monkey in the %s', 'There are %d monkeys in the %s', 3, __('tree'));

			expect(singular).toBe('There is one monkey in the 1');
			expect(plural).toBe('There are 3 monkeys in the undefined');
		});

		it('should be possible to use an json object as 1st parameter to specifiy a certain locale for that lookup', () => {

			let singular = '';
			let plural = '';

			i18n.setLocale('en');
			singular = __n({ singular: '%s cat', plural: '%s cats', locale: 'nl' }, 1);
			plural = __n({ singular: '%s cat', plural: '%s cats', locale: 'nl' }, 3);

			expect(singular).toBe('1 Katze');
			expect(plural).toBe('3 Katzen');

			singular = __n({ singular: '%s cat', plural: '%s cats', locale: 'en' }, 1);
			plural = __n({ singular: '%s cat', plural: '%s cats', locale: 'en' }, 3);

			expect(singular).toBe('1 cat');
			expect(plural).toBe('3 cats');

			singular = __n({ singular: '%s cat', plural: '%s cats', locale: 'de' }, 1);
			plural = __n({ singular: '%s cat', plural: '%s cats', locale: 'de' }, 3);

			expect(singular).toBe('1 Katze');
			expect(plural).toBe('3 Katzen');

			i18n.setLocale('en');
			singular = __n({ singular: '%s cat', plural: '%s cats', locale: 'nl', count: 1 });
			plural = __n({ singular: '%s cat', plural: '%s cats', locale: 'nl', count: 3 });

			expect(singular).toBe('1 Katze');
			expect(plural).toBe('3 Katzen');

			singular = __n({ singular: '%s cat', plural: '%s cats', locale: 'en', count: 1 });
			plural = __n({ singular: '%s cat', plural: '%s cats', locale: 'en', count: 3 });

			expect(singular).toBe('1 cat');
			expect(plural).toBe('3 cats');

			singular = __n({ singular: '%s cat', plural: '%s cats', locale: 'de', count: 1 });
			plural = __n({ singular: '%s cat', plural: '%s cats', locale: 'de', count: 3 });

			expect(singular).toBe('1 Katze');
			expect(plural).toBe('3 Katzen');

			i18n.setLocale('en');
			singular = __n({ singular: '%s cat', plural: '%s cats', locale: 'nl', count: '1' });
			plural = __n({ singular: '%s cat', plural: '%s cats', locale: 'nl', count: '3' });

			expect(singular).toBe('1 Katze');
			expect(plural).toBe('3 Katzen');

			singular = __n({ singular: '%s cat', plural: '%s cats', locale: 'en', count: '1' });
			plural = __n({ singular: '%s cat', plural: '%s cats', locale: 'en', count: '3' });

			expect(singular).toBe('1 cat');
			expect(plural).toBe('3 cats');

			singular = __n({ singular: '%s cat', plural: '%s cats', locale: 'de', count: '1' });
			plural = __n({ singular: '%s cat', plural: '%s cats', locale: 'de', count: '3' });

			expect(singular).toBe('1 Katze');
			expect(plural).toBe('3 Katzen');
		});

		it('should allow two arguments', () => {

			const singular = __n('cat', 1);
			const plural = __n('cat', 3);

			expect(singular).toBe('1 cat');
			expect(plural).toBe('3 cats');
		});

		it('should return correctly in russian', () => {
			i18n.setLocale('ru');
			expect(__n('%s cat', 0)).toBe('0 кошек');
			expect(__n('%s cat', 1)).toBe('1 кошка');
			expect(__n('%s cat', 2)).toBe('2 кошки');
			expect(__n('%s cat', 5)).toBe('5 кошек');
			expect(__n('%s cat', 6)).toBe('6 кошек');
			expect(__n('%s cat', 21)).toBe('21 кошка');
		});

		it('should correctly handle plural intervals', () => {
			i18n.setLocale('en');
			expect(__n('dogs', 0)).toBe('no dog');
			expect(__n('dogs', 1)).toBe('one dog');
			expect(__n('dogs', 2)).toBe('some dogs');
			expect(__n('dogs', 10)).toBe('many dogs');
			expect(__n('dogs', 25)).toBe('dozens of dogs');
			expect(__n('dogs', 42)).toBe('a horde of 42 dogs');
			expect(__n('dogs', 199)).toBe('too many dogs');
		});

		it('should correct mutate catalog', () => {

			i18n.setLocale('en');

			expect(__n('one doggo', '%d doggos', 2)).toBe('2 doggos');
			expect(__n({
				singular: 'one catto',
				plural:   '%d cattos',
				count:    2
			})).toBe('2 cattos');

			expect(__n('one doggo', 2)).toBe('2 doggos');
			expect(__n('one catto', 2)).toBe('2 cattos');

			const catalog = i18n.getCatalog('en');

			expect(catalog['one doggo']).toEqual({
				one:   'one doggo',
				other: '%d doggos'
			});
			expect(catalog['one catto']).toEqual({
				one:   'one catto',
				other: '%d cattos'
			});
		});

		it('should work as template literal tag', () => {
			i18n.setLocale('en');
			expect(__n`${2} cat`).toBe('2 cats');
			expect(__n`counts ${2} ${'cat'}`).toBe('2 cats');
		});

		describe('objectNotation', () => {

			beforeEach(() => {
				i18n.configure({
					...CONFIG,
					objectNotation: true
				});
			});

			it('should provide proper pluralization support, using object traversal notation', () => {

				i18n.setLocale('en');

				expect(
					__n({ singular: 'cat', plural: 'cat', locale: 'de' }, 1)
				).toBe('1 Katze');
				expect(
					__n({ singular: 'cat', plural: 'cat', locale: 'de' }, 3)
				).toBe('3 Katzen');
			});

			it('should allow for simple pluralization', () => {

				i18n.setLocale('en');

				expect(
					__n('nested.deep.plural', 1)
				).toBe('plural');
				expect(
					__n('nested.deep.plural', 3)
				).toBe('plurals');
			});

			it('should correct mutate catalog', () => {

				i18n.setLocale('en');

				expect(__n('doggo:one doggo', 'doggo:%d doggos', 2)).toBe('2 doggos');
				expect(__n({
					singular: 'catto:one catto',
					plural:   'catto:%d cattos',
					count:    2
				})).toBe('2 cattos');

				expect(__n('doggo', 2)).toBe('2 doggos');
				expect(__n('catto', 2)).toBe('2 cattos');

				const catalog = i18n.getCatalog('en');

				expect(catalog.doggo).toEqual({
					one:   'one doggo',
					other: '%d doggos'
				});
				expect(catalog.catto).toEqual({
					one:   'one catto',
					other: '%d cattos'
				});
			});
		});
	});

	describe('__mf()', () => {

		it('should work with simple strings', () => {

			i18n.setLocale('en');
			expect('Hello').toBe(__mf('Hello'));

			i18n.setLocale('de');
			expect(__mf('Hello')).toBe('Hallo');
			expect(__mf('Hello %s, how are you today?', 'Marcus')).toBe('Hallo Marcus, wie geht es dir heute?');
			expect(__mf({ phrase: 'Hello', locale: 'en' })).toBe('Hello');
		});

		it('should work with basic replacements', () => {

			i18n.setLocale('en');
			expect(__mf('Hello {name}', { name: 'Marcus' })).toBe('Hello Marcus');

			i18n.setLocale('de');
			expect(__mf('Hello {name}', { name: 'Marcus' })).toBe('Hallo Marcus');
			expect(__mf('Hello {name}, how was your %s?', 'test', { name: 'Marcus' })).toBe('Hallo Marcus, wie war dein test?');
		});

		it('should work with plurals', () => {

			let msg = 'In {lang} there {NUM, plural,';
			msg += 'one{is one for #}';
			msg += 'other{others for #}}';

			i18n.setLocale('en');
			expect(__mf(msg, { NUM: 0, lang: 'english' })).toBe('In english there others for 0');
			expect(__mf(msg, { NUM: 1, lang: 'english' })).toBe('In english there is one for 1');
			expect(__mf(msg, { NUM: 2, lang: 'english' })).toBe('In english there others for 2');
			expect(__mf(msg, { NUM: 3, lang: 'english' })).toBe('In english there others for 3');
			expect(__mf(msg, { NUM: 4, lang: 'english' })).toBe('In english there others for 4');
			expect(__mf(msg, { NUM: 5, lang: 'english' })).toBe('In english there others for 5');
			expect(__mf(msg, { NUM: 6, lang: 'english' })).toBe('In english there others for 6');

			msg = 'In {lang} there {NUM, plural,';
			msg += 'one{is one for #}';
			msg += 'other{others for #}}';

			i18n.setLocale('de');
			expect(__mf(msg, { NUM: 0, lang: 'german' })).toBe('In german there others for 0');
			expect(__mf(msg, { NUM: 1, lang: 'german' })).toBe('In german there is one for 1');
			expect(__mf(msg, { NUM: 2, lang: 'german' })).toBe('In german there others for 2');
			expect(__mf(msg, { NUM: 3, lang: 'german' })).toBe('In german there others for 3');
			expect(__mf(msg, { NUM: 4, lang: 'german' })).toBe('In german there others for 4');
			expect(__mf(msg, { NUM: 5, lang: 'german' })).toBe('In german there others for 5');
			expect(__mf(msg, { NUM: 6, lang: 'german' })).toBe('In german there others for 6');

			msg = 'In {lang} there {NUM, plural,';
			msg += 'one{is one for #}';
			msg += 'other{others for #}}';

			i18n.setLocale('fr');
			expect(__mf(msg, { NUM: 0, lang: 'french' })).toBe('In french there is one for 0');
			expect(__mf(msg, { NUM: 1, lang: 'french' })).toBe('In french there is one for 1');
			expect(__mf(msg, { NUM: 2, lang: 'french' })).toBe('In french there others for 2');
			expect(__mf(msg, { NUM: 3, lang: 'french' })).toBe('In french there others for 3');
			expect(__mf(msg, { NUM: 4, lang: 'french' })).toBe('In french there others for 4');
			expect(__mf(msg, { NUM: 5, lang: 'french' })).toBe('In french there others for 5');
			expect(__mf(msg, { NUM: 6, lang: 'french' })).toBe('In french there others for 6');

			msg = 'In {lang} there {NUM, plural,';
			msg += 'one{is one for #}';
			msg += 'few{are a few for #}';
			msg += 'many{are many for #}';
			msg += 'other{others for #}}';

			i18n.setLocale('ru');
			expect(__mf(msg, { NUM: 0, lang: 'russian' })).toBe('In russian there are many for 0');
			expect(__mf(msg, { NUM: 1, lang: 'russian' })).toBe('In russian there is one for 1');
			expect(__mf(msg, { NUM: 2, lang: 'russian' })).toBe('In russian there are a few for 2');
			expect(__mf(msg, { NUM: 3, lang: 'russian' })).toBe('In russian there are a few for 3');
			expect(__mf(msg, { NUM: 4, lang: 'russian' })).toBe('In russian there are a few for 4');
			expect(__mf(msg, { NUM: 5, lang: 'russian' })).toBe('In russian there are many for 5');
			expect(__mf(msg, { NUM: 6, lang: 'russian' })).toBe('In russian there are many for 6');
			expect(__mf(msg, { NUM: 21, lang: 'russian' })).toBe('In russian there is one for 21');
		});
	});

	describe('__m()', () => {

		it('should return a map of translations', () => {

			const translations = {
				de: 'Hallo',
				en: 'Hello',
				fr: 'Bonjour',
				ru: 'Привет'
			};

			i18n.setLocale('en');
			expect(__m('Hello')).toEqual(translations);
			expect(__m('Hello')).toEqual(translations);

			i18n.setLocale('fr');
			expect(__m('Hello')).toEqual(translations);
			expect(__m('Hello')).toEqual(translations);
		});
	});
});
