import mongoose from "mongoose";

const { Schema } = mongoose;

const billSchema = new Schema({
    user: { // If personal bill (for consumation)
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    table: {
        type: Schema.Types.ObjectId,
        ref: 'Table'
    },
    number: Number, // used in History to track if Bill 1, Bill 2...
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