import { Table } from "../../model/table.js";

export function tablesRoutes(app, auth) {
    app.get('/getAllTables', auth, async (req, res) => {
        try {
            function findTablesTotals(tables) {
                tables.map(table => {
                    if (table.bills.length)
                        table.total = table.bills.reduce((a, b) => a + (b.total || 0), 0)
                });
            }
            const middleTables = await Table.find({ location: 'middle' }).populate('bills');
            const insideTables = await Table.find({ location: 'inside' }).populate('bills');
            const outsideTables = await Table.find({ location: 'outside' }).populate('bills');

            // Find all tables total by finding the sum of all the bills total's inside of it
            findTablesTotals(middleTables);
            findTablesTotals(insideTables);
            findTablesTotals(outsideTables);

            res.json({ middleTables, insideTables, outsideTables });
        } catch (err) {
            console.error(err);
            res.status(500).send('Възникна грешка!');
        }
    });
}