import mongoose from "mongoose";

const { Schema } = mongoose;

const tableSchema = new Schema({
    name: String, // used in grid
    number: { type: String }, // used in grid
    type: { type: String, default: 'table', enum: ['table', 'bar'] }, // used in grid
    taken: { type: Boolean, default: false }, // false if table is available, true if table has customers on it
    bills: [{ type: Schema.Types.ObjectId, ref: 'Bill' }], // podmasi
    total: { type: Number, default: 0 },
    location: { type: String, enum: ['middle', 'inside', 'outside'] }
});

const Table = mongoose.model('Table', tableSchema);

export { Table };