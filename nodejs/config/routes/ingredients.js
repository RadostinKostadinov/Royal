import { RestockHistory } from "../../model/history.js";
import { Ingredient } from "../../model/ingredient.js";
import { Product } from "../../model/product.js";

export function ingredientsRoutes(app, auth) {
    app.post('/scrapRestockIngredient', auth, async (req, res) => {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin')
                return res.status(401).send('Нямате достъп!')

            // Get user input
            let { _id, qty, action, expireDate } = req.body;

            // Validate user input
            if (!(_id && qty && action))
                return res.status(400).send('Всички полета са задължителни!');

            if (!['restock', 'scrap'].includes(action))
                return res.status(400).send('Невалидно действие!');

            // Get references to ingredient
            const ingredient = await Ingredient.findById(_id);

            // Check if ingredient is in kg, l or br
            if (['кг', 'л'].includes(ingredient.unit))
                qty *= 1000;

            // Change qty
            if (action === 'restock')
                ingredient.qty += qty;
            else if (action === 'scrap')
                ingredient.qty -= qty;

            await ingredient.save(); // Save changes

            // Done
            res.send('Успешно променихте бройките!');


            // Add action to history
            expireDate = new Date(expireDate).toJSON();
            if (action === 'restock')
                await RestockHistory.create({
                    product: {
                        type: 'ingredient',
                        unit: ingredient.unit,
                        name: ingredient.name,
                        buyPrice: ingredient.buyPrice,
                        qty,
                        expireDate,
                        ingredientRef: ingredient._id
                    }
                });
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.post('/createIngredient', auth, async (req, res) => {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin')
                return res.status(401).send('Нямате достъп!');

            // Get user input
            let { name, unit, qty, buyPrice } = req.body;

            // Validate user input
            if (!(name && unit && qty !== undefined && buyPrice !== undefined))
                return res.status(400).send('Всички полета са задължителни!');

            // Check if prices are okay
            /* const pricesRegex = new RegExp(/^\d{1,}(\.\d{1,2})?$/);
            if (!pricesRegex.test(buyPrice) || !pricesRegex.test(sellPrice))
                return res.status(400).send('Цената трябва да е: пример 5.0, 3, 1.20!'); */

            // Check if ingredient is in kg, l or br
            if (['кг', 'л'].includes(unit))
                qty *= 1000;

            // Create user in database
            await Ingredient.create({
                name,
                unit,
                qty,
                buyPrice
            });

            res.status(201).send('Успешно създадена съставка!');
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.post('/deleteIngredient', auth, async (req, res) => {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin')
                return res.status(401).send('Нямате достъп!');

            // Get user input
            const { _id } = req.body;

            if (!_id)
                return res.status(400).send('Изберете съставка!');

            // Get references to ingredient
            const ingredient = await Ingredient.findById(_id);
            if (!ingredient)
                return res.status(400).send('Няма съставка с това _id!');

            await Ingredient.removeOne(_id); // Delete the ingredient

            // Find all products that contain this ingredient
            const products = await Product.find({ 'ingredients.ingredient': _id });

            // Delete the ingredient from the products
            for (let product of products) {
                const ingredientIndex = product.ingredients.findIndex(ingredient => ingredient.ingredient === _id);
                product.ingredients.splice(ingredientIndex, 1);
                //FIXME ТРЯБВА ДА ИЗТРИВА ПРОДУКТА АКО НЯМА ПОВЕЧЕ СЪСТАВКИ, СЪЩО И ОТ ВСИЧКИ СМЕТКИ И МАСИ
                if (product.ingredients.length === 0)
                    await Product.deleteOne({ _id: product._id });
                else
                    await product.save();
            }

            res.send('Успешно изтрихте тази съставка!');
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.post('/editIngredient', auth, async (req, res) => {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin')
                return res.status(401).send('Нямате достъп!')


            // Get user input
            const { _id, name, unit, qty, buyPrice } = req.body;

            // Validate user input
            if (!(_id && name && unit && qty !== undefined && buyPrice !== undefined))
                return res.status(400).send('Всички полета са задължителни!');

            // Check if prices are okay
            /* const pricesRegex = new RegExp(/^\d{1,}(\.\d{1,2})?$/);
            if (!pricesRegex.test(buyPrice) || !pricesRegex.test(sellPrice))
                return res.status(400).send('Цената трябва да е: пример 5.0, 3, 1.20!'); */

            // Get references to ingredient
            const ingredient = await Ingredient.findById(_id);

            if (!(ingredient))
                return res.status(400).send('Съставката не съществува!');

            // Update product values
            ingredient.name = name;
            ingredient.unit = unit;
            ingredient.qty = ['кг', 'л'].includes(ingredient.unit) ? qty * 1000 : qty;
            ingredient.buyPrice = buyPrice;
            await ingredient.save();

            // Done
            res.send('Успешно променена съставка!');
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.post('/getIngredientById', auth, async (req, res) => {
        try {
            const { _id } = req.body

            // Validate user input
            if (!_id)
                return res.status(400).send('Избери съставка!');

            const ingredient = await Ingredient.findById(_id);

            res.json(ingredient);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.get('/getAllIngredients', auth, async (req, res) => {
        try {
            const ingredients = await Ingredient.find().sort({ position: 1 });
            res.json(ingredients);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });
}