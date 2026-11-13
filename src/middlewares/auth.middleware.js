import jwt from "jsonwebtoken";
import response from "../utils/response.js";
import { SECRET_KEY_TOKEN } from "../utils/env.js";

export const authentication = (req, res, next) => {
    const authorization = req.headers["authorization"];

    if(!authorization) {
        return res.status(401).json({ message: "Authorization dibutuhkan"});
    };

    const [scheme, token] = authorization.split(" ");
    if (scheme !== "Bearer" || !token) return res.status(401).json({ message: "Format authorization harus Bearer <token>" });

    jwt.verify(token, SECRET_KEY_TOKEN, (err, decoded) => {
        if(err) {
            const { name, message : msg } = err;

            const isTokenInvalid = name === "JsonwebTokenError";
            const isTokenExpired = name === "TokenExpiredError"
            
            const resultMessage = isTokenInvalid ? "Token tidak valid" : isTokenExpired ? "Token sudah kadaluarsa" : msg

            return response(res, 403, resultMessage);
        };

        req.auth = {
            user_id: decoded.user_id ?? decoded._id ?? decoded.id,
            role_name: decoded.role_name ?? decoded.role
        };

        next()

    })
};

export const admin = (req, res, next) => {
    const { role_name } = req.auth ?? {};

    if (role_name !== "admin") {
        return response(res, 403, "Akses tidak diizinkan")
    };

    next();
};

