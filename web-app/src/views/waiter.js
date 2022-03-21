import page from 'page';
import '../css/waiter/menu.css';
import '../css/waiter/tables/tables.css';
import '../css/waiter/tables/middleTables.css';
import '../css/waiter/tableControls.css';
import { container } from "../app";
import { html, render } from 'lit/html.js';
import $ from "jquery";
import { generateBills, getAllCategories, getAllTables, getCategoryById, logout } from '../api';
const backBtn = html`<button @click=${()=> page('/waiter')} class="btn btn-secondary fs-3 mt-2 ms-2">Назад</button>`;

// Dashboard contains all the code for rendering the tables view (grid with tables)
export async function waiterDashboardPage() {
    // Get all tables from db
    const { middleTables, insideTables, outsideTables } = await getAllTables();

    const dashboardTemplate = (grid) => html`
        <div id="waiterDashboard" class="d-flex">
            <div id="waiterMenu" class="d-flex flex-column h-100">
                <div id="todayInfo" class="d-flex flex-column text-center gap-1 text-uppercase">
                    <div>Понеделник</div>
                    <div>20.03.2022</div>
                    <div>18:30</div>
                </div>
                <div class="d-flex flex-column align-items-center mt-5 mb-5 justify-content-between h-100 w-100 ps-2 pe-2">
                    <div id="changeTablesViewButtons" class="d-flex flex-column text-center gap-3 w-100">
                        <button id="insideTablesBtn" @click=${(clickedBtn) => changeTablesView(clickedBtn, 'insideTables')}>Вътре</button>
                        <button class="active" id="middleTablesBtn" @click=${(clickedBtn) => changeTablesView(clickedBtn, 'middleTables')}>Градина</button>
                        <button id="outsideTablesBtn" @click=${(clickedBtn) => changeTablesView(clickedBtn, 'outsideTables')}>Навън</button>
                    </div>
                    <div class="d-flex flex-column text-center gap-3 w-100">
                        <button @click=${logout}>Меню</button>
                        <button @click=${logout}>Изход</button>
                    </div>
                </div>
            </div>
            
            <div class="d-flex flex-column w-100">
                <div id="topMenu">
                    
                </div>
    
                ${grid}
            </div>
        </div>
    `;

    const gridTemplate = (gridId, elements) => html`
        <div id=${gridId} class="tablesGrid">
            ${elements.map((element) => {
                const taken = element.taken ? 'taken' : '';
                const allClasses = `${element.type} ${element.type + element.number} ${taken}`;
                //element.type = [table, bar]
                //element.number = 1,2,3... || v1,v2,v3... || n1,n2,n3...
                //element.name = Маса 1, Маса В1, Маса Н1..
                //element.total = undefined (if != table) || number (ex. 12.50) (if == table)
                const btn = html`
                    <button @click=${(e)=> page(`/waiter/table/${$(e.target).attr('_id')}`)} class=${allClasses} _id=${element._id}>
                        <span class="name">${element.name}</span>
                        <span class="total">${element.total ? (element.total).toFixed(2) : ''}</span>
                    </button>`;
                return btn;
            })}
        </div>
    `;

    // This functions changes the table's view (shows the inside, outside or garden tables grid)
    function changeTablesView(clickedBtnEvent, viewName) {
        const clickedBtn = clickedBtnEvent.target;
        let viewToRender;

        // Remove active class from any button that has it
        $('#changeTablesViewButtons button.active').removeClass('active');

        if (viewName === 'outsideTables')
            viewToRender = outsideTables;
        else if (viewName === 'middleTables')
            viewToRender = middleTables;
        else if (viewName === 'insideTables')
            viewToRender = insideTables;
        
        // Add active class to clicked btn
        $(clickedBtn).addClass('active');

        render(dashboardTemplate(gridTemplate(viewName, viewToRender)), container);
    }

    // Render default view (dashboard + middle tables)
    render(dashboardTemplate(gridTemplate('middleTables', middleTables)), container);
}

export async function tableControlsPage(ctx) {
    const selectedTable = ctx.params._id; // Get selected (clicked) table _id

    if (selectedTable === null) return page('/');

    const categories = await getAllCategories(); // Get all categories to display

    let selectedBillId, // by default the first one is selected, so its never undefiend
        selectedX; // can be 2,3... (number) or undefined (no X selected)
    
    async function addProductToBill(e) {
        //TODO
        const _id = $(e.target).attr('_id');

        // use selectedX AND selectedBillId here also
        
        console.log(_id);
    }


    // Loads all products from category to display
    async function loadProductsFromCategory(e) {
        // e could be from the initial loading of the template (with categires[0]._id)
        // or the actual event of clicking a button
        let _id;
        if (typeof e === 'string') // if loading page for first time
            _id = e;
        else {
            // if button is clicked
            let btn = $(e.target);
            
            // find and remove old category active class
            $('#tableControls .categories button.active').removeClass('active');

            // add active class
            btn.addClass('active');
            
            _id = btn.attr('_id');
        }

        if (!_id) return;

        const res = await getCategoryById(_id);

        if (res.status === 200) {
            const category = res.data;

            //FIXME DELETE NEXT LINE
            for (let i = 0; i < 15; i++) {
                category.products.push(category.products[i]);
            }
            
            render(productsTemplate(category.products), document.querySelector('#tableControls .products'))
        } else {
            alert('Възникна грешка!')
            console.error(res);
        }
    }

    function changeSelectedX(e) {
        const selectedBillEl = $(e.target);
        selectedBillId = selectedBillEl.attr('_id'); // set new bill as selected

        // find and remove "active" from old bill
        $('#tableControls .bills button.active').removeClass('active');

        // add active class to new bill
        selectedBillEl.addClass('active');
    }

    function changeSelectedX(e) {
        const selectedXEl = $(e.target);
        const newX = +selectedXEl.text()

        // If clicked same button, remove X (maybe it was accident, so he clicked again to remove X.. because we dont have X1)
        if (selectedX === newX) {
            selectedX = undefined;
            selectedXEl.removeClass('active');
        } else {
            selectedX = newX; // set new X as selected
    
            // find and remove "active" from old X
            $('#tableControls .xButtons button.active').removeClass('active');
    
            // add active class to new X
            selectedXEl.addClass('active');
        }
    }

    // Create X bills in the tables database so we can get ID's of bills to place in buttons, then render
    async function initializeBills() {
        const numberOfBills = 6; // How many bills to generate inside table
        const res = await generateBills(selectedTable, numberOfBills);

        if (res.status === 201 || res.status === 200) {
            // 201 == created, 200 == already created (no problem)
            const bills = res.data;
            selectedBillId = bills[0]._id;// set first bill as selected automatically

            render(billsTemplate(bills), document.querySelector('#tableControls .bills'));
        } else {
            console.error(res);
            alert('Възникна грешка!')
        }
    }

    const productsTemplate = (products) => html`
        ${products.map((product) => html`<button @click=${addProductToBill} _id=${product._id}>${product.name}</button>`)}
    `;

    // i==0 (if first bill, mark it as "active")
    const billsTemplate = (bills) => html`
        ${bills.map((_id, i) => html`<button @click=${changeSelectedX} class=${i === 0 ? 'active' : ''} _id=${_id}>${i+1}</button>`) }
    `;

    const controlsTemplate = () => html`
        <div id="tableControls">
            <div class="categories">
                ${categories.map((category) => html`<button @click=${loadProductsFromCategory} class=${category.order === 1 ? 'active' : ''} _id=${category._id}>${category.name}</button>`)}
            </div>
            <div class="productsAndXButtons d-flex flex-column">
                <div class="products">
                </div>
                <div class="xButtons d-flex justify-content-center gap-4">
                    <button @click=${changeSelectedX}>2</button>
                    <button @click=${changeSelectedX}>3</button>
                    <button @click=${changeSelectedX}>4</button>
                    <button @click=${changeSelectedX}>5</button>
                    <button @click=${changeSelectedX}>6</button>
                </div>
            </div>
            <div class="bills ">
            </div>
            <div class="controlsAndAddons">
                <div class="addons">
                    Addons will be shown here.
                    (example: milk for coffee, honey etc)
                </div>
                <div class="controls">
                    <button class="btn btn-danger">Бракувай</button>
                    <button class="btn btn-secondary">Извади</button>
                    <button class="btn btn-success">Приключи</button>
                    <button class="btn btn-primary">Назад</button>
                </div>
            </div>
            <div class="addedProducts">
            </div>
        </div>
    `;

    // Render default view (select first category, load its products, initialize bills)
    loadProductsFromCategory(categories[0]._id);
    initializeBills();
    render(controlsTemplate(), container);
}