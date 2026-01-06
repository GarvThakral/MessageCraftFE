import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./routes/Home";
import Pricing from "./routes/Pricing";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
      </Routes>
    </BrowserRouter>
  );
}
