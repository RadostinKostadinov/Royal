import { User } from '../model/user.js';
import { Category } from '../model/category.js';
import { Product } from '../model/product.js';
import { verifyToken as auth } from '../middleware/auth.js';

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

function routesConfig(app) {
    app.post('/login', async (req, res) => {
        try {
            // Get user input
            const { id, pin } = req.body;

            // Vakudate user input
            if (!(id && pin))
                return res.status(400).send('Всички полета са задължителни');

            // Check if user exists
            const user = await User.findOne({ _id: id });

            if (!user)
                return res.status(400).send('Потребителят не съществува');

            if (user && (await bcrypt.compare(pin, user.pin))) {
                // Create token
                const token = jwt.sign(
                    { uid: user._id, name: id, role: user.role },
                    process.env.TOKEN_KEY,
                    {
                        expiresIn: "12h"
                    }
                );

                // Save user token
                user.token = token;

                // Success, return user
                //return res.json(user); // returns all user data
                return res.status(200).send({ name: user.name, role: user.role, token });
            }

            // Wrong pin
            return res.status(400).send('Грешен пин');
        } catch (err) {
            console.error(err);
            res.status(500).send('Възникна грешка!');
        }
    });

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
            res.status(200).send('Успешно зареждане на продукт!');
        } catch (error) {
            console.error(error);
            res.status(500).send('Възникна грешка!');
        }
    })

    app.post('/createProduct', auth, async (req, res) => {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin')
                return res.status(401).send('Нямате админски достъп!')

            // Get user input
            let { name, qty, buyPrice, sellPrice, categoryId, forBartender } = req.body;

            // Sanitize to boolean
            if (forBartender === true || forBartender === 'true')
                forBartender = true;
            else if (forBartender === false || forBartender === 'false')
                forBartender = false;
            else
                return res.status(400).send('Грешна стойност от checkbox bartender!');


            // Validate user input
            if (!(name && qty && buyPrice && sellPrice && categoryId))
                return res.status(400).send('Всички полета са задължителни!');

            // Check if prices are okay
            const pricesRegex = new RegExp(/^\d{1,}(\.\d{1,2})?$/);
            if (!pricesRegex.test(buyPrice) || !pricesRegex.test(sellPrice))
                return res.status(400).send('Цената трябва да е: пример 5.0, 3, 1.20!');

            // Check if qty is integer
            if (qty % 1 !== 0)
                return res.status(400).send('Бройката трябва да е цяло число (примерно 10, 500)!');

            // Check if category exists
            const category = await Category.findById({ _id: categoryId });

            if (!category)
                return res.status(400).send('Категорията не съществува!');

            // Create product in database
            const product = await Product.create({
                name, qty, buyPrice, sellPrice, category, forBartender
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
            const productCategory = await Category.findById(product.category);

            if (!productCategory)
                res.status(400).send('Няма категория коята да съдържа този продукт!');

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
            let { _id, name, qty, buyPrice, sellPrice, categoryId, forBartender } = req.body;

            // Sanitize to boolean
            if (forBartender === true || forBartender === 'true')
                forBartender = true;
            else if (forBartender === false || forBartender === 'false')
                forBartender = false;
            else
                return res.status(400).send('Грешна стойност от checkbox bartender!');


            // Validate user input
            if (!(name && qty && buyPrice && sellPrice && categoryId))
                return res.status(400).send('Всички полета са задължителни!');

            // Check if prices are okay
            const pricesRegex = new RegExp(/^\d{1,}(\.\d{1,2})?$/);
            if (!pricesRegex.test(buyPrice) || !pricesRegex.test(sellPrice))
                return res.status(400).send('Цената трябва да е: пример 5.0, 3, 1.20!');

            // Check if qty is integer
            if (qty % 1 !== 0)
                return res.status(400).send('Бройката трябва да е цяло число (примерно 10, 500)!');

            // Get references to product, new category and old category
            const product = await Product.findById(_id);
            const oldCategory = await Category.findById(product.category);
            const newCategory = await Category.findById(categoryId);

            // Check if both categories exists
            if (!(oldCategory && newCategory))
                return res.status(400).send('Категорията не съществува!');

            // Update product values
            product.name = name;
            product.qty = qty;
            product.buyPrice = buyPrice;
            product.sellPrice = sellPrice;
            product.categoryId = categoryId;
            product.forBartender = forBartender;

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
            res.status(200).send('Успешно променен продукт!');
        } catch (error) {
            console.error(error);
            res.status(500).send('Възникна грешка!');
        }
    });

    app.post('/createUser', auth, async (req, res) => {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin')
                return res.status(401).send('Нямате админски достъп!')

            // Get user input
            const { name, pin, role } = req.body;

            // Validate user input
            if (!(name && pin && role))
                return res.status(400).send('Всички полета са задължителни!');

            // Check if PIN is 4 numbers
            if (/^\d{4}$/.test(pin) === false)
                return res.status(400).send('ПИН кодът трябва да е точно 4 числа!');

            if (['admin', 'bartender', 'waiter'].includes(role) === false)
                return res.status(400).send('Грешна длъжност!');

            // Check if name already created (duplicate name)
            const userExists = await User.findOne({ name });

            if (userExists)
                return res.status(409).send('Вече има създаден служител с това име!');

            // Encrypt user pin
            const encryptedUserPin = await bcrypt.hash(pin, 10);

            // Create user in database
            const user = await User.create({
                name: name,
                pin: encryptedUserPin,
                role: role
            });

            // Done
            res.status(201).send('Успешно създаден служител!');

        } catch (error) {
            console.error(error);
            res.status(500).send('Възникна грешка!');
        }
    });

    app.get('/getAllUsers', async (req, res) => {
        /* Returns list of all users (as username, uid) */

        // Get all users
        // ({}, 'name') means "no search criteria", return only the "name" property
        const users = await User.find({}, 'name');

        // Return only the names
        return res.json(users);
    });

    app.post('/deleteUser', auth, async (req, res) => {
        /*  Delete user by id */

        try {
            // Check if user is admin
            if (req.user.role !== 'admin')
                return res.status(401).send('Нямате админски достъп!')

            const userId = req.body._id;

            // Validate user input
            if (!userId)
                return res.status(400).send('Избери служител!');

            await User.deleteOne({ _id: userId })

            res.send('Успешно изтрихте този служител!');

        } catch (error) {
            console.error(error);
            res.status(500).send('Възникна грешка!');
        }
    });

    app.post('/editUser', auth, async (req, res) => {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin')
                return res.status(401).send('Нямате админски достъп!')

            const userId = req.body._id;
            const selectedChange = req.body.selectedChange;
            let newValue = req.body.newValue;
            // Validate user input
            if (!(selectedChange && newValue))
                return res.status(400).send('Избери промяна и стойност!');

            if (selectedChange === 'pin') {
                // Check if PIN is 4 numbers
                if (/^\d{4}$/.test(newValue) === false)
                    return res.status(400).send('ПИН кодът трябва да е точно 4 числа!');

                // Generate new pin with hash
                newValue = await bcrypt.hash(newValue, 10);
            }
            else if (selectedChange === 'role' && ['admin', 'bartender', 'waiter'].includes(newValue) === false) //if selected change is role and role is not one of: admin, bartender, waiter
                return res.status(400).send('Невалидна длъжност!');
            else if (selectedChange === 'name') {
                // Check if name already in use (duplicate name)
                const userExists = await User.findOne({ name: newValue });

                if (userExists)
                    return res.status(400).send('Това име вече е използвано!');
            }

            await User.findByIdAndUpdate(userId, { [selectedChange]: newValue });

            res.send('Успешна промяна!');
        } catch (error) {
            console.error(error);
            res.status(500).send('Възникна грешка!');
        }
    });

    app.get('/getAllProducts', auth, async (req, res) => {
        try {
            const products = await Product.find().sort({ order: 1 });
            return res.json(products);
        } catch (error) {
            console.error(error);
            res.status(500).send('Възникна грешка!');
        }
    })

    app.get('/getAllCategories', auth, async (req, res) => {
        try {
            const categories = await Category.find().sort({ order: 1 });
            return res.json(categories);
        } catch (error) {
            console.error(error);
            res.status(500).send('Възникна грешка!');
        }
    });

    function sortByOrder(a, b) {
        if (a.order < b.order)
            return -1
        if (a.order > b.order)
            return 1;
        return 0;
    }

    app.post('/createCategory', auth, async (req, res) => {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin')
                return res.status(401).send('Нямате админски достъп!')

            const { name } = req.body;

            // Validate user input
            if (!(name))
                return res.status(400).send('Въведи име!');

            await Category.create({ name });

            res.send('Успешно създадохте нова категория!');
        } catch (error) {
            console.error(error);
            res.status(500).send('Възникна грешка!');
        }
    });

    app.post('/deleteCategory', auth, async (req, res) => {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin')
                return res.status(401).send('Нямате админски достъп!')

            const { _id } = req.body;
            // Validate user input
            if (!_id)
                return res.status(400).send('Избери категория!');

            await Product.deleteMany({ category: _id }); // delete products inside category
            await Category.findByIdAndDelete(_id); // delete category

            res.send('Успешно изтрихте категорията!');
        } catch (error) {
            console.error(error);
            res.status(500).send('Възникна грешка!');
        }
    });

    app.post('/editCategory', auth, async (req, res) => {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin')
                return res.status(401).send('Нямате админски достъп!')

            const { _id, name } = req.body;
            // Validate user input
            if (!(_id && name))
                return res.status(400).send('Избери категория и ново име!');

            // Create category in database
            await Category.findByIdAndUpdate(_id, { name });

            res.send('Успешна промяна!');
        } catch (error) {
            console.error(error);
            res.status(500).send('Възникна грешка!');
        }
    });

    app.post('/sortCategories', auth, async (req, res) => {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin')
                return res.status(401).send('Нямате админски достъп!')

            // Get array of categories in new order
            const categories = req.body.categories;

            for (let i = 0; i < categories.length; i++) {
                // i will be the order number
                // i+1 because 'order' always starts at 1 (if 0 it doesnt show 'order' and breaks code)
                // categories[i] is the category _id
                await Category.findByIdAndUpdate(categories[i], { order: i + 1 });
            }

            res.send('Успешна подредба!');
        } catch (error) {
            console.error(error);
            res.status(500).send('Възникна грешка!');
        }
    });

    app.post('/getCategoryById', auth, async (req, res) => {
        try {
            const { _id } = req.body

            // Validate user input
            if (!_id)
                return res.status(400).send('Избери категория!');

            // Create category in database
            const category = await Category.findById({ _id }).populate(['products']);

            if (category.hasOwnProperty('products') && category.products.length > 0)
                category.products.sort(sortByOrder);

            res.json(category);
        } catch (error) {
            console.error(error);
            res.status(500).send('Възникна грешка!');
        }
    })

    app.post('/getProductById', auth, async (req, res) => {
        try {
            const { _id } = req.body

            // Validate user input
            if (!_id)
                return res.status(400).send('Избери продукт!');

            const product = await Product.findById({ _id });

            res.json(product);
        } catch (error) {
            console.error(error);
            res.status(500).send('Възникна грешка!');
        }
    })
}

export { routesConfig };