import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Products from "./pages/Products";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddProduct from "./pages/AddProduct";
import PrivateRoute from "./components/PrivateRoute";
import ProductDetails from "./pages/ProductDetails";
import Dashboard from "./pages/Dashboard";
import Messages from "./pages/Messages";
import Favorites from "./pages/Favorites";
import SellerProfile from "./pages/SellerProfile";
import EditProfile from "./pages/EditProfile";
import MyOrders from "./pages/MyOrders";
import SellerOrders from "./pages/SellerOrders";
import Notifications from "./pages/Notifications";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminLayout from "./layouts/AdminLayout";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminPayments from "./pages/AdminPayments";
import SellersMap from "./pages/SellersMap";


function App() {
  return (
    <BrowserRouter>
    <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<Products />} />
        <Route path="/add-product" element={
          <PrivateRoute>
            <AddProduct />
          </PrivateRoute>
        } />
        <Route
   path="/products/:id"
   element={<ProductDetails />}
/>
        <Route
  path="/dashboard"
  element={
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
  }
/>
        <Route
  path="/messages"
  element={
    <PrivateRoute>
      <Messages />
    </PrivateRoute>
  }
/>
        <Route
  path="/favorites"
  element={
    <PrivateRoute>
      <Favorites />
    </PrivateRoute>
  }
/>
        <Route
    path="/seller/:id"
    element={<SellerProfile />}
/>
        <Route path="/vendeurs-carte" element={<SellersMap />} />
        
        <Route
  path="/edit-profile"
  element={
    <PrivateRoute>
      <EditProfile />
    </PrivateRoute>
  }
/>
        <Route
    path="/my-orders"
    element={
        <PrivateRoute>
            <MyOrders />
        </PrivateRoute>
    }
/>
        <Route
  path="/seller-orders"
  element={
    <PrivateRoute>
      <SellerOrders />
    </PrivateRoute>
  }
/>
        <Route
  path="/notifications"
  element={
    <PrivateRoute>
      <Notifications />
    </PrivateRoute>
  }
/>
        <Route
  path="/payment"
  element={
    <PrivateRoute>
      <Payment />
    </PrivateRoute>
  }
/>
        <Route
  path="/payment-success"
  element={
          <PrivateRoute>
            <PaymentSuccess />
          </PrivateRoute>
  }
/>
        <Route
  path="/admin"
  element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
>
          <Route index element={<AdminDashboard />} />

          <Route
    path="users"
    element={<AdminUsers />}
  />
          <Route
  path="products"
  element={<AdminProducts />}
/>
          <Route
  path="orders"
  element={<AdminOrders />}
/>
          <Route
  path="payments"
  element={<AdminPayments />}
/>

        </Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;