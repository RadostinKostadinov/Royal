import mongoose from "mongoose";

const { Schema } = mongoose;

const addonsSchema = new Schema({
    categories: [{
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }], // Reference to which category/categories this addon applies
    name: {
        type: String,
        required: true
    },
    qty: {
        type: Number,
        match: [/^\d*$/, 'Количеството трябва да е просто число: пример 5, 50, 220']
    }, // if it has ingridients, then it shouldnt have a qty
    ingredients: [
        {
            ingredient: { type: Schema.Types.ObjectId, ref: 'Ingredient' },
            qty: { type: Number, min: 1 } // how much of this ingredient does it take (for ex. if 1 coffee takes 20ml milk, then qty = 20)
        }
    ],
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
    position: { type: Number, default: 1 }, // The position that it appears in the menu!
});

const Addon = mongoose.model('Addon', addonsSchema);

export { Addon };