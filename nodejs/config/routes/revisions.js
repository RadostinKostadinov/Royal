import { Revision } from "../../model/revision.js";
import { Product } from "../../model/product.js";
import { Ingredient } from "../../model/ingredient.js";

export function revisionsRoutes(app, auth) {
    app.get('/getAllRevisions', auth, async (req, res) => {
        try {
            const revisions = await Revision.find().sort({ when: -1 });

            res.status(200).send(revisions);
        } catch (err) {
            console.error(err);
            res.status(500).send
        }
    });

    app.post('/saveRevision', auth, async (req, res) => {
        try {
            const { revision } = req.body;

            let finishedRevision = [];

            // Cycle through each product in revision
            for (let pr of revision) {
                // Find the product in DB
                let type = 'product';
                let product = await Product.findById(pr._id);

                if (product === null) {
                    type = 'ingredient';
                    product = await Ingredient.findById(pr._id);
                }

                if (product === null)
                    return res.status(404).send('Не е намерен продукт с този ID!');

                // Add info to finished revision array
                let productInfo = {
                    type,
                    name: product.name,
                    oldQty: product.qty,
                }

                // If new qty entered, add it to product info (else it was same as in stock, so no changes are made)
                if (pr.qty !== '') {
                    // Convert new qty to number
                    pr.qty = Number(pr.qty);

                    // If ingredient, multiply by 1000 (convert from kg to g)
                    if (type === 'ingredient')
                        pr.qty *= 1000;

                    if (pr.qty !== product.qty)
                        productInfo.newQty = pr.qty;
                }

                // Add reference and unit to product
                if (type === 'ingredient') {
                    productInfo.ingredientRef = product._id;
                    productInfo.unit = product.unit;
                } else
                    productInfo.productRef = product._id;

                // Product info finished, add to finished array
                finishedRevision.push(productInfo);
            }

            await Revision.create({
                products: finishedRevision
            });

            res.status(200).send('Успешно записахте ревизията!');
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });
}