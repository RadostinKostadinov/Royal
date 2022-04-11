import { Product } from "../../model/product.js";
import { Category } from "../../model/category.js";
import { RestockHistory } from "../../model/history.js";
import { Bill } from "../../model/bill.js";
import { Table } from "../../model/table.js";

export async function deleteProductFromEverywhere(product) {
    // Delete from all bills
    const bills = await Bill.find({ 'products.product': product._id });

    for (let bill of bills) {
        // Find product in bill.products, delete it and update total
        let i = 0;
        for (let pr of bill.products) {
            if (pr.product.toString() === product._id.toString()) {
                // Update bill total
                bill.total -= pr.qty * product.sellPrice;

                // Update table total
                const table = await Table.findById(bill.table);

                table.total -= pr.qty * product.sellPrice;

                // Delete product from bill.products array
                bill.products.splice(i, 1);

                await bill.save();
                await table.save();
                break;
            }
            i++;
        }
    }

    // Finally delete product
    await product.remove();
}

export function productsRoutes(app, auth) {
    app.get('/getAllRestockedProducts', auth, async (req, res) => {
        try {
            const products = await RestockHistory.find().sort({ when: -1 });
            res.json(products);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.post('/getAddonsForCategory', auth, async (req, res) => {
        try {
            const { _id } = req.body;

            const addons = await Product.find({ addonForCategories: _id }).sort({ position: 1 });
            res.json(addons);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.get('/getAllAddons', auth, async (req, res) => {
        try {
            //$ne === not equal to empty array
            const addons = await Product.find({ addonForCategories: { $ne: [] } }).sort({ position: 1 });
            res.json(addons);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.post('/scrapRestockProduct', auth, async (req, res) => {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin')
                return res.status(401).send('Нямате админски достъп!')

            // Get user input
            let { _id, qty, action, expireDate } = req.body;

            // Validate user input
            if (!(_id && qty && action))
                return res.status(400).send('Всички полета са задължителни!');

            // Check if qty is integer
            if (qty % 1 !== 0)
                return res.status(400).send('Бройката трябва да е цяло число (примерно 10, 500)!');

            if (!['restock', 'scrap'].includes(action))
                return res.status(400).send('Невалидно действие!');

            // Get references to product
            const product = await Product.findById(_id);

            // Change qty
            if (action === 'restock')
                product.qty += qty;
            else if (action === 'scrap')
                product.qty -= qty;

            product.save(); // Save changes

            // Done
            res.send('Успешно променихте бройките!');

            if (action === 'restock' && expireDate) {
                expireDate = new Date(expireDate);
                // Add action to history
                RestockHistory.create({
                    product: {
                        type: 'product',
                        name: product.name,
                        qty,
                        expireDate,
                        productRef: product._id
                    }
                });
            }
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.post('/getProductsIngredients', auth, async (req, res) => {
        try {
            const { _id } = req.body;

            const product = await Product.findOne({ _id }, 'ingredients').populate('ingredients.ingredient');

            res.json(product.ingredients);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.post('/createProduct', auth, async (req, res) => {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin')
                return res.status(401).send('Нямате админски достъп!')

            // Get user input
            let { name, qty, ingredients, buyPrice, sellPrice, categoryId, forBartender } = req.body;

            // Sanitize to boolean
            if (forBartender === true || forBartender === 'true')
                forBartender = true;
            else if (forBartender === false || forBartender === 'false')
                forBartender = false;
            else
                return res.status(400).send('Грешна стойност от checkbox bartender!');

            // Validate user input depending on what they chose (create product or create product from ingredients)
            if (!(name && buyPrice && sellPrice && categoryId))
                return res.status(400).send('Всички полета са задължителни!');

            // Check if prices are okay
            const pricesRegex = new RegExp(/^\d{1,}(\.\d{1,2})?$/);
            if (!pricesRegex.test(buyPrice) || !pricesRegex.test(sellPrice))
                return res.status(400).send('Цената трябва да е: пример 5.0, 3, 1.20!');

            if (qty && ingredients) // Impossible, because product from ingredients cant have qty
                return res.status(400).send('Невъзможно да има количество и съставки едновременно в 1 продукт!');

            if (qty && ((qty % 1) !== 0)) // User chose to create normal product, check if qty is integer
                return res.status(400).send('Количеството трябва да е цяло число (примерно 10, 500)!');

            if (ingredients && !ingredients.length) // user chose to create product from ingredients
                return res.status(400).send('Изберете поне една съставка!'); // Check if no ingredients selected

            if (!qty && !ingredients)
                return res.status(400).send('Избери тип на продукт!');

            // Check if category exists
            const category = await Category.findById({ _id: categoryId });

            if (!category)
                return res.status(400).send('Категорията не съществува!');

            // Create product in database
            await Product.create({
                name, qty, ingredients, buyPrice, sellPrice, category, forBartender
            });

            // Done
            res.status(201).send('Успешно създаден продукт!');
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.post('/deleteProduct', auth, async (req, res) => {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin')
                return res.status(401).send('Нямате админски достъп!')

            const { _id } = req.body;

            // Validate user input
            if (!_id)
                return res.status(400).send('Избери продукт!');

            // Get references to product
            const product = await Product.findById(_id);

            if (!product)
                return res.status(400).send('Няма продукт с това _id!');

            // await product.remove(); // Delete the product

            //FIXME ТРЯБВА ДА ИЗТРИВА ОТ ВСИЧКИ СМЕТКИ И МАСИ
            await deleteProductFromEverywhere(product);

            res.send('Успешно изтрихте този продукт!');
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.post('/getProductsFromCategory', auth, async (req, res) => {
        try {
            const { _id } = req.body

            // Validate user input
            if (!_id)
                return res.status(400).send('Избери категория!');

            const products = await Product.find({ category: _id }).sort({ position: 1 });

            res.json(products);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.post('/editProduct', auth, async (req, res) => {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin')
                return res.status(401).send('Нямате админски достъп!')

            // Get user input
            let { _id, name, qty, ingredients, buyPrice, sellPrice, categoryId, forBartender } = req.body;

            // Sanitize to boolean
            if (forBartender === true || forBartender === 'true')
                forBartender = true;
            else if (forBartender === false || forBartender === 'false')
                forBartender = false;
            else
                return res.status(400).send('Грешна стойност от checkbox bartender!');


            // Validate user input depending on what they chose (create product or create product from ingredients)
            if (!(name && buyPrice && sellPrice && categoryId))
                return res.status(400).send('Всички полета са задължителни!');

            // Check if prices are okay
            const pricesRegex = new RegExp(/^\d{1,}(\.\d{1,2})?$/);
            if (!pricesRegex.test(buyPrice) || !pricesRegex.test(sellPrice))
                return res.status(400).send('Цената трябва да е: пример 5.0, 3, 1.20!');

            if (qty && ingredients) // Impossible, because product from ingredients cant have qty
                return res.status(400).send('Невъзможно да има количество и съставки едновременно в 1 продукт!');

            if (qty && ((qty % 1) !== 0)) // User chose to create normal product, check if qty is integer
                return res.status(400).send('Количеството трябва да е цяло число (примерно 10, 500)!');

            if (ingredients && !ingredients.length) // user chose to create product from ingredients
                return res.status(400).send('Изберете поне една съставка!'); // Check if no ingredients selected

            if (!qty && !ingredients)
                return res.status(400).send('Избери тип на продукт!');

            // Get references to product, new category and old category
            const product = await Product.findById(_id);
            const newCategory = await Category.findById(categoryId);

            // Check if both categories exists
            if (!newCategory)
                return res.status(400).send('Категорията не съществува!');

            // Update product values
            product.name = name;
            product.buyPrice = buyPrice;
            product.sellPrice = sellPrice;
            product.category = categoryId;
            product.forBartender = forBartender;

            if (qty) { // if simple product, change qty and remove ingredients (there shouldnt be any)
                product.ingredients = [];
                product.qty = +qty;
            } else if (ingredients) { // if product from ingredients, delete qty and update ingredients
                delete product.qty;
                product.ingredients = ingredients;
            }

            product.save();

            // Done
            res.send('Успешно променен продукт!');
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.post('/sortProducts', auth, async (req, res) => {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin')
                return res.status(401).send('Нямате админски достъп!')

            // Get array of products in new order
            const products = req.body.products;

            for (let i = 0; i < products.length; i++) {
                // i will be the order number
                // i+1 because 'order' always starts at 1 (if 0 it doesnt show 'order' and breaks code)
                // products[i] is the products _id
                await Product.findByIdAndUpdate(products[i], { position: i + 1 });
            }

            res.send('Успешна подредба!');
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.post('/getProductsWithoutIngredientsFromCategory', auth, async (req, res) => {
        try {
            const { _id } = req.body;

            const products = await Product.find({ category: _id, ingredients: { $size: 0 } }).sort({ position: 1 });
            res.json(products);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.get('/getAllProductsWithoutIngredients', auth, async (req, res) => {
        try {
            const products = await Product.find({ ingredients: { $size: 0 } }).sort({ position: 1 });
            res.json(products);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.get('/getAllProducts', auth, async (req, res) => {
        try {
            const products = await Product.find().sort({ position: 1 });
            res.json(products);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.post('/getProductById', auth, async (req, res) => {
        try {
            const { _id } = req.body

            // Validate user input
            if (!_id)
                return res.status(400).send('Избери продукт!');

            const product = await Product.findById(_id).populate('ingredients.ingredient');

            res.json(product);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });
}