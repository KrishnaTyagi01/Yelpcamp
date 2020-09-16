var express = require('express');
var router = express.Router();
var passport     = require('passport');
var user         = require('../models/user');


router.get("/", function(req,res){
    res.render("../views/landing");
});

// ================
// AUTH ROUTES
// ================
router.get('/register', function(req, res){
    res.render("../views/register")
  });
  
  router.post('/register', function(req, res){
   var newUser = new user({username : req.body.username});
   user.register(newUser, req.body.password, function(err, user){
     if(err){
      req.flash("error", err.message);
      return res.redirect("/register");
     }
     req.flash("success", "Welcome to Yelpcamp " + user.username);

     passport.authenticate("local")(req, res, function(){
       res.redirect("/campground");
     });
   });
  });
  
  // Login form
  router.get("/login", function(req, res){
   res.render("../views/login");
  });
  
  //Login logic happens here  
  
  router.post("/login",passport.authenticate("local",{
    successRedirect: "/campground",
    failureRedirect: "/login"
  }) ,function(req, res){
  
  });
  
  //Logout logic
  
  router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out");

    res.redirect("/campground");
  });
  
  module.exports = router;