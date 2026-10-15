const express = require("express");
const db = require("../config/db");

const router = express.Router();

router.get("/popular", async (req, res) => {
    try {
        const [menuItems] = await db.query(`
            SELECT
                m.id,
                m.restaurant_id,
                m.name,
                m.description,
                m.price,
                m.image_url,
                r.name AS restaurant_name,
                r.rating AS restaurant_rating,
                COALESCE(SUM(oi.quantity), 0) AS total_sold
            FROM menu_items m
            JOIN restaurants r
                ON m.restaurant_id = r.id
            LEFT JOIN order_items oi
                ON m.id = oi.menu_item_id
            WHERE r.is_active = TRUE
            GROUP BY
                m.id,
                m.restaurant_id,
                m.name,
                m.description,
                m.price,
                m.image_url,
                r.name,
                r.rating
            ORDER BY total_sold DESC
            LIMIT 5
        `);

        res.json(menuItems);
    } catch (error) {
        console.error("Error fetching popular menu:", error);

        res.status(500).json({
            message: "Failed to fetch popular menu",
        });
    }
});

router.get("/", async (req, res) => {
    try {
        const [menuItems] = await db.query(`
            SELECT
                m.id,
                m.restaurant_id,
                m.name,
                m.description,
                m.price,
                m.image_url,
                r.name AS restaurant_name,
                r.rating AS restaurant_rating
            FROM menu_items m
            JOIN restaurants r
                ON m.restaurant_id = r.id
            WHERE r.is_active = TRUE
            ORDER BY m.id ASC
        `);

        res.json(menuItems);
    } catch (error) {
        console.error("Error fetching menu:", error);

        res.status(500).json({
            message: "Failed to fetch menu",
        });
    }
});

module.exports = router;