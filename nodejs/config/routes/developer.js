import { exec } from 'child_process';

export function developerRoutes(app, auth) {
    app.post('/database/backup', auth, async (req, res) => {
        try {
            // Check if user is dev
            console.log(req.user);
            if (req.user.isDev !== true)
                return res.status(403).send('Нямате права!');

            exec("ls -la", (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
            });

        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    });
}