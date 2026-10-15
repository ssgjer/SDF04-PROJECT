import { useEffect, useState } from "react";
import { Link } from "react-router-dom";                                 

function Restaurants() {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/restaurants"
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch restaurants");
                }

                const data = await response.json();
                setRestaurants(data);
            } catch (error) {
                console.error(error);
                setError("Unable to load restaurants.");
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg text-gray-600">
                    Loading restaurants...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-[#4b3428]">{error}</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#fffdfb] px-6 py-12">
            <div className="max-w-7xl mx-auto">

                <div className="text-center mb-10">
                    <p className="text-orange-500 font-semibold uppercase tracking-wider">
                        Discover Filipino Food
                    </p>

                    <h1 className="text-4xl md:text-5xl font-bold text-[#4b3428] mt-2">
                        Restaurants
                    </h1>

                    <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                        Explore local restaurants and discover delicious
                        Filipino dishes delivered straight to your door.
                    </p>
                </div>

                {restaurants.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500">
                            No restaurants available.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 sm:gap-7 gap-4">
                        {restaurants.map((restaurant) => (
                            <Link to={`/restaurants/${restaurant.id}`}>
                                <div key={restaurant.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.01] group transition duration-300">
                                    <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-56 object-cover group-hover:scale-[1.03] transition-smooth duration-200"/>
                                    <div className="sm:p-6 p-4 relative">
                                        <div className="flex items-center justify-between mb-2">
                                            <h2 className="sm:text-2xl text-xl font-bold text-[#4b3428]">
                                                {restaurant.name}
                                            </h2>
                                        </div>

                                        <p className="text-gray-600 mb-4 sm:text-[16px] text-sm hidden sm:flex">
                                            {restaurant.description}
                                        </p>

                                        <div className="flex gap-2 space-y-2 text-sm text-gray-500 justify-between">
                                            <div>
                                                <p>📍 {restaurant.address}</p>
                                                <p>🕐 {restaurant.delivery_time}</p>
                                            </div>

                                            <span className="flex gap-2 items-center justify-center bg-amber-50 px-2 py-0.5 rounded-full ">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4.5 text-yellow-500">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                                                </svg>

                                                <span className="text-gray-400 sm:text-[14px] text-[12px]">{restaurant.rating}</span>
                                            </span>
                                            
                                        </div>

                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

export default Restaurants;