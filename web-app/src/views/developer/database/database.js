import { html, render } from 'lit';
import page from 'page';
import { auth } from '../../api/api';
import { container } from '../../../app';
import { devBackBtn } from '../developer';
import axios from 'axios';

async function createNewBackup() {
    const res = await axios.post('/database/backup');

    if (res.status === 200) {
        console.log(res.data);
    } else {
        console.log(res);
    }
}

function databaseDashboard() {
    const dashboard = () => html`
        <div class="d-flex justify-content-between p-3">
            ${devBackBtn}
            <button @click=${createNewBackup} class="btn btn-success fs-3 mt-2" ><i class="bi bi-plus-lg"></i></button>
        </div>

        <table id="selectedexpenses" class="mt-4 table table-striped table-dark table-hover text-center">
            <thead>
                <tr>
                    <th scope="col">Дата</th>
                    <th scope="col">Забележка</th>
                    <th scope="col">Действие</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    `;

    render(dashboard(), container);
}

export function databasePages() {
    page('/developer/database', auth, databaseDashboard);
}