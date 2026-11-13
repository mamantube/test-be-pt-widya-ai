import mongoose from "mongoose";
import { DATABASE_URL } from "./env.js";

const connectDB = async() => {
    try {
        await mongoose.connect(DATABASE_URL, {
            dbName: "inventory-management"
        });

        return Promise.resolve("Database connected successfully");
    } catch (error) {
        return Promise.reject("Failed to cennect database:", error)
    }
};

export default connectDB;