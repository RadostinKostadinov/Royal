import page from 'page';
import axios from "axios";
import { html, render } from "lit";
import { container } from "../../app";
import { getAllCategories } from "../admin/category";
import { getProductsFromCategory } from "../admin/product";
import { auth, socket, stopAllSockets } from "../api/api";
import { addProductToBill, addProductsToHistory, getAddonsForCategory, getBillById, productsInBill, productsTemplate, removeOneFromBill } from "./waiter";
import $ from 'jquery';

// FUNCTIONS

async function generatePersonalBill() {
    return await axios.get('/generatePersonalBill').catch((err) => {
        return err.response;
    });
}

// PAGES

export async function consumptionPage() {
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

export function consumptionPages() {
    page('/consumption', auth, consumptionPage);
}