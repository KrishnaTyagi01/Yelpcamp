var methodOverride = require('method-override');
var localStategy  = require('passport-local');
var Campground    = require("./models/campground");
var bodyParser    = require('body-parser');
var mongoose      = require('mongoose');
var passport      = require('passport');
var express       = require('express');
var Comment       = require("./models/comment");
var flash         = require("connect-flash");
const port        = 80;
var seedDB        = require('./seeds');
var user          = require('./models/user');
var app           = express();
 

var commentRoutes = require("./routes/commentRoute");
var campgroundRoutes = require("./routes/campgroundRoute");
var indexRoutes = require("./routes/index");


app.use(bodyParser.urlencoded({extended:true}));
mongoose.connect('mongodb://localhost/yelp_camp', {useNewUrlParser: true, useUnifiedTopology: true});
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// seedDB();

//PASSPORT CONFURIGATION
app.use(require("express-session")({
  secret : "Once again Rusty wins cutest dog!",
  resave: false,
  saveUninitialized:  false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");

  next();
});

app.use(commentRoutes);
app.use(campgroundRoutes);
app.use(indexRoutes);

app.listen(port, ()=>{
  console.log(`The application started successfully on port ${port}`);
});