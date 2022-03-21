import page from 'page';
import $ from 'jquery';
import './css/global.css'
import { html, render } from 'lit/html.js';
import { getAllUsers, login, user } from './api';
import { waiterDashboardPage } from './views/waiter';
import { tableControlsPage } from './views/waiter/tableControls';
export const container = document.querySelector('body'); // where to render everything

page('/', checkIfUserLoggedIn);
page('/waiter', auth, waiterDashboardPage)
page('/waiter/table/:_id', auth, tableControlsPage)


page();

async function checkIfUserLoggedIn() {
    if (user) {
        if (user.role === 'admin') {
            // Load functions from admin page
            const { showAdminDashboard, createCategoryPage, deleteCategoryPage, editCategoryPage, sortCategoriesPage, createEmployeePage, deleteEmployeePage, editEmployeePage, addQtyProductPage, createProductPage, deleteProductPage, editProductPage, removeQtyProductPage, inventoryPage, sortProductsPage } = await import('./views/admin');

            // Add routes for admin pages
            page('/admin', auth, showAdminDashboard);
            page('/admin/inventory', auth, inventoryPage);
            page('/admin/product/removeQty', auth, removeQtyProductPage);
            page('/admin/product/addQty', auth, addQtyProductPage);
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

            // Redirect
            page('/admin');
        } else if (user.role === 'waiter') {
            page('/waiter');
        } else if (user.role === 'bartender') {
            page('/bartender');
        }
    } else {
        let selectedUser,
            pinCode = '';

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
        <button @click=${()=> render(usersTemplate(), container)} style="font-size: 3rem"
            class="btn btn-secondary mt-2 ms-2">Назад</button>
        
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

            // Add to pin code
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
            if (pinCode.length === 4) {
                let res = await login(selectedUser, pinCode);

                if (res === 'success')
                    page('/');
                else if (res.status === 500) {
                    // Server error
                    alert('Възникна грешка в сървъра!');
                    return console.error(res.data);
                } else if (res.status === 400) {
                    // Client error (wrong pin, false info, etc)
                    screenCode.addClass('wrong-pin');
                    return pinCode = ''; // Reset variable
                }
            }
        }

        render(usersTemplate(), container);
    }
}

export async function auth(ctx, next) {
    //AUTHENTICATE
    if ((ctx.path.includes('/admin') && user.role !== "admin")
        || (ctx.path.includes('/waiter') && user.role !== "waiter")
        || (ctx.path.includes('/bartender') && user.role !== "bartender")) {
        page('/'); // wrong permissions, go back to dashboard
    }
    next(); // else continue work
}