import mongoose from "mongoose";

const { Schema } = mongoose;

const orderSchema = new Schema({
    products: [
        {
            name: String,
            qty: Number,
            buyPrice: Number,
            sellPrice: Number,
            total: { // auto calculated product total
                type: Number,
                default: function () {
                    return this.qty * this.sellPrice
                }
            }
        }
    ],
    total: { // auto calculated total from all products totals
        type: Number,
        default: function () {
            return this.products.reduce((prevProduct, currentProduct) => prevProduct.total + currentProduct.total)
        }
    },
    date: {
        type: Date,
        default: Date.now,
        immutable: true
    }
});

const Order = mongoose.model('Order', orderSchema);

export { Order };