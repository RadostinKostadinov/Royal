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
import { Addon } from '../model/addons.js';
import { addonsRoutes } from './routes/addons.js';

function routesConfig(app) {
    // Load all routes
    categoriesRoutes(app, auth);
    productsRoutes(app, auth);
    usersRoutes(app, auth);
    ingredientsRoutes(app, auth)
    billsRoutes(app, auth);
    tablesRoutes(app, auth);
    addonsRoutes(app, auth);



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
                buyPrice: 23.50,
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
                buyPrice: 22.70,
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
                buyPrice: 18,
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
                    },
                    {
                        name: "Кафе без кофейн",
                        buyPrice: 0,
                        sellPrice: 1.7,
                        ingredients: [
                            {
                                ingredient: "Безкофейново Или",
                                qty: 7
                            }
                        ]
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
                        ]
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
                        sellPrice: 1.5
                    },
                    {
                        name: "Чай каничка",
                        qty: 50,
                        buyPrice: 0,
                        sellPrice: 1.8
                    },
                    {
                        name: "Капучино",
                        buyPrice: 0,
                        sellPrice: 2.2,
                        ingredients: [
                            {
                                ingredient: "Нескафе",
                                qty: 3
                            },
                            {
                                ingredient: "Сухо мляко",
                                qty: 30
                            }
                        ]
                    },
                    {
                        name: "Мляко с нес",
                        buyPrice: 0,
                        sellPrice: 2.2,
                        ingredients: [
                            {
                                ingredient: "Нескафе",
                                qty: 2
                            },
                            {
                                ingredient: "Сухо мляко",
                                qty: 30
                            }
                        ]
                    },
                    {
                        name: "Мокачино",
                        buyPrice: 0,
                        sellPrice: 2.8,
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
                        ]
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
                        ]
                    },
                    {
                        name: "Горещ шоколад",
                        buyPrice: 0,
                        sellPrice: 2.2,
                        ingredients: [
                            {
                                ingredient: "Сухо мляко",
                                qty: 15
                            },
                            {
                                ingredient: "Шоколад",
                                qty: 33
                            }
                        ]
                    },
                    {
                        name: "Мляко",
                        buyPrice: 0,
                        sellPrice: 1.8,
                        ingredients: [
                            {
                                ingredient: "Сухо мляко",
                                qty: 35
                            }
                        ]
                    },
                    {
                        name: "Мляко с какао",
                        buyPrice: 0,
                        sellPrice: 2.2,
                        ingredients: [
                            {
                                ingredient: "Сухо мляко",
                                qty: 25
                            },
                            {
                                ingredient: "Шоколад",
                                qty: 23
                            },
                        ]
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
                        ]
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
                        ]
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
                        ]
                    },
                    {
                        name: "3в1 пакетче",
                        qty: 50,
                        buyPrice: 0,
                        sellPrice: 1.5,
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
                        ]
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
                        ]
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
                        ]
                    },
                    {
                        name: "Горещ шоколад италиански",
                        qty: 50,
                        buyPrice: 0,
                        sellPrice: 3.9,
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
                    },
                    {
                        name: "Мента кен",
                        qty: 50,
                        buyPrice: 0,
                        sellPrice: 3.5,
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                        ]
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
                    },
                    {
                        name: "Бадем",
                        qty: 50,
                        buyPrice: 0,
                        sellPrice: 5,
                    },
                    {
                        name: "Лешник",
                        qty: 50,
                        buyPrice: 0,
                        sellPrice: 5,
                    },
                    {
                        name: "Шам фъстък",
                        qty: 50,
                        buyPrice: 0,
                        sellPrice: 5,
                    },
                    {
                        name: "Кашу",
                        qty: 50,
                        buyPrice: 0,
                        sellPrice: 5,
                    },
                ]
            },
            {
                categoryName: 'Бира',
                products: [
                    {
                        name: "Каменица",
                        qty: 50,
                        buyPrice: 0,
                        sellPrice: 2.3,
                    },
                    {
                        name: "Бургаско",
                        qty: 50,
                        buyPrice: 0,
                        sellPrice: 2.3,
                    },
                    {
                        name: "Стела Артоа",
                        qty: 50,
                        buyPrice: 0,
                        sellPrice: 2.8,
                    },
                    {
                        name: "Бекс",
                        qty: 50,
                        buyPrice: 0,
                        sellPrice: 2.6,
                    },
                    {
                        name: "Старопрамен",
                        qty: 50,
                        buyPrice: 0,
                        sellPrice: 2.6,
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
                        name: "Наргиле",
                        qty: 50,
                        buyPrice: 0,
                        sellPrice: 20,
                    },
                    {
                        name: "Шот",
                        buyPrice: 0,
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

    async function createDefaultAddons() {
        const addons = [
            {
                categories: ["Кафе"],
                name: "К. мляко",
                buyPrice: 0,
                sellPrice: 0.5,
                ingredients: [
                    {
                        ingredient: "Сухо мляко",
                        qty: 15
                    },
                ]
            },
            {
                categories: ["Кафе"],
                name: "К. студ. мляко",
                buyPrice: 0,
                sellPrice: 0.5,
                ingredients: [
                    {
                        ingredient: "Мляко кутия",
                        qty: 100
                    },
                ]
            },
            {
                categories: ["Кафе"],
                name: "Мед",
                qty: 50,
                buyPrice: 0,
                sellPrice: 0.5
            },
            {
                categories: ["Кафе"],
                name: "Лъж. мед",
                qty: 50,
                buyPrice: 0,
                sellPrice: 0.7
            },
            {
                categories: ["Кафе"],
                name: "Конд. мляко",
                qty: 50,
                buyPrice: 0,
                sellPrice: 0.2
            },
            {
                categories: ["Кафе"],
                name: "Суха сметана",
                qty: 50,
                buyPrice: 0,
                sellPrice: 0.2
            },
            {
                categories: ["Кафе"],
                name: "Сметана спрей",
                buyPrice: 0,
                sellPrice: 0.8,
                ingredients: [
                    {
                        ingredient: "Сметана спрей",
                        qty: 1
                    },
                ]
            },
            {
                categories: ["Летни напитки"],
                name: "Алое",
                buyPrice: 0,
                sellPrice: 0.8,
                ingredients: [
                    {
                        ingredient: "Алое",
                        qty: 200
                    },
                ]
            },
            {
                categories: ["Безалкохолни"],
                name: "Резен лимон",
                buyPrice: 0,
                sellPrice: 0.2,
                ingredients: [
                    {
                        ingredient: "Лимон",
                        qty: 5
                    },
                ]
            },
        ];

        for (let addon of addons) {
            if (addon.hasOwnProperty('ingredients')) {
                for (let ingredient of addon.ingredients) { // if any ingredients
                    const ing = await Ingredient.findOne({ name: ingredient.ingredient }); // find ingredient id by name
                    ingredient.ingredient = ing._id;
                }
            }

            for (let categoryName of addon.categories) {
                const c = await Category.findOne({ name: categoryName });
                addon.categories[addon.categories.indexOf(categoryName)] = c._id;
            }
            Addon.create(addon);
        }

        console.log('Created default addons');
    }

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

    async function createDefaults() {
        await createDefaultUsers();
        await createDefaultTables();
        await createDefaultCategories();
        await createDefaultIngredients();
        await createDefaultProducts();
        await createDefaultAddons();
        await deleteAllBills();
        await deleteHistory();
    }
    // createDefaults();
    // deleteAllBills(); deleteHistory();
}

export { routesConfig };