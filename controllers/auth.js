const User = require("../models/user")
const bcrypt = require('bcrypt')
const passport = require('passport')
const md5 = require('md5');
const flash = (req,res, type, message, url) => {
	req.flash(type, message)
	url ? res.redirect(url) : res.status(200).json({})
}
module.exports = {
	logout: async (req, res, next) => {
		
		req.logout(async(err)=> {
		    if (err) { return next(err); }
		    delete req.session.cart
		    res.redirect('/auth/login');
		});
		
	},
	loginGet : async (req, res) => res.render('pages/auth/login', {layout: 'auth.hbs', title : 'Login'}),
  	login : async (req, res, next) => {
	
		let {email, password} = req.body;

		try {

			passport.authenticate('local', (err, user, info) => {
				if (err || !user) {
					var e = info.message;
					req.flash('error', e);
					return res.redirect('/');
				} else {
					//establish sesstion
					req.logIn(user, async (err) => {
						// Invalid password
						if (err) {
							var e = info.message;
							req.flash('error', e);
							return res.redirect('/');

						} else {
							// req.user.missing_setting = false;
							req.flash('success', "Login Successful");
							if (req.query.u) {
								return res.redirect(req.query.u);
							} else {
								return res.redirect('/');
							}
						}
					});
				}
			})(req, res, next);
		} catch (error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}

	},
	registerGet : async (req, res) => res.render('pages/auth/register', {layout: 'auth.hbs', title : 'Register'}),
  	register : async (req, res) => {
	
		let {name, mobile, email, password} = req.body;

		try {

			User.exists({email:email}, async (err, result) => { 
				if(result) {
					flash(req, res, 'error', 'Email already taken!', 'back')
				} else {
					password = md5(password)
					console.log(password)
					const created = await User.create({name, mobile, email, password});

					flash(req, res, 'success', 'Registration successfully!', 'back')
				}
			})
		} catch (error) {
			console.log(error)
			flash(req, res, 'error', error.message, 'back')
		}

	},
}
