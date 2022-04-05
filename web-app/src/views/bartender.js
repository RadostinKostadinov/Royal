import page from 'page';
import { html, render } from 'lit';
import $ from "jquery";
import { container } from '../app.js';
import '../css/bartender/bartender.css';

export async function bartenderDashboardPage() {
    const dashboard = () => html`
        <div id="bartenderDashboard">
            <div id="orders">
                <div class="order">
                    <table>
                        <thead class="text-uppercase">
                            <tr>
                                <td colspan="3">[1] - МАСА 2</td>
                                <td>14:33</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Кафе Караро</td>
                                <td>3 бр.</td>
                                <td><button class="removeOne text-uppercase">Едно</button></td>
                                <td><button class="removeAll text-uppercase">Всички</button></td>
                            </tr>
                            <tr>
                                <td>Кафе Караро</td>
                                <td>3 бр.</td>
                                <td><button class="removeOne text-uppercase">Едно</button></td>
                                <td><button class="removeAll text-uppercase">Всички</button></td>
                            </tr>
                            <tr>
                                <td>Кафе Караро</td>
                                <td>3 бр.</td>
                                <td><button class="removeOne text-uppercase">Едно</button></td>
                                <td><button class="removeAll text-uppercase">Всички</button></td>
                            </tr>
                            <tr>
                                <td>Кафе Караро</td>
                                <td>3 бр.</td>
                                <td><button class="removeOne text-uppercase">Едно</button></td>
                                <td><button class="removeAll text-uppercase">Всички</button></td>
                            </tr>
                        </tbody>
                    </table>
                    <button class="finish text-uppercase">Завърши</button>
                </div>
                <div class="order">
                    <table>
                        <thead class="text-uppercase">
                            <tr>
                                <td colspan="3">[2] - МАСА 5</td>
                                <td>14:33</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Кафе Караро</td>
                                <td>3 бр.</td>
                                <td><button class="removeOne text-uppercase">Едно</button></td>
                                <td><button class="removeAll text-uppercase">Всички</button></td>
                            </tr>
                            <tr>
                                <td>Кафе Караро</td>
                                <td>3 бр.</td>
                                <td><button class="removeOne text-uppercase">Едно</button></td>
                                <td><button class="removeAll text-uppercase">Всички</button></td>
                            </tr>
                            <tr>
                                <td>Кафе Караро</td>
                                <td>3 бр.</td>
                                <td><button class="removeOne text-uppercase">Едно</button></td>
                                <td><button class="removeAll text-uppercase">Всички</button></td>
                            </tr>
                        </tbody>
                    </table>
                    <button class="finish text-uppercase">Завърши</button>
                </div>
                <div class="order">
                    <table>
                        <thead class="text-uppercase">
                            <tr>
                                <td colspan="3">[3] - МАСА 1</td>
                                <td>14:33</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Кафе Караро</td>
                                <td>3 бр.</td>
                                <td><button class="removeOne text-uppercase">Едно</button></td>
                                <td><button class="removeAll text-uppercase">Всички</button></td>
                            </tr>
                            <tr>
                                <td>Кафе Караро</td>
                                <td>3 бр.</td>
                                <td><button class="removeOne text-uppercase">Едно</button></td>
                                <td><button class="removeAll text-uppercase">Всички</button></td>
                            </tr>
                            <tr>
                                <td>Кафе Караро</td>
                                <td>3 бр.</td>
                                <td><button class="removeOne text-uppercase">Едно</button></td>
                                <td><button class="removeAll text-uppercase">Всички</button></td>
                            </tr>
                            <tr>
                                <td>Кафе Караро</td>
                                <td>3 бр.</td>
                                <td><button class="removeOne text-uppercase">Едно</button></td>
                                <td><button class="removeAll text-uppercase">Всички</button></td>
                            </tr>
                            <tr>
                                <td>Кафе Караро</td>
                                <td>3 бр.</td>
                                <td><button class="removeOne text-uppercase">Едно</button></td>
                                <td><button class="removeAll text-uppercase">Всички</button></td>
                            </tr>
                            <tr>
                                <td>Кафе Караро</td>
                                <td>3 бр.</td>
                                <td><button class="removeOne text-uppercase">Едно</button></td>
                                <td><button class="removeAll text-uppercase">Всички</button></td>
                            </tr>
                            <tr>
                                <td>Кафе Караро</td>
                                <td>3 бр.</td>
                                <td><button class="removeOne text-uppercase">Едно</button></td>
                                <td><button class="removeAll text-uppercase">Всички</button></td>
                            </tr>
                            <tr>
                                <td>Кафе Караро</td>
                                <td>3 бр.</td>
                                <td><button class="removeOne text-uppercase">Едно</button></td>
                                <td><button class="removeAll text-uppercase">Всички</button></td>
                            </tr>
                            <tr>
                                <td>Кафе Караро</td>
                                <td>3 бр.</td>
                                <td><button class="removeOne text-uppercase">Едно</button></td>
                                <td><button class="removeAll text-uppercase">Всички</button></td>
                            </tr>
                        </tbody>
                    </table>
                    <button class="finish text-uppercase">Завърши</button>
                </div>
                <div class="order">
                    <table>
                        <thead class="text-uppercase">
                            <tr>
                                <td colspan="3">[4] - МАСА 9</td>
                                <td>14:33</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Кафе Караро</td>
                                <td>3 бр.</td>
                                <td><button class="removeOne text-uppercase">Едно</button></td>
                                <td><button class="removeAll text-uppercase">Всички</button></td>
                            </tr>
                        </tbody>
                    </table>
                    <button class="finish text-uppercase">Завърши</button>
                </div>
                <div class="order">
                    <table>
                        <thead class="text-uppercase">
                            <tr>
                                <td colspan="3">[6] - МАСА 7</td>
                                <td>14:33</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Кафе Караро</td>
                                <td>3 бр.</td>
                                <td><button class="removeOne text-uppercase">Едно</button></td>
                                <td><button class="removeAll text-uppercase">Всички</button></td>
                            </tr>
                        </tbody>
                    </table>
                    <button class="finish text-uppercase">Завърши</button>
                </div>
                <div class="order">
                    <table>
                        <thead class="text-uppercase">
                            <tr>
                                <td colspan="3">[5] - МАСА 5</td>
                                <td>14:33</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Кафе Караро</td>
                                <td>3 бр.</td>
                                <td><button class="removeOne text-uppercase">Едно</button></td>
                                <td><button class="removeAll text-uppercase">Всички</button></td>
                            </tr>
                        </tbody>
                    </table>
                    <button class="finish text-uppercase">Завърши</button>
                </div>
            </div>
            <div id="menu" class="d-flex flex-column justify-content-end gap-3 p-3">
                <button>Маси</button>
                <button>Назад</button>
            </div>
            <div class="overflow-auto">
                <table id="allOrders">
                    <tbody>
                        <tr>
                            <td>Кафе Караро</td>
                            <td>13 бр.</td>
                            <td><button class="removeOne text-uppercase">Едно</button></td>
                            <td><button class="removeAll text-uppercase">Всички</button></td>
                        </tr>
                        <tr>
                            <td>Кафе Караро</td>
                            <td>13 бр.</td>
                            <td><button class="removeOne text-uppercase">Едно</button></td>
                            <td><button class="removeAll text-uppercase">Всички</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    render(dashboard(), container);
}