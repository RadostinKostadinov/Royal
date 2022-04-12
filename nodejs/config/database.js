import mongoose from "mongoose";
import { inDevMode } from "../app.js";

async function mongoConfig() {
    // Initialize Mongoose
    let options = {};
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/royal";

    if (!inDevMode)
        options = {
            user: process.env.MONGO_USER,
            pass: process.env.MONGO_PASS,
            authSource: "admin",
            useNewUrlParser: true
        }

    await mongoose.connect(uri, options)
        .then(console.log('Connected to MongoDB at ' + uri));
}

export { mongoConfig };