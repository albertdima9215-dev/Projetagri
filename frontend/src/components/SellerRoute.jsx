import { Navigate } from "react-router-dom";

function SellerRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // admin peut aussi accéder
  if (user.role !== "vendeur" && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default SellerRoute;