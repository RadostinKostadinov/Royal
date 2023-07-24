import { categoriesRoutes } from './routes/categories.js';
import { productsRoutes } from './routes/products.js';
import { usersRoutes } from './routes/users.js';
import { ingredientsRoutes } from './routes/ingredients.js';
import { billsRoutes } from './routes/bills.js';
import { tablesRoutes } from './routes/tables.js';
import { revisionsRoutes } from './routes/revisions.js';
import { verifyToken as auth } from '../middleware/auth.js';
import { historiesRoutes } from './routes/histories.js';
import { ordersRoutes } from './routes/orders.js';
import { reportsRoutes } from './routes/reports.js';
import { expensesRoutes } from './routes/expenses.js';

async function routesConfig(app) {

    // Load all routes
    categoriesRoutes(app, auth);
    productsRoutes(app, auth);
    usersRoutes(app, auth);
    ingredientsRoutes(app, auth)
    billsRoutes(app, auth);
    tablesRoutes(app, auth);
    historiesRoutes(app, auth);
    ordersRoutes(app, auth);
    reportsRoutes(app, auth);
    revisionsRoutes(app, auth);
    expensesRoutes(app, auth);

    // Set default 404 for all routes
    app.all('*', (req, res) => {
        res.status(404).send('404 Not Found');
    });
}

export { routesConfig };