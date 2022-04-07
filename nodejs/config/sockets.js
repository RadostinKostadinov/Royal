import { getAllOrders } from "./routes/orders.js";

function socketsInitialize(io) {
    io.on('connection', (socket) => {

        socket.on('order:new', async () => {
            const { orders, allProducts } = await getAllOrders();

            socket.broadcast.emit('order:new', { orders, allProducts });
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