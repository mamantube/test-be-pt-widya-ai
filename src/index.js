import express from "express";

async function init() {
    const app = express();

    const PORT = 8003;

    app.listen(PORT, () => {
        console.log(`Server is running on: http://localhost:${PORT}`)
    })
    
}

init();