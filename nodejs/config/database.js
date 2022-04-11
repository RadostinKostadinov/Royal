import mongoose from "mongoose";

async function mongoConfig() {
    // Initialize Mongoose

    //TODO Да видя как да си направя dev/prod .env file (за dev tiq user,pass,authsource ne trqbva da gi ima)
    //https://stackoverflow.com/questions/10694571/verify-if-my-node-js-instance-is-dev-or-production
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/royal", {
        user: process.env.MONGO_USER,
        pass: process.env.MONGO_PASS,
        authSource: "admin",
        useNewUrlParser: true,
    })
        .then(console.log('Connected to MongoDB at ' + (process.env.MONGO_URI || "mongodb://127.0.0.1:27017/royal")));
    /* await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/royal")
        .then(console.log('Connected to MongoDB at ' + (process.env.MONGO_URI || "mongodb://127.0.0.1:27017/royal"))); */

}

export { mongoConfig };