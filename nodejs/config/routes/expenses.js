import { Expense, expenseTypes } from "../../model/expense.js"

export function expensesRoutes(app, auth) {
    app.get('/expenseTypes', auth, async (req, res) => {
        try {
            // Check if user admin
            if (req.user.role !== 'admin')
                return res.status(403).send('Нямате права!');

            res.json(expenseTypes);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    })

    app.post('/getExpenses', auth, async (req, res) => {
        try {
            // Check if user admin
            if (req.user.role !== 'admin')
                return res.status(403).send('Нямате права!');


            const { fromDate, toDate, type, id } = req.body;

            if (id) {
                const expense = await Expense.findById(id);
                return res.json(expense);
            }

            let criteria = {};

            if (type)
                criteria.type = type;

            if (fromDate) {
                if (!criteria.hasOwnProperty('when'))
                    criteria.when = {};

                criteria.when.$gte = new Date(fromDate).setHours(4);
            }

            if (toDate) {
                if (!criteria.hasOwnProperty('when'))
                    criteria.when = {};

                // grab the date and set the next day as value
                const nextDay = new Date(toDate);
                nextDay.setDate(nextDay.getDate() + 1);
                criteria.when.$lte = nextDay.setHours(4);
            }

            const expenses = await Expense.find(criteria).sort({ when: -1 });
            res.json(expenses);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.post('/createExpense', auth, async (req, res) => {
        try {
            // Check if user admin
            if (req.user.role !== 'admin')
                return res.status(403).send('Нямате права!');

            const { type, price, note } = req.body;

            if (!type || !price)
                return res.status(400).send('Въведете тип и сума!');

            if (!expenseTypes.includes(type))
                return res.status(400).send('Грешен тип!');

            await Expense.create({ type, price, note });

            res.status(201).send('Успешно създаден разход!');
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    })

    app.post('/editExpense', auth, async (req, res) => {
        try {
            // Check if user admin
            if (req.user.role !== 'admin')
                return res.status(403).send('Нямате права!');

            const { type, price, note, id } = req.body;

            if (!type || !price || !id)
                return res.status(400).send('Въведете тип и сума!');

            if (!expenseTypes.includes(type))
                return res.status(400).send('Грешен тип!');

            let expense = await Expense.findById(id);

            if (!expense)
                return res.status(400).send('Не съществува такъв разход!');

            expense.type = type;
            expense.price = price;
            expense.note = note;

            await expense.save();

            res.status(200).send('Успешно редактиран разход!');
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.post('/deleteExpense', auth, async (req, res) => {
        try {
            // Check if user admin
            if (req.user.role !== 'admin')
                return res.status(403).send('Нямате права!');

            const { id } = req.body;

            if (!id)
                return res.status(400).send('Липсва ID!');

            let expense = await Expense.findById(id);

            await Expense.deleteOne({ _id: id });

            res.status(200).send('Успешно изтрит разход!');
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });
}