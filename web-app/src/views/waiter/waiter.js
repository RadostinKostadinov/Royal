import page from 'page';
import '../../css/waiter/waiter.css';
import { container } from "../../app";
import { auth } from "../api/api.js";
import { html, render } from 'lit/html.js';
import $ from "jquery";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { fixPrice, stopAllSockets, socket, logout, getTodaysReport, user } from '../api/api';
import { printerStatusClass, printBill, printReport } from '../api/printer';
import axios from 'axios';
import { billPages } from './bills';
import { consumptionPages } from './consumption';
import { tablePages } from './table/table';

let lastRenderedLocation = 'middle'; // remembers the last rendered location, so when the user clicks "Back", take them there

// FUNCTIONS

export async function getAddonsForCategory(_id) {
    return await axios.post('/getAddonsForCategory', {
        _id
    }).catch((err) => {
        return err.response;
    });
}

export async function addProductToBill(_id, selectedX, selectedBillId) {
    return await axios.post('/addProductToBill', {
        _id, // product _id
        selectedX, // 1,2,3,4,5 (how many qty of this product to add)
        selectedBillId, // bill _id
    }).catch((err) => {
        return err.response;
    });
}

export async function getBillById(_id) {
    return await axios.post('/getBillById', {
        _id,
    }).catch((err) => {
        return err.response;
    });
}

export async function removeOneFromBill(_id, billId) {
    return await axios.post('/removeOneFromBill', {
        _id, // product id
        billId
    }).catch((err) => {
        return err.response;
    });
}

export async function sellProducts(billToPay, discount) {
    return await axios.post('/sellProducts', {
        billToPay,
        discount
    }).catch((err) => {
        return err.response;
    });
}

export async function addProductsToHistory(addedProducts, selectedBillId) {
    return await axios.post('/addProductsToHistory', {
        addedProducts, // array of products {_id, selectedX (qty)}
        selectedBillId
    }).catch((err) => {
        return err.response;
    });
}

export async function getTables(location) {
    return await axios.post('/getTables', {
        location
    }).catch((err) => {
        return err.response;
    });
}

async function getTableTotalById(_id) {
    return await axios.post('/getTableTotalById', {
        _id
    }).catch((err) => {
        return err.response;
    });
}

export const productsInBill = (bill, btnFunc) => html`
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

export const productsTemplate = (products, btnFunc) => html`
    ${products.map((product) => html`<button @click=${btnFunc} _id=${product._id}>${product.name}</button>`)}
`;

// PAGES
async function waiterDashboardPage() {
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
            month = '0' + month;

        return `${day}.${month}.${date.getFullYear()}`
    }

    function getTime() {
        let hours = date.getHours();
        if (hours < 10)
            hours = '0' + hours;

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
                <tr class="table-secondary">
                    <td>Отстъпки</td>
                    <td>${(personalReport.discounts ? (personalReport.discounts) : '0.00') + ' лв.'}</td>
                    <td>${(combinedReport.discounts ? fixPrice(combinedReport.discounts) : '0.00') + ' лв.'}</td>
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
                    <div>Принтер <i id="printerStatusIcon" class="bi bi-circle-fill ${printerStatusClass}"></i></div>
                </div>
                <div class="d-flex flex-column align-items-center mt-5 mb-5 justify-content-between h-100 w-100 ps-2 pe-2">
                    <div id="changeTablesViewButtons" class="d-flex flex-column text-center gap-3 w-100">
                        <button class=${lastRenderedLocation === 'inside' ? 'active' : ''} id="insideTablesBtn" @click=${(clickedBtn) => renderTablesView(clickedBtn, 'inside')}>Вътре</button>
                        <button class=${lastRenderedLocation === 'middle' ? 'active' : ''} id="middleTablesBtn" @click=${(clickedBtn) => renderTablesView(clickedBtn, 'middle')}>Градина</button>
                    </div>
                    <div class="d-flex flex-column text-center gap-3 w-100">
                        <button @click=${() => page('/consumption/')}>Консум.</button>
                        <button id="reportButton" @click=${getTdsReport} data-bs-toggle="modal" data-bs-target="#reportModal">Брак</button>
                        <button @click=${logout}>Изход</button>
                    </div>
                </div>
            </div>
            
            <div id="topMenuAndGrid">
                <div id="topMenu">
                    <button @click=${() => page('/bartender')}>Поръчки</button>
                    ${user.role === 'admin' ? html`
                    <button @click=${() => page('/admin')}>АДМИН</button>` : ''}
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

export function waiterPages() {
    page('/waiter', auth, waiterDashboardPage);
    billPages();
    consumptionPages();
    tablePages();
}