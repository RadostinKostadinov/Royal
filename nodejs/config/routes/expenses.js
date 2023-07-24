import { Expense } from "../../model/expense.js"

export function expensesRoutes(app, auth) {
    app.post('/getExpenses', auth, async (req, res) => {
        try {
            // Check if user admin
            if (req.user.role !== 'admin')
                return res.status(403).send('Нямате права!');

            const { fromDate, toDate, type } = req.body;

            let criteria = {
                when: {}
            }

            if (fromDate)
                criteria.when.$gte = new Date(fromDate);

            if (toDate)
                criteria.when.$lte = new Date(toDate).setHours(23, 59, 59);


            const expenses = await Expense.find(criteria).sort({ when: -1 });
            res.json(expenses);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });
}