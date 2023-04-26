const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected!!');
    })
    .catch(e => {
        console.log("Oh no something went wrong");
        console.log(e);
    })

const Campground = require('../modules/campground');//come out of the seeds folder and then look into the modules folder
const cities = require('./cities');
const { descriptors, places } = require('./seedHelper');

const seedsDB = async () => {
    await Campground.deleteMany({});
    for (let num = 0; num < 400; num++) {
        const randomGenerator = Math.floor((Math.random() * cities.length) + 1);
        const randomDes = Math.floor((Math.random() * descriptors.length) + 1);
        const randomPlaces = Math.floor((Math.random() * places.length) + 1);
        const randomPrice = Math.floor((Math.random() * 20) + 10);
        const newInfo = new Campground({
            location: `${cities[randomGenerator].city}, ${cities[randomGenerator].state}`,
            title: `${places[randomPlaces]} ${descriptors[randomDes]}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dwidriwu2/image/upload/v1681907896/YelpCamp/mcqumngeavb9cp9zxju8.jpg',
                    filename: 'YelpCamp/mcqumngeavb9cp9zxju8',
                }
            ],
            geometry: {
                type: "Point",
                coordinates: [
                    cities[randomGenerator].longitude,
                    cities[randomGenerator].latitude
                ]
            },
            price: randomPrice,
            author: '643462b062d04b0b186253e7',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi exercitationem obcaecati quod impedit odit eos accusamus expedita cum molestias labore modi amet corporis distinctio dignissimos, nisi, placeat fugit veritatis recusandae.'
        })
        await newInfo.save();
    }

}
seedsDB();