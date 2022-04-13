import mongoose from "mongoose";

const { Schema } = mongoose;

const tableSchema = new Schema({
    name: String,
    class: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        default: 'table',
        enum: ['table', 'wall', 'text']
    },
    total: {
        type: Number,
        default: 0,
        required: true
    },
    location: {
        type: String,
        enum: ['middle', 'inside', 'outside'],
        required: true
    }
});

const Table = mongoose.model('Table', tableSchema);

export { Table };