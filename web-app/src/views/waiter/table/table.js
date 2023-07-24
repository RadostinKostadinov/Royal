import page from 'page';
import axios from "axios";
import { html, render } from "lit";
import { getAllCategories } from "../../admin/category";
import { getProductsFromCategory } from "../../admin/product";
import { auth, socket, stopAllSockets } from "../../api/api";
import { printBill } from "../../api/printer";
import { addProductToBill, addProductsToHistory, getAddonsForCategory, getBillById, productsInBill, productsTemplate, removeOneFromBill, sellProducts } from "../waiter";
import { container } from '../../../app';
import $ from 'jquery';
import { payPartOfBillPage } from './pay';
import { scrapProductsPage } from './scrap';
import { moveProductsPage } from './move';

// FUNCTIONS
async function createNewOrder(products, tableId) {
    return await axios.post('/createNewOrder', {
        products,
        tableId
    }).catch((err) => {
        return err.response;
    });
}

async function generateBills(_id) {
    return await axios.post('/generateBills', {
        _id
    }).catch((err) => {
        return err.response;
    });
}

async function getLastPaidBillByTableId(_id, billId) {
    return await axios.post('/getLastPaidBillByTableId', {
        _id,
        billId
    }).catch((err) => {
        return err.response;
    });
}

// PAGES

async function tableViewPage(ctx) {
    // Stop listening on old sockets
    stopAllSockets();

    /*  Wait 10 seconds of inactivity after adding or removing product
    to bill before automatically creating order and adding them to history */
    const awayTime = 10 * 1000; // 10 seconds
    var awayTimeout;

    function markBillAsActiveInactive(bill) {
        if (bill.total === 0) {
            $(`[_id=${bill._id}]`).removeClass('hasProducts');
        } else {
            $(`[_id=${bill._id}]`).addClass('hasProducts');
        }
    }

    // Rerender products in bill when someone pays/scraps/removes/moves a product from the bill
    socket.on('billChanged', (bill) => {
        // First check if this user is on the same table
        if (bill.table !== selectedTable)
            return;

        markBillAsActiveInactive(bill);

        // Check if on same TABLE and BILL
        if (bill._id !== selectedBillId)
            return;

        renderProductsInBill(bill); // if yes, rerender products in that bill
    });

    const selectedTable = ctx.params.tableId; // Get selected (clicked) table _id

    if (selectedTable === null) return page('/waiter');

    const categories = await getAllCategories(false); // Get all categories to display

    let billData,
        selectedBillId, // by default the first one is selected, so its never undefined
        selectedX = 1, // can be 2,3... (number) or undefined (no X selected)
        addedProducts = [],
        newOrderProducts = {}; // add products HISTORY here and send them all at once when going back, or going to pay or moving to any other page

    // NEW: Add all added products together to history
    async function addToHistoryAndCreateNewOrder() { // Sends all products that were added using addToArray()
        clearTimeout(awayTimeout);
        if (addedProducts.length) {
            const res = await addProductsToHistory(addedProducts, selectedBillId);
            addedProducts = []; // Reset

            if (res.status !== 200) {
                console.error(res);
                alert('Възникна грешка!');
            }
        }

        if (Object.keys(newOrderProducts).length) {
            await createNewOrder(Object.values(newOrderProducts), ctx.params.tableId);
            socket.emit('order:change'); // notify bartender of new order
            newOrderProducts = {}; // Reset
        }
    }

    // Add product to bill (NEW: doesn't add to history)
    async function addToBill(e) {
        awayTimeout = setTimeout(addToHistoryAndCreateNewOrder, awayTime);

        const _id = $(e.target).attr('_id');
        const action = 'added'; // used in addToHistory to make different arrays based on this value (added at once, removed at once, etc.)

        // Add to history array
        addedProducts.push({ _id, selectedX, action });

        // Add to new order
        // If product is already in newOrder, add to its quantity
        if (newOrderProducts.hasOwnProperty(_id))
            newOrderProducts[_id].qty += selectedX;
        else
            newOrderProducts[_id] = { _id, qty: selectedX };


        const res = await addProductToBill(_id, selectedX, selectedBillId);

        if (res.status === 200) {
            // get bill and render all products inside it
            billData = res.data;

            markBillAsActiveInactive(billData);
            socket.emit('billChanged', billData); // send new bill to server to rerender for anyone in same view
            renderProductsInBill(billData);
        } else {
            console.error(res);
            alert('Възникна грешка');
        }

        // set X back to 1, so you dont have to click it to reset it
        changeSelectedX(1);
    }

    // Loads all products from category to display
    async function loadProductsFromCategory(e) {
        clearTimeout(awayTimeout);
        // e could be from the initial loading of the template (with categires[0]._id)
        // or the actual event of clicking a button
        let _id;
        if (typeof e === 'string') // if loading page for first time
            _id = e;
        else {
            // if button is clicked
            let btn = $(e.target);

            // find and remove old category active class
            $('#tableControls .categories button.active').removeClass('active');

            // add active class
            btn.addClass('active');

            _id = btn.attr('_id');
        }

        if (!_id) return;

        const res = await getProductsFromCategory(_id);

        if (res.status === 200) {
            const products = res.data;

            render(productsTemplate(products, addToBill), document.querySelector('#tableControls .products'))

            // Check if category has addons for products
            const addonsRes = await getAddonsForCategory(_id);

            if (addonsRes.status === 200) {
                const addons = addonsRes.data;
                render(addonsTemplate(addons), document.querySelector('#tableControls .addons'))
            } else {
                console.error(addonsRes);
                return alert('Възникна грешка!');
            }
        } else {
            alert('Възникна грешка!')
            console.error(res);
        }
    }

    const addonsTemplate = (addons) => html`
        ${addons.map((addon) => html`<button @click=${addToBill} _id=${addon._id}>${addon.name}</button>`)}
    `;

    async function changeSelectedBill(e) {
        clearTimeout(awayTimeout);
        if (addedProducts.length) // If we have any products added to one bill, and we change the bill -> send products to server
            await addToHistoryAndCreateNewOrder();

        const selectedBillEl = $(e.target);
        selectedBillId = selectedBillEl.attr('_id'); // set new bill as selected

        // find and remove "active" from old bill
        $('#tableControls .bills button.active').removeClass('active');

        // add active class to new bill
        selectedBillEl.addClass('active');

        await renderProductsInBill();
        await getLastPaidOnBill();
    }

    function changeSelectedX(e) {
        if (e === 1) { // if coming from addToBill reset
            selectedX = 1;
            return $('#tableControls .xButtons button.active').removeClass('active'); // remove active class from old X
        }
        const selectedXEl = $(e.target);
        const newX = +selectedXEl.text()

        // If clicked same button, remove X (maybe it was accident, so he clicked again to remove X.. because we dont have X1)
        if (selectedX === newX) {
            selectedX = undefined;
            selectedXEl.removeClass('active');
            selectedX = 1;
        } else {
            selectedX = newX; // set new X as selected

            // find and remove "active" from old X
            $('#tableControls .xButtons button.active').removeClass('active');

            // add active class to new X
            selectedXEl.addClass('active');
        }
    }

    // Create X bills in the tables database so we can get ID's of bills to place in buttons, then render
    async function initializeBills() {
        const res = await generateBills(selectedTable);

        if (res.status === 201 || res.status === 200) {
            // 201 == created, 200 == already created (no problem)
            const bills = res.data;
            selectedBillId = bills[0]._id; // set first bill as selected automatically

            await renderProductsInBill();// load its products
            render(billsTemplate(bills), document.querySelector('#tableControls .bills'));
            getLastPaidOnBill();
        } else {
            console.error(res);
            alert('Възникна грешка!');
        }
    }

    async function renderProductsInBill(bill) {
        if (bill) // if coming from addToBill (we already have the bill returned via json)
            return render(productsInBill(bill, rmvOneFromBill), document.querySelector('#tableControls .addedProducts'));

        // else we changedSelectedBill and dont have anything
        const _id = selectedBillId;

        // Get products in bill
        const res = await getBillById(_id);


        if (res.status === 200) {
            billData = res.data;

            render(productsInBill(billData, rmvOneFromBill), document.querySelector('#tableControls .addedProducts'));
        } else {
            console.error(res);
            alert('Възникна грешка!');
        }
    }

    async function rmvOneFromBill(_id) {
        awayTimeout = setTimeout(addToHistoryAndCreateNewOrder, awayTime);

        const action = 'removed'; // used in addToHistory to make different arrays based on this value (added at once, removed at once, etc.)

        // Add to history array
        addedProducts.push({ _id, selectedX, action });

        // Remove qty from new order (if product exists)
        if (newOrderProducts.hasOwnProperty(_id)) {
            newOrderProducts[_id].qty -= selectedX;

            // If qty is 0, remove from newOrder
            if (newOrderProducts[_id].qty === 0)
                delete newOrderProducts[_id];
        }

        // Remove 1 qty of this product from this bill
        const res = await removeOneFromBill(_id, selectedBillId);

        if (res.status === 200) {
            billData = res.data;

            markBillAsActiveInactive(billData);
            socket.emit('billChanged', billData); // send new bill to server to rerender for anyone in same view
            renderProductsInBill(billData);
        } else {
            console.error(res);
            alert('Възникна грешка!');
        }
    }

    async function getLastPaidOnBill() {
        const res = await getLastPaidBillByTableId(selectedTable, selectedBillId);

        if (res.data) {
            render('Последна', document.querySelector('table tfoot .lastPaidText'))
            render(res.data.total.toFixed(2), document.querySelector('table tfoot .lastPaidPrice'))
        } else {
            render('', document.querySelector('table tfoot .lastPaidText'))
            render('', document.querySelector('table tfoot .lastPaidPrice'))
        }
    }

    async function addToHistoryAndCreateNewOrder() { // Sends all products that were added using addToArray()
        clearTimeout(awayTimeout);
        if (addedProducts.length) {
            const res = await addProductsToHistory(addedProducts, selectedBillId);
            addedProducts = []; // Reset

            if (res.status !== 200) {
                console.error(res);
                alert('Възникна грешка!');
            }
        }

        if (Object.keys(newOrderProducts).length) {
            await createNewOrder(Object.values(newOrderProducts), ctx.params.tableId);
            socket.emit('order:change'); // notify bartender of new order
            newOrderProducts = {}; // Reset
        }
    }

    async function payWholeBill(toPrinter) {
        clearTimeout(awayTimeout);
        if (billData.products.length === 0) return;

        if (addedProducts.length) // If we have any products added to one bill, and we change the bill -> send products to server
            await addToHistoryAndCreateNewOrder();

        const res = await sellProducts(billData);

        if (res.status === 200) {
            billData = res.data.billData;
            socket.emit('billChanged', billData); // send new bill to server to rerender for anyone in same view

            // If we want to print the bill
            if (toPrinter)
                printBill(res.data.history, res.data.tableName);

            page(`/waiter`);
        } else {
            console.error(res);
            alert('Възникна грешка!');
        }

    }

    // i==0 (if first bill, mark it as "active")
    const billsTemplate = (bills) => html`
        ${bills.map((bill, i) => {
        let classes = [
            i === 0 ? 'active' : '',
            bill.total > 0 ? 'hasProducts' : ''];

        return html`<button @click=${changeSelectedBill} class=${classes.join(' ')} _id=${bill._id}>${i + 1}</button>`
    })}
    `;

    async function goBack() {
        clearTimeout(awayTimeout);
        if (addedProducts.length)
            await addToHistoryAndCreateNewOrder();

        page('/waiter');
    }

    async function goToPay() {
        clearTimeout(awayTimeout);
        if (addedProducts.length)
            await addToHistoryAndCreateNewOrder();

        page(`${ctx.path}/bill/${selectedBillId}/pay`)
    }

    async function goToScrap() {
        clearTimeout(awayTimeout);
        if (addedProducts.length)
            await addToHistoryAndCreateNewOrder();

        page(`${ctx.path}/bill/${selectedBillId}/scrap`)
    }

    async function goToMove() {
        clearTimeout(awayTimeout);
        if (addedProducts.length)
            await addToHistoryAndCreateNewOrder();

        page(`${ctx.path}/bill/${selectedBillId}/move`)
    }

    const controlsTemplate = () => html`
        <div id="tableControls">
            <div class="categories">
                ${categories.map((category, i) => html`<button @click=${loadProductsFromCategory} class=${i === 0 ? 'active' : ''} _id=${category._id}>${category.name}</button>`)}
            </div>
            <div class="productsAndXButtons d-flex flex-column justify-content-between">
                <div class="products"></div>
                <div class="xButtons d-flex justify-content-center gap-4">
                    <button @click=${changeSelectedX}>2</button>
                    <button @click=${changeSelectedX}>3</button>
                    <button @click=${changeSelectedX}>4</button>
                    <button @click=${changeSelectedX}>5</button>
                    <button @click=${changeSelectedX}>6</button>
                </div>
            </div>
            <div class="bills"></div>
            <div class="controlsAndAddons d-flex flex-column justify-content-between">
                <div class="addons d-flex flex-column justify-content-evenly"></div>
                <div class="controls d-flex flex-column justify-content-evenly">
                    <button @click=${goToPay}>Извади</button>
                    <button @click=${() => payWholeBill(true)}>Приключи с принт</button>
                    <button @click=${() => payWholeBill()}>Приключи</button>
                    <button @click=${goToScrap}>Брак</button>
                    <button @click=${goToMove}>Премести</button>
                    <button @click=${goBack}>Назад</button>
                </div>
            </div>
            <div class="addedProducts"></div>
        </div>
    `;

    // Render default view (select first category, load its products, initialize bills)
    loadProductsFromCategory(categories[0]._id);
    initializeBills();
    render(controlsTemplate(), container);
}

export function tablePages() {
    page('/waiter/table/:tableId', auth, tableViewPage);
    page('/waiter/table/:tableId/bill/:billId/pay', auth, payPartOfBillPage);
    page('/waiter/table/:tableId/bill/:billId/scrap', auth, scrapProductsPage);
    page('/waiter/table/:tableId/bill/:billId/move', auth, moveProductsPage);
}