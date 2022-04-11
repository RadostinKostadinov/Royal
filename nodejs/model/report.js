import mongoose from "mongoose";
const { Schema } = mongoose;

const reportSchema = new Schema({
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
    income: { //  Продажби (платени продукти)
        type: Number,
        required: true
    },
    consumed: { // Консумация (продуктите които е консумирал служителя)
        type: Number,
        default: 0,
        required: true
    },
    scrapped: { // Бракувани продукти
        type: Number,
        default: 0,
        required: true
    },
    total: { // = Общ приход - консумация - брак
        type: Number,
        required: true
    },
    when: {
        type: Date,
        default: Date.now
    }
});

const Report = mongoose.model('Report', reportSchema);

export { Report };