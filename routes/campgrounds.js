    var express = require("express");
    var router  = express.Router();
    var Campground = require("../models/campground");
    var User = require("../models/user");
    var middleware = require("../middleware");
    var geocoder = require('geocoder');
    var multer = require("multer");
    
    // var storage =   multer.diskStorage({
    //   destination: function(req, file, callback) {
    //     callback(null, './public/uploads');
    //   },
    //   filename: function(req, file, callback) {
    //     callback(null, Date.now() + file.originalname);
    //   }
    // });
    // var upload = multer({ storage : storage}).single('image');
    
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
    
    
    //INDEX - show all campgrounds
    router.get("/", function(req, res){
        var perPage = 8;
        var pageQuery = parseInt(req.query.page);
        var page = pageQuery ? pageQuery : 1;
        var noMatch = null;
        if(req.query.search) {
            const regex = new RegExp(escapeRegex(req.query.search), 'gi');
            Campground.find({name: regex}).skip((perPage * page) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
                Campground.count({name: regex}).exec(function (err, count) {
                    if (err) {
                        req.flash("error", "Something went wrong... Please try again.");
                        res.redirect("back");
                    } else {
                        if(allCampgrounds.length < 1) {
                            noMatch = "No campgrounds match that query, please try again.";
                        }
                        res.render("campgrounds/index", {
                            campgrounds: allCampgrounds,
                            current: page,
                            pages: Math.ceil(count / perPage),
                            noMatch: noMatch,
                            search: req.query.search
                        });
                    }
                });
            });
        } else {
            // get all campgrounds from DB
            Campground.find({}).skip((perPage * page) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
                Campground.count().exec(function (err, count) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.render("campgrounds/index", {
                            campgrounds: allCampgrounds,
                            current: page,
                            pages: Math.ceil(count / perPage),
                            noMatch: noMatch,
                            search: false
                        });
                    }
                });
            });
        }
    });
    
    //CREATE - add new campground to DB
    // router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res){
    //     User.findById(req.user._id, function(err, user) {
    //         upload(req, res, function(err){
    // 			if(err){
    // 			 req.flash("error", "Error uploading file");
    // 			 return res.redirect("back");
    // 			}
    // 			var name = req.body.name;
    // 			if(typeof req.file !== "undefined") {
    // 				var image = "/uploads/" + req.file.filename;
    // 			} else {
    // 				image = "/uploads/no-image.png";
    // 			}
    			
    // 			geocoder.geocode(req.body.location, function (err, data) {
    //                 if(err || !data.results.length){ // check for error or empty results array
    //                     if(err && err.message) console.log(err.message);
    //                     req.flash("error", 'No results for that location, please try again');
    //                     return res.redirect('back');
    //                 }
    //                 var desc = req.body.description;
    //     			var author = {
    //     				id: req.user._id,
    //     				username: req.user.username
    //     			};
    //     			var cost = req.body.cost;
    //                 var lat = data.results[0].geometry.location.lat;
    //                 var lng = data.results[0].geometry.location.lng;
    //                 var location = data.results[0].formatted_address;
    //                 var newCampground = {name: name, image: image, description: desc, cost: cost, author: author, location: location, lat: lat, lng: lng};
    //                 // Create a new campground and save to DB
    //                 Campground.create(newCampground, function(err, newlyCreated){
    //                     if(err){
    //                         console.log(err);
    //                     } else {
    //                     	user.campgrounds.push(newlyCreated);
    //                     	user.save();
    //                         //redirect back to campgrounds page
    //                         req.flash("success", "Contrats, " + name + " has been created and added to our listings.");
    //                         res.redirect("/campgrounds");
    //                     }
    //                 });
    //             });
    //         });
    //     });
    // });
    
    router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
        
        geocoder.geocode(req.body.location, function (err, data) {
            if(err || !data.results[0]) {
              return  res.render("campgrounds/new", {error: "Location is invalid please try again"});
            }
            // eval(require("locus"));
            var lat = data.results[0].geometry.location.lat;
            var lng = data.results[0].geometry.location.lng;
            var location = data.results[0].formatted_address;
            
        
            cloudinary.uploader.upload(req.file.path, function(result) {
                
                var name = req.body.name;
                var image = result.secure_url;
                var desc = req.body.description;
                var author = {
                    id: req.user._id,
                    username: req.user.username
                }
                var cost = req.body.cost;
                var newCampground = {
                    name: name, 
                    image: image, 
                    description: desc, 
                    cost: cost, 
                    author: author, 
                    location: location, 
                    lat: lat, 
                    lng: lng
                };
                
                Campground.create(newCampground, function(err, newlyCreated) {
                    if(err){
                        req.flash('error', err.message);
                        return res.redirect('back');
                    } else {
                        req.flash("success", "Successfuly created a campground");
                        res.redirect('/campgrounds/' + newlyCreated.id);
                    }
                }); 
            });
        });
    });
     
    
    // this is the form page for adding a new campground
    router.get("/new", middleware.isLoggedIn, function(req, res) {
        res.render("campgrounds/new"); 
    });
    
    // SHOW - show more info about one campground
    router.get("/:id", function(req, res) {
        // find the campground with provided id
        Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
            if(err || !foundCampground){
                req.flash("error", "Campground not found");
                res.redirect("/campgrounds");
            } else {
                // render show template to that campground
                res.render("campgrounds/show", {campground: foundCampground});
            }
        });
    });
    
    // EDIT CAMPGROUND ROUTE
    router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
        Campground.findById(req.params.id, function(err,foundCampground){
            if(err){
                res.redirect("back");
            } else {
                res.render("campgrounds/edit", {campground: foundCampground});
            }
        });
    });
       
    
    // UPDATE CAMPGROUND ROUTE
    
    router.put("/:id",  middleware.checkCampgroundOwnership, upload.single('image'), function(req, res){
        
        geocoder.geocode(req.body.campground.location, function (err, data) {
            if(err || !data.results[0]) {
                req.flash("error","Location is invalid please try again.");
                return res.redirect("/campgrounds/" + req.params.id + "/edit");
            }
            
            var lat = data.results[0].geometry.location.lat;
            var lng = data.results[0].geometry.location.lng;
            var location = data.results[0].formatted_address;
            var result;
            if(req.body.removeImage || !req.file) {
                result = "http://res.cloudinary.com/de6uaupbi/image/upload/v1515051667/no-image_g5eepp.png";
                updateCampground(req, res, location, lat, lng, result);
                
            } else if(req.file) {
                cloudinary.uploader.upload(req.file.path, function(result) {
                    if(result.error) {
                        req.flash("error", result.error.message);
                        return res.redirect("/campgrounds/" + req.params.id + "/edit");
                    }
                    updateCampground(req, res, location, lat, lng, result.secure_url);
                }); 
            }
        });
    });
    
    function updateCampground(req, res, location, lat, lng, result) {
        var newData = {
            name: req.body.campground.name,
            image: result,
            description: req.body.campground.description,
            cost: req.body.campground.cost,
            location: location, 
            lat: lat, 
            lng: lng};
        
            
        Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, campground){
            if(err){
                req.flash("error", err.message);
                res.redirect("back");
            } else {
                req.flash("success","Successfully Updated!");
                res.redirect("/campgrounds/" + campground._id);
            }
        });
    }
    
    // DESTROY CAMPGROUND ROUTE
    router.delete("/:id", middleware.checkCampgroundOwnership,  function(req, res){
        Campground.findByIdAndRemove(req.params.id, function(err){
            if(err){
                res.redirect("/campgrounds");
            } else {
                res.redirect("/campgrounds");
            }
        });
    });
    
    function escapeRegex(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }
    
    
    module.exports = router;