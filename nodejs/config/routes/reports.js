import { ProductHistory } from "../../model/history.js";
import { Report } from "../../model/report.js";
import { Table } from "../../model/table.js";
import { User } from "../../model/user.js"
import { Bill } from "../../model/bill.js"
import { Product } from "../../model/product.js";
import { Ingredient } from "../../model/ingredient.js";

export async function updateReport(req, res) {
    // Updates a users report when they add, sell, scraps or removes a product from bill
    // Or when the user clicks the "Report" button (to show report for today)
    try {
        const { _id } = req.user;

        const user = await User.findById(_id);

        // Get start of day
        const today = new Date();
        //TODO Check if here should be 00:00 (start of new day) or 04:00 (after system reset, because they may be working to 01:00 o'clock for example) 
        // today.setHours(0, 0, 0, 0);
        today.setHours(4, 0, 0, 0);

        // Get all actions for this user for today
        const actions = await ProductHistory.find({
            'user.userRef': _id,
            when: {
                $gte: today
            },
            action: ['paid', 'scrapped', 'consumed']
        });


        // Calculate income, consumed, scrapped and total
        let income = 0,
            consumed = 0,
            scrapped = 0,
            total = 0;

        // Go through every action to calculate total income, scrapped, consumed
        for (let action of actions) {
            if (action.action === 'paid')
                income += action.total;
            if (action.action === 'scrapped')
                scrapped += action.total;
            if (action.action === 'consumed')
                consumed += action.total;
        }

        total = income - consumed - scrapped;

        // Otherwise it creates an empty report 
        if (total === 0)
            return;

        // Check if report already exists
        let report = await Report.findOne({
            'user.userRef': _id,
            when: {
                $gte: today
            }
        });

        if (report) {
            report.income = income;
            report.consumed = consumed;
            report.scrapped = scrapped;
            report.total = total;
            report.when = new Date();
            await report.save();
        } else {
            // Create the new report
            report = await Report.create({
                user: {
                    name: user.name,
                    userRef: _id
                },
                income,
                scrapped,
                consumed,
                total
            });
        }

        return report;
    } catch (err) {
        console.log(err);
        return { status: 500, data: err };
    }
}

export async function createSystemReport() {
    try {
        //TODO  Maybe create an emit in case somebody is working??

        // Find bills with leftover totals or products in them
        const bills = await Bill.find({
            total: {
                $gt: 0
            },
            products: {
                $not: {
                    $size: 0
                }
            }
        });

        // If any bills with leftover products
        if (bills.length) {
            let income = 0;

            // Calculate system report income
            for (let bill of bills) {
                // Add total to income
                income += bill.total;

                let historyProducts = [];
                let historyTotal = 0;

                for (let product of bill.products) {
                    // Remove product qty from inventory
                    // But first check if from ingredients
                    let ingredientsArray = [];

                    const prodRef = await Product.findById(product.product);

                    if (prodRef.ingredients.length === 0)
                        prodRef.qty -= product.qty;
                    else {
                        for (let ingredient of prodRef.ingredients) {
                            const ingredientRef = await Ingredient.findById(ingredient.ingredient);

                            ingredientRef.qty -= ingredient.qty;
                            await ingredientRef.save();

                            ingredientsArray.push({
                                name: ingredientRef.name,
                                qty: ingredient.qty,
                                price: ingredientRef.sellPrice,
                                ingredientRef: ingredientRef._id
                            });
                        }
                    }

                    await prodRef.save();

                    historyProducts.push({
                        name: prodRef.name,
                        qty: product.qty,
                        price: prodRef.sellPrice,
                        productRef: product.product,
                        ingredients: ingredientsArray
                    });

                    historyTotal += prodRef.sellPrice * product.qty;
                }

                // Add action to history
                await ProductHistory.create({
                    user: {
                        name: 'Система'
                    },
                    action: 'paid',
                    table: bill.table,
                    billNumber: bill.number,
                    total: historyTotal,
                    products: historyProducts
                });
            }

            // Create system report
            await Report.create({
                user: {
                    name: 'Система'
                },
                income,
                scrapped: 0,
                consumed: 0,
                total: income
            });

            console.log('System report created from leftovers!');
        }

        // Set all table totals to 0
        await Table.updateMany({}, { total: 0 });
        console.log('All tables totals set to 0!')

        // Delete all bills
        await Bill.deleteMany();
        console.log('All bills deleted!')
    } catch (err) {
        console.log(err);
    }
}

export function reportsRoutes(app, auth) {
    app.get('/updateReport', auth, async (req, res) => {
        try {

            const rs = await updateReport(req, res);

            if (rs && rs.hasOwnProperty('status') && rs.status === 500)
                return res.status(500).json(rs);

            res.send('ok');
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    });

    app.get('/getTodaysReport', auth, async (req, res) => {
        try {
            const today = new Date();
            //TODO Check if here should be 00:00 (start of new day) or 04:00 (after system reset, because they may be working to 01:00 o'clock for example) 
            // today.setHours(0, 0, 0, 0);
            today.setHours(4, 0, 0, 0);

            // Get all users reports from today (except systems, because they are done in 04:00 so it counts them for today)
            const reports = await Report.find({
                'user.name': {
                    $ne: 'Система'
                },
                when: {
                    $gte: today
                }
            });

            // Combine all values
            const combinedReport = {
                income: 0,
                remaining: 0,
                consumed: 0,
                scrapped: 0,
                total: 0
            }

            const personalReport = {
                income: 0,
                remaining: 0,
                consumed: 0,
                scrapped: 0,
                total: 0
            };

            // Get all tables totals
            const tables = await Table.find({}, 'total');

            // Get sum of all tables.total
            for (let table of tables) {
                combinedReport.remaining += table.total;
                personalReport.remaining += table.total;
            }

            for (let report of reports) {
                console.log(report.when);
                combinedReport.income += report.income;
                combinedReport.consumed += report.consumed;
                combinedReport.scrapped += report.scrapped;
                combinedReport.total += report.total;

                if (report.user.userRef.toString() === req.user._id) {
                    personalReport.income += report.income;
                    personalReport.consumed += report.consumed;
                    personalReport.scrapped += report.scrapped;
                    personalReport.total += report.total;
                }
            }

            res.json({ combinedReport, personalReport });
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    });

    app.get('/getAllReports', auth, async (req, res) => {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin')
                return res.status(401).send('Нямате админски достъп!')

            // Get all users reports from today
            const reports = await Report.find();

            res.json(reports);
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    });
}