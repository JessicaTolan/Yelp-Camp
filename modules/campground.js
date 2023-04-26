const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./reviews');

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
});//we use this so that we dont have to store the replaced url in our model or database because we are just deriving it from the info that we are already storing 

const opts = { toJSON: { virtuals: true } };//to help the clusterMap code to not ignore JSON code 
const CampgroundSchema = new Schema({
    title: {
        type: String
    },
    price: {
        type: Number
    },
    description: {
        type: String
    },
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    location: {
        type: String
    },
    images: [
        ImageSchema
    ],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, opts);

CampgroundSchema.virtual('properties.popUPmsg').get(function () {
    return `
    <a href="/campgrounds/${this._id}">${this.title}</a>
    <p>${this.description.substring(0, 20)}...</p>`
});

CampgroundSchema.post('findOneAndDelete', async (doc) => {
    if (doc) {//if there was something to be deleted 
        await Review.deleteMany({//we are deleting many things from the review object but looking in the campground[review] for them
            _id: {
                $in: doc.reviews//go in the campground object and delete the reviews. the in part is saying that it is somewhere in the review array
            }
        })
    }
})
//this only works because the delete route for campground uses findByIdAndDelete which calls the findOneAndDelete middleware which runs after the deletion has happened
//this is why it post and not pre as this will run after the campground has been deleted. We still have access to the thing that was deleted 

module.exports = mongoose.model('Campground', CampgroundSchema); //exports a model called Campground which follows CampgroundSchema