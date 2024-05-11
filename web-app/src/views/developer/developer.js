import page from 'page';
import { auth } from '../api/api';
import { html, render } from 'lit';
import { container } from '../../app';
import { databasePages } from './database/database';
import { backBtn } from '../admin/admin';

export const devBackBtn = html`<a href='/developer' class="btn btn-secondary fs-3 mt-2 ms-2"><i class="pe-none bi bi-arrow-left"></i></a>`;

function developerDashboard() {
    const dashboard = () => html`
        <div class="p-3">
            ${backBtn}
            <div class="text-center mt-4">
                <div class="d-inline-flex flex-row flex-wrap gap-3 justify-content-center">
                    <a class="btn btn-primary fs-4" href='/developer/database'>База данни</a>
                </div>
            </div>
        </div>
    `;

    render(dashboard(), container);
}

export function developerPages() {
    page('/developer', auth, developerDashboard);
    databasePages();
}