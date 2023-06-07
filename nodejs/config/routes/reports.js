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

        let date = new Date();

        // Check if date is between 00:00 and 04:00 hours
        if (date.getHours() >= 0 && date.getHours() < 4) {
            // Set date to yesterday at 04:00
            date.setDate(date.getDate() - 1);
            date.setHours(4);
        } else {
            // Set date to today at 04:00
            date.setHours(4);
        }

        // Get all actions for this user for yesterday 04:00
        const actions = await ProductHistory.find({
            'user.userRef': _id,
            when: {
                $gte: date
            },
            action: ['paid', 'scrapped']
        });


        // Calculate income, consumed, scrapped and total
        let income = 0,
            consumed = 0,
            scrapped = 0,
            discounts = 0,
            total = 0;

        // Go through every action to calculate total income, scrapped, consumed
        for (let action of actions) {
            if (action.action === 'paid') {
                if (action.discount)
                    discounts += action.discount ? action.discount : 0;
                income += action.total;
            }
            if (action.action === 'scrapped')
                scrapped += action.total;
        }

        // Get consumation
        const consumationBill = await Bill.findOne({
            user: _id,
            when: {
                $gte: date
            }
        });

        if (consumationBill)
            consumed = consumationBill.total;

        total = income - consumed - scrapped;

        // Otherwise it creates an empty report 
        if (total === 0)
            return;

        // Check if report already exists
        let report = await Report.findOne({
            'user.userRef': _id,
            when: {
                $gte: date
            }
        });

        if (report) {
            report.income = income;
            report.consumed = consumed;
            report.scrapped = scrapped;
            report.discounts = discounts;
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
                discounts,
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

                            ingredientRef.qty -= ingredient.qty * product.qty;
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
                        buyPrice: product.product.buyPrice,
                        sellPrice: product.product.sellPrice,
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
            let date = new Date();

            // Check if date is between 00:00 and 04:00 hours
            if (date.getHours() >= 0 && date.getHours() < 4) {
                // Set date to yesterday at 04:00
                date.setDate(date.getDate() - 1);
                date.setHours(4);
            } else {
                // Set date to today at 04:00
                date.setHours(4);
            }

            // Get all users reports from today (except systems, because they are done in 04:00 so it counts them for today)
            const reports = await Report.find({
                'user.name': {
                    $ne: 'Система'
                },
                when: {
                    $gte: date
                }
            });

            // Combine all values
            const combinedReport = {
                income: 0,
                remaining: 0,
                consumed: 0,
                scrapped: 0,
                discounts: 0,
                total: 0
            }

            const personalReport = {
                income: 0,
                remaining: 0,
                consumed: 0,
                scrapped: 0,
                discounts: 0,
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
                combinedReport.income += report.income;
                combinedReport.consumed += report.consumed;
                combinedReport.scrapped += report.scrapped;
                combinedReport.discounts += report.discounts ? report.discounts : 0;
                combinedReport.total += report.total;

                console.log(combinedReport.discounts, report.discounts);

                if (report.user.userRef.toString() === req.user._id) {
                    personalReport.income += report.income;
                    personalReport.consumed += report.consumed;
                    personalReport.scrapped += report.scrapped;
                    personalReport.discounts += report.discounts ? report.discounts : 0;
                    personalReport.total += report.total;
                }
            }

            res.json({ combinedReport, personalReport });
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    });

    app.post('/getAllReports', auth, async (req, res) => {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin')
                return res.status(401).send('Нямате админски достъп!')

            const { fromDate, toDate } = req.body;

            let criteria = {};

            if (fromDate) {
                if (!criteria.hasOwnProperty('when'))
                    criteria.when = {};
                criteria.when.$gte = new Date(fromDate);
            }

            if (toDate) {
                if (!criteria.hasOwnProperty('when'))
                    criteria.when = {};
                criteria.when.$lte = new Date(toDate).setHours(23, 59, 59);
            }

            // Get all users reports from today
            const reports = await Report.find(criteria).sort({ when: -1 });

            res.json(reports);
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    });
}