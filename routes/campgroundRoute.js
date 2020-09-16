var express = require('express');
var router = express.Router();
var Campground   = require("../models/campground");
var middleware = require("../middleware"); // here we do not necessarly need to go to /index tpp because it's default in express ( i.e index.js is specially defaulted required file)
router.get("/campground",function(req,res){
    Campground.find({},function(err,allCampground){
      if(err){
        console.log(err);
      }else{
        res.render("campground",{campground:allCampground, currentUser: req.user});
      }
    })
   });

   
   router.get("/campground/new", middleware.isLoggedIn,function(req,res){
     res.render("../views/new");
   });
   
   router.post("/campground", function(req,res){
   //   res.send("you hit the post route");
   var name = req.body.name;
   var price = req.body.price;
   var image = req.body.image;
   var desc = req.body.description;
   var author = {
     id : req.user._id,
     username: req.user.username
   }
   var newCampground = {name:name,price:price,image:image, description:desc, author: author};
   
   
   
   Campground.create(newCampground, function(err, newlyCreated){
     if(err){
       console.log(err);
     }else{
       res.redirect("/campground");
     }
   });
   });
   
   router.get("/campground/:id", function(req,res){
   
      Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
       if(err){
         console.log(err); 
       }else{
          res.render("../views/show", {campground: foundCampground});
       }
      });
   });

  //  EDIT Campground ROUTES
  router.get("/campground/:id/edit", middleware.checkCampgroundOwnership ,function(req, res){
        Campground.findById(req.params.id, function(err, foundCampground){
              res.render("../views/edit", {campground: foundCampground});       
    }); 
  });
  

  // UPDATE CAMPGROUND ROUTES
   router.put("/campground/:id",middleware.checkCampgroundOwnership ,function(req, res){
     Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
       if(err){
         res.redirect('/campground');
       }else{
         res.redirect('/campground/' + req.params.id);
       }
     });
   });

  //  DESTROY CAMPGROUND ROUTE
  router.delete("/campground/:id",middleware.checkCampgroundOwnership ,function(req, res){
   Campground.findByIdAndRemove(req.params.id, function(err){
     if(err){
       res.redirect("/campground");
     }else{
      res.redirect("/campground");
     }
   });
  });

   module.exports = router;