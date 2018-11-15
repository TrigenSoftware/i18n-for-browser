import parseInterval from 'math-interval-parser';
import Mustache from 'mustache';

/**
 * Splits and parses a phrase for mathematical interval expressions.
 * @param  phrase - Phrase to parse.
 * @param  count - Target count.
 * @return Phrase.
 */
function parsePluralInterval(phrase: string, count: number) {

	const phrases = phrase.split(/\|/);
	let returnPhrase = phrase;

	// some() breaks on 1st true
	phrases.some((p) => {

		const [, m1, m2] = p.match(/^\s*([()\[\]\d,]+)?\s*(.*)$/);

		// not the same as in combined condition
		if (m1) {

			if (matchInterval(count, m1)) {
				returnPhrase = m2;
				return true;
			}

		} else {
			returnPhrase = p;
		}

		return false;
	});

	return returnPhrase;
}

/**
 * test a number to match mathematical interval expressions
 * [0,2] - 0 to 2 (including, matches: 0, 1, 2)
 * ]0,3[ - 0 to 3 (excluding, matches: 1, 2)
 * [1]   - 1 (matches: 1)
 * [20,] - all numbers ≥20 (matches: 20, 21, 22, ...)
 * [,20] - all numbers ≤20 (matches: 20, 21, 22, ...)
 * @param  num - Number to match.
 * @param  interval - Interval query.
 * @return Match or not.
 */
function matchInterval(num: number, interval: string) {

	const parsedInterval = parseInterval(interval);

	if (parsedInterval && typeof num === 'number') {

		const {
			from: {
				included: fromIncluded,
				value: fromValue
			},
			to: {
				included: toIncluded,
				value: toValue
			}
		} = parsedInterval;

		if (fromValue === num) {
			return fromIncluded;
		}

		if (toValue === num) {
			return toIncluded;
		}

		return (
			Math.min(fromValue, num) === fromValue
			&& Math.max(toValue, num) === toValue
		);
	}

	return false;
}

/**
 * Handle plural interval templates.
 * @param text - Input text.
 * @param namedValues - Named values.
 * @param values - Listed values.
 * @param count - Count.
 */
export function pluralIntervalProcessor(text: string, _, __, count?: number) {

	if (/\|/.test(text) && typeof count === 'number') {
		return parsePluralInterval(text, count);
	}

	return text;
}

/**
 * Handle mustache templates.
 * @param text - Input text.
 * @param namedValues - Named values.
 * @param values - Listed values.
 * @param count - Count.
 */
export function mustacheProcessor(text: string, namedValues: any) {

	if (/\{\{.*\}\}/.test(text)) {
		return Mustache.render(text, namedValues);
	}

	return text;
}
