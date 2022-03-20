import mongoose from "mongoose";

const { Schema } = mongoose;

export const productSchema = new Schema({
    category: { type: Schema.Types.ObjectId, ref: 'Category' }, // Reference to the product's category
    name: String,
    qty: Number,
    buyPrice: {
        type: Number,
        match: [/^\d{1,}(\.\d{1,2})?$/, 'Цената трябва да е: пример 5.0, 3, 1.20!']
    },
    sellPrice: {
        type: Number,
        match: [/^\d{1,}(\.\d{1,2})?$/, 'Цената трябва да е: пример 5.0, 3, 1.20!']
    },
    order: { type: Number, default: 1 }, // The order that it appears in the menu!
    forBartender: Boolean // true = show on bartender screen, false = dont
});

const Product = mongoose.model('Product', productSchema);

export { Product };