import { Bill } from "../../model/bill.js";
import { ProductHistory } from "../../model/history.js";
import { Ingredient } from "../../model/ingredient.js";
import { Product } from "../../model/product.js";
import { Table } from "../../model/table.js";

export function billsRoutes(app, auth) {
    app.post('/getLastPaidBillByTableId', auth, async (req, res) => {
        try {
            const { _id, billId } = req.body;

            // Get bill
            const bill = await Bill.findById(billId);

            // Find in history by id

            const allPaid = await ProductHistory.find({
                action: 'paid',
                billNumber: bill.number,
                table: _id
            });

            let lastPaid;

            if (allPaid.length)
                lastPaid = allPaid[allPaid.length - 1];

            res.json(lastPaid);
        } catch (error) {
            console.error(error);
            res.status(500).send('Възникна грешка!');
        }
    });

    app.post('/sellProducts', auth, async (req, res) => {
        try {
            const { billToPay } = req.body;

            if (billToPay.products.length === 0)
                return res.status(404).send('Няма продукти в сметката');

            let historyProducts = [];
            let historyTotal = 0;

            /* 
                1. Remove from original bill
                1.1 Products
                1.1 Remove sum from bill total
                2. Remove products from inventory
                2.1 Check if from ingredients
                3. Add to history
            */

            const originalBill = await Bill.findById(billToPay._id);
            for (let product of billToPay.products) { // for every product to pay
                for (let [index, prd] of Object.entries(originalBill.products)) { // check against every product in original bill
                    if (product.product._id.toString() === prd.product.toString()) {
                        // remove qty from original bill
                        originalBill.total = +originalBill.total.toFixed(2) - product.product.sellPrice * product.qty;

                        prd.qty -= product.qty;
                        if (prd.qty === 0)
                            originalBill.products.splice(index, 1);

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
                }
            }

            originalBill.save();
            res.send('Продуктите са платени');

            // Add action to history
            ProductHistory.create({
                user: {
                    name: req.user.name,
                    userRef: req.user.uid
                },
                action: 'paid',
                table: originalBill.table,
                billNumber: originalBill.number,
                total: historyTotal,
                products: historyProducts
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Възникна грешка!');
        }
    });

    app.post('/removeOneFromBill', auth, async (req, res) => {
        try {
            const { _id, billId } = req.body;

            // Find bill
            const bill = await Bill.findById(billId).populate('products.product');

            // Find product in bill
            for (let [index, product] of Object.entries(bill.products)) {
                if (product.product._id.toString() === _id) {// product.product is actually product._id
                    product.qty--;

                    if (product.qty === 0)
                        bill.products.splice(index, 1); // remove product entirely from bill

                    bill.total = (bill.total - product.product.sellPrice).toFixed(2); // Remove price from total

                    bill.save();

                    res.json(bill); // Return bill to rerender

                    // Add action to history
                    return ProductHistory.create({
                        user: {
                            name: req.user.name,
                            userRef: req.user.uid
                        },
                        action: 'removed',
                        table: bill.table,
                        billNumber: bill.number,
                        products: [{
                            name: product.product.name, // Статично име на продукта (дори да се изтрие от БД няма проблем)
                            qty: 1, // Колко бройки сме добавили към масата
                            price: product.product.sellPrice, // Каква е текущата цена на този продукт (с времето може да се промени)
                            productRef: product._id // Референция към продукта
                        }]
                    });
                }
            }

            res.status(400).send('Не е намерен такъв продукт в тази сметка!')
        } catch (err) {
            console.error(err);
            res.status(500).send('Възникна грешка!');
        }
    });

    app.post('/addProductToBill', auth, async (req, res) => {
        try {
            const { _id, selectedX, selectedBillId, selectedAddon } = req.body;

            // _id == product id
            // selectedX == qty
            // selectedBillId == bill _id
            // selectedAddon == addon _id
            // TODO da izmlislq kak 6te stane rabotata s tiq addons

            // Validate data
            if (!(_id && selectedX && selectedBillId))
                return res.status(400).send('Всички данни са задължителни!');

            // Check if integer
            if (selectedX % 1 !== 0)
                return res.status(400).send('Бройката трябва да е цяло число!');

            // Check if product exists
            const product = await Product.findById(_id);

            if (!product)
                return res.status(400).send('Продуктът не съществува!');

            // Check if bill exists
            const bill = await Bill.findById(selectedBillId);

            if (!bill)
                return res.status(400).send('Сметката не съществува!');

            // Check if this product is already in bill
            let productIndex;

            for (let i = 0; i < bill.products.length; i++) {
                if (bill.products[i].product.toString() === _id) { // if product _id matches
                    productIndex = i; // return index of product in bill.products array and break out of for loop
                    break;
                }
            }

            if (productIndex !== undefined) // found the same product, increase qty
                bill.products[productIndex].qty += selectedX;
            else // couldn't find the same product, create it
                bill.products.push({ product: product._id, qty: selectedX }); // Add reference of product and qty (selectedX) to bill

            // Update bill total
            bill.total = (bill.total + product.sellPrice * selectedX).toFixed(2);
            bill.save(); // Save (because we are editing)

            await bill.populate('products.product'); // populate products (+ the one we created)

            res.json(bill); // return populated bill so frontend can re-render all products

            // Add action to history
            ProductHistory.create({
                user: {
                    name: req.user.name,
                    userRef: req.user.uid
                },
                action: 'added',
                table: bill.table,
                billNumber: bill.number,
                products: [{
                    name: product.name, // Статично име на продукта (дори да се изтрие от БД няма проблем)
                    qty: selectedX, // Колко бройки сме добавили към масата
                    price: product.sellPrice, // Каква е текущата цена на този продукт (с времето може да се промени)
                    productRef: product._id // Референция към продукта
                }]
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Възникна грешка!');
        }
    });

    app.post('/getBillById', auth, async (req, res) => {
        try {
            const { _id } = req.body;

            // Get bill and populate its products
            const bill = await Bill.findById(_id).populate('products.product');

            res.json(bill);
        } catch (err) {
            console.error(err);
            res.status(500).send('Възникна грешка!');
        }
    });

    app.post('/generateBills', auth, async (req, res) => {
        try {
            // Get selected table id
            const { _id, numberOfBills } = req.body;

            if (!(_id && numberOfBills))
                return res.status(400).send('Трябва _id на маса и брой на сметки!');

            if (typeof numberOfBills !== 'number')
                return res.status(400).send('Брой на сметки трябва да е число!');

            if (numberOfBills < 0)
                return res.status(400).send('Брой на сметки трябва да е по-голямо от 0!');

            // Check if table exists
            const table = await Table.findById({ _id });

            if (!table)
                return res.status(400).send('Масата не съществува!');

            // Check if bills were ALREADY initialized
            if (table.bills.length > 0)
                return res.json(table.bills); // return bills IDS only

            // Create bills in database
            let emptyArray = [];
            for (let i = 1; i < numberOfBills + 1; i++)
                emptyArray.push({ number: i, table: table._id }); // generate empty bills with the table ID inside

            const bills = await Bill.create(emptyArray);

            // Add reference of bills to table's "bills" array
            for (let bill of bills)
                table.bills.push(bill._id);
            table.save(); // Save (because we are editing)

            // Done
            res.status(201).json(table.bills);
        } catch (err) {
            console.error(err);
            res.status(500).send('Възникна грешка!');
        }
    });
}