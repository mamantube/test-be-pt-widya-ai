import UserModel from "../models/user.model.js";
import * as Yup from "yup";
import bcrypt from "bcryptjs";

const validationSchema = Yup.object({
    full_name: Yup.string().required("Nama lengkap harus diisi"),
    email: Yup.string().email("Format email tidak valid").required("Email harus diisi"),
    password: Yup.string().required("Password harus diisi")
});

export const register = async (req, res) => {
    try {
        const existingUser = await UserModel.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: "Email sudah digunakan" });
        }
        await validationSchema.validate(req.body, { abortEarly: false });
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = await UserModel.create({ ...req.body, password: hashedPassword });
        res.status(201).json({ message: "Registrasi berhasil", data: user });
    } catch (error) {
        if (error instanceof Yup.ValidationError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};