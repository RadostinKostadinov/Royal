import mongoose from "mongoose";

async function mongoConfig() {
  // Initialize Mongoose
  let options = {};

  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/test";

  if (process.env.MONGO_USER)
    options = {
      user: process.env.MONGO_USER,
      pass: process.env.MONGO_PASS,
      authSource: "admin",
      useNewUrlParser: true,
    };

  await mongoose
    .connect(uri, options)
    .then(console.log("Connected to MongoDB at " + uri))
    .catch((err) => console.log("Error connecting to MongoDB: " + err));
}

export { mongoConfig };
