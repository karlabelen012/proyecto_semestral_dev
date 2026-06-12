import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import axios from "axios";
import PropTypes from "prop-types";
import { API_DESPACHO_URL, API_VENTAS_URL } from "../../config/api";

export const FormDespacho = ({ venta, onClose }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    const jsonData = {
      fechaDespacho: data.fechaDespacho,
      patenteCamion: data.patenteCamion.toUpperCase(),
      intento: 0,
      despachado: false,
      idCompra: venta.idVenta,
      direccionCompra: venta.direccionCompra,
      valorCompra: venta.valorCompra,
    };
    try {
      await axios.put(`${API_VENTAS_URL}/api/v1/ventas/${venta.idVenta}`, { despachoGenerado: true }, {
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      });
      await axios.post(`${API_DESPACHO_URL}/api/v1/despachos`, jsonData, {
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      });
      Swal.fire({ title: "¡Despacho registrado!", text: "El despacho fue generado con éxito.", icon: "success", confirmButtonText: "Aceptar", confirmButtonColor: "#0f6e56" });
      onClose();
    } catch (error) {
      Swal.fire({ title: "Error", text: "No se pudo registrar el despacho.", icon: "error", confirmButtonColor: "#0f6e56" });
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition";
  const disabledClass = "w-full border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-400 bg-gray-50 cursor-not-allowed";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Orden de compra</label>
          <input className={disabledClass} disabled value={`#${venta.idVenta}`} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Valor</label>
          <input className={disabledClass} disabled value={`$${Number(venta.valorCompra).toLocaleString("es-CL")}`} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Dirección de entrega</label>
        <input className={disabledClass} disabled value={venta.direccionCompra} />
      </div>
      <div className="border-t border-gray-100 pt-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Fecha de despacho <span className="text-red-400">*</span></label>
            <input type="date" className={`${inputClass} ${errors.fechaDespacho ? "border-red-300" : ""}`}
              {...register("fechaDespacho", { required: "Ingresa una fecha" })} />
            {errors.fechaDespacho && <p className="text-xs text-red-500 mt-1">{errors.fechaDespacho.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Patente camión <span className="text-red-400">*</span></label>
            <input type="text" placeholder="ej: BCDF-32" className={`${inputClass} ${errors.patenteCamion ? "border-red-300" : ""}`}
              {...register("patenteCamion", { required: "Ingresa la patente", pattern: { value: /^[A-Za-z]{4}-\d{2,3}$/, message: "Formato: ABCD-12" } })} />
            {errors.patenteCamion && <p className="text-xs text-red-500 mt-1">{errors.patenteCamion.message}</p>}
          </div>
        </div>
      </div>
      <div className="flex gap-3 pt-2 pb-1">
        <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl py-2.5 text-sm font-medium transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting} className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white rounded-xl py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2">
          {isSubmitting ? (
            <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Registrando...</>
          ) : "Asignar despacho"}
        </button>
      </div>
    </form>
  );
};

FormDespacho.propTypes = {
  venta: PropTypes.shape({ idVenta: PropTypes.number.isRequired, direccionCompra: PropTypes.string.isRequired, valorCompra: PropTypes.number.isRequired }).isRequired,
  onClose: PropTypes.func.isRequired,
};
