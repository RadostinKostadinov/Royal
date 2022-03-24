import mongoose from "mongoose";

const { Schema } = mongoose;

const possibleActions = [
    'removed', // Product Removed From Bill (премахнат 1 брой продукт от сметка, НЕ Е БРАКУВАН (премахнат от червеният Х до всеки продукт в контролното табло на масата))
    'added', // Product Added To Bill (добавени X броя продукт към сметка)
    'payed', // Payed From Bill (платени Х броя продукт от сметка)
    'restocked', // Restocked in inventory (зареждане на стока от Анатоли)
];

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
            immutable: true,
            required: true
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
        ref: 'User',
        immutable: true,
        required: true
    },
    billNumber: { // номер на сметка (подмаса), както са бутоните 1,2,3,4,5,6
        type: Number,
        immutable: true
    },
    product: {
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
        price: { // Каква е била цената на този продукт при бракуване/зареждане.. (с времето може да се промени)
            type: Number,
            immutable: true,
            required: true
        },
        productRef: { // референция за всеки случай (ако искаме да филтрираме на някой етап)
            type: Schema.Types.ObjectId,
            ref: 'Product',
            immutable: true,
            required: true
        }
    },
    when: { // дата на събитие
        type: Date,
        default: Date.now,
        immutable: true
    }
});

const ProductHistory = mongoose.model('ProductHistory', productHistorySchema);

export { ProductHistory };