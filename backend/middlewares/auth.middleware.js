import jwt from "jsonwebtoken";

const jwt_secret_key = process.env.jwt_secret_key;

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                error: "Authorization header missing"
            });
        }

        const [scheme, token] = authHeader.split(" ");

        if (scheme !== "Bearer" || !token) {
            return res.status(401).json({
                error: "Invalid authorization format"
            });
        }

        const decoded = jwt.verify(token, jwt_secret_key);

        req.user = decoded;

        next();

    } catch (err) {
        console.log("Token verification error:", err);

        return res.status(401).json({
            error: "Invalid or expired token"
        });
    }
};

export default verifyToken;