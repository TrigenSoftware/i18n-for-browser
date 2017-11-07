import * as i18n from '../src';
import should from 'should';

describe('Object Notation', () => {

	beforeEach(() => {
		i18n.configure({
			locales:   {
				en: require('./locales/en.json'),
				de: require('./locales/de.json')
			},
			globalize:      true,
			objectNotation: true
		});
	});

	describe('Date/Time patterns', () => {

		it('should return en formatting as expected', () => {
			i18n.setLocale('en');
			should.equal(__('format.date'), 'MM/DD/YYYY');
			should.equal(__('format.time'), 'h:mm:ss a');
		});

		it('should return de formatting as expected', () => {
			i18n.setLocale('de');
			should.equal(__('format.date'), 'DD.MM.YYYY');
			should.equal(__('format.time'), 'hh:mm:ss');
		});
	});

	describe('__() and __n()', () => {

		beforeEach(() => {
			const catalog = i18n.getCatalog('en');

			Reflect.deleteProperty(catalog.nested, 'path');
		});

		it('should return en translations as expected, using object traversal notation', () => {
			i18n.setLocale('en');
			should.equal(__('greeting.formal'), 'Hello');
			should.equal(__('greeting.informal'), 'Hi');
			should.equal(__('greeting.placeholder.formal', 'Marcus'), 'Hello Marcus');
			should.equal(__('greeting.placeholder.informal', 'Marcus'), 'Hi Marcus');
			should.throws(__('greeting.placeholder.loud', 'Marcus'));
		});

		it('should provide proper pluralization support, using object traversal notation', () => {

			i18n.setLocale('en');

			const singular = __n({ singular: 'cat', plural: 'cat', locale: 'de' }, 1),
				plural = __n({ singular: 'cat', plural: 'cat', locale: 'de' }, 3);

			should.equal(singular, '1 Katze');
			should.equal(plural, '3 Katzen');
		});

		it('should return en translations as expected, when dot is first or last character', () => {
			i18n.setLocale('en');
			should.equal(__('. is first character'), 'Dot is first character');
			should.equal(__('last character is .'), 'last character is Dot');
			should.equal(__('few sentences. with .'), 'few sentences with Dot');
		});

		it('should allow for simple pluralization', () => {

			i18n.setLocale('en');

			const singular = __n('nested.deep.plural', 1),
				plural = __n('nested.deep.plural', 3);

			should.equal(singular, 'plural');
			should.equal(plural, 'plurals');
		});

		it('should correctly update files', () => {
			i18n.setLocale('en');
			should.equal(__('nested.path'), 'nested.path');
			should.equal(__('nested.path.sub'), 'nested.path.sub');
			should.deepEqual(__('nested.path'), {
				sub: 'nested.path.sub'
			});
		});
	});
});
