const Review = require('./modules/reviews');
const Campground = require('./modules/campground');
const { campgroundSchema, reviewSchema } = require('./schemas');//to use the JOI validations
const ExpressError = require('./utils/ExpressError');


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl // to store the URL that someone was trying to get to before they were prompted to login
        console.log(req.session.returnTo)
        req.flash('error', 'You must be logged in first');
        return res.redirect('/login');
    }
    next();
}
///////AUTHORISATION FOR CAMPGROUNDS///////////////////////////////////////////
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();

};

///////AUTHORISATION FOR REVIEWS///////////////////////////////////////////
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewID } = req.params;
    const review = await Review.findById(reviewID);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();

};

////////////ERROR FUNCTION for campgrounds ////////////////////////////////////////////////////
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

///////////////////////////////////////////////////////////////////////////////

///////////Error Function for reviews///////////////////////////////////////////////////


module.exports.validateReview = (req, res, next) => {
    const result = reviewSchema.validate(req.body);
    const { error } = result;
    if (error) {
        const msg = error.details.map(err => err.message).join('.')
        throw new ExpressError(msg, 400);
    } else {
        next();
    };
}
