import React, { Component } from 'react';
import { render } from 'react-dom';
import 'i18n-for-browser';

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
				<h1 style={style.h1}>{__`index.hello`}</h1>
				{__.getLocales().map(locale => (
					<a 
						style   = {style.a} 
						key     = {locale} 
						onClick = {__.setLocale.bind(null, locale)}
					>
						{locale}
					</a>
				))}
			</div>
		)
	}

	componentDidMount() {

		__.onLocaleChange(() =>
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