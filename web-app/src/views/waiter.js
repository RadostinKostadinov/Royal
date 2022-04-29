import page from 'page';
import '../css/waiter/menu.css';
import '../css/waiter/tables/tables.css';
import '../css/waiter/tables/middle.css';
import '../css/waiter/tables/inside.css';
import '../css/waiter/tableControls.css';
import '../css/waiter/payMoveScrap.css';
import { container } from "../app";
import { html, render } from 'lit/html.js';
import $ from "jquery";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { printBill, fixPrice, stopAllSockets, socket, getAllPaidBills, getAddonsForCategory, getLastPaidBillByTableId, addProductToBill, generateBills, getAllCategories, getProductsFromCategory, logout, getBillById, removeOneFromBill, sellProducts, scrapProducts, addProductsToHistory, getTables, getTableTotalById, createNewOrder, getTodaysReport, moveProducts, printReport, getConsumed, generatePersonalBill } from '../api';

let lastRenderedLocation = 'middle'; // remembers the last rendered location, so when the user clicks "Back", take them there

// Dashboard contains all the code for rendering the tables view (grid with tables)
export async function waiterDashboardPage() {
    // Stop listening on old sockets
    stopAllSockets();

    renderTablesView(undefined, lastRenderedLocation);

    // Rerender table total when someone adds/removes/scraps.. product from the bill
    socket.on('billChanged', async (bill) => {
        const tableId = bill.table,
            tableDiv = $(`[_id="${tableId}"]`);

        // If this table is currently on screen, update total
        if (tableDiv.length) {
            const res = await getTableTotalById(tableId);
            const newTotal = res.data.toFixed(2),
                totalSpan = $(`[_id="${tableId}"] .total`);
            // Set new total
            if (newTotal > 0) {
                totalSpan.text(newTotal);
                tableDiv.addClass('taken');
            }
            else {
                // No products in table, remove total and class
                totalSpan.text('');
                tableDiv.removeClass('taken');
            }
        }
    });

    // Get all tables from db
    const date = new Date();

    function getDay() {
        const day = date.getDay();
        if (day === 0)
            return 'Неделя';
        if (day === 1)
            return 'Понеделник';
        if (day === 2)
            return 'Вторник';
        if (day === 3)
            return 'Сряда';
        if (day === 4)
            return 'Четвъртък';
        if (day === 5)
            return 'Петък';
        if (day === 6)
            return 'Събота';
    }

    function getDate() {
        let day = date.getDate();
        if (day < 10)
            day = '0' + day;

        let month = date.getMonth() + 1;
        if (month < 10)
            month = '0'+month;

        return `${day}.${month}.${date.getFullYear()}`
    }

    function getTime() {
        let hours = date.getHours();
        if (hours < 10)
            hours = '0'+hours;

        let minutes = date.getMinutes();
        if (minutes < 10)
            minutes = '0' + minutes;

        return `${hours}:${minutes}`
    }

    async function getTdsReport() {
        const res = await getTodaysReport();

        if (res.status === 200) {
            const { combinedReport, personalReport } = res.data;

            render(reportTemplate(combinedReport, personalReport), document.querySelector('#reportModal .modal-body'))
        } else {
            console.error(res);
            alert('Възникна грешка');
        }
    }

    const reportTemplate = (combinedReport, personalReport) => html`
        <table class="table table-striped table-dark table-hover fw-bold">
            <thead>
                <tr>
                    <th scope="col"></th>
                    <th scope="col">Личен</th>
                    <th scope="col">Общ</th>
                </tr>
            </thead>
            <tbody>
                <tr class="table-success">
                    <td>Продажби</td>
                    <td>${fixPrice(personalReport.income) + ' лв.'}</td>
                    <td>${fixPrice(combinedReport.income) + ' лв.'}</td>
                </tr>
                <tr class="table-warning">
                    <td>Неплатени</td>
                    <td>${fixPrice(personalReport.remaining) + ' лв.'}</td>
                    <td>${fixPrice(combinedReport.remaining) + ' лв.'}</td>
                </tr>
                <tr class="table-danger">
                    <td>Брак</td>
                    <td>${fixPrice(personalReport.scrapped) + ' лв.'}</td>
                    <td>${fixPrice(combinedReport.scrapped) + ' лв.'}</td>
                </tr>
                <tr class="table-secondary">
                    <td>Консумация</td>
                    <td>${fixPrice(personalReport.consumed) + ' лв.'}</td>
                    <td>${fixPrice(combinedReport.consumed) + ' лв.'}</td>
                </tr>
                <tr class="table-primary">
                    <td>Общ приход</td>
                    <td>${fixPrice(personalReport.total) + ' лв.'}</td>
                    <td>${fixPrice(combinedReport.total) + ' лв.'}</td>
                </tr>
            </tbody>
        </table>
    `;

    const dashboardTemplate = (grid) => html`
        <div class="modal fade" id="reportModal" tabindex="-1" aria-labelledby="reportModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="reportModalLabel">Междинен отчет</h5>
                </div>
                <div class="modal-body">
                    
                </div>
                <div class="modal-footer justify-content-between">
                    <button @click=${printReport} type="button" class="gray-btn" data-bs-dismiss="modal">Принт</button>
                    <button type="button" class="gray-btn" data-bs-dismiss="modal">Затвори</button>
                </div>
                </div>
            </div>
        </div>

        <div id="waiterDashboard" class="d-flex">
            <div id="waiterMenu" class="d-flex flex-column h-100">
                <div id="todayInfo" class="d-flex flex-column text-center gap-1 text-uppercase">
                    <div>${getDay()}</div>
                    <div>${getDate()}</div>
                    <div>${getTime()}</div>
                </div>
                <div class="d-flex flex-column align-items-center mt-5 mb-5 justify-content-between h-100 w-100 ps-2 pe-2">
                    <div id="changeTablesViewButtons" class="d-flex flex-column text-center gap-3 w-100">
                        <button class=${lastRenderedLocation === 'inside' ? 'active' : ''} id="insideTablesBtn" @click=${(clickedBtn) => renderTablesView(clickedBtn, 'inside')}>Вътре</button>
                        <button class=${lastRenderedLocation === 'middle' ? 'active' : ''} id="middleTablesBtn" @click=${(clickedBtn) => renderTablesView(clickedBtn, 'middle')}>Градина</button>
                    </div>
                    <div class="d-flex flex-column text-center gap-3 w-100">
                        <button @click=${() => page('/consumation/')}>Консум.</button>
                        <button id="reportButton" @click=${getTdsReport} data-bs-toggle="modal" data-bs-target="#reportModal">Брак</button>
                        <button @click=${logout}>Изход</button>
                    </div>
                </div>
            </div>
            
            <div id="topMenuAndGrid">
                <div id="topMenu">
                    <button @click=${() => page('/bartender')}>Поръчки</button>
                    <button @click=${() => page('/waiter/showPaidBills')}>Плащания</button>
                </div>
    
                ${grid}
            </div>
        </div>
    `;

    const gridTemplate = (gridId, elements) => html`
        <div id=${gridId} class="tablesGrid">
            ${elements.map((element) => {
                const taken = element.total > 0 ? 'taken' : '';
                const allClasses = `${element.type} ${element.class} ${taken}`;
                //element.type = [table, text, wall]
                //element.class = 1,2,3... || v1,v2,v3... || n1,n2,n3...
                //element.name = Маса 1, Маса В1, Маса Н1..
                //element.total = undefined (if != table) || number (ex. 12.50) (if == table)
                if (element.type === 'wall')
                    return html`
                        <div class=${allClasses}></div>
                    `;
                    
                if (element.type === 'text')
                    return html`
                        <div class=${allClasses}>${element.name}</div>
                    `;

                return html`
                    <!-- <button @click=${() => page(`/waiter/table/${element.location}/${element._id}`)} class=${allClasses} _id=${element._id}> -->
                    <button @click=${() => page(`/waiter/table/${element._id}`)} class=${allClasses} _id=${element._id}>
                        <span class="name pe-none">${element.name}</span>
                        <span class="total pe-none">${element.total ? (element.total).toFixed(2) : ''}</span>
                    </button>`;
            })}
        </div>
    `;

    // This functions changes the table's view (shows the inside, outside or garden tables grid)
    async function renderTablesView(clickedBtnEvent, viewName) {
        if (clickedBtnEvent) { // if not coming from socket
            const clickedBtn = clickedBtnEvent.target;
            // Remove active class from any button that has it
            $('#changeTablesViewButtons button.active').removeClass('active');

            // Add active class to clicked btn
            $(clickedBtn).addClass('active');
        }

        let elements;

        lastRenderedLocation = viewName;
        const res = await getTables(lastRenderedLocation);

        if (res.status !== 200) {
            console.error(res);
            return alert('Възникна грешка!');
        }

        elements = res.data; // elements includes tables, walls, bar ..
        
        lastRenderedLocation = viewName;
        render(dashboardTemplate(gridTemplate(lastRenderedLocation, elements)), container);
    }
}

const productsInBill = (bill, btnFunc) => html`
        <table class="text-center">
            <thead>
                <tr>
                    <th width="7%"></th>
                    <th width="48%">Артикул</th>
                    <th width="15%">Брой</th>
                    <th width="15%">Цена</th>
                    <th width="15%">Сума</th>
                </tr>
            </thead>
            <tbody>
                ${bill.products.map((product) => {
                    return html`
                    <tr>
                        <td @click=${() => btnFunc(product.product._id)} width="7%" class="remove bi bi-x-circle text-danger cursor-pointer"></td>
                        <td width="48%">${product.product.name}</td>
                        <td width="15%">${product.qty}</td>
                        <td width="15%">${product.product.sellPrice.toFixed(2)}</td>
                        <td width="15%">${(product.product.sellPrice * product.qty).toFixed(2)}</td>
                    </tr>`
                })}
            </tbody>
            <tfoot class="text-uppercase">
                <tr>
                    <!-- <th width="60%" colspan="3"></th> -->
                    <th width="25%" class="lastPaidText"></th>
                    <th width="15%" class="lastPaidPrice"></th>
                    <th width="30%"></th>
                    <th width="15%">Сметка</th>
                    <th width="15%">${bill.total.toFixed(2)}</th>
                </tr>
            </tfoot>
        </table>
    `;

const productsTemplate = (products, btnFunc) => html`
    ${products.map((product) => html`<button @click=${btnFunc} _id=${product._id}>${product.name}</button>`)}
`;

export async function tableControlsPage(ctx) {
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

            return html`<button @click=${changeSelectedBill} class=${classes.join(' ')} _id=${bill._id}>${i+1}</button>`
        }) }
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

export async function consumationPage(ctx) {
    // Stop listening on old sockets
    stopAllSockets();

    // Rerender products in bill when someone pays/scraps/removes/moves a product from the bill
    socket.on('billChanged', (bill) => {
        // Check if on same TABLE and BILL
        if (bill._id !== selectedBillId)
            return;
        
        renderProductsInBill(bill); // if yes, rerender products in that bill
    });

    const categories = await getAllCategories(false); // Get all categories to display

    let billData,
        selectedBillId, // by default the first one is selected, so its never undefined
        selectedX = 1, // can be 2,3... (number) or undefined (no X selected)
        addedProducts = [];

    async function addToHistory() { // Sends all products that were added using addToArray()
        if (addedProducts.length) {
            const res = await addProductsToHistory(addedProducts, selectedBillId);
            addedProducts = []; // Reset
    
            if (res.status !== 200) {
                console.error(res);
                alert('Възникна грешка!');
            }
        }
    }

    async function addToBill(e) {
        const _id = $(e.target).attr('_id');
        const action = 'added'; // used in addToHistory to make different arrays based on this value (added at once, removed at once, etc.)
        
        // Add to history array
        addedProducts.push({ _id, selectedX, action });

        const res = await addProductToBill(_id, selectedX, selectedBillId);

        if (res.status === 200) {
            // get bill and render all products inside it
            billData = res.data;
            
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

    async function initializePersonalBill() {
        const res = await generatePersonalBill();

        if (res.status === 201 || res.status === 200) {
            // 201 == created, 200 == already created (no problem)
            const bill = res.data;
            selectedBillId = bill._id; // set first bill as selected automatically
                        
            await renderProductsInBill();// load its products
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
        const action = 'removed'; // used in addToHistory to make different arrays based on this value (added at once, removed at once, etc.)
        
        // Add to history array
        addedProducts.push({ _id, selectedX, action });
        
        // Remove 1 qty of this product from this bill
        const res = await removeOneFromBill(_id, selectedBillId);
        
        if (res.status === 200) {
            billData = res.data;

            socket.emit('billChanged', billData); // send new bill to server to rerender for anyone in same view
            renderProductsInBill(billData);
        } else {
            console.error(res);
            alert('Възникна грешка!');
        }
    }

    async function goBack() {
        if (addedProducts.length)
            await addToHistory();

        page('/waiter');
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
                <div class="pb-3 controls d-flex flex-column justify-content-end">
                    <button @click=${goBack}>Назад</button>
                </div>
            </div>
            <div class="addedProducts"></div>
        </div>
    `;

    // Render default view (select first category, load its products, initialize bills)
    loadProductsFromCategory(categories[0]._id);
    initializePersonalBill();
    render(controlsTemplate(), container);
}

export async function moveProductsPage(ctx) {
    // Stop listening on old sockets
    stopAllSockets();
    
    const selectedTable = ctx.params.tableId;
    let bill = (await getBillById(ctx.params.billId)).data;
    let productsToMove = {
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
        productsToMove.products = [];
        productsToMove.total = 0;
        bill.products = [];
        bill.total = 0;
        rerender(bill, productsToMove);
    });

    socket.on('addToMove/returnToBill', (data) => {
        // First check if we are on same bill
        if (bill._id !== data.bill._id)
            return;

        bill = data.bill;
        productsToMove = data.productsToMove;

        rerender(bill, productsToMove)
    });

    // Check if someone just entered, and if so - send them this user's bill and productsToPay
    socket.on('entered-moveProductsPage', () => {
        socket.emit('addToMove/returnToBill', { bill, productsToMove });
    });

    // Emit first time entering the page, to notify the user that is already editing (if any) to send their info
    socket.emit('entered-moveProductsPage');

    function rerender(bill, productsToMove) {
        render(productsInBillTemplate(bill), document.getElementById('productsInBill'));
        render(productsToMoveTemplate(productsToMove), document.getElementById('productsToPay'));
        render(html`${bill.total.toFixed(2)}`, document.querySelector('#totalOnTable .price'))
        render(html`${productsToMove.total.toFixed(2)}`, document.querySelector('#totalToPay .price'))
    }

    function addToMove(index, product) {
        // Transfer 1 qty of this product
        // index in bill.products array
        product.qty--; // this is referencing directly the object in bill
        bill.total -= product.product.sellPrice;

        if (product.qty === 0)
            bill.products.splice(index, 1); // remove from array if qty = 0

        let foundProduct = false;
        for (let pr of productsToMove.products) {
            if (pr.product._id === product.product._id) {
                pr.qty++;
                foundProduct = true;
                break;
            }
        }

        // if product not found, create it
        if (foundProduct === false) {
            productsToMove.products.push({
                product: product.product,
                qty: 1
            });
        }

        productsToMove.total += product.product.sellPrice;

        socket.emit('addToMove/returnToBill', { bill, productsToMove});

        // Rerender both bill and toPay
        rerender(bill, productsToMove);
    }

    function returnToBill(index, product) {
        // Transfer 1 qty of this product BACK to bill

        product.qty--;
        productsToMove.total = productsToMove.total - product.product.sellPrice;

        if (product.qty === 0)
            productsToMove.products.splice(index, 1);

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

        socket.emit('addToMove/returnToBill', { bill, productsToMove });

        // Rerender both bill and toPay
        rerender(bill, productsToMove);
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
                        <td @click=${() => addToMove(index, product)} width="20%" class="text-uppercase remove cursor-pointer">Премести</td>
                    </tr>`
                })}
            </tbody>
        </table>
    `;

    const productsToMoveTemplate = (bill) => html`
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

    async function movePrdcts(e) {
        // Get selected table _id
        const _id = $(e.target).attr('_id');
        if (productsToMove.products.length === 0) return;

        if (bill.table === _id) return;

        const res = await moveProducts(_id, productsToMove);

        if (res.status === 200) {
            const newBill = res.data; // new bill (that we moved the items to), used for rerendering table view in dashboard page
            // Notify anyone that is already in this screen
            productsToMove.products = [];
            productsToMove.total = 0;

            // Notify anyone still paying products
            socket.emit('addToMove/returnToBill', { bill, productsToMove });

            // Notify that bill changed, rerender wherever needed
            // Call it twice with new and current bill here, so if anyone in any of them, rerender
            socket.emit('billChanged', bill); // send CURRENT bill to server to rerender for anyone in same view
            socket.emit('billChanged', newBill); // send NEW bill to server to rerender for anyone in same view
            page(`/waiter/table/${selectedTable}`);
        } else {
            console.error(res);
            alert('Възникна грешка!');
        }
    }

    async function renderTables(viewname) {
        // Get tables for inside or middle
        let elements;
        const res = await getTables(viewname);

        if (res.status !== 200) {
            console.error(res);
            return alert('Възникна грешка!');
        }

        elements = res.data; // elements includes tables, walls, bar ..
        
        render(gridTemplate(viewname, elements), document.getElementById('modal-tables'));
    }

    const gridTemplate = (gridId, elements) => html`
        <div id=${gridId} class="tablesGrid">
            ${elements.map((element) => {
                const taken = element.total > 0 ? 'taken' : '';
                const allClasses = `${element.type} ${element.class} ${taken}`;
                //element.type = [table, text, wall]
                //element.class = 1,2,3... || v1,v2,v3... || n1,n2,n3...
                //element.name = Маса 1, Маса В1, Маса Н1..
                //element.total = undefined (if != table) || number (ex. 12.50) (if == table)
                if (element.type === 'wall')
                    return html`
                        <div class=${allClasses}></div>
                    `;
                    
                if (element.type === 'text')
                    return html`
                        <div class=${allClasses}>${element.name}</div>
                    `;

                return html`
                    <button @click=${movePrdcts} class=${allClasses} _id=${element._id}>
                        <span class="name pe-none">${element.name}</span>
                        <span class="total pe-none">${element.total ? (element.total).toFixed(2) : ''}</span>
                    </button>`;
            })}
        </div>
    `;

    const template = () => html`
        <div class="modal fade" id="tablesModal" tabindex="-1" aria-labelledby="tablesModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-fullscreen">
                <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="tablesModalLabel">Избери маса</h5>
                </div>
                <div class="modal-body">
                    <div id="modal-tables"></div>
                </div>
                <div class="modal-footer">
                    <button @click=${() => renderTables('inside')} type="button" class="gray-btn">Вътре</button>
                    <button @click=${() => renderTables('middle')} type="button" class="gray-btn">Градина</button>
                    <button type="button" class="gray-btn" data-bs-dismiss="modal">Затвори</button>
                </div>
                </div>
            </div>
        </div>

        <div id="payPartOfBill">
            <div id="productsInBill" class="productsTables"></div>
            <div id="controlsAndTotals" class="d-flex gap-3 flex-column justify-content-between">
                <div class="totals d-flex flex-column justify-content-between text-center">
                    <div id="totalOnTable" class="totalBlock">
                        <span>Оставаща сума на масата</span>
                        <div class="price"></div>
                    </div>
                    <div id="totalToPay" class="totalBlock">
                        <span>Сума за местене</span>
                        <div class="price"></div>
                    </div>
                </div>
                <div class="controls d-flex flex-column justify-content-between">
                    <div class="d-flex gap-3 flex-column justify-content-evenly">
                        <button data-bs-toggle="modal" data-bs-target="#tablesModal">Премести</button>
                    </div>
                    <button @click=${() => page(`/waiter/table/${selectedTable}`)}>Отказ</button>
                </div>
            </div>
            <div id="productsToPay" class="productsTables"></div>
        </div>
    `;

    // Load default table in modal
    renderTables('middle');

    render(template(), container);
    rerender(bill, productsToMove);
}

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

        socket.emit('addToPay/returnToBill', { bill, productsToPay});

        // Rerender both bill and toPay
        rerender(bill, productsToPay);
    }

    function returnToBill(index, product) {
        // Transfer 1 qty of this product BACK to bill

        product.qty--;
        productsToPay.total = productsToPay.total - product.product.sellPrice;

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

        const res = await sellProducts(productsToPay);

        if (res.status === 200) {
            // Notify anyone that is already in this screen
            productsToPay.products = [];
            productsToPay.total = 0;

            // If we want to print the bill
            if (toPrinter)
                printBill(res.data.history, res.data.tableName);

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
                        <span>Извадена сума от масата</span>
                        <div class="price"></div>
                    </div>
                </div>
                <div class="controls d-flex flex-column justify-content-between">
                    <div class="d-flex gap-3 flex-column justify-content-evenly">
                        <button @click=${() => sellPrdcts(true)}>Извади с принт</button>
                        <button @click=${sellPrdcts}>Извади</button>
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

export async function showPaidBillsPage() {
    const allPaidBills = await getAllPaidBills();

    const historiesRows = (histories) => html`
        ${histories.map((history) => {
            let allProducts = [];
            let total = 0;
            const date = new Date(history.when);
            const dateString = `${date.getDate() > 9 ? date.getDate() : '0' + date.getDate()}.${(date.getMonth() + 1) > 9 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)}.${date.getFullYear()}`;
            const timeString = `${date.getHours() > 9 ? date.getHours() : '0' + date.getHours()}:${date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes()}`;

            for (let product of history.products) {
                total += product.qty * product.price;
                allProducts.push(html`<div>${product.name} x ${product.qty} бр.</div>`)
            }

            return html`
            <tr>
                <td>${dateString}</td>
                <td>${timeString}</td>
                <td>${history.table.name}</td>
                <td>${history.billNumber}</td>
                <td class="text-capitalize">${history.user.name}</td>
                <td>${allProducts}</td>
                <td>${total.toFixed(2)}</td>
            </tr>`
        })}
    `;
    
    const scrappedTemplate = () => html`
        <button class="gray-btn fs-5 mt-3 ms-3" @click=${() => page('/waiter')}>Назад</button>

        <table class="mt-3 table table-striped table-dark table-hover text-center">
            <thead>
                <tr>
                    <th scope="col">Дата</th>
                    <th scope="col">Час</th>
                    <th scope="col">Маса</th>
                    <th scope="col">Сметка</th>
                    <th scope="col">Служител</th>
                    <th scope="col">Артикули</th>
                    <th scope="col">Сума</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    `;

    render(scrappedTemplate(), container);
    
    // Render all scrapped products
    render(historiesRows(allPaidBills), document.querySelector('tbody'));
}