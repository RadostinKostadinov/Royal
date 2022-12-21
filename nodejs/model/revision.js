import mongoose from "mongoose";

const { Schema } = mongoose;

const revisionSchema = new Schema({
    products: [
        {
            type: {
                type: String,
                enum: ['product', 'ingredient'],
                required: true
            },
            name: {  // Статично име на продукта (дори да се изтрие от БД няма проблем)
                type: String,
                immutable: true,
                required: true
            },
            oldQty: { // Колко бройки сме добавили/бракували/...
                type: Number,
                immutable: true,
                required: true
            },
            newQty: { // Не е задължително, ако го няма значи всичко е излязло и не е въведена нова стойност (не е липсвало или имало повече от колкото е пишело в склада)
                type: Number,
                immutable: true
            },
            productRef: { // референция за всеки случай (ако искаме да филтрираме на някой етап)
                type: Schema.Types.ObjectId,
                ref: 'Product',
                immutable: true
            },
            ingredientRef: { // референция за всеки случай (ако искаме да филтрираме на някой етап)
                type: Schema.Types.ObjectId,
                ref: 'Ingredient',
                immutable: true
            },
            unit: {
                type: String,
                enum: ['кг', 'л', 'бр'],
                immutable: true
            }
        }
    ],
    when: {
        type: Date,
        default: Date.now,
        immutable: true
    }
});

const Revision = mongoose.model('Revision', revisionSchema);

export { Revision };