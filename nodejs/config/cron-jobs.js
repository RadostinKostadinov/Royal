import cron from 'node-cron'
import { Order } from '../model/order.js';
import { createSystemReport } from './routes/reports.js';
import { convertPersonalBillToHistory } from './routes/bills.js';

export async function startCronJobs() {
    // Mark all tables as paid every day at 04:00 and delete bills
    cron.schedule('0 4 * * *', async () => {
        try {
            // Bartender's orders (not actualy bills)
            await Order.deleteMany({});
            console.log('All orders have been automatically deleted!');

            // Finalize consumption for all users
            await convertPersonalBillToHistory();

            // Create report from leftovers, zero table totals and delete all bills
            await createSystemReport();
        } catch (err) {
            console.error(err);
        }
    });
}