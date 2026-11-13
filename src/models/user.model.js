import { Schema, model }from "mongoose";


const UserSchema = new Schema(
    {
        full_name: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["admin", "user"],
            default: "user"
        }
    }, {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    }
);

UserSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

const UserModel = model("Users", UserSchema);

export default UserModel;