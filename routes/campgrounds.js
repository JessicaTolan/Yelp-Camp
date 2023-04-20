const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync'); //to be able to use the error catcher for async functions

const methodOverride = require('method-override');
router.use(methodOverride('_method'));

router.use(express.urlencoded({ extended: true }))

const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

const campgrounds = require('../controllers/campgrounds');


const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });//telling multer to store things in the storage variable that was created in the cloudinary folder which will store images in cloudinary


router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));
// .post(upload.array('image'), (req, res) => {
//     console.log(req.body, req.files);
//     res.send('IT WORKED!!')
// })

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('img'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));





module.exports = router;