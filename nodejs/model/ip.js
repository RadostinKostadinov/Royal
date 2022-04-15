import mongoose from "mongoose";
const { Schema } = mongoose;

const bannedIpSchema = new Schema({
    ip: {
        type: String,
        required: true
    },
    when: {
        type: Date,
        default: Date.now
    }
});

const safeIpSchema = new Schema({
    ip: {
        type: String,
        required: true
    },
    when: {
        type: Date,
        default: Date.now
    }
});

const BannedIp = mongoose.model('BannedIp', bannedIpSchema);
const SafeIp = mongoose.model('SafeIp', safeIpSchema);

export { BannedIp, SafeIp };