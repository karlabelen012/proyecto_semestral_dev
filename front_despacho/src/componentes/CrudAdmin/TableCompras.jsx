import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { FormDespacho } from "./FormDespacho";
import axios from "axios";
import { API_VENTAS_URL } from "../../config/api";

export const TableCompras = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  const compras = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_VENTAS_URL}/api/v1/ventas`, {
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      });
      setVentas(response.data);
    } catch (err) {
      setError("No se pudo conectar con el servicio de ventas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { compras(); }, []);

  const handleAbrirModal = (venta) => {
    setVentaSeleccionada(venta);
    setOpenModal(true);
  };

  const pendientes = ventas.filter((v) => !v.despachoGenerado);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Órdenes de compra</h2>
            <p className="text-xs text-gray-400 mt-0.5">Compras sin despacho asignado</p>
          </div>
          <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            {pendientes.length} pendientes
          </span>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-3 py-16 text-gray-400">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Cargando órdenes...
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 mx-6 my-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            {error}
          </div>
        )}

        {!loading && !error && pendientes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
            <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">Todas las compras tienen despacho asignado</p>
          </div>
        )}

        {!loading && !error && pendientes.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">OC N°</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Dirección</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Fecha compra</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Valor</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendientes.map((venta) => (
                  <tr key={venta.idVenta} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-700">#{venta.idVenta}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{venta.direccionCompra}</td>
                    <td className="px-6 py-4 text-gray-500">{venta.fechaCompra}</td>
                    <td className="px-6 py-4 font-medium text-gray-700">
                      ${Number(venta.valorCompra).toLocaleString("es-CL")}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleAbrirModal(venta)}
                        className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Generar despacho
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={openModal} onClose={() => setOpenModal(false)} title="Nueva orden de despacho">
        {ventaSeleccionada && (
          <FormDespacho
            venta={ventaSeleccionada}
            onClose={() => { setOpenModal(false); compras(); }}
          />
        )}
      </Modal>
    </>
  );
};
