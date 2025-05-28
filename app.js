import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Order from "./models/Order.js";
import fs from "node:fs/promises";
import bodyParser from "body-parser";
import express from "express";
import xss from "xss";

const app = express();

app.use(bodyParser.json());
app.use(express.static("public"));

const mongoUri = process.env.MONGODB_URI;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  next();
});

app.get("/products", async (req, res) => {
  const { search, max } = req.query;
  const productsFileContent = await fs.readFile("./data/products.json");
  let products = JSON.parse(productsFileContent);

  if (search) {
    const keyword = search.toLowerCase();
    products = products.filter((product) => {
      const name = product.name?.toLowerCase() || "";
      const desc = product.description?.toLowerCase() || "";
      return name.includes(keyword) || desc.includes(keyword);
    });
  }

  if (max) {
    products = products.slice(products.length - max, products.length);
  }

  res.json({ products });
});

app.get("/products/:id", async (req, res) => {
  const { id } = req.params;

  const productsFileContent = await fs.readFile("./data/products.json");
  const products = JSON.parse(productsFileContent);

  const product = products.find((product) => product.id === id);

  if (!product) {
    return res.status(404).json({ message: `No product found for id: ${id}` });
  }

  res.json({ product });
});

app.post("/orders", async (req, res) => {
  const orderData = req.body.order;

  // 防止 XSS 攻擊
  orderData.customer.name = xss(orderData.customer.name || "");
  orderData.customer.email = xss(orderData.customer.email || "");
  orderData.customer.street = xss(orderData.customer.street || "");
  orderData.customer["postal-code"] = xss(
    orderData.customer["postal-code"] || ""
  );
  orderData.customer.city = xss(orderData.customer.city || "");
  orderData.customer.leaveMessage = xss(orderData.customer.leaveMessage || "");

  if (!orderData || !orderData.items || orderData.items.length === 0) {
    return res.status(400).json({ message: "Missing data." });
  }

  if (
    !orderData.customer.email?.includes("@") ||
    !orderData.customer.name?.trim() ||
    !orderData.customer.street?.trim() ||
    !orderData.customer["postal-code"]?.trim() ||
    !orderData.customer.city?.trim()
  ) {
    return res.status(400).json({
      message:
        "Missing data: Email, name, street, postal code or city is missing.",
    });
  }

  try {
    const order = new Order(orderData);
    await order.save();
    res.status(201).json({ message: "Order saved to MongoDB!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "資料庫錯誤，無法儲存訂單。" });
  }
});

mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ 成功連接 MongoDB"))
  .catch((err) => console.error("❌ MongoDB 連接失敗:", err));

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
