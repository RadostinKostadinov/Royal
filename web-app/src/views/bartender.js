import page from 'page';
import { html, render } from 'lit';
import { container } from '../app.js';
import '../css/bartender/bartender.css';
import { getAllOrders, socket, logout, completeOne, completeAll, completeOrder } from '../api.js';
import { stopAllSockets } from './waiter.js';

export async function bartenderDashboardPage() {
    stopAllSockets();
    let { orders, allProducts } = await getAllOrders();

    socket.on('order:new', async (data) => {
        orders = data.orders;
        allProducts = data.allProducts;

        rerender(orders, allProducts);
    });

    async function compltOne(prodRef, orderId) {
        // If orderId === undefined, then its clicked from the allOrders (combined qty) button
        if (orderId === undefined) {
            // Find the first order that contains this product and get that order id
            orderId = orders.find(order => order.products.find(product => product.prodRef === prodRef))._id;
        }

        const res = await completeOne(prodRef, orderId);
        if (res.status === 200) {
            orders = res.data.orders;
            allProducts = res.data.allProducts;

            // Rerender
            rerender(orders, allProducts);
            console.log(orders, allProducts);
        } else {
            console.error(res);
            alert('Възникна грешка!');
        }
    }

    async function cmpltAll(prodRef, orderId) {
        const res = await completeAll(prodRef, orderId);
        if (res.status === 200) {
            orders = res.data.orders;
            allProducts = res.data.allProducts;

            // Rerender
            rerender(orders, allProducts);
        } else {
            console.error(res);
            alert('Възникна грешка!');
        }
    }

    async function cmpltOrder(_id) {
        const res = await completeOrder(_id);

        if (res.status === 200) {
            orders = res.data.orders;
            allProducts = res.data.allProducts;

            // Rerender
            rerender(orders, allProducts);
        } else {
            console.error(res);
            alert('Възникна грешка!');
        }
    }

    const productTemplate = (product, orderId) => html`
        <tr>
            <td>${product.name}</td>
            <td>${product.qty} бр.</td>
            <td><button @click=${()=> compltOne(product.prodRef, orderId)} class="removeOne text-uppercase">Едно</button></td>
            <td><button @click=${()=> cmpltAll(product.prodRef, orderId)} class="removeAll text-uppercase">Всички</button>
            </td>
        </tr>
    `;

    const orderTemplate = (order, i) => {
        let time = new Date(order.when);
        time = (time.getHours() < 10 ? '0' + time.getHours() : time.getHours()) + ':' + (time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes());
        return html`
        <div class="order">
            <table>
                <thead class="text-uppercase">
                    <tr>
                        <td colspan="3">[${i + 1}] - МАСА ${order.tableNumber}</td>
                        <td>${time}</td>
                    </tr>
                </thead>
                <tbody>
                    ${order.products.map((product) => productTemplate(product, order._id))}
                </tbody>
            </table>
            <button @click=${() => cmpltOrder(order._id)} class="finish text-uppercase">Завърши</button>
        </div>
    `};

    const dashboard = () => html`
        <div id="bartenderDashboard">
            <div id="orders"></div>
            <div id="menu" class="d-flex flex-column justify-content-end gap-3 p-3">
                <button @click=${() => page('/waiter')}>Маси</button>
                <button @click=${logout}>Изход</button>
            </div>
            <div class="overflow-auto">
                <table id="allOrders">
                    <tbody>
        
                    </tbody>
                </table>
            </div>
        </div>
    `;

    function rerender(orders, allProducts) {
        render(orders.map((order, i) => orderTemplate(order, i)), document.getElementById('orders'));
        render(allProducts.map((product) => productTemplate(product)), document.querySelector('#allOrders tbody'));
    }

    render(dashboard(), container);
    rerender(orders, allProducts);
}