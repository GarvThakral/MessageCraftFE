import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./routes/Home";
import Pricing from "./routes/Pricing";
import CheckoutSuccess from "./routes/CheckoutSuccess";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}
