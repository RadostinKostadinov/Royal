import { backBtn } from "./admin.js";
import { container } from "../../app.js";
import page from 'page';
import { html, render } from 'lit/html.js';
import axios from 'axios';
import Sortable from 'sortablejs';
import { auth } from "../api/api.js";

// FUNCTIONS

export async function getAllCategories(showHidden) {
    const res = await axios.post('/getAllCategories', true);
    return res.data;
}

// PAGES

async function createCategoryPage() {
    async function getData(e) {
        e.preventDefault();
        // Get data from form
        const formData = new FormData(e.target);
        const name = formData.get('name');

        const res = await axios.post('/createCategory', { name }).catch((err) => {
            return err.response;
        });

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

async function deleteCategoryPage() {
    const categories = await getAllCategories(true);

    async function delCategory(e) {
        e.preventDefault();
        const confirmAction = confirm('ВНИМАНИЕ! Това ще изтрие тази категория и всички продукти в нея! Сигурен ли си че искаш да продължиш?');

        if (!confirmAction) return;
        // Get selected category
        const formData = new FormData(e.target);
        const _id = formData.get('_id');

        if (_id === null)
            return alert('Избери категория!');

        const res = await await axios.post('/deleteCategory', {
            _id
        }).catch((err) => {
            return err.response;
        });

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

async function editCategoryPage() {
    const categories = await getAllCategories(true);

    async function edCategory(e) {
        e.preventDefault();
        // Get selected category
        const formData = new FormData(e.target);
        const _id = formData.get('_id');
        const name = formData.get('name'); // New name

        if (_id === null)
            return alert('Избери категория!');

        const res = await axios.post('/editCategory', {
            _id, name
        }).catch((err) => {
            return err.response;
        });

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

async function sortCategoriesPage() {
    const categories = await getAllCategories();

    async function saveOrder() {
        const sortedCategories = sortable.toArray(); // returns array with the 'data-id' attr for sorted categories

        if (sortedCategories === null) return;

        const res = await axios.post('/sortCategories', sortedCategories)
            .catch((err) => {
                return err.response;
            });

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

export function categoryPages() {
    page('/admin/category/create', auth, createCategoryPage);
    page('/admin/category/delete', auth, deleteCategoryPage);
    page('/admin/category/edit', auth, editCategoryPage);
    page('/admin/category/reorder', auth, sortCategoriesPage);
}