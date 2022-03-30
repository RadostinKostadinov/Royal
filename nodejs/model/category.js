import mongoose from "mongoose";

const { Schema } = mongoose;

const categorySchema = new Schema({
    name: String,
    hidden: { type: Boolean, default: false },
    position: { type: Number, default: 1 }, // The position that it appears in the menu!
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }], // References to the products inside this category
});

const Category = mongoose.model('Category', categorySchema);

export { Category };