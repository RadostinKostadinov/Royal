import { html, render } from "lit";
import { socket, stopAllSockets } from "../../api/api";
import { getBillById } from "../waiter";
import { container } from "../../../app";
import page from 'page';
import axios from "axios";

// FUNCTIONS

async function scrapProducts(billToScrap) {
    return await axios.post('/scrapProducts', {
        billToScrap
    }).catch((err) => {
        return err.response;
    });
}

// PAGES

export async function scrapProductsPage(ctx) {
    // Stop listening on old sockets
    stopAllSockets();

    const selectedTable = ctx.params.tableId;
    let bill = (await getBillById(ctx.params.billId)).data;

    let productsToScrap = {
        _id: bill._id, // bill id
        number: bill.number, // bill number
        table: bill.table, // table id
        products: [],
        total: 0,
    };

    socket.on('billChanged', (billData) => {
        // First check if this user is on the bill
        if (billData._id !== bill._id)
            return;

        // Bill changed, rerender empty (default) view
        productsToScrap.products = [];
        productsToScrap.total = 0;
        bill.products = [];
        bill.total = 0;
        rerender(bill, productsToScrap);
    });

    socket.on('addToScrap/returnToBill', (data) => {
        // First check if we are on same bill
        if (bill._id !== data.bill._id)
            return;

        bill = data.bill;
        productsToScrap = data.productsToScrap;

        rerender(bill, productsToScrap)
    });

    // Check if someone just entered, and if so - send them this user's bill and productsToScrap
    socket.on('entered-scrapProductsPage', () => {
        socket.emit('addToScrap/returnToBill', { bill, productsToScrap });
    });

    // Emit first time entering the page, to notify the user that is already editing (if any) to send their info
    socket.emit('entered-scrapProductsPage');

    function rerender(bill, productsToScrap) {
        render(productsInBillTemplate(bill), document.getElementById('productsInBill'));
        render(productsToPayTemplate(productsToScrap), document.getElementById('productsToPay'));
        render(html`${bill.total.toFixed(2)}`, document.querySelector('#totalOnTable .price'))
        render(html`${productsToScrap.total.toFixed(2)}`, document.querySelector('#totalToPay .price'))
    }

    function addToScrap(index, product) {
        // Transfer 1 qty of this product
        // index in bill.products array
        product.qty--; // this is referencing directly the object in bill
        bill.total -= product.product.sellPrice;

        if (product.qty === 0)
            bill.products.splice(index, 1); // remove from array if qty = 0

        let foundProduct = false;
        for (let pr of productsToScrap.products) {
            if (pr.product._id === product.product._id) {
                pr.qty++;
                foundProduct = true;
                break;
            }
        }

        // if product not found, create it
        if (foundProduct === false) {
            productsToScrap.products.push({
                product: product.product,
                qty: 1
            });
        }
        productsToScrap.total += product.product.sellPrice;

        socket.emit('addToScrap/returnToBill', { bill, productsToScrap });

        // Rerender both bill and toPay
        rerender(bill, productsToScrap);
    }

    function returnToBill(index, product) {
        // Transfer 1 qty of this product BACK to bill

        product.qty--;
        productsToScrap.total = productsToScrap.total - product.product.sellPrice;

        if (product.qty === 0)
            productsToScrap.products.splice(index, 1);

        let foundProduct = false;
        for (let pr of bill.products) {
            if (pr.product._id === product.product._id) {
                pr.qty++;
                foundProduct = true;
                break;
            }
        }

        if (foundProduct === false) {
            bill.products.push({
                product: product.product,
                qty: 1
            });
        }
        bill.total += product.product.sellPrice;

        socket.emit('addToScrap/returnToBill', { bill, productsToScrap });

        // Rerender both bill and toPay
        rerender(bill, productsToScrap);
    }

    const productsInBillTemplate = (bill) => html`
        <table class="text-center">
            <thead>
                <tr>
                    <th width="50%">Артикул</th>
                    <th width="15%">Брой</th>
                    <th width="15%">Сума</th>
                    <th width="20%"></th>
                </tr>
            </thead>
            <tbody>
                ${bill.products.map((product, index) => {
        return html`
                    <tr>
                        <td width="50%">${product.product.name}</td>
                        <td width="15%">${product.qty}</td>
                        <td width="15%">${(product.product.sellPrice * product.qty).toFixed(2)}</td>
                        <td @click=${() => addToScrap(index, product)} width="20%" class="text-uppercase remove cursor-pointer">Бракувай</td>
                    </tr>`
    })}
            </tbody>
        </table>
    `;

    const productsToPayTemplate = (bill) => html`
        <table class="text-center">
            <thead>
                <tr>
                    <th width="50%">Артикул</th>
                    <th width="15%">Брой</th>
                    <th width="15%">Сума</th>
                    <th width="20%"></th>
                </tr>
            </thead>
            <tbody>
                ${bill.products.map((product, index) => {
        return html`
                    <tr>
                        <td width="50%">${product.product.name}</td>
                        <td width="15%">${product.qty}</td>
                        <td width="15%">${(product.product.sellPrice * product.qty).toFixed(2)}</td>
                        <td @click=${() => returnToBill(index, product)} width="20%" class="cursor-pointer text-uppercase back">Върни</td>
                    </tr>`
    })}
            </tbody>
        </table>
    `;

    async function scrapPrdcts() {
        if (productsToScrap.length === 0) return;

        const res = await scrapProducts(productsToScrap);

        if (res.status === 200) {
            // Notify anyone that is already in this screen
            productsToScrap.products = [];
            productsToScrap.total = 0;

            // Notify anyone still scrapping products
            socket.emit('addToScrap/returnToBill', { bill, productsToScrap });

            // Notify that bill changed, rerender wherever needed
            socket.emit('billChanged', bill); // send new bill to server to rerender for anyone in same view
            page(`/waiter/table/${selectedTable}`);
        } else {
            console.error(res);
            alert('Възникна грешка!');
        }
    }

    const template = () => html`
        <div id="payPartOfBill">
            <div id="productsInBill" class="productsTables"></div>
            <div id="controlsAndTotals" class="d-flex gap-3 flex-column justify-content-between">
                <div class="totals d-flex flex-column justify-content-between text-center">
                    <div id="totalOnTable" class="totalBlock">
                        <span>Оставаща сума на масата</span>
                        <div class="price"></div>
                    </div>
                    <div id="totalToPay" class="totalBlock">
                        <span>Сума за брак</span>
                        <div class="price"></div>
                    </div>
                </div>
                <div class="controls d-flex flex-column justify-content-between">
                    <div class="d-flex gap-3 flex-column justify-content-evenly">
                        <button @click=${scrapPrdcts}>Брак</button>
                    </div>
                    <button @click=${() => page(`/waiter/table/${selectedTable}`)}>Отказ</button>
                </div>
            </div>
            <div id="productsToPay" class="productsTables"></div>
        </div>
    `;

    render(template(), container);
    render(productsInBillTemplate(bill), document.getElementById('productsInBill'));
    render(html`${(bill.total).toFixed(2)}`, document.querySelector('#totalOnTable .price'))
    render(html`${(productsToScrap.total).toFixed(2)}`, document.querySelector('#totalToPay .price'))
}