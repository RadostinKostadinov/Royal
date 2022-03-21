import mongoose from "mongoose";

const { Schema } = mongoose;

const billSchema = new Schema({
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    total: { type: Number, default: 0 }
});

const Bill = mongoose.model('Bill', billSchema);

export { Bill };