const Review = require('../modules/reviews');
const Campground = require('../modules/campground');


module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    review.author = req.user._id;
    await review.save();
    await campground.save();
    req.flash('success', 'Sucessfully added a review');
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewID } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewID } })//to get rid of the reviews in campground also
    await Review.findByIdAndDelete(reviewID);
    req.flash('success', 'Sucessfully removed review');
    res.redirect(`/campgrounds/${id}`)
};