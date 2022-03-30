import { Product } from "../../model/product.js";
import { Category } from "../../model/category.js";
import { Bill } from "../../model/bill.js"

export function productsRoutes(app, auth) {
    app.post('/changeQtyProduct', auth, async (req, res) => {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin')
                return res.status(401).send('Нямате админски достъп!')

            // Get user input
            let { _id, qty, action } = req.body;

            // Validate user input
            if (!(_id && qty && action))
                return res.status(400).send('Всички полета са задължителни!');

            // Check if qty is integer
            if (qty % 1 !== 0)
                return res.status(400).send('Бройката трябва да е цяло число (примерно 10, 500)!');

            if (action !== 'add' && action !== 'remove')
                return res.status(400).send('Невалидно действие!');

            // Get references to product
            const product = await Product.findById(_id);

            // Change qty
            if (action === 'add')
                product.qty += qty;
            else if (action === 'remove')
                product.qty -= qty;

            product.save(); // Save changes

            // Done
            res.send('Успешно променихте бройките!');
        } catch (error) {
            console.error(error);
            res.status(500).send('Възникна грешка!');
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
            const product = await Product.create({
                name, qty, ingredients, buyPrice, sellPrice, category, forBartender
            });

            // Add reference of product to category "products" array
            category.products.push(product._id);
            category.save(); // Save (because we are editing)

            // Done
            res.status(201).send('Успешно създаден продукт!');
        } catch (error) {
            console.error(error);
            res.status(500).send('Възникна грешка!');
        }
    });

    app.post('/deleteProduct', auth, async (req, res) => {
        /*  Delete product by id */
        try {
            // Check if user is admin
            if (req.user.role !== 'admin')
                return res.status(401).send('Нямате админски достъп!')

            const { _id } = req.body;

            // Validate user input
            if (!_id)
                return res.status(400).send('Избери продукт!');

            // Get references to product and its category
            const product = await Product.findById(_id);

            if (!product)
                return res.status(400).send('Няма продукт с това _id!');

            const productCategory = await Category.findById(product.category);

            if (!productCategory)
                return res.status(400).send('Няма категория коята да съдържа този продукт!');

            // Remove product reference in category
            const index = productCategory.products.indexOf(_id); // Find the product index in the products array

            if (index > -1)
                productCategory.products.splice(index, 1); // remove the product from the array

            productCategory.save(); // save the changes to the category

            await product.remove(); // Delete the product

            res.send('Успешно изтрихте този продукт!');
        } catch (error) {
            console.error(error);
            res.status(500).send('Възникна грешка!');
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
            const oldCategory = await Category.findById(product.category);
            const newCategory = await Category.findById(categoryId);

            // Check if both categories exists
            if (!(oldCategory && newCategory))
                return res.status(400).send('Категорията не съществува!');

            // Update product values
            product.name = name;
            product.buyPrice = buyPrice;
            product.sellPrice = sellPrice;
            product.categoryId = categoryId;
            product.forBartender = forBartender;

            if (qty) { // if simple product, change qty and remove ingredients (there shouldnt be any)
                product.ingredients = [];
                product.qty = qty;
            } else if (ingredients) { // if product from ingredients, delete qty and update ingredients
                delete product.qty;
                product.ingredients = ingredients;
            }


            // Do this only if the category has changed
            if (oldCategory._id !== newCategory._id) {
                // Replace the product's category id property
                product.category = newCategory._id;

                // Remove product reference in old category
                const index = oldCategory.products.indexOf(_id); // Find the product index in the products array

                if (index > -1)
                    oldCategory.products.splice(index, 1); // remove the product from the array

                oldCategory.save(); // save the changes to the category

                // Add reference of product in new category
                newCategory.products.push(product._id);
                newCategory.save(); // Save (because we are editing)
            }
            product.save();

            // Done
            res.send('Успешно променен продукт!');
        } catch (error) {
            console.error(error);
            res.status(500).send('Възникна грешка!');
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
        } catch (error) {
            console.error(error);
            res.status(500).send('Възникна грешка!');
        }
    });

    app.post('/getProductsWithoutIngredientsFromCategory', auth, async (req, res) => {
        try {
            const { _id } = req.body;

            const products = await Product.find({ category: _id, ingredients: { $size: 0 } }).sort({ position: 1 });
            res.json(products);
        } catch (error) {
            console.error(error);
            res.status(500).send('Възникна грешка!');
        }
    });

    app.get('/getAllProductsWithoutIngredients', auth, async (req, res) => {
        try {
            const products = await Product.find({ ingredients: { $size: 0 } }).sort({ position: 1 });
            res.json(products);
        } catch (error) {
            console.error(error);
            res.status(500).send('Възникна грешка!');
        }
    });

    app.get('/getAllProducts', auth, async (req, res) => {
        try {
            const products = await Product.find().sort({ position: 1 });
            res.json(products);
        } catch (error) {
            console.error(error);
            res.status(500).send('Възникна грешка!');
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
        } catch (error) {
            console.error(error);
            res.status(500).send('Възникна грешка!');
        }
    });
}