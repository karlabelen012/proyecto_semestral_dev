import { useState } from "react";

function Navbar({ activeView, setActiveView }) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { key: "home", label: "Resumen", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { key: "compras", label: "Órdenes de compra", icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" },
    { key: "despachos", label: "Órdenes de despacho", icon: "M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" },
  ];

  const bottomItems = [
    { key: "usuarios", label: "Usuarios", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { key: "config", label: "Configuración", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  ];

  return (
    <nav className={`flex flex-col bg-teal-700 text-white sticky top-0 h-screen transition-all duration-300 ${collapsed ? "w-16" : "w-60"} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-teal-600">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-teal-200 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
            <span className="font-semibold text-sm tracking-wide">ITPCARGO</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-teal-600 transition-colors ml-auto"
          aria-label="Colapsar menú"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={collapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
          </svg>
        </button>
      </div>

      {/* Main nav */}
      <div className="flex-1 py-4 px-2 flex flex-col gap-1 overflow-y-auto">
        {!collapsed && <p className="text-teal-400 text-xs font-medium uppercase tracking-widest px-3 mb-2">Gestión</p>}
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveView(item.key)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left transition-all duration-150 text-sm font-medium
              ${activeView === item.key
                ? "bg-white text-teal-700 shadow"
                : "text-teal-100 hover:bg-teal-600"
              }`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
            </svg>
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </div>

      {/* Bottom nav */}
      <div className="border-t border-teal-600 px-2 py-3 flex flex-col gap-1">
        {!collapsed && <p className="text-teal-400 text-xs font-medium uppercase tracking-widest px-3 mb-2">Sistema</p>}
        {bottomItems.map((item) => (
          <button
            key={item.key}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left text-teal-200 hover:bg-teal-600 transition-colors text-sm"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
            </svg>
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
        {!collapsed && (
          <p className="text-teal-500 text-xs text-center mt-3 pb-1">© 2025 ITPCARGO™</p>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
