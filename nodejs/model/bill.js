import mongoose from "mongoose";

const { Schema } = mongoose;

const billSchema = new Schema({
    products: [
        {
            product: { type: Schema.Types.ObjectId, ref: 'Product' },
            qty: { type: Number, default: 1 }
        }
    ],
    total: { type: Number, default: 0 }
});

const Bill = mongoose.model('Bill', billSchema);

export { Bill };