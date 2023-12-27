import mongoose from "mongoose";

const { Schema } = mongoose;

export const expenseTypes = ['Ток', 'Вода', 'Стока', 'Заплатa', 'Друго'];

export const expenseSchema = new Schema({
    type: {
        type: String,
        required: true,
        enum: expenseTypes,
        required: true
    },
    price: {
        type: Number,
        match: [/^\d{1,}(\.\d{1,2})?$/, 'Цената трябва да е: пример 5.0, 3, 1.20!'],
        required: true
    },
    note: {
        type: String,
        maxlength: 50
    },
    when: {
        type: Date,
        default: Date.now,
        immutable: true
    }
});

const Expense = mongoose.model('Expense', expenseSchema);

export { Expense };