import { backBtn } from "./admin.js";
import { container } from "../../app.js";
import page from 'page';
import { html, render } from 'lit/html.js';
import $ from "jquery";
import axios from "axios";
import { auth, fixPrice, separateThousands } from "../api/api.js";

// FUNCTIONS

async function getInformation(fromDate, toDate) {
    return await axios.post('/getInformation', {
        fromDate,
        toDate
    }).catch((err) => {
        return err.response;
    });
}

// PAGES

export async function informationsPage() {
    const informationsTemplate = () => html`
        ${backBtn}
        
        <div class="d-flex w-100 gap-3 p-3 fs-4">
            <div class="w-50">
                <label for="fromDate" class="form-label">От</label>
                <input @change=${loadInformation} name="fromDate" class="form-control fs-4" id="fromDate" type="date" />
            </div>
        
            <div class="w-50">
                <label for="toDate" class="form-label">До</label>
                <input @change=${loadInformation} name="toDate" class="form-control fs-4" id="toDate" type="date" />
            </div>
        </div>
        
        <div id="informations" class="d-flex flex-wrap w-100 gap-3 p-3">
        </div>
    `;

    const infoTemplate = (info) => html`
        <div class="flex-fill border border-info rounded p-2 text-info">
            <h5>Общ оборот</h5>
            <span>${fixPrice(info.grossIncome)} лв.</span>
        </div>

        <div class="flex-fill border border-info rounded p-2 text-info">
            <h5>Оборот на доставни цени</h5>
            <span>${fixPrice(info.grossIncomeDelivery)} лв.</span>
        </div>

        <div class="flex-fill border border-info rounded p-2 text-info">
            <h5>Печалба</h5>
            <span>${fixPrice(info.totalIncome)} лв.</span>
        </div>

        <div class="flex-fill border border-info rounded p-2 text-info">
            <h5>Печалба след разходи</h5>
            <span>${fixPrice(info.incomeWithExpenses)} лв.</span>
        </div>

        <div class="flex-fill border border-info rounded p-2 text-info">
            <h5>Обща надценка</h5>
            <span>${info.upsellPercentage ? info.upsellPercentage.toFixed(2) : "0"}%</span>
        </div>

        <div class="flex-fill border border-info rounded p-2 text-info">
            <h5>Брой сметки</h5>
            <span>${separateThousands(info.totalSells)} бр.</span>
        </div>

        <div class="flex-fill border border-info rounded p-2 text-info">
            <h5>Брой продадени продукти</h5>
            <span>${separateThousands(info.totalProductsSold)} бр.</span>
        </div>

        <div class="flex-fill border border-info rounded p-2 text-info">
            <h5>Среден оборот на ден</h5>
            <span>${fixPrice(info.averageIncomePerDay)} лв.</span>
        </div>
`;

    async function loadInformation() {
        const fromDate = $('#fromDate').val();
        const toDate = $('#toDate').val();

        const res = await getInformation(fromDate, toDate);

        if (res.status === 200) {
            const info = res.data;

            // Render reports
            render(infoTemplate(info), document.querySelector('#informations'));
        } else {
            console.error(res);
            alert('Възникна грешка');
        }
    }

    render(informationsTemplate(), container);
    loadInformation();
}

export function informationPages() {
    page('/admin/information', auth, informationsPage);
}