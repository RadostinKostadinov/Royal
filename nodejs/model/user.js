import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
    name: { type: String, unique: true, lowercase: true },
    pin: { type: String },
    role: { type: String, enum: ['admin', 'bartender', 'waiter'] },
    token: { type: String },
});

const User = mongoose.model('User', userSchema);

export { User };