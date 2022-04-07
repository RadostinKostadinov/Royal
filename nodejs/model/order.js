import mongoose from "mongoose";

const { Schema } = mongoose;

const orderSchema = new Schema({
    tableNumber: {
        type: Number,
        required: true
    },
    products: [
        {
            prodRef: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            name: { // Име на продукта
                type: String,
                required: true
            },
            qty: { // Колко бройки са поръчани
                type: Number,
                required: true
            },
            completed: { // Дали барманът е приготвил продукта
                type: Boolean,
                default: false,
                required: true
            },
        }
    ],
    when: { // Кога е направена поръчката
        type: Date,
        default: Date.now
    }
});

const Order = mongoose.model('Order', orderSchema);

export { Order };