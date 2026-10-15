import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function RestaurantDetail() {
    const { id } = useParams();

    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [addingItem, setAddingItem] = useState(null);
    const [addedItem, setAddedItem] = useState(null);

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `http://localhost:5000/api/restaurants/${id}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch restaurant");
                }

                const data = await response.json();

                setRestaurant(data.restaurant);
                setMenu(data.menu);
            } catch (error) {
                console.error(error);
                setError("Unable to load restaurant.");
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurant();
    }, [id]);

    const handleAddToCart = async (item) => {
        try {
            const storedUser = localStorage.getItem("user");

            if (!storedUser) {
                alert("Please login first before adding items to your cart.");
                return;
            }

            const user = JSON.parse(storedUser);

            setAddingItem(item.id);

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
                    data.message || "Failed to add item to cart"
                );
            }

            setAddedItem(item.id);

            setTimeout(() => {
                setAddedItem(null);
            }, 1500);
        } catch (error) {
            console.error(error);
            alert("Unable to add item to cart.");
        } finally {
            setAddingItem(null);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-orange-50 flex items-center justify-center">
                <p className="text-lg text-gray-600">
                    Loading restaurant...
                </p>
            </main>
        );
    }

    if (error || !restaurant) {
        return (
            <main className="min-h-screen bg-orange-50 flex items-center justify-center px-6">
                <div className="bg-white rounded-2xl shadow-md p-10 text-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Restaurant not found
                    </h2>

                    <p className="text-gray-500 mt-2">
                        {error || "This restaurant does not exist."}
                    </p>

                    <Link
                        to="/restaurants"
                        className="inline-block mt-6 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition"
                    >
                        Back to Restaurants
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#fffdfb]">

            {/* Restaurant Header */}
            <section className="bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

                    <Link
                        to="/restaurants"
                        className="inline-flex items-center text-orange-500 font-semibold hover:text-orange-600 transition"
                    >
                        ← Back to Restaurants
                    </Link>

                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center mt-8">

                        {/* Restaurant Image */}
                        <div>
                            <img
                                src={restaurant.image_url}
                                alt={restaurant.name}
                                className="w-full h-64 sm:h-80 object-cover rounded-3xl shadow-lg"
                            />
                        </div>

                        {/* Restaurant Information */}
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-4xl md:text-5xl font-bold text-[#4b3428]">
                                    {restaurant.name}
                                </h1>

                                <span className="bg-amber-50 items-center flex gap-2 text-orange-600 px-3 py-1 rounded-full font-semibold">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-yellow-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                                    </svg>

                                    <span className="text-gray-500">{restaurant.rating}</span>
                                </span>
                            </div>

                            <p className="text-gray-600 text-lg mt-5 leading-relaxed">
                                {restaurant.description}
                            </p>

                            <div className="mt-6 space-y-3 text-gray-600">
                                <p>
                                    📍{" "}
                                    <span className="font-medium">
                                        {restaurant.address}
                                    </span>
                                </p>

                                <p>
                                    🕐{" "}
                                    <span className="font-medium">
                                        {restaurant.delivery_time}
                                    </span>
                                </p>

                                <p>
                                    📞{" "}
                                    <span className="font-medium">
                                        {restaurant.phone}
                                    </span>
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Restaurant Menu */}
            <section className="px-4 sm:px-6 py-14 bg-[#fffdfb] sm:py-16">
                <div className="max-w-7xl mx-auto">

                    {/* Section Heading */}
                    <div className="text-center mb-10 sm:mb-12">
                        <p className="text-orange-500 font-semibold uppercase tracking-wider">
                            Our Menu
                        </p>

                        <h2 className="text-3xl sm:text-4xl font-bold text-[#4b3428] mt-2">
                            {restaurant.name} Dishes
                        </h2>

                        <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                            Explore everything available from this restaurant.
                        </p>
                    </div>

                    {/* Empty Menu */}
                    {menu.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                            <div className="text-5xl mb-4">
                                🍽️
                            </div>

                            <p className="text-gray-500 text-lg">
                                This restaurant has no menu items yet.
                            </p>
                        </div>
                    ) : (
                        <div className=" grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                            {menu.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300"
                                >
                                    {/* Food Image */}
                                    <div className="relative">
                                        <img
                                            src={item.image_url}
                                            alt={item.name}
                                            className="w-full h-48 object-cover"
                                        />
                                    </div>

                                    {/* Food Information */}
                                    <div className="p-5">

                                        <h3 className="text-xl font-bold text-[#4b3428]">
                                            {item.name}
                                        </h3>

                                        <p className="text-gray-500 mt-2 text-sm leading-relaxed min-h-10">
                                            {item.description}
                                        </p>

                                        <div className="flex justify-between items-center gap-3 mt-5">

                                            {/* Price */}
                                            <span className="text-md font-semibold">
                                                ₱
                                                {Number(
                                                    item.price
                                                ).toFixed(2)}
                                            </span>

                                            {/* Add Button */}

                                            <button
                                                onClick={() => handleAddToCart(item)}
                                                disabled={addingItem === item.id}
                                                className={`p-2 rounded-full px-4 transition-all shadow-md duration-300 ${
                                                    addedItem === item.id
                                                        ? "bg-green-500 text-white"
                                                        : " hover:bg-orange-600 text-white"
                                                } disabled:opacity-70 disabled:cursor-not-allowed`}
                                            >
                                                {addingItem === item.id ? (
                                                    "..."
                                                ) : addedItem === item.id ? (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2}
                                                        stroke="currentColor"
                                                        className="size-6"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="m5 12 4 4L19 6"
                                                        />
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="size-5 text-black"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                                                        />
                                                    </svg>
                                                )}
                                            </button>

                                        </div>
                                    </div>
                                </div>
                            ))}

                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}

export default RestaurantDetail;