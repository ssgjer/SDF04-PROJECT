import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./section/header.jsx";
import Hero from "./section/hero.jsx";
import Menu from "./section/MenuSection.jsx";
import Restaurants from "./Pages/Restaurants.jsx";
import RestaurantDetail from "./Pages/RestaurantDetail.jsx";
import Register from "./Pages/Register.jsx";
import Login from "./Pages/Login.jsx";
import Cart from "./Pages/cart.jsx";
import Checkout from "./Pages/Checkout.jsx";
import Orders from "./Pages/orders.jsx";
import Search from "./Pages/Search";

//hello
export default function App() {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");

        return storedUser
            ? JSON.parse(storedUser)
            : null;
    });

    return (
        <BrowserRouter>
            <Header
                user={user}
                setUser={setUser}
            />

            <Routes>
                <Route
                    path="/"
                    element={
                        <>
                            <Hero />
                            <Menu />
                        </>
                    }
                />

                <Route
                    path="/restaurants"
                    element={<Restaurants />}
                />

                <Route
                    path="/restaurants/:id"
                    element={<RestaurantDetail />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/login"
                    element={
                        <Login setUser={setUser} />
                    }
                />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />}/>
                <Route path="/orders" element={<Orders/>}/>
                <Route path="/search" element={<Search />} />
            </Routes>
        </BrowserRouter>
    );
}