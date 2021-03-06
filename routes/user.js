    var express = require("express");
    var router = express.Router();
    var User = require("../models/user");
    var Campground = require("../models/campground");
    var middleware = require("../middleware");
    var multer = require("multer");
    
    // var storage = multer.diskStorage({
    //   destination: function(req, file, callback) {
    //     callback(null, "./public/uploads/userImg");
    //   },
    //   filename: function(req, file, callback) {
    //     callback(null, Date.now() + file.originalname);
    //   }
    // });
    // var upload = multer({ storage : storage}).single('avatar');
    
    var storage = multer.diskStorage({
      filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
      }
    });
    var imageFilter = function (req, file, cb) {
        // accept image files only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    };
    var upload = multer({ storage: storage, fileFilter: imageFilter})
    
    var cloudinary = require('cloudinary');
    cloudinary.config({ 
      cloud_name: 'de6uaupbi', 
      api_key: process.env.CLOUDINARY_API_KEY, 
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
        // User profiles
        router.get("/users/:id", middleware.checkProfileOwnership, function(req, res) {
           User.findById(req.params.id, function(err, foundUser){
               if(err || !foundUser){
                   req.flash("error", "Something went wrong");
                   res.redirect("/campgrounds");
               } else {
                   Campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds) {
                      if(err || !foundUser){
                        req.flash("error", "Something went wrong");
                        res.redirect("/campgrounds"); 
                      }
                       res.render("users/show", {user: foundUser, campgrounds: campgrounds});
                   });
               }
           });
        });
        
        // Edit Route
        router.get("/users/:id/edit", middleware.checkProfileOwnership, function(req, res) {
           User.findById(req.params.id, function(err, foundUser) {
             if(err || !foundUser) {
               req.flash("error", "That user doesnt exist");
               res.redirect("back");
             } else {
               res.render("users/edit", {user: foundUser});
             }
           }); 
        });
        
        // update ROUTE
        router.put("/users/:id", middleware.checkProfileOwnership, upload.single('avatar'), function(req, res) {
            //   upload(req, res, function(err) {
            //     if(err){
            //       req.flash("error", err.message);
            //       return res.redirect("back");
            //     } 
            var filePath;
            if(!req.file) {
                filePath = "http://res.cloudinary.com/de6uaupbi/image/upload/v1515045107/no-user-image-square_i7nnyb.jpg";
                updateRoute(req, res, filePath);
                
            } else {
                eval(require("locus"))
                cloudinary.uploader.upload(req.file.path, function(result) {
                    if(result.error) {
                        req.flash("error", result.error.message);
                       return res.redirect("/users/" + req.params.id)
                    }
                    updateRoute(req, res, result.secure_url);
                });
            }
        });
        
        function updateRoute(req, res, result) {
            var newData = {
            firstName: req.body.user.firstName,
            lastName: req.body.user.lastName,
            email: req.body.user.email,
            bio: req.body.user.bio
            };
            if(req.body.user.removeImage) {
                newData.avatar = "http://res.cloudinary.com/de6uaupbi/image/upload/v1515045107/no-user-image-square_i7nnyb.jpg";
            } else if(result) {
                 newData.avatar = result;
            }
            console.log(newData);
            User.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, user){
              if(err || !user) {
                req.flash("error", "Invalid User");
                res.redirect("back");
              } else {
                req.flash("success", "Profile updated");
                res.redirect("/users/" + user._id);
              }
            });
        }
        
        // DESTROY USER
        router.delete("/users/:id", middleware.checkProfileOwnership,  function(req, res){
            User.findByIdAndRemove(req.params.id, function(err){
                if(err){
                    res.redirect("/campgrounds");
                } else {
                    req.flash("success", "Your account has been deleted")
                    res.redirect("/campgrounds");
                }
            });
        });
        
        module.exports = router;