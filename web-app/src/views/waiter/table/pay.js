import { html, render } from "lit";
import { fixPrice, socket, stopAllSockets } from "../../api/api";
import { getBillById, sellProducts } from "../waiter";
import $ from 'jquery';
import { printBill } from "../../api/printer";
import { container } from "../../../app";
import page from 'page';

export async function payPartOfBillPage(ctx) {
    // Stop listening on old sockets
    stopAllSockets();

    const selectedTable = ctx.params.tableId;
    let bill = (await getBillById(ctx.params.billId)).data;
    let productsToPay = {
        _id: bill._id, // bill id
        number: bill.number, // bill number
        table: bill.table, // table id
        products: [],
        total: 0,
    };

    socket.on('billChanged', (billData) => {
        // First check if this user is on the same bill
        if (billData._id !== bill._id)
            return;

        // // Bill changed, rerender empty (default) view
        productsToPay.products = [];
        productsToPay.total = 0;
        bill.products = [];
        bill.total = 0;
        rerender(bill, productsToPay);
    });

    socket.on('addToPay/returnToBill', (data) => {
        // First check if we are on same bill
        if (bill._id !== data.bill._id)
            return;

        bill = data.bill;
        productsToPay = data.productsToPay;

        rerender(bill, productsToPay)
    });

    // Check if someone just entered, and if so - send them this user's bill and productsToPay
    socket.on('entered-payPartOfBillPage', () => {
        socket.emit('addToPay/returnToBill', { bill, productsToPay });
    });

    // Emit first time entering the page, to notify the user that is already editing (if any) to send their info
    socket.emit('entered-payPartOfBillPage');

    function rerender(bill, productsToPay) {
        render(productsInBillTemplate(bill), document.getElementById('productsInBill'));
        render(productsToPayTemplate(productsToPay), document.getElementById('productsToPay'));
        render(html`${bill.total.toFixed(2)}`, document.querySelector('#totalOnTable .price'))
        render(html`${productsToPay.total.toFixed(2)}`, document.querySelector('#totalToPay .price'))
    }

    function addToPay(index, product) {
        // Transfer 1 qty of this product
        // index in bill.products array
        product.qty--; // this is referencing directly the object in bill
        bill.total -= product.product.sellPrice;

        if (product.qty === 0)
            bill.products.splice(index, 1); // remove from array if qty = 0

        let foundProduct = false;
        for (let pr of productsToPay.products) {
            if (pr.product._id === product.product._id) {
                pr.qty++;
                foundProduct = true;
                break;
            }
        }

        // if product not found, create it
        if (foundProduct === false) {
            productsToPay.products.push({
                product: product.product,
                qty: 1
            });
        }

        productsToPay.total += product.product.sellPrice;
        $('input#discount').attr('max', productsToPay.total);
        calculateDiscount();

        socket.emit('addToPay/returnToBill', { bill, productsToPay });

        // Rerender both bill and toPay
        rerender(bill, productsToPay);
        calculateDiscount();
    }

    function returnToBill(index, product) {
        // Transfer 1 qty of this product BACK to bill

        product.qty--;
        productsToPay.total = productsToPay.total - product.product.sellPrice;
        $('input#discount').attr('max', productsToPay.total);

        if (product.qty === 0)
            productsToPay.products.splice(index, 1);

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

        socket.emit('addToPay/returnToBill', { bill, productsToPay });

        // Rerender both bill and toPay
        rerender(bill, productsToPay);
        calculateDiscount();
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
                        <td @click=${() => addToPay(index, product)} width="20%" class="text-uppercase remove cursor-pointer">Извади</td>
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

    async function sellPrdcts(toPrinter) {
        if (productsToPay.products.length === 0) return;

        const discountEl = $('input#discount');
        const discount = +discountEl.val();
        const maxDiscount = discountEl.attr('max');

        if (discount > maxDiscount)
            return alert('Отстъпката не може да е по-голяма от сумата за плащане!')

        const res = await sellProducts(productsToPay, discount);

        if (res.status === 200) {
            // Notify anyone that is already in this screen
            productsToPay.products = [];
            productsToPay.total = 0;

            // If we want to print the bill
            if (toPrinter)
                printBill(res.data.history, res.data.tableName, discount);

            // Notify anyone still paying products
            socket.emit('addToPay/returnToBill', { bill, productsToPay });

            // Notify that bill changed, rerender wherever needed
            socket.emit('billChanged', bill); // send new bill to server to rerender for anyone in same view
            page(`/waiter/table/${selectedTable}`);
        } else {
            console.error(res);
            alert('Възникна грешка!');
        }
    }

    function calculateDiscount(e) {
        const discountEl = $('input#discount');
        let discount = +discountEl.val();
        let maxDiscount = discountEl.attr('max');
        if (!maxDiscount)
            maxDiscount = 0;

        if (e) { // Coming from input change
            if (discount > maxDiscount) {
                discountEl.val('');
                render(fixPrice(productsToPay.total), document.querySelector('#totalToPay .price'));
                return alert('Отстъпката не може да е по-голяма от сумата за плащане!');
            }

            // Change total to reflect discount
            return render(fixPrice(productsToPay.total - discount), document.querySelector('#totalToPay .price'));
        }

        // Else coming from addToPay/returnToBill
        if (discount > maxDiscount) // Set discount to the max possible and recalculate
            discount = maxDiscount;

        if (discount === 0)
            discountEl.val('');
        else
            discountEl.val(discount);

        return render(fixPrice(productsToPay.total - discount), document.querySelector('#totalToPay .price'));
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
                    <div>
                        <span>Отстъпка</span>
                        <input @change=${calculateDiscount} step="0.1" min="0" type="number" class="form-control" id="discount" />
                    </div>
                    <div id="totalToPay" class="totalBlock">
                        <span>Извадена сума от масата</span>
                        <div class="price"></div>
                    </div>
                </div>
                <div class="controls d-flex flex-column justify-content-between">
                    <div class="d-flex gap-3 flex-column justify-content-evenly">
                        <button @click=${() => sellPrdcts(true)}>Извади с принт</button>
                        <button @click=${() => sellPrdcts()}>Извади</button>
                    </div>
                    <button @click=${() => page(`/waiter/table/${selectedTable}`)}>Отказ</button>
                </div>
            </div>
            <div id="productsToPay" class="productsTables"></div>
        </div>
    `;

    render(template(), container);
    rerender(bill, productsToPay);
}