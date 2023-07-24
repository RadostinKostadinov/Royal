import page from 'page';
// import { container } from "../app";
// import { html, render } from 'lit/html.js';
// import $ from "jquery";
// import '../css/admin/admin.css';
import { auth } from "../api/api.js";

// FUNCTIONS

// PAGES

export async function expensesPage() {
    //TODO CREATE
}

export async function createExpensePage() {

}

export function expensePages() {
    page('/admin/expense', auth, expensesPage);
    page('/admin/expense/create', auth, createExpensePage);
}