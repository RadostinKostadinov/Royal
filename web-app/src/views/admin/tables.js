import { backBtn } from "./admin.js";
import { container } from "../../app.js";
import page from "page";
import $ from "jquery";
import { html, render } from "lit/html.js";
import axios from "axios";
import { auth } from "../api/api.js";

// PAGES

export function createTablePage() {
  async function submitTableForm(e) {
    e.preventDefault();
    const formData = new FormData(document.querySelector(".rado-add-table"));
    const tableType = formData.get("table-type");
    const tableSize = formData.get("table-size");
    const tableRotation = formData.get("table-rotation");
    const tableName = formData.get("table-name");
    const tableRoom = formData.get("table-room");

    render(
      moveTableLayout({
        tableType,
        tableSize,
        tableRotation,
        tableName,
        tableRoom,
      }),
      container
    );
  }

  function onFormStateChange(e) {
    const formData = new FormData(document.querySelector(".rado-add-table"));
    const tableType = formData.get("table-type");
    const tableSize = formData.get("table-size");
    const tableRotation = formData.get("table-rotation");
    const tableName = formData.get("table-name");
    const tableRoom = formData.get("table-room");

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

    const displayElement = document.querySelector(
      "#create-table-preview > div"
    );
    displayElement.style.width = `${width}px`;
    displayElement.style.height = `${height}px`;
    displayElement.style.transform = `rotate(${rotation}deg)`;
    displayElement.setAttribute("class", allClasses);
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

  const moveTableLayout = (tableData) => html`
    ${backBtn}
    <div id="render-tables-layout">${tableData.tableType}</div>
  `;

  render(createTableForm(), container);
}

export function tablesPages() {
  page("/admin/employee/tables", auth, createTablePage);
}
