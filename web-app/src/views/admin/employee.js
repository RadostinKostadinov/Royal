import { backBtn } from "./admin.js";
import { container } from "../../app.js";
import page from 'page';
import $ from "jquery";
import { html, render } from 'lit/html.js';
import axios from 'axios';
import { auth } from "../api/api.js";

// PAGES

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

        const res = await axios.post('/createUser', {
            name,
            pin,
            role
        }).catch((err) => {
            return err.response;
        });

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
    const res = await axios.get('/getAllUsers');
    let users;

    if (res.status === 200)
        users = res.data;
    else {
        alert('Възникна грешка!');
        console.error(res);
    }

    async function delUser(e) {
        e.preventDefault();
        // Get selected user
        const formData = new FormData(e.target);
        const _id = formData.get('_id');

        if (_id === null)
            return alert('Избери служител!');

        const res = await axios.post('/deleteUser', {
            _id
        }).catch((err) => {
            return err.response;
        });

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
    const res = await axios.get('/getAllUsers');
    let users,
        selectedChange = null,
        lastSelectedChange;

    if (res.status === 200)
        users = res.data;
    else {
        alert('Възникна грешка!');
        console.error(res);
    }

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

        const res = await axios.post('/editUser', {
            _id,
            selectedChange,
            newValue
        }).catch((err) => {
            return err.response;
        });

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

export function employeePages() {
    page('/admin/employee/create', auth, createEmployeePage);
    page('/admin/employee/delete', auth, deleteEmployeePage);
    page('/admin/employee/edit', auth, editEmployeePage);
}