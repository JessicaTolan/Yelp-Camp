const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});//so that it knows which account to associate this information with

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "YelpCamp", //the name of the folder that I want to use in Cloudinary to store things
        allowedFormats: ['jpeg', 'jpg', 'png']
    }

});

module.exports = {
    cloudinary,//what was configured above
    storage
}