var localStategy = require('passport-local');
var Campground   = require("./models/campground");
var bodyParser   = require('body-parser');
var mongoose     = require('mongoose');
var passport     = require('passport');
var express      = require('express');
var Comment      = require("./models/comment");
const port       = 80;
var seedDB       = require('./seeds');
var user         = require('./models/user');
var app          = express();

app.use(bodyParser.urlencoded({extended:true}));
mongoose.connect('mongodb://localhost/yelp_camp', {useNewUrlParser: true, useUnifiedTopology: true});
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));

app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  next();
});
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

app.get("/campground", function(req,res){
 Campground.find({},function(err,allCampground){
   if(err){
     console.log(err);
   }else{
     res.render("campground",{campground:allCampground, currentUser: req.user});
   }
 })
});
app.get("/", function(req,res){
    res.render("landing");
});

app.get("/campground/new", function(req,res){
  res.render("new");
});

app.post("/campground", function(req,res){
//   res.send("you hit the post route");
var name = req.body.name;
var image = req.body.image;
var desc = req.body.discription;
var newCampground = {name:name, image:image, discription:desc};



Campground.create(newCampground, function(err, newlyCreated){
  if(err){
    console.log(err);
  }else{
    res.redirect("/campground");
  }
});
});

app.get("/campground/:id", function(req,res){

   Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
    if(err){
      console.log(err); 
    }else{
       res.render("show", {campground: foundCampground});
    }
   });
 
});
// ================
// COMMENTS ROUTES
// ================

app.get("/campground/:id/comments/new",isLoggedIn ,function(req,res){
 Campground.findById(req.params.id, function(err, campground){
   if(err){
     console.log(err);
   }else{
      res.render("newComment", {campground:campground});
   }
 });
});

app.post("/campground/:id/comments",isLoggedIn ,function(req,res){
  Campground.findById(req.params.id, function(err, campground){
    if(err){
      console.log(err);
      res.redirect("/campground");
    }else{
      Comment.create(req.body.comment, function(err, comment){
        if(err){
          console.log(err);
        }else{
          campground.comments.push(comment);
          campground.save();
          res.redirect("/campground/" +campground._id);
        }
      })
    }
  });
 });


// ================
// AUTH ROUTES
// ================
app.get('/register', function(req, res){
  res.render("register")
});

app.post('/register', function(req, res){
 var newUser = new user({username : req.body.username});
 user.register(newUser, req.body.password, function(err, user){
   if(err){
     console.log(err);
     return res.render("register");
   }
   passport.authenticate("local")(req, res, function(){
     res.redirect("/campground");
   });
 });
});

// Login form
app.get("/login", function(req, res){
 res.render("login");
});

//Login logic happens here  

app.post("/login",passport.authenticate("local",{
  successRedirect: "/campground",
  failureRedirect: "/login"
}) ,function(req, res){

});

//Logout logic

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/campground");
});

//defining middleware

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}

app.listen(port, ()=>{
    console.log(`The application started successfully on port ${port}`);
});