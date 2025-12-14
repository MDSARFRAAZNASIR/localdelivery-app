import "./App.css";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./components/pages/LandingPage";
import SignUpPage from "./components/authPages/SignupPage";
import React from "react";
import LogInPage from "./components/authPages/LogInPage";

import UserDashboard from "./components/userPages/UserDashboard";
import ProtectedRoute from "./components/authPages/ProtectedRoute";
import { useEffect } from "react";
import { isTokenExpired } from "./lib/utlis";
import SessionExpired from "./components/pages/SessionExpired";
import ProfilePage from "./components/pages/ProfilePage";
import CreateOrderPage from "./components/pages/CreateOrderPage";
import ProductsPage from "./components/pages/ProductsPage";
import CartPage from "./components/pages/CartPage";
import OrdersPage from "./components/pages/OrdersPage";
import AdminProductsPage from "./components/adminPages/AdminProductsPage";


function App() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && isTokenExpired(token)) {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
    }
  }, []);
  return (
    <div className="App">
      <Routes>
        {/* {Public Routes} */}
        <Route path="/" element={<LandingPage />}></Route>
        <Route path="signup" element={<SignUpPage />}></Route>
        <Route path="login" element={<LogInPage />}></Route>
          <Route path="session-expired" element={<SessionExpired />} />

        {/* {protected routes} */}
        <Route element={<ProtectedRoute />}>
          <Route path="/products" element={<ProductsPage/>}></Route>
          <Route path="/cart" element={<CartPage/>}></Route>
            <Route path="/orders" element={<OrdersPage />} />

          {/* <Route path="/orders" element={<OrdersPage/>}></Route> */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/create-order" element={<CreateOrderPage />} />
          <Route path="/userdashboard" element={<UserDashboard />}></Route>
        <Route path="/admin/products" element={<AdminProductsPage />} />



          {/* yahan aur protected routes add kar sakte ho */}
          {/* <Route path="/orders" element={<OrdersPage />} /> */}
        </Route>
        {/* Default/fallback route */}
        <Route path="*" element={<LogInPage />} />
      </Routes>
    </div>
  );
}

export default App;
