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
import { auth, logout, user } from "../api/api";

export const backBtn = html`<a href='/admin' class="btn btn-secondary fs-3 mt-2 ms-2"><i class="pe-none bi bi-arrow-left"></i></a>`;
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
            ${user.isDev ? html`
            <div class="text-center mt-4">
                <a href='/developer' class="btn btn-warning fs-4">Dev tools</a>
            </div>` : ''}
            <div class="text-center mt-4">
                <h1>Информация</h1>
                <div class="d-inline-flex flex-row flex-wrap gap-3 justify-content-center">
                    <a href='/admin/inventory' class="btn btn-secondary fs-4">Склад</a>
                    <a href='/admin/inventory/scrapped' class="btn btn-danger fs-4">Бракувана стока</a>
                    <a href='/admin/inventory/buyPrices' class="btn btn-info fs-4">Доставни цени</a>
                    <a href='/admin/information' class="btn btn-secondary fs-4">Обобщена информация</a>
                    <a href='/admin/expense' class="btn btn-secondary fs-4">Разходи</a>
                </div>
            </div>
            <div class="text-center mt-4">
                <h1>История</h1>
                <div class="d-inline-flex flex-row flex-wrap gap-3 justify-content-center">
                    <a href='/admin/history/reports' class="btn btn-secondary fs-4">Отчети</a>
                    <a href='/admin/history/revision' class="btn btn-primary fs-4">Ревизии</a>
                    <a href='/admin/history/product_sells' class="btn btn-success fs-4">Продажби</a>
                    <a href='/admin/history/consumption' class="btn btn-secondary fs-4">Консумация</a>
                    <a href='/admin/history/restock' class="btn btn-info fs-4">Зареждане</a>
                </div>
            </div>
            <div class="text-center mt-4">
                <h1>Продукти</h1>
                <div class="d-inline-flex flex-row flex-wrap gap-3 justify-content-center">
                    <a href='/admin/product/restock' class="btn btn-primary fs-4">Зареди</a>
                    <a href='/admin/product/scrap' class="btn btn-danger fs-4">Бракувай</a>
                    <a href='/admin/product/create' class="btn btn-success fs-4">Създай</a>
                    <a href='/admin/product/delete' class="btn btn-danger fs-4">Изтрий</a>
                    <a href='/admin/product/edit' class="btn btn-secondary fs-4">Редактирай</a>
                    <a href='/admin/product/reorder' class="btn btn-secondary fs-4">Подреди</a>
                    <a href='/admin/product/expired' class="btn btn-primary fs-4 position-relative">Срок на годност<span id = "numberOfExpiredProducts" class="${numberOfExpiredProducts === 0 && 'd-none'} position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"> ${numberOfExpiredProducts}</span></a>
                </div>
            </div>
            <div class="text-center mt-4">
                <h1>Категории</h1>
                <div class="d-inline-flex flex-row flex-wrap gap-3 justify-content-center">
                    <a href='/admin/category/create' class="btn btn-success fs-4">Създай</a>
                    <a href='/admin/category/delete' class="btn btn-danger fs-4">Изтрий</a>
                    <a href='/admin/category/edit' class="btn btn-secondary fs-4">Редактирай</a>
                    <a href='/admin/category/reorder' class="btn btn-secondary fs-4">Подреди</a>
                </div>
            </div>
            <div class="text-center mt-4">
                <h1>Служители</h1>
                <div class="d-inline-flex flex-row flex-wrap gap-3 justify-content-center">
                    <a href='/admin/employee/create' class="btn btn-success fs-4">Създай</a>
                    <a href='/admin/employee/delete' class="btn btn-danger fs-4">Изтрий</a>
                    <a href='/admin/employee/edit' class="btn btn-secondary fs-4">Редактирай</a>
                </div>
            </div>
            <div class="d-flex mt-5 flex-row flex-wrap gap-3 justify-content-end">
                <a href='/waiter' class="btn btn-secondary fs-4">Маси</a>
                <a href='/bartender' class="btn btn-secondary fs-4">Поръчки</a>
                <button @click=${logout} class="btn btn-danger fs-4">Изход</button>
            </div>
        </div>
    `;

    render(dashboard(), container);
} 