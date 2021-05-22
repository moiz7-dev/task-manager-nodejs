const { MongoClient, ObjectID } = require('mongodb')

const connectionURL = 'mongodb://127.0.0.1:27019'
const databaseName = 'task-manager'

MongoClient.connect(connectionURL, { useNewUrlParser: true, useUnifiedTopology: true}, (error, client) => {
    if(error) {
        return console.error('Unable to connect with the database!')
    }

    console.log('connected successfully!')

    db = client.db(databaseName)

    // db.collection('users').insertOne({
    //     name: 'Moiz',
    //     age: 21
    // })

    // db.collection('task').insertMany([
    //     {
    //         description: 'Bazaar se maggi lana',
    //         complete: false
    //     },
    //     {
    //         description: 'Medical se GoodKnight lana',
    //         complete: true
    //     },
    //     {
    //         description: 'Subah jaldi uthna',
    //         complete: false
    //     }
    // ], (error, result) => {
    //     if(error) {
    //         return console.log('Unable to insert documents!')
    //     }

    //     console.log(result.ops)
    // })

    // db.collection('task').findOne({
    //     _id: new ObjectID('6092ddc13bcc4b60ce977104'),
    // }, (error, user) => {
    //     console.log(user)
    // })

    // db.collection('task').find({ complete: false}).toArray((error, result) => {
    //     console.log(result)
    // })

    // db.collection('task').updateMany({ 
    //     complete: false
    // }, [{
    //     $set: { complete: true}
    // }]).then((success) => {
    //     console.log(success)
    // }).catch((error) => {
    //     console.log(error)
    // })

    db.collection('task').deleteOne({
        description: 'Medical se GoodKnight lana'
    }).then((success) => {
        console.log(success)
    }).catch((error) => {
        console.log(error)
    })

})