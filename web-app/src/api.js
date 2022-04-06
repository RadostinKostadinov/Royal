import axios from 'axios';
import page from 'page';

export let user = JSON.parse(sessionStorage.getItem('user'));
// Set base url so you dont type ${url} in every request
axios.defaults.baseURL = 'http://localhost:3000'; // LOCAL
// axios.defaults.baseURL = 'http://barroyal.eu:3000'; // TODO CHANGE ME WHEN LIVE

// Set the token in headers
if (user)
    axios.defaults.headers.common['authorization'] = user.token;

var elem = document.documentElement;

function openFullscreen() {
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

export async function scrapProduct(productId, qty, historyId, productIndex) {

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

export async function markHistoryAsScrapped(_id) {
    return await axios.post('/markHistoryAsScrapped', {
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

export async function sellProducts(billToPay) {
    return await axios.post('/sellProducts', {
        billToPay
    }).catch((err) => {
        return err.response;
    });
}

export async function changeQtyIngredient(_id, qty, action, expireDate) {
    return await axios.post('/changeQtyIngredient', {
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

export async function changeQtyProduct(_id, qty, action, expireDate) {
    return await axios.post('/changeQtyProduct', {
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

export async function getCategoryById(_id) {
    return await axios.post('/getCategoryById', {
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

export async function getAllTables() {
    const res = await axios.get('/getAllTables');
    return res.data;
}

export async function getProductsWithoutIngredientsFromCategory(_id) {
    const res = await axios.post('/getProductsWithoutIngredientsFromCategory', { _id });
    return res.data;
}

export async function getAllProductsWithoutIngredients() {
    const res = await axios.get('/getAllProductsWithoutIngredients');
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

export async function deleteUser(uid) {
    return await axios.post('/deleteUser', {
        _id: uid
    }).catch((err) => {
        return err.response;
    });
}

export async function editUser(uid, selectedChange, newValue) {
    return await axios.post('/editUser', {
        _id: uid,
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

export async function generateBills(_id, numberOfBills) {
    return await axios.post('/generateBills', {
        _id,
        numberOfBills
    }).catch((err) => {
        return err.response;
    });
}

export function logout() {
    user = undefined;
    sessionStorage.clear();
    closeFullscreen();
    page('/');
}