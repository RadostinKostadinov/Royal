import page from 'page';
import { container } from "../app";
import { html, render } from 'lit/html.js';
import $ from "jquery";
import Sortable from 'sortablejs';
import { sortCategories, getProductById, getCategoryById, getAllUsers, editCategory, deleteCategory, deleteUser, createUser, editUser, createCategory, changeQtyProduct, createProduct, deleteProduct, editProduct, getAllCategories, getAllProducts } from '../api';
const backBtn = html`<button @click=${()=> page('/admin')} class="btn btn-secondary fs-3 mt-2 ms-2">Назад</button>`;

async function loadProducts(e) {
    // e.preventDefault();
    // Get selected category
    const categoryId = e.target.value;
    
    if (categoryId === null || categoryId === 'Избери') return;

    // Get category and render products as options
    const res = await getCategoryById(categoryId);
    let category;
    if (res.status === 200) {
        category = res.data;
    } else if (res.status === 400) {
        alert(res.data);
    } else {
        alert('Възникна грешка!');
        console.error(res);
    }

    if (!category.products.length)
        return alert('Няма продукти в тази категория');

    let products = [];
    for (let product of category.products)
        products.push(html`<option value=${product._id}>${product.name}</option>`)

    render(products, document.getElementById('_id'));

    $('#_id').val('Избери'); // Set the selected option to 'Izberi', because it doesnt do it when u render

    // Show div
    $('#product').removeClass('d-none');

    // This is for editProductPage
    // Hide product info div
    $('#product-info').addClass('d-none');
}

export async function removeQtyProductPage() {
    const categories = await getAllCategories();
    async function remQty(e) {
        e.preventDefault();
        // Get data from form
        const formData = new FormData(e.target);
        const _id = formData.get('_id');
        const qty = +formData.get('qty');
        const action = 'remove'; // remove from current qty

        if (_id === null)
            return alert('Избери продукт!');
        if (qty === null)
            return alert('Въведи количество!');

        const res = await changeQtyProduct(_id, qty, action);

        if (res.status === 200) {// Successfully removed qty from product
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
            <div class="mb-3">
                <label for="categoryId" class="form-label">1. Избери категория</label>
                <select @change=${loadProducts} required type="text" class="form-control fs-4" name="categoryId" id="categoryId">
                    <option selected disabled>Избери</option>
                    ${categories.map((category) => html`<option value=${category._id}>${category.name}</option>`)}
                </select>
            </div>
            <div class="mb-3 d-none" id="product">
                <label for="_id" class="form-label">2. Избери продукт</label>
                <select @change=${() => $('#quantityDiv').removeClass('d-none')} required type="text" class="form-control fs-4" name="_id" id="_id">
                    <option selected disabled>Избери</option>
                </select>
            </div>
            <div class="mb-3 d-none" id="quantityDiv">
                <label for="qty" class="form-label">3. Бракувай количество</label>
                <input required type="number" min="1" class="form-control fs-4" name="qty" id="qty" placeholder="пример: 50">
            </div>
            <input class="btn btn-danger fs-3" type="submit" value="Бракувай" />
        </form>
    `;

    render(removeQtyTemplate(), container);
}

export async function addQtyProductPage() {
    const categories = await getAllCategories();
    async function addQty(e) {
        e.preventDefault();
        // Get data from form
        const formData = new FormData(e.target);
        const _id = formData.get('_id');
        const qty = +formData.get('qty');
        const action = 'add'; // add to current qty

        if (_id === null)
            return alert('Избери продукт!');
        if (qty === null)
            return alert('Въведи количество!');

        const res = await changeQtyProduct(_id, qty, action);

        if (res.status === 200) {// Successfully added qty to product
            alert(res.data);
            page('/');
        } else {
            alert('Възникна грешка!');
            console.error(res);
        }
    }

    const addQtyTemplate = () => html`
        ${backBtn}
        <form @submit=${addQty} class="d-flex text-center fs-3 flex-column m-auto mt-5 gap-5 p-3">
            <div class="mb-3">
                <label for="categoryId" class="form-label">1. Избери категория</label>
                <select @change=${loadProducts} required type="text" class="form-control fs-4" name="categoryId" id="categoryId">
                    <option selected disabled>Избери</option>
                    ${categories.map((category) => html`<option value=${category._id}>${category.name}</option>`)}
                </select>
            </div>
            <div class="mb-3 d-none" id="product">
                <label for="_id" class="form-label">2. Избери продукт</label>
                <select @change=${() => $('#quantityDiv').removeClass('d-none')} required type="text" class="form-control fs-4" name="_id" id="_id">
                    <option selected disabled>Избери</option>
                </select>
            </div>
            <div class="mb-3 d-none" id="quantityDiv">
                <label for="qty" class="form-label">3. Добави количество</label>
                <input required type="number" min="1" class="form-control fs-4" name="qty" id="qty" placeholder="пример: 50">
            </div>
            <input class="btn btn-primary fs-3" type="submit" value="Зареди" />
        </form>
    `;

    render(addQtyTemplate(), container);
}

export async function createProductPage() {
    const categories = await getAllCategories();
    async function getData(e) {
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

        const res = await createProduct(name, qty, buyPrice, sellPrice, categoryId, forBartender);

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

    const productFields = () => html`
    ${backBtn}
    <form @submit=${getData} class="m-auto mt-2 p-3 text-center fs-3">
        <div class="mb-3">
            <label for="name" class="form-label">Име на продукт</label>
            <input required type="text" class="form-control fs-4" name="name" id="name" placeholder="пример: Бира">
        </div>
        <div class="mb-3">
            <label for="qty" class="form-label">Броя</label>
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
            <label for="categoryId" class="form-label">Категория</label>
            <select required type="text" class="form-control fs-4" name="categoryId" id="categoryId">
                <option selected disabled>Избери</option>
                ${categories.map((category) => {
                    if (category.hasOwnProperty('parent')) // if it has a parent, it means its a subcategory (child)
                        return html`<option value=${category._id}>    ${category.name}</option>`

                    return html`<option value=${category._id}>${category.name}</option>`
                })}
            </select>
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

    render(productFields(), container);
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

        const res = await deleteProduct(_id);

        if (res.status === 200) {// Successfully deleted product
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
    async function getData(e) {
        e.preventDefault();
        // Get data from form
        const formData = new FormData(e.target);
        const _id = formData.get('_id');
        const name = formData.get('name');
        const qty = +formData.get('qty');
        const buyPrice = +formData.get('buyPrice');
        const sellPrice = +formData.get('sellPrice');
        const categoryId = formData.get('pr-categoryId');
        const forBartender = formData.get('forBartender') || false;

        if (categoryId === null)
            return alert('Избери категория!');
        
        const res = await editProduct(_id, name, qty, buyPrice, sellPrice, categoryId, forBartender);

        if (res.status === 200) {// Successfully edited product
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

        if (_id === null || _id === 'Избери') return;

        const res = await getProductById(_id);

        if (res.status === 200) {
            const { name, qty, buyPrice, sellPrice, category, forBartender } = res.data;

            // Set the values in the inputs
            $('#pr-name').val(name);
            $('#pr-qty').val(qty);
            $('#pr-buyPrice').val(buyPrice);
            $('#pr-sellPrice').val(sellPrice);
            $('#pr-categoryId').val(category);
            $('#pr-forBartender').attr('checked', forBartender);
        }
        
    }

    const productFields = () => html`
    ${backBtn}
    <form @submit=${getData} class="m-auto p-3 text-center fs-3">
        <div class="mb-3">
            <label for="categoryId" class="form-label">1. Избери категория</label>
            <select @change=${loadProducts} required type="text" class="form-control fs-4" name="categoryId" id="categoryId">
                <option selected disabled>Избери</option>
                ${categories.map((category) => {
                    if (category.hasOwnProperty('parent')) // if it has a parent, it means its a subcategory (child)
                        return html`<option value=${category._id}>    ${category.name}</option>`

                    return html`<option value=${category._id}>${category.name}</option>`
                })}
            </select>
        </div>
        <div class="mb-3 d-none" id="product">
            <label for="_id" class="form-label">2. Избери продукт</label>
            <select @change=${loadProductInfo} required type="text" class="form-control fs-4" name="_id" id="_id">
                <option selected disabled>Избери</option>
            </select>
        </div>
        <div id="product-info" class="mb-3 d-none">
            <label for="pr-name" class="form-label">Име на продукт</label>
            <input required type="text" class="form-control fs-4" name="name" id="pr-name" placeholder="пример: Бира">

            <div class="mb-3">
                <label for="pr-qty" class="form-label">Броя</label>
                <input required type="number" min="1" class="form-control fs-4" name="qty" id="pr-qty" placeholder="пример: 50">
            </div>
            <div class="mb-3">
                <label for="pr-buyPrice" class="form-label">Доставна цена</label>
                <input required type="text" title="пример: 5.20, 5.0, 5, 0.5, 0.50" pattern="^\\d{1,}(\\.\\d{1,2})?$" class="form-control fs-4" name="buyPrice" id="pr-buyPrice" placeholder="пример: 1.50">
            </div>
            <div class="mb-3">
                <label for="pr-sellPrice" class="form-label">Продажна цена</label>
                <input required type="text" title="пример: 5.20, 5.0, 5, 0.5, 0.50" pattern="^\\d{1,}(\\.\\d{1,2})?$" class="form-control fs-4" name="sellPrice" id="pr-sellPrice" placeholder="пример: 2">
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
                <div class="form-check d-inline-block">
                    <input class="form-check-input" type="checkbox" value="true" name="forBartender" id="pr-forBartender">
                    <label class="form-check-label" for="forBartender">
                        Барман
                    </label>
                </div>
            </div>
            <input type="submit" class="btn btn-primary fs-3 w-100" value="Промени"/>
        </div>
    </form>
`;

    render(productFields(), container);
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
        <form @submit=${getDataFromForm} class="d-flex m-auto mt-5 flex-column gap-5 p-3 fs-3">
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
        const uid = formData.get('uid');

        if (uid === null)
            return alert('Избери служител!');

        const res = await deleteUser(uid);

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
                <select required class="form-control fs-4 text-capitalize" name="uid">
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
        const uid = formData.get('uid');


        if (uid === null)
            return alert('Избери служител!');
        if (selectedChange === null)
            return alert('Избери какво да промениш!');
        if (!newValue)
            return alert('Въведи нова стойност!');

        const res = await editUser(uid, selectedChange, newValue);

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
        <form @submit=${edtUser} class="d-flex text-center fs-3 flex-column m-auto mt-5 gap-5 p-3">
            <div>
                <label class="form-label">1. Избери служител</label>
                <select required class="form-control text-capitalize fs-4" name="uid">
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
        
        if (sortedCategories === null)
            return alert('Избери категория!');

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
                ${categories.map((category) => html`<li class="list-group-item cursor-pointer" data-id=${category._id}>${category.name}</li>`)}
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
    const products = await getAllProducts();
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

            return html`
                <tr class="${product.qty < 20 ? 'table-danger' : ''}">
                    <td scope="row">${product.name}</td>
                    <td>${product.qty}</td>
                    <td>${product.buyPrice}</td>
                    <td>${product.sellPrice}</td>
                    <td>${(product.sellPrice - product.buyPrice).toFixed(2) }</td>
                </tr>
            `
        })}
        <tr class="table-primary">
            <th colspan="2" class="text-center">Общо: </th>
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
            productsToShow = products;
        else {
            // Find all products that are from the selected category
            for (let product of products) {
                if (product.category === categoryId)
                    productsToShow.push(product);
            }
        }

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
                ${categories.map((category) => {
                    if (category.hasOwnProperty('parent')) // if it has a parent, it means its a subcategory (child)
                        return html`<option value=${category._id}>    ${category.name}</option>`

                    return html`<option value=${category._id}>${category.name}</option>`
                })}
            </select>
        </div>
    
        <table class="table table-striped table-hover text-center">
            <thead>
                <tr>
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
    render(productRows(products), document.querySelector('tbody'));
}

export function showAdminDashboard() {
    const dashboard = () => html`
        <div class="text-center mt-4">
            <h1>Стока</h1>
            <div class="d-inline-flex flex-row flex-wrap gap-3 justify-content-center">
                <button @click=${() => page('/admin/product/addQty') } class="btn btn-primary fs-4">Зареди</button>
                <button @click=${() => page('/admin/product/removeQty')} class="btn btn-danger fs-4">Бракувай</button>
                <div class="d-inline-flex flex-row flex-wrap gap-3 justify-content-center">
                    <button @click=${() => page('/admin/product/create') } class="btn btn-success fs-4">Създай</button>
                    <button @click=${() => page('/admin/product/delete') } class="btn btn-danger fs-4">Изтрий</button>
                    <button @click=${() => page('/admin/product/edit') } class="btn btn-secondary fs-4">Редактирай</button>
                    <button @click=${() => page('/admin/inventory') } class="btn btn-secondary fs-4">Склад</button>
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
        `;

    render(dashboard(), container);
} 