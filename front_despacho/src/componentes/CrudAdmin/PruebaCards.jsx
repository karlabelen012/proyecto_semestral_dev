import { useEffect, useState } from "react";
import { CardComponent } from "./CardComponent";
import { TableCompras } from "./TableCompras";
import { TableDespachos } from "./TableDespachos";
import axios from "axios";
import { API_DESPACHO_URL, API_VENTAS_URL } from "../../config/api";

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
      </svg>
    </div>
    <div>
      <div className="text-xs text-gray-400 font-medium">{label}</div>
      <div className="text-2xl font-semibold text-gray-800">{value ?? "—"}</div>
    </div>
  </div>
);

export const PruebaCards = ({ activeView }) => {
  const [tab, setTab] = useState(null);
  const [stats, setStats] = useState({ comprasPend: null, despTotal: null, despEntregados: null });

  useEffect(() => {
    if (activeView === "compras") setTab("compras");
    else if (activeView === "despachos") setTab("despachos");
    else setTab(null);
  }, [activeView]);

  useEffect(() => {
    const load = async () => {
      try {
        const [vRes, dRes] = await Promise.all([
          axios.get(`${API_VENTAS_URL}/api/v1/ventas`, { headers: { Accept: "application/json" } }),
          axios.get(`${API_DESPACHO_URL}/api/v1/despachos`, { headers: { Accept: "application/json" } }),
        ]);
        const pend = vRes.data.filter((v) => !v.despachoGenerado).length;
        const total = dRes.data.length;
        const entregados = dRes.data.filter((d) => d.despachado).length;
        setStats({ comprasPend: pend, despTotal: total, despEntregados: entregados });
      } catch {}
    };
    load();
  }, [tab]);

  return (
    <section className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Dashboard de despachos</h1>
        <p className="text-sm text-gray-400 mt-1">Gestión de órdenes de compra y envíos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Compras sin despacho" value={stats.comprasPend} color="text-amber-600 bg-amber-50"
          icon="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        <StatCard label="Despachos totales" value={stats.despTotal} color="text-teal-600 bg-teal-50"
          icon="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        <StatCard label="Entregados" value={stats.despEntregados} color="text-green-600 bg-green-50"
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-5">
        <CardComponent iconType="compras" title="Órdenes de compra"
          description="Revisa las últimas órdenes realizadas y genera su despacho correspondiente."
          buttonText={tab === "compras" ? "Ocultar" : "Consultar compras"}
          onClick={() => setTab(tab === "compras" ? null : "compras")} />
        <CardComponent iconType="despacho" title="Órdenes de despacho"
          description="Consulta despachos activos, modifica intentos de entrega o cierra órdenes completadas."
          buttonText={tab === "despachos" ? "Ocultar" : "Consultar despachos"}
          onClick={() => setTab(tab === "despachos" ? null : "despachos")} />
      </div>

      {tab === "compras" && <TableCompras />}
      {tab === "despachos" && <TableDespachos />}
    </section>
  );
};
