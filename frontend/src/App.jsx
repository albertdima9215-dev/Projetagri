import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import socket from "./services/socket";

import Navbar from "./components/Navbar";
import Products from "./pages/Products";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
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
import PaymentCancel from "./pages/PaymentCancel";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminLayout from "./layouts/AdminLayout";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminPayments from "./pages/AdminPayments";
import AdminPromotions from "./pages/AdminPromotions";
import SellersMap from "./pages/SellersMap";
import ProductsMap from "./pages/ProductsMap";
import AdminRoute from "./components/AdminRoute";
import SellerRoute from "./components/SellerRoute";
import SellerPayments from "./pages/SellerPayments";
import MyPayments from "./pages/MyPayments";
import ArchivedOrders from "./pages/ArchivedOrders";
import { subscribeToPush } from "./services/push";
import OfflineBanner from "./components/OfflineBanner";
import BottomNav from "./components/BottomNav";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import ThemeToggle from "./components/ThemeToggle";


function App() {

  // ==========================================
  // 1. ENREGISTRER L'UTILISATEUR SUR SOCKET.IO
  // ==========================================
  useEffect(() => {
    const registerUserSocket = () => {
      const user = JSON.parse(localStorage.getItem("user"));

      if (user?._id) {
        socket.emit("register", user._id);
        console.log("Socket enregistré pour :", user._id);
      }
    };

    // Socket déjà connecté
    if (socket.connected) {
      registerUserSocket();
    }

    // Quand Socket.IO se connecte
    socket.on("connect", registerUserSocket);

    return () => {
      socket.off("connect", registerUserSocket);
    };
  }, []);


  // ==========================================
  // 2. NOTIFICATIONS EN TEMPS RÉEL
  // ==========================================
  useEffect(() => {
    const handleNewNotification = (notification) => {
      console.log("🔔 Nouvelle notification :", notification);

      // Notification navigateur si autorisée
      if (
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification(notification.titre || "AgriConnect", {
          body: notification.message || "Vous avez une nouvelle notification.",
          icon: "/pwa-192x192.png",
        });
      }

      // Petit événement personnalisé pour les autres composants
      window.dispatchEvent(
        new CustomEvent("agriconnect:new-notification", {
          detail: notification,
        })
      );
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, []);


  // ==========================================
  // 3. NOTIFICATIONS PUSH
  // ==========================================
  useEffect(() => {
    const enablePushNotifications = async () => {
      if (!("Notification" in window)) return;

      try {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
          await subscribeToPush();
        }
      } catch (error) {
        console.error(
          "Erreur activation notifications push :",
          error
        );
      }
    };

    enablePushNotifications();
  }, []);

  
  return (
    <BrowserRouter>
      <FloatingWhatsApp />
      <OfflineBanner />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>
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
    <SellerRoute>
      <Dashboard />
    </SellerRoute>
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

        <Route path="/produits-carte" element={<ProductsMap />} />
        
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
    <SellerRoute>
      <SellerOrders />
    </SellerRoute>
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
        <Route path="/payment-cancel" element={
        <PrivateRoute>
          <PaymentCancel />
        </PrivateRoute>
  }
/>
        
        <Route
  path="/seller-payments"
  element={
    <PrivateRoute>
      <SellerPayments />
    </PrivateRoute>
  }
/>
        <Route
  path="/my-payments"
  element={
    <PrivateRoute>
      <MyPayments />
    </PrivateRoute>
  }
/>
        <Route
  path="/archives"
  element={
    <PrivateRoute>
      <ArchivedOrders />
    </PrivateRoute>
  }
/>
        
        <Route
  path="/admin"
  element={
    <AdminRoute>
      <AdminLayout />
    </AdminRoute>
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
          <Route
  path="/admin/promotions"
  element={<AdminPromotions />}
/>

        </Route>
      </Routes>
      <Footer />
      <ThemeToggle />
      <BottomNav />
    </BrowserRouter>
  );
}

export default App;