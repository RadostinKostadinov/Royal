import { backBtn } from "./admin.js";
import { container } from "../../app.js";
import page from 'page';
import { html, render } from 'lit/html.js';
import { getAllCategories } from "./category.js";
import { getAllIngredients, getAllProductsWithoutIngredients, selectProductFromSearch } from "./product.js";
import { fixPrice, auth } from "../api/api.js";
import axios from "axios";
import $ from "jquery";

// FUNCTIONS
let lastFoundRow, selectedProductFromSearch;

async function findProduct(e) {
    selectedProductFromSearch = selectProductFromSearch(e);

    // Remove the coloring class from the lastFoundRow
    if (lastFoundRow)
        lastFoundRow.removeClass('table-success')

    // Find the row that contains this product
    lastFoundRow = $(`table tbody tr td:contains('${selectedProductFromSearch.nameWithoutUnit}')`).closest('tr');

    // Add coloring class
    lastFoundRow.addClass('table-success');

    // Scroll to the row
    lastFoundRow.get(0).scrollIntoView();
    selectedProductFromSearch = undefined;
}

async function markProductAsScrapped(_id) {
    return await axios.post('/markProductAsScrapped', {
        _id
    }).catch((err) => {
        return err.response;
    });
}

// PAGES

export async function inventoryPage() {
    const categories = await getAllCategories(true);
    const products = await getAllProductsWithoutIngredients();
    const ingredients = await getAllIngredients();
    const productsAndIngredients = ingredients.concat(products);

    let totals = {
        buyPrice: 0,
        sellPrice: 0,
        difference: 0,
    };

    const productRows = (products) => html`
        ${products.map((product) => {
        let qty = product.qty,
            name = product.name,
            unit = 'бр';

        if (product.hasOwnProperty('unit') && (product.unit === 'кг' || product.unit === 'л')) {
            qty /= 1000;
            unit = product.unit;
        }


        let buyTotal = qty * product.buyPrice,
            sellTotal = qty * product.sellPrice,
            difference = product.sellPrice - product.buyPrice,
            differenceTotal = qty * difference;

        totals.buyPrice += buyTotal;
        totals.sellPrice += sellTotal;
        totals.difference += differenceTotal;

        qty += ` ${unit}.`
        return html`
                <tr class="${qty <= 0 ? 'table-danger' : ''}">
                    <td scope="row">${product.unit ? 'Съставка' : 'Продукт'}</td>
                    <td scope="row">${name}</td>
                    <td>${qty}</td>
                    <td>${fixPrice(product.buyPrice)}</td>
                    <td>${fixPrice(buyTotal)}</td>
                    <td>${product.sellPrice ? fixPrice(product.sellPrice) : "-"}</td>
                    <td>${product.sellPrice ? fixPrice(sellTotal) : "-"}</td>
                    <td>${product.sellPrice ? `${fixPrice(difference)} (${((product.sellPrice - product.buyPrice) / product.buyPrice * 100).toFixed(2)}%)` : "-"}</td>
                    <td>${product.sellPrice ? fixPrice(differenceTotal) : "-"}</td>
                </tr>
            `
    })
        }
<tr class="table-primary">
    <th colspan="4" class="text-center">Общо: </th>
    <th>${fixPrice(totals.buyPrice)}</th>
    <td></td>
    <th>${fixPrice(totals.sellPrice)}</th>
    <td></td>
    <th>${fixPrice(totals.difference)}</th>
</tr>
`;

    async function showProductsFromCategory(e) {
        totals = {
            buyPrice: 0,
            sellPrice: 0,
            difference: 0
        }

        const categoryId = e.target.value;

        let productsToShow = [];

        if (categoryId === 'all') // show all products
            productsToShow = productsAndIngredients;
        else if (categoryId === 'ingredients') // show only ingredients
            productsToShow = ingredients;
        else {
            const res = await axios.post('/getProductsWithoutIngredientsFromCategory', { _id: categoryId });
            productsToShow = res.data;
        }

        if (productsToShow.length === 0)
            return alert('Няма продукти в избраната категория!')

        render(productRows(productsToShow), document.querySelector('tbody'));
    }

    const inventoryTemplate = () => html`
        ${backBtn}

        <div class="mb-3 p-3">
                <label for="productSearch" class="form-label">Търси продукт</label>
                <input @change=${findProduct} class="form-control fs-4" type="text" list="allproducts" name="productSearch" id="productSearch">
                <datalist id="allproducts">
                    ${ingredients.map(el => {
        return html`
                    <option type="ingredients" unit=${el.unit} _id=${el._id} value=${el.name + ` (${el.unit})`} />`
    })}
                    ${products.map(el => {
        return html`<option type="product" _id=${el._id} value=${el.name}/>`
    })}
                </datalist>
        </div>

        <div class="p-3 mb-3 mt-3">
            <label for="selected" class="form-label fs-4">Преглед по категория</label>
            <select @change=${showProductsFromCategory} required type="text" class="form-control fs-4" name="_id" id="selected">
                <option selected value="all">Всички</option>
                <option value="ingredients">Съставки</option>
                ${categories.map((category) => html`<option value=${category._id}>${category.name}</option>`)}
            </select>
        </div>

    <table class="table table-striped table-dark table-hover text-center">
        <thead>
            <tr>
                <th scope="col">Тип</th>
                <th scope="col">Артикул</th>
                <th scope="col">Количество</th>
                <th scope="col">Доставна цена</th>
                <th scope="col">Доставна общо</th>
                <th scope="col">Продажна цена</th>
                <th scope="col">Продажна общо</th>
                <th scope="col">Разлика цена</th>
                <th scope="col">Разлика общо</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    </table>
`;

    render(inventoryTemplate(), container);

    // Render all products
    render(productRows(productsAndIngredients), document.querySelector('tbody'));
}

export async function buyPricesPage() {
    const res = await axios.get('/getAllProductsFromIngredients');
    let allProducts = res.data;
    // If we want all product and ingredients to show up here instead, uncomment this:
    /* let allProducts = await getAllProducts();
    let allIngredients = await getAllIngredients();
    allProducts = allProducts.concat(allIngredients); */

    const buyPricesTemplate = () => html`
        ${backBtn}

        <div class="mb-3 p-3">
                <label for="productSearch" class="form-label">Търси продукт</label>
                <input @change=${findProduct} class="form-control fs-4" type="text" list="allproducts" name="productSearch" id="productSearch">
                <datalist id="allproducts">
                    ${allProducts.map(el => {
        return html`
                    <option _id=${el._id} value=${el.name} />`
    })}
                </datalist>
        </div>

        <table class="table table-striped table-dark table-hover text-center">
            <thead>
                <tr>
                    <!-- <th scope="col">Тип</th> -->
                    <th scope="col">Артикул</th>
                    <th scope="col">Доставна цена</th>
                </tr>
            </thead>
            <tbody>
                ${allProducts.map(pr => {
        let type;
        if (pr.hasOwnProperty('category') && pr.ingredients.length) {
            type = 'Продукт от съставки'
        } else if (pr.hasOwnProperty('category')) {
            type = 'Продукт'
        } else {
            type = 'Съставка'
        }

        return html`
                    <tr>
                        <!-- <td>${type}</td> -->
                        <td>${pr.name}</td>
                        <td>${fixPrice(pr.buyPrice)}</td>
                    </tr>`
    })}
            </tbody>
        </table>
`;

    render(buyPricesTemplate(), container);
}

export async function scrappedPage() {
    const res = await axios.get('/getAllScrapped');
    let allScrapped = res.data;

    async function markPrdAsScrapped(e) {
        const _id = e.target.getAttribute('_id'); // history id

        const res = await markProductAsScrapped(_id);

        if (res.status === 200) {
            // Rerender histories
            allScrapped = res.data;
            render(historiesRows(allScrapped), document.querySelector('tbody'));
        } else {
            alert('Възникна грешка!');
            console.error(res);
        }
    }

    const historiesRows = (histories) => html`
        ${histories.map((history) => {

        let allProducts = [];
        let total = 0;
        const date = new Date(history.when);
        const dateString = `${date.getDate() > 9 ? date.getDate() : '0' + date.getDate()}.${(date.getMonth() + 1) > 9 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)}.${date.getFullYear()}`;
        const timeString = `${date.getHours() > 9 ? date.getHours() : '0' + date.getHours()}:${date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes()}`;

        for (let product of history.products) {
            total += product.qty * product.sellPrice;
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
                <td><button @click=${markPrdAsScrapped} class="btn btn-danger" _id=${history._id}>Бракувай</button></td>
            </tr>`
    })
        }
`;

    const scrappedTemplate = () => html`
        ${backBtn}

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
            <th scope="col"></th>
        </tr>
    </thead>
    <tbody>
    </tbody>
</table>
`;

    render(scrappedTemplate(), container);

    // Render all scrapped products
    render(historiesRows(allScrapped), document.querySelector('tbody'));
}

export function inventoryPages() {
    page('/admin/inventory', auth, inventoryPage);
    page('/admin/inventory/scrapped', auth, scrappedPage);
    page('/admin/inventory/buyPrices', auth, buyPricesPage);
}