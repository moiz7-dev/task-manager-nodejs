const mongoose = require('mongoose');

//connection to database
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}, (error) => {
    if (error) {
        return console.log(error)
    }
    console.log('Connected to database!')
})
