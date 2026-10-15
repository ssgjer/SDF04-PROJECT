import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const trackingSteps = [
    {
        key: "pending",
        label: "Order Placed",
    },
    {
        key: "confirmed",
        label: "Confirmed",
    },
    {
        key: "preparing",
        label: "Preparing",
    },
    {
        key: "ready",
        label: "Ready",
    },
    {
        key: "out_for_delivery",
        label: "Out for Delivery",
    },
    {
        key: "delivered",
        label: "Delivered",
    },
];

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingOrderId, setUpdatingOrderId] =
        useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            const storedUser =
                localStorage.getItem("user");

            if (!storedUser) {
                setError(
                    "Please login to view your orders."
                );
                setLoading(false);
                return;
            }

            try {
                const user = JSON.parse(
                    storedUser
                );

                const response = await fetch(
                    `http://localhost:5000/api/orders/user/${user.id}`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Failed to fetch orders"
                    );
                }

                setOrders(data);
            } catch (error) {
                console.error(
                    "Fetch orders error:",
                    error
                );

                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusIndex = (status) => {
        return trackingSteps.findIndex(
            (step) => step.key === status
        );
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString(
            "en-PH",
            {
                dateStyle: "medium",
                timeStyle: "short",
            }
        );
    };

    const advanceOrderStatus = async (order) => {
        const statusFlow = [
            "pending",
            "confirmed",
            "preparing",
            "ready",
            "out_for_delivery",
            "delivered",
        ];

        const currentIndex =
            statusFlow.indexOf(order.status);

        if (
            currentIndex === -1 ||
            currentIndex >=
                statusFlow.length - 1
        ) {
            return;
        }

        setUpdatingOrderId(order.id);

        try {
            const response = await fetch(
                `http://localhost:5000/api/orders/${order.id}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to update order status"
                );
            }

            setOrders((currentOrders) =>
                currentOrders.map(
                    (currentOrder) =>
                        currentOrder.id ===
                        order.id
                            ? {
                                  ...currentOrder,
                                  status: data.status,
                              }
                            : currentOrder
                )
            );
        } catch (error) {
            console.error(
                "Advance status error:",
                error
            );

            alert(error.message);
        } finally {
            setUpdatingOrderId(null);
        }
    };

    if (loading) {
        return (
            <section className="flex min-h-screen items-center justify-center bg-[#fffdfb]">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#d8cbc1] border-t-[#4b3428]" />

                    <p className="text-sm font-medium text-[#80604d]">
                        Loading your orders...
                    </p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="flex min-h-screen items-center justify-center bg-[#f4eee8] px-6">
                <div className="w-full max-w-md rounded-3xl border border-[#d8cbc1] bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f4eee8]">
                        <svg
                            className="h-6 w-6 text-[#80604d]"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.5M12 16h.01"
                            />

                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10.3 4.8 2.8 18a1.5 1.5 0 0 0 1.3 2.2h15.8a1.5 1.5 0 0 0 1.3-2.2L13.7 4.8a2 2 0 0 0-3.4 0Z"
                            />
                        </svg>
                    </div>

                    <h2 className="mt-5 text-2xl font-semibold text-[#4b3428]">
                        Unable to load orders
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-gray-500">
                        {error}
                    </p>

                    <Link
                        to="/login"
                        className="mt-6 inline-flex rounded-full bg-[#4b3428] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3d2b22]"
                    >
                        Login
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section
            id="orders"
            className="min-h-screen bbg-[#fffdfb] px-4 py-10 sm:px-6 sm:py-14 lg:px-8"
        >
            <div className="mx-auto max-w-5xl">
                {/* Page Header */}
                <div className="mb-10">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#80604d]">
                        Your Orders
                    </p>

                    <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#4b3428] sm:text-5xl">
                        Orders & Tracking
                    </h1>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
                        View your orders and follow
                        their delivery progress in one
                        place.
                    </p>
                </div>

                {/* No Orders */}
                {orders.length === 0 ? (
                    <div className="rounded-3xl border border-[#d8cbc1] bg-white px-6 py-16 text-center shadow-md">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f4eee8]">
                            <svg
                                className="h-7 w-7 text-[#80604d]"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.7"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 8h12l1 12H5L6 8Z"
                                />

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 8a3 3 0 0 1 6 0"
                                />
                            </svg>
                        </div>

                        <h2 className="mt-5 text-xl font-semibold text-[#4b3428]">
                            No orders yet
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            Your orders will appear here
                            after you place one.
                        </p>

                        <Link
                            to="/restaurants"
                            className="mt-6 inline-flex rounded-full bg-[#4b3428] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3d2b22]"
                        >
                            Browse Restaurants
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const currentIndex =
                                getStatusIndex(
                                    order.status
                                );

                            const isCancelled =
                                order.status ===
                                "cancelled";

                            return (
                                <article
                                    key={order.id}
                                    className="overflow-hidden rounded-3xl border border-[#d8cbc1] bg-white shadow-sm"
                                >
                                    {/* Order Header */}
                                    <div className="border-b border-[#eee6df] p-5 sm:p-6">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-[#f4eee8]">
                                                    {order.restaurant_image ? (
                                                        <img
                                                            src={
                                                                order.restaurant_image
                                                            }
                                                            alt={
                                                                order.restaurant_name
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <span className="text-xl">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-fork-knife" viewBox="0 0 16 16">
                                                                    <path d="M13 .5c0-.276-.226-.506-.498-.465-1.703.257-2.94 2.012-3 8.462a.5.5 0 0 0 .498.5c.56.01 1 .13 1 1.003v5.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5zM4.25 0a.25.25 0 0 1 .25.25v5.122a.128.128 0 0 0 .256.006l.233-5.14A.25.25 0 0 1 5.24 0h.522a.25.25 0 0 1 .25.238l.233 5.14a.128.128 0 0 0 .256-.006V.25A.25.25 0 0 1 6.75 0h.29a.5.5 0 0 1 .498.458l.423 5.07a1.69 1.69 0 0 1-1.059 1.711l-.053.022a.92.92 0 0 0-.58.884L6.47 15a.971.971 0 1 1-1.942 0l.202-6.855a.92.92 0 0 0-.58-.884l-.053-.022a1.69 1.69 0 0 1-1.059-1.712L3.462.458A.5.5 0 0 1 3.96 0z" />
                                                                </svg>
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <h2 className="truncate font-semibold text-[#4b3428]">
                                                        {
                                                            order.restaurant_name
                                                        }
                                                    </h2>

                                                    <p className="mt-1 text-xs text-gray-400">
                                                        Order #
                                                        {
                                                            order.id
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="shrink-0 text-right">
                                                <p className="text-xs uppercase tracking-wide text-gray-400">
                                                    Total
                                                </p>

                                                <p className="mt-1 font-bold text-[#4b3428]">
                                                    ₱
                                                    {Number(
                                                        order.total_amount
                                                    ).toFixed(
                                                        2
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <p className="mt-4 text-xs text-gray-400">
                                            {formatDate(
                                                order.created_at
                                            )}
                                        </p>
                                    </div>

                                    {/* Food Items */}
                                    <div className="p-5 sm:p-6">
                                        <h3 className="mb-4 text-sm font-semibold text-[#4b3428]">
                                            Your Items
                                        </h3>

                                        <div className="space-y-3">
                                            {order.items?.map(
                                                (item) => (
                                                    <div
                                                        key={
                                                            item.id
                                                        }
                                                        className="flex items-center gap-3"
                                                    >
                                                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#f4eee8]">
                                                            {item.image_url ? (
                                                                <img
                                                                    src={
                                                                        item.image_url
                                                                    }
                                                                    alt={
                                                                        item.name
                                                                    }
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-sm">
                                                                    🍴
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-medium text-[#4b3428]">
                                                                {
                                                                    item.name
                                                                }
                                                            </p>

                                                            <p className="mt-0.5 text-xs text-gray-400">
                                                                ×{" "}
                                                                {
                                                                    item.quantity
                                                                }
                                                            </p>
                                                        </div>

                                                        <p className="text-sm font-semibold text-[#4b3428]">
                                                            ₱
                                                            {(
                                                                Number(
                                                                    item.price
                                                                ) *
                                                                Number(
                                                                    item.quantity
                                                                )
                                                            ).toFixed(
                                                                2
                                                            )}
                                                        </p>
                                                    </div>
                                                )
                                            )}
                                        </div>

                                        {/* Order Information */}
                                        <div className="mt-6 grid gap-4 border-t border-[#eee6df] pt-5 sm:grid-cols-2">
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-gray-400">
                                                    Payment
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-[#4b3428]">
                                                    {order.payment_method ===
                                                    "gcash"
                                                        ? "GCash"
                                                        : "Cash on Delivery"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-gray-400">
                                                    Delivery
                                                    Address
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-[#4b3428]">
                                                    {
                                                        order.delivery_address
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        {/* Tracking */}
                                        <div className="mt-7 border-t border-[#eee6df] pt-6">
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex items-center justify-between gap-4">
                                                    <h3 className="text-sm font-semibold text-[#4b3428]">
                                                        Order
                                                        Tracking
                                                    </h3>

                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                                                            isCancelled
                                                                ? "bg-red-50 text-red-500"
                                                                : "bg-[#f4eee8] text-[#80604d]"
                                                        }`}
                                                    >
                                                        {order.status.replaceAll(
                                                            "_",
                                                            " "
                                                        )}
                                                    </span>
                                                </div>

                                                {!isCancelled &&
                                                    order.status !==
                                                        "delivered" && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                advanceOrderStatus(
                                                                    order
                                                                )
                                                            }
                                                            disabled={
                                                                updatingOrderId ===
                                                                order.id
                                                            }
                                                            className={`rounded-full px-5 py-2.5 text-xs font-semibold text-white transition active:scale-95 ${
                                                                updatingOrderId ===
                                                                order.id
                                                                    ? "cursor-not-allowed bg-[#80604d] opacity-70"
                                                                    : "bg-[#4b3428] hover:bg-[#3d2b22]"
                                                            }`}
                                                        >
                                                            {updatingOrderId ===
                                                            order.id
                                                                ? "Updating..."
                                                                : "Advance Status"}
                                                        </button>
                                                    )}
                                            </div>

                                            {/* Cancelled */}
                                            {isCancelled ? (
                                                <div className="mt-5 rounded-2xl bg-red-50 px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500">
                                                            ×
                                                        </div>

                                                        <div>
                                                            <p className="text-sm font-semibold text-red-600">
                                                                Order
                                                                Cancelled
                                                            </p>

                                                            <p className="mt-1 text-xs text-red-400">
                                                                This
                                                                order
                                                                will
                                                                not
                                                                be
                                                                delivered.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mt-6">
                                                    {/* Desktop Timeline */}
                                                    <div className="hidden sm:block">
                                                        <div className="flex items-start">
                                                            {trackingSteps.map(
                                                                (
                                                                    step,
                                                                    index
                                                                ) => {
                                                                    const completed =
                                                                        index <=
                                                                        currentIndex;

                                                                    const active =
                                                                        index ===
                                                                        currentIndex;

                                                                    return (
                                                                        <div
                                                                            key={
                                                                                step.key
                                                                            }
                                                                            className="flex min-w-0 flex-1 items-start"
                                                                        >
                                                                            <div className="flex w-full flex-col items-center">
                                                                                <div className="flex w-full items-center">
                                                                                    <div
                                                                                        className={`h-1 flex-1 ${
                                                                                            index ===
                                                                                            0
                                                                                                ? "bg-transparent"
                                                                                                : index <=
                                                                                                  currentIndex
                                                                                                ? "bg-[#4b3428]"
                                                                                                : "bg-[#e8ddd5]"
                                                                                        }`}
                                                                                    />

                                                                                    <div
                                                                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                                                                                            completed
                                                                                                ? "border-[#4b3428] bg-[#4b3428] text-white"
                                                                                                : "border-[#d8cbc1] bg-white text-gray-300"
                                                                                        } ${
                                                                                            active
                                                                                                ? "ring-4 ring-[#f4eee8]"
                                                                                                : ""
                                                                                        }`}
                                                                                    >
                                                                                        {completed ? (
                                                                                            <svg
                                                                                                className="h-4 w-4"
                                                                                                viewBox="0 0 24 24"
                                                                                                fill="none"
                                                                                                stroke="currentColor"
                                                                                                strokeWidth="3"
                                                                                            >
                                                                                                <path
                                                                                                    strokeLinecap="round"
                                                                                                    strokeLinejoin="round"
                                                                                                    d="m5 12 4 4L19 6"
                                                                                                />
                                                                                            </svg>
                                                                                        ) : (
                                                                                            <span className="h-2 w-2 rounded-full bg-current" />
                                                                                        )}
                                                                                    </div>

                                                                                    <div
                                                                                        className={`h-1 flex-1 ${
                                                                                            index ===
                                                                                            trackingSteps.length -
                                                                                                1
                                                                                                ? "bg-transparent"
                                                                                                : index <
                                                                                                  currentIndex
                                                                                                ? "bg-[#4b3428]"
                                                                                                : "bg-[#e8ddd5]"
                                                                                        }`}
                                                                                    />
                                                                                </div>

                                                                                <p
                                                                                    className={`mt-3 text-center text-[10px] leading-4 ${
                                                                                        active
                                                                                            ? "font-bold text-[#4b3428]"
                                                                                            : completed
                                                                                            ? "font-medium text-[#80604d]"
                                                                                            : "text-gray-400"
                                                                                    }`}
                                                                                >
                                                                                    {
                                                                                        step.label
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Mobile Timeline */}
                                                    <div className="sm:hidden">
                                                        <div className="space-y-4">
                                                            {trackingSteps.map(
                                                                (
                                                                    step,
                                                                    index
                                                                ) => {
                                                                    const completed =
                                                                        index <=
                                                                        currentIndex;

                                                                    const active =
                                                                        index ===
                                                                        currentIndex;

                                                                    return (
                                                                        <div
                                                                            key={
                                                                                step.key
                                                                            }
                                                                            className="flex items-center gap-3"
                                                                        >
                                                                            <div
                                                                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                                                                                    completed
                                                                                        ? "border-[#4b3428] bg-[#4b3428] text-white"
                                                                                        : "border-[#d8cbc1] bg-white text-gray-300"
                                                                                } ${
                                                                                    active
                                                                                        ? "ring-4 ring-[#f4eee8]"
                                                                                        : ""
                                                                                }`}
                                                                            >
                                                                                {completed ? (
                                                                                    <svg
                                                                                        className="h-4 w-4"
                                                                                        viewBox="0 0 24 24"
                                                                                        fill="none"
                                                                                        stroke="currentColor"
                                                                                        strokeWidth="3"
                                                                                    >
                                                                                        <path
                                                                                            strokeLinecap="round"
                                                                                            strokeLinejoin="round"
                                                                                            d="m5 12 4 4L19 6"
                                                                                        />
                                                                                    </svg>
                                                                                ) : (
                                                                                    <span className="h-2 w-2 rounded-full bg-current" />
                                                                                )}
                                                                            </div>

                                                                            <div>
                                                                                <p
                                                                                    className={`text-sm ${
                                                                                        active
                                                                                            ? "font-bold text-[#4b3428]"
                                                                                            : completed
                                                                                            ? "font-medium text-[#80604d]"
                                                                                            : "text-gray-400"
                                                                                    }`}
                                                                                >
                                                                                    {
                                                                                        step.label
                                                                                    }
                                                                                </p>

                                                                                {active && (
                                                                                    <p className="mt-0.5 text-xs text-gray-400">
                                                                                        Current
                                                                                        status
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}

export default Orders;