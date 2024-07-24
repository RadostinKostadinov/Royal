import { html, render } from "lit";
import { socket, stopAllSockets } from "../../api/api";
import { getBillById, getTables } from "../waiter";
import { container } from "../../../app";
import page from "page";
import $ from "jquery";
import axios from "axios";

async function moveProducts(_id, productsToMove) {
  return await axios
    .post("/moveProducts", {
      _id,
      productsToMove,
    })
    .catch((err) => {
      return err.response;
    });
}

export async function moveProductsPage(ctx) {
  // Stop listening on old sockets
  stopAllSockets();

  const selectedTable = ctx.params.tableId;
  let bill = (await getBillById(ctx.params.billId)).data;
  let productsToMove = {
    _id: bill._id, // bill id
    number: bill.number, // bill number
    table: bill.table, // table id
    products: [],
    total: 0,
  };

  socket.on("billChanged", (billData) => {
    // First check if this user is on the same bill
    if (billData._id !== bill._id) return;

    // // Bill changed, rerender empty (default) view
    productsToMove.products = [];
    productsToMove.total = 0;
    bill.products = [];
    bill.total = 0;
    rerender(bill, productsToMove);
  });

  socket.on("addToMove/returnToBill", (data) => {
    // First check if we are on same bill
    if (bill._id !== data.bill._id) return;

    bill = data.bill;
    productsToMove = data.productsToMove;

    rerender(bill, productsToMove);
  });

  // Check if someone just entered, and if so - send them this user's bill and productsToPay
  socket.on("entered-moveProductsPage", () => {
    socket.emit("addToMove/returnToBill", { bill, productsToMove });
  });

  // Emit first time entering the page, to notify the user that is already editing (if any) to send their info
  socket.emit("entered-moveProductsPage");

  function rerender(bill, productsToMove) {
    render(
      productsInBillTemplate(bill),
      document.getElementById("productsInBill")
    );
    render(
      productsToMoveTemplate(productsToMove),
      document.getElementById("productsToPay")
    );
    render(
      html`${bill.total.toFixed(2)}`,
      document.querySelector("#totalOnTable .price")
    );
    render(
      html`${productsToMove.total.toFixed(2)}`,
      document.querySelector("#totalToPay .price")
    );
  }

  function addToMove(index, product) {
    // Transfer 1 qty of this product
    // index in bill.products array
    product.qty--; // this is referencing directly the object in bill
    bill.total -= product.product.sellPrice;

    if (product.qty === 0) bill.products.splice(index, 1); // remove from array if qty = 0

    let foundProduct = false;
    for (let pr of productsToMove.products) {
      if (pr.product._id === product.product._id) {
        pr.qty++;
        foundProduct = true;
        break;
      }
    }

    // if product not found, create it
    if (foundProduct === false) {
      productsToMove.products.push({
        product: product.product,
        qty: 1,
      });
    }

    productsToMove.total += product.product.sellPrice;

    socket.emit("addToMove/returnToBill", { bill, productsToMove });

    // Rerender both bill and toPay
    rerender(bill, productsToMove);
  }

  function returnToBill(index, product) {
    // Transfer 1 qty of this product BACK to bill

    product.qty--;
    productsToMove.total = productsToMove.total - product.product.sellPrice;

    if (product.qty === 0) productsToMove.products.splice(index, 1);

    let foundProduct = false;
    for (let pr of bill.products) {
      if (pr.product._id === product.product._id) {
        pr.qty++;
        foundProduct = true;
        break;
      }
    }

    if (foundProduct === false) {
      bill.products.push({
        product: product.product,
        qty: 1,
      });
    }
    bill.total += product.product.sellPrice;

    socket.emit("addToMove/returnToBill", { bill, productsToMove });

    // Rerender both bill and toPay
    rerender(bill, productsToMove);
  }

  const productsInBillTemplate = (bill) => html`
    <table class="text-center">
      <thead>
        <tr>
          <th width="50%">Артикул</th>
          <th width="15%">Брой</th>
          <th width="15%">Сума</th>
          <th width="20%"></th>
        </tr>
      </thead>
      <tbody>
        ${bill.products.map((product, index) => {
          return html` <tr>
            <td width="50%">${product.product.name}</td>
            <td width="15%">${product.qty}</td>
            <td width="15%">
              ${(product.product.sellPrice * product.qty).toFixed(2)}
            </td>
            <td
              @click=${() => addToMove(index, product)}
              width="20%"
              class="text-uppercase remove cursor-pointer"
            >
              Премести
            </td>
          </tr>`;
        })}
      </tbody>
    </table>
  `;

  const productsToMoveTemplate = (bill) => html`
    <table class="text-center">
      <thead>
        <tr>
          <th width="50%">Артикул</th>
          <th width="15%">Брой</th>
          <th width="15%">Сума</th>
          <th width="20%"></th>
        </tr>
      </thead>
      <tbody>
        ${bill.products.map((product, index) => {
          return html` <tr>
            <td width="50%">${product.product.name}</td>
            <td width="15%">${product.qty}</td>
            <td width="15%">
              ${(product.product.sellPrice * product.qty).toFixed(2)}
            </td>
            <td
              @click=${() => returnToBill(index, product)}
              width="20%"
              class="cursor-pointer text-uppercase back"
            >
              Върни
            </td>
          </tr>`;
        })}
      </tbody>
    </table>
  `;

  async function movePrdcts(e) {
    // Get selected table _id
    const _id = $(e.target).attr("_id");
    if (productsToMove.products.length === 0) return;

    if (bill.table === _id) return;

    const res = await moveProducts(_id, productsToMove);

    if (res.status === 200) {
      const newBill = res.data; // new bill (that we moved the items to), used for rerendering table view in dashboard page
      // Notify anyone that is already in this screen
      productsToMove.products = [];
      productsToMove.total = 0;

      // Notify anyone still paying products
      socket.emit("addToMove/returnToBill", { bill, productsToMove });

      // Notify that bill changed, rerender wherever needed
      // Call it twice with new and current bill here, so if anyone in any of them, rerender
      socket.emit("billChanged", bill); // send CURRENT bill to server to rerender for anyone in same view
      socket.emit("billChanged", newBill); // send NEW bill to server to rerender for anyone in same view
      page(`/waiter/table/${selectedTable}`);
    } else {
      console.error(res);
      alert("Възникна грешка!");
    }
  }

  async function renderTables(viewname) {
    // Get tables for inside or middle
    let elements;
    const res = await getTables(viewname);

    if (res.status !== 200) {
      console.error(res);
      return alert("Възникна грешка!");
    }

    elements = res.data; // elements includes tables, walls, bar ..

    render(
      gridTemplate(viewname, elements),
      document.getElementById("modal-tables")
    );
  }

  const gridTemplate = (gridId, elements) => html`
    <div id=${gridId} class="tablesGrid">
      ${elements.map((element) => {
        const taken = element.total > 0 ? "taken" : "";
        const allClasses = `${element.type} ${element.class} ${taken}`;
        //element.type = [table, text, wall]
        //element.class = 1,2,3... || v1,v2,v3... || n1,n2,n3...
        //element.name = Маса 1, Маса В1, Маса Н1..
        //element.total = undefined (if != table) || number (ex. 12.50) (if == table)
        if (element.type === "wall")
          return html` <div class=${allClasses}></div> `;

        if (element.type === "text")
          return html` <div class=${allClasses}>${element.name}</div> `;

        return html` <button
          @click=${movePrdcts}
          class=${allClasses}
          _id=${element._id}
        >
          <span class="name pe-none">${element.name}</span>
          <span class="total pe-none"
            >${element.total ? element.total.toFixed(2) : ""}</span
          >
        </button>`;
      })}
    </div>
  `;

  const template = () => html`
    <div
      class="modal fade"
      id="tablesModal"
      tabindex="-1"
      aria-labelledby="tablesModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered modal-fullscreen">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="tablesModalLabel">Избери маса</h5>
          </div>
          <div class="modal-body">
            <div id="modal-tables"></div>
          </div>
          <div class="modal-footer">
            <button
              @click=${() => renderTables("inside")}
              type="button"
              class="gray-btn"
            >
              Вътре
            </button>
            <button
              @click=${() => renderTables("garden")}
              type="button"
              class="gray-btn"
            >
              Градина
            </button>
            <button type="button" class="gray-btn" data-bs-dismiss="modal">
              Затвори
            </button>
          </div>
        </div>
      </div>
    </div>

    <div id="payPartOfBill">
      <div id="productsInBill" class="productsTables"></div>
      <div
        id="controlsAndTotals"
        class="d-flex gap-3 flex-column justify-content-between"
      >
        <div
          class="totals d-flex flex-column justify-content-between text-center"
        >
          <div id="totalOnTable" class="totalBlock">
            <span>Оставаща сума на масата</span>
            <div class="price"></div>
          </div>
          <div id="totalToPay" class="totalBlock">
            <span>Сума за местене</span>
            <div class="price"></div>
          </div>
        </div>
        <div class="controls d-flex flex-column justify-content-between">
          <div class="d-flex gap-3 flex-column justify-content-evenly">
            <button data-bs-toggle="modal" data-bs-target="#tablesModal">
              Премести
            </button>
          </div>
          <button @click=${() => page(`/waiter/table/${selectedTable}`)}>
            Отказ
          </button>
        </div>
      </div>
      <div id="productsToPay" class="productsTables"></div>
    </div>
  `;

  // Load default table in modal
  renderTables("garden");

  render(template(), container);
  rerender(bill, productsToMove);
}
