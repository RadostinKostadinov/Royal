import mongoose from "mongoose";

const { Schema } = mongoose;

export const ingredientSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    qty: {
        type: Number,
        required: true
    },
    buyPrice: {
        type: Number,
        match: [/^\d{1,}(\.\d{1,2})?$/, 'Цената трябва да е: пример 5.0, 3, 1.20!'],
        required: true
    },
    sellPrice: {
        type: Number,
        match: [/^\d{1,}(\.\d{1,2})?$/, 'Цената трябва да е: пример 5.0, 3, 1.20!'],
        required: true
    },
    order: { type: Number, default: 1 }, // The order that it appears in the menu!
});

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

export { Ingredient };