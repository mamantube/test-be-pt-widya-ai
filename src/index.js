import express from "express";
import connectDB from "./utils/connectDB.js";

async function init() {
    const app = express();
    
    const PORT = 8003;
    
    app.listen(PORT, () => {
        console.log(`Server is running on: http://localhost:${PORT}`)
    });
    
    
    const result = await connectDB();
    console.log(result);
}

init();