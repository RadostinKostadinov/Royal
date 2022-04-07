import { ProductHistory } from "../../model/history.js";
import { Report } from "../../model/report.js";
import { Table } from "../../model/table.js";

export async function createReport(req, res) {
    let user;
    if (req)
        user = req.user;

    // Get all paid orders for today for this user
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    let total = 0,
        income = 0,
        remaining = 0,
        scrapped = 0,
        consumed = 0;

    async function getAll(user) {
        if (user) {
            const todayOrders = await ProductHistory.find({
                'user.userRef': user._id,
                action: 'paid',
                when: {
                    $gte: today
                }
            }, 'total'); // return total only

            // Get all scrapped products for today for this user
            const todayScrapped = await ProductHistory.find({
                'user.userRef': user._id,
                action: 'scrapped',
                when: {
                    $gte: today
                }
            }, 'total'); // return total only

            const todayConsumed = await ProductHistory.find({
                'user.userRef': user._id,
                action: 'consumed',
                when: {
                    $gte: today
                }
            }, 'total'); // return total only

            return { todayOrders, todayScrapped, todayConsumed };
        } else {
            // Auto clear from system

            const todayOrders = await ProductHistory.find({
                action: 'paid',
                addedToReport: false,
                when: {
                    $gte: yesterday
                }
            }, 'total'); // return total only

            // Get all scrapped products for today for this user
            const todayScrapped = await ProductHistory.find({
                action: 'scrapped',
                addedToReport: false,
                when: {
                    $gte: yesterday
                }
            }, 'total'); // return total only

            const todayConsumed = await ProductHistory.find({
                action: 'consumed',
                addedToReport: false,
                when: {
                    $gte: yesterday
                }
            }, 'total'); // return total only

            return { todayOrders, todayScrapped, todayConsumed };
        }
    }

    const { todayOrders, todayScrapped, todayConsumed } = await getAll(user);

    // Calculate income = todayOrders.total sum
    todayOrders.forEach(order => {
        income += order.total;
        order.addedToReport = true;
        order.save();
    });
    total += income;
    income = income.toFixed(2);

    // Get totals of all tables that currently have products on them
    const tables = await Table.find({ total: { $gt: 0 } }, 'total');

    // Calculate remaining = all tables.total sum
    tables.forEach(table => {
        remaining += table.total;
    });
    total += remaining;
    remaining = remaining.toFixed(2);

    // Calculate todayScrapped.total sum
    todayScrapped.forEach(order => {
        scrapped += order.total;
        order.addedToReport = true;
        order.save();
    });
    total -= scrapped;
    scrapped = scrapped.toFixed(2);

    // Calculate todayConsumed.total sum
    todayConsumed.forEach(order => {
        consumed += order.total;
        order.addedToReport = true;
        order.save();
    });
    total -= consumed;
    consumed = consumed.toFixed(2);
    total = total.toFixed(2);

    async function createReportFunc() {
        if (user) {
            const newReport = await Report.create({
                user: {
                    name: user.name,
                    userRef: user._id
                },
                income,
                remaining,
                scrapped,
                consumed,
                total
            });

            return newReport;
        } else {
            const newReport = await Report.create({
                user: {
                    name: 'Система'
                },
                income,
                remaining,
                scrapped,
                consumed,
                total
            });

            return newReport;
        }

    }

    if (user) {
        // Check if user already generated report today
        const report = await Report.findOne({
            'user.userRef': user._id,
            when: {
                $gte: today
            }
        });

        if (!report) {
            const newReport = await createReportFunc();

            return res.json(newReport);
        } else {
            // Update values
            report.income = income;
            report.remaining = remaining;
            report.scrapped = scrapped;
            report.consumed = consumed;
            report.total = total;
            report.when = new Date();
            report.save();
            return res.json(report);
        }
    } else {
        if (+total !== 0)
            await createReportFunc(); // auto system report
    }
}

export function reportsRoutes(app, auth) {

    app.post('/createReport', auth, async (req, res) => {
        try {
            await createReport(req, res);
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    });

    app.get('/getAllReports', auth, async (req, res) => {
        try {
            const allReports = await Report.find().sort({ when: -1 });

            res.json(allReports);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });
}