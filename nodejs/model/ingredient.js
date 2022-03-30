import mongoose from "mongoose";

const { Schema } = mongoose;

export const ingredientSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    unit: { // как ще го вкарва анатоли (в кг, в Л или бройки) - от това зависи дали ще ги умножава като ги вкарва автоматично
        type: String,
        required: true,
        enum: ['кг', 'л', 'бр']
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
    position: { type: Number, default: 1 }, // The position that it appears in the menu!
});

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

export { Ingredient };