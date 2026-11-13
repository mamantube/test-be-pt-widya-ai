import express from "express";
import  {register, login} from "../controllers/auth.controller.js";
import { create, findAll, findOne, update, remove } from "../controllers/item.controller.js";
import { authentication, admin } from "../middlewares/auth.middleware.js";
const router = express.Router()

router.post("/auth/register", register);
router.post("/auth/login", login);

router.post("/item", authentication, admin, create);
router.get("/item", authentication, findAll);
router.get("/item/:id", authentication, findOne);
router.put("/item/:id", authentication, admin, update);
router.delete("/item/:id", authentication, admin, remove);

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
