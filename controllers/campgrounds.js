//this file will contain all the campground functions to help keep in line with the MVC framework (models, views and controller framework)
const Campground = require('../modules/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const allCampgrounds = await Campground.find({});
    res.render('campgrounds/index', { allCampgrounds });
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')

};

module.exports.createCampground = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const newCampground = new Campground(req.body.campground);
    newCampground.geometry = geoData.body.features[0].geometry;
    newCampground.author = req.user._id;
    newCampground.images = req.files.map(f => ({ url: f.path, filename: f.filename })); // req.files is an array of objects so f is that and it has properties like path and filename which we are matching to names in our Campground model
    console.log(newCampground);
    await newCampground.save();
    req.flash('success', 'Successfully added a campground');
    res.redirect(`/campgrounds/${newCampground._id}`);

};

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');//this will find a campground and then for each review it will populate the author and also the author of that campground
    if (!foundCampground) {
        req.flash('error', 'Cannot find this campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { foundCampground });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot update this campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
};

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const updatedCampground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));//this return an array of images 
    updatedCampground.images.push(...imgs);//this takes the images in the array above and puts them into the image array of the updated campground§
    await updatedCampground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);//delete the image from cloudinary
        }
        await updatedCampground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });//in the images array of a campground pull out/delete those whose filename is in the deleteImages Array 
    }
    req.flash('success', `Successfully updated ${updatedCampground.title} campground`);
    res.redirect(`/campgrounds/${updatedCampground._id}`)
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const deletedCampground = await Campground.findByIdAndDelete(id);
    req.flash('success', `Successfully deleted ${deletedCampground.title} campground`);
    res.redirect('/campgrounds')
};


