var express         = require("express"),
    Campground      = require("../models/campground"),
    middleware      = require("../middleware"),
    geocoder        = require("geocoder"),
    multer          = require('multer'),
    cloudinary      = require('cloudinary');
   
    require("dotenv").config();
    
    var router          = express.Router(),
        storage = multer.diskStorage({
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
    
    
    cloudinary.config({ 
      cloud_name: 'de6uaupbi', 
      api_key: process.env.CLOUDINARY_API_KEY, 
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
   

    //INDEX ROUTE    
    router.get("/", function(req, res) {
        if(req.query.search) {
            const regex = new RegExp(escapeRegex(req.query.search), "gi");
            Campground.find({name: regex}, function(err, allCampgrounds) {
           if(err) {
               console.log(err);
           } else {
               if(allCampgrounds.length == 0) {
                   req.flash("error", "No Campground Match to that query, please try again.");
                   res.redirect("/campgrounds");
               }
               res.render("campgrounds/index", {campgrounds : allCampgrounds, page: 'campgrounds'});
           }
        });
        } else {
            Campground.find({}, function(err, allCampgrounds) {
           if(err) {
               console.log(err);
           } else {
               res.render("campgrounds/index", {campgrounds : allCampgrounds, page: 'campgrounds'});
           }
        });
        }
        
    });
    
    // CREATE ROUTE  
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
                    lng: lng};
                
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
    
    // NEW ROUTE    
    router.get("/new", middleware.isLoggedIn, function(req, res) {
       res.render("campgrounds/new");
    });
    
    // SHOW ROUTE  
    router.get("/:id", function(req, res) {
        Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
            if(err || !foundCampground) {
                req.flash("error", "Campground not found");
                res.redirect("/campgrounds"); 
            } else {
                console.log(foundCampground);
                res.render("campgrounds/show", {campground: foundCampground}); 
            }
        });
    });
    
    // EDIT CAMPGROUND ROUTE
    router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
        Campground.findById(req.params.id, function(err, foundCampground) {
            if(err) {
                console.log(err);
            } else {
                res.render("campgrounds/edit", {campground: foundCampground});
            }
        });
    });
    
    // UPDATE CAMPGROUND ROUTE
    router.put("/:id", middleware.checkCampgroundOwnership, function(req, res) {
        geocoder.geocode(req.body.location, function (err, data) {
            if(err || !data || data == undefined) {
                req.flash("error", "Location not found");
               return res.redirect("/campgrounds/" + req.params.id);
            }
            
            if(!data.results[0].geometry.location.lat || !data.results[0].geometry.location.lng) {
                req.flash("error", "Location not found");
               return res.redirect("/campgrounds/" + req.params.id);
            }
            var lat = data.results[0].geometry.location.lat;
            var lng = data.results[0].geometry.location.lng;
            
            
            
            var location = data.results[0].formatted_address;
            var newData = {name: req.body.campground.name, image: req.body.campground.image, description: req.body.campground.description, cost: req.body.campground.cost, location: location, lat: lat, lng: lng};
            Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, updatedCampground) {
               if(err){
                   req.flash("error", err.message);
                   res.redirect("back");
               } else {
                   req.flash("success", "Successfuly edited a campground");
                   res.redirect("/campgrounds/" + req.params.id);
               }
            }); 
        });
    });
    
    // DESTROY CAMPGROUND ROUTE
    router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
        Campground.findByIdAndRemove(req.params.id, function(err) {
            if(err) {
                console.log(err);
                res.redirect("/campgrounds");
            } else {
                req.flash("success", "Successfuly deleted a campground");
                res.redirect("/campgrounds");
            }
        });    
    });
    
    function escapeRegex(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }
    
    module.exports = router;
    