import page from 'page';
import { container, categories, products, parentCategories } from "../app";
import { html, render } from 'lit/html.js';
import $ from "jquery";
const backBtn = html`<button @click=${()=> page('/waiter')} class="btn btn-secondary fs-3 mt-2 ms-2">Назад</button>`;

// Dashboard contains all the code for rendering the tables view (grid with tables)
export function showWaiterDashboard() {
    // Contains the outside/inside buttons and the tables grid
    const tablesView = (tableGrid) => html`
        <div id="tablesView">
            <div class="outsideInsideButtonsDiv">
                <button @click=${() => changeView('insideTables')} class="btn btn-primary fs-3">Вътре</button>
                <button @click=${() => changeView('middleTables')} class="btn btn-primary fs-3">Градина</button>
                <button @click=${() => changeView('outsideTables')} class="btn btn-primary fs-3">Навън</button>
            </div>
            ${tableGrid}
        </div>
    `;

    const tablesGridTemplate = (gridId, elements) => html`
        <div id=${gridId} class="tablesGrid">
            ${elements.map((element) => {
                const allClasses = `${element.type} ${element.type+element.number}`;
                //element.type = [table, bar]
                //element.number = 1,2,3... || v1,v2,v3... || n1,n2,n3...
                //element.name = Маса 1, Маса В1, Маса Н1..
                return html`<button @click=${(e) => page(`/waiter/table/${$(e.target).attr('_id')}`)} class=${allClasses} _id=${element._id}>${element.name}</button>`
            })}
        </div>
    `;

    // This functions changes the table's view (shows the inside, outside or garden tables grid)
    function changeView(viewName) {
        const tablesGrid = $('.tablesGrid'); // Get the tables grid element
        let viewToRender;

        if (viewName === 'outsideTables') 
            viewToRender = outsideTables;
        else if (viewName === 'middleTables') 
            viewToRender = middleTables;
        else if (viewName === 'insideTables')
            viewToRender = insideTables;
        
        render(tablesView(tablesGridTemplate(viewName, viewToRender)), container);
    }

    //TODO this will be in mongo
    //TODO remove _id from first table here
    const middleTables = [
        {
            _id: 'test',
            type: 'table',
            number: '1',
            name: 'Маса 1'
        },
        {
            type: 'table',
            number: '2',
            name: 'Маса 2'
        },
        {
            type: 'table',
            number: '3',
            name: 'Маса 3'
        },
        {
            type: 'table',
            number: '4',
            name: 'Маса 4'
        },
        {
            type: 'table',
            number: '5',
            name: 'Маса 5'
        },
        {
            type: 'table',
            number: '6',
            name: 'Маса 6'
        },
        {
            type: 'table',
            number: '7',
            name: 'Маса 7'
        },
        {
            type: 'table',
            number: '8',
            name: 'Маса 8'
        },
        {
            type: 'table',
            number: '9',
            name: 'Маса 9'
        },
        {
            type: 'table',
            number: '10',
            name: 'Маса 10'
        },
        {
            type: 'table',
            number: '11',
            name: 'Маса 11'
        },
        {
            type: 'table',
            number: '12',
            name: 'Маса 12'
        },
        {
            type: 'table',
            number: '13',
            name: 'Маса 13'
        },
        {
            type: 'table',
            number: '14',
            name: 'Маса 14'
        },
        {
            type: 'table',
            number: '15',
            name: 'Маса 15'
        },
        {
            type: 'table',
            number: '16',
            name: 'Маса 16'
        },

    ];

    const insideTables = [
        {
            type: 'bar',
            name: 'Бар'
        },
        {
            type: 'table',
            number: 'v1',
            name: 'Маса В1'
        },
        {
            type: 'table',
            number: 'v2',
            name: 'Маса В2'
        },
        {
            type: 'table',
            number: 'vbar',
            name: 'Маса Бар'
        },
        {
            type: 'table',
            number: 'v4',
            name: 'Маса В4'
        },
        {
            type: 'table',
            number: 'v5',
            name: 'Маса В5'
        },
        {
            type: 'table',
            number: 'v6',
            name: 'Маса В6'
        },
        {
            type: 'table',
            number: 'v7',
            name: 'Маса В7'
        },
        {
            type: 'table',
            number: 'v8',
            name: 'Маса В8'
        },
        {
            type: 'table',
            number: 'v9',
            name: 'Маса В9'
        },
        {
            type: 'table',
            number: 'v10',
            name: 'Маса В10'
        },
        {
            type: 'table',
            number: 'v11',
            name: 'Маса В11'
        },
        {
            type: 'table',
            number: 'z1',
            name: 'Маса Z1'
        },
        {
            type: 'table',
            number: 'z2',
            name: 'Маса Z2'
        },
    ]

    const outsideTables = [
        {
            type: 'table',
            number: 'n1',
            name: 'Маса Н1'
        },
        {
            type: 'table',
            number: 'n2',
            name: 'Маса Н2'
        },
        {
            type: 'table',
            number: 'n3',
            name: 'Маса Н3'
        },
        {
            type: 'table',
            number: 'n4',
            name: 'Маса Н4'
        },
    ]
    // Load default view (middle tables)
    render(tablesView(tablesGridTemplate('middleTables', middleTables)), container);
}

export async function showTableControls(e) {
    const selectedTable = e.params._id; // get selected (clicked) table _id
    
    if (selectedTable === null) return;

    const controlsTemplate = () => html`
        <div id="tableControls">
            <div class="categories">
                Load product categories here
            </div>
            <div class="products">
                When category is clicked, load products here
            </div>
            <div class="xButtons">
                    <button class="btn btn-primary">x2</button>
                    <button class="btn btn-primary">x3</button>
                    <button class="btn btn-primary">x4</button>
                    <button class="btn btn-primary">x5</button>
            </div>
            <div class="bills">
                All the bills will be shown here. By default only one is created if table is empty.
            </div>
            <div class="controls">
                <button class="btn btn-danger">Бракувай</button>
                <button class="btn btn-secondary">Извади</button>
                <button class="btn btn-success">Приключи</button>
                <button class="btn btn-primary">Назад</button>
            </div>
            <div class="total">
                Total amount for table shown here.
            </div>
            <div class="addons">
                Addons will be shown here.
                (example: milk for coffee, honey etc)
            </div>
            <div class="addedProducts">
                The products that are added will be shown here.
                (example: you click Cappy, add it here)
            </div>
        </div>
    `;

    render(controlsTemplate(), container);
}

/* 
https://grid.layoutit.com/?id=dxmghfS

THIS IS controlsTemplate

CHANGE .tableControls to #tableControls
*/


/*
grid.layoutit.com?id=gmWyp0V

CHANGE .container to #middleTables

MASI MIDDLE
<div class="container">
  <div class="table1"></div>
  <div class="table2"></div>
  <div class="table3"></div>
  <div class="table4"></div>
  <div class="table5"></div>
  <div class="table6"></div>
  <div class="table7"></div>
  <div class="table8"></div>
  <div class="table9"></div>
  <div class="table10"></div>
  <div class="table11"></div>
  <div class="table12"></div>
  <div class="table13"></div>
  <div class="table14"></div>
  <div class="table15"></div>
  <div class="table16"></div>
</div>

CSS
.container {  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 50px 10px;
  grid-auto-flow: row;
}

.table1 { grid-area: 1 / 1 / 2 / 2; }

.table2 { grid-area: 1 / 2 / 2 / 3; }

.table3 { grid-area: 1 / 3 / 2 / 4; }

.table4 { grid-area: 1 / 4 / 2 / 5; }

.table5 { grid-area: 1 / 5 / 2 / 6; }

.table6 { grid-area: 2 / 1 / 3 / 2; }

.table7 { grid-area: 2 / 2 / 3 / 3; }

.table8 { grid-area: 2 / 3 / 3 / 4; }

.table9 { grid-area: 2 / 4 / 3 / 5; }

.table10 { grid-area: 2 / 5 / 3 / 6; }

.table11 { grid-area: 2 / 6 / 3 / 7; }

.table12 { grid-area: 3 / 1 / 4 / 2; }

.table13 { grid-area: 3 / 2 / 4 / 3; }

.table14 { grid-area: 3 / 3 / 4 / 4; }

.table15 { grid-area: 3 / 4 / 4 / 5; }

.table16 { grid-area: 3 / 5 / 4 / 6; }

*/

/*
https://grid.layoutit.com/?id=JSRen8y

CHANGE .container to #insideTables

MASI VUTRE + ZALA
<div class="container">
  <div class="bar"></div>
  <div class="tablev1"></div>
  <div class="tablev2"></div>
  <div class="tablevbar"></div>
  <div class="tablev4"></div>
  <div class="tablev5"></div>
  <div class="tablev6"></div>
  <div class="tablev7"></div>
  <div class="tablev8"></div>
  <div class="tablev9"></div>
  <div class="tablev10"></div>
  <div class="tablev11"></div>
  <div class="tablez1"></div>
  <div class="tablez2"></div>
</div>

CSS
.container {  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 50px 10px;
  grid-auto-flow: row;
}

.bar { grid-area: 1 / 1 / 2 / 2; }

.tablev1 { grid-area: 3 / 2 / 4 / 3; }

.tablev2 { grid-area: 3 / 3 / 4 / 4; }

.tablevbar { grid-area: 3 / 4 / 4 / 5; }

.tablev4 { grid-area: 3 / 5 / 4 / 6; }

.tablev5 { grid-area: 2 / 2 / 3 / 3; }

.tablev6 { grid-area: 2 / 3 / 3 / 4; }

.tablev7 { grid-area: 2 / 4 / 3 / 5; }

.tablev8 { grid-area: 2 / 5 / 3 / 6; }

.tablev9 { grid-area: 1 / 3 / 2 / 4; }

.tablev10 { grid-area: 1 / 4 / 2 / 5; }

.tablev11 { grid-area: 1 / 5 / 2 / 6; }

.tablez1 { grid-area: 2 / 1 / 3 / 2; }

.tablez2 { grid-area: 3 / 1 / 4 / 2; }

*/

/*
grid.layoutit.com?id=SfNQwRe

CHANGE .container to #outsideTables

MASI OTVUN OTVUN
<div class="container">
  <div class="tablen2"></div>
  <div class="tablen1"></div>
  <div class="tablen3"></div>
  <div class="tablen4"></div>
</div>

CSS
.container {  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 50px 50px;
  grid-auto-flow: row;
}

.tablen2 { grid-area: 1 / 2 / 2 / 3; }

.tablen1 { grid-area: 1 / 1 / 2 / 2; }

.tablen3 { grid-area: 2 / 1 / 3 / 2; }

.tablen4 { grid-area: 2 / 2 / 3 / 3; }

*/

