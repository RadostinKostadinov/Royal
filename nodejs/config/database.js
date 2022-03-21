import mongoose from "mongoose";

async function mongoConfig() {
    // Initialize Mongoose
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/royal")
        .then(console.log('Connected to MongoDB at ' + (process.env.MONGO_URI || "mongodb://127.0.0.1:27017/royal")));
}

export { mongoConfig };