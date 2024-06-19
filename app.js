// package import
const express = require("express");
const cors = require("cors");
const { config } =  require("dotenv");
const cloudinary = require("cloudinary")
config({ path: "./config/config.env" });
const createError = require('http-errors');
const fileupload = require("express-fileupload");
const bodyParser = require('body-parser');
const path = require('path');
const moment = require('moment')
 const exphbs = require('express-handlebars');
const flash = require('connect-flash');
const requireDirectory = require('require-directory');
const session = require('express-session');
var cookieSession = require('cookie-session')
const auth = require('./helpers/auth');
// database connection
const connectDatabase  =  require("./config/database.js");
connectDatabase();
const { commonMiddelware } = require("./helpers/middleware");
global.checkAuth = auth.checkAuth;
global.checkCustomerAuth = auth.checkCustomerAuth;
global.config = require("./config/env")
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_API_ID, 
  api_secret: process.env.CLOUD_API_SECRET
});

//express app init
const app = express();

app.use(cors());
app.use(
  fileupload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: true,
  })
);

// app.use(session({
//     secret: "abhH4re5Uf4Rd0KnddS05sdff3V",
//     resave: true,
//     saveUninitialized: true,
//     maxAge: Date.now() + (30 * 86400 * 1000)
// }));
// app.use(flash());
app.use(session({
    secret:'flashblog',
    saveUninitialized: true,
    resave: true,
    maxAge: Date.now() + (30 * 86400 * 1000)
}));

// app.use(cookieSession({
//   "secret": "session",
//   "key": "abhH4re5Uf4Rd0KnddSsdf05f3V"
// }));

app.use(flash());
app.use((req, res, next) => { 
    if(req.xhr) {
      res.locals.layout = 'total_blank'
    }
    
    next()
})

app.use(express.json());
app.use(bodyParser.json());
app.use(express.static("files"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
auth.login(app);
app.use(commonMiddelware);

/**
 * Loading Handlebar template and custom helpers
 */
const hbs = exphbs.create(require('./helpers/handlebar.js'));
// view engine setup
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');


var routes = requireDirectory(module, './routes');
let configRoute = {ignoreRoutes: ['auth']}

for (i in routes){ 
    console.log(i)
    app.use('/'+i, require("./routes/" + i));
}


app.use(require("./routes/home"))
//for (i in routes) if (configRoute.ignoreRoutes.indexOf(i) < 0)  app.use("/" + i, require("./routes/" + i));
// server checking

app.get("/about", (req, res) => {
    res.render('pages/about/about')
});



// catch 404 and forward to error handler
app.use((req, res, next) => next(createError(404)));

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  var error = err.status == 404 ? '404' : '500';
  
  if (req.user) res.render('error/' + error);
  else res.render('error/' + error);
  
});


// app run with port
app.listen(process.env.PORT, () => {
  console.log("Server is running on port " + process.env.PORT);
});

