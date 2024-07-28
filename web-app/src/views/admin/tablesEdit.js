import { backBtn } from "./admin.js";
import { container } from "../../app.js";
import page from "page";
import { html, render } from "lit/html.js";
import axios from "axios";
import { auth } from "../api/api.js";
import { loadRoom } from "../../components/loadRoom.js";

// PAGES
let firstTouchX = 0;
let firstTouchY = 0;

const onTableDragStart = (event) => {
  firstTouchX = Math.abs(event.target.offsetLeft - event.touches[0].clientX);
  firstTouchY = Math.abs(event.target.offsetTop - event.touches[0].clientY);
};

const onTableDrag = (event) => {
  const deltaX = event.touches[0].clientX - firstTouchX;
  const deltaY = event.touches[0].clientY - firstTouchY;
  event.target.style.left = `${deltaX}px`;
  event.target.style.top = `${deltaY}px`;
};

const onTableDragEnd = async (event, table) => {
  table.HTMLSpecs.left = event.target.offsetLeft;
  table.HTMLSpecs.top = event.target.offsetTop;

  await updateTable(table);
};

async function editTableLayout(room) {
  const roomHTML = await loadRoom(room, false, false, {
    onTableDragStart,
    onTableDragEnd,
    onTableDrag,
  });

  return render(
    html`
      <style>
        body {
          background-color: var(--bg-menu);
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
      </style>
      <div class="room-wrapper">${roomHTML}</div>
      <div class="side-buttons">
        ${backBtn}
        <button
          type="button"
          @click=${async () => await editTableLayout("outside")}
        >
          Навън
        </button>
        <button
          type="button"
          @click=${async () => await editTableLayout("inside")}
        >
          Вътре
        </button>
        <button
          type="button"
          @click=${async () => await editTableLayout("garden")}
        >
          Градина
        </button>
      </div>
    `,
    container
  );
}

const updateTable = async (tableData) => {
  await axios.patch(`/editTable/${tableData._id}`, {
    HTMLSpecs: tableData.HTMLSpecs,
  });
};

export function tablesEditPage() {
  page(
    "/admin/tables/edit",
    auth,
    async () => await editTableLayout("outside")
  );
}
