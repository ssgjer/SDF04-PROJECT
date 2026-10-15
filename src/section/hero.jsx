import { useEffect, useState } from "react";

export default function Hero() {
    const [foods, setFoods] = useState([]);
    const [active, setActive] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPopularFoods = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/menu/popular"
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch popular foods");
                }

                const data = await response.json();

                setFoods(data);
            } catch (error) {
                console.error("Error loading popular foods:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPopularFoods();
    }, []);

    useEffect(() => {
        if (foods.length <= 1) return;

        const timer = setInterval(() => {
            setActive((prev) =>
                prev === foods.length - 1 ? 0 : prev + 1
            );
        }, 4500);

        return () => clearInterval(timer);
    }, [foods.length]);

    const next = () => {
        if (foods.length === 0) return;

        setActive((prev) =>
            prev === foods.length - 1 ? 0 : prev + 1
        );
    };

    const previous = () => {
        if (foods.length === 0) return;

        setActive((prev) =>
            prev === 0 ? foods.length - 1 : prev - 1
        );
    };

    const getFood = (offset) => {
        if (!foods.length) return null;

        return foods[
            (active + offset + foods.length) % foods.length
        ];
    };

    const currentFood = getFood(0);
    const previousFood = getFood(-1);
    const nextFood = getFood(1);

    if (loading) {
        return (
            <section className="min-h-[calc(100vh-4rem)] bg-[#fffdfb] flex items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#6f5140] border-t-transparent" />

                    <p className="text-sm text-[#765f51]">
                        Finding today's favorites...
                    </p>
                </div>
            </section>
        );
    }

    if (!foods.length) {
        return (
            <section className="min-h-[calc(100vh-4rem)] bg-[#fffdfb] flex items-center justify-center px-6">
                <div className="text-center">
                    <p className="mb-2 text-sm uppercase tracking-[0.2em] text-[#8a7161]">
                        Popular
                    </p>

                    <h1 className="text-3xl font-semibold text-[#4b3428]">
                        No popular dishes yet
                    </h1>

                    <p className="mt-3 text-sm text-[#765f51]">
                        Popular dishes will appear here once customers
                        start ordering.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="relative overflow-hidden bg-[#fffdfb]">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-5 py-12 sm:px-8 lg:px-12">
                <div className="grid w-full items-center gap-12 lg:grid-cols-2">
                    
                    {/* LEFT */}
                    <div className="max-w-xl">
                        <div className="mb-6 flex items-center gap-3">
                            <span className="h-px w-10 bg-[#80604d]" />

                            <span className="text-xs font-medium uppercase tracking-[0.25em] text-[#80604d]">
                                HarryDaDelivery
                            </span>
                        </div>

                        <h1 className="text-5xl font-semibold text-[#4b3428] leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                            Good food,
                            <br />
                            <span className="text-amber-600">
                                simply delivered.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-md text-base leading-7 text-[#765f51] sm:text-lg">
                            Discover Filipino favorites from restaurants
                            around you and have them delivered straight
                            to your door.
                        </p>

                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <a
                                href="/restaurants"
                                className="rounded-full bg-olive-800 px-7 py-3.5 text-sm font-medium text-white transition hover:bg-[#38251d]"
                            >
                                Explore restaurants
                            </a>

                            <a
                                href="#menu"
                                className="rounded-full border border-[#cbbbae] px-7 py-3.5 text-sm font-medium text-[#4b3428] transition hover:bg-white"
                            >
                                View menu
                            </a>
                        </div>

                        <div className="mt-10 flex gap-8 border-t border-[#d8cbc1] pt-6">
                            <div>
                                <p className="text-2xl font-semibold text-[#3d2b22]">
                                    {foods.length}
                                </p>

                                <p className="mt-1 text-xs text-[#8a7161]">
                                    Popular dishes
                                </p>
                            </div>

                            <div>
                                <p className="text-2xl font-semibold text-[#3d2b22]">
                                    {currentFood.restaurant_rating || "—"}
                                </p>

                                <p className="mt-1 text-xs text-[#8a7161]">
                                    Average rating
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="relative">
                        <div className="relative mx-auto max-w-xl">
                            
                            {/* BACKGROUND CARD */}
                            <div className="absolute -right-4 top-8 hidden h-[390px] w-[82%] rounded-[2rem] bg-[#80604d] sm:block" />

                            {/* MAIN CARD */}
                            <div className="relative overflow-hidden rounded-[2rem] bg-[#4b3428] p-3 shadow-[0_25px_70px_rgba(75,52,40,0.18)]">
                                <div className="relative aspect-[4/4.2] overflow-hidden rounded-[1.5rem]">
                                    <img
                                        src={currentFood.image_url}
                                        alt={currentFood.name}
                                        className="h-full w-full object-cover"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-[#241812]/80 via-transparent to-transparent" />

                                    <div className="absolute left-5 top-5 rounded-full  px-3.5 py-1 flex items-center gap-2 backdrop-blur-md bg-black/30">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 text-yellow-400">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                                        </svg>

                                        <p className="text-xs font-medium uppercase tracking-wider text-[white]">
                                            Popular
                                        </p>
                                        
                                    </div>

                                    <div className="absolute bottom-5 left-5 right-5">
                                        <div className="flex items-end justify-between gap-4">
                                            <div>
                                                <p className="text-sm text-[#e5d8cf]">
                                                    {currentFood.restaurant_name}
                                                </p>

                                                <h2 className="mt-1 text-3xl font-semibold text-white">
                                                    {currentFood.name}
                                                </h2>
                                            </div>

                                            <div className="shrink-0">
                                                <p className="text-xl font-semibold text-white">
                                                    ₱
                                                    {Number(
                                                        currentFood.price
                                                    ).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center gap-4 text-sm text-[#e5d8cf]">
                                            <span className="flex gap-1 items-center">
                                                <svg className="size-4.5 text-yellow-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                                                </svg>

                                                {" "}
                                                {currentFood.restaurant_rating}
                                            </span>

                                            <span className="h-1 w-1 rounded-full bg-[#b9a398]" />

                                            <span>
                                                {Number(
                                                    currentFood.total_sold
                                                ).toLocaleString()}{" "}
                                                orders
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* PREVIOUS */}
                            {previousFood && foods.length > 1 && (
                                <button
                                    onClick={previous}
                                    className="absolute -left-5 top-1/2 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-[#d4c5ba] bg-[#f4eee8] text-[#4b3428] shadow-lg transition hover:bg-white sm:flex"
                                    aria-label="Previous food"
                                >
                                    ←
                                </button>
                            )}

                            {/* NEXT */}
                            {nextFood && foods.length > 1 && (
                                <button
                                    onClick={next}
                                    className="absolute -right-5 top-1/2 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-[#d4c5ba] bg-[#f4eee8] text-[#4b3428] shadow-lg transition hover:bg-white sm:flex"
                                    aria-label="Next food"
                                >
                                    →
                                </button>
                            )}
                        </div>

                        {/* INDICATORS */}
                        {foods.length > 1 && (
                            <div className="mt-6 flex justify-center gap-2">
                                {foods.map((food, index) => (
                                    <button
                                        key={food.id}
                                        onClick={() => setActive(index)}
                                        className={`h-1.5 rounded-full transition-all ${
                                            index === active
                                                ? "w-8 bg-[#4b3428]"
                                                : "w-2 bg-[#c8b8ac]"
                                        }`}
                                        aria-label={`Show ${food.name}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}