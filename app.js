//===============================
// REQUIRING DEPENDENCIES
//===============================

var express        = require("express"),
    app            = express(),
    bodyParser     = require("body-parser"),
    mongoose       = require("mongoose"),
    flash          = require("connect-flash"),
    cookieParser   = require("cookie-parser"),
    passport       = require("passport"),
    LocalStrategy  = require("passport-local"),
    methodOverride = require("method-override"),
    User           = require("./models/user"),
    helmet         = require("helmet"),
    session        = require("express-session");
    //seedDB         = require("./seeds");
    
    // config dotenv
    require("dotenv").load();
                        
//===============================
// REQUIRING ROUTES
//===============================
    
var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    authRoutes       = require("./routes/index"),
    contactRoutes    = require("./routes/contact"),
    forgotRoutes     = require("./routes/forgot"),
    adminRoutes      = require("./routes/admin"),
    userRoutes       = require("./routes/user");


//===============================
// APP CONFIGURATION
//===============================
    
    
    mongoose.connect(process.env.DATABASEURL, {useMongoClient: true});
    //"mongodb://kendev:9292@ds239557.mlab.com:39557/yelp_camp_kendev" 
        
    mongoose.Promise = global.Promise;

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(helmet());
    
    // use this to remove .ejs from res.render()
    app.set("view engine", "ejs");
    app.use(express.static(__dirname + "/public"));
    app.use(methodOverride("_method"));
    app.use(flash());
    app.use(cookieParser());
    app.locals.moment = require('moment');
    // seedDB(); // seed the database for testing purposes.


//===============================
// PASSPORT CONFIGURATION
//===============================

    app.use(require("express-session")({
        secret:"Napakaganda ng asawa ko at sexy pa!!!",
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

    app.use("/", authRoutes);
    app.use("/campgrounds", campgroundRoutes);
    app.use("/campgrounds/:id/comments", commentRoutes);
    app.use("/contact", contactRoutes);
    app.use(forgotRoutes);
    app.use(adminRoutes);
    app.use(userRoutes);

    
//===============================
// SERVER LISTENER
//===============================

    app.listen(process.env.PORT, process.env.IP, function() {
       console.log("YelpCamp server has started"); 
    });
    