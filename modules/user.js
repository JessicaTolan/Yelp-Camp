const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})

UserSchema.plugin(passportLocalMongoose);//using this will automatically add the username and password as a property of this schema. The password received will then be hased and salted automatically.
module.exports = mongoose.model('User', UserSchema);//now we can create new User objects that follow this Schema.