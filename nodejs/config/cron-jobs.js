import cron from 'node-cron'
import { Bill } from '../model/bill.js';
import { ProductHistory } from '../model/history.js';
import { Ingredient } from '../model/ingredient.js';
import { Product } from '../model/product.js';

export async function startCronJobs() {
    // Mark all tables as paid every day at 04:00 and delete bills
    cron.schedule('0 4 * * *', async () => {
        const allBills = await Bill.find().populate('products.product');

        for (let bill of allBills) {
            if (bill.products.length === 0) continue; // if no products, skip this bill and go to the next

            let historyProducts = [];
            let historyTotal = 0;

            for (let product of bill.products) { // for every product
                // remove product qty from inventory
                // first check if from ingredients
                let ingredientsArray = [];
                const prodRef = await Product.findById(product.product._id);
                if (prodRef.ingredients.length === 0) {
                    prodRef.qty -= product.qty;
                } else {
                    for (let ingredient of prodRef.ingredients) {
                        const ingredientRef = await Ingredient.findById(ingredient.ingredient);
                        ingredientRef.qty -= ingredient.qty;
                        ingredientRef.save();
                        ingredientsArray.push({
                            name: ingredientRef.name,
                            qty: ingredient.qty,
                            price: ingredientRef.sellPrice,
                            ingredientRef: ingredientRef._id
                        });
                    }
                }

                prodRef.save();

                historyProducts.push({
                    name: product.product.name,
                    qty: product.qty,
                    price: product.product.sellPrice,
                    productRef: product.product._id,
                    ingredients: ingredientsArray
                });
                historyTotal += product.product.sellPrice * product.qty;
                break; // start searching for next product
            }
            // Add action to history
            ProductHistory.create({
                user: {
                    name: 'Система'
                },
                action: 'paid',
                table: bill.table,
                billNumber: bill.number,
                total: historyTotal,
                products: historyProducts
            });
        }

        // Delete all bills
        await Bill.deleteMany({});
        console.log('All bills have been automatically paid and removed!');
    });
}