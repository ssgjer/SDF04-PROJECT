import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

function Search() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const searchText = searchParams.get("search") || "";
    const query = searchText.trim().toLowerCase();

    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [retry, setRetry] = useState(0);
    const [addingItem, setAddingItem] = useState(null);
    const [addedItem, setAddedItem] = useState(null);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    "http://localhost:5000/api/menu"
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch menu.");
                }

                const data = await response.json();

                if (!Array.isArray(data)) {
                    throw new Error("Invalid menu data received.");
                }

                setMenuItems(data);
            } catch (error) {
                console.error("Error fetching menu:", error);
                setError("Unable to load menu. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, [retry]);

    const filteredItems = menuItems.filter((item) =>
        [
            item.name,
            item.description,
            item.restaurant_name,
        ]
            .filter(Boolean)
            .some((value) =>
                String(value).toLowerCase().includes(query)
            )
    );

    const handleAddToCart = async (item) => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            alert("Please login first before adding items to your cart.");
            navigate("/login");
            return;
        }

        let user;

        try {
            user = JSON.parse(storedUser);
        } catch (error) {
            console.error("Invalid user data:", error);
            alert("Your login session is invalid. Please login again.");
            navigate("/login");
            return;
        }

        if (!user?.id) {
            alert("Please login again before adding items to your cart.");
            navigate("/login");
            return;
        }

        setAddingItem(item.id);

        try {
            const response = await fetch(
                "http://localhost:5000/api/cart",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        user_id: user.id,
                        menu_item_id: item.id,
                        quantity: 1,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to add item to cart."
                );
            }

            setAddedItem(item.id);
            window.dispatchEvent(new Event("cartUpdated"));

            setTimeout(() => {
                setAddedItem((current) =>
                    current === item.id ? null : current
                );
            }, 1500);
        } catch (error) {
            console.error("Add to cart error:", error);
            alert(error.message || "Unable to add item to cart.");
        } finally {
            setAddingItem(null);
        }
    };

    if (loading) {
        return (
            <section className="flex min-h-screen items-center justify-center bg-[#fffdfb] px-6 py-20">
                <div className="flex flex-col items-center">
                    <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />

                    <p className="text-sm font-medium text-gray-500">
                        Finding delicious food...
                    </p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="flex min-h-screen items-center justify-center bg-[#fffdfb] px-6 py-20">
                <div className="rounded-2xl border border-red-100 bg-white px-8 py-6 text-center shadow-sm">
                    <p className="font-medium text-red-500">{error}</p>

                    <button
                        type="button"
                        onClick={() => setRetry((previous) => previous + 1)}
                        className="mt-4 rounded-full bg-[#4b3428] px-5 py-2 text-sm font-bold text-white hover:bg-orange-500"
                    >
                        Try Again
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-screen scroll-mt-24 bg-[#fffdfb] px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
            <div className="mx-auto max-w-7xl">
                {/* Section Header */}
                <div className="mb-12">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2">
                        <span className="h-2 w-2 rounded-full bg-orange-500" />

                        <span className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">
                            Filipino Favorites
                        </span>
                    </div>

                    <h1 className="text-4xl font-semibold tracking-tight text-[#4b3428] sm:text-5xl">
                        Search Results
                        <span className="text-amber-600">.</span>
                    </h1>

                    {query && (
                        <p className="mt-4 text-base text-gray-500 sm:text-lg">
                            Showing dishes matching{" "}
                            <span className="font-semibold text-[#4b3428]">
                                "{searchText.trim()}"
                            </span>
                        </p>
                    )}
                </div>

                {!query ? (
                    <div className="rounded-3xl border border-gray-100 bg-white px-6 py-20 text-center shadow-sm">
                        <h2 className="text-xl font-bold text-[#4b3428]">
                            What are you craving?
                        </h2>

                        <p className="mt-2 text-gray-500">
                            Search for dishes like Adobo, Sinigang, or
                            Lechon Kawali using the header search bar.
                        </p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="rounded-3xl border border-gray-100 bg-white px-6 py-20 text-center shadow-sm">
                        <h2 className="text-xl font-bold text-[#4b3428]">
                            No dishes found
                        </h2>

                        <p className="mt-2 text-gray-500">
                            Try another dish name or restaurant.
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="mb-6 text-sm font-medium text-gray-400">
                            {filteredItems.length}{" "}
                            {filteredItems.length === 1 ? "dish" : "dishes"} found
                        </p>

                        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredItems.map((item) => (
                                <article
                                    key={item.id}
                                    className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                >
                                    {/* Food Image */}
                                    <div className="relative h-40 overflow-hidden bg-gray-100 sm:h-56">
                                        <img
                                            src={
                                                item.image_url ||
                                                "/images/restaurant-placeholder.png"
                                            }
                                            alt={item.name}
                                            loading="lazy"
                                            onError={(event) => {
                                                event.currentTarget.onerror = null;
                                                event.currentTarget.src =
                                                    "/images/restaurant-placeholder.png";
                                            }}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                        />

                                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />

                                        {/* Restaurant Badge */}
                                        <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
                                            <span className="inline-flex max-w-[160px] items-center truncate rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-gray-800 shadow-sm backdrop-blur sm:max-w-[200px]">
                                                {item.restaurant_name || "Local Restaurant"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Food Details */}
                                    <div className="p-3 sm:p-5">
                                        <h2 className="line-clamp-1 text-base font-bold tracking-tight text-[#4b3428] sm:text-xl">
                                            {item.name}
                                        </h2>

                                        <p className="mt-2 line-clamp-2 min-h-[40px] text-xs leading-5 text-gray-500 sm:text-sm">
                                            {item.description ||
                                                "A delicious Filipino favorite."}
                                        </p>

                                        {/* Price + Add to Cart */}
                                        <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                    Price
                                                </p>

                                                <p className="mt-0.5 text-sm font-semibold text-gray-900 sm:text-base">
                                                    {item.price !== null &&
                                                    item.price !== "" &&
                                                    Number.isFinite(Number(item.price))
                                                        ? `₱${Number(item.price).toFixed(2)}`
                                                        : "Price unavailable"}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleAddToCart(item)}
                                                disabled={addingItem === item.id}
                                                aria-label={`Add ${item.name} to cart`}
                                                className={`flex items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-bold text-white shadow-md transition-all duration-200 active:scale-95 sm:px-4 sm:py-2 sm:text-sm ${
                                                    addedItem === item.id
                                                        ? "bg-green-500"
                                                        : "hover:bg-orange-500"
                                                } ${
                                                    addingItem === item.id
                                                        ? "cursor-not-allowed opacity-70"
                                                        : ""
                                                }`}
                                            >
                                                {addingItem === item.id ? (
                                                    <>
                                                        <svg
                                                            className="h-4 w-4 animate-spin"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                            />
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                            />
                                                        </svg>
                                                        ...
                                                    </>
                                                ) : addedItem === item.id ? (
                                                    <>
                                                        <svg
                                                            className="h-4 w-4"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2.5"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="m5 12 4 4L19 6"
                                                            />
                                                        </svg>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={1.5}
                                                            stroke="currentColor"
                                                            className="h-5 w-5 text-black"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1-1.5 0Z"
                                                            />
                                                        </svg>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}

export default Search;
