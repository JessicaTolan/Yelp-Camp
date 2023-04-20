const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync'); //to be able to use the error catcher for async functions
const ExpressError = require('../utils/ExpressError');
const passport = require('passport');
const user = require('../controllers/users');

router.route('/register')
    .get(user.renderRegisterForm)
    .post(catchAsync(user.registerUser));

router.route('/login')
    .get(user.renderLoginForm)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), user.login);

router.get('/logout', user.logout);

module.exports = router;
