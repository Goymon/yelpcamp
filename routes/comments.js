var express         = require("express"),
    Campground      = require("../models/campground"),
    Comment         = require("../models/comment"),
    middleware      = require("../middleware");
   
var router          = express.Router({mergeParams: true});
   

    // SHOW COMMENT FORM
    router.get("/new", middleware.isLoggedIn, function(req, res) {
        Campground.findById(req.params.id, function(err, campground) {
           if(err) {
               console.log(err);
           } else {
               
                res.render("comments/new", { campground: campground});
           }
        }); 
    });
    
    // HANDLES COMMENT LOGIC
    router.post("/", middleware.isLoggedIn, function(req, res) {
        Campground.findById(req.params.id, function(err, campground) {
            if(err) {
                console.log(err);
    
            } else {
                Comment.create(req.body.comment, function(err, comment) {
                   if(err) {
                       console.log(err);
                   } else {
                       comment.author.id = req.user._id;
                       comment.author.username = req.user.username;
                       comment.save();
                       campground.comments.push(comment);
                       campground.save();
                       console.log(comment);
                       req.flash("success", "Successfuly added a comment");
                       res.redirect("/campgrounds/" + campground._id);
                   }
               }); 
            }
        });
    });
    
    // EDIT COMMENT ROUTE
    router.get("/:comment_id/edit", middleware.checkCommentsOwnership, function (req, res) {
        Campground.findById(req.params.id, function(err, foundCampground) {
            if(err || !foundCampground) {
                req.flash("error", "No Campground found");
                return res.redirect("back")
            }
            Comment.findById(req.params.comment_id, function(err, foundComment) {
                if(err){
                    console.log(err);
                    res.redirect("back");
                } else {
                    res.render("comments/edit",{campground_id: req.params.id, comment: foundComment});
                }
            });
        });
    });
    
    // UPDATE COMMENT ROUTE
    router.put("/:comment_id", middleware.checkCommentsOwnership, function(req, res) {
       Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
           if(err) {
                console.log(err);
                res.redirect("back");
           } else {
               req.flash("success", "Successfuly edited a comment");
               res.redirect("/campgrounds/" + req.params.id);
           }
       }) 
    });
    
    // DESTROY COMMENT ROUTE
    router.delete("/:comment_id", middleware.checkCommentsOwnership, function(req,res) {
       Comment.findByIdAndRemove(req.params.comment_id, function(err, deletedComment) {
           if(err) {
               console.log(err);
               res.redirect("/campgrounds/"+ req.params.id);
           } else {
               req.flash("success", "Successfuly deleted a comment");
               res.redirect("/campgrounds/"+ req.params.id);
           }
       }) 
    });
    

    
    module.exports = router;