import { productPages } from "./product";
import { categoryPages } from "./category";
import { employeePages } from "./employee";
import { historyPages } from "./history";
import { expensePages } from "./expense";
import { html, render } from 'lit-html'
import axios from 'axios';
import page from 'page';
import '../../css/admin/admin.css';
import { container } from "../../app";
import { inventoryPages } from "./inventory";
import { informationPages } from "./information";
import { auth, logout } from "../api/api";

export const backBtn = html`<button @click=${() => page('/admin')} class="btn btn-secondary fs-3 mt-2 ms-2"><i class="pe-none bi bi-arrow-left"></i></button>`;
let numberOfExpiredProducts;

export function adminPages() {
    //TODO Split all admin functions (ex. employee into employee/create, employee/edit, etc.)
    page('/admin', auth, showAdminDashboard);
    employeePages();
    categoryPages();
    productPages();
    historyPages();
    inventoryPages();
    informationPages();
    expensePages();
    //TODO FIX ALL BACKEND LINKS TO IMITATE THE FRONTEND (ex: from /getAllUsers, to /users/ with a GET request, etc...)
}

async function showAdminDashboard() {
    const res = await axios.get('/getNumberOfExpiredProducts');
    numberOfExpiredProducts = res.data;

    const dashboard = () => html`
    <div class="p-3">
            <div class="text-center mt-4">
                <h1>Информация</h1>
                <div class="d-inline-flex flex-row flex-wrap gap-3 justify-content-center">
                    <button @click=${() => page('/admin/inventory')} class="btn btn-secondary fs-4">Склад</button>
                    <button @click=${() => page('/admin/inventory/scrapped')} class="btn btn-danger fs-4">Бракувана стока</button>
                    <button @click=${() => page('/admin/inventory/buyPrices')} class="btn btn-info fs-4">Доставни цени</button>
                    <button @click=${() => page('/admin/information')} class="btn btn-secondary fs-4">Обобщена информация</button>
                    <button @click=${() => page('/admin/expense')} class="btn btn-secondary fs-4">Разходи</button>
                </div>
            </div>
            <div class="text-center mt-4">
                <h1>История</h1>
                <div class="d-inline-flex flex-row flex-wrap gap-3 justify-content-center">
                    <button @click=${() => page('/admin/history/reports')} class="btn btn-secondary fs-4">Отчети</button>
                    <button @click=${() => page('/admin/history/revision')} class="btn btn-primary fs-4">Ревизии</button>
                    <button @click=${() => page('/admin/history/product_sells')} class="btn btn-success fs-4">Продажби</button>
                    <button @click=${() => page('/admin/history/consumption')} class="btn btn-secondary fs-4">Консумация</button>
                    <button @click=${() => page('/admin/history/restock')} class="btn btn-info fs-4">Зареждане</button>
                </div>
            </div>
            <div class="text-center mt-4">
                <h1>Продукти</h1>
                <div class="d-inline-flex flex-row flex-wrap gap-3 justify-content-center">
                    <button @click=${() => page('/admin/product/restock')} class="btn btn-primary fs-4">Зареди</button>
                    <button @click=${() => page('/admin/product/scrap')} class="btn btn-danger fs-4">Бракувай</button>
                    <button @click=${() => page('/admin/product/create')} class="btn btn-success fs-4">Създай</button>
                    <button @click=${() => page('/admin/product/delete')} class="btn btn-danger fs-4">Изтрий</button>
                    <button @click=${() => page('/admin/product/edit')} class="btn btn-secondary fs-4">Редактирай</button>
                    <button @click=${() => page('/admin/product/reorder')} class="btn btn-secondary fs-4">Подреди</button>
                    <button @click=${() => page('/admin/product/expired')} class="btn btn-primary fs-4 position-relative">Срок на годност<span id = "numberOfExpiredProducts" class="${numberOfExpiredProducts === 0 && 'd-none'} position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"> ${numberOfExpiredProducts}</span></button>
                </div>
            </div>
            <div class="text-center mt-4">
                <h1>Категории</h1>
                <div class="d-inline-flex flex-row flex-wrap gap-3 justify-content-center">
                    <button @click=${() => page('/admin/category/create')} class="btn btn-success fs-4">Създай</button>
                    <button @click=${() => page('/admin/category/delete')} class="btn btn-danger fs-4">Изтрий</button>
                    <button @click=${() => page('/admin/category/edit')} class="btn btn-secondary fs-4">Редактирай</button>
                    <button @click=${() => page('/admin/category/reorder')} class="btn btn-secondary fs-4">Подреди</button>
                </div>
            </div>
            <div class="text-center mt-4">
                <h1>Служители</h1>
                <div class="d-inline-flex flex-row flex-wrap gap-3 justify-content-center">
                    <button @click=${() => page('/admin/employee/create')} class="btn btn-success fs-4">Създай</button>
                    <button @click=${() => page('/admin/employee/delete')} class="btn btn-danger fs-4">Изтрий</button>
                    <button @click=${() => page('/admin/employee/edit')} class="btn btn-secondary fs-4">Редактирай</button>
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