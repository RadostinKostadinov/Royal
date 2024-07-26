import axios from "axios";
import { html } from "lit";
import page from "page";

export async function loadRoom(room = "garden", openTables = true) {
  // Fetch rooms from the database
  const { data: tables } = await getTables(room);

  console.log(tables);
  console.log(openTables);
  console.log(
    openTables
      ? html`@click=${() => {
          console.log("asdasdas");
        }}`
      : html`""`
  );
  // Return HTML
  return html`<div class="room ${room}">
    ${tables.map((table) => {
      return html`
        <div
          id=${table._id}
          class="${table.HTMLSpecs.allClasses}"
          style="
                    position: absolute;
                    z-index: 1000;
                    pointer-events: all;
                    width: ${table.HTMLSpecs.width}px;
                    height: ${table.HTMLSpecs.height}px;
                    transform: rotate(${table.HTMLSpecs.rotation}deg);
                    left: ${table.HTMLSpecs.left}px;
                    top: ${table.HTMLSpecs.top}px;"
          @click=${() => {
            if (openTables) {
              page(`/waiter/table/${table._id}`);
            }
          }}
        >
          <span class="name pe-none">${table.name}</span>
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

/*



              */
