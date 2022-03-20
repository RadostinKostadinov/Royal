import mongoose from "mongoose";

const { Schema } = mongoose;

const categorySchema = new Schema({
    name: String,
    isHidden: { type: Boolean, default: false },
    order: { type: Number, default: 1 }, // The order that it appears in the menu!
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }], // References to the products inside this category
});

const Category = mongoose.model('Category', categorySchema);

export { Category };