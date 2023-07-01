import axios from 'axios';
import page from 'page';
import $ from "jquery";
import { io } from "socket.io-client";

export let user = JSON.parse(sessionStorage.getItem('user'));
// Set base url so you dont type ${url} in every request
let nodeURL = 'http://localhost:3000';

if (location.hostname !== "localhost" && location.hostname !== "127.0.0.1")
    nodeURL = 'http://31.211.145.98:3000'; // Use this when hosted on local server and has no domain pointed to it
//nodeURL = 'http://barroyal.eu:3000'; // LIVE (use when uploaded to online server with domain)

if (location.hostname.startsWith("192.")) // FOR LOCAL USE WHEN SECOND PC IS A SERVER
    nodeURL = `http://${location.hostname}:3000`;

axios.defaults.baseURL = nodeURL;

// Set the token in headers
if (user)
    axios.defaults.headers.common['authorization'] = user.token;

export var socket = io(nodeURL);
var elem = document.documentElement;

function openFullscreen() {
    // Check if current url is localhost
    if (location.hostname === "localhost")
        return;

    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
}

function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    }
}

export function fixPrice(price) {
    // Convert to xx xxx.xx
    price = price.toFixed(2);
    price = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return price;
}

export function stopAllSockets() {
    socket.off('addToMove/returnToBill');
    socket.off('entered-moveProductsPage');
    socket.off('order:clearAll');
    socket.off('order:change');
    socket.off('billChanged');
    socket.off('addToScrap/returnToBill');
    socket.off('addToPay/returnToBill');
    socket.off('entered-payPartOfBillPage');
    socket.off('entered-scrapProductsPage');
}

export async function getConsumed() {
    return await axios.get('/getConsumed');
}

export async function getNumberOfExpiredProducts() {
    const res = await axios.get('/getNumberOfExpiredProducts');
    return res.data;
}

export async function getTodaysReport() {
    return await axios.get('/getTodaysReport').catch((err) => {
        return err.response;
    });
}

export async function markExpiredAsReviewed(_id) {
    return await axios.post('/markExpiredAsReviewed', {
        _id
    }).catch((err) => {
        return err.response;
    });
}

export async function getRestockHistory(fromDate, toDate, _id, type) {
    return await axios.post('/getRestockHistory', {
        fromDate,
        toDate,
        _id,
        type
    }).catch((err) => {
        return err.response;
    });
}

export async function getInformation(fromDate, toDate) {
    return await axios.post('/getInformation', {
        fromDate,
        toDate
    }).catch((err) => {
        return err.response;
    });
}

export async function completeAll(prodRef, orderId) {
    return await axios.post('/completeAll', {
        prodRef,
        orderId
    }).catch((err) => {
        return err.response;
    });
}

export async function completeOne(prodRef, orderId) {
    return await axios.post('/completeOne', {
        prodRef,
        orderId
    }).catch((err) => {
        return err.response;
    });
}

export async function getAllconsumption(fromDate, toDate, user) {
    return await axios.post('/getAllconsumption', {
        fromDate,
        toDate,
        user
    }).catch((err) => {
        return err.response;
    });
}

export async function getAllReports(fromDate, toDate) {
    return await axios.post('/getAllReports', {
        fromDate,
        toDate
    }).catch((err) => {
        return err.response;
    });
}

export async function getAllOrders() {
    const res = await axios.get('/getAllOrders');
    return res.data;
}

export async function getAllRestockedProducts() {
    const res = await axios.get('/getAllRestockedProducts');
    return res.data;
}

export async function getAddonsForCategory(_id) {
    return await axios.post('/getAddonsForCategory', {
        _id
    }).catch((err) => {
        return err.response;
    });
}

export async function getAllAddons() {
    const res = await axios.get('/getAllAddons');
    return res.data;
}

export async function getAllPaidBills() {
    const res = await axios.get('/getAllPaidBills');
    return res.data;
}

export async function getAllScrapped() {
    const res = await axios.get('/getAllScrapped');
    return res.data;
}

export async function getLastPaidBillByTableId(_id, billId) {
    return await axios.post('/getLastPaidBillByTableId', {
        _id,
        billId
    }).catch((err) => {
        return err.response;
    });
}

export async function markProductAsScrapped(_id) {
    return await axios.post('/markProductAsScrapped', {
        _id
    }).catch((err) => {
        return err.response;
    });
}

export async function scrapProducts(billToScrap) {
    return await axios.post('/scrapProducts', {
        billToScrap
    }).catch((err) => {
        return err.response;
    });
}

export async function moveProducts(_id, productsToMove) {
    return await axios.post('/moveProducts', {
        _id,
        productsToMove
    }).catch((err) => {
        return err.response;
    });
}

export async function sellProducts(billToPay, discount) {
    return await axios.post('/sellProducts', {
        billToPay,
        discount
    }).catch((err) => {
        return err.response;
    });
}

export async function scrapRestockIngredient(_id, qty, action, expireDate) {
    return await axios.post('/scrapRestockIngredient', {
        _id,
        qty,
        action,
        expireDate
    }).catch((err) => {
        return err.response;
    });
}

export async function editIngredient(_id, name, unit, qty, buyPrice, sellPrice) {
    return await axios.post('/editIngredient', {
        _id,
        name,
        unit,
        qty,
        buyPrice,
        sellPrice
    }).catch((err) => {
        return err.response;
    });
}

export async function createIngredient(name, unit, qty, buyPrice, sellPrice) {
    return await axios.post('/createIngredient', {
        name,
        unit,
        qty,
        buyPrice,
        sellPrice
    }).catch((err) => {
        return err.response;
    });
}

export async function deleteIngredient(_id) {
    return await axios.post('/deleteIngredient', {
        _id
    }).catch((err) => {
        return err.response;
    });
}

export async function getIngredientById(_id) {
    return await axios.post('/getIngredientById', {
        _id
    }).catch((err) => {
        return err.response;
    });
}

export async function getAllIngredients() {
    const res = await axios.get('/getAllIngredients');
    return res.data;
}


export async function completeOrder(_id) {
    return await axios.post('/completeOrder', {
        _id
    }).catch((err) => {
        return err.response;
    });
}

export async function createNewOrder(products, tableId) {
    return await axios.post('/createNewOrder', {
        products,
        tableId
    }).catch((err) => {
        return err.response;
    });
}

// NEW WAY, all as array
export async function addProductsToHistory(addedProducts, selectedBillId) {
    return await axios.post('/addProductsToHistory', {
        addedProducts, // array of products {_id, selectedX (qty)}
        selectedBillId
    }).catch((err) => {
        return err.response;
    });
}

// OLD WAY, products one by one
export async function addProductToBill(_id, selectedX, selectedBillId) {
    return await axios.post('/addProductToBill', {
        _id, // product _id
        selectedX, // 1,2,3,4,5 (how many qty of this product to add)
        selectedBillId, // bill _id
    }).catch((err) => {
        return err.response;
    });
}

export async function removeOneFromBill(_id, billId) {
    return await axios.post('/removeOneFromBill', {
        _id, // product id
        billId
    }).catch((err) => {
        return err.response;
    });
}

export async function getBillById(_id) {
    return await axios.post('/getBillById', {
        _id, // bill _id
    }).catch((err) => {
        return err.response;
    });
}

export async function scrapRestockProduct(_id, qty, action, expireDate) {
    return await axios.post('/scrapRestockProduct', {
        _id,
        qty,
        action,
        expireDate
    }).catch((err) => {
        return err.response;
    });
}

export async function createProduct(name, qty, selectedIngredients, buyPrice, sellPrice, categoryId, forBartender) {
    return await axios.post('/createProduct', {
        name,
        qty,
        ingredients: selectedIngredients,
        buyPrice,
        sellPrice,
        categoryId,
        forBartender
    }).catch((err) => {
        return err.response;
    });
}

export async function deleteProduct(_id) {
    return await axios.post('/deleteProduct', {
        _id
    }).catch((err) => {
        return err.response;
    });
}

export async function saveRevision(revision) {
    return await axios.post('/saveRevision', {
        revision
    }).catch((err) => {
        return err.response;
    });
}

export async function getAllRevisions() {
    const res = await axios.get('/getAllRevisions');
    return res.data;
}

export async function editProduct(_id, name, qty, selectedIngredients, buyPrice, sellPrice, categoryId, forBartender) {
    return await axios.post('/editProduct', {
        _id,
        name,
        qty,
        ingredients: selectedIngredients,
        buyPrice,
        sellPrice,
        categoryId,
        forBartender
    }).catch((err) => {
        return err.response;
    });
}

export async function sortProducts(products) {
    return await axios.post('/sortProducts', {
        products
    }).catch((err) => {
        return err.response;
    });
}

export async function getProductsFromCategory(_id) {
    return await axios.post('/getProductsFromCategory', {
        _id
    }).catch((err) => {
        return err.response;
    });
}

export async function getProductsIngredients(_id) {
    return await axios.post('/getProductsIngredients', {
        _id
    }).catch((err) => {
        return err.response;
    });
}

export async function getProductById(_id) {
    return await axios.post('/getProductById', {
        _id
    }).catch((err) => {
        return err.response;
    });
}

export async function getTableTotalById(_id) {
    return await axios.post('/getTableTotalById', {
        _id
    }).catch((err) => {
        return err.response;
    });
}

export async function getTables(location) {
    return await axios.post('/getTables', {
        location
    }).catch((err) => {
        return err.response;
    });
}

export async function getProductsWithoutIngredientsFromCategory(_id) {
    const res = await axios.post('/getProductsWithoutIngredientsFromCategory', { _id });
    return res.data;
}

export async function getProductSells(fromDate, toDate, _id) {
    return await axios.post('/getProductSells', {
        fromDate,
        toDate,
        _id
    }).catch((err) => {
        return err.response;
    });
}

export async function getAllProductsWithoutIngredients() {
    const res = await axios.get('/getAllProductsWithoutIngredients');
    return res.data;
}

export async function getAllProductsFromIngredients() {
    const res = await axios.get('/getAllProductsFromIngredients');
    return res.data;
}

export async function getAllProducts() {
    const res = await axios.get('/getAllProducts');
    return res.data;
}

export async function getAllCategories(showHidden) {
    const res = await axios.post('/getAllCategories', { showHidden });
    return res.data;
}

export async function getAllUsers() {
    const res = await axios.get('/getAllUsers');
    return res.data;
}

export async function login(id, pin) {
    // Send data to backend
    return await axios.post('/login', {
        id,
        pin
    })
        .then((res) => {
            // Set user info
            user = {
                name: res.data.name,
                role: res.data.role,
                token: res.data.token
            }

            // Save in session
            sessionStorage.setItem('user', JSON.stringify(user));

            // Set the token in headers
            axios.defaults.headers.common['authorization'] = user.token;

            // Activate full screen
            openFullscreen();

            return 'success';
        })
        .catch((err) => {
            return err.response;
        });
}

export async function createUser(name, pin, role) {
    return await axios.post('/createUser', {
        name,
        pin,
        role
    }).catch((err) => {
        return err.response;
    });
}

export async function deleteUser(_id) {
    return await axios.post('/deleteUser', {
        _id
    }).catch((err) => {
        return err.response;
    });
}

export async function editUser(_id, selectedChange, newValue) {
    return await axios.post('/editUser', {
        _id,
        selectedChange,
        newValue
    }).catch((err) => {
        return err.response;
    });
}

export async function createCategory(name, type, parentCategoryId) {
    return await axios.post('/createCategory', {
        name, type, parentCategoryId
    }).catch((err) => {
        return err.response;
    });
}

export async function deleteCategory(_id) {
    return await axios.post('/deleteCategory', {
        _id
    }).catch((err) => {
        return err.response;
    });
}

export async function editCategory(_id, name) {
    return await axios.post('/editCategory', {
        _id, name
    }).catch((err) => {
        return err.response;
    });
}

export async function sortCategories(categories) {
    return await axios.post('/sortCategories', {
        categories
    }).catch((err) => {
        return err.response;
    });
}

export async function generatePersonalBill() {
    return await axios.get('/generatePersonalBill').catch((err) => {
        return err.response;
    });
}

export async function generateBills(_id) {
    return await axios.post('/generateBills', {
        _id
    }).catch((err) => {
        return err.response;
    });
}

export async function checkSitePass(pass) {
    return await axios.post('/checkSitePass', {
        pass
    }).catch((err) => {
        return err.response;
    });
}

export async function logout() {
    // Update user's report before logging out
    const res = await axios.get('/updateReport');

    if (res.status !== 200) {
        console.error(res);
        alert('Възникна грешка!')
    }

    user = undefined;
    sessionStorage.clear();
    closeFullscreen();
    page('/');
}

// PRINTER
const printerIp = '192.168.0.171'; // Royal IP
const printerPort = 8008;
var printer = null;
export var printerStatusClass = 'text-warning';
var ePosDev = new epson.ePOSDevice();

initializePrinter();

function initializePrinter() {
    ePosDev.connect(printerIp, printerPort, cbConnect);
}

function cbConnect(data) {
    if (data == 'OK' || data == 'SSL_CONNECT_OK') {
        ePosDev.createDevice('local_printer', ePosDev.DEVICE_TYPE_PRINTER,
            { 'crypto': true, 'buffer': false }, cbCreateDevice_printer);
    } else {
        console.error('PRINTER ERROR: ' + data);
        // Remove old status icon color
        $('#printerStatusIcon').removeClass(printerStatusClass);
        printerStatusClass = 'text-danger';
        // Set new status icon color
        $('#printerStatusIcon').addClass(printerStatusClass);
    }
}

function cbCreateDevice_printer(devobj, retcode) {
    if (retcode == 'OK') {
        printer = devobj;
        printer.timeout = 5000;
        printer.onpaperend = () => alert('Няма хартия в принтера!')
        console.log('Printer connected.');

        // Change printer icon to green
        // Remove old status icon color
        $('#printerStatusIcon').removeClass(printerStatusClass);
        printerStatusClass = 'text-success';
        // Set new status icon color
        $('#printerStatusIcon').addClass(printerStatusClass);
    } else {
        console.error('PRINTER ERROR: ' + retcode);
        alert('Възникна грешка с принтера!');
    }
}

export function printBill(history, tableName, discount) {
    if (printer === null)
        return alert('Няма свързан принтер!');


    // Get employee name and capitalize first letter
    let employee = history.user.name;
    employee = employee.charAt(0).toUpperCase() + employee.slice(1);


    // Company info
    printer.addTextAlign(printer.ALIGN_CENTER);
    printer.addText('\"АРТ-АТУ-АНАТОЛИ-УЗУНТОНЕВ\" ЕООД\n');
    printer.addText('гр.БЯЛА, бул. СТЕФАН СТАМБОЛОВ 18\n');
    printer.addText('ЕИК: 206081751\n');
    printer.addText('КАФЕ \"РОЯЛ\"\n');
    printer.addText('ГРАД БЯЛА, УЛ. ХАДЖИ ДИМИТЪР 1\n');
    printer.addText('ЗДДС N BG206081751\n\n');
    printer.addTextAlign(printer.ALIGN_LEFT);
    // END Company info

    // Create employee string for printer
    let strEmployee = ['СЛУЖИТЕЛ', '', employee];
    for (let i = strEmployee[0].length + strEmployee[2].length; i < 48; i++) // Fill with spaces between
        strEmployee[1] += ' ';
    strEmployee = strEmployee.join('') + '\n'; // Result is: СЛУЖИТЕЛ       Димитър
    printer.addText(strEmployee); // Employee line

    printer.addText(tableName + '\n\n'); // Table line

    // All products
    for (let product of history.products) {
        const productTotal = fixPrice(product.qty * product.sellPrice);

        let strProduct = [product.name, '', productTotal + ' ЛВ.'];

        for (let i = strProduct[0].length + strProduct[2].length; i < 48; i++) // Fill with spaces between
            strProduct[1] += ' ';

        strProduct = strProduct.join('') + '\n'; // Result is: Кафе       3.00 ЛВ 

        printer.addText(strProduct); // Product line
        printer.addText(`  ${product.qty} x ${fixPrice(product.sellPrice)} =\n`); // Quantity line
    }

    // Discount
    if (discount > 0) {
        let strDiscount = ['ОТСТЪПКА', '', fixPrice(discount) + ' ЛВ.']
        for (let i = strDiscount[0].length + strDiscount[2].length; i < 24; i++) // Fill with spaces between
            strDiscount[1] += ' ';
        strDiscount = strDiscount.join('') + '\n\n'; // Result is: ОТСТЪПКА       3.00 ЛВ
        printer.addText(strDiscount);
    }

    // Bill total
    printer.addTextStyle(false, false, true, printer.COLOR_1);
    printer.addTextAlign(printer.ALIGN_LEFT);
    printer.addTextDouble(true, false);

    let strTotal = ['ОБЩА СУМА', '', fixPrice(history.total) + ' ЛВ.'];
    for (let i = strTotal[0].length + strTotal[2].length; i < 24; i++) // Fill with spaces between
        strTotal[1] += ' ';
    strTotal = strTotal.join('') + '\n\n'; // Result is: ОБЩА СУМА       3.00 ЛВ
    printer.addText(strTotal);

    // CURRENT DATE AND TIME
    printer.addTextStyle(false, false, false, printer.COLOR_1);
    printer.addTextDouble(false, false);

    // Date in DD-MM-YYYY format with leading zeroes
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    if (day < 10)
        day = '0' + day;
    if (month < 10)
        month = '0' + month;

    let strDate = day + '-' + month + '-' + year;

    // Time in HH:MM:SS format with leading zeroes
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    if (hours < 10)
        hours = '0' + hours;
    if (minutes < 10)
        minutes = '0' + minutes;
    if (seconds < 10)
        seconds = '0' + seconds;

    let strTime = hours + ':' + minutes + ':' + seconds;

    let strDateAndTime = [strDate, '', strTime];
    for (let i = strDateAndTime[0].length + strDateAndTime[2].length; i < 48; i++) // Fill with spaces between
        strDateAndTime[1] += ' ';
    strDateAndTime = strDateAndTime.join('') + '\n'; // Result is: 27-04-2022       14:06:09

    printer.addText(strDateAndTime); // Date and time line

    printer.addTextAlign(printer.ALIGN_CENTER);
    printer.addSymbol(history._id, printer.SYMBOL_QRCODE_MODEL_1, printer.LEVEL_DEFAULT, 6, 0, 0); // Create QR code from history ID

    printer.addText('\nСлужебен бон\n');
    printer.addText('\nМоля, изискайте фискален бон.\n');
    printer.addCut(printer.CUT_FEED); // Cut paper
    printer.send(); // Send to printer
}

export async function printReport() {
    if (printer === null)
        return alert('Няма свързан принтер!');

    const res = await getTodaysReport();

    if (res.status === 200) {
        const { personalReport } = res.data;

        let employee = user.name;
        employee = employee.charAt(0).toUpperCase() + employee.slice(1);

        let strEmployee = ['Служител', '', employee];
        for (let i = strEmployee[0].length + strEmployee[2].length; i < 48; i++) // Fill with spaces between
            strEmployee[1] += ' ';
        strEmployee = strEmployee.join('') + '\n'; // Result is: СЛУЖИТЕЛ       Димитър
        printer.addText(strEmployee); // Employee line

        // Date in DD-MM-YYYY format with leading zeroes
        let date = new Date();
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();

        if (day < 10)
            day = '0' + day;
        if (month < 10)
            month = '0' + month;

        let strDate = day + '-' + month + '-' + year;

        // Time in HH:MM:SS format with leading zeroes
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();

        if (hours < 10)
            hours = '0' + hours;
        if (minutes < 10)
            minutes = '0' + minutes;
        if (seconds < 10)
            seconds = '0' + seconds;

        let strTime = hours + ':' + minutes + ':' + seconds;

        let strDateAndTime = [strDate, '', strTime];
        for (let i = strDateAndTime[0].length + strDateAndTime[2].length; i < 48; i++) // Fill with spaces between
            strDateAndTime[1] += ' ';
        strDateAndTime = strDateAndTime.join('') + '\n'; // Result is: 27-04-2022       14:06:09

        printer.addText(strDateAndTime); // Date and time line

        let strIncome = ['Продажби', '', fixPrice(personalReport.income)];
        for (let i = strIncome[0].length + strIncome[2].length; i < 48; i++) // Fill with spaces between
            strIncome[1] += ' ';
        strIncome = strIncome.join('') + '\n'; // Result is: Продажби       3.00 ЛВ
        printer.addText(strIncome); // Income line

        let strScrapped = ['Брак', '', fixPrice(personalReport.scrapped)];
        for (let i = strScrapped[0].length + strScrapped[2].length; i < 48; i++) // Fill with spaces between
            strScrapped[1] += ' ';
        strScrapped = strScrapped.join('') + '\n'; // Result is: Брак       3.00 ЛВ
        printer.addText(strScrapped); // Scrapped line

        let strConsumed = ['Консумация', '', fixPrice(personalReport.consumed)];
        for (let i = strConsumed[0].length + strConsumed[2].length; i < 48; i++) // Fill with spaces between
            strConsumed[1] += ' ';
        strConsumed = strConsumed.join('') + '\n'; // Result is: Консумация       3.00 ЛВ
        printer.addText(strConsumed); // Consumed line

        let strDiscounts = ['Отстъпки', '', fixPrice(personalReport.discounts)];
        for (let i = strDiscounts[0].length + strDiscounts[2].length; i < 48; i++) // Fill with spaces between
            strDiscounts[1] += ' ';
        strDiscounts = strDiscounts.join('') + '\n'; // Result is: Отстъпки       3.00 ЛВ
        printer.addText(strDiscounts); // Discounts line

        let strTotal = ['Общ приход', '', fixPrice(personalReport.total)];
        for (let i = strTotal[0].length + strTotal[2].length; i < 48; i++) // Fill with spaces between
            strTotal[1] += ' ';
        strTotal = strTotal.join('') + '\n'; // Result is: Общ приход       3.00 ЛВ
        printer.addText(strTotal); // Total line

        printer.addCut(printer.CUT_FEED); // Cut paper
        printer.send(); // Send to printer
    } else {
        console.error(res);
        alert('Възникна грешка');
    }
}