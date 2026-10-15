const express = require("express");
const db = require("../config/db");

const router = express.Router();

// Add item to cart
router.post("/", async (req, res) => {
    try {
        const { user_id, menu_item_id, quantity } = req.body;

        if (!user_id || !menu_item_id) {
            return res.status(400).json({
                message: "User ID and menu item ID are required",
            });
        }

        const itemQuantity = Number(quantity) || 1;

        if (itemQuantity < 1) {
            return res.status(400).json({
                message: "Quantity must be at least 1",
            });
        }

        const [existingItems] = await db.query(
            `
            SELECT id, quantity
            FROM cart_items
            WHERE user_id = ?
            AND menu_item_id = ?
            `,
            [user_id, menu_item_id]
        );

        if (existingItems.length > 0) {
            await db.query(
                `
                UPDATE cart_items
                SET quantity = quantity + ?
                WHERE id = ?
                `,
                [itemQuantity, existingItems[0].id]
            );

            return res.json({
                message: "Cart quantity updated",
            });
        }

        await db.query(
            `
            INSERT INTO cart_items
                (user_id, menu_item_id, quantity)
            VALUES
                (?, ?, ?)
            `,
            [user_id, menu_item_id, itemQuantity]
        );

        res.status(201).json({
            message: "Item added to cart",
        });
    } catch (error) {
        console.error("Error adding item to cart:", error);

        res.status(500).json({
            message: "Failed to add item to cart",
        });
    }
});

// Get user's cart
router.get("/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        const [cartItems] = await db.query(
            `
            SELECT
                c.id,
                c.user_id,
                c.menu_item_id,
                c.quantity,
                m.name,
                m.description,
                m.price,
                m.image_url,
                r.name AS restaurant_name
            FROM cart_items c
            JOIN menu_items m
                ON c.menu_item_id = m.id
            JOIN restaurants r
                ON m.restaurant_id = r.id
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
            `,
            [userId]
        );

        res.json(cartItems);
    } catch (error) {
        console.error("Error fetching cart:", error);

        res.status(500).json({
            message: "Failed to fetch cart",
        });
    }
});

// Update item quantity
router.put("/:id", async (req, res) => {
    try {
        const cartItemId = req.params.id;
        const { quantity } = req.body;

        const newQuantity = Number(quantity);

        if (!Number.isInteger(newQuantity) || newQuantity < 1) {
            return res.status(400).json({
                message: "Quantity must be at least 1",
            });
        }

        const [result] = await db.query(
            `
            UPDATE cart_items
            SET quantity = ?
            WHERE id = ?
            `,
            [newQuantity, cartItemId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Cart item not found",
            });
        }

        res.json({
            message: "Cart quantity updated",
        });
    } catch (error) {
        console.error("Error updating cart:", error);

        res.status(500).json({
            message: "Failed to update cart",
        });
    }
});

// Delete item from cart
router.delete("/:id", async (req, res) => {
    try {
        const cartItemId = req.params.id;

        const [result] = await db.query(
            `
            DELETE FROM cart_items
            WHERE id = ?
            `,
            [cartItemId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Cart item not found",
            });
        }

        res.json({
            message: "Item removed from cart",
        });
    } catch (error) {
        console.error("Error removing cart item:", error);

        res.status(500).json({
            message: "Failed to remove cart item",
        });
    }
});

module.exports = router;