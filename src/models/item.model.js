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
            required: true,
            min: 0,
            validate: { validator: Number.isInteger, message: "Stok harus bilangan bulat" }
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        }
    }, {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    }
)

const ItemModel = model("Itmes", ItemSchema );

export default ItemModel;
