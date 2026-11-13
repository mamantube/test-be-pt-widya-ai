import { Schema, model } from "mongoose";

const ItemSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        stock: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true,
        }
    }
)

const ItemModel = model("Itmes", ItemSchema );

export default ItemModel;