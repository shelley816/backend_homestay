// test-db.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ 成功連接 MongoDB！");
    return runTest(); // 執行寫入測試
  })
  .catch((err) => console.error("❌ 連線失敗:", err));

const orderSchema = new mongoose.Schema({
  name: String,
  email: String,
  cartItems: Array,
});

const Order = mongoose.model("Order", orderSchema);

async function runTest() {
  const sampleOrder = new Order({
    name: "測試用戶",
    email: "test@example.com",
    cartItems: [{ id: "p001", name: "商品A", quantity: 2 }],
  });

  try {
    const result = await sampleOrder.save();
    console.log("✅ 寫入成功:", result);
  } catch (err) {
    console.error("❌ 寫入失敗:", err);
  } finally {
    mongoose.disconnect();
  }
}
