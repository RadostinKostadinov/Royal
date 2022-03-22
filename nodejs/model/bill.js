import mongoose from "mongoose";

const { Schema } = mongoose;

const billSchema = new Schema({
    products: [
        {
            name: { type: Schema.Types.ObjectId, ref: 'Product' },
            qtyBill: { type: Number, default: 1 }
        }
    ],
    total: { type: Number, default: 0 }
});

const Bill = mongoose.model('Bill', billSchema);

export { Bill };