import { useState } from "react";
import Navbar from "./Layouts/Navbar";
import Footer from "./Layouts/Footer";
import { PruebaCards } from "./CrudAdmin/PruebaCards";

export const CrudAdmin = () => {
  const [activeView, setActiveView] = useState("home");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          <PruebaCards activeView={activeView} />
        </div>
        <Footer />
      </div>
    </div>
  );
};
