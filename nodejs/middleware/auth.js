import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers["authorization"];

    // Not logged in (no token)
    if (!token)
        return res.status(403).send("A token is required for authentication");

    try {
        // Verify and decrypt token
        const decoded = jwt.verify(token, process.env.TOKEN_KEY || "p@JC@Ambo?&NNyR4Y9tJ9PbmrRHjK7H6EeGM@@5q");

        // Attach data to request.user so you can use it afterwards in the routes
        req.user = decoded;
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }

    return next();
};

export { verifyToken };