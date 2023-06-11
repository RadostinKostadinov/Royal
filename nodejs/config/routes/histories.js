import { ProductHistory, RestockHistory } from "../../model/history.js";
import { Product } from "../../model/product.js";
import { Ingredient } from "../../model/ingredient.js";


export function historiesRoutes(app, auth) {

    app.post('/getAllConsumation', auth, async (req, res) => {
        try {
            // Check if user admin
            if (req.user.role !== 'admin')
                return res.status(403).send('Нямате права!');

            const { fromDate, toDate, user } = req.body;

            let criteria = {
                action: 'consumed'
            };

            if (user)
                criteria['user.userRef'] = user;

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
            const reports = await ProductHistory.find(criteria).sort({ when: -1 });

            res.json(reports);
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    });

    app.post('/markExpiredAsReviewed', auth, async (req, res) => {
        try {
            // Check if user admin
            if (req.user.role !== 'admin')
                return res.status(403).send('Нямате права!');

            const { _id } = req.body;

            await RestockHistory.findByIdAndUpdate(_id, { 'reviewed': true });

            res.status(200).send('');
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    });

    app.get('/getNumberOfExpiredProducts', auth, async (req, res) => {
        try {
            // Check if user admin
            if (req.user.role !== 'admin')
                return res.status(403).send('Нямате права!');

            const number = await RestockHistory.count({
                'product.expireDate': {
                    $lt: new Date()
                },
                'reviewed': false
            });

            return res.json(number);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.post('/getRestockHistory', auth, async (req, res) => {
        try {
            // Check if user admin
            if (req.user.role !== 'admin')
                return res.status(403).send('Нямате права!');

            const { fromDate, toDate, _id, type } = req.body;

            let criteria = {};

            if (_id)
                type === 'product' ? criteria['product.productRef'] = _id : criteria['product.ingredientRef'] = _id;

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

            const history = await RestockHistory.find(criteria).sort({ when: -1 });


            res.json(history);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.post('/getProductSells', auth, async (req, res) => {
        try {
            // Check if user admin
            if (req.user.role !== 'admin')
                return res.status(403).send('Нямате права!');

            const { fromDate, toDate, _id } = req.body;

            let criteria = {
                action: 'paid',
                'products.productRef': _id
            };

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

            const sells = await ProductHistory.find(criteria).sort({ when: -1 });

            let productSells = [];
            // Extract only this product from every sell
            for (let sell of sells) {
                // Find product in sell.products.productRef
                const product = sell.products.find(p => p.productRef.toString() === _id.toString());
                productSells.push({
                    when: sell.when,
                    qty: product.qty,
                    buyPrice: product.buyPrice,
                    sellPrice: product.sellPrice,
                    total: product.qty * product.sellPrice
                });
            }

            res.json(productSells);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.post('/getInformation', auth, async (req, res) => {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin')
                return res.status(401).send('Нямате админски достъп!')

            const { fromDate, toDate } = req.body;

            let criteria = {
                action: 'paid',
                when: {
                    $gte: ''
                }
            };

            if (fromDate) // start of today
                criteria.when.$gte = new Date(fromDate).setHours(0, 0, 0);
            else
                criteria.when.$gte = new Date().setHours(0, 0, 0);

            if (toDate)
                criteria.when.$lte = new Date(toDate).setHours(23, 59, 59);

            // Get all paid bills
            const bills = await ProductHistory.find(criteria).populate('products.productRef');

            let info = {
                grossIncome: 0,
                grossIncomeDelivery: 0,
                totalIncome: 0,
                totalSells: 0, // Total number of sells (bills)
                totalProductsSold: 0, // Total number of products sold
                upsellPercentage: 0
            }

            for (let bill of bills) {
                info.grossIncome += bill.total;
                info.totalSells += 1;
                info.totalProductsSold += bill.products.length;

                for (let product of bill.products) {
                    info.grossIncomeDelivery += product.productRef.buyPrice * product.qty;
                }
            }

            info.totalIncome = info.grossIncome - info.grossIncomeDelivery;
            info.upsellPercentage = (info.grossIncome - info.grossIncomeDelivery) / info.grossIncomeDelivery * 100;

            res.json(info);
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    });

    app.get('/getAllPaidBills', auth, async (req, res) => {
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

            const allPaid = await ProductHistory.find({
                action: 'paid',
                when: {
                    $gte: date
                }
            }).sort({ when: -1 }).populate('table');

            res.json(allPaid);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.get('/getAllScrapped', auth, async (req, res) => {
        try {
            // Check if user admin
            if (req.user.role !== 'admin')
                return res.status(403).send('Нямате права!');

            const allScrapped = await ProductHistory.find({ action: 'scrapped', reviewed: false }).sort({ when: -1 }).populate('table');
            res.json(allScrapped);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.post('/markProductAsScrapped', auth, async (req, res) => {
        try {
            // Check if user admin
            if (req.user.role !== 'admin')
                return res.status(403).send('Нямате права!');

            const { _id } = req.body; // get history id
            const historyRef = await ProductHistory.findById(_id).populate('products');

            historyRef.reviewed = true;
            historyRef.reviewedDate = Date.now();
            await historyRef.save();

            // Success, return ALL history to rerender
            const allScrapped = await ProductHistory.find({ action: 'scrapped', reviewed: false }).populate('table');
            res.json(allScrapped);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });
}