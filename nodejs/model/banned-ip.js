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

const BannedIp = mongoose.model('BannedIp', bannedIpSchema);

export { BannedIp };