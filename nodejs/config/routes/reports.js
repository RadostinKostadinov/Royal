import { ProductHistory } from "../../model/history.js";
import { Report } from "../../model/report.js";
import { Table } from "../../model/table.js";
import { User } from "../../model/user.js"
import { Bill } from "../../model/bill.js"

export async function updateReport(req, res) {
    // Updates a users report when they add, sell, scraps or removes a product from bill
    // Or when the user clicks the "Report" button (to show report for today)
    try {
        const { _id } = req.user;

        const user = await User.findById(_id);
        // Get start of day
        const today = new Date();
        today.setHours(0, 0, 0, 0);

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
        // Find tables with leftover totals
        const tables = await Table.find({
            total: {
                $gt: 0
            }
        });

        if (tables.length) {
            let income = 0;


            for (let table of tables) {
                income += table.total;
                table.total = 0;
                await table.save();
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

            if (rs.hasOwnProperty('status') && rs.status === 500)
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
            today.setHours(0, 0, 0, 0);

            // Get all users reports from today
            const reports = await Report.find({
                when: {
                    $gte: today
                }
            }, 'income remaining consumed scrapped total');

            // Combine all values
            const finalReport = {
                income: 0,
                remaining: 0,
                consumed: 0,
                scrapped: 0,
                total: 0
            }

            // Get all tables totals
            const tables = await Table.find({}, 'total');

            // Get sum of all tables.total
            for (let table of tables) {
                finalReport.remaining += table.total;
            }

            for (let report of reports) {
                finalReport.income += report.income;
                finalReport.consumed += report.consumed;
                finalReport.scrapped += report.scrapped;
                finalReport.total += report.total;
            }

            res.json(finalReport);
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