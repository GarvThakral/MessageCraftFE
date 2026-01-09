import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./routes/Home";
import Pricing from "./routes/Pricing";
import Auth from "./routes/Auth";
import PaymentSuccess from "./routes/PaymentSuccess";
import Account from "./routes/Account";
import VerifyEmail from "./routes/VerifyEmail";
import ResetPassword from "./routes/ResetPassword";
import Support from "./routes/Support";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/account" element={<Account />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/support" element={<Support />} />
      </Routes>
    </BrowserRouter>
  );
}
