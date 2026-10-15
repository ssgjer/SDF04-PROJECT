const express = require("express");
const db = require("../config/db");

const router = express.Router();

// Get all restaurants
router.get("/", async (req, res) => {
    try {
        const [restaurants] = await db.query(`
            SELECT
                id,
                name,
                description,
                address,
                phone,
                image_url,
                rating,
                delivery_time,
                is_active
            FROM restaurants
            WHERE is_active = TRUE
            ORDER BY rating DESC
        `);

        res.json(restaurants);
    } catch (error) {
        console.error("Error fetching restaurants:", error);

        res.status(500).json({
            message: "Failed to fetch restaurants",
        });
    }
});

// Get one restaurant with its menu
router.get("/:id", async (req, res) => {
    try {
        const restaurantId = req.params.id;

        const [restaurants] = await db.query(
            `
            SELECT
                id,
                name,
                description,
                address,
                phone,
                image_url,
                rating,
                delivery_time
            FROM restaurants
            WHERE id = ?
            AND is_active = TRUE
            `,
            [restaurantId]
        );

        if (restaurants.length === 0) {
            return res.status(404).json({
                message: "Restaurant not found",
            });
        }

        const restaurant = restaurants[0];

        const [menuItems] = await db.query(
            `
            SELECT
                id,
                restaurant_id,
                name,
                description,
                price,
                image_url
            FROM menu_items
            WHERE restaurant_id = ?
            ORDER BY name ASC
            `,
            [restaurantId]
        );

        res.json({
            restaurant,
            menu: menuItems,
        });
    } catch (error) {
        console.error("Error fetching restaurant:", error);

        res.status(500).json({
            message: "Failed to fetch restaurant",
        });
    }
});

module.exports = router;