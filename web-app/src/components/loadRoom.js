import axios from "axios";
import { html } from "lit";
import page from "page";
import "../css/waiter/tables/dynamicTables.css";

export async function loadRoom(
  room = "garden",
  openTables = null,
  moveProducts = null,
  editTable = null
) {
  // Fetch rooms from the database
  const { data: tables } = await getTables(room);

  // Return HTML
  return html`<div class="room ${room}">
    ${tables.map((table) => {
      return html`
        <div
          id=${table._id}
          class="table ${table.HTMLSpecs.allClasses} ${table.total
            ? "taken"
            : ""}"
          style="
                    position: absolute;
                    z-index: 1000;
                    pointer-events: all;
                    width: ${table.HTMLSpecs.width}px;
                    height: ${table.HTMLSpecs.height}px;
                    transform: rotate(${table.HTMLSpecs.rotation}deg);
                    left: ${table.HTMLSpecs.left}px;
                    top: ${table.HTMLSpecs.top}px;"
          @click=${(e) => {
            if (openTables) {
              page(`/waiter/table/${table._id}`);
            } else if (moveProducts) {
              moveProducts(e);
            }
          }}
          @touchstart=${(e) => {
            editTable && editTable.onTableDragStart(e);
          }}
          @touchmove=${(e) => {
            editTable && editTable.onTableDrag(e);
          }}
          @touchend="${async (e) => {
            editTable && (await editTable.onTableDragEnd(e, table));
          }}"
        >
          <span class="name pe-none">${table.name}</span><br />
          <span class="total pe-none"
            >${table.total ? table.total.toFixed(2) : ""}</span
          >
        </div>
      `;
    })}
  </div>`;
}

async function getTables(room) {
  const res = await axios.post("/getTables", {
    location: room,
  });
  return res;
}
