import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./routes/Home";
import Pricing from "./routes/Pricing";
import Auth from "./routes/Auth";
import PaymentSuccess from "./routes/PaymentSuccess";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}
