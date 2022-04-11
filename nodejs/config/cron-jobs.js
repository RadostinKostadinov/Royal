import cron from 'node-cron'
import { Order } from '../model/order.js';

export async function startCronJobs() {
    // Mark all tables as paid every day at 04:00 and delete bills
    cron.schedule('0 4 * * *', async () => {
        // Bartender's orders (not actualy bills)
        await Order.deleteMany({});
        console.log('All orders have been automatically deleted!');


        //TODO DO ME
        await createReport(); // create report from leftovers
        console.log('Report automatically created, all bills deleted and tables totals zeroed!');
    });
}