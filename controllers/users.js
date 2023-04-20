const User = require('../modules/user');

module.exports.renderRegisterForm = (req, res) => {
    res.render('user/register')
};

module.exports.registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);//this will hash and salt the password for us
        req.login(registeredUser, err => {
            if (err) { return next(err) }
            req.flash('sucess', 'Welcome to Yelp Camp');
            res.redirect('/campgrounds');
        })

    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register')
    }

};

module.exports.renderLoginForm = (req, res) => {
    res.render('user/login');
};

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome Back');
    const redirectedURL = req.session.returnTo || '/campgrounds';
    console.log(redirectedURL)
    delete req.session.returnTo;
    res.redirect(redirectedURL);
};

module.exports.logout = (req, res) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        req.flash('success', 'Goodbye');
        res.redirect('/campgrounds');
    });
};
