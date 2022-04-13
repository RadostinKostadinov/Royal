import { ProductHistory } from "../../model/history.js";
import { Product } from "../../model/product.js";
import { Ingredient } from "../../model/ingredient.js";


export function historiesRoutes(app, auth) {

    app.get('/getAllPaidBills', auth, async (req, res) => {
        try {
            let today = new Date();
            today.setHours(0, 0, 0, 0);

            const allPaid = await ProductHistory.find({
                action: 'paid',
                when: {
                    $gte: today
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
            const allScrapped = await ProductHistory.find({ action: 'scrapped', reviewed: false }).sort({ when: -1 }).populate('table');
            res.json(allScrapped);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.post('/markHistoryAsScrapped', async (req, res) => {
        try {
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