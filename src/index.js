import express from "express";
import connectDB from "./utils/connectDB.js";
import router from "./routes/api.js";
import bodyParser from "body-parser";
import cors from "cors";

async function init() {
    const app = express();
    app.use(bodyParser.json());
    app.use(cors());
    
    const PORT = 8003;
    
    app.use("/", router);
    app.listen(PORT, () => {
        console.log(`Server is running on: http://localhost:${PORT}`)
    });
    
    
    const result = await connectDB();
    console.log(result);
}

init();