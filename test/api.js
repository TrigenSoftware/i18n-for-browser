import * as i18n from '../src';
import should from 'should';

describe('Module API', () => {

	beforeEach(() => {
		i18n.configure({
			locales:   {
				en: require('./locales/en.json'),
				de: require('./locales/de.json'),
				fr: require('./locales/fr.json'),
				ru: require('./locales/ru.json')
			},
			fallbacks: { 'nl': 'de' },
			globalize: true
		});
	});

	describe('setLocale() and getLocale()', () => {

		it('getLocale should return default setting', () => {
			i18n.getLocale().should.equal('en');
		});

		it('setLocale should return the new setting', () => {
			i18n.setLocale('de').should.equal('de');
		});

		it('getLocale should return the new setting', () => {
			i18n.setLocale('de');
			i18n.getLocale().should.equal('de');
		});

		it('setLocale should return a fallback value', () => {
			i18n.setLocale('en');
			i18n.setLocale('nl').should.equal('de');
		});
	});

	describe('getCatalog()', () => {

		it('should return all catalogs when invoked with empty parameters', () => {

			const catalogs = i18n.getCatalog();

			catalogs.should.have.property('en');
			catalogs.en.should.have.property('Hello', 'Hello');
			catalogs.should.have.property('de');
			catalogs.de.should.have.property('Hello', 'Hallo');
		});

		it('should return just the DE catalog when invoked with "de" as parameter', () => {
			i18n.getCatalog('en').should.have.property('Hello', 'Hello');
		});

		it('should return just the EN catalog when invoked with "en" as parameter', () => {
			i18n.getCatalog('de').should.have.property('Hello', 'Hallo');
		});

		it('should return just the DE catalog when invoked with a (fallback) "nl" as parameter', () => {
			i18n.getCatalog('nl').should.have.property('Hello', 'Hallo');
		});

		it('should return false when invoked with unsupported locale as parameter', () => {
			i18n.getCatalog('oO').should.equal(false);
		});
	});

	describe('__()', () => {

		it('should return en translations as expected', () => {
			i18n.setLocale('en');
			should.equal(__('Hello'), 'Hello');
			should.equal(__('Hello %s, how are you today?', 'Marcus'), 'Hello Marcus, how are you today?');
			should.equal(__('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend')), 'Hello Marcus, how are you today? How was your weekend.');
		});

		it('should return en translations as expected, using mustached messages', () => {
			i18n.setLocale('en');
			should.equal(__('Hello {{name}}', { name: 'Marcus' }), 'Hello Marcus');
			should.equal(__('Hello {{name}}, how was your %s?', __('weekend'), { name: 'Marcus' }), 'Hello Marcus, how was your weekend?');
		});

		it('should return de translations as expected', () => {
			i18n.setLocale('de');
			should.equal(__('Hello'), 'Hallo');
			should.equal(__('Hello %s, how are you today?', 'Marcus'), 'Hallo Marcus, wie geht es dir heute?');
			should.equal(__('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend')), 'Hallo Marcus, wie geht es dir heute? Wie war dein Wochenende.');
		});

		it('should return de translations as expected, using mustached messages', () => {
			i18n.setLocale('de');
			// named only
			should.equal(__('Hello {{name}}', { name: 'Marcus' }), 'Hallo Marcus');
			// named + sprintf
			should.equal(__('Hello {{name}}, how was your %s?', __('weekend'), { name: 'Marcus' }), 'Hallo Marcus, wie war dein Wochenende?');
			// nested
			should.equal(__(__('Hello {{name}}, how was your %s?', { name: 'Marcus' }), __('weekend')), 'Hallo Marcus, wie war dein Wochenende?');
		});

		it('simple translation should work on global', () => {
			i18n.setLocale('en');
			should.equal(__('Hello'), 'Hello');
			i18n.setLocale('de');
			should.equal(__('Hello'), 'Hallo');
		});

		it('should test the ordering in sprintf', () => {
			i18n.setLocale('en');
			should.equal(__('ordered arguments', 'First', 'Second'), 'Second then First');
			i18n.setLocale('de');
			should.equal(__('ordered arguments', 'First', 'Second'), 'First then Second');
		});

		it('should test more complex sprintf examples', () => {
			i18n.setLocale('en');
			should.equal(__('ordered arguments with numbers', 'First', 2, 123.456), '2 then First then 123.46');
			i18n.setLocale('de');
			should.equal(__('ordered arguments with numbers', 'First', 2, 123.456), 'First then 2 then 123.46');
		});

		it('should allow for repeated references to the same argument.', () => {
			i18n.setLocale('en');
			should.equal(__('repeated argument', 'repeated'), 'repeated, repeated, repeated');
		});

		it('should also return translations when iterating thru variables values', () => {

			const greetings = ['Hi', 'Hello', 'Howdy'],
				greetingsDE = ['Hi', 'Hallo', 'Hallöchen'];

			let i = 0;

			i18n.setLocale('en');
			for (i = 0; i < greetings.length; i++) {
				should.equal(greetings[i], __(greetings[i]));
			}

			i18n.setLocale('de');
			for (i = 0; i < greetings.length; i++) {
				should.equal(greetingsDE[i], __(greetings[i]));
			}
		});

		it('should be possible to use an json object as 1st parameter to specifiy a certain locale for that lookup', () => {

			should.equal(__({
				phrase: 'Hello',
				locale: 'en'
			}), 'Hello');

			should.equal(__({
				phrase: 'Hello',
				locale: 'de'
			}), 'Hallo');

			should.equal(__({
				locale: 'en',
				phrase: 'Hello'
			}), 'Hello');

			should.equal(__({
				locale: 'de',
				phrase: 'Hello'
			}), 'Hallo');

			// passing specific locale
			should.equal(__({ phrase: 'Hello', locale: 'de' }), 'Hallo');
			should.equal(__({ phrase: 'Hello %s', locale: 'de' }, 'Marcus'), 'Hallo Marcus');
			should.equal(__({ phrase: 'Hello {{name}}', locale: 'de' }, { name: 'Marcus' }), 'Hallo Marcus');

			should.equal(__({ phrase: 'Hello', locale: 'en' }), 'Hello');
			should.equal(__({ phrase: 'Hello %s', locale: 'en' }, 'Marcus'), 'Hello Marcus');
			should.equal(__({ phrase: 'Hello {{name}}', locale: 'en' }, { name: 'Marcus' }), 'Hello Marcus');

			should.equal(__({ phrase: 'Hello', locale: 'nl' }), 'Hallo');
			should.equal(__({ phrase: 'Hello %s', locale: 'nl' }, 'Marcus'), 'Hallo Marcus');
			should.equal(__({ phrase: 'Hello {{name}}', locale: 'nl' }, { name: 'Marcus' }), 'Hallo Marcus');

			i18n.setLocale('en');
			should.equal(__('Hello'), 'Hello');
			i18n.setLocale('de');
			should.equal(__('Hello'), 'Hallo');
			// Reset so `de` fallback can be tested again
			i18n.setLocale('en');

			i18n.setLocale('nl');
			should.equal(__('Hello'), 'Hallo');
		});
	});

	describe('__n()', () => {

		it('should return singular or plural form based on last parameter', () => {

			i18n.setLocale('en');

			let singular = __n('%s cat', '%s cats', 1),
				plural   = __n('%s cat', '%s cats', 3);

			should.equal(singular, '1 cat');
			should.equal(plural, '3 cats');

			i18n.setLocale('de');
			singular = __n('%s cat', '%s cats', 1);
			plural = __n('%s cat', '%s cats', 3);
			should.equal(singular, '1 Katze');
			should.equal(plural, '3 Katzen');
		});

		it('should return substituted phrases when used nested', () => {

			i18n.setLocale('en');

			let singular = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, __('tree')),
				plural   = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, __('tree'));

			should.equal(singular, 'There is one monkey in the tree');
			should.equal(plural, 'There are 3 monkeys in the tree');

			i18n.setLocale('de');
			singular = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, __('tree'));
			plural = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, __('tree'));
			should.equal(singular, 'Im Baum sitzt ein Affe');
			should.equal(plural, 'Im Baum sitzen 3 Affen');
		});

		it('won\'t return substitutions when not masked by an extra % (%% issue #49)', () => {

			i18n.setLocale('en');

			let singular = __n('There is one monkey in the %s', 'There are %d monkeys in the %s', 1, __('tree')),
				plural   = __n('There is one monkey in the %s', 'There are %d monkeys in the %s', 3, __('tree'));

			should.equal(singular, 'There is one monkey in the 1');
			should.equal(plural, 'There are 3 monkeys in the undefined');

			i18n.setLocale('de');
			singular = __n('There is one monkey in the %s', 'There are %d monkeys in the %s', 1, __('tree'));
			plural = __n('There is one monkey in the %s', 'There are %d monkeys in the %s', 3, __('tree'));
			should.equal(singular, 'There is one monkey in the 1');
			should.equal(plural, 'There are 3 monkeys in the undefined');
		});

		it('should be possible to use an json object as 1st parameter to specifiy a certain locale for that lookup', () => {

			let singular = '',
				plural   = '';

			i18n.setLocale('en');
			singular = __n({ singular: '%s cat', plural: '%s cats', locale: 'nl' }, 1);
			plural = __n({ singular: '%s cat', plural: '%s cats', locale: 'nl' }, 3);
			should.equal(singular, '1 Katze');
			should.equal(plural, '3 Katzen');

			singular = __n({ singular: '%s cat', plural: '%s cats', locale: 'en' }, 1);
			plural = __n({ singular: '%s cat', plural: '%s cats', locale: 'en' }, 3);
			should.equal(singular, '1 cat');
			should.equal(plural, '3 cats');

			singular = __n({ singular: '%s cat', plural: '%s cats', locale: 'de' }, 1);
			plural = __n({ singular: '%s cat', plural: '%s cats', locale: 'de' }, 3);
			should.equal(singular, '1 Katze');
			should.equal(plural, '3 Katzen');

			i18n.setLocale('en');
			singular = __n({ singular: '%s cat', plural: '%s cats', locale: 'nl', count: 1 });
			plural = __n({ singular: '%s cat', plural: '%s cats', locale: 'nl', count: 3 });
			should.equal(singular, '1 Katze');
			should.equal(plural, '3 Katzen');

			singular = __n({ singular: '%s cat', plural: '%s cats', locale: 'en', count: 1 });
			plural = __n({ singular: '%s cat', plural: '%s cats', locale: 'en', count: 3 });
			should.equal(singular, '1 cat');
			should.equal(plural, '3 cats');

			singular = __n({ singular: '%s cat', plural: '%s cats', locale: 'de', count: 1 });
			plural = __n({ singular: '%s cat', plural: '%s cats', locale: 'de', count: 3 });
			should.equal(singular, '1 Katze');
			should.equal(plural, '3 Katzen');

			i18n.setLocale('en');
			singular = __n({ singular: '%s cat', plural: '%s cats', locale: 'nl', count: '1' });
			plural = __n({ singular: '%s cat', plural: '%s cats', locale: 'nl', count: '3' });
			should.equal(singular, '1 Katze');
			should.equal(plural, '3 Katzen');

			singular = __n({ singular: '%s cat', plural: '%s cats', locale: 'en', count: '1' });
			plural = __n({ singular: '%s cat', plural: '%s cats', locale: 'en', count: '3' });
			should.equal(singular, '1 cat');
			should.equal(plural, '3 cats');

			singular = __n({ singular: '%s cat', plural: '%s cats', locale: 'de', count: '1' });
			plural = __n({ singular: '%s cat', plural: '%s cats', locale: 'de', count: '3' });
			should.equal(singular, '1 Katze');
			should.equal(plural, '3 Katzen');
		});

		it('should allow two arguments', () => {

			const singular = __n('cat', 1),
				plural = __n('cat', 3);

			should.equal(singular, '1 cat');
			should.equal(plural, '3 cats');
		});

		it('should return correctly in russian', () => {
			i18n.setLocale('ru');
			should.deepEqual(__n('%s cat', 0), '0 кошек');
			should.deepEqual(__n('%s cat', 1), '1 кошка');
			should.deepEqual(__n('%s cat', 2), '2 кошки');
			should.deepEqual(__n('%s cat', 5), '5 кошек');
			should.deepEqual(__n('%s cat', 6), '6 кошек');
			should.deepEqual(__n('%s cat', 21), '21 кошка');
		});
	});

	describe('__mf()', () => {

		it('should work with simple strings', () => {

			i18n.setLocale('en');
			should.equal('Hello', __mf('Hello'));

			i18n.setLocale('de');
			should.equal('Hallo', __mf('Hello'));
			should.equal('Hallo', __mf('Hello'));
			should.equal('Hallo Marcus, wie geht es dir heute?', __mf('Hello %s, how are you today?', 'Marcus'));
			should.equal('Hello', i18n.__mf({ phrase: 'Hello', locale: 'en' }));
			should.equal('Hello', __mf({ phrase: 'Hello', locale: 'en' }));
		});

		it('should work with basic replacements', () => {

			i18n.setLocale('en');
			should.equal('Hello Marcus', __mf('Hello {name}', { name: 'Marcus' }));

			i18n.setLocale('de');
			should.equal('Hallo Marcus', __mf('Hello {name}', { name: 'Marcus' }));
			should.equal('Hallo Marcus, wie war dein test?', __mf('Hello {name}, how was your %s?', 'test', { name: 'Marcus' }));
		});

		it('should work with plurals', () => {

			let msg = 'In {lang} there {NUM, plural,';

			msg += 'one{is one for #}';
			msg += 'other{others for #}}';

			i18n.setLocale('en');
			should.equal('In english there others for 0', __mf(msg, { NUM: 0, lang: 'english' }));
			should.equal('In english there is one for 1', __mf(msg, { NUM: 1, lang: 'english' }));
			should.equal('In english there others for 2', __mf(msg, { NUM: 2, lang: 'english' }));
			should.equal('In english there others for 3', __mf(msg, { NUM: 3, lang: 'english' }));
			should.equal('In english there others for 4', __mf(msg, { NUM: 4, lang: 'english' }));
			should.equal('In english there others for 5', __mf(msg, { NUM: 5, lang: 'english' }));
			should.equal('In english there others for 6', __mf(msg, { NUM: 6, lang: 'english' }));

			msg = 'In {lang} there {NUM, plural,';
			msg += 'one{is one for #}';
			msg += 'other{others for #}}';

			i18n.setLocale('de');
			should.equal('In german there others for 0', __mf(msg, { NUM: 0, lang: 'german' }));
			should.equal('In german there is one for 1', __mf(msg, { NUM: 1, lang: 'german' }));
			should.equal('In german there others for 2', __mf(msg, { NUM: 2, lang: 'german' }));
			should.equal('In german there others for 3', __mf(msg, { NUM: 3, lang: 'german' }));
			should.equal('In german there others for 4', __mf(msg, { NUM: 4, lang: 'german' }));
			should.equal('In german there others for 5', __mf(msg, { NUM: 5, lang: 'german' }));
			should.equal('In german there others for 6', __mf(msg, { NUM: 6, lang: 'german' }));

			msg = 'In {lang} there {NUM, plural,';
			msg += 'one{is one for #}';
			msg += 'other{others for #}}';

			i18n.setLocale('fr');
			should.equal('In french there is one for 0', __mf(msg, { NUM: 0, lang: 'french' }));
			should.equal('In french there is one for 1', __mf(msg, { NUM: 1, lang: 'french' }));
			should.equal('In french there others for 2', __mf(msg, { NUM: 2, lang: 'french' }));
			should.equal('In french there others for 3', __mf(msg, { NUM: 3, lang: 'french' }));
			should.equal('In french there others for 4', __mf(msg, { NUM: 4, lang: 'french' }));
			should.equal('In french there others for 5', __mf(msg, { NUM: 5, lang: 'french' }));
			should.equal('In french there others for 6', __mf(msg, { NUM: 6, lang: 'french' }));

			msg = 'In {lang} there {NUM, plural,';
			msg += 'one{is one for #}';
			msg += 'few{are a few for #}';
			msg += 'many{are many for #}';
			msg += 'other{others for #}}';

			i18n.setLocale('ru');
			should.equal('In russian there are many for 0', __mf(msg, { NUM: 0, lang: 'russian' }));
			should.equal('In russian there is one for 1', __mf(msg, { NUM: 1, lang: 'russian' }));
			should.equal('In russian there are a few for 2', __mf(msg, { NUM: 2, lang: 'russian' }));
			should.equal('In russian there are a few for 3', __mf(msg, { NUM: 3, lang: 'russian' }));
			should.equal('In russian there are a few for 4', __mf(msg, { NUM: 4, lang: 'russian' }));
			should.equal('In russian there are many for 5', __mf(msg, { NUM: 5, lang: 'russian' }));
			should.equal('In russian there are many for 6', __mf(msg, { NUM: 6, lang: 'russian' }));
			should.equal('In russian there is one for 21', __mf(msg, { NUM: 21, lang: 'russian' }));
		});
	});

	describe('__l()', () => {

		it('should return a list of translations', () => {

			i18n.setLocale('en');
			should.deepEqual(__l('Hello'), ['Hallo', 'Hello', 'Bonjour', 'Привет']);
			should.deepEqual(__l('Hello'), ['Hallo', 'Hello', 'Bonjour', 'Привет']);

			i18n.setLocale('fr');
			should.deepEqual(__l('Hello'), ['Hallo', 'Hello', 'Bonjour', 'Привет']);
			should.deepEqual(__l('Hello'), ['Hallo', 'Hello', 'Bonjour', 'Привет']);
		});
	});

	describe('__h()', () => {

		it('should return a hash of translations', () => {

			i18n.setLocale('en');
			should.deepEqual(__h('Hello'), [{ de: 'Hallo' }, { en: 'Hello' }, { fr: 'Bonjour' }, { ru: 'Привет' }]);
			should.deepEqual(__h('Hello'), [{ de: 'Hallo' }, { en: 'Hello' }, { fr: 'Bonjour' }, { ru: 'Привет' }]);

			i18n.setLocale('fr');
			should.deepEqual(__h('Hello'), [{ de: 'Hallo' }, { en: 'Hello' }, { fr: 'Bonjour' }, { ru: 'Привет' }]);
			should.deepEqual(__h('Hello'), [{ de: 'Hallo' }, { en: 'Hello' }, { fr: 'Bonjour' }, { ru: 'Привет' }]);
		});
	});
});
