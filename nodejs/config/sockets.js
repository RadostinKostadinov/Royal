import { clearAllOrders, getAllOrders } from "./routes/orders.js";

function socketsInitialize(io) {
    io.on('connection', (socket) => {

        socket.on('product:deleted', async () => {
            io.emit('product:deleted');
        });

        socket.on('order:clearAll', async () => {
            const res = await clearAllOrders();
            // Emit to everyone including the sender
            io.emit('order:clearAll', res);
        })

        socket.on('order:change', async () => {
            const { orders, allProducts } = await getAllOrders();

            socket.broadcast.emit('order:change', { orders, allProducts });
        });

        socket.on('pay-scrap-refresh', ({ bill }) => {
            // send to all except sender
            socket.broadcast.emit('pay-scrap-refresh', { bill });
        });

        socket.on('entered-scrapProductsPage', () => {
            // send to all except sender
            socket.broadcast.emit('entered-scrapProductsPage');
        });

        socket.on('entered-payPartOfBillPage', () => {
            // send to all except sender
            socket.broadcast.emit('entered-payPartOfBillPage');
        });

        socket.on('addToScrap/returnToBill', ({ bill, productsToScrap }) => {
            // send to all except sender
            socket.broadcast.emit('addToScrap/returnToBill', { bill, productsToScrap });
        });

        socket.on('addToPay/returnToBill', ({ bill, productsToPay }) => {
            // send to all except sender
            socket.broadcast.emit('addToPay/returnToBill', { bill, productsToPay });
        });

        socket.on('wholeBillPaid', () => {
            // send to all except sender
            socket.broadcast.emit('wholeBillPaid');
        });

        socket.on('billChanged', (bill) => {
            // send to all except sender
            socket.broadcast.emit('billChanged', bill);
        });
    });
}

export { socketsInitialize }