const express = require("express");
const cors = require("cors");

const db = require("./config/db");
const restaurantRoutes = require("./routes/restaurants");
const menuRoutes = require("./routes/menu");
const userRoutes = require("./routes/users");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "QuickEats API is running",
    });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 AS connected");

        res.json({
            message: "MySQL connected successfully",
            result: rows,
        });
    } catch (error) {
        console.error("Database error:", error);

        res.status(500).json({
            message: "MySQL connection failed",
            error: error.code,
        });
    }
});

app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`QuickEats API running on http://localhost:${PORT}`);
});