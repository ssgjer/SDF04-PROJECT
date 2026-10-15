import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Cart() {
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingItem, setUpdatingItem] = useState(null);
    const [removingItem, setRemovingItem] = useState(null);
    const [error, setError] = useState("");

    const deliveryFee = 49;

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            setLoading(true);
            setError("");

            const storedUser = localStorage.getItem("user");

            if (!storedUser) {
                navigate("/login");
                return;
            }

            const user = JSON.parse(storedUser);

            const response = await fetch(
                `http://localhost:5000/api/cart/${user.id}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch cart");
            }

            const data = await response.json();

            setCartItems(data);
        } catch (error) {
            console.error(error);
            setError("Unable to load your cart.");
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (item, newQuantity) => {
        if (newQuantity < 1) {
            return;
        }

        try {
            setUpdatingItem(item.id);

            const response = await fetch(
                `http://localhost:5000/api/cart/${item.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        quantity: newQuantity,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update quantity");
            }

            setCartItems((currentItems) =>
                currentItems.map((cartItem) =>
                    cartItem.id === item.id
                        ? {
                              ...cartItem,
                              quantity: newQuantity,
                          }
                        : cartItem
                )
            );
        } catch (error) {
            console.error(error);
            alert("Unable to update quantity.");
        } finally {
            setUpdatingItem(null);
        }
    };

  
    const removeItem = async (item) => {
        try {
            setRemovingItem(item.id);

            const response = await fetch(
                `http://localhost:5000/api/cart/${item.id}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to remove item");
            }

            setCartItems((currentItems) =>
                currentItems.filter(
                    (cartItem) => cartItem.id !== item.id
                )
            );
        } catch (error) {
            console.error(error);
            alert("Unable to remove this item.");
        } finally {
            setRemovingItem(null);
        }
    };



    const subtotal = useMemo(() => {
        return cartItems.reduce((total, item) => {
            return total + Number(item.price) * item.quantity;
        }, 0);
    }, [cartItems]);

    const total = cartItems.length > 0
        ? subtotal + deliveryFee
        : 0;

    const totalItems = useMemo(() => {
        return cartItems.reduce((total, item) => {
            return total + item.quantity;
        }, 0);
    }, [cartItems]);

    if (loading) {
        return (
            <section className="min-h-screen bg-orange-50 px-6 py-16">
                <div className="max-w-6xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        <div className="h-10 bg-gray-200 rounded-xl w-64" />

                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-4">
                                <div className="h-32 bg-white rounded-2xl" />
                                <div className="h-32 bg-white rounded-2xl" />
                            </div>

                            <div className="h-72 bg-white rounded-2xl" />
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="min-h-screen bg-orange-50 flex items-center justify-center px-6">
                <div className="bg-white rounded-2xl shadow-md p-10 text-center max-w-md">
                    <div className="text-5xl mb-4 flex justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-exclamation" viewBox="0 0 16 16">
                            <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.553.553 0 0 1-1.1 0z"/>
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-[#4b3428]">
                        Something went wrong
                    </h2>

                    <p className="text-gray-500 mt-2">
                        {error}
                    </p>

                    <button
                        onClick={fetchCart}
                        className="mt-6 bg-[#4b3428] hover:bg-orange-600 text-white px-6 py-2 rounded-xl transition"
                    >
                        Try Again
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-screen bg-[#fffdfb] px-4 sm:px-6 py-10 sm:py-14">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <p className="text-amber-600 font-semibold uppercase tracking-wider text-sm">
                        Your Order
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mt-1">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-[#4b3428]">
                                Your Cart
                            </h1>

                            {cartItems.length > 0 && (
                                <p className="text-gray-500 mt-2">
                                    {totalItems}{" "}
                                    {totalItems === 1
                                        ? "item"
                                        : "items"}{" "}
                                    ready to order
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Empty cart */}
                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 sm:p-16 text-center">
                        <div className="w-20 h-20 mx-auto rounded-full bg-orange-50 flex items-center justify-center text-4xl">
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-basket" viewBox="0 0 16 16">
                                <path d="M5.757 1.071a.5.5 0 0 1 .172.686L3.383 6h9.234L10.07 1.757a.5.5 0 1 1 .858-.514L13.783 6H15a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1v4.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 13.5V9a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h1.217L5.07 1.243a.5.5 0 0 1 .686-.172zM2 9v4.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V9zM1 7v1h14V7zm3 3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3A.5.5 0 0 1 4 10m2 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3A.5.5 0 0 1 6 10m2 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3A.5.5 0 0 1 8 10m2 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 1 .5-.5m2 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 1 .5-.5"/>
                            </svg>                   
                        </div>

                        <h2 className="text-2xl font-bold text-[#4b3428] mt-6">
                            Your cart is empty
                        </h2>

                        <p className="text-gray-500 mt-2 max-w-md mx-auto">
                            Looks like you haven't added anything yet.
                            Discover delicious Filipino dishes and start
                            building your order.
                        </p>

                        <Link
                            to="/"
                            className="inline-flex mt-7 bg-[#4b3428] hover:bg-orange-600 text-white px-7 py-3 rounded-xl font-semibold transition"
                        >
                            Browse Menu
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8 items-start">

                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => {
                                const itemTotal =
                                    Number(item.price) *
                                    item.quantity;

                                return (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5"
                                    >
                                        <div className="flex gap-4">

                                            {/* Image */}
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover shrink-0"
                                            />

                                            {/* Information */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between gap-3">
                                                    <div>
                                                        <h2 className="font-bold text-[#4b3428] text-lg truncate">
                                                            {item.name}
                                                        </h2>

                                                        <p className="text-sm text-orange-500 font-semibold mt-1">
                                                            {item.restaurant_name}
                                                        </p>
                                                    </div>

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() =>
                                                            removeItem(item)
                                                        }
                                                        disabled={
                                                            removingItem ===
                                                            item.id
                                                        }
                                                        className="text-gray-400 hover:text-red-500 transition shrink-0 p-1"
                                                        title="Remove item"
                                                    >
                                                        {removingItem ===
                                                        item.id ? (
                                                            <span className="text-xs">
                                                                Removing...
                                                            </span>
                                                        ) : (
                                                            <span className="text-xl">
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                                </svg>
                                                            </span>
                                                        )}
                                                    </button>
                                                </div>

                                                <p className="text-gray-500 text-sm mt-2">
                                                    ₱
                                                    {Number(
                                                        item.price
                                                    ).toFixed(2)}{" "}
                                                    each
                                                </p>

                                                <div className="flex items-center justify-between mt-4 gap-4">

                                                    {/* Quantity */}
                                                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                                                        <button
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item,
                                                                    item.quantity -
                                                                        1
                                                                )
                                                            }
                                                            disabled={
                                                                updatingItem ===
                                                                    item.id ||
                                                                item.quantity ===
                                                                    1
                                                            }
                                                            className="w-9 h-9 flex items-center justify-center text-gray-700 hover:bg-orange-50 disabled:text-gray-300 disabled:hover:bg-white transition font-bold"
                                                        >
                                                            −
                                                        </button>

                                                        <span className="w-10 text-center font-semibold text-gray-900">
                                                            {updatingItem ===
                                                            item.id ? (
                                                                <span className="text-xs">
                                                                    ...
                                                                </span>
                                                            ) : (
                                                                item.quantity
                                                            )}
                                                        </span>

                                                        <button
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item,
                                                                    item.quantity +
                                                                        1
                                                                )
                                                            }
                                                            disabled={
                                                                updatingItem ===
                                                                item.id
                                                            }
                                                            className="w-9 h-9 flex items-center justify-center text-orange-500 hover:bg-orange-50 disabled:text-gray-300 transition font-bold"
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    {/* Item total */}
                                                    <p className="font-bold text-gray-900 text-lg">
                                                        ₱
                                                        {itemTotal.toFixed(
                                                            2
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:sticky lg:top-24">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Order Summary
                                </h2>

                                <div className="mt-6 space-y-4">
                                    <div className="flex justify-between text-gray-600">
                                        <span>
                                            Subtotal
                                        </span>

                                        <span>
                                            ₱
                                            {subtotal.toFixed(
                                                2
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-gray-600">
                                        <span>
                                            Delivery Fee
                                        </span>

                                        <span>
                                            ₱
                                            {deliveryFee.toFixed(
                                                2
                                            )}
                                        </span>
                                    </div>

                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-gray-900 text-lg">
                                                Total
                                            </span>

                                            <span className="font-bold text-[#4b3428] text-2xl">
                                                ₱
                                                {total.toFixed(
                                                    2
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() =>
                                        navigate("/checkout")
                                    }
                                    className="w-full mt-7 bg-[#4b3428] hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold transition shadow-sm hover:shadow-md"
                                >
                                    Proceed to Checkout
                                </button>

                                <Link
                                    to="/"
                                    className="block text-center text-orange-500 hover:text-orange-600 font-semibold text-sm mt-4"
                                >
                                    ← Continue Shopping
                                </Link>
                            </div>

                            {/* Security / information */}
                            <div className="flex items-center gap-1 mt-4 bg-white/70 rounded-2xl p-4 text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 text-orange-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                </svg>

                                <p className="text-xs text-gray-500">
                                    Your order information is securely
                                    handled by QuickEats.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default Cart;