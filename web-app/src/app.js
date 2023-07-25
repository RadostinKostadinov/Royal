import page from 'page';
// import './bootstrap/bootstrap.min.css';
import './bootstrap/bootstrap.dark.min.css';
import './bootstrap/bootstrap.bundle.min.js';
import './css/global.css';
import { checkLogin, user } from './views/api/api';
import { adminPages } from './views/admin/admin';
import { waiterPages } from './views/waiter/waiter';
import { bartenderPages } from './views/bartender/bartender';

export const container = document.querySelector('body'); // where to render everything

page('/', checkLogin);
adminPages();
waiterPages();
bartenderPages();
page('*', () => page('/')); // Everything else, redirect to home page
page();