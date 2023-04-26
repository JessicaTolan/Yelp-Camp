//brew services start mongodb-community@6.0 -- to use mongoDB
//brew services stop mongodb-community@6.0 -- to stop using it

if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
};

/////BASIC SET UP//////////////////////////////////////////////////////////////////////////
const express = require('express');
const app = express();

const path = require('path');
app.set('views', path.join(__dirname, 'views')); //access the folder from anywhere
app.set('view engine', 'ejs'); // so we can use ejs as the templating engine

app.use(express.urlencoded({ extended: true })); // to have access to req.body
app.use(express.static(path.join(__dirname, 'public')));

const ejsMate = require('ejs-mate');//to use ejs-mate
app.engine('ejs', ejsMate);//so ejs has a default engine called ejs but we want it to use ejs-mate engine instead
//the point of ejs-mate is so that I can define a layput that could be used by every page if I wanted it to be rather that having to do a layout for each page


const catchAsync = require('./utils/catchAsync'); //to be able to use the error catcher for async functions
const ExpressError = require('./utils/ExpressError');//to have access to the custome error class

const methodOverride = require('method-override');
app.use(methodOverride('_method')); //to get the form to update the put instead of post

const dbURL = 'mongodb://127.0.0.1:27017/yelp-camp' //process.env.MONGO_URL;
////////REQUIRING HELMET//////////////////////////////////////////////////////////////
const helmet = require('helmet');

////////REQUIRING THE ROUTES//////////////////////////////////////////////////////////
const campgroundRoutes = require('./routes/campgrounds');//to use the campground routes
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/user');

//////SETTING UP SESSIONS///////////////////////////////////////////////////////////////
const session = require('express-session');
const MongoStore = require('connect-mongo');

const store = MongoStore.create({
    mongoUrl: dbURL,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});
app.use(session({
    store,//this is so that everything is stored on mongo online
    name: 'specialness', //this will disguise the session so someone will find it harder to steal session information if they dont know which name the info is under
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,//basic security
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7), //this line is to limit the the time that a user can stay logged in-- in this case it is a week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

////////CONFIGURING PASSPORT//////////////////////////////////////////////////////////
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./modules/user')
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());//to see what all of these do look at the passport docs


/////SETTING UP FLASH///////////////////////////////////////////////////////////////////
const flash = require('connect-flash');
app.use(flash());//to get the pop ups when a user does something like create a campground
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;// all 3 of these are global variables that we have access to everywhere!
    next();
})


//////////USING THE ROUTES//////////////////////////////////////////////////////////////////
app.use('/campgrounds', campgroundRoutes);//making all the campground routes start with /campgrounds
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);


////////Setting up Mongoose /////////////////////////////////////////////////////
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
//'mongodb://127.0.0.1:27017/yelp-camp'
mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected!!');
    })
    .catch(e => {
        console.log("Oh no something went wrong");
        console.log(e);
    })

//const Campground = require('./modules/campground');//look in the modules folder and then in campround and this is ok because we are in the YelpCamp
//const { findById } = require('./modules/campground');
//we have created a model called Campground which will have in all information in the db with campground schema
/////////MONGO SANITIZE//////////////////////////////////////////////////////////////

const mongoSanitize = require

////////USING HELMET/////////////////////////////////////////////////////
app.use(helmet());//security

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dwidriwu2/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);//this is so that update the default content security feature in helmet so that it allows outside scipts and images etc.
/////////////HOME PAGE///////////////////////////////////////////////////

app.get('/', (req, res) => {
    res.render('campgrounds/home')
})

/////////////CUSTOM ERROR HANDLING MIDDLEWARE ///////////////////////////

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh no something went wrong";
    res.status(statusCode).render('error', { err });
})//err here could be ExpressError or it could be another type of error so basically it is a custom or a default error


app.listen(3000, () => {
    console.log('Listening on port 3000');
});
