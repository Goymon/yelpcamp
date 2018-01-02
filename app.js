//===============================
// REQUIRING DEPENDENCIES
//===============================

var express             = require("express"),
    app                 = express(),
    bodyParser          = require("body-parser"),
    mongoose            = require("mongoose"),
    Campground          = require("./models/campground"),
    passport            = require("passport"),
    flash               = require("connect-flash"),
    LocalStrategy       = require("passport-local"),
    Comment             = require("./models/comment"),
    User                = require("./models/user"),
    seedDB              = require("./seeds"),
    methodOverride      = require("method-override");
                        
//===============================
// REQUIRING ROUTES
//===============================
    
var campgroundRoutes    = require("./routes/campgrounds"),
    commentdRoutes      = require("./routes/comments"),
    indexRoutes         = require("./routes/index");

//===============================
// APP CONFIGURATION
//===============================

    mongoose.connect("mongodb://localhost/yelp_camp", {useMongoClient: true});
    app.use(bodyParser.urlencoded({extended: "true"}));
    app.use(express.static(__dirname + "/public"));
    app.set("view engine", "ejs");    
    app.use(methodOverride("_method"));
    app.use(flash());
    app.locals.moment = require('moment');
    // seedDB();


//===============================
// PASSPORT CONFIGURATION
//===============================

    app.use(require("express-session")({
        secret:"Napakaganda ng assawa ko at sexy pa!!!",
        resave: false,
        saveUninitialized: false
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());


//===============================
// OTHER CONFIGURATION
//===============================
    
    app.use(function(req, res, next) {
       res.locals.currentUser = req.user;
       res.locals.error = req.flash("error");
       res.locals.success = req.flash("success");
       next();
    });

    app.use("/campgrounds", campgroundRoutes);
    app.use("/campgrounds/:id/comments", commentdRoutes);
    app.use(indexRoutes);

    
//===============================
// SERVER LISTENER
//===============================

    app.listen(process.env.PORT, process.env.IP, function() {
       console.log("YelpCamp server has started"); 
    });