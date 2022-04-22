import { ProductHistory } from "../../model/history.js";
import { Product } from "../../model/product.js";
import { Ingredient } from "../../model/ingredient.js";


export function historiesRoutes(app, auth) {

    app.post('/getProductSells', auth, async (req, res) => {
        try {
            // Check if user admin
            if (req.user.role !== 'admin')
                return res.status(403).send('Нямате права!');

            const { _id } = req.body;

            const sells = await ProductHistory.find({ 'products.productRef': _id, action: 'paid' });

            let productSells = [];
            // Extract only this product from every sell
            for (let sell of sells) {
                // Find product in sell.products.productRef
                const product = sell.products.find(p => p.productRef.toString() === _id.toString());
                productSells.push({
                    when: sell.when,
                    qty: product.qty,
                    price: product.price,
                    total: product.qty * product.price
                });
            }

            res.json(productSells);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.get('/getAllPaidBills', auth, async (req, res) => {
        try {
            let date = new Date();

            // Check if date is between 00:00 and 04:00 hours
            if (date.getHours() >= 0 && date.getHours() < 4) {
                // Set date to yesterday at 04:00
                date.setDate(date.getDate() - 1);
                date.setHours(4);
            } else {
                // Set date to today at 04:00
                date.setHours(4);
            }

            const allPaid = await ProductHistory.find({
                action: 'paid',
                when: {
                    $gte: date
                }
            }).sort({ when: -1 }).populate('table');

            res.json(allPaid);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.get('/getAllScrapped', auth, async (req, res) => {
        try {
            // Check if user admin
            if (req.user.role !== 'admin')
                return res.status(403).send('Нямате права!');

            const allScrapped = await ProductHistory.find({ action: 'scrapped', reviewed: false }).sort({ when: -1 }).populate('table');
            res.json(allScrapped);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.post('/markHistoryAsScrapped', auth, async (req, res) => {
        try {
            // Check if user admin
            if (req.user.role !== 'admin')
                return res.status(403).send('Нямате права!');

            const { _id } = req.body; // get history id
            const historyRef = await ProductHistory.findById(_id).populate('products');

            for (let product of historyRef.products) { // for every product to scrap
                const prodRef = await Product.findById(product.productRef);

                // Check if product from ingredients
                if (prodRef.ingredients.length === 0) {
                    prodRef.qty -= product.qty;
                    prodRef.save();
                } else {
                    for (let ingredient of prodRef.ingredients) {
                        // Remove qty from ingredient
                        const ingredientRef = await Ingredient.findById(ingredient.ingredient);
                        ingredientRef.qty -= ingredient.qty;
                        ingredientRef.save();
                    }
                }
            }

            historyRef.reviewed = true;
            historyRef.reviewedDate = Date.now();
            await historyRef.save();

            // Success, return ALL history to rerender
            const allScrapped = await ProductHistory.find({ action: 'scrapped', reviewed: false }).populate('table');
            res.json(allScrapped);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });
}