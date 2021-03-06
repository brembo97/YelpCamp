var express = require("express");
var router = express.Router({mergeParams:true});
var Campground = require("../models/campgrounds");
var Comment = require("../models/comments");
var middleware = require("../middleware");

//Show COMMENT form
router.get("/new", middleware.isLoggedIn, function(req,res){
    Campground.findById(req.params.id, function(err, campground){
        if(err || !campground){
            req.flash("error", "Campground not found");
            res.redirect("back");
        }else{
            res.render("comments/new",{campground:campground});
        }
    });
});

//Create a new comment
router.post("/", middleware.isLoggedIn, function(req, res){
    //get campground by ID
    Campground.findById(req.params.id,function(err, campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        }else{
            //create a comment
            Comment.create(req.body.comment,function(err, comment){
                if(err){
                    console.log(err);
                }else{
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    //connect new comment to campground
                    campground.comments.push(comment) ;
                    campground.save();
                    //redirect
                    req.flash("success", "Successfully created a comment");
                    res.redirect("/campgrounds/"+req.params.id);
                }
            });
        }
    });
});

//Show Edit Comment Form Route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground not found");
            res.redirect("back");
        }else{
            Comment.findById(req.params.comment_id, function(err, foundComment){
                if(err){
                    res.redirect("back");
                }else{
                    res.render("comments/edit", {campground:req.params.id, comment:foundComment});
                }
            });
        }
    });
});

//Update a Comment 
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
         if(err){
            res.redirect("back");
        }else{
              //redirect
            res.redirect("/campgrounds/" + req.params.id );
        }
    });
});

//Delete a Comment
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        }else{
            req.flash("success", "Comment deleted");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;