import { categoriesRoutes } from './routes/categories.js';
import { productsRoutes } from './routes/products.js';
import { usersRoutes } from './routes/users.js';
import { ingredientsRoutes } from './routes/ingredients.js';
import { billsRoutes } from './routes/bills.js';
import { tablesRoutes } from './routes/tables.js';
import { revisionsRoutes } from './routes/revisions.js';

import { User } from '../model/user.js';
import { Category } from '../model/category.js';
import { Product } from '../model/product.js';
import { Bill } from '../model/bill.js';
import { Table } from '../model/table.js';
import { Ingredient } from '../model/ingredient.js';
import { verifyToken as auth } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import { ProductHistory, RestockHistory } from '../model/history.js';
import { historiesRoutes } from './routes/histories.js';
import { ordersRoutes } from './routes/orders.js';
import { reportsRoutes } from './routes/reports.js';
import { Order } from '../model/order.js';
import { Report } from '../model/report.js';
import { recalculateProductBuyPrice } from './routes/products.js';

async function routesConfig(app) {

    // Load all routes
    categoriesRoutes(app, auth);
    productsRoutes(app, auth);
    usersRoutes(app, auth);
    ingredientsRoutes(app, auth)
    billsRoutes(app, auth);
    tablesRoutes(app, auth);
    historiesRoutes(app, auth);
    ordersRoutes(app, auth);
    reportsRoutes(app, auth);
    revisionsRoutes(app, auth);

    // Set default 404 for all routes
    app.all('*', (req, res) => {
        res.status(404).send('404 Not Found');
    });

    //TODO RUN THIS ONCE AND DELETE ON SERVER
    async function fixRestockHistories() {
        let histories = await RestockHistory.find({});

        for (let history of histories) {
            let newHistory = {
                _id: history._id,
                reviewed: history.reviewed,
                product: {
                    type: history.product.type,
                    name: history.product.name,
                    qty: history.product.qty,
                    expireDate: history.product.expireDate,
                },
                when: history.when
            };

            let price;

            if (history.product.type === 'ingredient') {
                let ingredient = await Ingredient.findOne({ _id: history.product.ingredientRef });

                price = ingredient.buyPrice;
                newHistory.product.ingredientRef = history.product.ingredientRef;
                newHistory.product.unit = history.product.unit;
            } else {
                let product = await Product.findOne({ _id: history.product.productRef });

                price = product.buyPrice;
                newHistory.product.productRef = history.product.productRef;
            }

            newHistory.product.buyPrice = price;

            await RestockHistory.deleteOne({ _id: history._id });
            await RestockHistory.create(newHistory);
        }
        console.log('Products updated.')
    }
    // await fixRestockHistories();

    async function convertOldDB() {
        // This functions was used to convert OLD DB model to NEW DB model
        // TODO DELETE THIS FUNCTION IN NEXT MERGE IF NOT OF USE
        // Calculate all products with ingredients buyPrice
        let products = await Product.find({ ingredients: { $ne: [] } });
        for (let product of products)
            await recalculateProductBuyPrice(product);

        //Steps to remove sellPrice from all ingredients:

        //1. Open MongoDB Compass
        //2. Click mongosh
        //3. Type: use royal
        //4. Type: db.ingredients.updateMany( {}, { $unset: {"sellPrice": {$ne: undefined}}})

        let histories = await ProductHistory.find({});

        for (let history of histories) {
            let newPrs = []

            for (let product of history.products) {
                let prid = product.productRef;

                let pr = await Product.findOne({ _id: prid });

                let historyPr = {
                    name: product.name,
                    qty: product.qty,
                    productRef: product.productRef,
                    buyPrice: pr.buyPrice,
                    sellPrice: pr.sellPrice,
                    _id: product._id,
                    ingredients: product.ingredients
                };

                newPrs.push(historyPr);
            }

            await ProductHistory.updateOne({ _id: history._id }, { "products": newPrs });
        }
        console.log("Convertion from Old DB done!");
    }
    // await convertOldDB();

    async function createDefaults() {
        async function createDefaultUsers() {
            const users = [
                {
                    name: "Анатоли",
                    pin: await bcrypt.hash("8612", 10),
                    role: "admin"
                },
                {
                    name: "Димитър",
                    pin: await bcrypt.hash("1994", 10),
                    role: "waiter"
                },
                {
                    name: "Ивелин",
                    pin: await bcrypt.hash("1999", 10),
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
                    class: 'table1',
                    name: 'Маса 1',
                    location: 'middle',
                },
                {
                    type: 'table',
                    class: 'table2',
                    name: 'Маса 2',
                    location: 'middle',
                },
                {
                    type: 'table',
                    class: 'table3',
                    name: 'Маса 3',
                    location: 'middle',
                },
                {
                    type: 'table',
                    class: 'table4',
                    name: 'Маса 4',
                    location: 'middle',
                },
                {
                    type: 'table',
                    class: 'table5',
                    name: 'Маса 5',
                    location: 'middle',
                },
                {
                    type: 'table',
                    class: 'table6',
                    name: 'Маса 6',
                    location: 'middle',
                },
                {
                    type: 'table',
                    class: 'table7',
                    name: 'Маса 7',
                    location: 'middle',
                },
                {
                    type: 'table',
                    class: 'table8',
                    name: 'Маса 8',
                    location: 'middle',
                },
                {
                    type: 'table',
                    class: 'table9',
                    name: 'Маса 9',
                    location: 'middle',
                },
                {
                    type: 'table',
                    class: 'table10',
                    name: 'Маса 10',
                    location: 'middle',
                },
                {
                    type: 'table',
                    class: 'table11',
                    name: 'Маса 11',
                    location: 'middle',
                },
                {
                    type: 'table',
                    class: 'table12',
                    name: 'Маса 12',
                    location: 'middle',
                },
                {
                    type: 'table',
                    class: 'table13',
                    name: 'Маса 13',
                    location: 'middle',
                },
                {
                    type: 'table',
                    class: 'table14',
                    name: 'Маса 14',
                    location: 'middle',
                },
                {
                    type: 'table',
                    class: 'table15',
                    name: 'Маса 15',
                    location: 'middle',
                },
                {
                    type: 'table',
                    class: 'table16',
                    name: 'Маса 16',
                    location: 'middle',
                },
            ];

            const insideTables = [
                {
                    type: 'text',
                    class: 'text-outside',
                    name: 'Навън',
                    location: 'inside'
                },
                {
                    type: 'text',
                    class: 'text-zala',
                    name: 'Зала',
                    location: 'inside'
                },
                {
                    type: 'wall',
                    class: 'wall1',
                    location: 'inside'
                },
                {
                    type: 'wall',
                    class: 'wall2',
                    location: 'inside'
                },
                {
                    type: 'wall',
                    class: 'wall3',
                    location: 'inside'
                },
                {
                    type: 'wall',
                    class: 'wall4',
                    location: 'inside'
                },
                {
                    type: 'table',
                    class: 'bar',
                    name: 'Бар',
                    location: 'inside'
                },
                {
                    type: 'table',
                    class: 'tablev1',
                    name: 'Маса В1',
                    location: 'inside',
                },
                {
                    type: 'table',
                    class: 'tablev2',
                    name: 'Маса В2',
                    location: 'inside',
                },
                {
                    type: 'table',
                    class: 'tablev3',
                    name: 'Маса В3',
                    location: 'inside',
                },
                {
                    type: 'table',
                    class: 'tablev4',
                    name: 'Маса В4',
                    location: 'inside',
                },
                {
                    type: 'table',
                    class: 'tablev5',
                    name: 'Маса В5',
                    location: 'inside',
                },
                {
                    type: 'table',
                    class: 'tablev6',
                    name: 'Маса В6',
                    location: 'inside',
                },
                {
                    type: 'table',
                    class: 'tablev7',
                    name: 'Маса В7',
                    location: 'inside',
                },
                {
                    type: 'table',
                    class: 'tablev8',
                    name: 'Маса В8',
                    location: 'inside',
                },
                {
                    type: 'table',
                    class: 'tablev9',
                    name: 'Маса В9',
                    location: 'inside',
                },
                {
                    type: 'table',
                    class: 'tablev10',
                    name: 'Маса В10',
                    location: 'inside',
                },
                {
                    type: 'table',
                    class: 'tablev11',
                    name: 'Маса В11',
                    location: 'inside',
                },
                {
                    type: 'table',
                    class: 'tablez1',
                    name: 'Маса Z1',
                    location: 'inside',
                },
                {
                    type: 'table',
                    class: 'tablez2',
                    name: 'Маса Z2',
                    location: 'inside',
                },
                {
                    type: 'table',
                    class: 'tablez3',
                    name: 'Маса Z3',
                    location: 'inside',
                },
                {
                    type: 'table',
                    class: 'tablez4',
                    name: 'Маса Z4',
                    location: 'inside',
                },
                {
                    type: 'table',
                    class: 'tablez5',
                    name: 'Маса Z5',
                    location: 'inside',
                },
                {
                    type: 'table',
                    class: 'tablen1',
                    name: 'Маса Н1',
                    location: 'inside',
                },
                {
                    type: 'table',
                    class: 'tablen2',
                    name: 'Маса Н2',
                    location: 'inside',
                },
                {
                    type: 'table',
                    class: 'tablen3',
                    name: 'Маса Н3',
                    location: 'inside',
                },
            ];

            await Table.deleteMany();
            await Table.insertMany(middleTables);
            await Table.insertMany(insideTables);

            console.log('Created default tables');
        }

        async function createDefaultCategories() {
            const categories = [
                {
                    name: 'Кафе',
                    order: 1,
                },
                {
                    name: 'Топли напитки',
                    order: 2,
                },
                {
                    name: 'Безалкохолни',
                    order: 3,
                },
                {
                    name: 'Летни напитки',
                    order: 4,
                },
                {
                    name: 'Бира',
                    order: 5,
                },
                {
                    name: 'Български алкохол',
                    order: 6,
                },
                {
                    name: 'Алкохол внос',
                    order: 7,
                },
                {
                    name: 'Ядки',
                    order: 8,
                },
                {
                    name: 'Други',
                    order: 9,
                },
                {
                    name: 'Добавки',
                    order: 10,
                    hidden: true
                }
            ]

            await Category.deleteMany();
            await Category.insertMany(categories);

            console.log('Created default categories');
        }

        async function createDefaultIngredients() {
            const ingredients = [
                {
                    name: 'Грейпфрут',
                    unit: 'кг',
                    qty: 1000,
                    buyPrice: 2,
                    sellPrice: 4.5
                },
                {
                    name: 'Лимон',
                    unit: 'кг',
                    qty: 1000,
                    buyPrice: 2,
                    sellPrice: 5.5
                },
                {
                    name: 'Портокал',
                    unit: 'кг',
                    qty: 1000,
                    buyPrice: 2,
                    sellPrice: 4.5
                },
                {
                    name: 'Алое',
                    unit: 'л',
                    qty: 100,
                    buyPrice: 3,
                    sellPrice: 6
                },
                {
                    name: 'Сметана спрей',
                    unit: 'бр',
                    qty: 100,
                    buyPrice: 2.2,
                    sellPrice: 5.6
                },
                {
                    name: 'Мляко кутия',
                    unit: 'л',
                    qty: 1000,
                    buyPrice: 2,
                    sellPrice: 9
                },
                {
                    name: 'Сухо мляко',
                    unit: 'кг',
                    qty: 1000,
                    buyPrice: 23.5,
                    sellPrice: 40
                },
                {
                    name: 'Сок Гранини',
                    unit: 'л',
                    qty: 1000,
                    buyPrice: 2.8,
                    sellPrice: 7.5
                },
                {
                    name: 'Водка',
                    unit: 'л',
                    qty: 1000,
                    buyPrice: 10,
                    sellPrice: 30
                },
                {
                    name: 'Водка внос',
                    unit: 'л',
                    qty: 1000,
                    buyPrice: 20,
                    sellPrice: 60
                },
                {
                    name: 'Джин',
                    unit: 'л',
                    qty: 1000,
                    buyPrice: 10,
                    sellPrice: 30
                },
                {
                    name: 'Джин внос',
                    unit: 'л',
                    qty: 1000,
                    buyPrice: 20,
                    sellPrice: 60
                },
                {
                    name: 'Уиски',
                    unit: 'л',
                    qty: 1000,
                    buyPrice: 10,
                    sellPrice: 30
                },
                {
                    name: 'Уиски внос',
                    unit: 'л',
                    qty: 1000,
                    buyPrice: 29,
                    sellPrice: 80
                },
                {
                    name: 'Джак Даниелс',
                    unit: 'л',
                    qty: 1000,
                    buyPrice: 40,
                    sellPrice: 100
                },
                {
                    name: 'Бушмилс черен',
                    unit: 'л',
                    qty: 1000,
                    buyPrice: 50,
                    sellPrice: 120
                },
                {
                    name: 'Черно Джони',
                    unit: 'л',
                    qty: 1000,
                    buyPrice: 50,
                    sellPrice: 120
                },
                {
                    name: 'Мартини',
                    unit: 'л',
                    qty: 1000,
                    buyPrice: 22,
                    sellPrice: 50
                },
                {
                    name: 'Бакарди',
                    unit: 'л',
                    qty: 1000,
                    buyPrice: 30,
                    sellPrice: 70
                },
                {
                    name: 'Кампари',
                    unit: 'л',
                    qty: 1000,
                    buyPrice: 30,
                    sellPrice: 70
                },
                {
                    name: 'Бейлис',
                    unit: 'л',
                    qty: 1000,
                    buyPrice: 30,
                    sellPrice: 80
                },
                {
                    name: 'Текила',
                    unit: 'л',
                    qty: 1000,
                    buyPrice: 12,
                    sellPrice: 30
                },
                {
                    name: 'Узо',
                    unit: 'л',
                    qty: 1000,
                    buyPrice: 25,
                    sellPrice: 60
                },
                {
                    name: 'Пастис',
                    unit: 'л',
                    qty: 1000,
                    buyPrice: 29,
                    sellPrice: 60
                },
                {
                    name: 'Пакетче шейк',
                    unit: 'бр',
                    qty: 1000,
                    buyPrice: 0.87,
                    sellPrice: 1.45
                },
                {
                    name: 'Сироп лимонада',
                    unit: 'л',
                    qty: 1000,
                    buyPrice: 16,
                    sellPrice: 30
                },
                {
                    name: 'Газирана вода',
                    unit: 'л',
                    qty: 1500,
                    buyPrice: 1,
                    sellPrice: 2.4
                },
                {
                    name: 'Сироп роза/лавандула',
                    unit: 'л',
                    qty: 1000,
                    buyPrice: 10,
                    sellPrice: 40
                },
                {
                    name: 'Кафе Караро',
                    unit: 'кг',
                    qty: 1000,
                    buyPrice: 23.90,
                    sellPrice: 215
                },
                {
                    name: 'Сироп бисквитки',
                    unit: 'л',
                    qty: 1000,
                    buyPrice: 15,
                    sellPrice: 20
                },
                {
                    name: 'Чокофредо',
                    unit: 'кг',
                    qty: 1000,
                    buyPrice: 0,
                    sellPrice: 25
                },
                {
                    name: 'Нескафе',
                    unit: 'кг',
                    qty: 1000,
                    buyPrice: 32,
                    sellPrice: 500
                },
                {
                    name: 'Мента',
                    unit: 'л',
                    qty: 1000,
                    buyPrice: 10,
                    sellPrice: 30
                },
                {
                    name: 'Мастика',
                    unit: 'л',
                    qty: 1000,
                    buyPrice: 10,
                    sellPrice: 30
                },
                {
                    name: 'Коняк',
                    unit: 'л',
                    qty: 1000,
                    buyPrice: 10,
                    sellPrice: 30
                },
                {
                    name: 'Ром',
                    unit: 'л',
                    qty: 1000,
                    buyPrice: 10,
                    sellPrice: 30
                },
                {
                    name: 'Коняк Плиска',
                    unit: 'л',
                    qty: 1000,
                    buyPrice: 20,
                    sellPrice: 40
                },
                {
                    name: 'Вино',
                    unit: 'л',
                    qty: 1000,
                    buyPrice: 3,
                    sellPrice: 10
                },
                {
                    name: 'Шоколад',
                    unit: 'кг',
                    qty: 1000,
                    buyPrice: 19.8,
                    sellPrice: 36
                },
                {
                    name: '3в1',
                    unit: 'кг',
                    qty: 1000,
                    buyPrice: 18,
                    sellPrice: 75
                },
                {
                    name: 'Капсула Лаваца',
                    unit: 'бр',
                    qty: 1000,
                    buyPrice: 0.5,
                    sellPrice: 2
                },
                {
                    name: 'Кафе Или',
                    unit: 'кг',
                    qty: 1000,
                    buyPrice: 64,
                    sellPrice: 240
                },
                {
                    name: 'Капсула Ришар',
                    unit: 'бр',
                    qty: 1000,
                    buyPrice: 1.2,
                    sellPrice: 2.5
                },
                {
                    name: 'Безкофейново Или',
                    unit: 'кг',
                    qty: 1000,
                    buyPrice: 64,
                    sellPrice: 240
                },
                {
                    name: 'Какао',
                    unit: 'кг',
                    qty: 1000,
                    buyPrice: 4,
                    sellPrice: 20
                },
            ];

            await Ingredient.deleteMany();
            await Ingredient.insertMany(ingredients);

            console.log('Created default ingredients');
        }

        async function createDefaultProducts() {
            const categories = [
                {
                    categoryName: 'Добавки',
                    products: [
                        {
                            addonForCategories: ["Кафе", "Топли напитки"],
                            name: "К. мляко",
                            buyPrice: 0,
                            sellPrice: 0.5,
                            ingredients: [
                                {
                                    ingredient: "Сухо мляко",
                                    qty: 15
                                },
                            ],
                            forBartender: true
                        },
                        {
                            addonForCategories: ["Кафе", "Топли напитки"],
                            name: "К. студ. мляко",
                            buyPrice: 0,
                            sellPrice: 0.5,
                            ingredients: [
                                {
                                    ingredient: "Мляко кутия",
                                    qty: 100
                                },
                            ],
                            forBartender: true
                        },
                        {
                            addonForCategories: ["Кафе", "Топли напитки"],
                            name: "Мед",
                            qty: 50,
                            buyPrice: 0,
                            sellPrice: 0.5
                        },
                        {
                            addonForCategories: ["Кафе", "Топли напитки"],
                            name: "Лъж. мед",
                            qty: 50,
                            buyPrice: 0,
                            sellPrice: 0.7
                        },
                        {
                            addonForCategories: ["Кафе", "Топли напитки"],
                            name: "Конд. мляко",
                            qty: 50,
                            buyPrice: 0,
                            sellPrice: 0.2
                        },
                        {
                            addonForCategories: ["Кафе", "Топли напитки"],
                            name: "Суха сметана",
                            qty: 50,
                            buyPrice: 0,
                            sellPrice: 0.2
                        },
                        {
                            addonForCategories: ["Кафе", "Топли напитки"],
                            name: "Сметана спрей",
                            buyPrice: 0,
                            sellPrice: 0.8,
                            ingredients: [
                                {
                                    ingredient: "Сметана спрей",
                                    qty: 1
                                },
                            ],
                            forBartender: true
                        },
                        {
                            addonForCategories: ["Летни напитки"],
                            name: "Алое",
                            buyPrice: 0,
                            sellPrice: 0.8,
                            ingredients: [
                                {
                                    ingredient: "Алое",
                                    qty: 200
                                },
                            ],
                            forBartender: true
                        },
                        {
                            addonForCategories: ["Безалкохолни"],
                            name: "Резен лимон",
                            buyPrice: 0,
                            sellPrice: 0.2,
                            ingredients: [
                                {
                                    ingredient: "Лимон",
                                    qty: 5
                                },
                            ],
                            forBartender: true
                        },
                    ]
                },
                {
                    categoryName: 'Безалкохолни',
                    products: [
                        {
                            name: "Безалкохолна напитка",
                            qty: 50,
                            buyPrice: 0,
                            sellPrice: 2
                        },
                        {
                            name: "Сок Капи",
                            qty: 50,
                            buyPrice: 0,
                            sellPrice: 2
                        },
                        {
                            name: "Минерална вода",
                            qty: 50,
                            buyPrice: 0,
                            sellPrice: 1.5
                        },
                        {
                            name: "Газирана вода",
                            qty: 50,
                            buyPrice: 0,
                            sellPrice: 1.5
                        },
                        {
                            name: "Сок Гранини",
                            buyPrice: 0,
                            sellPrice: 1.5,
                            ingredients: [
                                {
                                    ingredient: "Сок Гранини",
                                    qty: 200
                                }
                            ],
                            forBartender: true
                        },
                        {
                            name: "Сок Деллос",
                            qty: 50,
                            buyPrice: 0,
                            sellPrice: 2.5
                        },
                        {
                            name: "Сок Моркови",
                            qty: 50,
                            buyPrice: 0,
                            sellPrice: 2.5
                        },
                        {
                            name: "Студен чай 0.5L",
                            qty: 50,
                            buyPrice: 0,
                            sellPrice: 3
                        },
                        {
                            name: "Сода кен",
                            qty: 50,
                            buyPrice: 0,
                            sellPrice: 2.5
                        },
                        {
                            name: "Редбул",
                            qty: 50,
                            buyPrice: 0,
                            sellPrice: 4.5
                        },
                    ]
                },
                {
                    categoryName: 'Кафе',
                    products: [
                        {
                            name: "Кафе",
                            buyPrice: 0,
                            sellPrice: 1.5,
                            ingredients: [
                                {
                                    ingredient: "Кафе Караро",
                                    qty: 7
                                }
                            ],
                            forBartender: true
                        },
                        {
                            name: "Дълго кафе",
                            buyPrice: 0,
                            sellPrice: 1.5,
                            ingredients: [
                                {
                                    ingredient: "Кафе Караро",
                                    qty: 7
                                }
                            ],
                            forBartender: true
                        },
                        {
                            name: "Късо кафе",
                            buyPrice: 0,
                            sellPrice: 1.5,
                            ingredients: [
                                {
                                    ingredient: "Кафе Караро",
                                    qty: 7
                                }
                            ],
                            forBartender: true
                        },
                        {
                            name: "Кафе Лаваца",
                            buyPrice: 0,
                            sellPrice: 2,
                            ingredients: [
                                {
                                    ingredient: "Капсула Лаваца",
                                    qty: 1
                                }
                            ],
                            forBartender: true
                        },
                        {
                            name: "Дълга Лаваца",
                            buyPrice: 0,
                            sellPrice: 2,
                            ingredients: [
                                {
                                    ingredient: "Капсула Лаваца",
                                    qty: 1
                                }
                            ],
                            forBartender: true
                        },
                        {
                            name: "Кафе Или",
                            buyPrice: 0,
                            sellPrice: 1.7,
                            ingredients: [
                                {
                                    ingredient: "Кафе Или",
                                    qty: 7
                                }
                            ],
                            forBartender: true
                        },
                        {
                            name: "Дълго Или",
                            buyPrice: 0,
                            sellPrice: 1.7,
                            ingredients: [
                                {
                                    ingredient: "Кафе Или",
                                    qty: 7
                                }
                            ],
                            forBartender: true
                        },
                        {
                            name: "Кафе Ришар",
                            buyPrice: 0,
                            sellPrice: 2.5,
                            ingredients: [
                                {
                                    ingredient: "Капсула Ришар",
                                    qty: 1
                                }
                            ],
                            forBartender: true
                        },
                        {
                            name: "Дълго Ришар",
                            buyPrice: 0,
                            sellPrice: 2.5,
                            ingredients: [
                                {
                                    ingredient: "Капсула Ришар",
                                    qty: 1
                                }
                            ],
                            forBartender: true
                        },
                        {
                            name: "Кафе без кофейн",
                            buyPrice: 0.45,
                            sellPrice: 2,
                            ingredients: [
                                {
                                    ingredient: "Безкофейново Или",
                                    qty: 7
                                }
                            ],
                            forBartender: true
                        },
                        {
                            name: "Нескафе",
                            buyPrice: 0,
                            sellPrice: 1.5,
                            ingredients: [
                                {
                                    ingredient: "Нескафе",
                                    qty: 2
                                }
                            ],
                            forBartender: true
                        },
                    ]
                },
                {
                    categoryName: 'Топли напитки',
                    products: [
                        {
                            name: "Чай",
                            qty: 50,
                            buyPrice: 0,
                            sellPrice: 1.5,
                            forBartender: true,
                            position: 1
                        },
                        {
                            name: "Чай каничка",
                            qty: 50,
                            buyPrice: 0,
                            sellPrice: 1.8,
                            forBartender: true,
                            position: 2
                        },
                        {
                            name: "Капучино",
                            buyPrice: 1.05,
                            sellPrice: 2.5,
                            ingredients: [
                                {
                                    ingredient: "Нескафе",
                                    qty: 3
                                },
                                {
                                    ingredient: "Сухо мляко",
                                    qty: 27
                                }
                            ],
                            forBartender: true,
                            position: 7
                        },
                        {
                            name: "Мляко с нес",
                            buyPrice: 0.98,
                            sellPrice: 2.5,
                            ingredients: [
                                {
                                    ingredient: "Нескафе",
                                    qty: 2
                                },
                                {
                                    ingredient: "Сухо мляко",
                                    qty: 30
                                }
                            ],
                            forBartender: true,
                            position: 18
                        },
                        {
                            name: "Мокачино",
                            buyPrice: 1.21,
                            sellPrice: 3,
                            ingredients: [
                                {
                                    ingredient: "Нескафе",
                                    qty: 3
                                },
                                {
                                    ingredient: "Сухо мляко",
                                    qty: 30
                                },
                                {
                                    ingredient: "Шоколад",
                                    qty: 16
                                }
                            ],
                            forBartender: true,
                            position: 19
                        },
                        {
                            name: "Виенско кафе",
                            buyPrice: 0,
                            sellPrice: 2.2,
                            ingredients: [
                                {
                                    ingredient: "Кафе Караро",
                                    qty: 7
                                },
                                {
                                    ingredient: "Сметана спрей",
                                    qty: 1
                                }
                            ],
                            forBartender: true,
                            position: 3
                        },
                        {
                            name: "Горещ шоколад",
                            buyPrice: 0.84,
                            sellPrice: 2.5,
                            ingredients: [
                                {
                                    ingredient: "Сухо мляко",
                                    qty: 15
                                },
                                {
                                    ingredient: "Шоколад",
                                    qty: 33
                                }
                            ],
                            forBartender: true,
                            position: 20
                        },
                        {
                            name: "Мляко",
                            buyPrice: 0.8,
                            sellPrice: 2,
                            ingredients: [
                                {
                                    ingredient: "Сухо мляко",
                                    qty: 35
                                }
                            ],
                            forBartender: true,
                            position: 23
                        },
                        {
                            name: "Мляко с какао",
                            buyPrice: 0.96,
                            sellPrice: 2.5,
                            ingredients: [
                                {
                                    ingredient: "Сухо мляко",
                                    qty: 25
                                },
                                {
                                    ingredient: "Шоколад",
                                    qty: 23
                                },
                            ],
                            forBartender: true,
                            position: 21
                        },
                        {
                            name: "Лате",
                            buyPrice: 0,
                            sellPrice: 3.3,
                            ingredients: [
                                {
                                    ingredient: "Кафе Караро",
                                    qty: 7
                                },
                                {
                                    ingredient: "Сухо мляко",
                                    qty: 35
                                },
                            ],
                            forBartender: true,
                            position: 12
                        },
                        {
                            name: "3в1",
                            buyPrice: 0,
                            sellPrice: 1.5,
                            ingredients: [
                                {
                                    ingredient: "3в1",
                                    qty: 19
                                },
                            ],
                            forBartender: true,
                            position: 5
                        },
                        {
                            name: "Студено мляко с какао",
                            buyPrice: 0,
                            sellPrice: 2.2,
                            ingredients: [
                                {
                                    ingredient: "Какао",
                                    qty: 25
                                },
                                {
                                    ingredient: "Мляко кутия",
                                    qty: 220
                                },
                            ],
                            forBartender: true,
                            position: 16
                        },
                        {
                            name: "3в1 пакетче",
                            qty: 50,
                            buyPrice: 0,
                            sellPrice: 1.5,
                            forBartender: true,
                            position: 6
                        },
                        {
                            name: "Мляко с нес ръчно",
                            buyPrice: 0,
                            sellPrice: 2.2,
                            ingredients: [
                                {
                                    ingredient: "Нескафе",
                                    qty: 2
                                },
                                {
                                    ingredient: "Мляко кутия",
                                    qty: 220
                                },
                            ],
                            forBartender: true,
                            position: 14
                        },
                        {
                            name: "Лате ръчно",
                            buyPrice: 0,
                            sellPrice: 3.3,
                            ingredients: [
                                {
                                    ingredient: "Кафе Караро",
                                    qty: 7
                                },
                                {
                                    ingredient: "Мляко кутия",
                                    qty: 200
                                },
                            ],
                            forBartender: true,
                            position: 13
                        },
                        {
                            name: "Мляко с какао ръчно",
                            buyPrice: 0,
                            sellPrice: 2.2,
                            ingredients: [
                                {
                                    ingredient: "Какао",
                                    qty: 25
                                },
                                {
                                    ingredient: "Мляко кутия",
                                    qty: 220
                                },
                            ],
                            forBartender: true,
                            position: 15
                        },
                        {
                            name: "Горещ шоколад италиански",
                            qty: 50,
                            buyPrice: 0,
                            sellPrice: 3.9,
                            forBartender: true,
                            position: 17
                        },
                    ]
                },
                {
                    categoryName: 'Български алкохол',
                    products: [
                        {
                            name: "Водка",
                            buyPrice: 0,
                            sellPrice: 1.5,
                            ingredients: [
                                {
                                    ingredient: "Водка",
                                    qty: 50
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Уиски",
                            buyPrice: 0,
                            sellPrice: 1.5,
                            ingredients: [
                                {
                                    ingredient: "Уиски",
                                    qty: 50
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Мента",
                            buyPrice: 0,
                            sellPrice: 1.5,
                            ingredients: [
                                {
                                    ingredient: "Мента",
                                    qty: 50
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Мастика",
                            buyPrice: 0,
                            sellPrice: 1.5,
                            ingredients: [
                                {
                                    ingredient: "Мастика",
                                    qty: 50
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Джин",
                            buyPrice: 0,
                            sellPrice: 1.5,
                            ingredients: [
                                {
                                    ingredient: "Джин",
                                    qty: 50
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Коняк",
                            buyPrice: 0,
                            sellPrice: 1.5,
                            ingredients: [
                                {
                                    ingredient: "Коняк",
                                    qty: 50
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Ром",
                            buyPrice: 0,
                            sellPrice: 1.5,
                            ingredients: [
                                {
                                    ingredient: "Ром",
                                    qty: 50
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Коняк Плиска",
                            buyPrice: 0,
                            sellPrice: 2,
                            ingredients: [
                                {
                                    ingredient: "Коняк Плиска",
                                    qty: 50
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Чаша Вино",
                            buyPrice: 0,
                            sellPrice: 2,
                            ingredients: [
                                {
                                    ingredient: "Вино",
                                    qty: 200
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Мента кен",
                            qty: 50,
                            buyPrice: 0,
                            sellPrice: 3.5,
                            forBartender: true
                        },
                    ]
                },
                {
                    categoryName: 'Летни напитки',
                    products: [
                        {
                            name: "Шейк",
                            buyPrice: 0,
                            sellPrice: 3,
                            ingredients: [
                                {
                                    ingredient: "Мляко кутия",
                                    qty: 150
                                },
                                {
                                    ingredient: "Пакетче шейк",
                                    qty: 1
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Лимонада",
                            buyPrice: 0,
                            sellPrice: 3.6,
                            ingredients: [
                                {
                                    ingredient: "Сироп лимонада",
                                    qty: 60
                                },
                                {
                                    ingredient: "Газирана вода",
                                    qty: 400
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Лимонада с билкови сиропи",
                            buyPrice: 0,
                            sellPrice: 4.8,
                            ingredients: [
                                {
                                    ingredient: "Сироп роза/лавандула",
                                    qty: 50
                                },
                                {
                                    ingredient: "Газирана вода",
                                    qty: 400
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Брауни",
                            buyPrice: 0,
                            sellPrice: 3.2,
                            ingredients: [
                                {
                                    ingredient: "Мляко кутия",
                                    qty: 120
                                },
                                {
                                    ingredient: "Кафе Караро",
                                    qty: 7
                                },
                                {
                                    ingredient: "Сироп бисквитки",
                                    qty: 30
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Цитронада",
                            buyPrice: 0,
                            sellPrice: 3.8,
                            ingredients: [
                                {
                                    ingredient: "Лимон",
                                    qty: 500
                                },
                                {
                                    ingredient: "Газирана вода",
                                    qty: 300
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Оранжада",
                            buyPrice: 0,
                            sellPrice: 3.8,
                            ingredients: [
                                {
                                    ingredient: "Портокал",
                                    qty: 500
                                },
                                {
                                    ingredient: "Газирана вода",
                                    qty: 300
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Чокофредо",
                            buyPrice: 0,
                            sellPrice: 2.8,
                            ingredients: [
                                {
                                    ingredient: "Мляко кутия",
                                    qty: 150
                                },
                                {
                                    ingredient: "Чокофредо",
                                    qty: 60
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Бяло фрапе",
                            buyPrice: 0,
                            sellPrice: 2.5,
                            ingredients: [
                                {
                                    ingredient: "Мляко кутия",
                                    qty: 120
                                },
                                {
                                    ingredient: "Нескафе",
                                    qty: 2
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Черно фрапе",
                            buyPrice: 0,
                            sellPrice: 2,
                            ingredients: [
                                {
                                    ingredient: "Нескафе",
                                    qty: 2
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Фреш лимон",
                            buyPrice: 0,
                            sellPrice: 5.5,
                            ingredients: [
                                {
                                    ingredient: "Лимон",
                                    qty: 1000
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Фреш портокал",
                            buyPrice: 0,
                            sellPrice: 4.5,
                            ingredients: [
                                {
                                    ingredient: "Портокал",
                                    qty: 1000
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Фреш грейпфрут",
                            buyPrice: 0,
                            sellPrice: 4.5,
                            ingredients: [
                                {
                                    ingredient: "Грейпфрут",
                                    qty: 1000
                                },
                            ],
                            forBartender: true
                        },
                    ]
                },
                {
                    categoryName: 'Алкохол внос',
                    products: [
                        {
                            name: "Водка внос",
                            buyPrice: 0,
                            sellPrice: 3,
                            ingredients: [
                                {
                                    ingredient: "Водка внос",
                                    qty: 50
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Джин внос",
                            buyPrice: 0,
                            sellPrice: 3,
                            ingredients: [
                                {
                                    ingredient: "Джин внос",
                                    qty: 50
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Уиски внос",
                            buyPrice: 0,
                            sellPrice: 4,
                            ingredients: [
                                {
                                    ingredient: "Уиски внос",
                                    qty: 50
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Джак Даниелс",
                            buyPrice: 0,
                            sellPrice: 5,
                            ingredients: [
                                {
                                    ingredient: "Джак Даниелс",
                                    qty: 50
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Бушмилс черен",
                            buyPrice: 0,
                            sellPrice: 6,
                            ingredients: [
                                {
                                    ingredient: "Бушмилс черен",
                                    qty: 50
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Черно Джони",
                            buyPrice: 0,
                            sellPrice: 6,
                            ingredients: [
                                {
                                    ingredient: "Черно Джони",
                                    qty: 50
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Мартини",
                            buyPrice: 0,
                            sellPrice: 2.5,
                            ingredients: [
                                {
                                    ingredient: "Мартини",
                                    qty: 50
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Бакарди",
                            buyPrice: 0,
                            sellPrice: 3.5,
                            ingredients: [
                                {
                                    ingredient: "Бакарди",
                                    qty: 50
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Кампари",
                            buyPrice: 0,
                            sellPrice: 3.5,
                            ingredients: [
                                {
                                    ingredient: "Кампари",
                                    qty: 50
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Бейлис",
                            buyPrice: 0,
                            sellPrice: 4,
                            ingredients: [
                                {
                                    ingredient: "Бейлис",
                                    qty: 50
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Текила",
                            buyPrice: 0,
                            sellPrice: 1.5,
                            ingredients: [
                                {
                                    ingredient: "Текила",
                                    qty: 50
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Узо",
                            buyPrice: 0,
                            sellPrice: 3,
                            ingredients: [
                                {
                                    ingredient: "Узо",
                                    qty: 50
                                },
                            ],
                            forBartender: true
                        },
                        {
                            name: "Пастис",
                            buyPrice: 0,
                            sellPrice: 3,
                            ingredients: [
                                {
                                    ingredient: "Пастис",
                                    qty: 50
                                },
                            ],
                            forBartender: true
                        },
                    ]
                },
                {
                    categoryName: 'Ядки',
                    products: [
                        {
                            name: "Фъстък",
                            qty: 50,
                            buyPrice: 0,
                            sellPrice: 1.5,
                            forBartender: true
                        },
                        {
                            name: "Бадем",
                            qty: 50,
                            buyPrice: 3,
                            sellPrice: 5,
                            forBartender: true
                        },
                        {
                            name: "Лешник",
                            qty: 50,
                            buyPrice: 3,
                            sellPrice: 5,
                            forBartender: true
                        },
                        {
                            name: "Шам фъстък",
                            qty: 50,
                            buyPrice: 3,
                            sellPrice: 5,
                            forBartender: true
                        },
                        {
                            name: "Кашу",
                            qty: 50,
                            buyPrice: 3,
                            sellPrice: 5,
                            forBartender: true
                        },
                    ]
                },
                {
                    categoryName: 'Бира',
                    products: [
                        {
                            name: "Каменица",
                            qty: 50,
                            buyPrice: 1,
                            sellPrice: 2.5,
                        },
                        {
                            name: "Бургаско",
                            qty: 50,
                            buyPrice: 1,
                            sellPrice: 2.5,
                        },
                        {
                            name: "Стела Артоа",
                            qty: 50,
                            buyPrice: 1.3,
                            sellPrice: 3,
                        },
                        {
                            name: "Бекс",
                            qty: 50,
                            buyPrice: 1.2,
                            sellPrice: 2.8,
                        },
                        {
                            name: "Старопрамен",
                            qty: 50,
                            buyPrice: 1.2,
                            sellPrice: 2.8,
                        },
                        {
                            name: "Корона",
                            qty: 50,
                            buyPrice: 0,
                            sellPrice: 4,
                        },
                        {
                            name: "Безалкохолна Бекс",
                            qty: 50,
                            buyPrice: 0,
                            sellPrice: 3,
                        },
                        {
                            name: "Стела Артоа 330ml",
                            qty: 50,
                            buyPrice: 0,
                            sellPrice: 3.3,
                        },
                        {
                            name: "Бира кен",
                            qty: 50,
                            buyPrice: 0,
                            sellPrice: 2.3,
                        },
                        {
                            name: "Сайдер",
                            qty: 50,
                            buyPrice: 0,
                            sellPrice: 3,
                        },
                    ]
                },
                {
                    categoryName: 'Други',
                    products: [
                        {
                            name: "Торта",
                            qty: 50,
                            buyPrice: 2.9,
                            sellPrice: 4.5,
                            forBartender: true
                        },
                        {
                            name: "Наргиле",
                            qty: 50,
                            buyPrice: 7,
                            sellPrice: 20,
                            forBartender: true
                        },
                        {
                            name: "Шот",
                            buyPrice: 10,
                            sellPrice: 20,
                            ingredients: [
                                {
                                    ingredient: "Водка",
                                    qty: 10
                                },
                                {
                                    ingredient: "Сок Гранини",
                                    qty: 20
                                }
                            ],
                            forBartender: true
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

                    if (product.hasOwnProperty('addonForCategories')) {
                        for (let categoryName of product.addonForCategories) {
                            const c = await Category.findOne({ name: categoryName });
                            product.addonForCategories[product.addonForCategories.indexOf(categoryName)] = c._id;
                        }
                    }

                    await Product.create(product);
                }
                cat.save(); // save references
            }

            console.log('Created default products');
        }

        async function deleteAllBills() {
            await Bill.deleteMany();
            const tables = await Table.find()
            for (let table of tables) {
                table.bills = [];
                table.save();
            }
            console.log('Bills deleted')
        }

        async function deleteHistory() {
            await ProductHistory.deleteMany();
            await RestockHistory.deleteMany();
            console.log('History deleted')
        }

        async function deleteReports() {
            await Report.deleteMany();
            console.log('Reports deleted')
        }

        async function deleteOrders() {
            await Order.deleteMany();
            console.log('Orders deleted')
        }

        // await createDefaultUsers();
        await createDefaultTables();
        await createDefaultCategories();
        await createDefaultIngredients();
        await createDefaultProducts();
        await deleteAllBills();
        await deleteHistory();
        await deleteReports();
        await deleteOrders();
    }
    // createDefaults();
}

export { routesConfig };