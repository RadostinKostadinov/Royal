import page from 'page';
import { container } from "../app";
import { html, render } from 'lit/html.js';
import $ from "jquery";
import Sortable from 'sortablejs';
import '../css/admin/admin.css';
import { markHistoryAsScrapped, sortCategories, getProductById, getCategoryById, getAllUsers, editCategory, deleteCategory, deleteUser, createUser, editUser, createCategory, changeQtyProduct, createProduct, deleteProduct, editProduct, getAllCategories, getAllProducts, sortProducts, logout, getAllIngredients, createIngredient, deleteIngredient, getIngredientById, editIngredient, getAllProductsWithoutIngredients, getProductsWithoutIngredientsFromCategory, changeQtyIngredient, getAllScrapped, getAllRestockedProducts, getAllReports } from '../api';

const backBtn = html`<button @click=${()=> page('/admin')} class="btn btn-secondary fs-3 mt-2 ms-2">Назад</button>`;
let contentType; //  used in loadProducts to determine if we are loading/deleting a product or ingredient
let selectedFromSearch;

async function loadProducts(e, showProductsFromIngredients) {
    selectedFromSearch = undefined;
    
    // Get selected category
    const categoryId = e.target.value;

    let contentToRender;
    
    if (categoryId === null || categoryId === 'Избери')
        return alert('Избери категория!');
        
    if (categoryId === 'ingredients') {
        const res = await getAllIngredients();

        contentType = 'ingredient';
        contentToRender = res;
    } else {
        // Get category and render products as options
        const res = await getCategoryById(categoryId);

        
        if (res.status === 200) {
            contentType = 'product';
            let productsWithoutIngredients = [];

            if (showProductsFromIngredients === false) {
                for (let [index, product] of Object.entries(res.data.products)) {
                    if (product.hasOwnProperty('qty'))
                        productsWithoutIngredients.push(product);
                }
    
                contentToRender = productsWithoutIngredients;
            }
            else 
                contentToRender = res.data.products;
        }
        if (res.status === 400)
            return alert(res.data);
        if (res.status === 500) {
            alert('Възникна грешка!');
            return console.error(res);
        }
    }

    if (!contentToRender.length)
        return alert('Няма продукти в тази категория');

    let renderArray = [];
    for (let content of contentToRender)
        renderArray.push(html`<option unit=${content.unit ? content.unit : 'бр'} value=${content._id}>${content.name} ${content.unit ? `(${content.unit})` : ''}</option>`)

    render(renderArray, document.getElementById('_id'));

    $('#_id').val('Избери'); // Set the selected option to 'Izberi', because it doesnt do it when u render

    // Show div
    $('#product').removeClass('d-none');

    // This is for editProductPage
    // Hide product info div
    $('#product-info').addClass('d-none');
    return contentType;
}

function writeInQty(e) {
    e.preventDefault();
    const what = e.target.innerText.toLowerCase();
    const input = $('#qty');

    if (what === 'x')
        return input.val(input.val().slice(0, -1));

    if (what === '.')
        return $(e.target).addClass('active');

    if (!$('.qty-numpad .dot').hasClass('active'))
        return input.val(`${input.val()}${what}`);

    input.val(`${input.val()}.${what}`);
    $('.qty-numpad .dot').removeClass('active');
}

function showDivs() {
    $('#expireDateDiv').removeClass('d-none');
    $('#quantityDiv').removeClass('d-none');
}

function selectFromSearch(e) {
    const selected = e.target.value;

    if (!selected) return;

    const _id = $(`datalist option[value="${selected}"]`).attr('_id');
    const type = $(`datalist option[value="${selected}"]`).attr('type');
    const unit = $(`datalist option[value="${selected}"]`).attr('unit');
    if (!_id)
        return $('#quantityDiv').addClass('d-none');

    selectedFromSearch = {
        _id,
        type,
        unit
    };

    showDivs();
}

export async function removeQtyProductPage() {
    const categories = await getAllCategories(true);
    const allProducts = await getAllProductsWithoutIngredients();
    const allIngredients = await getAllIngredients();
    
    async function remQty(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const action = 'remove'; // add to current qty
        let qty = +formData.get('qty');
        let unit,
            selectedCategory,
            _id;

        // Check if selected using select or search
        if (selectedFromSearch) {
            _id = selectedFromSearch._id;
            unit = selectedFromSearch.unit;
            selectedCategory = selectedFromSearch.type;
        } else {
            _id = formData.get('_id');
            unit = $('#product option:selected').attr('unit');
            selectedCategory = formData.get('categoryId');
        }
        
        if (_id === null)
            return alert('Избери продукт!');
        if (qty === null)
            return alert('Въведи количество!');

        if (unit === 'кг' || unit === 'л')
            qty *= 1000;

        let res;
        if (selectedCategory === 'ingredients')
            res = await changeQtyIngredient(_id, qty, action);
        else
            res = await changeQtyProduct(_id, qty, action);

        if (res.status === 200) {// Successfully added qty to product
            alert(res.data);
            page('/');
        } else {
            alert('Възникна грешка!');
            console.error(res);
        }
    }

    const removeQtyTemplate = () => html`
        ${backBtn}
        <form @submit=${remQty} class="d-flex text-center fs-3 flex-column m-auto mt-5 gap-5 p-3">
            <div class="mb-3 d-lg-none">
                <label for="productSearch" class="form-label">Търси</label>
                <input @change=${selectFromSearch} class="form-control" type="text" list="allproducts" name="productSearch" id="productSearch">
                <datalist id="allproducts">
                    ${allIngredients.map(el => {
                        return html`<option type="ingredients" unit=${el.unit} _id=${el._id} value=${el.name + ` (${el.unit})`} />`
                    })}
                    ${allProducts.map(el => {
                        return html`<option type="product" _id=${el._id} value=${el.name}/>`
                    })}
                </datalist>
            </div>

            <div class="mb-3">
                <label for="categoryId" class="form-label d-lg-none">или избери категория</label>
                <label for="categoryId" class="form-label d-none d-lg-block">Избери категория</label>
                <select @change=${(e) => loadProducts(e, false)} required type="text" class="form-control fs-4" name="categoryId" id="categoryId">
                    <option selected disabled>Избери</option>
                    <option value="ingredients">Съставки</option>
                    ${categories.map((category) => html`<option value=${category._id}>${category.name}</option>`)}
                </select>
            </div>

            <div class="mb-3 d-none" id="product">
                <label for="_id" class="form-label">Избери продукт</label>
                <select @change=${() => $('#quantityDiv').removeClass('d-none')} required type="text" class="form-control fs-4" name="_id" id="_id">
                    <option selected disabled>Избери</option>
                </select>
            </div>
            
            <div class="mb-3 d-none" id="quantityDiv">
                <label for="qty" class="form-label">Добави количество</label>
                <input required type="number" step="0.05" class="form-control fs-4" name="qty" id="qty" placeholder="пример: 50">
                <div class="w-50 m-auto qty-numpad mt-3 d-none d-lg-grid">
                    <button @click=${writeInQty} class="btn btn-primary">1</button>
                    <button @click=${writeInQty} class="btn btn-primary">2</button>
                    <button @click=${writeInQty} class="btn btn-primary">3</button>
                    <button @click=${writeInQty} class="btn btn-primary">4</button>
                    <button @click=${writeInQty} class="btn btn-primary">5</button>
                    <button @click=${writeInQty} class="btn btn-primary">6</button>
                    <button @click=${writeInQty} class="btn btn-primary">7</button>
                    <button @click=${writeInQty} class="btn btn-primary">8</button>
                    <button @click=${writeInQty} class="btn btn-primary">9</button>
                    <button @click=${writeInQty} class="btn btn-danger">X</button>
                    <button @click=${writeInQty} class="btn btn-primary">0</button>
                    <button @click=${writeInQty} class="btn btn-primary dot">.</button>
                </div>
            </div>
            <input class="btn btn-danger fs-3" type="submit" value="Бракувай" />
        </form>
    `;

    render(removeQtyTemplate(), container);
}

export async function addQtyProductPage() {
    const categories = await getAllCategories(true);
    const allProducts = await getAllProductsWithoutIngredients();
    const allIngredients = await getAllIngredients();
    
    async function addQty(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const action = 'add'; // add to current qty
        let qty = +formData.get('qty'),
            expireDate = formData.get('expireDate'),
            unit,
            selectedCategory,
            _id;

        // Check if selected using select or search
        if (selectedFromSearch) {
            _id = selectedFromSearch._id;
            unit = selectedFromSearch.unit;
            selectedCategory = selectedFromSearch.type;
        } else {
            _id = formData.get('_id');
            unit = $('#product option:selected').attr('unit');
            selectedCategory = formData.get('categoryId');
        }
        
        if (_id === null)
            return alert('Избери продукт!');
        if (qty === null)
            return alert('Въведи количество!');

        if (unit === 'кг' || unit === 'л')
            qty *= 1000;

        let res;
        if (selectedCategory === 'ingredients')
            res = await changeQtyIngredient(_id, qty, action, expireDate);
        else
            res = await changeQtyProduct(_id, qty, action, expireDate);

        if (res.status === 200) {// Successfully added qty to product
            alert(res.data);
            page('/');
            page('/admin/product/addQty'); // redirect back to this page
        } else {
            alert('Възникна грешка!');
            console.error(res);
        }
    }

    const addQtyTemplate = () => html`
        ${backBtn}
        <form @submit=${addQty} class="d-flex text-center fs-3 flex-column m-auto mt-5 gap-5 p-3">
            <div class="mb-3 d-lg-none">
                <label for="productSearch" class="form-label">Търси</label>
                <input @change=${selectFromSearch} class="form-control" type="text" list="allproducts" name="productSearch" id="productSearch">
                <datalist id="allproducts">
                    ${allIngredients.map(el => {
                        return html`<option type="ingredients" unit=${el.unit} _id=${el._id} value=${el.name + ` (${el.unit})`} />`
                    })}
                    ${allProducts.map(el => {
                        return html`<option type="product" _id=${el._id} value=${el.name}/>`
                    })}
                </datalist>
            </div>

            <div class="mb-3">
                <label for="categoryId" class="form-label d-lg-none">или избери категория</label>
                <label for="categoryId" class="form-label d-none d-lg-block">Избери категория</label>
                <select @change=${(e) => loadProducts(e, false)} required type="text" class="form-control fs-4" name="categoryId" id="categoryId">
                    <option selected disabled>Избери</option>
                    <option value="ingredients">Съставки</option>
                    ${categories.map((category) => html`<option value=${category._id}>${category.name}</option>`)}
                </select>
            </div>

            <div class="mb-3 d-none" id="product">
                <label for="_id" class="form-label">Избери продукт</label>
                <select @change=${showDivs} required type="text" class="form-control fs-4" name="_id" id="_id">
                    <option selected disabled>Избери</option>
                </select>
            </div>
            
            <div class="mb-3 d-none" id="quantityDiv">
                <label for="qty" class="form-label">Добави количество</label>
                <input required type="number" step="0.05" class="form-control fs-4" name="qty" id="qty" placeholder="пример: 50">
                <div class="w-50 m-auto qty-numpad mt-3 d-none d-lg-grid">
                    <button @click=${writeInQty} class="btn btn-primary">1</button>
                    <button @click=${writeInQty} class="btn btn-primary">2</button>
                    <button @click=${writeInQty} class="btn btn-primary">3</button>
                    <button @click=${writeInQty} class="btn btn-primary">4</button>
                    <button @click=${writeInQty} class="btn btn-primary">5</button>
                    <button @click=${writeInQty} class="btn btn-primary">6</button>
                    <button @click=${writeInQty} class="btn btn-primary">7</button>
                    <button @click=${writeInQty} class="btn btn-primary">8</button>
                    <button @click=${writeInQty} class="btn btn-primary">9</button>
                    <button @click=${writeInQty} class="btn btn-danger">X</button>
                    <button @click=${writeInQty} class="btn btn-primary">0</button>
                    <button @click=${writeInQty} class="btn btn-primary dot">.</button>
                </div>
            </div>

            <div class="mb-3 d-none" id="expireDateDiv">
                <label for="expireDate" class="form-label">Дата</label>
                <input name="expireDate" class="form-control fs-4" id="expireDate" type="date"/>
            </div>
            <input class="btn btn-primary fs-3" type="submit" value="Зареди" />
        </form>
    `;

    render(addQtyTemplate(), container);
}

export async function createProductPage() {
    const categories = await getAllCategories();
    const ingredients = await getAllIngredients();

    async function createPrdct(e) {
        e.preventDefault();
        // Get data from form
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const qty = +formData.get('qty');
        const buyPrice = +formData.get('buyPrice');
        const sellPrice = +formData.get('sellPrice');
        const categoryId = formData.get('categoryId');
        const forBartender = formData.get('forBartender') || false;

        if (categoryId === null)
            return alert('Избери категория!');

        const res = await createProduct(name, qty, undefined, buyPrice, sellPrice, categoryId, forBartender);

        if (res.status === 201) {// Successfully created product
            alert(res.data);
            page('/');
        } else if (res.status === 400) {
            alert(res.data);
        } else {
            alert('Възникна грешка!');
            console.error(res);
        }
    }

    async function createPrdctFromIngrdnts(e) {
        e.preventDefault();
        // Get data from form
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const buyPrice = +formData.get('buyPrice');
        const sellPrice = +formData.get('sellPrice');
        const categoryId = formData.get('categoryId');
        const forBartender = formData.get('forBartender') || false;
        const allIngredients = formData.getAll('ingredients');
        let selectedIngredients = [];

        // get _id of selected ingredients
        for (let i in allIngredients) {
            if (allIngredients[i]) { // if ingredient has value in input
                // convert from ['5'] to [{ ingridient: ingredient._id, qty: qty}]
                selectedIngredients.push({
                        ingredient: ingredients[i]._id,
                        qty: allIngredients[i]
                });
            }
        }

        if (categoryId === null)
            return alert('Избери категория!');

        if (!selectedIngredients.length) // if no ingredients selected
            return alert('Избери поне една съставка!');

        const res = await createProduct(name, undefined, selectedIngredients, buyPrice, sellPrice, categoryId, forBartender);

        if (res.status === 201) {// Successfully created product
            alert(res.data);
            page('/');
        } else if (res.status === 400) {
            alert(res.data);
        } else {
            alert('Възникна грешка!');
            console.error(res);
        }
    }

    async function createIngrdnt(e) {
        e.preventDefault();
        // Get data from form
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const unit = formData.get('unit');
        if (unit === undefined || unit === 'Избери')
            return alert('Избери мерна единица!');
        const qty = +formData.get('qty');
        const buyPrice = +formData.get('buyPrice');
        const sellPrice = +formData.get('sellPrice');

        const res = await createIngredient(name, unit, qty, buyPrice, sellPrice);

        if (res.status === 201) {// Successfully created ingredient
            alert(res.data);
            page('/');
        } else if (res.status === 400) {
            alert(res.data);
        } else {
            alert('Възникна грешка!');
            console.error(res);
        }
    }

    function selectProductType(e) {
        const selected = $(e.target).val();

        if (!selected || selected === 'Избери')
            return alert('Избери тип!');

        if (selected === 'product') // Render product fields
            render(productFields(), container);
        else if (selected === 'productFromIngredients')
            render(productFromIngredientsFields(), container);
        else if (selected === 'ingredient')
            render(ingredientFields(), container);
    }

    const typeSelect = () => html`
        ${backBtn}
        <div class="mb-3 p-3">
            <label for="productType" class="form-label">Тип на продукт</label>
            <select @change=${selectProductType} required class="form-control fs-4" name="productType" id="productType">
                <option selected disabled>Избери</option>
                <option value="product">Продукт</option>
                <option value="productFromIngredients">Продукт от съставки</option>
                <option value="ingredient">Съставка</option>
            </select>
        </div>
    `;

    const productFields = () => html`
    ${backBtn}
    <form @submit=${createPrdct} class="m-auto mt-2 p-3 text-center fs-3">
        <div class="mb-3">
            <label for="productType" class="form-label">Тип на продукт</label>
            <select @change=${selectProductType} required class="form-control fs-4" name="productType" id="productType">
                <option disabled>Избери</option>
                <option selected value="product">Продукт</option>
                <option value="productFromIngredients">Продукт от съставки</option>
                <option value="ingredient">Съставка</option>
            </select>
        </div>
        <div class="mb-3">
            <label for="categoryId" class="form-label">Категория</label>
            <select required class="form-control fs-4" name="categoryId" id="categoryId">
                <option selected disabled>Избери</option>
                ${categories.map((category) => html`<option value=${category._id}>${category.name}</option>`)}
            </select>
        </div>
        <div class="mb-3">
            <label for="name" class="form-label">Име</label>
            <input required type="text" class="form-control fs-4" name="name" id="name" placeholder="пример: Бира">
        </div>
        <div class="mb-3">
            <label for="qty" class="form-label">Количество</label>
            <input required type="number" min="1" class="form-control fs-4" name="qty" id="qty" placeholder="пример: 50">
        </div>
        <div class="mb-3">
            <label for="buyPrice" class="form-label">Доставна цена</label>
            <input required type="text" title="пример: 5.20, 5.0, 5, 0.5, 0.50" pattern="^\\d{1,}(\\.\\d{1,2})?$" class="form-control fs-4" name="buyPrice" id="buyPrice" placeholder="пример: 1.50">
        </div>
        <div class="mb-3">
            <label for="sellPrice" class="form-label">Продажна цена</label>
            <input required type="text" title="пример: 5.20, 5.0, 5, 0.5, 0.50" pattern="^\\d{1,}(\\.\\d{1,2})?$" class="form-control fs-4" name="sellPrice" id="sellPrice" placeholder="пример: 2">
        </div>
        <div class="mb-3">
            <label class="form-label">Да се появява на монитора на</label>
            <div class="form-check">
                <div class="d-inline-block">
                    <input class="form-check-input" type="checkbox" value="true" name="forBartender" id="forBartender">
                    <label class="form-check-label" for="forBartender">
                        Барман
                    </label>
                </div>
            </div>
        </div>
        <input type="submit" class="btn btn-primary fs-3 w-100" value="Създай"/>
    </form>
    `;

    const productFromIngredientsFields = () => html`
    ${backBtn}
    <form @submit=${createPrdctFromIngrdnts} class="m-auto mt-2 p-3 text-center fs-3">
        <div class="mb-3">
            <label for="productType" class="form-label">Тип на продукт</label>
            <select @change=${selectProductType} required class="form-control fs-4" name="productType" id="productType">
                <option disabled>Избери</option>
                <option value="product">Продукт</option>
                <option selected value="productFromIngredients">Продукт от съставки</option>
                <option value="ingredient">Съставка</option>
            </select>
        </div>
        <div class="mb-3">
            <label for="categoryId" class="form-label">Категория</label>
            <select required class="form-control fs-4" name="categoryId" id="categoryId">
                <option selected disabled>Избери</option>
                ${categories.map((category) => html`<option value=${category._id}>${category.name}</option>`)}
            </select>
        </div>
        <div class="mb-3">
            <label for="name" class="form-label">Име</label>
            <input required type="text" class="form-control fs-4" name="name" id="name" placeholder="пример: Бира">
        </div>
        <div class="mb-3">
            <label for="buyPrice" class="form-label">Доставна цена</label>
            <input required type="text" title="пример: 5.20, 5.0, 5, 0.5, 0.50" pattern="^\\d{1,}(\\.\\d{1,2})?$"
                class="form-control fs-4" name="buyPrice" id="buyPrice" placeholder="пример: 1.50">
        </div>
        <div class="mb-3">
            <label for="sellPrice" class="form-label">Продажна цена</label>
            <input required type="text" title="пример: 5.20, 5.0, 5, 0.5, 0.50" pattern="^\\d{1,}(\\.\\d{1,2})?$"
                class="form-control fs-4" name="sellPrice" id="sellPrice" placeholder="пример: 2">
        </div>
        <div class="mb-3">
            <label class="form-label">Да се появява на монитора на</label>
            <div class="form-check">
                <div class="d-inline-block">
                    <input class="form-check-input" type="checkbox" value="true" name="forBartender" id="forBartender">
                    <label class="form-check-label" for="forBartender">
                        Барман
                    </label>
                </div>
            </div>
        </div>
        <div class="mb-5 pt-3" id="ingredients">
            <label class="form-label fs-5">Избери съставки и какво количество от тях използва продукта.</label>
            <button @click=${selectIngredient} class="btn btn-success fs-3">Добави съставка</button>
        </div>
        <input type="submit" class="btn btn-primary fs-3 w-100" value="Създай" />
    </form>
    <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-fullscreen-sm-down">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    ${''/* TODO CREATE ME */}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary">Save changes</button>
                </div>
            </div>
        </div>
    </div>
    `;

    const ingredientInput = (ingredient) => html`
        <div class="mb-3">
            <label for=${ingredient._id} class="form-label">${ingredient.name}</label>
            <input type="number" min="1" class="form-control fs-4" name="ingredients" id=${ingredient._id} placeholder="пример: 50">
        </div>
    `;

    let selectedIngredients = [];
    function selectIngredient() {

    }

    const ingredientFields = () => html`
    ${backBtn}

    <form @submit=${createIngrdnt} class="m-auto mt-2 p-3 text-center fs-3">
        <div class="mb-3">
            <label for="productType" class="form-label">Тип на продукт</label>
            <select @change=${selectProductType} required class="form-control fs-4" name="productType" id="productType">
                <option disabled>Избери</option>
                <option value="product">Продукт</option>
                <option value="productFromIngredients">Продукт от съставки</option>
                <option selected value="ingredient">Съставка</option>
            </select>
        </div>
        <div class="mb-3">
            <label for="name" class="form-label">Име</label>
            <input required type="text" class="form-control fs-4" name="name" id="name" placeholder="пример: Бира">
        </div>
        <div class="mb-3">
            <label for="unit" class="form-label">Мерна единица</label>
            <select required class="form-control fs-4" name="unit" id="unit">
                <option selected disabled>Избери</option>
                <option value="кг">килограм</option>
                <option value="л">литър</option>
                <option value="бр">брой</option>
            </select>
        </div>
        <div class="mb-3">
            <label for="qty" class="form-label">Количество</label>
            <input required type="number" min="1" class="form-control fs-4" name="qty" id="qty" placeholder="пример: 50">
        </div>
        <div class="mb-3">
            <label for="buyPrice" class="form-label">Доставна цена</label>
            <input required type="text" title="пример: 5.20, 5.0, 5, 0.5, 0.50" pattern="^\\d{1,}(\\.\\d{1,2})?$"
                class="form-control fs-4" name="buyPrice" id="buyPrice" placeholder="пример: 1.50">
        </div>
        <div class="mb-3">
            <label for="sellPrice" class="form-label">Продажна цена</label>
            <input required type="text" title="пример: 5.20, 5.0, 5, 0.5, 0.50" pattern="^\\d{1,}(\\.\\d{1,2})?$"
                class="form-control fs-4" name="sellPrice" id="sellPrice" placeholder="пример: 2">
        </div>
        <input type="submit" class="btn btn-primary fs-3 w-100" value="Създай" />
    </form>
    `;

    render(typeSelect(), container);
}

export async function deleteProductPage() {
    const categories = await getAllCategories();

    async function delProduct(e) {
        e.preventDefault();
        // Get selected user
        const formData = new FormData(e.target);
        const _id = formData.get('_id');

        if (_id === null)
            return alert('Избери продукт!');

        let res;
        if (contentType === 'product')
            res = await deleteProduct(_id);
        else if (contentType === 'ingredient')
            res = await deleteIngredient(_id);

        if (res.status === 200) {// Successfully deleted product/ingredient
            alert(res.data);
            page('/');
        } else {
            alert('Възникна грешка!');
            console.error(res);
        }
    }

    const deleteTemplate = () => html`
        ${backBtn}
        <form @submit=${delProduct} class="d-flex text-center fs-3 flex-column m-auto mt-5 gap-5 p-3">
            <div class="mb-3">
                <label for="categoryId" class="form-label">1. Избери категория</label>
                <select @change=${loadProducts} required type="text" class="form-control fs-4" name="categoryId" id="categoryId">
                    <option selected disabled>Избери</option>
                    <option value="ingredients">Съставки</option>
                    ${categories.map((category) => {
                        if (category.hasOwnProperty('parent')) // if it has a parent, it means its a subcategory (child)
                            return html`<option value=${category._id}>    ${category.name}</option>`

                        return html`<option value=${category._id}>${category.name}</option>`
                    })}
                </select>
            </div>
            <div class="mb-3 d-none" id="product">
                <label for="_id" class="form-label">2. Избери продукт</label>
                <select required type="text" class="form-control fs-4" name="_id" id="_id">
                    <option selected disabled>Избери</option>
                </select>
            </div>
            <input class="btn btn-danger fs-3" type="submit" value="Изтрий" />
        </form>
    `;

    render(deleteTemplate(), container);
}

export async function editProductPage() {
    const categories = await getAllCategories();
    const ingredients = await getAllIngredients();

    async function getData(e) {
        e.preventDefault();
        // Get data from form
        const formData = new FormData(e.target);
        const _id = formData.get('_id');
        const name = formData.get('name');
        const unit = formData.get('unit');
        let qty = formData.get('qty');
        const buyPrice = +formData.get('buyPrice');
        const sellPrice = +formData.get('sellPrice');
        let selectedIngredients;

        let res;
        if (contentType === 'ingredient') {
            qty = +qty;
            if (unit === undefined || unit === 'Избери')
                return alert('Избери мерна единица!')
            res = await editIngredient(_id, name, unit, qty, buyPrice, sellPrice)
        } else {
            const categoryId = formData.get('pr-categoryId');
            const forBartender = formData.get('forBartender') || false;

            if (categoryId === null)
                return alert('Избери категория!');

            if (qty) // simple product
                qty = +qty;
            else { // product from ingredients
                const allIngredients = formData.getAll('ingredients');
                selectedIngredients = [];

                // get _id of selected ingredients
                for (let i in allIngredients) {
                    if (allIngredients[i]) { // if ingredient has value in input
                        // convert from ['5'] to [{ ingridient: ingredient._id, qty: qty}]
                        selectedIngredients.push({
                            ingredient: ingredients[i]._id,
                            qty: allIngredients[i]
                        });
                    }
                }

                if (!selectedIngredients.length) // if no ingredients selected
                    return alert('Избери поне една съставка!');
            }

            res = await editProduct(_id, name, qty, selectedIngredients, buyPrice, sellPrice, categoryId, forBartender);
        }

        if (res.status === 200) {// Successfully edited product/ingredient
            alert(res.data);
            page('/');
        } else if (res.status === 400) {
            alert(res.data);
        } else {
            alert('Възникна грешка!');
            console.error(res);
        }
    }

    async function loadProductInfo(e) {
        $('#product-info').removeClass('d-none');

        const _id = e.target.value;

        if (_id === null || _id === 'Избери') 
            return alert('Избери категория!');

        if (contentType === 'ingredient') {
            const res = await getIngredientById(_id);
            const ingredient = res.data;

            let unithtml;
            if (ingredient.unit === 'кг')
                unithtml = html`
                <div class="mb-3">
                    <label for="unit" class="form-label">Мерна единица</label>
                    <select required class="form-control fs-4" name="unit" id="unit">
                        <option disabled>Избери</option>
                        <option selected value="кг">килограм</option>
                        <option value="л">литър</option>
                        <option value="бр">брой</option>
                    </select>
                </div>`
            if (ingredient.unit === 'л')
                unithtml = html`
                <div class="mb-3">
                    <label for="unit" class="form-label">Мерна единица</label>
                    <select required class="form-control fs-4" name="unit" id="unit">
                        <option disabled>Избери</option>
                        <option value="кг">килограм</option>
                        <option selected value="л">литър</option>
                        <option value="бр">брой</option>
                    </select>
                </div>`
            if (ingredient.unit === 'бр')
                unithtml = html`
                <div class="mb-3">
                    <label for="unit" class="form-label">Мерна единица</label>
                    <select required class="form-control fs-4" name="unit" id="unit">
                        <option disabled>Избери</option>
                        <option value="кг">килограм</option>
                        <option value="л">литър</option>
                        <option selected value="бр">брой</option>
                    </select>
                </div>`
            
            render(ingredientFields(ingredient, unithtml), document.getElementById('product-info'))
            
        }
        else {
            const res = await getProductById(_id);
            if (res.status === 200) {
                const product = res.data;

                // Check if product is made of ingredients or if its simple product
                if (product.ingredients.length) {
                    // First render all ingredients
                    render(productsFromIngredientsFields(product, ingredients), document.getElementById('product-info'));

                    // Then fill the values for every one that this product has
                    for (let ingredient of product.ingredients) {
                        $(`#${ingredient.ingredient._id}`).val(ingredient.qty);
                    }
                }
                else
                    render(productFields(product), document.getElementById('product-info'));
                
                $('#pr-forBartender').attr('checked', product.forBartender);
                $('#pr-categoryId').val(product.category);
            }
        }

        // Set the values in the inputs
        // $('#pr-name').val(Pname);
        // $('#pr-qty').val(Pqty);
        // $('#pr-buyPrice').val(PbuyPrice);
        // $('#pr-sellPrice').val(PsellPrice);
    }

    const productsFromIngredientsFields = (product, ingredients) => html`
        <div class="mb-3">
            <label for="pr-name" class="form-label">Име</label>
            <input required type="text" class="form-control fs-4" name="name" id="pr-name" value=${product.name} placeholder="пример: Бира">
        </div>

        <div class="mb-3">
            <label for="pr-buyPrice" class="form-label">Доставна цена</label>
            <input required type="text" title="пример: 5.20, 5.0, 5, 0.5, 0.50" value=${product.buyPrice} pattern="^\\d{1,}(\\.\\d{1,2})?$" class="form-control fs-4" name="buyPrice" id="pr-buyPrice" placeholder="пример: 1.50">
        </div>

        <div class="mb-3">
            <label for="pr-sellPrice" class="form-label">Продажна цена</label>
            <input required type="text" title="пример: 5.20, 5.0, 5, 0.5, 0.50" value=${product.sellPrice} pattern="^\\d{1,}(\\.\\d{1,2})?$" class="form-control fs-4" name="sellPrice" id="pr-sellPrice" placeholder="пример: 2">
        </div>

        <div class="mb-3">
            <label for="pr-categoryId" class="form-label">Категория</label>
            <select required type="text" class="form-control fs-4" name="pr-categoryId" id="pr-categoryId">
                <option selected disabled>Избери</option>
                ${categories.map((category) => html`<option value=${category._id}>${category.name}</option>`)}
            </select>
        </div>

        <div class="mb-3 pt-3" id="ingredients">
            <label for="sellPrice" class="form-label fs-5">Избери съставки и какво количество от тях използва продукта. Ако не използва определена съставка недей да пишеш нищо в кутийката.</label>
            ${ ingredients.map((ingredient) => {
                return html`
                    <div class="mb-3">
                        <label for=${ingredient._id} class="form-label">${ingredient.name}</label>
                        <input type="number" min="1" class="form-control fs-4" name="ingredients" id=${ingredient._id} placeholder="пример: 50">
                    </div>
                `;
            })}
        </div>

        <div class="mb-3">
            <label class="form-label">Да се появява на монитора на</label>
            <div class="form-check">
                <div class="d-inline-block">
                    <input class="form-check-input" type="checkbox" value="true" name="forBartender" id="pr-forBartender">
                    <label class="form-check-label" for="forBartender">
                        Барман
                    </label>
                </div>
            </div>
        </div>

        <input type="submit" class="btn btn-primary fs-3 w-100" value="Промени"/>
    `;

    const productFields = (product) => html`
        <div class="mb-3">
            <label for="pr-name" class="form-label">Име</label>
            <input required type="text" class="form-control fs-4" name="name" id="pr-name" value=${product.name} placeholder="пример: Бира">
        </div>

        <div class="mb-3">
            <label for="pr-qty" class="form-label">Количество</label>
            <input required type="number" min="1" class="form-control fs-4" name="qty" id="pr-qty" value=${product.qty} placeholder="пример: 50">
        </div>

        <div class="mb-3">
            <label for="pr-buyPrice" class="form-label">Доставна цена</label>
            <input required type="text" title="пример: 5.20, 5.0, 5, 0.5, 0.50" value=${product.buyPrice} pattern="^\\d{1,}(\\.\\d{1,2})?$" class="form-control fs-4" name="buyPrice" id="pr-buyPrice" placeholder="пример: 1.50">
        </div>

        <div class="mb-3">
            <label for="pr-sellPrice" class="form-label">Продажна цена</label>
            <input required type="text" title="пример: 5.20, 5.0, 5, 0.5, 0.50" value=${product.sellPrice} pattern="^\\d{1,}(\\.\\d{1,2})?$" class="form-control fs-4" name="sellPrice" id="pr-sellPrice" placeholder="пример: 2">
        </div>

        <div class="mb-3">
            <label for="pr-categoryId" class="form-label">Категория</label>
            <select required type="text" class="form-control fs-4" name="pr-categoryId" id="pr-categoryId">
                <option selected disabled>Избери</option>
                ${categories.map((category) => html`<option value=${category._id}>${category.name}</option>`)}
            </select>
        </div>

        <div class="mb-3">
            <label class="form-label">Да се появява на монитора на</label>
            <div class="form-check">
                <div class="d-inline-block">
                    <input class="form-check-input" type="checkbox" value="true" name="forBartender" id="pr-forBartender">
                    <label class="form-check-label" for="forBartender">
                        Барман
                    </label>
                </div>
            </div>
        </div>

        <input type="submit" class="btn btn-primary fs-3 w-100" value="Промени"/>
    `;

    const ingredientFields = (ingredient, unithtml) => html`
        <div class="mb-3">
            <label for="pr-name" class="form-label">Име</label>
            <input required type="text" class="form-control fs-4" name="name" id="pr-name" value=${ingredient.name} placeholder="пример: Бира">
        </div>

        ${unithtml}

        <div class="mb-3">
            <label for="pr-qty" class="form-label">Количество</label>
            <input required type="number" min="1" class="form-control fs-4" name="qty" id="pr-qty" value=${ingredient.qty} placeholder="пример: 50">
        </div>

        <div class="mb-3">
            <label for="pr-buyPrice" class="form-label">Доставна цена</label>
            <input required type="text" title="пример: 5.20, 5.0, 5, 0.5, 0.50" value=${ingredient.buyPrice} pattern="^\\d{1,}(\\.\\d{1,2})?$" class="form-control fs-4" name="buyPrice" id="pr-buyPrice" placeholder="пример: 1.50">
        </div>

        <div class="mb-3">
            <label for="pr-sellPrice" class="form-label">Продажна цена</label>
            <input required type="text" title="пример: 5.20, 5.0, 5, 0.5, 0.50" value=${ingredient.sellPrice} pattern="^\\d{1,}(\\.\\d{1,2})?$" class="form-control fs-4" name="sellPrice" id="pr-sellPrice" placeholder="пример: 2">
        </div>

        <input type="submit" class="btn btn-primary fs-3 w-100" value="Промени"/>
    `;

    const formTemplate = () => html`
    ${backBtn}
    <form @submit=${getData} class="m-auto p-3 text-center fs-3">
        <div class="mb-3">
            <label for="categoryId" class="form-label">1. Избери категория</label>
            <select @change=${loadProducts} required type="text" class="form-control fs-4" name="categoryId" id="categoryId">
                <option selected disabled>Избери</option>
                <option value="ingredients">Съставки</option>
                ${categories.map((category) => html`<option value=${category._id}>${category.name}</option>`)}
            </select>
        </div>
        <div class="mb-3 d-none" id="product">
            <label for="_id" class="form-label">2. Избери продукт</label>
            <select @change=${loadProductInfo} required type="text" class="form-control fs-4" name="_id" id="_id">
                <option selected disabled>Избери</option>
            </select>
        </div>
        <div id="product-info" class="mb-3 d-none">
        </div>
    </form>
`;

    render(formTemplate(), container);
}

export async function sortProductsPage() {
    const categories = await getAllCategories();
    async function saveOrder() {
        const sortedProducts = sortable.toArray(); // returns array with the 'data-id' attr for sorted categories

        if (sortedProducts === null) return;

        const res = await sortProducts(sortedProducts);

        if (res.status === 200) {// Successfully sorted products
            alert(res.data);
            page('/');
        } else if (res.status === 400) {
            alert(res.data);
        } else {
            alert('Възникна грешка!');
            console.error(res);
        }
    }

    async function getProducts(e) {
        const _id = e.target.value; // get selected category id

        if (_id === null || _id === 'Избери')
            return alert('Избери категория!');

        const res = await getCategoryById(_id);
        const category = res.data;

        
        
        render(productsTemplate(category.products), document.getElementById('products'));// render all products in sorting div
    }

    const productsTemplate = (products) => html`
        ${products.map((product) => html`<li class="list-group-item cursor-pointer" data-id=${product._id}>${product.name}</li>
        `)}
    `;

    const reorderDiv = () => html`
        ${backBtn}

        <div class="mb-3">
            <label for="categoryId" class="form-label">1. Избери категория</label>
            <select @change=${getProducts} required type="text" class="form-control fs-4" name="categoryId" id="categoryId">
                <option selected disabled>Избери</option>
                ${categories.map((category) => {
                    if (category.hasOwnProperty('parent')) // if it has a parent, it means its a subcategory (child)
                        return html`<option value=${category._id}>    ${category.name}</option>`

                    return html`<option value=${category._id}>${category.name}</option>`
                })}
            </select>
        </div>

        <div id="listAndBtn" class="p-3 fs-3 text-center">
            <ul id="products" style="width: 80%" class="list-group fs-4 text-center mt-4">
                
            </ul>
            <button @click=${saveOrder} class="btn btn-primary mt-3 w-100 fs-3">Запази</button>
        </div>
    `;

    render(reorderDiv(), container);
    // Activate the sorting http://sortablejs.github.io/Sortable/#simple-list
    var list = document.getElementById('products');
    var sortable = new Sortable(list, {
        animation: 150,
        ghostClass: "active",  // Class name for the drop placeholder
        chosenClass: "list-group-item-action",  // Class name for the chosen item
    })
}

export function createEmployeePage() {
    async function getDataFromForm(e) {
        e.preventDefault();
        // Get data from form
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const pin = formData.get('pin');
        const role = formData.get('role');

        if (role === null)
            return alert('Избери длъжност');

        const res = await createUser(name, pin, role);

        if (res.status === 201) {// Successfully created new user
            alert(res.data);
            page('/');
        } else {
            alert('Възникна грешка!');
            console.error(res);
        }
    }

    const newTemplate = () => html`
        ${backBtn}
        <form autocomplete="off" @submit=${getDataFromForm} class="d-flex m-auto mt-5 flex-column gap-5 p-3 fs-3">
            <div class="text-center">
                <label class="form-label">Име на служител</label>
                <input class="form-control fs-3" name="name" required type="text" placeholder="пример: Иван" />
            </div>
        
            <div class="text-center">
                <label class="form-label">ПИН код (4 цифри)</label>
                <input class="form-control fs-3" name="pin" title="Задължително 4 цифри!" pattern="\\d{4}" maxlength="4"
                    required type="text" placeholder="пример: 1234" />
            </div>
            <div class="d-flex flex-column gap-2 text-center">
                <label class="form-label">Длъжност на служител</label>
                <select class="form-control fs-3" required name="role">
                    <option selected disabled>Избери</option>
                    <option value="bartender">Барман</option>
                    <option value="waiter">Сервитьор</option>
                </select>
            </div>
        
            <input class="btn btn-primary fs-3" type="submit" value="Създай служител" />
        </form>
    `;

    render(newTemplate(), container);
}

export async function deleteEmployeePage() {
    // Get users from Node JS
    let users = await getAllUsers();

    async function delUser(e) {
        e.preventDefault();
        // Get selected user
        const formData = new FormData(e.target);
        const _id = formData.get('_id');

        if (_id === null)
            return alert('Избери служител!');

        const res = await deleteUser(_id);

        if (res.status === 200) {// Successfully deleted user
            alert(res.data);
            page('/');
        } else {
            alert('Възникна грешка!');
            console.error(res);
        }
    }

    const deleteTemplate = () => html`
        ${backBtn}
        <form @submit=${delUser} class="d-flex text-center fs-3 flex-column m-auto mt-5 gap-5 p-3">
            <div>
                <label class="form-label">Избери служител</label>
                <select required class="form-control fs-4 text-capitalize" name="_id">
                    <option selected disabled>Избери</option>
                    ${users.map((user) => html`<option value=${user._id}>${user.name}</option>`)}
                </select>
            </div>
            <input class="btn btn-danger fs-3" type="submit" value="Изтрий" />
        </form>
    `;

    render(deleteTemplate(), container);
}

export async function editEmployeePage() {
    // Get users from Node JS
    let users = await getAllUsers();
    let selectedChange = null,
        lastSelectedChange;

    async function edtUser(e) {
        e.preventDefault();
        // Get selected user
        const formData = new FormData(e.target);
        const newValue = formData.get(selectedChange);
        const _id = formData.get('_id');


        if (_id === null)
            return alert('Избери служител!');
        if (selectedChange === null)
            return alert('Избери какво да промениш!');
        if (!newValue)
            return alert('Въведи нова стойност!');

        const res = await editUser(_id, selectedChange, newValue);

        if (res.status === 200) {// Successfully edited user
            alert(res.data);
            page('/');
        } else if (res.status === 400) {
            alert(res.data);
        }
        else {
            alert('Възникна грешка!');
            console.error(res);
        }
    }

    function showDiv(e) {
        lastSelectedChange = selectedChange;
        selectedChange = $(e.target).val();

        // Show new DIV
        $(`#new${selectedChange}`).toggleClass('d-none');
        $(`#new${selectedChange}`).prop('required', true);

        // Hide old DIV
        if (lastSelectedChange) {
            $(`#new${lastSelectedChange}`).toggleClass('d-none');
            $(`#new${lastSelectedChange}`).prop('required', false);
        }
    }

    const editTemplate = () => html`
        ${backBtn}
        <form autocomplete="off" @submit=${edtUser} class="d-flex text-center fs-3 flex-column m-auto mt-5 gap-5 p-3">
            <div>
                <label class="form-label">1. Избери служител</label>
                <select required class="form-control text-capitalize fs-4" name="_id">
                    <option selected disabled>Избери</option>
                    ${users.map((user) => html`<option value=${user._id}>${user.name}</option>`)}
                </select>
            </div>
        
            <div>
                <label class="form-label">2. Избери какво да промениш</label>
                <select @change=${showDiv} required class="form-control fs-4" name="change">
                    <option selected disabled>Избери</option>
                    <option value="name">Име</option>
                    <option value="pin">ПИН</option>
                    <option value="role">Длъжност</option>
                </select>
            </div>

            <div id="newpin" class="text-center d-none">
                <label class="form-label">3. Въведи нов ПИН (4 цифри)</label>
                <input class="form-control fs-4" name="pin" title="Задължително 4 цифри!" pattern="\\d{4}" maxlength="4" type="text"
                    placeholder="пример: 1234" />
            </div>

            <div id="newname" class="text-center d-none">
                <label class="form-label">3. Въведи ново име</label>
                <input class="form-control fs-4" name="name" type="text" placeholder="пример: Иван" />
            </div>

            <div id="newrole" class="d-flex flex-column gap-2 text-center d-none">
                <label class="form-label">3. Въведи нова длъжност</label>
                <select class="form-control fs-4" name="role">
                    <option selected disabled>Избери</option>
                    <option value="bartender">Барман</option>
                    <option value="waiter">Сервитьор</option>
                </select>
            </div>

            <input class="btn btn-primary fs-3" type="submit" value="Промени" />
        </form>
    `;

    render(editTemplate(), container);
}

export async function createCategoryPage() {
    async function getData(e) {
        e.preventDefault();
        // Get data from form
        const formData = new FormData(e.target);
        const name = formData.get('name');

        const res = await createCategory(name);

        if (res.status === 200) {// Successfully created category
            alert(res.data);
            page('/');
        } else if (res.status === 400) {
            alert(res.data);
        } else {
            alert('Възникна грешка!');
            console.error(res);
        }
    }

    const categoryFields = () => html`
    ${backBtn}
    <form @submit=${getData} class="m-auto mt-5 p-3 text-center fs-3">
        <div class="mb-3">
            <label for="name" class="form-label">Въведи име</label>
            <input required type="text" class="form-control fs-4" name="name" id="name" placeholder="пример: Безалкохолни">
        </div>
        <input type="submit" class="btn btn-primary fs-3 w-100" value="Създай" />
    </form>
`;

    render(categoryFields(), container);
}

export async function deleteCategoryPage() {
    const categories = await getAllCategories();
    async function delCategory(e) {
        e.preventDefault();
        const confirmAction = confirm('ВНИМАНИЕ! Това ще изтрие тази категория и всички продукти в нея! Сигурен ли си че искаш да продължиш?');

        if (!confirmAction) return;
        // Get selected category
        const formData = new FormData(e.target);
        const _id = formData.get('_id');

        if (_id === null)
            return alert('Избери категория!');

        const res = await deleteCategory(_id);

        if (res.status === 200) {// Successfully deleted category
            alert(res.data);
            page('/');
        } else if (res.status === 400) {
            alert(res.data);
        } else {
            alert('Възникна грешка!');
            console.error(res);
        }
    }

    const categoryFields = () => html`
    ${backBtn}
    <form @submit=${delCategory} class="m-auto mt-5 p-3 text-center fs-3">
        <div class="mb-3">
            <label for="selected" class="form-label">Избери категория</label>
            <select required type="text" class="form-control fs-4" name="_id" id="selected">
                <option selected disabled>Избери</option>
                ${categories.map((category) => html`<option value=${category._id}>${category.name}</option>`)}
            </select>
        </div>
        <input type="submit" class="btn btn-danger fs-3 w-100" value="Изтрий" />
    </form>
`;

    render(categoryFields(), container);
}

export async function editCategoryPage() {
    const categories = await getAllCategories();
    async function edCategory(e) {
        e.preventDefault();
        // Get selected category
        const formData = new FormData(e.target);
        const _id = formData.get('_id');
        const name = formData.get('name'); // New name

        if (_id === null)
            return alert('Избери категория!');

        const res = await editCategory(_id, name);

        if (res.status === 200) {// Successfully edited category
            alert(res.data);
            page('/');
        } else if (res.status === 400) {
            alert(res.data);
        } else {
            alert('Възникна грешка!');
            console.error(res);
        }
    }

    const categoryFields = () => html`
    ${backBtn}
    <form @submit=${edCategory} class="m-auto mt-5 p-3 text-center fs-3">
        <div class="mb-3">
            <label for="selected" class="form-label">1. Избери категория</label>
            <select required type="text" class="form-control fs-4" name="_id" id="selected">
                <option selected disabled>Избери</option>
                ${categories.map((category) => html`<option value=${category._id}>${category.name}</option>`)}
            </select>
        </div>
        <div class="mb-3">
            <label for="name" class="form-label">2. Въведи ново име</label>
            <input required type="text" class="form-control fs-4" name="name" id="name" />
        </div>
        <input type="submit" class="btn btn-primary fs-3 w-100" value="Промени" />
    </form>
`;

    render(categoryFields(), container);
}

export async function sortCategoriesPage() {
    const categories = await getAllCategories();
    async function saveOrder() {
        const sortedCategories = sortable.toArray(); // returns array with the 'data-id' attr for sorted categories

        if (sortedCategories === null) return;

        const res = await sortCategories(sortedCategories);

        if (res.status === 200) {// Successfully sorted categories
            alert(res.data);
            page('/');
        } else if (res.status === 400) {
            alert(res.data);
        } else {
            alert('Възникна грешка!');
            console.error(res);
        }
    }

    const reorderDiv = () => html`
        ${backBtn}
        
        <div id="listAndBtn" class="p-3 fs-3 text-center">
            <ul id="categories" style="width: 80%" class="list-group fs-4 text-center mt-4">
                ${categories.map((category) => html`<li class="list-group-item cursor-pointer" data-id=${category._id}>
                    ${category.name}</li>`)}
            </ul>
            <button @click=${saveOrder} class="btn btn-primary mt-3 w-100 fs-3">Запази</button>
        </div>
    `;

    render(reorderDiv(), container);
    // Activate the sorting http://sortablejs.github.io/Sortable/#simple-list
    var list = document.getElementById('categories');
    var sortable = new Sortable(list, {
        animation: 150,
        ghostClass: "active",  // Class name for the drop placeholder
        chosenClass: "list-group-item-action",  // Class name for the chosen item
    })
}

export async function inventoryPage() {
    const categories = await getAllCategories();
    const products = await getAllProductsWithoutIngredients();
    const ingredients = await getAllIngredients();
    const productsAndIngredients = ingredients.concat(products);

    let totals = {
        buyPrice: 0,
        sellPrice: 0,
        difference: 0
    };

    const productRows = (products) => html`
        ${products.map((product) => {
            totals.buyPrice += product.qty * product.buyPrice;
            totals.sellPrice += product.qty * product.sellPrice;
            totals.difference += product.qty * (product.sellPrice - product.buyPrice);
            let qty = product.qty,
                name = product.name,
                unit = 'бр';
                
            if (product.hasOwnProperty('unit') && (product.unit === 'кг' || product.unit === 'л')) {
                qty /= 1000;
                unit = product.unit;
            }

            qty += ` ${unit}.`
            return html`
                <tr class="${qty <= 0 ? 'table-danger' : ''}">
                    <td scope="row">${product.unit ? 'Съставка' : 'Продукт'}</td>
                    <td scope="row">${name}</td>
                    <td>${qty}</td>
                    <td>${product.buyPrice}</td>
                    <td>${product.sellPrice}</td>
                    <td>${(product.sellPrice - product.buyPrice).toFixed(2) }</td>
                </tr>
            `
        })}
        <tr class="table-primary">
            <th colspan="3" class="text-center">Общо: </th>
            <th>${totals.buyPrice.toFixed(2)}</th>
            <th>${totals.sellPrice.toFixed(2)}</th>
            <th>${totals.difference.toFixed(2)}</th>
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
        else 
            productsToShow = await getProductsWithoutIngredientsFromCategory(categoryId);

        if (productsToShow.length === 0)
            return alert('Няма продукти в избраната категория!')
        
        render(productRows(productsToShow), document.querySelector('tbody'));
    }
    
    const inventoryTemplate = () => html`
        ${backBtn}
        
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
                    <th scope="col">Продажна цена</th>
                    <th scope="col">Цена разлика</th>
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

export async function reportsPage() {
    let allScrapped = await getAllReports();
    let allProducts = [];
    let total = 0,
        income = 0,
        remaining = 0,
        scrapped = 0,
        consumed = 0;

    const reportsRows = (reports) => html`
        ${reports.map((report) => {
            const date = new Date(report.when);
            const dateString = `${date.getDate() > 9 ? date.getDate() : '0' + date.getDate()}.${(date.getMonth() + 1) > 9 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)}.${date.getFullYear()}`;
            const timeString = `${date.getHours() > 9 ? date.getHours() : '0' + date.getHours()}:${date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes()}`;
            income += report.income;
            remaining += report.remaining;
            consumed += report.consumed;
            scrapped += report.scrapped;            
            total += report.income + report.remaining - report.consumed - report.scrapped;
        

            return html`
                <tr>
                    <td scope="row">${dateString}</td>
                    <td scope="row">${timeString}</td>
                    <td scope="row" class="text-capitalize">${report.user.name}</td>
                    <td scope="row">${report.income}</td>
                    <td scope="row">${report.remaining}</td>
                    <td scope="row">${report.scrapped}</td>
                    <td scope="row">${report.consumed}</td>
                    <td scope="row">${report.total}</td>
                </tr>`
        })}

        <tr class="table-primary fw-bold">
            <td scope="row" colspan="3">Общо:</td>
            <td scope="row">${income.toFixed(2)}</td>
            <td scope="row">${remaining.toFixed(2)}</td>
            <td scope="row">${scrapped.toFixed(2)}</td>
            <td scope="row">${consumed.toFixed(2)}</td>
            <td scope="row">${total.toFixed(2)}</td>
        </tr>
    `;
    
    const reportsTemplate = () => html`
        ${backBtn}
    
        <table class="mt-3 table table-striped table-dark table-hover text-center">
            <thead>
                <tr>
                    <th scope="col">Дата</th>
                    <th scope="col">Час</th>
                    <th scope="col">Служител</th>
                    <th scope="col">Продажби</th>
                    <th scope="col">Неплатени</th>
                    <th scope="col">Брак</th>
                    <th scope="col">Консумация</th>
                    <th scope="col">Общ приход</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    `;

    render(reportsTemplate(), container);
    
    // Render all scrapped products
    render(reportsRows(allScrapped), document.querySelector('tbody'));
}

export async function scrappedPage() {
    let allScrapped = await getAllScrapped();

    async function markAsScrapedHstr(e) {
        const _id = e.target.getAttribute('_id'); // history id

        const res = await markHistoryAsScrapped(_id);

        if (res.status === 200) {
            // Rerender histories
            allScrapped = res.data;
            console.log(allScrapped);
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
                <td><button @click=${markAsScrapedHstr} class="btn btn-danger" _id=${history._id}>Бракувай</button></td>
            </tr>`
        })}
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

export async function expireProductsPage() {
    const products = await getAllRestockedProducts();
    console.log(products);
    
    const expireTemplate = (products) => html`
        ${backBtn}
    
        <table class="mt-3 table table-striped table-dark table-hover text-center">
            <thead>
                <tr>
                    <th scope="col">Дата на зареждане</th>
                    <th scope="col">Артикул</th>
                    <th scope="col">Количество</th>
                    <th scope="col">Срок на годност</th>
                </tr>
            </thead>
            <tbody>
                ${products.map((product) => {
                        let qty = product.product.qty,
                            name = product.product.name,
                            restockDate = new Date(product.when),
                            expireDate,
                            unit = 'бр';

                        if (product.product.expireDate) {
                            expireDate = new Date(product.product.expireDate);
                            expireDate = `${expireDate.getDate() < 10 ? '0' + expireDate.getDate() : expireDate.getDate()}.${(expireDate.getMonth() + 1) < 10 ? '0' + (expireDate.getMonth() + 1) : (expireDate.getMonth() + 1)}.${expireDate.getFullYear()}`;
                        }
                        restockDate = `${restockDate.getDate() < 10 ? '0' + restockDate.getDate() : restockDate.getDate()}.${(restockDate.getMonth() + 1) < 10 ? '0' + (restockDate.getMonth() + 1) : (restockDate.getMonth() + 1)}.${restockDate.getFullYear()}`;
                        
                        if (product.product.hasOwnProperty('unit') && (product.product.unit === 'кг' || product.product.unit === 'л')) {
                            qty /= 1000;
                            unit = product.product.unit;
                        }

                        qty += ` ${unit}.`
                        return html`
                            <tr>
                                <td>${restockDate}</td>
                                <td>${name}</td>
                                <td>${qty}</td>
                                <td>${expireDate}</td>
                            </tr>
                        `
                })}
            </tbody>
        </table>
    `;

    render(expireTemplate(products), container);
}

export function showAdminDashboard() {
    const dashboard = () => html`
        <div class="p-3">
            <div class="text-center mt-4">
                <h1>Специални</h1>
                <div class="d-inline-flex flex-row flex-wrap gap-3 justify-content-center">
                    <button @click=${() => page('/admin/inventory/scrapped') } class="btn btn-danger fs-4">Бракувана стока</button>
                    <button @click=${() => page('/admin/expireProducts') } class="btn btn-primary fs-4">Срок на годност</button>
                    <button @click=${() => page('/admin/inventory') } class="btn btn-secondary fs-4">Склад</button>
                    <button @click=${() => page('/admin/reports') } class="btn btn-secondary fs-4">Отчети</button>
                </div>
            </div>
            <div class="text-center mt-4">
                <h1>Стока</h1>
                <div class="d-inline-flex flex-row flex-wrap gap-3 justify-content-center">
                    <button @click=${() => page('/admin/product/addQty') } class="btn btn-primary fs-4">Зареди</button>
                    <button @click=${() => page('/admin/product/removeQty')} class="btn btn-danger fs-4">Бракувай</button>
                    <div class="d-inline-flex flex-row flex-wrap gap-3 justify-content-center">
                        <button @click=${() => page('/admin/product/create') } class="btn btn-success fs-4">Създай</button>
                        <button @click=${() => page('/admin/product/delete') } class="btn btn-danger fs-4">Изтрий</button>
                        <button @click=${() => page('/admin/product/edit') } class="btn btn-secondary fs-4">Редактирай</button>
                        <button @click=${() => page('/admin/product/reorder') } class="btn btn-secondary fs-4">Подреди</button>
                    </div>
                </div>
            </div>
            <div class="text-center mt-4">
                <h1>Категории</h1>
                <div class="d-inline-flex flex-row flex-wrap gap-3 justify-content-center">
                    <button @click=${() => page('/admin/category/create')} class="btn btn-success fs-4">Създай</button>
                    <button @click=${() => page('/admin/category/delete') } class="btn btn-danger fs-4">Изтрий</button>
                    <button @click=${() => page('/admin/category/edit') } class="btn btn-secondary fs-4">Редактирай</button>
                    <button @click=${() => page('/admin/category/reorder') } class="btn btn-secondary fs-4">Подреди</button>
                </div>
            </div>
            <div class="text-center mt-4">
                <h1>Служители</h1>
                <div class="d-inline-flex flex-row flex-wrap gap-3 justify-content-center">
                    <button @click=${() => page('/admin/employee/create') } class="btn btn-success fs-4">Създай</button>
                    <button @click=${() => page('/admin/employee/delete') } class="btn btn-danger fs-4">Изтрий</button>
                    <button @click=${() => page('/admin/employee/edit') } class="btn btn-secondary fs-4">Редактирай</button>
                </div>
            </div>
            <div class="d-flex mt-5 flex-row flex-wrap gap-3 justify-content-end">
                <button @click=${() => page('/waiter')} class="btn btn-secondary fs-4">Маси</button>
                <button @click=${() => page('/bartender')} class="btn btn-secondary fs-4">Поръчки</button>
                <button @click=${logout} class="btn btn-danger fs-4">Изход</button>
            </div>
        </div>
    `;

    render(dashboard(), container);
} 