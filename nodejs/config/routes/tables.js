import { Bill } from "../../model/bill.js";
import { Table } from "../../model/table.js";

async function recalculateTablesTotals() {
    const bills = await Bill.find({});

    for (let bill of bills) {
        const table = await Table.findById(bill.table);
        if (table.total < 0)
            table.total = bill.total;
        else
            table.total += bill.total;

        table.total = table.total.toFixed(2);
        table.save();
    }
}

// recalculateTablesTotals(); // INCASE I FUCK IT UP

export function tablesRoutes(app, auth) {
    app.post('/getTableTotalById', auth, async (req, res) => {
        try {
            const { _id } = req.body;
            const table = await Table.findById(_id);

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

            res.json(tables);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });
}