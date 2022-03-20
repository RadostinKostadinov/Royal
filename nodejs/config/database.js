import mongoose from "mongoose";

async function mongoConfig() {
    // Initialize Mongoose
    await mongoose.connect(process.env.MONGO_URI)
        .then(console.log('Connected to MongoDB at ' + process.env.MONGO_URI));
}

export { mongoConfig };