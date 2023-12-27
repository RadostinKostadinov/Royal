import mongoose from "mongoose";

const { Schema } = mongoose;

const userTypes = ['admin', 'bartender', 'waiter'];

const userSchema = new Schema({
    name: { type: String, unique: true, lowercase: true },
    pin: { type: String },
    role: { type: String, enum: userTypes },
    isDev: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

export { User };