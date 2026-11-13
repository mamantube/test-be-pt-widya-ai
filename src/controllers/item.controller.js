import * as Yup from "yup";
import mongoose from "mongoose";
import ItemModel from "../models/item.model.js";

const createItemSchema = Yup.object({
  name: Yup.string().trim().required("Nama item harus diisi"),
  description: Yup.string().trim().required("Deskripsi harus diisi"),
  stock: Yup.number()
    .typeError("Stok harus berupa angka")
    .integer("Stok harus bilangan bulat")
    .min(0, "Stok tidak boleh negatif")
    .required("Stok harus diisi"),
  price: Yup.number()
    .typeError("Harga harus berupa angka")
    .min(0, "Harga tidak boleh negatif")
    .required("Harga harus diisi"),
}).noUnknown(true);

const updateItemSchema = Yup.object({
  name: Yup.string().trim().min(1, "Nama item tidak boleh kosong"),
  description: Yup.string().trim().min(1, "Deskripsi tidak boleh kosong"),
  stock: Yup.number()
    .typeError("Stok harus berupa angka")
    .integer("Stok harus bilangan bulat")
    .min(0, "Stok tidak boleh negatif"),
  price: Yup.number()
    .typeError("Harga harus berupa angka")
    .min(0, "Harga tidak boleh negatif"),
}).noUnknown(true);

const invalidId = (res) =>
  res.status(400).json({ message: "ID item tidak valid" });
const validationError = (res, error) =>
  res
    .status(400)
    .json({ message: "Data item tidak valid", errors: error.errors });

export const create = async (req, res) => {
  try {
    const input = await createItemSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      strict: true,
    });
    const item = await ItemModel.create(input);
    return res
      .status(201)
      .json({ message: "Item berhasil dibuat", data: item });
  } catch (error) {
    if (error instanceof Yup.ValidationError)
      return validationError(res, error);
    if (error instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({
          message: "Data item tidak valid",
          errors: Object.values(error.errors).map(({ message }) => message),
        });
    return res.status(500).json({ message: "Gagal membuat item" });
  }
};

export const findAll = async (req, res) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const page = req.query.page === undefined ? 1 : Number(req.query.page);
    const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        message: "Parameter page harus bilangan bulat >= 1 dan limit harus bilangan bulat antara 1 sampai 100",
      });
    }

    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const filter = search
      ? {
          $or: [
            { name: { $regex: escapedSearch, $options: "i" } },
            { description: { $regex: escapedSearch, $options: "i" } },
          ],
        }
      : {};
    const [items, totalItems] = await Promise.all([
      ItemModel.find(filter).sort({ _id: -1 }).skip((page - 1) * limit).limit(limit),
      ItemModel.countDocuments(filter),
    ]);
    return res
      .status(200)
      .json({
        message: "Daftar item berhasil diambil",
        data: items,
        pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
      });
  } catch {
    return res.status(500).json({ message: "Gagal mengambil daftar item" });
  }
};

export const findOne = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return invalidId(res);
  try {
    const item = await ItemModel.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item tidak ditemukan" });
    return res
      .status(200)
      .json({ message: "Item berhasil diambil", data: item });
  } catch {
    return res.status(500).json({ message: "Gagal mengambil item" });
  }
};

export const update = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return invalidId(res);
  try {
    const input = await updateItemSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      strict: true,
    });
    if (Object.keys(input).length === 0)
      return res
        .status(400)
        .json({ message: "Minimal satu field item harus diisi" });
    const item = await ItemModel.findByIdAndUpdate(req.params.id, input, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: "Item tidak ditemukan" });
    return res
      .status(200)
      .json({ message: "Item berhasil diperbarui", data: item });
  } catch (error) {
    if (error instanceof Yup.ValidationError)
      return validationError(res, error);
    if (
      error instanceof mongoose.Error.ValidationError ||
      error instanceof mongoose.Error.CastError
    )
      return res.status(400).json({ message: "Data item tidak valid" });
    return res.status(500).json({ message: "Gagal memperbarui item" });
  }
};

export const remove = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return invalidId(res);
  try {
    const item = await ItemModel.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item tidak ditemukan" });
    return res
      .status(200)
      .json({ message: "Item berhasil dihapus", data: item });
  } catch {
    return res.status(500).json({ message: "Gagal menghapus item" });
  }
};
