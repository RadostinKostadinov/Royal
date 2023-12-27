import { Product } from "../../model/product.js";
import { Table } from "../../model/table.js";
import { Order } from "../../model/order.js";

export async function clearAllOrders() {
    try {
        await Order.deleteMany();
        return { status: 200 };
    } catch (err) {
        console.error(err);
        return { status: 500, message: 'Възникна грешка!', err };
    }
}

export function ordersRoutes(app, auth) {
    app.post('/completeOrder', auth, async (req, res) => {
        try {
            const { _id } = req.body;
            await Order.deleteOne({ _id });

            // Send all orders and allProducts
            const { orders, allProducts } = await getAllOrders();

            res.json({ orders, allProducts });
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.post('/completeAll', auth, async (req, res) => {
        try {
            const { prodRef, orderId } = req.body;

            // If no orderId, then its clicked from the allOrders (combined qty) button
            if (orderId === undefined) {
                // Find all orders that contain this product
                const orders = await Order.find({ 'products.prodRef': prodRef });

                for (let order of orders) {
                    // Delete product from order
                    order.products = order.products.filter(product => product.prodRef.toString() !== prodRef);

                    // Check if order has more products
                    if (order.products.length === 0)
                        await Order.deleteOne({ _id: order._id });
                    else // Save the order
                        await order.save();
                }
            } else {
                // Find the order
                const order = await Order.findById(orderId);

                // Delete product from order
                order.products = order.products.filter(product => product.prodRef.toString() !== prodRef);

                // Check if order has more products
                if (order.products.length === 0)
                    await Order.deleteOne({ _id: order._id });
                else // Save the order
                    await order.save();
            }

            // Send all orders and allProducts
            const { orders, allProducts } = await getAllOrders();

            res.json({ orders, allProducts });
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.post('/completeOne', auth, async (req, res) => {
        try {
            const { prodRef, orderId } = req.body;
            const order = await Order.findById(orderId);
            const product = order.products.find(product => product.prodRef.toString() === prodRef);

            // Remove 1 from product qty
            product.qty--;

            // Check if the product qty is 0, and delete it
            if (product.qty === 0)
                order.products = order.products.filter(product => product.prodRef.toString() !== prodRef);

            // Check if order has more products
            if (order.products.length === 0)
                await Order.deleteOne({ _id: order._id });
            else // Save the order
                await order.save();

            // Send all orders and allProducts
            const { orders, allProducts } = await getAllOrders();

            res.json({ orders, allProducts });
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.get('/getAllOrders', auth, async (req, res) => {
        try {
            const { orders, allProducts } = await getAllOrders();

            res.json({ orders, allProducts });
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.post('/createNewOrder', auth, async (req, res) => {
        try {

            const { products, tableId } = req.body;
            let orderProducts = []; // Products that will be added to order

            for (let product of products) {
                const prodRef = await Product.findById(product._id);

                // Check if product's forBartender is true
                if (!prodRef.forBartender)
                    continue; // if not, continue to next product

                orderProducts.push({
                    prodRef: product._id,
                    name: prodRef.name,
                    qty: product.qty
                });
            }

            // If no products for new order
            if (!orderProducts.length)
                return res.send('ok');

            const table = await Table.findById(tableId);

            await Order.create({
                tableName: table.name,
                products: orderProducts,
            });

            res.send('ok');
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });
}

export async function getAllOrders() {
    const orders = await Order.find();

    let allProducts = {};
    for (let order of orders) {
        for (let product of order.products) {
            if (allProducts.hasOwnProperty(product.name))
                allProducts[product.name].qty += product.qty;
            else {
                allProducts[product.name] = {
                    prodRef: product.prodRef,
                    name: product.name,
                    qty: product.qty
                };
            }
        }
    }

    allProducts = Object.values(allProducts);

    return { orders, allProducts }
}