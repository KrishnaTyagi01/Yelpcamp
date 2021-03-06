var express = require("express");
var router = express.Router({mergeParams: true});
var Campground   = require("../models/campground");
var Comment      = require("../models/comment");
var middleware = require("../middleware"); // here we do not necessarly need to go to /index tpp because it's default in express ( i.e index.js is specially defaulted required file).

router.get("/campground/:id/comments/new",middleware.isLoggedIn ,function(req,res){
    Campground.findById(req.params.id, function(err, campground){
      if(err){
        console.log(err);
      }else{
         res.render("../views/newComment", {campground:campground});
      }
    });
   });
   
   router.post("/campground/:id/comments",middleware.isLoggedIn ,function(req,res){
     Campground.findById(req.params.id, function(err, campground){
       if(err){
         console.log(err);
         res.redirect("/campground");
       }else{
         Comment.create(req.body.comment, function(err, comment){
           if(err){
            req.flash("error", "Something went wrong");
             console.log(err);
           }else{
              comment.author.id = req.user._id;
              comment.author.username = req.user.username;
              comment.save();

             campground.comments.push(comment);
             campground.save();
             req.flash("success", "Successfully added comment");
             res.redirect("/campground/" +campground._id);
           }
         })
       }
     });
    });

    router.get("/campground/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
      Comment.findById(req.params.comment_id, function(err , foundComment){
        if(err){
          res.redirect('back');
        }else{
          res.render("../views/editComment", {campground_id: req.params.id, comment: foundComment});
        }
      });
    });

    // UPDATE COMMENT
    router.put("/campground/:id/comments/:comment_id",middleware.checkCommentOwnership ,function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedCampground){
      if(err){
        res.redirect("back");
      }else{
        res.redirect("/campground/" + req.params.id);
      }
    });
    }); 
  //  DELETE COMMENT
     router.delete("/campground/:id/comments/:comment_id", middleware.checkCommentOwnership,function(req, res){
       Comment.findByIdAndRemove(req.params.comment_id, function(err){
         if(err){
           res.redirect('back');
         }else{
          req.flash("success", "Comment deleted");

           res.redirect('/campground/' + req.params.id);
         }
       });
    });

    module.exports = router;