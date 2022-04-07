import { Bill } from "../../model/bill.js";
import { Table } from "../../model/table.js";

export function tablesRoutes(app, auth) {
    async function findTablesTotals(tables) {
        for (let table of tables) {
            const bills = await Bill.find({ table: table._id });
            if (bills.length)
                table.total = bills.reduce((a, b) => a + (b.total || 0), 0);
        }
    }

    app.post('/getTableTotalById', auth, async (req, res) => {
        try {
            const { _id } = req.body;
            const table = await Table.findById(_id);
            await findTablesTotals([table]);

            res.json(table.total);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.post('/getTables', auth, async (req, res) => {
        try {
            const { location } = req.body;

            const tables = await Table.find({ location });

            await findTablesTotals(tables);

            res.json(tables);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.get('/getAllTables', auth, async (req, res) => {
        try {
            const middleTables = await Table.find({ location: 'middle' });
            const insideTables = await Table.find({ location: 'inside' });
            const outsideTables = await Table.find({ location: 'outside' });

            // Find all tables total by finding the sum of all the bills total's inside of it
            await findTablesTotals(middleTables);
            await findTablesTotals(insideTables);
            await findTablesTotals(outsideTables);

            res.json({ middleTables, insideTables, outsideTables });
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });
}