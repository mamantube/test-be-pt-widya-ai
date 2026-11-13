import express from "express";
import  {register} from "../controllers/auth.controller.js";
const router = express.Router()

router.post("/auth/register", register);

router.get("/", async(req, res) => {
    try {
        res.status(200).json({
            message: "Server is running"
        })
    } catch (error) {
        res.status(500).json({
            message: "Server failed",
            error: error
        })
    }
});

export default router;