const User = require("../models/user")
const bcrypt = require('bcrypt')
const md5 = require('md5');
module.exports = {

	login: function (app) {
		// create object of passposrt authentication and strategy
		const passport = require('passport'),
			LocalStrategy = require('passport-local').Strategy;
		// var db = require('../models');
		app.use(passport.initialize());
		app.use(passport.session());
		
		//user login through passport js using mongo DB
		passport.use(new LocalStrategy({
				usernameField: 'email',
				passwordField: 'password',
				passReqToCallback: true
			},
			/**function for login user
			 * @param  {string} username
			 * @param  {string} password
			 * @param  {Function} done
			 * @return {[type]}
			 */
			function (req, email, password, done) {
				let requestIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.headers['HTTP_CLIENT_IP'] || req.headers['X-Real-IP'] || req.headers['HTTP_X_FORWARDED_FOR'];
				if (requestIP.substr(0, 7) === "::ffff:") {
					requestIP = requestIP.substr(7)
				}
				email = email.toLowerCase();

				// find user by email
				User.findOne({
					'email': email,
					// 'email': {
					// 	$regex: '^' + username + '$',
					// 	$options: 'i'
					// },
					isDeleted: false
				}, {
					name:1,
					email:1,
					mobile:1,
					status:1,
					role:1,
					isDeleted:1,
					password:1,
				}).then(async function (user) {
					// if user not found
					console.log(user)
					if (!user) {
						console.log('Hii not')
						return done(null, false, { message: 'Email not registered' });
					} else {
						// check user must active and not deleted
						if (user.status === false) {
							return done(null, false, { message: 'User is blocked or deleted. Please contact admin' });
						}
						console.log( md5(password), user.password)
						// check password
						if (md5(password) == user.password) {
							// for get vendor status in user session
							user = user.toObject();
							return done(null, user);
						} else {
							console.log('initialize')
							return done(null, false, { message: 'Invalid Password' });
						}
						
					}
					// handle catch 
				}).catch(function (err) {
					console.log(err)
					return done(null, false, { message: 'Email not registered.' });
				});
			}
		));

		passport.serializeUser(function (user, done) {
			done(null, user);
		});

		passport.deserializeUser(function (user, done) {
			done(null, user);
		});
	},

	checkAuth: function (req, res, next) {
		if (req.isAuthenticated()) {
			if(req.user.role === 1) {
				return next(); //return next
			} else {
				req.flash('error', "Unauthorized access!");
				//redirect to requested page
				res.redirect('/')
			}
			
		} else {
			console.log('hii')
			//set flash message
			req.flash('error', "Please login to access this page.");
			//redirect to requested page
			res.redirect('/auth/login')
		}
	},

	checkCustomerAuth: function (req, res, next) {
		if (req.isAuthenticated()) {
			return next(); //return next
		} else {

			req.flash('error', "Please login to access this page.");
			//redirect to requested page
			res.redirect('/auth/login')
		}
	}
}
