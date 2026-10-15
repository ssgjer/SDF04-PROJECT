
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Header({ user, setUser }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchCartCount = async () => {
            const storedUser = localStorage.getItem("user");

            if (!storedUser) {
                setCartCount(0);
                return;
            }

            try {
                const currentUser = JSON.parse(storedUser);

                const response = await fetch(
                    `http://localhost:5000/api/cart/${currentUser.id}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch cart");
                }

                const cartItems = await response.json();

                const total = cartItems.reduce(
                    (sum, item) => sum + Number(item.quantity),
                    0
                );

                setCartCount(total);
            } catch (error) {
                console.error("Cart count error:", error);
                setCartCount(0);
            }
        };

        fetchCartCount();

        window.addEventListener("cartUpdated", fetchCartCount);

        return () => {
            window.removeEventListener("cartUpdated", fetchCartCount);
        };
    }, [user]);


    const handleSearch = (e) => {
        e.preventDefault();

        const query = searchQuery.trim();

        if (!query) {
            return;
        }

        setMenuOpen(false);
        setSearchQuery("");

        navigate(`/search?search=${encodeURIComponent(query)}`);
    };


    const handleLogout = () => {
        localStorage.removeItem("user");
        setUser(null);
        setCartCount(0);
        setMenuOpen(false);
    };

    const navItems = [
        { name: "Home", path: "/" },
        { name: "Restaurants", path: "/restaurants" },
        { name: "Menu", path: "/#menu" },
        { name: "Orders", path: "/orders" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-[#d8cbc1] bg-white/90 shadow-sm backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link
                    to="/"
                    className="flex shrink-0 items-center gap-3"
                    onClick={() => setMenuOpen(false)}
                >
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect
                            width="40"
                            height="40"
                            rx="12"
                            fill="#4B3428"
                        />
                        <path
                            d="M11 21L16 13H29L25 27H12L11 21Z"
                            fill="white"
                        />
                        <path
                            d="M16 13L19 21H11"
                            stroke="#4B3428"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <circle cx="16" cy="28" r="2.5" fill="white" />
                        <circle cx="25" cy="28" r="2.5" fill="white" />
                        <path
                            d="M28 17H32"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        <path
                            d="M30 13H33"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>

                    <span className="text-lg font-black tracking-tight text-[#4b3428] sm:text-xl">
                        <span className="text-amber-600">Harry</span>DaDelivery
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="ml-6 hidden items-center gap-5 md:flex lg:ml-10 lg:gap-7">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `text-sm font-semibold transition ${
                                    isActive
                                        ? "text-amber-950"
                                        : "text-[#4b3428] hover:text-amber-950"
                                }`
                            }
                        >
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                {/* Right Side */}
                <div className="ml-auto flex items-center gap-2 sm:gap-4">
                    {/* Menu Item Search */}
                    <form
                        onSubmit={handleSearch}
                        className="hidden items-center gap-2 rounded-full border border-[#d8cbc1] bg-[#fffdfb] px-4 py-2 focus-within:border-amber-600 md:flex"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 shrink-0 text-[#80604d]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.8}
                        >
                            <circle cx="11" cy="11" r="7" />
                            <path
                                strokeLinecap="round"
                                d="m16 16 4 4"
                            />
                        </svg>

                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) =>
                                setSearchQuery(e.target.value)
                            }
                            placeholder="Search food..."
                            aria-label="Search menu items"
                            className="w-36 bg-transparent text-sm text-[#4b3428] outline-none placeholder:text-[#a18b7b] lg:w-48"
                        />
                    </form>

                    {/* Cart */}
                    <Link
                        to="/cart"
                        aria-label="Shopping cart"
                        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#4b3428] transition hover:bg-[#e9ddd3]"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                            />
                        </svg>

                        {cartCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#4b3428] px-1 text-[10px] font-bold text-white">
                                {cartCount > 99 ? "99+" : cartCount}
                            </span>
                        )}
                    </Link>

                    {/* User */}
                    {user ? (
                        <div className="hidden items-center gap-3 sm:flex">
                            <span className="text-sm font-semibold text-[#4b3428]">
                                {user.name}
                            </span>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="rounded-full border border-[#bba99b] px-4 py-2 text-sm font-semibold text-[#4b3428] transition hover:bg-[#4b3428] hover:text-white"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="hidden rounded-full bg-[#4b3428] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#35241c] sm:block"
                        >
                            Login
                        </Link>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        type="button"
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-[#4b3428] transition hover:bg-[#e9ddd3] md:hidden"
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? (
                            <svg
                                className="h-6 w-6"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18 18 6M6 6l12 12"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="h-6 w-6"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {menuOpen && (
                <div className="border-t border-[#d8cbc1] bg-[#f4eee8] md:hidden">
                    <nav className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-6">
                        {/* Mobile Search */}
                        <form
                            onSubmit={handleSearch}
                            className="mb-3 flex items-center gap-2 rounded-xl border border-[#d8cbc1] bg-white px-4 py-3"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-[#80604d]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.8}
                            >
                                <circle cx="11" cy="11" r="7" />
                                <path
                                    strokeLinecap="round"
                                    d="m16 16 4 4"
                                />
                            </svg>

                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                }
                                placeholder="Search food..."
                                aria-label="Search menu items"
                                className="min-w-0 flex-1 bg-transparent text-sm text-[#4b3428] outline-none"
                            />
                        </form>

                        {navItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                onClick={() => setMenuOpen(false)}
                                className="rounded-xl px-4 py-3 text-sm font-semibold text-[#80604d] transition hover:bg-[#e9ddd3] hover:text-[#4b3428]"
                            >
                                {item.name}
                            </NavLink>
                        ))}

                        {user ? (
                            <div className="mt-2 border-t border-[#d8cbc1] pt-3">
                                <p className="px-4 py-2 text-sm font-semibold text-[#4b3428]">
                                    {user.name}
                                </p>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-[#80604d] transition hover:bg-[#e9ddd3] hover:text-[#4b3428]"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setMenuOpen(false)}
                                className="mt-2 rounded-xl bg-[#4b3428] px-4 py-3 text-center text-sm font-semibold text-white"
                            >
                                Login
                            </Link>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
