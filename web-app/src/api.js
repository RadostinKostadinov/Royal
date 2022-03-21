import axios from 'axios';
import page from 'page';

export let user = JSON.parse(sessionStorage.getItem('user'));
// Set base url so you dont type ${url} in every request
axios.defaults.baseURL = 'http://localhost:80';
// Set the token in headers
if (user)
    axios.defaults.headers.common['authorization'] = user.token;

export async function changeQtyProduct(_id, qty, action) {
    return await axios.post('/changeQtyProduct', {
        _id,
        qty,
        action
    }).catch((err) => {
        return err.response;
    });
}

export async function createProduct(name, qty, buyPrice, sellPrice, categoryId, forBartender) {
    return await axios.post('/createProduct', {
        name,
        qty,
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

export async function editProduct(_id, name, qty, buyPrice, sellPrice, categoryId, forBartender) {
    return await axios.post('/editProduct', {
        _id,
        name,
        qty,
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

export async function getAllProducts() {
    const res = await axios.get('/getAllProducts');
    return res.data;
}

export async function getAllCategories() {
    // Returns ALL CATEGORIES and SUBCATEGORIES (Alcohol, Alcohol -> Beer, etc)
    const res = await axios.get('/getAllCategories');
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
    page('/');
}