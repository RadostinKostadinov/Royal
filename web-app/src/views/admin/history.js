import { backBtn } from "./admin.js";
import { container } from "../../app.js";
import page from 'page';
import $ from 'jquery';
import { html, render } from 'lit/html.js';
import axios from 'axios';
import { getAllIngredients, getAllProducts, getAllProductsWithoutIngredients, selectProductFromSearch } from "./product.js";
import { fixPrice, auth } from "../api/api.js";

// FUNCTIONS
let selectedProductFromSearch;

async function getProductSells(fromDate, toDate, _id) {
    return await axios.post('/getProductSells', {
        fromDate,
        toDate,
        _id
    }).catch((err) => {
        return err.response;
    });
}

async function getAllConsumptions(fromDate, toDate, user) {
    return await axios.post('/getAllConsumptions', {
        fromDate,
        toDate,
        user
    }).catch((err) => {
        return err.response;
    });
}

async function getRestockHistory(fromDate, toDate, _id, type) {
    return await axios.post('/getRestockHistory', {
        fromDate,
        toDate,
        _id,
        type
    }).catch((err) => {
        return err.response;
    });
}

async function saveRevision(revision) {
    return await axios.post('/saveRevision', {
        revision
    }).catch((err) => {
        return err.response;
    });
}

async function getAllReports(fromDate, toDate) {
    return await axios.post('/getAllReports', {
        fromDate,
        toDate
    }).catch((err) => {
        return err.response;
    });
}

// PAGES

async function reportsPage() {
    let total = 0,
        income = 0,
        scrapped = 0,
        consumed = 0,
        discounts = 0;

    const reportTemplate = (report, dateString, timeString) => html`
        <tr>
            <td scope="row">${dateString}</td>
            <td scope="row">${timeString}</td>
            <td scope="row" class="text-capitalize">${report.user.name}</td>
            <td scope="row">${fixPrice(report.income)}</td>
            <td scope="row">${fixPrice(report.scrapped)}</td>
            <td scope="row">${fixPrice(report.consumed)}</td>
            <td scope="row">${report.discounts ? fixPrice(report.discounts) : '0.00'}</td>
            <td scope="row">${fixPrice(report.total)}</td>
        </tr>
    `;

    const reportsRows = (date) => html`
        ${Object.values(date).map((dailyReports) => {
        let combinedDailyReports = [];
        let todayTotal = 0,
            todayIncome = 0,
            todayScrapped = 0,
            todayDiscounts = 0,
            todayConsumed = 0;


        for (let report of dailyReports) {
            const date = new Date(report.when);
            const dateString = `${date.getDate() > 9 ? date.getDate() : '0' + date.getDate()}.${(date.getMonth() + 1) > 9 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)}.${date.getFullYear()}`;
            const timeString = `${date.getHours() > 9 ? date.getHours() : '0' + date.getHours()}:${date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes()}`;

            todayIncome += report.income;
            todayConsumed += report.consumed;
            todayScrapped += report.scrapped;
            todayDiscounts += report.discounts;
            todayTotal += report.income - report.consumed - report.scrapped;

            combinedDailyReports.push(reportTemplate(report, dateString, timeString));
        }

        // Add the total for the day row
        combinedDailyReports.push(html`
                <tr style="border-bottom: 3px solid white" class="table-primary fw-bold">
                    <td scope="row" colspan="3">Общо:</td>
                    <td scope="row">${fixPrice(todayIncome)}</td>
                    <td scope="row">${fixPrice(todayScrapped)}</td>
                    <td scope="row">${fixPrice(todayConsumed)}</td>
                    <td scope="row">${fixPrice(todayDiscounts)}</td>
                    <td scope="row">${fixPrice(todayTotal)}</td>
                </tr>
            `);

        total += todayTotal;
        income += todayIncome;
        consumed += todayConsumed;
        discounts += todayDiscounts;
        scrapped += todayScrapped;

        return combinedDailyReports;
    })
        }
`;

    const totalRowsH = () => html`
        <tr class="table-success">
            <td>Приход</td>
            <td>${fixPrice(income)}</td>
        </tr>
        <tr class="table-danger">
            <td>Брак</td>
            <td>${fixPrice(scrapped)}</td>
        </tr>
        <tr class="table-secondary">
            <td>Консумация</td>
            <td>${fixPrice(consumed)}</td>
        </tr>
        <tr class="table-secondary">
            <td>Отстъпки</td>
            <td>${fixPrice(discounts)}</td>
        </tr>
        <tr class="table-primary">
            <td>Общ приход</td>
            <td>${fixPrice(total)}</td>
        </tr>
`;

    const reportsTemplate = () => html`
        ${backBtn}

        <div class="d-flex w-100 gap-3 p-3 fs-4">
            <div class="w-50">
                <label for="fromDate" class="form-label">От</label>
                <input @change=${loadReports} name="fromDate" class="form-control fs-4" id="fromDate" type="date"/>
            </div>
    
            <div class="w-50">
                <label for="toDate" class="form-label">До</label>
                <input @change=${loadReports} name="toDate" class="form-control fs-4" id="toDate" type="date"/>
            </div>
        </div>

        <table id="totalAll" class="fw-bold mt-4 table fs-b table-dark text-center">
            <thead>
                <tr>
                    <th scope="col" colspan="2">Общо за избран период</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>

        <table id="selectedReports" class="mt-4 table table-striped table-dark table-hover text-center">
            <thead>
                <tr>
                    <th scope="col">Дата</th>
                    <th scope="col">Час</th>
                    <th scope="col">Служител</th>
                    <th scope="col">Продажби</th>
                    <th scope="col">Брак</th>
                    <th scope="col">Консумация</th>
                    <th scope="col">Отстъпки</th>
                    <th scope="col">Общ приход<br></th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
`;

    async function loadReports() {
        total = 0;
        income = 0;
        scrapped = 0;
        consumed = 0;

        const fromDate = $('#fromDate').val();
        const toDate = $('#toDate').val();

        const res = await getAllReports(fromDate, toDate);

        if (res.status === 200) {
            const reports = res.data;

            // Split reports by date
            let splitReports = {};
            for (let report of reports) {
                // Get date for report
                let date = new Date(report.when);

                // Check if time is between 00:00 and 04:00 hours (if from last night shift)
                if (date.getHours() >= 0 && date.getHours() < 4) {
                    // If true, show it in yesterday row group (set date as -1 day)
                    date.setDate(date.getDate() - 1);
                }

                // Convert to DD-MM-YYYY
                date = `${date.getDate()} -${date.getMonth() + 1} -${date.getFullYear()} `;

                // Check if date already created in splitReports
                if (!splitReports.hasOwnProperty(date)) {
                    splitReports[date] = [];
                }

                // Add report to splitReports
                splitReports[date].push(report);
            }

            // Render reports
            render(reportsRows(splitReports), document.querySelector('#selectedReports tbody'));
            render(totalRowsH(), document.querySelector('#totalAll tbody'));
        } else {
            console.error(res);
            alert('Възникна грешка');
        }
    }

    render(reportsTemplate(), container);
    loadReports();
}

async function consumptionHistoryPage() {
    let res = await axios.get('/getAllUsers');
    const users = res.data;

    let usersTotal = {};

    const rowsTemplate = (consumptions) => html`
        ${consumptions.map(consumption => {
        const date = new Date(consumption.when);
        const dateString = `${date.getDate() > 9 ? date.getDate() : '0' + date.getDate()}.${(date.getMonth() + 1) > 9 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)}.${date.getFullYear()}`;

        consumption.totalUpsell = 0;
        consumption.total = 0;
        for (let product of consumption.products) {
            consumption.totalUpsell += product.buyPrice * product.qty;
            consumption.total += product.sellPrice * product.qty;

        }

        if (usersTotal[consumption.user.name]) {
            usersTotal[consumption.user.name].total += consumption.total;
            usersTotal[consumption.user.name].totalUpsell += consumption.totalUpsell;
        } else {
            usersTotal[consumption.user.name] = {}
            usersTotal[consumption.user.name].total = consumption.total;
            usersTotal[consumption.user.name].totalUpsell = consumption.totalUpsell;
        }

        return html`
                <tr>
                    <td>${dateString}</td>
                    <td class="text-capitalize">${consumption.user.name}</td>
                    <td>
                        ${Object.values(consumption.products).map(product => {
            return html`${product.name} x ${product.qty} бр.<br>`
        })}
                    </td>
                    <td>${fixPrice(consumption.totalUpsell)}</td>
                    <td>${fixPrice(consumption.total)}</td>
                </tr>
            `
    })
        }
`;

    const allTotals = () => html`
        ${Object.entries(usersTotal).map(user => html`
            <tr>
                <td class="text-capitalize">${user[0]}</td>
                <td>${fixPrice(user[1].totalUpsell)}</td>
                <td>${fixPrice(user[1].total)}</td>
            </tr>
        `)
        }
`;

    async function loadConsumption() {
        usersTotal = {};
        const fromDate = $('#fromDate').val();
        const toDate = $('#toDate').val();
        const user = $('#user').val();

        const res = await getAllConsumptions(fromDate, toDate, user);

        if (res.status === 200) {
            const consumptions = res.data;

            // Render consumption
            render(rowsTemplate(consumptions), document.querySelector('#selectedconsumptions tbody'));
            render(allTotals(), document.querySelector('#totalAll tbody'));
        } else {
            console.error(res);
            alert('Възникна грешка');
        }
    }

    const consumptionTemplate = () => html`
        ${backBtn}
        
        <div class="d-flex w-100 gap-3 p-3 fs-4 mb-3">
            <div class="w-50">
                <label for="fromDate" class="form-label">От</label>
                <input @change=${loadConsumption} name="fromDate" class="form-control fs-4" id="fromDate" type="date" />
            </div>
        
            <div class="w-50">
                <label for="toDate" class="form-label">До</label>
                <input @change=${loadConsumption} name="toDate" class="form-control fs-4" id="toDate" type="date" />
            </div>
        </div>

        <div class="p-3 fs-4 mb-3">
            <label for="user" class="form-label">Служител</label>
            <select @change=${loadConsumption} class="form-control fs-4 text-capitalize" name="user" id="user">
                <option value="" selected>Всички</option>
                ${users.map(user => html`
                    <option value="${user._id}">${user.name}</option>
                `)}
            </select>
        </div>

        <table id="totalAll" class="mt-4 table fs-b table-dark text-center">
            <thead>
                <tr class="fw-bold">
                    <th scope="col" colspan="3">Общо за избран период</th>
                </tr>
                <tr class="fw-bold">
                    <th scope="col">Служител</th>
                    <th scope="col">Доставна</th>
                    <th scope="col">Продажна</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>

        <table id="selectedconsumptions" class="mt-4 table table-striped table-dark table-hover text-center">
            <thead>
                <tr>
                    <th scope="col">Дата</th>
                    <th scope="col">Служител</th>
                    <th scope="col">Консумация</th>
                    <th scope="col">Общо доставна</th>
                    <th scope="col">Общо продажна</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
`;

    render(consumptionTemplate(), container);
    loadConsumption();
}

async function restockHistoryPage() {
    const ingredients = await getAllIngredients();
    const products = await getAllProductsWithoutIngredients();
    let total = 0, totalQty = 0, totalUnit; // Used for displaying totals ONLY when a specific product is searched

    async function search(e) {
        // If selected  (else called in render at first load of page)
        if (e)
            selectedProductFromSearch = selectProductFromSearch(e);

        const fromDate = $('#fromDate').val();
        const toDate = $('#toDate').val();

        const res = await getRestockHistory(fromDate, toDate, selectedProductFromSearch && selectedProductFromSearch._id, selectedProductFromSearch && selectedProductFromSearch.type);

        if (res.status === 200) {
            total = 0;
            totalQty = 0;
            const restocks = res.data;

            render(rows(restocks, selectedProductFromSearch), document.querySelector('table tbody'));
            render(`${fixPrice(total)} лв.`, document.querySelector('table #total'))
            if (selectedProductFromSearch)
                render(`${totalQty} ${totalUnit}.`, document.querySelector('table #totalQty'))
        } else {
            console.error(res);
            alert('Възникна грешка!');
        }
    }

    const rows = (restocks, selectedProduct) => html`
        ${restocks.map((restock) => {
        const date = new Date(restock.when);
        const dateString = `${date.getDate() > 9 ? date.getDate() : '0' + date.getDate()}.${(date.getMonth() + 1) > 9 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)}.${date.getFullYear()}`;
        const timeString = `${date.getHours() > 9 ? date.getHours() : '0' + date.getHours()}:${date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes()}`;
        let unit = 'бр';

        if (['кг', 'л'].includes(restock.product.unit)) {
            unit = restock.product.unit;
            restock.product.qty /= 1000;
        }

        total += restock.product.buyPrice * restock.product.qty;

        // If product is searched for, then it means it has the same unit type, so add up to show the total qty
        if (selectedProduct) {
            totalUnit = unit;
            totalQty += restock.product.qty;
        }

        return html`
            <tr>
                <td>${dateString}</td>
                <td>${timeString}</td>
                <td>${restock.product.name}</td>
                <td>${restock.product.qty} ${unit}.</td>
                <td>${fixPrice(restock.product.buyPrice)} лв.</td>
                <td>${fixPrice(restock.product.buyPrice * restock.product.qty)} лв.</td>
            </tr>`
    })
        }
`;

    const restockTemplate = () => html`
        ${backBtn}

        <div class="d-flex w-100 gap-3 p-3 fs-4">
            <div class="w-50">
                <label for="fromDate" class="form-label">От</label>
                <input @change=${search} name="fromDate" class="form-control fs-4" id="fromDate" type="date"/>
            </div>
    
            <div class="w-50">
                <label for="toDate" class="form-label">До</label>
                <input @change=${search} name="toDate" class="form-control fs-4" id="toDate" type="date"/>
            </div>
        </div>

        <div class="mb-3 p-3 fs-4">
                <label for="productSearch" class="form-label">Търси</label>
                <input @change=${search} class="form-control fs-4" type="text" list="allproducts" name="productSearch" id="productSearch">
                <datalist id="allproducts">
                    ${ingredients.map(el => {
        return html`<option type="ingredients" unit=${el.unit} _id=${el._id} value=${el.name + ` (${el.unit})`} />`
    })}
                    ${products.map(el => {
        return html`<option type="product" _id=${el._id} value=${el.name}/>`
    })}
                </datalist>
        </div>

        <table class="mt-3 table table-striped table-dark table-hover text-center">
            <thead>
                <tr id="totals" class="table-primary fw-bold">
                    <th scope="col" colspan="3">Общо</th>
                    <th scope="col" id="totalQty"></th>
                    <th scope="col"></th>
                    <th scope="col" id="total"></th>
                </tr>
                <tr>
                    <th scope="col">Дата</th>
                    <th scope="col">Час</th>
                    <th scope="col">Продукт</th>
                    <th scope="col">Количество</th>
                    <th scope="col">Доставна цена</th>
                    <th scope="col">Общо</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
`;

    render(restockTemplate(), container);
    search();
}

async function productSellsPage() {
    const products = await getAllProducts();
    let totals = {
        qty: 0,
        price: 0
    }

    async function loadSells(e) {
        totals.qty = 0;
        totals.price = 0;

        selectedProductFromSearch = selectProductFromSearch(e);

        if (!selectedProductFromSearch) // After picking date this func activates, so check if product is selected
            return;

        const fromDate = $('#fromDate').val();
        const toDate = $('#toDate').val();

        const res = await getProductSells(fromDate, toDate, selectedProductFromSearch._id);

        if (res.status === 200) {
            const sells = res.data;

            render(sellsRows(sells), document.querySelector('table tbody'));
            render(sellTotal(), document.querySelector('table tfoot'));
        } else {
            console.error(res);
            alert('Възникна грешка!');
        }
    }

    const sellTotal = () => html`
    ${totals.qty > 0
            ? html`
        <tr class="table-primary">
            <td colspan="2"></td>
            <td>Общо:</td>
            <td>${totals.qty} бр.</td>
            <td>${fixPrice(totals.price)}</td>
        </tr>`
            : ''
        } `;

    const sellsRows = (sells) => html`
        ${sells.map((sell) => {
        const date = new Date(sell.when);
        const dateString = `${date.getDate() > 9 ? date.getDate() : '0' + date.getDate()}.${(date.getMonth() + 1) > 9 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)}.${date.getFullYear()}`;
        const timeString = `${date.getHours() > 9 ? date.getHours() : '0' + date.getHours()}:${date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes()}`;

        totals.qty += sell.qty;
        totals.price += sell.total;

        return html`
            <tr>
                <td>${dateString}</td>
                <td>${timeString}</td>
                <td>${fixPrice(sell.sellPrice)}</td>
                <td>${sell.qty} бр.</td>
                <td>${fixPrice(sell.total)}</td>
            </tr>`
    })
        }
`;

    const soldTemplate = () => html`
        ${backBtn}

        <div class="d-flex w-100 gap-3 p-3 fs-4">
            <div class="w-50">
                <label for="fromDate" class="form-label">От</label>
                <input @change=${loadSells} name="fromDate" class="form-control fs-4" id="fromDate" type="date"/>
            </div>
    
            <div class="w-50">
                <label for="toDate" class="form-label">До</label>
                <input @change=${loadSells} name="toDate" class="form-control fs-4" id="toDate" type="date"/>
            </div>
        </div>

        <div class="mb-3 p-3 fs-4">
                <label for="productSearch" class="form-label">Търси</label>
                <input @change=${loadSells} class="form-control fs-4" type="text" list="allproducts" name="productSearch" id="productSearch">
                <datalist id="allproducts">
                    ${products.map(el => {
        return html`<option type="product" _id=${el._id} value=${el.name}/>`
    })}
                </datalist>
        </div>

        <table class="mt-3 table table-striped table-dark table-hover text-center">
            <thead>
                <tr>
                    <th scope="col">Дата</th>
                    <th scope="col">Час</th>
                    <th scope="col">Цена</th>
                    <th scope="col">Количество</th>
                    <th scope="col">Сума</th>
                </tr>
            </thead>
            <tbody class="d-table-footer-group"></tbody>
            <tfoot class="fw-bold d-table-footer-group"></tfoot>
        </table>
`;

    render(soldTemplate(), container);
}

async function revisionsPage() {
    const res = await axios.get('/getAllRevisions');
    const allRevisions = res.data;

    // Convert allRevisions to when property to dd.mm.yyyy (HH:MM)
    allRevisions.forEach((revision) => {
        revision.when = new Date(revision.when).toLocaleString('bg-BG');
    });

    function selectedRevision(e) {
        const index = e.target.value;
        // Create a modifiable copy of allRevisions[index] that wont effect the original variable
        const revision = JSON.parse(JSON.stringify(allRevisions[index]));

        render(productRows(revision.products), document.querySelector('tbody'));
    }

    const productRows = (products) => html`
        ${products.map((product) => {
        let unit = 'бр',
            difference = 0,
            cellClass = '';

        if (product.type === 'ingredient') {
            if (product.unit === 'кг' || product.unit === 'л') {
                unit = product.unit;

                product.oldQty /= 1000;

                if (product.hasOwnProperty('newQty')) {
                    product.newQty /= 1000;
                } else {
                    product.newQty = product.oldQty;
                }
            } else {
                if (!product.hasOwnProperty('newQty'))
                    product.newQty = product.oldQty;
            }
        } else if (!product.hasOwnProperty('newQty')) // If product and no new qty
            product.newQty = product.oldQty;


        difference = +(product.newQty - product.oldQty).toFixed(2);

        if (difference > 0) {
            difference = `+${difference}`;
            cellClass = 'table-success';
        } else if (difference < 0)
            cellClass = 'table-danger';

        product.oldQty += ` ${unit}.`
        product.newQty += ` ${unit}.`
        difference += ` ${unit}.`
        return html`
                <tr class=${cellClass}>
                    <td scope="row">${product.name}</td>
                    <td>${product.oldQty}</td>
                    <td>${product.newQty}</td>
                    <td>${difference}</td>
                </tr>
            `
    })
        }
`;

    const revisionTemplate = () => html`
    <div class="d-flex justify-content-between p-2">
        ${backBtn}
<a href='/admin/history/revision/create' class="btn btn-primary mt-2 fs-3">Нова ревизия</a>
        </div>

    <select @change=${selectedRevision} class="form-control mt-2fs-4">
        <option selected disabled>Избери</option>
            ${allRevisions.map((revision, i) => html`<option value=${i}>${revision.when}</option>`)}
        </select>

    <table class="table table-striped table-dark table-hover text-center mt-2">
        <thead>
            <tr>
                <th scope="col">Артикул</th>
                <th scope="col">Старо</th>
                <th scope="col">Ново</th>
                <th scope="col">Разлика</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    </table>
`;

    render(revisionTemplate(), container);
}

async function createRevisionPage() {
    const products = await getAllProductsWithoutIngredients();
    const ingredients = await getAllIngredients();
    const productsAndIngredients = ingredients.concat(products);

    async function svRevision(e) {
        e.preventDefault();

        // Get all id and value of all input fields 
        const formData = new FormData(e.target);
        const data = [...formData.entries()];
        const revision = data.map(([_id, qty]) => ({ _id, qty }));

        let res;

        res = await saveRevision(revision);

        console.log(res.data);

        if (res.status === 200) {// Successfully created revision
            alert(res.data);
            page('/');
        } else if (res.status === 400) {
            alert(res.data);
        } else {
            alert('Възникна грешка!');
            console.error(res);
        }
    }

    const productRows = (productsAndIngredients) => html`
        ${productsAndIngredients.map((product) => {
        let qty = product.qty,
            name = product.name,
            unit = 'бр';

        if (product.hasOwnProperty('unit') && (product.unit === 'кг' || product.unit === 'л')) {
            qty /= 1000;
            unit = product.unit;
        }

        qty += ` ${unit}.`
        return html`
                <tr>
                    <td scope="row">${name}</td>
                    <td>${qty}</td>
                    <td><input type="number" min=0 step=${product.hasOwnProperty('unit') && (product.unit === 'кг' || product.unit === 'л') ? 0.000005 : ''} class="form-control fs-4" name=${product._id}></td>
                </tr>
            `
    })
        }
`;

    const createRevisionTemplate = () => html`
        ${backBtn}
        <form autocomplete="off" class="d-flex flex-column align-items-center" @submit=${svRevision}>
            <table class="table table-striped table-dark table-hover text-center mt-2">
                <thead>
                    <tr>
                        <th scope="col">Артикул</th>
                        <th scope="col">Старо</th>
                        <th scope="col">Ново</th>
                    </tr>
                </thead>
                <tbody>
                        ${productRows(productsAndIngredients)}
                </tbody>
            </table>
            <input class="btn w-auto btn-primary fs-3 mt-2 mb-2 ms-2" type="submit" value="Запази" />
        </form>
    `;

    render(createRevisionTemplate(), container);
}

export function historyPages() {
    page('/admin/history/reports', auth, reportsPage);
    page('/admin/history/consumption', auth, consumptionHistoryPage);
    page('/admin/history/restock', auth, restockHistoryPage);
    page('/admin/history/product_sells', auth, productSellsPage);
    page('/admin/history/revision', auth, revisionsPage);
    page('/admin/history/revision/create', auth, createRevisionPage);
}