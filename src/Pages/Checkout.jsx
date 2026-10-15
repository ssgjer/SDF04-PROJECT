import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Checkout() {
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);

    const [error, setError] = useState("");
    const [orderSuccess, setOrderSuccess] = useState(null);

    const [form, setForm] = useState({
        name: "",
        phone: "",
        address: "",
        payment_method: "cash_on_delivery",
    });

    const deliveryFee = 49;

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            navigate("/login");
            return;
        }

        try {
            const user = JSON.parse(storedUser);

            setForm((currentForm) => ({
                ...currentForm,
                name: user.name || "",
                phone: user.phone || "",
            }));

            fetchCart(user.id);
        } catch (error) {
            console.error(error);
            localStorage.removeItem("user");
            navigate("/login");
        }
    }, [navigate]);

    const fetchCart = async (userId) => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `http://localhost:5000/api/cart/${userId}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch cart");
            }

            const data = await response.json();

            if (data.length === 0) {
                navigate("/cart");
                return;
            }

            setCartItems(data);
        } catch (error) {
            console.error(error);
            setError("Unable to load your cart.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    };

    const subtotal = useMemo(() => {
        return cartItems.reduce((total, item) => {
            return (
                total +
                Number(item.price) * item.quantity
            );
        }, 0);
    }, [cartItems]);

    const total = subtotal + deliveryFee;

    const totalItems = useMemo(() => {
        return cartItems.reduce((total, item) => {
            return total + item.quantity;
        }, 0);
    }, [cartItems]);

    const handlePlaceOrder = async (event) => {
        event.preventDefault();

        if (
            !form.name.trim() ||
            !form.phone.trim() ||
            !form.address.trim()
        ) {
            setError(
                "Please complete all delivery information."
            );
            return;
        }

        try {
            setPlacingOrder(true);
            setError("");

            const storedUser =
                localStorage.getItem("user");

            if (!storedUser) {
                navigate("/login");
                return;
            }

            const user = JSON.parse(storedUser);

            const response = await fetch(
                "http://localhost:5000/api/orders",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        user_id: user.id,
                        delivery_address:
                            form.address.trim(),
                        delivery_phone:
                            form.phone.trim(),
                        payment_method:
                            form.payment_method,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to place order"
                );
            }
            window.dispatchEvent(new Event("cartUpdated"));

            setOrderSuccess(data.order);
        } catch (error) {
            console.error(error);

            setError(
                error.message ||
                    "Unable to place your order."
            );
        } finally {
            setPlacingOrder(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-10">
                <div className="mx-auto max-w-6xl">
                    <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />

                    <div className="mt-8 grid gap-6 lg:grid-cols-3">
                        <div className="h-96 animate-pulse rounded-2xl bg-gray-200 lg:col-span-2" />

                        <div className="h-80 animate-pulse rounded-2xl bg-gray-200" />
                    </div>
                </div>
            </div>
        );
    }

    if (orderSuccess) {
        return (
            <main className="min-h-screen bg-gray-50 px-4 py-12">
                <div className="mx-auto max-w-xl">
                    <div className="rounded-3xl bg-white p-8 text-center shadow-sm sm:p-10">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                        </div>

                        <h1 className="mt-6 text-3xl font-bold text-[#4b3428]">
                            Order Placed!
                        </h1>

                        <p className="mt-3 text-gray-600">
                            Your order has been placed
                            successfully.
                        </p>

                        <div className="mt-8 rounded-2xl bg-gray-50 p-5 text-left">
                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Order ID
                                </span>

                                <span className="font-semibold text-gray-900">
                                    #{orderSuccess.id}
                                </span>
                            </div>

                            <div className="mt-3 flex justify-between">
                                <span className="text-gray-500">
                                    Payment
                                </span>

                                <span className="font-semibold text-gray-900">
                                    {orderSuccess.payment_method ===
                                    "gcash"
                                        ? "GCash"
                                        : "Cash on Delivery"}
                                </span>
                            </div>

                            <div className="mt-3 flex justify-between">
                                <span className="text-gray-500">
                                    Total
                                </span>

                                <span className="font-semibold text-[#4b3428]">
                                    ₱
                                    {Number(
                                        orderSuccess.total_amount
                                    ).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <Link
                            to="/"
                            className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8">
                    <Link
                        to="/cart"
                        className="text-sm font-medium text-orange-500 hover:text-orange-600"
                    >
                        ← Back to Cart
                    </Link>

                    <h1 className="mt-3 text-3xl font-bold text-gray-900">
                        Checkout
                    </h1>

                    <p className="mt-1 text-gray-500">
                        Complete your order details
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handlePlaceOrder}
                    className="grid gap-6 lg:grid-cols-3"
                >
                    {/* Delivery Information */}
                    <div className="space-y-6 lg:col-span-2">
                        <section className="rounded-2xl bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900">
                                Delivery Information
                            </h2>

                            <div className="mt-5 space-y-4">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        Full Name
                                    </label>

                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={form.name}
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter your full name"
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="phone"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        Phone Number
                                    </label>

                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={form.phone}
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="09XXXXXXXXX"
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="address"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        Delivery Address
                                    </label>

                                    <textarea
                                        id="address"
                                        name="address"
                                        rows="4"
                                        value={form.address}
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="House/Building, Street, Barangay, City"
                                        className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Payment */}
                        <section className="rounded-2xl bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900">
                                Payment Method
                            </h2>

                            <div className="mt-5 space-y-3">
                                {/* Cash on Delivery */}
                                <label
                                    className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                                        form.payment_method === "cash_on_delivery"
                                            ? "border-orange-500 bg-orange-50"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="cash_on_delivery"
                                        checked={form.payment_method === "cash_on_delivery"}
                                        onChange={handleChange}
                                        className="h-5 w-5 accent-orange-500"
                                    />

                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            Cash on Delivery
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            Pay when your order arrives
                                        </p>
                                    </div>
                                </label>

                                {/* GCash */}
                                <label
                                    className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                                        form.payment_method === "gcash"
                                            ? "border-orange-500 bg-orange-50"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="gcash"
                                        checked={form.payment_method === "gcash"}
                                        onChange={handleChange}
                                        className="h-5 w-5 accent-orange-500"
                                    />

                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            GCash
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            Pay using your GCash account
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {/* GCash Warning */}
                            {form.payment_method === "gcash" && (
                                <div
                                    key={form.payment_method}
                                    className="mt-4 rounded-xl border border-red-500 p-4 text-sm text-red-500 shadow-[inset_0px_0px_2px_0px_red] animate-[shake_0.4s_ease-in-out]"
                                >
                                    Wala pang Gcash mag Cash on Delivery ka. Bawal Cashless dito!
                                </div>
                            )}
                        </section>

                    </div>

                    {/* Order Summary */}
                    <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm lg:sticky lg:top-24">
                        <h2 className="text-xl font-bold text-gray-900">
                            Order Summary
                        </h2>

                        <div className="mt-5 space-y-4">
                            {cartItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex gap-3"
                                >
                                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                                        {item.image_url ? (
                                            <img
                                                src={
                                                    item.image_url
                                                }
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-xl">
                                                🍽️
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-semibold text-gray-900">
                                            {item.name}
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            × {item.quantity}
                                        </p>

                                        <p className="text-sm font-medium text-gray-700">
                                            ₱
                                            {(
                                                Number(
                                                    item.price
                                                ) *
                                                item.quantity
                                            ).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="my-5 border-t border-gray-200" />

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Items
                                </span>

                                <span className="font-medium text-gray-900">
                                    {totalItems}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Subtotal
                                </span>

                                <span className="font-medium text-gray-900">
                                    ₱{subtotal.toFixed(2)}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Delivery Fee
                                </span>

                                <span className="font-medium text-gray-900">
                                    ₱{deliveryFee.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className="my-5 border-t border-gray-200" />

                        <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900">
                                Total
                            </span>

                            <span className="text-2xl font-bold text-[#4b3428]">
                                ₱{total.toFixed(2)}
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={placingOrder}
                            className="mt-6 w-full rounded-xl bg-[#4b3428] px-6 py-3.5 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {placingOrder
                                ? "Placing Order..."
                                : "Place Order"}
                        </button>

                        <p className="mt-3 text-center text-xs text-gray-400">
                            By placing your order, you
                            confirm that your delivery
                            information is correct.
                        </p>
                    </aside>
                </form>
            </div>
        </main>
    );
}

export default Checkout;