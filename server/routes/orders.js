const express = require("express");
const db = require("../config/db");

const router = express.Router();

// ========================================
// CREATE AN ORDER
// ========================================
router.post("/", async (req, res) => {
    let connection;

    try {
        const {
            user_id,
            delivery_address,
            delivery_phone,
            payment_method,
        } = req.body;

        if (
            !user_id ||
            !delivery_address ||
            !delivery_phone ||
            !payment_method
        ) {
            return res.status(400).json({
                message:
                    "User ID, delivery address, delivery phone, and payment method are required",
            });
        }

        if (
            !["cash_on_delivery", "gcash"].includes(
                payment_method
            )
        ) {
            return res.status(400).json({
                message: "Invalid payment method",
            });
        }

        connection = await db.getConnection();

        await connection.beginTransaction();

        // Get cart items
        const [cartItems] = await connection.query(
            `
            SELECT
                c.id,
                c.menu_item_id,
                c.quantity,
                m.price,
                m.restaurant_id
            FROM cart_items c
            INNER JOIN menu_items m
                ON c.menu_item_id = m.id
            WHERE c.user_id = ?
            `,
            [user_id]
        );

        if (cartItems.length === 0) {
            await connection.rollback();

            return res.status(400).json({
                message: "Your cart is empty",
            });
        }

        // Get restaurants in cart
        const restaurantIds = [
            ...new Set(
                cartItems.map(
                    (item) => item.restaurant_id
                )
            ),
        ];

        // One restaurant per order
        if (restaurantIds.length > 1) {
            await connection.rollback();

            return res.status(400).json({
                message:
                    "Your cart contains items from multiple restaurants. Please order from one restaurant at a time.",
            });
        }

        const restaurantId = restaurantIds[0];

        // Calculate subtotal
        const subtotal = cartItems.reduce(
            (total, item) =>
                total +
                Number(item.price) *
                    Number(item.quantity),
            0
        );

        const deliveryFee = 49;

        const totalAmount =
            subtotal + deliveryFee;

        // Create NEW order
        const [orderResult] = await connection.query(
            `
            INSERT INTO orders
                (
                    user_id,
                    restaurant_id,
                    status,
                    total_amount,
                    delivery_address,
                    delivery_phone,
                    payment_method
                )
            VALUES
                (?, ?, 'pending', ?, ?, ?, ?)
            `,
            [
                user_id,
                restaurantId,
                totalAmount,
                delivery_address,
                delivery_phone,
                payment_method,
            ]
        );

        const orderId = orderResult.insertId;

        // Add items to this specific order
        for (const item of cartItems) {
            await connection.query(
                `
                INSERT INTO order_items
                    (
                        order_id,
                        menu_item_id,
                        quantity,
                        price
                    )
                VALUES
                    (?, ?, ?, ?)
                `,
                [
                    orderId,
                    item.menu_item_id,
                    item.quantity,
                    item.price,
                ]
            );
        }

        // Clear cart AFTER creating the order
        await connection.query(
            `
            DELETE FROM cart_items
            WHERE user_id = ?
            `,
            [user_id]
        );

        await connection.commit();

        res.status(201).json({
            message: "Order placed successfully",
            order: {
                id: orderId,
                restaurant_id: restaurantId,
                status: "pending",
                payment_method,
                subtotal: Number(
                    subtotal.toFixed(2)
                ),
                delivery_fee: deliveryFee,
                total_amount: Number(
                    totalAmount.toFixed(2)
                ),
            },
        });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error(
            "Error creating order:",
            error
        );

        res.status(500).json({
            message: "Failed to place order",
            error: error.message,
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});


// ========================================
// GET ALL ORDERS FOR A USER
// ========================================
router.get("/user/:userId", async (req, res) => {
    try {
        const userId = Number(req.params.userId);

        if (
            !Number.isInteger(userId) ||
            userId < 1
        ) {
            return res.status(400).json({
                message: "Invalid user ID",
            });
        }

        // Get all orders
        const [orders] = await db.query(
            `
            SELECT
                o.id,
                o.user_id,
                o.restaurant_id,
                r.name AS restaurant_name,
                r.image_url AS restaurant_image,
                o.status,
                o.total_amount,
                o.delivery_address,
                o.delivery_phone,
                o.payment_method,
                o.created_at,
                o.updated_at
            FROM orders o
            INNER JOIN restaurants r
                ON o.restaurant_id = r.id
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC
            `,
            [userId]
        );

        // Get items for every order
        for (const order of orders) {
            const [items] = await db.query(
                `
                SELECT
                    oi.id,
                    oi.menu_item_id,
                    m.name,
                    m.image_url,
                    oi.quantity,
                    oi.price
                FROM order_items oi
                INNER JOIN menu_items m
                    ON oi.menu_item_id = m.id
                WHERE oi.order_id = ?
                ORDER BY oi.id ASC
                `,
                [order.id]
            );

            order.items = items;
        }

        res.json(orders);
    } catch (error) {
        console.error(
            "Error fetching user orders:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch orders",
            error: error.message,
        });
    }
});


// ========================================
// ADVANCE ORDER STATUS
// ========================================
router.put("/:id/status", async (req, res) => {
    try {
        const orderId = Number(req.params.id);

        if (!Number.isInteger(orderId) || orderId < 1) {
            return res.status(400).json({
                message: "Invalid order ID",
            });
        }

        // Status progression
        const statusFlow = [
            "pending",
            "confirmed",
            "preparing",
            "ready",
            "out_for_delivery",
            "delivered",
        ];

        // Get current status
        const [orders] = await db.query(
            `
            SELECT status
            FROM orders
            WHERE id = ?
            `,
            [orderId]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        const currentStatus = orders[0].status;

        // Find current position
        const currentIndex =
            statusFlow.indexOf(currentStatus);

        if (currentIndex === -1) {
            return res.status(400).json({
                message: "Invalid current order status",
            });
        }

        // Already delivered
        if (
            currentIndex ===
            statusFlow.length - 1
        ) {
            return res.json({
                message: "Order is already delivered",
                status: "delivered",
            });
        }

        // Get next status
        const nextStatus =
            statusFlow[currentIndex + 1];

        // Update order
        await db.query(
            `
            UPDATE orders
            SET status = ?
            WHERE id = ?
            `,
            [nextStatus, orderId]
        );

        res.json({
            message: "Order status updated",
            status: nextStatus,
        });
    } catch (error) {
        console.error(
            "Error updating order status:",
            error
        );

        res.status(500).json({
            message: "Failed to update order status",
            error: error.message,
        });
    }
});

module.exports = router;