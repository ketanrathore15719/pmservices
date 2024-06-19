//class for common function
const Category = require("../models/category")
const User = require("../models/user")
module.exports = {
      commonMiddelware: async function (req, res, next) {
            res.locals.current_url = unescape(req.url);
            if (req.user) {
                  res.locals.user = req.user;
            }
            let category = await Category.find({isDeleted:false})
            res.locals.category = category;
            let error = req.flash('error');
            let success = req.flash('success');
            if (success.length > 0) {
                  res.locals.flash = {
                      type: 'success',
                      message: success
                  };
            }
            if (error.length > 0) {
                  res.locals.flash = {
                      type: 'error',
                      message: error
                  };
            }
            return next();
      }
};