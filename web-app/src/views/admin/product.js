import { backBtn } from "./admin.js";
import { container } from "../../app.js";
import { auth } from "../api/api.js";
import page from 'page';
import $ from 'jquery';
import { html, render } from 'lit/html.js';
import axios from 'axios';
import Sortable from 'sortablejs';
import { getAllCategories } from "./category.js";

// FUNCTIONS

export async function getAllIngredients() {
    const res = await axios.get('/getAllIngredients');
    return res.data;
}

export async function getAllProducts() {
    const res = await axios.get('/getAllProducts');
    return res.data;
}

let addedIngredients = [],
    contentType;
let selectedProductFromSearch, selectedIngredientFromSearch;

const prIngInputs = (prOrIng, categories, type) => html`
    <div class="mb-3">
        <label for="name" class="form-label">Име</label>
        <input required type="text" class="form-control fs-4" value=${prOrIng ? prOrIng.name : ''} name="name" id="name" placeholder="пример: Бира">
    </div>
    ${(prOrIng && prOrIng.unit) || type === 'ingredient'
        ? html`
            <div class="mb-3">
                <label for="unit" class="form-label">Мерна единица</label>
                <select required class="form-control fs-4" name="unit" id="unit">
                    <option ?selected=${!prOrIng} disabled>Избери</option>
                    <option ?selected=${prOrIng ? (prOrIng.unit === 'кг') : false} value="кг">килограм</option>
                    <option ?selected=${prOrIng ? (prOrIng.unit === 'л') : false} value="л">литър</option>
                    <option ?selected=${prOrIng ? (prOrIng.unit === 'бр') : false} value="бр">брой</option>
                </select>
            </div>
        `
        : ''
    }
    ${type !== 'productFromIngredients'
        ? html`
            <div class="mb-3">
                <label for="qty" class="form-label">Количество</label>
                <input required type="number" min=${type === 'ingredient' ? '' : 1} step=${type === 'ingredient' ? 0.000005 : ''} value=${prOrIng ? (type === 'ingredient' && ['кг', 'л'].includes(prOrIng.unit) ? prOrIng.qty / 1000 : prOrIng.qty) : ''} class="form-control fs-4" name="qty" id="qty" placeholder="пример: 50">
            </div>
        `
        : ''
    }
    ${type !== 'productFromIngredients'
        ? html`<div class="mb-3">
                <label for="buyPrice" class="form-label">Доставна цена</label>
                <input required type="text" title="пример: 5.20, 5.0, 5, 0.5, 0.50" value=${prOrIng ? prOrIng.buyPrice : ''} pattern="^\\d{1,}(\\.\\d{1,2})?$" class="form-control fs-4" name="buyPrice" id="buyPrice" placeholder="пример: 1.50">
            </div> 
        `
        : ''
    }
    
    ${type !== 'ingredient'
        ? html`<div class="mb-3">
                    <label for="sellPrice" class="form-label">Продажна цена</label>
                    <input required type="text" title="пример: 5.20, 5.0, 5, 0.5, 0.50" value=${prOrIng ? prOrIng.sellPrice : ''} pattern="^\\d{1,}(\\.\\d{1,2})?$" class="form-control fs-4" name="sellPrice" id="sellPrice" placeholder="пример: 2">
                </div>
        `
        : ''
    }
    
    ${categories || ['product', 'productFromIngredients'].includes(type) ?
        html`
            <div class="mb-3">
                <label for="pr-categoryId" class="form-label">Категория</label>
                <select required type="text" class="form-control fs-4" name="pr-categoryId" id="pr-categoryId">
                    <option selected disabled>Избери</option>
                    ${categories.map((category) => html`<option value=${category._id}>${category.name}</option>`)}
                </select>
            </div>
        `
        : ''
    }
    ${['product', 'productFromIngredients'].includes(type)
        ? html`
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
        `
        : ''
    }

    ${type === 'productFromIngredients'
        ? html`
            <div class="mb-5 pt-3" id="ingredients">
                <label class="form-label fs-3">Избери съставки</label>
                <div id="selectedIngredients"></div>
                <button type="button" class="btn btn-success fs-3" data-bs-toggle="modal" data-bs-target="#addIngredientModal">Добави съставка</button>
            </div>
        `
        : ''
    }
`;

const addIngredientModal = (ingredients) => html`
        <div class="modal fade" id="addIngredientModal" tabindex="-1" aria-labelledby="addIngredientModal" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-fullscreen-sm-down modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title fs-4" id="exampleModalLabel">Добави съставка</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body fs-4 text-center">
                        <div class="mb-3">
                            <label for="ingredientSearch" class="form-label">Търси</label>
                            <input @change=${selectIngredientFromSearch} class="form-control fs-4" type="text" list="allingredients" name="ingredientSearch" id="ingredientSearch">
                            <datalist id="allingredients">
                                ${ingredients.map(el => {
    return html`<option type="ingredients" unit=${el.unit} _id=${el._id} name=${el.name} value=${el.name + ` (${el.unit})`} />`
})}
                            </datalist>
                        </div>
                        <div class="mb-3">
                            <label for="ingredientSelect" class="form-label">или избери</label>
                            <select type="text" class="form-control fs-4" name="ingredientSelect" id="ingredientSelect">
                                <option selected disabled>Избери</option>
                                ${ingredients.map((ingredient) => html`<option value=${ingredient._id}>${ingredient.name}</option>`)}
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary fs-4" data-bs-dismiss="modal">Затвори</button>
                        <button @click=${addIngredient} type="button" data-bs-dismiss="modal" class="btn btn-primary fs-4">Добави</button>
                    </div>
                </div>
            </div>
        </div>
`;

function selectIngredientFromSearch(e) {
    const selected = e.target.value;

    if (!selected) return;

    const _id = $(`datalist option[value="${selected}"]`).attr('_id');

    if (!_id)
        return $('#quantityDiv').addClass('d-none');

    selectedIngredientFromSearch = {
        _id,
        name: selected
    };

    showDivs();
}

const ingredientsTemplate = () => html`
        ${addedIngredients.map(ingredient => {
    return html`
                    <div class="mb-3">
                        <label for=${ingredient._id} class="form-label">${ingredient.name}</label>
                        <input type="number" value=${ingredient.qty} class="form-control fs-4" name="ingredients" id=${ingredient._id} placeholder="пример: 50">
                    </div>
                `;
})
    }
`;

function showDivs() {
    $('#expireDateDiv').removeClass('d-none');
    $('#quantityDiv').removeClass('d-none');
}

function addIngredient() {
    let ingredient = {};
    const fromSelect = {
        _id: $('#ingredientSelect').val(),
        name: $('#ingredientSelect option:selected').text(),
    }

    if (!fromSelect._id && !selectedIngredientFromSearch)
        return alert('Избери съставка!');

    if (fromSelect._id) {
        ingredient._id = fromSelect._id;
        ingredient.name = fromSelect.name;
    } else {
        ingredient._id = selectedIngredientFromSearch._id;
        ingredient.name = selectedIngredientFromSearch.name;
    }

    // Check if already added to ingredients
    for (let el of addedIngredients) {
        if (el._id === ingredient._id) {
            return alert('Съставката вече е добавена!');
        }
    }

    addedIngredients.push(ingredient);

    // Rerender    
    render(ingredientsTemplate(), document.getElementById('selectedIngredients'));
}

async function createProduct(name, qty, selectedIngredients, buyPrice, sellPrice, categoryId, forBartender) {
    return await axios.post('/createProduct', {
        name,
        qty,
        ingredients: selectedIngredients,
        buyPrice,
        sellPrice,
        categoryId,
        forBartender
    }).catch((err) => {
        return err.response;
    });
}

async function deleteIngredient(_id) {
    return await axios.post('/deleteIngredient', {
        _id
    }).catch((err) => {
        return err.response;
    });
}

async function deleteProduct(_id) {
    return await axios.post('/deleteProduct', {
        _id
    }).catch((err) => {
        return err.response;
    });
}

export function selectProductFromSearch(e) {
    const selected = e.target.value;

    if (!selected) return;

    const _id = $(`datalist option[value="${selected}"]`).attr('_id');
    const name = $('#productSearch').val();
    const type = $(`datalist option[value="${selected}"]`).attr('type');
    const unit = $(`datalist option[value="${selected}"]`).attr('unit');
    const nameWithoutUnit = name.split(` (${unit}`)[0];


    if (!_id) {
        $('#quantityDiv').addClass('d-none');
        return;
    }

    showDivs();

    return {
        _id,
        name,
        nameWithoutUnit,
        type,
        unit
    };
}

async function editIngredient(_id, name, unit, qty, buyPrice, sellPrice) {
    return await axios.post('/editIngredient', {
        _id,
        name,
        unit,
        qty,
        buyPrice,
        sellPrice
    }).catch((err) => {
        return err.response;
    });
}

async function editProduct(_id, name, qty, selectedIngredients, buyPrice, sellPrice, categoryId, forBartender) {
    return await axios.post('/editProduct', {
        _id,
        name,
        qty,
        ingredients: selectedIngredients,
        buyPrice,
        sellPrice,
        categoryId,
        forBartender
    }).catch((err) => {
        return err.response;
    });
}

async function getProductById(_id) {
    return await axios.post('/getProductById', {
        _id
    }).catch((err) => {
        return err.response;
    });
}

async function loadProducts(e, showProductsFromIngredients) {
    selectedProductFromSearch = undefined;
    selectedIngredientFromSearch = undefined;

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
        const res = await getProductsFromCategory(categoryId);


        if (res.status === 200) {
            contentType = 'product';
            let productsWithoutIngredients = [];

            if (showProductsFromIngredients === false) {
                for (let product of res.data) {
                    if (product.hasOwnProperty('qty'))
                        productsWithoutIngredients.push(product);
                }

                contentToRender = productsWithoutIngredients;
            }
            else
                contentToRender = res.data;
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

async function getProductsIngredients(_id) {
    return await axios.post('/getProductsIngredients', {
        _id
    }).catch((err) => {
        return err.response;
    });
}

async function getIngredientById(_id) {
    return await axios.post('/getIngredientById', {
        _id
    }).catch((err) => {
        return err.response;
    });
}

async function sortProducts(products) {
    return await axios.post('/sortProducts', {
        products
    }).catch((err) => {
        return err.response;
    });
}

export async function getProductsFromCategory(_id) {
    return await axios.post('/getProductsFromCategory', {
        _id
    }).catch((err) => {
        return err.response;
    });
}

export async function getAllProductsWithoutIngredients() {
    const res = await axios.get('/getAllProductsWithoutIngredients');
    return res.data;
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

async function scrapRestockIngredient(_id, qty, action, expireDate) {
    return await axios.post('/scrapRestockIngredient', {
        _id,
        qty,
        action,
        expireDate
    }).catch((err) => {
        return err.response;
    });
}

async function markExpiredAsReviewed(_id) {
    return await axios.post('/markExpiredAsReviewed', {
        _id
    }).catch((err) => {
        return err.response;
    });
}

// PAGES

async function createProductPage() {
    const categories = await getAllCategories(); // CHANGE TO TRUE WHEN READY FOR ADDONS
    const ingredients = await getAllIngredients();
    addedIngredients = [];

    async function createPrdct(e) {
        e.preventDefault();

        // Get data from form
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const qty = +formData.get('qty');
        const buyPrice = +formData.get('buyPrice');
        const sellPrice = +formData.get('sellPrice');
        const categoryId = formData.get('pr-categoryId');
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
        const categoryId = formData.get('pr-categoryId');
        const forBartender = formData.get('forBartender') || false;
        const allIngredients = document.querySelectorAll('input[name="ingredients"]');
        let selectedIngredients = [];

        for (let ingredient of allIngredients) {
            if (ingredient.value) {
                selectedIngredients.push({
                    ingredient: ingredient.id,
                    qty: +ingredient.value
                });
            }
        }

        if (categoryId === null)
            return alert('Избери категория!');

        if (!selectedIngredients.length) // if no ingredients selected
            return alert('Добави поне една съставка!');

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

        const res = await axios.post('/createIngredient', {
            name,
            unit,
            qty,
            buyPrice
        }).catch((err) => {
            return err.response;
        });

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
        ${prIngInputs(undefined, categories, 'product')}
        <input type="submit" class="btn btn-primary fs-3 w-100" value="Създай"/>
    </form>
    `;

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
        ${prIngInputs(undefined, undefined, 'ingredient')}
        <input type="submit" class="btn btn-primary fs-3 w-100" value="Създай" />
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
        ${prIngInputs(undefined, categories, 'productFromIngredients')}
        <input type="submit" class="btn btn-primary fs-3 w-100" value="Създай" />
    </form>
    ${addIngredientModal(ingredients)}
    `;

    render(typeSelect(), container);
}

async function deleteProductPage() {
    selectedIngredientFromSearch = undefined;
    selectedProductFromSearch = undefined;
    const categories = await getAllCategories();
    const allProducts = await getAllProducts();
    const allIngredients = await getAllIngredients();

    async function delProduct(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        let _id,
            selectedCategory;

        // Check if selected using select or search
        if (selectedProductFromSearch) {
            _id = selectedProductFromSearch._id;
            selectedCategory = selectedProductFromSearch.type;
        } else {
            _id = formData.get('_id');
            selectedCategory = formData.get('categoryId');
        }

        if (_id === null)
            return alert('Избери продукт!');

        let res;
        if (selectedCategory === 'ingredients')
            res = await deleteIngredient(_id);
        else
            res = await deleteProduct(_id);

        if (res.status === 200) {// Successfully deleted product/ingredient
            //TODO EMIT HERE 'product:deleted' and implement it everywhere
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
                <label for="productSearch" class="form-label">Търси</label>
                <input @change=${selectedProductFromSearch = selectProductFromSearch} class="form-control fs-4" type="text" list="allproducts" name="productSearch" id="productSearch">
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
                <label for="categoryId" class="form-label">или избери категория</label>
                <select @change=${loadProducts} required type="text" class="form-control fs-4" name="categoryId" id="categoryId">
                    <option selected disabled>Избери</option>
                    <option value="ingredients">Съставки</option>
                    ${categories.map((category) => {
        if (category.hasOwnProperty('parent')) // if it has a parent, it means its a subcategory (child)
            return html`<option value=${category._id}>${category.name}</option>`

        return html`<option value=${category._id}>${category.name}</option>`
    })}
                </select>
            </div>
            <div class="mb-3 d-none" id="product">
                <label for="_id" class="form-label">Избери продукт</label>
                <select required type="text" class="form-control fs-4" name="_id" id="_id">
                    <option selected disabled>Избери</option>
                </select>
            </div>
            <input class="btn btn-danger fs-3" type="submit" value="Изтрий" />
        </form>
    `;

    render(deleteTemplate(), container);
}

async function editProductPage(ctx) {
    const categories = await getAllCategories(true);
    const allProducts = await getAllProducts();
    const allIngredients = await getAllIngredients();
    addedIngredients = [];
    selectedIngredientFromSearch = undefined;
    selectedProductFromSearch = undefined;

    async function edtProduct(e) {
        e.preventDefault();
        // Get data from form
        const formData = new FormData(e.target);
        let _id;
        const name = formData.get('name');
        const unit = formData.get('unit');
        let qty = formData.get('qty');
        const buyPrice = +formData.get('buyPrice');
        const sellPrice = +formData.get('sellPrice');
        const allIngredients = document.querySelectorAll('input[name="ingredients"]');

        if (selectedProductFromSearch)
            _id = selectedProductFromSearch._id;
        else
            _id = formData.get('_id');

        let res;

        if (contentType === 'ingredient') {
            qty = +qty;

            if (unit === undefined || unit === 'Избери')
                return alert('Избери мерна единица!')

            res = await editIngredient(_id, name, unit, qty, buyPrice, sellPrice)
        } else {
            const categoryId = formData.get('pr-categoryId');
            const forBartender = formData.get('forBartender') || false;
            let selectedIngredients;


            if (categoryId === null)
                return alert('Избери категория!');

            if (qty) // simple product
                qty = +qty;
            else { // product from ingredients
                selectedIngredients = [];
                for (let ingredient of allIngredients) {
                    if (ingredient.value) {
                        selectedIngredients.push({
                            ingredient: ingredient.id,
                            qty: +ingredient.value
                        });
                    }
                }

                if (!selectedIngredients.length) // if no ingredients selected
                    return alert('Избери поне една съставка!');
            }

            res = await editProduct(_id, name, qty, selectedIngredients, buyPrice, sellPrice, categoryId, forBartender);
        }

        if (res.status === 200) {// Successfully edited product/ingredient
            selectedIngredientFromSearch = undefined;
            selectedProductFromSearch = undefined;

            alert(res.data);
            page('/');
            page(ctx.path); // redirect back here
        } else if (res.status === 400) {
            alert(res.data);
        } else {
            alert('Възникна грешка!');
            console.error(res);
        }
    }

    async function loadProductInfo(e) {
        let _id;

        if (e.target.id === 'productSearch') {
            _id = $(`datalist option[value="${e.target.value}"]`).attr('_id');
            contentType = $(`datalist option[value="${e.target.value}"]`).attr('type') === 'ingredients' ? 'ingredient' : 'product';
            selectedProductFromSearch = {
                _id
            }
        }
        else
            _id = e.target.value;

        $('#product-info').removeClass('d-none');

        if (_id === null || _id === 'Избери')
            return alert('Избери категория!');

        if (contentType === 'ingredient') {
            const res = await getIngredientById(_id);
            const ingredient = res.data;

            render(prIngInputs(ingredient, undefined, 'ingredient'), document.getElementById('product-info'))
        }
        else {
            const res = await getProductById(_id);
            if (res.status === 200) {
                const product = res.data;

                // Check if product is made of ingredients or if its simple product
                if (product.ingredients.length) {
                    // Render product first
                    render(prIngInputs(product, categories, 'productFromIngredients'), document.getElementById('product-info'));

                    // Get products ingredients ids, names and qty
                    const res = await getProductsIngredients(_id);

                    if (res.status === 200) {
                        const ingredients = res.data;

                        addedIngredients = [];
                        for (let ingredient of ingredients)
                            addedIngredients.push({ _id: ingredient.ingredient._id, name: ingredient.ingredient.name, qty: ingredient.qty });

                        // Render ingredients
                        render(ingredientsTemplate(), document.getElementById('selectedIngredients'));
                    } else {
                        console.error(res);
                        return alert('Възникна грешка!');
                    }
                }
                else
                    render(prIngInputs(product, categories, 'product'), document.getElementById('product-info'));

                $('#forBartender').attr('checked', product.forBartender);
                $('#pr-categoryId').val(product.category);
            }
        }
    }

    const formTemplate = () => html`
    ${backBtn}
    <form @submit=${edtProduct} class="m-auto p-3 text-center fs-3">
        <div class="mb-3">
                <label for="productSearch" class="form-label">Търси</label>
                <input @change=${loadProductInfo} class="form-control fs-4" type="text" list="allproducts" name="productSearch" id="productSearch">
                <datalist id="allproducts">
                    ${allIngredients.map(el => {
        return html`<option type="ingredients" _id=${el._id} value=${el.name + ` (${el.unit})`} />`
    })}
                    ${allProducts.map(el => {
        return html`<option type="product" _id=${el._id} value=${el.name}/>`
    })}
                </datalist>
        </div>

        <div class="mb-3">
            <label for="categoryId" class="form-label">или избери категория</label>
            <select @change=${(e) => loadProducts(e, true)} required type="text" class="form-control fs-4" name="categoryId" id="categoryId">
                <option selected disabled>Избери</option>
                <option value="ingredients">Съставки</option>
                ${categories.map((category) => html`<option value=${category._id}>${category.name}</option>`)}
            </select>
        </div>

        <div class="mb-3 d-none" id="product">
            <label for="_id" class="form-label">Избери продукт</label>
            <select @change=${loadProductInfo} required type="text" class="form-control fs-4" name="_id" id="_id">
                <option selected disabled>Избери</option>
            </select>
        </div>

        <div id="product-info" class="mb-3 d-none"></div>
        ${addIngredientModal(allIngredients)}
        <input type="submit" class="btn btn-primary mt-3 fs-3 w-100" value="Промени"/>
    </form>
    `;

    render(formTemplate(), container);
}

async function sortProductsPage() {
    const categories = await getAllCategories(true);

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

        const res = await getProductsFromCategory(_id);
        const products = res.data;



        render(productsTemplate(products), document.getElementById('products'));// render all products in sorting div
    }

    const productsTemplate = (products) => html`
        ${products.map((product) => html`<li class="list-group-item cursor-pointer" data-id=${product._id}>${product.name}</li>
        `)}
    `;

    const reorderDiv = () => html`
        ${backBtn}

        <div class="mt-3 fs-4 text-center">
            <label for="categoryId" class="form-label">Избери категория</label>
            <select @change=${getProducts} required type="text" class="form-control fs-4" name="categoryId" id="categoryId">
                <option selected disabled>Избери</option>
                ${categories.map((category) => {
        if (category.hasOwnProperty('parent')) // if it has a parent, it means its a subcategory (child)
            return html`<option value=${category._id}>${category.name}</option>`

        return html`<option value=${category._id}>${category.name}</option>`
    })}
            </select>
        </div>

        <div id="listAndBtn" class="mt-3 p-3 fs-3 text-center">
            <ul id="products" style="width: 80%" class="list-group fs-4 text-center mt-4">
                
            </ul>
            <button @click=${saveOrder} class="btn btn-primary mt-5 w-100 fs-3">Запази</button>
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

async function scrapRestockProductPage(ctx) {
    // Check if coming for restock or scrapping
    const action = ctx.path.includes('restock') ? 'restock' : 'scrap';
    const categories = await getAllCategories(true);
    const allProducts = await getAllProductsWithoutIngredients();
    const allIngredients = await getAllIngredients();

    async function scrapRestock(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        let qty = +formData.get('qty'),
            expireDate = formData.get('expireDate'),
            selectedCategory,
            _id;

        // Check if selected using select or search
        if (selectedProductFromSearch) {
            _id = selectedProductFromSearch._id;
            selectedCategory = selectedProductFromSearch.type;
        } else {
            _id = formData.get('_id');
            selectedCategory = formData.get('categoryId');
        }

        if (_id === null)
            return alert('Избери продукт!');
        if (qty === null)
            return alert('Въведи количество!');

        let res;

        if (selectedCategory === 'ingredients')
            res = await scrapRestockIngredient(_id, qty, action, expireDate);
        else
            res = await scrapRestockProduct(_id, qty, action, expireDate);

        if (res.status === 200) {// Successfully added qty to product
            alert(res.data);

            // Clear all inputs and hide divs
            $('#product').addClass('d-none');
            $('#quantityDiv').addClass('d-none');
            $('#expireDateDiv').addClass('d-none');

            $('#productSearch').val(''); // Clear search input
            $('#qty').val(''); // Clear qty input
            $('#expireDate').val(''); // Clear expire date input

            if (!selectedProductFromSearch) {
                $('#categoryId').val('Избери'); // Clear category select
                $('#_id').val('Избери'); // Clear product select
            }

            selectedProductFromSearch = undefined;
        }
        else if (res.status === 400)
            alert(res.data);
        else {
            alert('Възникна грешка!');
            console.error(res);
        }
    }

    const template = () => html`
        ${backBtn}
        <form @submit=${scrapRestock} class="d-flex text-center fs-3 flex-column m-auto mt-5 gap-5 p-3">
            <div class="mb-3 p-3">
                <label for="productSearch" class="form-label">Търси</label>
                <input @change=${selectedProductFromSearch = selectProductFromSearch} class="form-control fs-4" type="text" list="allproducts" name="productSearch" id="productSearch">
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
                <label for="categoryId" class="form-label">или избери категория</label>
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
                <label for="qty" class="form-label">Количество</label>
                <input required type="number" step="0.000005" class="form-control fs-4" name="qty" id="qty" placeholder="пример: 50">
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
            ${action === 'restock'
            ? html`
            <div class="mb-3 d-none" id="expireDateDiv">
                <label for="expireDate" class="form-label">Дата</label>
                <input name="expireDate" class="form-control fs-4" id="expireDate" type="date"/>
            </div>
            <input class="btn btn-primary fs-3" type="submit" value="Зареди" />`
            : html`<input class="btn btn-danger fs-3" type="submit" value="Бракувай" />`
        }
            
        </form>
    `;

    render(template(), container);
}

async function expireProductsPage() {
    const res = await axios.get('/getAllRestockedProducts');
    const products = res.data;

    async function markAsReviewed(_id) {
        const res = await markExpiredAsReviewed(_id);

        if (res.status === 200) {
            // Successfuly marked as reviewed
            $(`#${_id} .expiredBtnCell`).html('');
            $(`#${_id} .expiredDateCell`).removeClass('table-danger');
        } else {
            console.error(res);
            alert('Възникна грешка!');
        }
    }

    const expireTemplate = (products) => html`
        ${backBtn}

<table class="mt-3 table table-striped table-dark table-hover text-center">
    <thead>
        <tr>
            <th scope="col">Дата на зареждане</th>
            <th scope="col">Артикул</th>
            <th scope="col">Количество</th>
            <th scope="col">Срок на годност</th>
            <th></th>
        </tr>
    </thead>
    <tbody>
        ${products.map((product) => {
        let qty = product.product.qty,
            name = product.product.name,
            restockDate = new Date(product.when),
            expireDate = new Date(product.product.expireDate),
            unit = 'бр',
            today = new Date(),
            expired = false;

        expireDate = `${expireDate.getDate() < 10 ? '0' + expireDate.getDate() : expireDate.getDate()}.${(expireDate.getMonth() + 1) < 10 ? '0' + (expireDate.getMonth() + 1) : (expireDate.getMonth() + 1)}.${expireDate.getFullYear()}`;
        restockDate = `${restockDate.getDate() < 10 ? '0' + restockDate.getDate() : restockDate.getDate()}.${(restockDate.getMonth() + 1) < 10 ? '0' + (restockDate.getMonth() + 1) : (restockDate.getMonth() + 1)}.${restockDate.getFullYear()}`;

        if (today > new Date(product.product.expireDate) && product.reviewed === false)
            expired = true;

        if (product.product.hasOwnProperty('unit') && (product.product.unit === 'кг' || product.product.unit === 'л')) {
            qty /= 1000;
            unit = product.product.unit;
        }

        qty += ` ${unit}.`
        return html`
                            <tr id=${product._id} valign="middle">
                                <td>${restockDate}</td>
                                <td>${name}</td>
                                <td>${qty}</td>
                                <td class="expiredDateCell ${expired && 'table-danger'}">${expireDate}</td>
                                <td class="expiredBtnCell">${expired ?
                html`<button @click=${() => markAsReviewed(product._id)} class="btn btn-info fs-5">OK</button>` : ''}</td>
                            </tr>
                        `
    })}
    </tbody>
</table>
`;

    render(expireTemplate(products), container);
}

export function productPages() {
    page('/admin/product/scrap', auth, scrapRestockProductPage);
    page('/admin/product/restock', auth, scrapRestockProductPage);
    page('/admin/product/create', auth, createProductPage);
    page('/admin/product/delete', auth, deleteProductPage);
    page('/admin/product/edit', auth, editProductPage);
    page('/admin/product/reorder', auth, sortProductsPage);
    page('/admin/product/expired', auth, expireProductsPage);
}