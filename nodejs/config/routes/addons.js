import { Addon } from "../../model/addons.js";

export function addonsRoutes(app, auth) {
    app.post('/getAddonsForCategory', auth, async (req, res) => {
        try {
            const { _id } = req.body;

            // Get addons that match category id
            const addons = await Addon.find({ categories: _id }); // Finds any category id in array of categories
            res.json(addons);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    app.get('/getAllAddons', auth, async (req, res) => {
        try {
            const addons = await Addon.find();
            res.json(addons);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

}