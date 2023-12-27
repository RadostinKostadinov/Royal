import page from 'page';
// import './bootstrap/bootstrap.min.css';
import './bootstrap/bootstrap.dark.min.css';
import './bootstrap/bootstrap.bundle.min.js';
import './css/global.css';
import { checkLogin } from './views/api/api';
import { adminPages } from './views/admin/admin';
import { waiterPages } from './views/waiter/waiter';
import { bartenderPages } from './views/bartender/bartender';
import { developerPages } from './views/developer/developer';

export const container = document.querySelector('body'); // where to render everything

page('/', checkLogin);
developerPages();
adminPages();
waiterPages();
bartenderPages();
page('*', () => page('/')); // Everything else, redirect to home page
page();