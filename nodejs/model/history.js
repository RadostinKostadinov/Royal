import mongoose from "mongoose";

const { Schema } = mongoose;

const possibleActions = [
    'removed', // Product Removed From Bill (премахнат 1 брой продукт от сметка, НЕ Е БРАКУВАН (премахнат от червеният Х до всеки продукт в контролното табло на масата))
    'added', // Product Added To Bill (добавени X броя продукт към сметка)
    'paid', // Paid From Bill (платени Х броя продукт от сметка)
    'scrapped', // Бракувани
    'consumed' // Консумирано от служителя
];

const restockHistorySchema = new Schema({
    reviewed: { // Анатоли го е видял, и го маркира като прочетен (да спре да свети в червено)
        type: Boolean,
        default: false,
        required: true
    },
    product: {
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
        qty: { // Колко бройки сме добавили/бракували/...
            type: Number,
            immutable: true,
            required: true
        },
        buyPrice: {
            type: Number,
            immutable: true,
            required: true
        },
        expireDate: {
            type: Date,
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
    },
    when: {
        type: Date,
        default: Date.now,
        immutable: true
    }
});

const productHistorySchema = new Schema({
    user: {  // потребител
        name: {  // запазваме статично името, дори да се изтрие от БД няма проблем
            type: String,
            immutable: true,
            required: true
        },
        userRef: { // референция за всеки случай (ако искаме да филтрираме на някой етап)
            type: Schema.Types.ObjectId,
            ref: 'User',
            immutable: true
        },
    },
    action: { // действие (пр. брак на продукт, зареждане в склад, плащане ..)
        type: String,
        enum: possibleActions,
        immutable: true,
        required: true
    },
    table: { // референция към масата
        type: Schema.Types.ObjectId,
        ref: 'Table',
        immutable: true,
    },
    billNumber: { // номер на сметка (подмаса), както са бутоните 1,2,3,4,5,6
        type: Number,
        immutable: true
    },
    discount: Number,
    total: { // Обща сума при плащане, бракуване, консумиране
        type: Number,
        immutable: true
    },
    products: [
        {
            name: {  // Статично име на продукта (дори да се изтрие от БД няма проблем)
                type: String,
                immutable: true,
                required: true
            },
            qty: { // Колко бройки сме добавили/бракували/...
                type: Number,
                immutable: true,
                required: true
            },
            buyPrice: { // Каква е била цената на този продукт при бракуване/зареждане.. (с времето може да се промени)
                type: Number,
                immutable: true,
                required: true
            },
            sellPrice: {
                type: Number,
                immutable: true,
                required: true
            },
            productRef: { // референция за всеки случай (ако искаме да филтрираме на някой етап)
                type: Schema.Types.ObjectId,
                ref: 'Product',
                immutable: true,
                required: true
            },
            ingredients: [
                {
                    name: {  // Статично име на съставката (дори да се изтрие от БД няма проблем)
                        type: String,
                        immutable: true,
                        required: true
                    },
                    qty: { type: Number, min: 1, immutable: true }, // how much of this ingredient does it take (for ex. if 1 coffee takes 20ml milk, then qty = 20)
                    ingredientRef: { type: Schema.Types.ObjectId, ref: 'Ingredient', immutable: true },
                }
            ],
        }
    ],
    reviewed: { // дали анатоли го е видял
        type: Boolean,
        default: false,
        required: true
    },
    reviewedDate: Date,
    when: { // дата на събитие
        type: Date,
        default: Date.now,
        immutable: true
    }
});

const ProductHistory = mongoose.model('ProductHistory', productHistorySchema);
const RestockHistory = mongoose.model('RestockHistory', restockHistorySchema);

export { ProductHistory, RestockHistory };