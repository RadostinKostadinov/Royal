import { categoriesRoutes } from './routes/categories.js';
import { productsRoutes } from './routes/products.js';
import { usersRoutes } from './routes/users.js';
import { ingredientsRoutes } from './routes/ingredients.js';
import { billsRoutes } from './routes/bills.js';
import { tablesRoutes } from './routes/tables.js';


import { User } from '../model/user.js';
import { Category } from '../model/category.js';
import { Product } from '../model/product.js';
import { Bill } from '../model/bill.js';
import { Table } from '../model/table.js';
import { Ingredient } from '../model/ingredient.js';
import { verifyToken as auth } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import { ProductHistory } from '../model/history.js';

function routesConfig(app) {
    // Load all routes
    categoriesRoutes(app, auth);
    productsRoutes(app, auth);
    usersRoutes(app, auth);
    ingredientsRoutes(app, auth)
    billsRoutes(app, auth);
    tablesRoutes(app, auth);



    /* TODO DELETE THIS DEFAULTS WHEN FINALIZING APP */
    async function createDefaultUsers() {
        const hashPin = await bcrypt.hash("1234", 10);
        const users = [
            {
                name: "Анатоли",
                pin: hashPin,
                role: "admin"
            },
            {
                name: "Димитър",
                pin: hashPin,
                role: "waiter"
            },
            {
                name: "Ивелин",
                pin: hashPin,
                role: "bartender"
            }
        ]

        await User.deleteMany();
        await User.insertMany(users);

        console.log('Created default users with pin: 1234');
    }

    async function createDefaultTables() {
        const middleTables = [
            {
                type: 'table',
                number: '1',
                name: 'Маса 1',
                location: 'middle',
            },
            {
                type: 'table',
                number: '2',
                name: 'Маса 2',
                location: 'middle',
            },
            {
                type: 'table',
                number: '3',
                name: 'Маса 3',
                location: 'middle',
            },
            {
                type: 'table',
                number: '4',
                name: 'Маса 4',
                location: 'middle',
            },
            {
                type: 'table',
                number: '5',
                name: 'Маса 5',
                location: 'middle',
            },
            {
                type: 'table',
                number: '6',
                name: 'Маса 6',
                location: 'middle',
            },
            {
                type: 'table',
                number: '7',
                name: 'Маса 7',
                location: 'middle',
            },
            {
                type: 'table',
                number: '8',
                name: 'Маса 8',
                location: 'middle',
            },
            {
                type: 'table',
                number: '9',
                name: 'Маса 9',
                location: 'middle',
            },
            {
                type: 'table',
                number: '10',
                name: 'Маса 10',
                location: 'middle',
            },
            {
                type: 'table',
                number: '11',
                name: 'Маса 11',
                location: 'middle',
            },
            {
                type: 'table',
                number: '12',
                name: 'Маса 12',
                location: 'middle',
            },
            {
                type: 'table',
                number: '13',
                name: 'Маса 13',
                location: 'middle',
            },
            {
                type: 'table',
                number: '14',
                name: 'Маса 14',
                location: 'middle',
            },
            {
                type: 'table',
                number: '15',
                name: 'Маса 15',
                location: 'middle',
            },
            {
                type: 'table',
                number: '16',
                name: 'Маса 16',
                location: 'middle',
            },
        ];

        const insideTables = [
            {
                type: 'bar',
                name: 'Бар',
                location: 'inside'
            },
            {
                type: 'bar',
                name: 'Бар2',
                location: 'inside'
            },
            {
                type: 'table',
                number: 'v1',
                name: 'Маса В1',
                location: 'inside',
            },
            {
                type: 'table',
                number: 'v2',
                name: 'Маса В2',
                location: 'inside',
            },
            {
                type: 'table',
                number: 'vbar',
                name: 'Маса Бар',
                location: 'inside',
            },
            {
                type: 'table',
                number: 'v4',
                name: 'Маса В4',
                location: 'inside',
            },
            {
                type: 'table',
                number: 'v5',
                name: 'Маса В5',
                location: 'inside',
            },
            {
                type: 'table',
                number: 'v6',
                name: 'Маса В6',
                location: 'inside',
            },
            {
                type: 'table',
                number: 'v7',
                name: 'Маса В7',
                location: 'inside',
            },
            {
                type: 'table',
                number: 'v8',
                name: 'Маса В8',
                location: 'inside',
            },
            {
                type: 'table',
                number: 'v9',
                name: 'Маса В9',
                location: 'inside',
            },
            {
                type: 'table',
                number: 'v10',
                name: 'Маса В10',
                location: 'inside',
            },
            {
                type: 'table',
                number: 'v11',
                name: 'Маса В11',
                location: 'inside',
            },
            {
                type: 'table',
                number: 'z1',
                name: 'Маса Z1',
                location: 'inside',
            },
            {
                type: 'table',
                number: 'z2',
                name: 'Маса Z2',
                location: 'inside',
            },
        ]

        const outsideTables = [
            {
                type: 'table',
                number: 'n1',
                name: 'Маса Н1',
                location: 'outside',
            },
            {
                type: 'table',
                number: 'n2',
                name: 'Маса Н2',
                location: 'outside',
            },
            {
                type: 'table',
                number: 'n3',
                name: 'Маса Н3',
                location: 'outside',
            },
            {
                type: 'table',
                number: 'n4',
                name: 'Маса Н4',
                location: 'outside',
            },
        ]

        await Bill.deleteMany();
        await Table.deleteMany();
        await Table.insertMany(middleTables);
        await Table.insertMany(insideTables);
        await Table.insertMany(outsideTables);

        console.log('Created default tables');
    }

    async function createDefaultCategories() {
        const categories = [
            {
                name: 'Безалкохолни',
                order: 1,
            },
            {
                name: 'Топли напитки',
                order: 2,
            },
            {
                name: 'Кафе',
                order: 3,
            },
            {
                name: 'Летни напитки',
                order: 4,
            },
            {
                name: 'Български алкохол',
                order: 5,
            },
            {
                name: 'Водка внос',
                order: 6,
            },
            {
                name: 'Уиски внос',
                order: 7,
            },
            {
                name: 'Алкохол внош',
                order: 8,
            },
            {
                name: 'Бира',
                order: 9,
            },
            {
                name: 'Ядки',
                order: 10,
            },
            {
                name: 'Торти',
                order: 11,
            },
            {
                name: 'Други',
                order: 12,
            },
        ]

        await Category.deleteMany();
        await Category.insertMany(categories);

        console.log('Created default categories');
    }

    async function createDefaultIngredients() {
        const ingredients = [
            {
                name: 'Мляко',
                qty: 1500,
                buyPrice: 7,
                sellPrice: 9
            },
            {
                name: 'Кафе',
                qty: 1000,
                buyPrice: 5,
                sellPrice: 6
            }
        ];

        await Ingredient.deleteMany();
        await Ingredient.insertMany(ingredients);

        console.log('Created default ingredients');
    }

    async function createDefaultProducts() {
        const categories = [
            {
                categoryName: 'Безалкохолни',
                products: [
                    {
                        name: "Сок Капи",
                        qty: 50,
                        buyPrice: 1,
                        sellPrice: 1.5
                    },
                    {
                        name: "Минерална вода",
                        qty: 100,
                        buyPrice: 0.6,
                        sellPrice: 1
                    },
                    {
                        name: "Сок Деллос",
                        qty: 155,
                        buyPrice: 1.4,
                        sellPrice: 2
                    }
                ]
            },
            {
                categoryName: 'Кафе',
                products: [
                    {
                        name: "Дълго кафе",
                        buyPrice: 1,
                        sellPrice: 1.5,
                        ingredients: [
                            {
                                ingredient: "Кафе",
                                qty: 30
                            }
                        ]
                    },
                    {
                        name: "Кафе с мляко",
                        buyPrice: 1,
                        sellPrice: 1.5,
                        ingredients: [
                            {
                                ingredient: "Кафе",
                                qty: 20
                            },
                            {
                                ingredient: "Мляко",
                                qty: 15
                            }
                        ]
                    },
                ]
            }
        ];

        await Product.deleteMany();

        for (let category of categories) {
            const cat = await Category.findOne({ name: category.categoryName }); // find category id by name

            for (let product of category.products) {
                product.category = cat._id; // set category._id in product

                if (product.hasOwnProperty('ingredients')) {
                    for (let ingredient of product.ingredients) { // if any ingredients
                        const ing = await Ingredient.findOne({ name: ingredient.ingredient }); // find ingredient id by name
                        ingredient.ingredient = ing._id;
                    }
                }

                const pr = await Product.create(product);

                cat.products.push(pr._id); // add reference to product._id in category
            }
            cat.save(); // save references
        }

        console.log('Created default products');
    }

    async function createDefaults() {
        await createDefaultUsers();
        await createDefaultTables();
        await createDefaultCategories();
        await createDefaultIngredients();
        await createDefaultProducts();
    }
    // createDefaults();

    async function deleteAllBills() {
        await Bill.deleteMany();
        const tables = await Table.find()
        for (let table of tables) {
            table.bills = [];
            table.save();
        }
        console.log('\u001b[1;31mAll bills deleted')
    }

    async function deleteHistory() {
        await ProductHistory.deleteMany();
        console.log('\u001b[1;31mHistory deleted')
    }
    // deleteAllBills(); deleteHistory();
}

export { routesConfig };