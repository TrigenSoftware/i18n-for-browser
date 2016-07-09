import React, { Component } from 'react';
import { render } from 'react-dom';
import * as i18n  from 'i18n-for-browser';

i18n.configure({
    locales: {
        'en': {
        	"index.hello": "Hello World!"
        },
        'ru': {
        	"index.hello": "Привет Мир!"
        }
    },
    cookie: 'lang'
});

const style = {
	main: {
		fontFamily: "Helvetica Neue, Arial",
		fontSize:   "2em",
		textAlign:  "center",
		padding:    "5em"
	},
	h1: {
		fontWeight: "normal"
	},
	a: {
		margin:         "0 .5em",
		textDecoration: "underline",
		cursor:         "pointer"
	}
};

class Test extends Component {

	render() {
		return (
			<div style={style.main}>
				<h1 style={style.h1}>{i18n.__`index.hello`}</h1>
				{i18n.getLocales().map(locale => (
					<a 
						style   = {style.a} 
						key     = {locale} 
						onClick = {i18n.setLocale.bind(null, locale)}
					>
						{locale}
					</a>
				))}
			</div>
		)
	}

	componentDidMount() {

		i18n.onLocaleChange(() =>
			this.forceUpdate()
		);
	}
}

window.onload = 
function renderTest() {

	var mountPoint = document.getElementById("view");

	if (mountPoint != null) {
		render(<Test/>, mountPoint);
	}
}