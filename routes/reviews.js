const express = require('express');
const router = express.Router({ mergeParams: true });//allows us to have access to the parms of a campground as routers tend to separate objects

const catchAsync = require('../utils/catchAsync'); //to be able to use the error catcher for async functions
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews');

//////////////REVIEWS ///////////////////////////////////////////////

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))// pushs a review onto the campground object


///////////////////////////////////////////////////////////////////////

////////////////DELETE REVIEW IN REVIEW AND CAMPGROUND///////////////////////

router.delete('/:reviewID', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))
/////////////////////////////////////////////////////////////////////////////

module.exports = router;