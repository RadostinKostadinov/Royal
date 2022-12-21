import page from 'page';
import $ from 'jquery';
// import './bootstrap/bootstrap.min.css';
import './bootstrap/bootstrap.dark.min.css';
import './bootstrap/bootstrap.bundle.min.js';
import './css/global.css';
import { html, render } from 'lit/html.js';
import { checkSitePass, getAllUsers, login, user } from './api';
import { showAdminDashboard, createCategoryPage, deleteCategoryPage, editCategoryPage, sortCategoriesPage, createEmployeePage, deleteEmployeePage, editEmployeePage, scrapRestockProductPage, createProductPage, deleteProductPage, editProductPage, removeQtyProductPage, inventoryPage, sortProductsPage, scrappedPage, expireProductsPage, reportsPage, soldProductsPage, restockHistoryPage, consumationHistoryPage, revisionsPage, createRevisionPage } from './views/admin';
import { consumationPage, moveProductsPage, payPartOfBillPage, scrapProductsPage, showPaidBillsPage, tableControlsPage, waiterDashboardPage } from './views/waiter.js';
import { bartenderDashboardPage } from './views/bartender';

export const container = document.querySelector('body'); // where to render everything

// Bartender pages
page('/bartender', auth, bartenderDashboardPage);

// Waiter pages
page('/waiter', auth, waiterDashboardPage);
page('/consumation', auth, consumationPage);
page('/waiter/showPaidBills', auth, showPaidBillsPage);
page('/waiter/table/:tableId', auth, tableControlsPage);
page('/waiter/table/:tableId/bill/:billId/pay', auth, payPartOfBillPage);
page('/waiter/table/:tableId/bill/:billId/scrap', auth, scrapProductsPage);
page('/waiter/table/:tableId/bill/:billId/move', auth, moveProductsPage);

// Admin pages
page('/admin', auth, showAdminDashboard);
page('/admin/consumationHistory', auth, consumationHistoryPage);
page('/admin/restockHistory', auth, restockHistoryPage);
page('/admin/products/sold', auth, soldProductsPage);
page('/admin/reports', auth, reportsPage);
page('/admin/expireProducts', auth, expireProductsPage);
page('/admin/revisions', auth, revisionsPage);
page('/admin/createRevision', auth, createRevisionPage);
page('/admin/inventory', auth, inventoryPage);
page('/admin/inventory/scrapped', auth, scrappedPage);
page('/admin/product/scrap', auth, scrapRestockProductPage);
page('/admin/product/restock', auth, scrapRestockProductPage);
page('/admin/product/create', auth, createProductPage);
page('/admin/product/delete', auth, deleteProductPage);
page('/admin/product/edit', auth, editProductPage);
page('/admin/product/reorder', auth, sortProductsPage);
page('/admin/category/create', auth, createCategoryPage);
page('/admin/category/delete', auth, deleteCategoryPage);
page('/admin/category/edit', auth, editCategoryPage);
page('/admin/category/reorder', auth, sortCategoriesPage);
page('/admin/employee/create', auth, createEmployeePage);
page('/admin/employee/delete', auth, deleteEmployeePage);
page('/admin/employee/edit', auth, editEmployeePage);
page('/', checkIfUserLoggedIn);

// Everything else, redirect to home page
page('*', () => page('/'));
page();

let selectedUser,
    pinCode = '';
async function checkIfUserLoggedIn() {
    if (user)
        page.redirect(`/${user.role}`);
    else {
        // Get all employees
        let users = await getAllUsers();

        // Show login
        const usersTemplate = () => html`
            <div style="height: 100vh"
                class="d-flex flex-row flex-wrap gap-4 align-items-center align-content-center justify-content-evenly">
                ${users.map((user) => html`<button @click=${setSelectedUser} class="text-capitalize btn p-4 btn-primary fs-1"
                    userId=${user._id}>${user.name}</button>`)}
            </div>
        `;

        const numpadTemplate = () => html`
        <button @click=${() => render(usersTemplate(), container)}
            class="btn btn-secondary fs-1 mt-3 ms-3">Назад</button>
        
        <div id="numpad-wrapper">
            <div id="code">
                ++++
            </div>
            <div id="numpad">
                <button @click=${checkPinCode} class="btn btn-primary">1</button>
                <button @click=${checkPinCode} class="btn btn-primary">2</button>
                <button @click=${checkPinCode} class="btn btn-primary">3</button>
                <button @click=${checkPinCode} class="btn btn-primary">4</button>
                <button @click=${checkPinCode} class="btn btn-primary">5</button>
                <button @click=${checkPinCode} class="btn btn-primary">6</button>
                <button @click=${checkPinCode} class="btn btn-primary">7</button>
                <button @click=${checkPinCode} class="btn btn-primary">8</button>
                <button @click=${checkPinCode} class="btn btn-primary">9</button>
                <button @click=${checkPinCode} class="btn btn-danger">X</button>
                <button @click=${checkPinCode} class="btn btn-primary">0</button>
            </div>
        </div>
            `;

        function setSelectedUser(e) {
            selectedUser = $(e.target).attr('userId');

            pinCode = '';
            render(numpadTemplate(), container)
        }

        async function checkPinCode(e) {
            let screenCode = $('#code');
            let enteredNumber = $(e.target).text();

            if (enteredNumber === 'X')
                pinCode = pinCode.slice(0, -1);
            else
                pinCode += enteredNumber;

            // Show the entered PIN and add + to the end (until 4 numbers in total)
            // ex. if entered 1, show 1+++
            // if entered 15, show 15++
            let addPluses = pinCode;
            while (addPluses.length < 4)
                addPluses += '+';
            screenCode.text(addPluses);
            screenCode.removeClass('wrong-pin')

            // Check if user entered 4 numbers
            if (pinCode.length === 4)
                tryLogin(screenCode);
        }

        render(usersTemplate(), container);
    }
}

async function tryLogin(screenCode) {
    let res = await login(selectedUser, pinCode);

    if (res === 'success')
        return page('/');

    if (res.status === 500) {
        // Server error
        alert('Възникна грешка в сървъра!');
        return console.error(res.data);
    }

    if (res.status === 400) {
        // Client error (wrong pin, false info, etc)
        screenCode.addClass('wrong-pin');
        screenCode.text('++++');
        return pinCode = ''; // Reset variable
    }

    if (res.status === 403)
        return alert(res.data);

    if (res.status === 401) {
        // Ask user to enter password in alert
        const pass = prompt('Въведи парола за сайта:');
        const res2 = await checkSitePass(pass);

        if (res2.status === 200)
            tryLogin();
        else {
            alert('Грешна парола!');
            return page('/');
        }
    }
}

async function auth(ctx, next) {
    if (!user || (ctx.path.includes('/admin') && user.role !== "admin"))
        page('/'); // wrong permissions, go back go dashboard

    next(); // else continue work
}

// If theres no activity for X minutes, show screensaver
const screensaverTime = 30 * 60 * 1000; // 30 minutes
const blackscreenTime = 60 * 60 * 1000; // 60 minutes
var screensaverTimeout = setTimeout(inActive, screensaverTime);
var blackscreenTimeout = setTimeout(showBlackScreen, blackscreenTime);

function resetActive() {
    // Hide screensaver
    $('#screensaver').hide();
    $('#blackscreen').hide();

    clearTimeout(screensaverTimeout);
    clearTimeout(blackscreenTimeout);

    screensaverTimeout = setTimeout(inActive, screensaverTime);
    blackscreenTimeout = setTimeout(showBlackScreen, blackscreenTime);
}

function inActive() {
    // Check if on bartender screen
    if (!$('#bartenderDashboard').length)
        $('#screensaver').show(); // Show screensaver
}

function showBlackScreen() {
    // Check if on bartender screen
    if (!$('#bartenderDashboard').length)
        $('#blackscreen').show(); // Show black screen
}

$(document).bind('click', resetActive);
$(document).bind('touch', resetActive);