import page from 'page';
import '../css/waiter/menu.css';
import '../css/waiter/tables/tables.css';
import '../css/waiter/tables/middleTables.css';
import '../css/waiter/tableControls.css';
import '../css/waiter/payPartOfBill.css';
import { container } from "../app";
import { html, render } from 'lit/html.js';
import $ from "jquery";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { getAddonsForCategory, getLastPaidBillByTableId, addProductToBill, generateBills, getAllCategories, getAllTables, getCategoryById, logout, getBillById, removeOneFromBill, sellProducts } from '../api';
const backBtn = html`<button @click=${()=> page('/waiter')} class="btn btn-secondary fs-3 mt-2 ms-2">Назад</button>`;

// Dashboard contains all the code for rendering the tables view (grid with tables)
export async function waiterDashboardPage() {
    // Get all tables from db
    const { middleTables, insideTables, outsideTables } = await getAllTables();
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

    const dashboardTemplate = (grid) => html`
        <div id="waiterDashboard" class="d-flex">
            <div id="waiterMenu" class="d-flex flex-column h-100">
                <div id="todayInfo" class="d-flex flex-column text-center gap-1 text-uppercase">
                    <div>
                        ${getDay()}
                    </div>
                    <div>${getDate()}</div>
                    <div>${getTime()}</div>
                </div>
                <div class="d-flex flex-column align-items-center mt-5 mb-5 justify-content-between h-100 w-100 ps-2 pe-2">
                    <div id="changeTablesViewButtons" class="d-flex flex-column text-center gap-3 w-100">
                        <button id="insideTablesBtn" @click=${(clickedBtn) => changeTablesView(clickedBtn, 'insideTables')}>Вътре</button>
                        <button class="active" id="middleTablesBtn" @click=${(clickedBtn) => changeTablesView(clickedBtn, 'middleTables')}>Градина</button>
                        <button id="outsideTablesBtn" @click=${(clickedBtn) => changeTablesView(clickedBtn, 'outsideTables')}>Навън</button>
                    </div>
                    <div class="d-flex flex-column text-center gap-3 w-100">
                        <button>Меню</button>
                        <button @click=${logout}>Изход</button>
                    </div>
                </div>
            </div>
            
            <div class="d-flex flex-column w-100">
                <div id="topMenu">
                    <button>Плащания</button>
                </div>
    
                ${grid}
            </div>
        </div>
    `;

    const gridTemplate = (gridId, elements) => html`
        <div id=${gridId} class="tablesGrid">
            ${elements.map((element) => {
                const taken = element.total > 0 ? 'taken' : '';
                const allClasses = `${element.type} ${element.type + element.number} ${taken}`;
                //element.type = [table, bar]
                //element.number = 1,2,3... || v1,v2,v3... || n1,n2,n3...
                //element.name = Маса 1, Маса В1, Маса Н1..
                //element.total = undefined (if != table) || number (ex. 12.50) (if == table)
                const btn = html`
                    <button @click=${(e)=> page(`/waiter/table/${$(e.target).attr('_id')}`)} class=${allClasses} _id=${element._id}>
                        <span class="name pe-none">${element.name}</span>
                        <span class="total pe-none">${element.total ? (element.total).toFixed(2) : ''}</span>
                    </button>`;
                return btn;
            })}
        </div>
    `;

    // This functions changes the table's view (shows the inside, outside or garden tables grid)
    function changeTablesView(clickedBtnEvent, viewName) {
        const clickedBtn = clickedBtnEvent.target;
        let viewToRender;

        // Remove active class from any button that has it
        $('#changeTablesViewButtons button.active').removeClass('active');

        if (viewName === 'outsideTables')
            viewToRender = outsideTables;
        else if (viewName === 'middleTables')
            viewToRender = middleTables;
        else if (viewName === 'insideTables')
            viewToRender = insideTables;
        
        // Add active class to clicked btn
        $(clickedBtn).addClass('active');

        render(dashboardTemplate(gridTemplate(viewName, viewToRender)), container);
    }

    // Render default view (dashboard + middle tables)
    render(dashboardTemplate(gridTemplate('middleTables', middleTables)), container);
}

export async function tableControlsPage(ctx) {
    const selectedTable = ctx.params.tableId; // Get selected (clicked) table _id

    if (selectedTable === null) return page('/');

    const categories = await getAllCategories(); // Get all categories to display

    let billData,
        selectedBillId, // by default the first one is selected, so its never undefined
        selectedX = 1, // can be 2,3... (number) or undefined (no X selected)
        selectedAddon;
    
    async function addToBill(e) {
        const _id = $(e.target).attr('_id');

        const res = await addProductToBill(_id, selectedX, selectedBillId, selectedAddon);

        if (res.status === 200) {
            const bill = res.data; // get bill and render all products inside it
            billData = bill;

            renderProductsInBill(bill);
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

        const res = await getCategoryById(_id);

        if (res.status === 200) {
            const category = res.data;
            
            render(productsTemplate(category.products), document.querySelector('#tableControls .products'))
        
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
        ${addons.map((addon) => html`<button @click=${selectAddon} _id=${addon._id}>${addon.name}</button>`)}
    `;

    function selectAddon(e) {
        const btn = $(e.target);
        const lastBtn = $('#tableControls .addons button.active');
        
        lastBtn.removeClass('active');

        if (btn.text() !== lastBtn.text()) {
            btn.addClass('active');
            selectedAddon = btn.attr('_id');
        }
        else selectedAddon = undefined;
    }

    async function changeSelectedBill(e) {
        const selectedBillEl = $(e.target);
        selectedBillId = selectedBillEl.attr('_id'); // set new bill as selected

        // find and remove "active" from old bill
        $('#tableControls .bills button.active').removeClass('active');

        // add active class to new bill
        selectedBillEl.addClass('active');

        renderProductsInBill();
        getLastPaidOnBill();
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
        const numberOfBills = 6; // How many bills to generate inside table
        const res = await generateBills(selectedTable, numberOfBills);

        if (res.status === 201 || res.status === 200) {
            // 201 == created, 200 == already created (no problem)
            const bills = res.data;
            selectedBillId = bills[0]; // set first bill as selected automatically
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
            return render(productsInBill(bill), document.querySelector('#tableControls .addedProducts'));

        // else we changedSelectedBill and dont have anything
        const _id = selectedBillId;

        // Get products in bill
        const res = await getBillById(_id);

        if (res.status === 200) {
            billData = res.data;
            
            render(productsInBill(billData), document.querySelector('#tableControls .addedProducts'));
        } else {
            console.error(res);
            alert('Възникна грешка!');
        }
    }

    async function rmvOneFromBill(_id) {
        // Remove 1 qty of this product from this bill

        const res = await removeOneFromBill(_id, selectedBillId);
        
        if (res.status === 200) {
            const bill = res.data;
            renderProductsInBill(bill);
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

    async function payWholeBill() {
        console.log(billData.products);
        if (billData.products.length === 0) return;

        const res = await sellProducts(billData);

        if (res.status === 200) {
            page(`/waiter`);
        } else {
            console.error(res);
            alert('Възникна грешка!');
        }
        
    } 

    const productsInBill = (bill) => html`
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
                        <td @click=${() => rmvOneFromBill(product.product._id)} width="7%" class="remove bi bi-x-circle text-danger cursor-pointer"></td>
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

    const productsTemplate = (products) => html`
        ${products.map((product) => html`<button @click=${addToBill} _id=${product._id}>${product.name}</button>`)}
    `;

    // i==0 (if first bill, mark it as "active")
    const billsTemplate = (bills) => html`
        ${bills.map((_id, i) => html`<button @click=${changeSelectedBill} class=${i === 0 ? 'active' : ''} _id=${_id}>${i+1}</button>`) }
    `;

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
                    <button>Брак</button>
                    <button @click=${() => page(`${ctx.path}/bill/${selectedBillId}`)}>Извади</button>
                    <button>Приключи с принт</button>
                    <button @click=${payWholeBill}>Приключи</button>
                    <button @click=${() => page('/waiter')}>Назад</button>
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

export async function payPartOfBillPage(ctx) {
    const selectedTable = ctx.params.tableId;
    let bill = (await getBillById(ctx.params.billId)).data;
    let productsToPay = {
        _id: bill._id, // bill id
        number: bill.number, // bill number
        table: bill.table, // table id
        products: [],
        total: 0,
    };

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

        // Rerender both bill and toPay
        render(productsInBillTemplate(bill), document.getElementById('productsInBill'));
        render(productsToPayTemplate(productsToPay), document.getElementById('productsToPay'));
        render(html`${bill.total.toFixed(2)}`, document.querySelector('#totalOnTable .price'))
        render(html`${productsToPay.total.toFixed(2)}`, document.querySelector('#totalToPay .price'))
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

        // Rerender both bill and toPay
        render(productsInBillTemplate(bill), document.getElementById('productsInBill'));
        render(productsToPayTemplate(productsToPay), document.getElementById('productsToPay'));
        render(html`${bill.total.toFixed(2)}`, document.querySelector('#totalOnTable .price'))
        render(html`${productsToPay.total.toFixed(2)}`, document.querySelector('#totalToPay .price'))
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
                        <td @click=${() => returnToBill(index, product)} width="20%" class="text-uppercase back">Върни</td>
                    </tr>`
                })}
            </tbody>
        </table>
    `;

    async function sellPrdcts() {
        if (productsToPay.length === 0) return;

        const res = await sellProducts(productsToPay);

        if (res.status === 200) {
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
                        <button>Извади с принт</button>
                        <button @click=${sellPrdcts}>Извади</button>
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
    render(html`${(productsToPay.total).toFixed(2)}`, document.querySelector('#totalToPay .price'))
}

// TODO
/* 
Бутона ПЛАЩАНИЯ в topMenu - да излиза екран с всички плащания подредени по час, за всяка маса и сметка
Бутона ПРИКЛЮЧИ - в момента съм го направил да приключва ПОДМАСА, а не цялата МАСА!
*/