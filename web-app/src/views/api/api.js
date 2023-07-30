import axios from 'axios';
import page from 'page';
import $ from "jquery";
import { render, html } from 'lit/html.js';
import { io } from "socket.io-client";
import { container } from '../../app';

import './printer.js'
import { initializePrinter } from './printer.js';

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

let selectedUser,
    pinCode = '';

// Activate screensaver once
screensaver();

export async function checkLogin() {
    if (user) {
        initializePrinter();
        return page.redirect(`/${user.role}`);
    }

    let res = await axios.get('/getAllUsers');
    let users = res.data;

    function selectUser(e) {
        selectedUser = $(e.target).attr('userId');

        pinCode = '';
        render(numpadTemplate(), container)
    }

    async function enterPIN(e) {
        let screenCode = $('#code');
        let enteredNumber = $(e.target).text();

        if (enteredNumber === 'X')
            pinCode = pinCode.slice(0, -1);
        else
            pinCode += enteredNumber;

        // Show the entered PIN and add + to the end (until 4 numbers in total)
        // ex. if entered 1, show 1+++
        // if entered 15, show 15++
        let addPluses = pinCode;
        while (addPluses.length < 4)
            addPluses += '+';
        screenCode.text(addPluses);
        screenCode.removeClass('wrong-pin')

        // Check if user entered 4 numbers
        if (pinCode.length === 4)
            tryLogin(screenCode);
    }

    async function sendLoginData(id, pin) {
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
                    token: res.data.token,
                    isDev: res.data.isDev
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

    async function tryLogin(screenCode) {
        let res = await sendLoginData(selectedUser, pinCode);

        if (res === 'success') {
            initializePrinter();
            return page('/');
        }

        if (res.status === 500) {
            // Server error
            alert('Възникна грешка в сървъра!');
            return console.error(res.data);
        }

        if (res.status === 400) {
            // Client error (wrong pin, false info, etc)
            screenCode.addClass('wrong-pin');
            screenCode.text('++++');
            return pinCode = ''; // Reset variable
        }

        if (res.status === 403)
            return alert(res.data);

        if (res.status === 401) {
            // Ask user to enter password in alert
            const pass = prompt('Въведи парола за сайта:');
            const res2 = await checkSitePass(pass);

            if (res2.status === 200)
                tryLogin();
            else {
                alert('Грешна парола за сайта!');
                return page('/');
            }
        }
    }

    async function checkSitePass(pass) {
        return await axios.post('/checkSitePass', {
            pass
        }).catch((err) => {
            return err.response;
        });
    }

    const usersTemplate = () => html`
        <div style="height: 100vh"
            class="d-flex flex-row flex-wrap gap-4 align-items-center align-content-center justify-content-evenly">
            ${users.map((user) => html`<button @click=${selectUser} class="text-capitalize btn p-4 btn-primary fs-1"
                userId=${user._id}>${user.name}</button>`)}
        </div>
    `;

    const numpadTemplate = () => html`
    <button @click=${() => render(usersTemplate(), container)}
        class="btn btn-secondary fs-1 mt-3 ms-3">Назад</button>
    
    <div id="numpad-wrapper">
        <div id="code">
            ++++
        </div>
        <div id="numpad">
            <button @click=${enterPIN} class="btn btn-primary">1</button>
            <button @click=${enterPIN} class="btn btn-primary">2</button>
            <button @click=${enterPIN} class="btn btn-primary">3</button>
            <button @click=${enterPIN} class="btn btn-primary">4</button>
            <button @click=${enterPIN} class="btn btn-primary">5</button>
            <button @click=${enterPIN} class="btn btn-primary">6</button>
            <button @click=${enterPIN} class="btn btn-primary">7</button>
            <button @click=${enterPIN} class="btn btn-primary">8</button>
            <button @click=${enterPIN} class="btn btn-primary">9</button>
            <button @click=${enterPIN} class="btn btn-danger">X</button>
            <button @click=${enterPIN} class="btn btn-primary">0</button>
        </div>
    </div>
    `;

    render(usersTemplate(), container);
}

export async function auth(ctx, next) {
    if (!user || (ctx.path.includes('/admin') && (user.role !== "admin" || user.isDev !== true)))
        return page('/'); // wrong permissions, go back go dashboard

    initializePrinter();
    next(); // else continue work
}

function screensaver() {
    // If theres no activity for X minutes, show screensaver
    const screensaverTime = 30 * 60 * 1000; // 30 minutes
    const blackscreenTime = 60 * 60 * 1000; // 60 minutes
    var screensaverTimeout = setTimeout(inActive, screensaverTime);
    var blackscreenTimeout = setTimeout(showBlackScreen, blackscreenTime);

    function resetActive() {
        // Hide screensaver
        $('#screensaver').hide();
        $('#blackscreen').hide();

        clearTimeout(screensaverTimeout);
        clearTimeout(blackscreenTimeout);

        screensaverTimeout = setTimeout(inActive, screensaverTime);
        blackscreenTimeout = setTimeout(showBlackScreen, blackscreenTime);
    }

    function inActive() {
        // Check if on bartender screen
        if (!$('#bartenderDashboard').length)
            $('#screensaver').show(); // Show screensaver
    }

    function showBlackScreen() {
        // Check if on bartender screen
        if (!$('#bartenderDashboard').length)
            $('#blackscreen').show(); // Show black screen
    }

    $(document).bind('click', resetActive);
    $(document).bind('touch', resetActive);
}

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
    if (document.exitFullscreenElement) {
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

export async function getTodaysReport() {
    return await axios.get('/getTodaysReport').catch((err) => {
        return err.response;
    });
}

export async function getAllAddons() {
    const res = await axios.get('/getAllAddons');
    return res.data;
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