import { backBtn } from "./admin.js";
import { container } from "../../app.js";
import page from "page";
import $ from "jquery";
import { html, render } from "lit/html.js";
import axios from "axios";
import { auth } from "../api/api.js";
import { loadRoom } from "../../components/loadRoom.js";

// PAGES

let tableData = {};
export async function createTablePage() {
  async function submitTableForm(e) {
    e.preventDefault();
    const formData = new FormData(document.querySelector(".rado-add-table"));
    const tableType = formData.get("table-type");
    const tableSize = formData.get("table-size");
    const tableRotation = formData.get("table-rotation");
    const tableName = formData.get("table-name");
    const tableRoom = formData.get("table-room");

    tableData = {
      tableType,
      tableSize,
      tableRotation,
      tableName,
      tableRoom,
    };

    render(await moveTableLayout(tableData), container);
  }

  function calculateTableSpecs(
    tableType,
    tableSize,
    tableRotation,
    tableName,
    tableRoom
  ) {
    let allClasses = "table-rado";

    if (tableType === "circle") {
      allClasses += " table-circle-rado";
    }

    if (tableType === "corner") {
      switch (tableSize) {
        case "small":
          allClasses += " table-corner-small-rado";
          break;
        case "medium":
          allClasses += " table-corner-medium-rado";
          break;
        case "large":
          allClasses += " table-corner-large-rado";
          break;
      }
    }

    const tableTypes = {
      rectangle: {
        small: {
          width: 50,
          height: 100,
        },
        medium: {
          width: 100,
          height: 150,
        },
        large: {
          width: 150,
          height: 200,
        },
      },
      square: {
        small: {
          width: 50,
          height: 50,
        },
        medium: {
          width: 100,
          height: 100,
        },
        large: {
          width: 150,
          height: 150,
        },
      },
      circle: {
        small: {
          width: 50,
          height: 50,
        },
        medium: {
          width: 100,
          height: 100,
        },
        large: {
          width: 150,
          height: 150,
        },
      },
      corner: {
        small: {
          width: 50,
          height: 50,
        },
        medium: {
          width: 100,
          height: 100,
        },
        large: {
          width: 150,
          height: 150,
        },
      },
    };
    const width = tableTypes[tableType][tableSize].width;
    const height = tableTypes[tableType][tableSize].height;
    const rotation = tableRotation.split("degrees")[0];

    return { width, height, rotation, allClasses };
  }

  function onFormStateChange(e) {
    const formData = new FormData(document.querySelector(".rado-add-table"));
    const tableType = formData.get("table-type");
    const tableSize = formData.get("table-size");
    const tableRotation = formData.get("table-rotation");
    const tableName = formData.get("table-name");
    const tableRoom = formData.get("table-room");

    const tableHTMLSpecs = calculateTableSpecs(
      tableType,
      tableSize,
      tableRotation
    );

    const displayElement = document.querySelector(
      "#create-table-preview > div"
    );
    displayElement.style.width = `${tableHTMLSpecs.width}px`;
    displayElement.style.height = `${tableHTMLSpecs.height}px`;
    displayElement.style.transform = `rotate(${tableHTMLSpecs.rotation}deg)`;
    displayElement.setAttribute("class", tableHTMLSpecs.allClasses);
  }

  async function createTable(event) {
    const res = await axios.post("/createTable", tableData);

    if (res.status === 201) {
      page(`/`);
    } else {
      // TODO: Show alert with error message according to status code / server error code
    }
  }

  const createTableForm = () => html`
    ${backBtn}
    <form
      autocomplete="off"
      @submit=${submitTableForm}
      class="rado-add-table d-flex m-auto mt-5 flex-column gap-5 p-3 fs-3"
      @change=${onFormStateChange}
    >
      <div class="text-center">
        <label class="form-label">Вид маса</label><br />
        <div>
          <input
            type="radio"
            id="rectangle"
            name="table-type"
            value="rectangle"
          />
          <label for="rectangle">Правоъгълна</label><br />
          <input
            type="radio"
            id="square"
            name="table-type"
            value="square"
            checked
          />
          <label for="square">Квадратна</label><br />
          <input type="radio" id="circle" name="table-type" value="circle" />
          <label for="circle">Кръгла</label><br />
          <input type="radio" id="corner" name="table-type" value="corner" />
          <label for="corner">Ъглова</label><br />
        </div>
      </div>

      <div class="text-center">
        <label class="form-label">Големина на масата</label><br />
        <div>
          <input type="radio" id="small" name="table-size" value="small" />
          <label for="small">Малка</label><br />
          <input
            type="radio"
            id="medium"
            name="table-size"
            value="medium"
            checked
          />
          <label for="medium">Средна</label><br />
          <input type="radio" id="large" name="table-size" value="large" />
          <label for="large">Голяма</label><br />
        </div>
      </div>

      <div class="text-center">
        <label class="form-label">Завъртане на масата (градуси)</label><br />
        <div>
          <input
            type="radio"
            id="0degrees"
            name="table-rotation"
            value="0degrees"
            checked
          />
          <label for="0degrees">0</label><br />
          <input
            type="radio"
            id="45degrees"
            name="table-rotation"
            value="45degrees"
          />
          <label for="45degrees">45</label><br />
          <input
            type="radio"
            id="90degrees"
            name="table-rotation"
            value="90degrees"
          />
          <label for="90degrees">90</label><br />
          <input
            type="radio"
            id="135degrees"
            name="table-rotation"
            value="135degrees"
          />
          <label for="135degrees">135</label><br />
          <input
            type="radio"
            id="180degrees"
            name="table-rotation"
            value="180degrees"
          />
          <label for="180degrees">180</label><br />
          <input
            type="radio"
            id="225degrees"
            name="table-rotation"
            value="225degrees"
          />
          <label for="225degrees">225</label><br />
          <input
            type="radio"
            id="270degrees"
            name="table-rotation"
            value="270degrees"
          />
          <label for="270degrees">270</label><br />
          <input
            type="radio"
            id="315degrees"
            name="table-rotation"
            value="315degrees"
          />
          <label for="315degrees">315</label><br />
        </div>
      </div>

      <div class="text-center">
        <label class="form-label">Име на масата</label>
        <input
          class="form-control fs-3"
          name="table-name"
          required
          type="text"
          placeholder="пример: Маса 1"
        />
      </div>

      <div class="text-center">
        <label class="form-label">Помещение</label><br />
        <div>
          <input type="radio" id="inside" name="table-room" value="inside" />
          <label for="inside">Вътре</label><br />
          <input type="radio" id="garden" name="table-room" value="garden" />
          <label for="garden">Градина</label><br />
          <input
            type="radio"
            id="outside"
            name="table-room"
            value="outside"
            checked
          />
          <label for="outside">Навън</label><br />
        </div>
      </div>

      <div id="create-table-preview">
        <div></div>
      </div>
      <input class="btn btn-primary fs-3" type="submit" value="Напред" />
    </form>
  `;

  let firstTouchX = 0;
  let firstTouchY = 0;

  const onTableDrag = (event) => {
    const deltaX = event.touches[0].clientX - firstTouchX;
    const deltaY = event.touches[0].clientY - firstTouchY;
    event.target.style.left = `${deltaX}px`;
    event.target.style.top = `${deltaY}px`;
    event.preventDefault();
  };

  const onTableDragStart = (event) => {
    firstTouchX = Math.abs(event.target.offsetLeft - event.touches[0].clientX);
    firstTouchY = Math.abs(event.target.offsetTop - event.touches[0].clientY);
  };

  const onTableDragEnd = (event) => {
    // Save target coordinates
    tableData.HTMLSpecs.left = event.target.offsetLeft;
    tableData.HTMLSpecs.top = event.target.offsetTop;
  };

  const moveTableLayout = async (tableData) => {
    // Get all tables for the selected room

    const tableHTMLSpecs = calculateTableSpecs(
      tableData.tableType,
      tableData.tableSize,
      tableData.tableRotation
    );
    tableData.HTMLSpecs = tableHTMLSpecs;
    // setTimeout(async () => {
    //   render(
    //     ,
    //     document.querySelector(".room-wrapper")
    //   );
    // }, 100);

    return html`
      <style>
        body {
          background-color: var(--bg-menu);
        }

        #created-table.table-rado {
          background-color: #00ff1d;
          z-index: 9999;
          width: ${tableHTMLSpecs.width}px;
          height: ${tableHTMLSpecs.height}px;
          transform: rotate(${tableHTMLSpecs.rotation}deg);
          pointer-events: all;
          position: relative;
        }

        #created-table.table-rado::before {
          background-color: var(--bg-dark);
        }

        .room-wrapper {
          width: calc(88.24% + 1rem);
          height: calc(100% - 72px - 1rem);
          overflow: hidden;
          display: inline-block;
          position: relative;
        }

        .room-view {
          width: 100%;
          height: 100%;
          overflow: hidden;
          position: absolute;
          top: 0;
          left: 0;
        }

        .side-buttons {
          display: inline-flex;
          gap: 10px;
          flex-direction: column;
        }
      </style>
      <div class="room-wrapper">
        ${await loadRoom(tableData.tableRoom)}
        <div class="room-view">
          <div
            id="created-table"
            draggable="true"
            class="${tableHTMLSpecs.allClasses}"
            @touchstart=${onTableDragStart}
            @touchmove=${onTableDrag}
            @touchend="${onTableDragEnd}"
          >
            1
          </div>
        </div>
      </div>
      <div class="side-buttons">
        <button type="button" @click=${createTable}>ЗАПАЗИ</button>
      </div>
    `;
    // return html` <p>${JSON.stringify(tableData)}</p> `;

    // Render all tables for the selected room
    const tableElements = tables.map((table) => {
      return html`
        <div
          class="table-layout-item"
          style="width: ${tableData.tableWidth}px; height: ${tableData.tableHeight}px; transform: rotate(${tableData.tableRotation}deg)"
        >
          <div class="table-layout-item-name">${table.name}</div>
        </div>
      `;
    });

    // return html`
    //   ${backBtn}
    //   <div id="render-tables-layout">
    //     <div></div>
    //   </div>
    // `;
  };

  render(createTableForm(), container);
}

export function tablesPages() {
  page("/admin/tables/create", auth, createTablePage);
}
