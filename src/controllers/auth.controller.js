import UserModel from "../models/user.model.js";
import * as Yup from "yup";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { SECRET_KEY_TOKEN } from "../utils/env.js";
import response from "../utils/response.js";

const validationSchema = Yup.object({
  full_name: Yup.string().required("Nama lengkap harus diisi"),
  email: Yup.string()
    .email("Format email tidak valid")
    .required("Email harus diisi"),
  password: Yup.string().required("Password harus diisi"),
});

export const register = async (req, res) => {
  try {
    const existingUser = await UserModel.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    await validationSchema.validate(req.body, { abortEarly: false });
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await UserModel.create({
      ...req.body,
      password: hashedPassword,
    });

    response(res, 201, "Registrasi berhasil", user)
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const user = await UserModel.findOne({
      $or: [{ email: identifier }, { full_name: identifier }],
    });

    if (!user) {
      return res
        .status(403)
        .json({ message: "Email atau Nama lengkap tidak ditemukan" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return response(res, 403, "Password salah")
    }

    const token = jwt.sign(
      { _id: user._id.toString(), role: user.role },
      SECRET_KEY_TOKEN,
      { expiresIn: "1h" },
    );

    res.status(200).json({ message: "Login berhasil", token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
