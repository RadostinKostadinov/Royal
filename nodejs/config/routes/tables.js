import { Bill } from "../../model/bill.js";
import { Table } from "../../model/table.js";

export function tablesRoutes(app, auth) {
    app.get('/getAllTables', auth, async (req, res) => {
        try {
            async function findTablesTotals(tables) {
                for (let table of tables) {
                    const bills = await Bill.find({ table: table._id });
                    if (bills.length)
                        table.total = bills.reduce((a, b) => a + (b.total || 0), 0);
                }
            }
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
            res.status(500).send('Възникна грешка!');
        }
    });
}