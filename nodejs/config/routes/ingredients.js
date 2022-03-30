import { Ingredient } from "../../model/ingredient.js";

export function ingredientsRoutes(app, auth) {
    app.post('/createIngredient', auth, async (req, res) => {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin')
                return res.status(401).send('Нямате достъп!');

            // Get user input
            const { name, unit, qty, buyPrice, sellPrice } = req.body;

            // Validate user input
            if (!(name && unit && qty && buyPrice && sellPrice))
                return res.status(400).send('Всички полета са задължителни!');

            // Check if prices are okay
            const pricesRegex = new RegExp(/^\d{1,}(\.\d{1,2})?$/);
            if (!pricesRegex.test(buyPrice) || !pricesRegex.test(sellPrice))
                return res.status(400).send('Цената трябва да е: пример 5.0, 3, 1.20!');

            // Check if qty is integer
            if (qty % 1 !== 0)
                return res.status(400).send('Бройката трябва да е цяло число (примерно 10, 500)!');

            // Create user in database
            await Ingredient.create({
                name,
                unit,
                qty,
                buyPrice,
                sellPrice
            });

            res.status(201).send('Успешно създадена съставка!');
        } catch (err) {
            console.error(err);
            res.status(500).send('Възникна грешка!');
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

            await ingredient.remove(); // Delete the ingredient

            res.send('Успешно изтрихте тази съставка!');
        } catch (err) {
            console.error(err);
            res.status(500).send('Възникна грешка!');
        }
    });

    app.post('/editIngredient', auth, async (req, res) => {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin')
                return res.status(401).send('Нямате достъп!')


            // Get user input
            const { _id, name, unit, qty, buyPrice, sellPrice } = req.body;

            // Validate user input
            if (!(_id && name && unit && qty && buyPrice && sellPrice))
                return res.status(400).send('Всички полета са задължителни!');

            // Check if prices are okay
            const pricesRegex = new RegExp(/^\d{1,}(\.\d{1,2})?$/);
            if (!pricesRegex.test(buyPrice) || !pricesRegex.test(sellPrice))
                return res.status(400).send('Цената трябва да е: пример 5.0, 3, 1.20!');

            // Check if qty is integer
            if (qty % 1 !== 0)
                return res.status(400).send('Бройката трябва да е цяло число (примерно 10, 500)!');

            // Get references to ingredient
            const ingredient = await Ingredient.findById(_id);

            if (!(ingredient))
                return res.status(400).send('Съставката не съществува!');

            // Update product values
            ingredient.name = name;
            ingredient.unit = unit;
            ingredient.qty = qty;
            ingredient.buyPrice = buyPrice;
            ingredient.sellPrice = sellPrice;
            ingredient.save();

            // Done
            res.send('Успешно променена съставка!');
        } catch (error) {
            console.error(error);
            res.status(500).send('Възникна грешка!');
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
        } catch (error) {
            console.error(error);
            res.status(500).send('Възникна грешка!');
        }
    });

    app.get('/getAllIngredients', auth, async (req, res) => {
        try {
            const ingredients = await Ingredient.find().sort({ position: 1 });
            res.json(ingredients);
        } catch (err) {
            console.error(err);
            res.status(500).send('Възникна грешка!');
        }
    });
}