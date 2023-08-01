import { fixPrice, getTodaysReport, user } from "./api";
import $ from "jquery";

// PRINTER
const printerIp = '192.168.0.171'; // Royal IP
const printerPort = 8008;
var printer = null;
export var printerStatusClass = 'text-warning';
var ePosDev = new epson.ePOSDevice();

var printerInitialized = false;
export function initializePrinter() {
    if (printerInitialized === true)
        return;

    printerInitialized = true;
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