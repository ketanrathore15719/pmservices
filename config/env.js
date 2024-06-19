let production = false;


if(production) {
	module.exports = {
		url:'https://pmservices.herokuapp.com',
	}
} else {
	module.exports = {
		url:'http://localhost:3002',
	}
}