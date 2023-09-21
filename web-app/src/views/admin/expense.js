import page from 'page';
import { html, render } from 'lit/html.js';
import $ from "jquery";
import { auth, fixPrice } from '../api/api';
import { container } from '../../app';
import axios from 'axios';
import { backBtn } from './admin';

let expenseTypes,
    expenseToEditId,
    expenseToDeleteId;

// FUNCTIONS
async function getExpenseTypes() {
    const res = await axios.get('/expenseTypes');
    return res.data;
}

async function getExpenses(fromDate, toDate, id, type) {
    // When id is present, it retrieves a single expense!
    const res = await axios.post('/getExpenses', {
        fromDate,
        toDate,
        id,
        type
    });

    return res;
}

const createExpenseModal = () => html`
    <div class="modal fade" id="createExpenseModal" tabindex="-1" aria-labelledby="createExpenseModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="createExpenseModalLabel">Създай нов разход</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form autocomplete="off" @submit=${createExpense}>
                <div class="modal-body">
                        <div class="mb-3">
                            <label for="type" class="form-label">Тип</label>
                            <select required class="form-control fs-4" name="type" id="type">
                                <option selected disabled>Избери</option>
                                ${expenseTypes.map((e) => html`<option>${e}</option>`)}
                            </select>
                        </div>

                        <div class="mb-3">
                            <label for="price" class="form-label">Сума</label>
                            <input required type="number" step="0.001" title="пример: 100, 123, 12.50" pattern="^\\d{1,}(\\.\\d{1,2})?$" class="form-control fs-4" name="price" id="price" placeholder="пример: 50">
                        </div>

                        <div class="mb-3">
                            <label for="note" class="form-label">Забележка</label>
                            <input class="form-control fs-4" type="text" name="note" id="note"/>
                        </div>
                </div>
                <div class="modal-footer justify-content-between">
                    <button type="button" class="btn btn-secondary text-uppercase" data-bs-dismiss="modal">Отказ</button>
                    <input type="submit" value="Създай" class="btn btn-success text-uppercase"/>
                </div>
            </form>
            </div>
        </div>
    </div>
`;

const editExpenseModal = () => html`
    <div class="modal fade" id="editExpenseModal" tabindex="-1" aria-labelledby="editExpenseModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="editExpenseModalLabel">Редактирай разход</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form autocomplete="off" @submit=${editExpense}>
                <div class="modal-body">
                        <div class="mb-3">
                            <label for="type" class="form-label">Тип</label>
                            <select required class="form-control fs-4" name="type" id="type">
                                <option selected disabled>Избери</option>
                                ${expenseTypes.map((e) => html`<option value=${e}>${e}</option>`)}
                            </select>
                        </div>

                        <div class="mb-3">
                            <label for="price" class="form-label">Сума</label>
                            <input required type="number" step="0.001" title="пример: 100, 123, 12.50" pattern="^\\d{1,}(\\.\\d{1,2})?$" class="form-control fs-4" name="price" id="price" placeholder="пример: 50">
                        </div>

                        <div class="mb-3">
                            <label for="note" class="form-label">Забележка</label>
                            <input class="form-control fs-4" type="text" name="note" id="note"/>
                        </div>
                </div>
                <div class="modal-footer justify-content-between">
                    <button type="button" class="btn btn-secondary text-uppercase" data-bs-dismiss="modal">Отказ</button>
                    <input type="submit" value="Редактирай" class="btn btn-primary text-uppercase"/>
                </div>
            </form>
            </div>
        </div>
    </div>
`;

const deleteExpenseModal = () => html`
    <div class="modal fade" id="deleteExpenseModal" tabindex="-1" aria-labelledby="deleteExpenseModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="deleteExpenseModalLabel">Изтрий разход</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form autocomplete="off" @submit=${deleteExpense}>
                <div class="modal-body">
                        <p>Сигурни ли сте, че искате да изтриете разхода?</p>
                </div>
                <div class="modal-footer justify-content-between">
                    <button type="button" class="btn btn-secondary text-uppercase" data-bs-dismiss="modal">Отказ</button>
                    <input type="submit" value="Изтрий" class="btn fw-bold btn-danger text-uppercase"/>
                </div>
            </form>
            </div>
        </div>
    </div>
`;

// PAGES
async function createExpense(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const type = formData.get('type');
    const price = +formData.get('price');
    let note = formData.get('note');

    if (!type)
        return alert('Избери тип!')

    if (note === '')
        note = null;

    const res = await axios.post('/createExpense', {
        type,
        price,
        note
    });

    if (res.status === 201) {
        page('/admin');
        page('/admin/expense')
    } else if (res.status === 500) {
        console.error(res.error);
        alert('Възникна грешка!');
    } else {
        alert(res.data);
    }
}

async function loadEditModal(e) {
    const id = e.srcElement.getAttribute('id')
    expenseToEditId = id;

    const res = await getExpenses(null, null, id, null);
    const expense = res.data;

    $(`#editExpenseModal option:contains(${expense.type})`).attr('selected', 'selected');
    $('#editExpenseModal #price').val(expense.price);
    $('#editExpenseModal #note').val(expense.note);
}

async function editExpense(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const type = formData.get('type');
    const price = +formData.get('price');
    const id = expenseToEditId;
    let note = formData.get('note');

    if (!type)
        return alert('Избери тип!')

    if (note === '')
        note = null;

    const res = await axios.post('/editExpense', {
        type,
        price,
        note,
        id
    });

    if (res.status === 200) {
        page('/admin');
        page('/admin/expense')
    } else if (res.status === 500) {
        console.error(res.error);
        alert('Възникна грешка!');
    } else {
        alert(res.data);
    }
}

async function deleteExpense(e) {
    e.preventDefault();

    const id = expenseToDeleteId;

    const res = await axios.post('/deleteExpense', {
        id
    });

    if (res.status === 200) {
        page('/admin');
        page('/admin/expense')
    } else if (res.status === 500) {
        console.error(res.error);
        alert('Възникна грешка!');
    } else {
        alert(res.data);
    }
}

async function expensePage() {
    expenseTypes = await getExpenseTypes();

    const res = await getExpenses();
    const expenses = res.data;
    let total = 0;

    async function loadExpenses(e) {
        const fromDate = $('#fromDate').val();
        const toDate = $('#toDate').val();
        const type = $('#typeSearch').val();

        const res = await getExpenses(fromDate, toDate, null, type);

        if (res.status === 200) {
            const expenses = res.data;
            total = 0;
            // Render expenses
            render(template(expenses), container);
            render(fixPrice(total), document.querySelector('#total'));
        } else {
            console.error(res);
            return alert('Възникна грешка!')
        }
    }

    const rowsTemplate = (expenses) => html`
        ${expenses.map(expense => {
        const date = new Date(expense.when);
        const dateString = `${date.getDate() > 9 ? date.getDate() : '0' + date.getDate()}.${(date.getMonth() + 1) > 9 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)}.${date.getFullYear()}`;
        total += expense.price;

        return html`
                <tr>
                    <td>${dateString}</td>
                    <td class="text-capitalize">${expense.type}</td>
                    <td>${fixPrice(expense.price)}</td>
                    <td>${expense.note}</td>
                    <td>
                        <button @click=${loadEditModal} id=${expense._id} data-bs-toggle="modal" data-bs-target="#editExpenseModal" class="btn btn-primary"><i class="pe-none bi bi-pencil"></i></button>
                        <button @click=${() => expenseToDeleteId = expense._id} class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#deleteExpenseModal"><i class="pe-none bi bi-trash3"></i></button>
                    </td>
                </tr>`
    })}`;

    const template = (expenses) => html`
        ${createExpenseModal()}
        ${editExpenseModal()}
        ${deleteExpenseModal()}

        <div class="d-flex justify-content-between p-3">
            ${backBtn}
            <button class="btn btn-success fs-3 mt-2" data-bs-toggle="modal" data-bs-target="#createExpenseModal"><i class="bi bi-plus-lg"></i></button>
        </div>
        
        <div class="d-flex w-100 gap-3 p-3 fs-4 mb-3">
            <div class="w-50">
                <label for="fromDate" class="form-label">От</label>
                <input @change=${loadExpenses} name="fromDate" class="form-control fs-4" id="fromDate" type="date" />
            </div>
        
            <div class="w-50">
                <label for="toDate" class="form-label">До</label>
                <input @change=${loadExpenses} name="toDate" class="form-control fs-4" id="toDate" type="date" />
            </div>
        </div>

        <div class="mb-3 p-3 fs-4">
                <label for="typeSearch" class="form-label">Търси</label>
                <input autocomplete="off"  @change=${loadExpenses} class="form-control fs-4" type="text" list="allTypes" name="typeSearch" id="typeSearch">
                <datalist id="allTypes">
                    ${expenseTypes.map(el => { return html`<option value=${el}/>` })}
                </datalist>
        </div>

        <table id="selectedexpenses" class="mt-4 table table-striped table-dark table-hover text-center">
            <thead>
                <tr class="table-primary">
                    <th scope="col" colspan="2">Общо</th>
                    <th scope="col" id="total"></th>
                    <th scope="col" colspan="2"></th>
                </tr>
                <tr>
                    <th scope="col">Дата</th>
                    <th scope="col">Тип</th>
                    <th scope="col">Сума</th>
                    <th scope="col">Забележка</th>
                    <th scope="col">Действие</th>
                </tr>
            </thead>
            <tbody>
                ${rowsTemplate(expenses)}
            </tbody>
        </table>
    `;

    render(template(expenses), container);
    render(fixPrice(total), document.querySelector('#total'));
}

export function expensePages() {
    page('/admin/expense', auth, expensePage);
}