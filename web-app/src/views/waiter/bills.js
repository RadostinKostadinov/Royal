import page from 'page';
import axios from "axios";
import { html, render } from "lit";
import { container } from "../../app";
import { auth, fixPrice } from "../api/api";

// FUNCTIONS

// PAGES

async function showPaidBillsPage(ctx) {
    // const res = await axios.get('/getAllPaidBills');
    const pageNumber = +ctx.params.page || 1;
    const res = await axios.post('/getAllPaidBills', { pageNumber })
    const { bills } = res.data;

    const historiesRows = (histories) => html`
        ${histories.map((history) => {
        let allProducts = [];
        const date = new Date(history.when);
        const dateString = `${date.getDate() > 9 ? date.getDate() : '0' + date.getDate()}.${(date.getMonth() + 1) > 9 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)}.${date.getFullYear()}`;
        const timeString = `${date.getHours() > 9 ? date.getHours() : '0' + date.getHours()}:${date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes()}`;

        for (let product of history.products)
            allProducts.push(html`<div>${product.name} x ${product.qty} бр.</div>`)

        return html`
            <tr>
                <td>${dateString}</td>
                <td>${timeString}</td>
                <td>${history.table.name}</td>
                <td>${history.billNumber}</td>
                <td class="text-capitalize">${history.user.name}</td>
                <td>${allProducts}</td>
                <td>${fixPrice(history.total)}</td>
                <td>${history.discount ? fixPrice(history.discount) : ''}</td>
            </tr>`
    })}
    `;

    const billsTemplate = () => html`
        <button class="gray-btn fs-5 mt-3 ms-3" @click=${() => page('/waiter')}>Назад</button>

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
                    <th scope="col">Отстъпка</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
        <ul class="pagination fs-3 justify-content-center">
            ${pageNumber === 1 ? html`` : html`
                <li class="page-item">
                    <a class="page-link" href = ${`/waiter/showPaidBills/${pageNumber - 1}`} aria-label="Previous">
                        <i class="bi bi-caret-left-fill"></i>
                    </a>
                </li>
            `}

            <li class="page-item">
                <input type="number" @change=${(e) => page(`/waiter/showPaidBills/${e.target.value}`)} .value=${pageNumber} style="width: 10rem" class="noArrows page-link text-center"/>
            </li>

            <li class="page-item">
                <a class="page-link" href = ${`/waiter/showPaidBills/${pageNumber + 1}`} aria-label="Next">
                    <i class="bi bi-caret-right-fill"></i>
                </a>
            </li>
        </ul>
    `;

    render(billsTemplate(), container);

    // Render all scrapped products
    render(historiesRows(bills), document.querySelector('tbody'));
}

export function billPages() {
    page('/waiter/showPaidBills', auth, showPaidBillsPage);
    page('/waiter/showPaidBills/:page', auth, showPaidBillsPage);
}