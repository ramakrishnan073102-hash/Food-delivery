import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home.jsx";
import Menu from "../pages/Menu.jsx";
import Cart from "../pages/Cart.jsx";
import Login from "../pages/Login.jsx";  
import Signup from "../pages/Signup.jsx";
import DeliveryAddress from "../pages/DeliveryAddress.jsx";
import Terms from "../pages/Terms.jsx";
import ProtectedRoute from "../components/ProtectedRoute";
import Checkout from "../pages/Checkout";
import Profile from "../pages/Profile.jsx"
import ButtomFooter from "../components/ButtomFooter.jsx"
import Forgot from "../pages/Forgot.jsx"



const AppRoutes = () => {
  return (
    <Routes>

      <Route path="/" element={<Home />} />
      <Route path="profile" element={<Profile/>}/>

      <Route path="/buttomfooter" element={<ButtomFooter/>}/>

      <Route path="/menu" element={<Menu />} />

      <Route path="/cart" element={<Cart />} />

      <Route path="/deliveryaddress" element={<DeliveryAddress />} />

      <Route path="/login" element={<Login />} />
      <Route path="forgot" element={<Forgot />}/>

      <Route path="/signup" element={<Signup />} />

      <Route path="/terms" element={<Terms />} />

      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
};

export default AppRoutes;