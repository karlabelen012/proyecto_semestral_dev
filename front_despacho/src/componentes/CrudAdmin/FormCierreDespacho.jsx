import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import axios from "axios";
import { API_DESPACHO_URL } from "../../config/api";

export const FormCierreDespacho = ({ despacho, onClose }) => {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    const jsonData = { intento: Number(data.intento), despachado: data.despachado === "true" };
    try {
      await axios.put(`${API_DESPACHO_URL}/api/v1/despachos/${despacho.idDespacho}`, jsonData, {
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      });
      Swal.fire({ title: "¡Despacho actualizado!", text: "Los cambios se guardaron correctamente.", icon: "success", confirmButtonText: "Aceptar", confirmButtonColor: "#0f6e56" });
      onClose();
    } catch (error) {
      Swal.fire({ title: "Error", text: "No se pudo actualizar el despacho.", icon: "error", confirmButtonColor: "#0f6e56" });
    }
  };

  const disabledClass = "w-full border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-400 bg-gray-50 cursor-not-allowed";
  const inputClass = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 flex flex-col gap-4">
      {/* Info fija */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">ID Despacho</label>
          <input className={disabledClass} disabled value={`#${despacho.idDespacho}`} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">OC N°</label>
          <input className={disabledClass} disabled value={`#${despacho.idCompra}`} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Fecha despacho</label>
          <input className={disabledClass} disabled value={despacho.fechaDespacho} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Patente</label>
          <input className={disabledClass} disabled value={despacho.patenteCamion} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Dirección</label>
        <input className={disabledClass} disabled value={despacho.direccionCompra} />
      </div>

      {/* Campos editables */}
      <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Intentos de entrega</label>
          <input type="number" min="0" max="20" className={inputClass} defaultValue={despacho.intento}
            {...register("intento", { required: true, min: 0 })} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Estado</label>
          <select className={inputClass} defaultValue="false" {...register("despachado", { required: true })}>
            <option value="false">Despacho abierto</option>
            <option value="true">Cerrar despacho</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-2 pb-1">
        <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl py-2.5 text-sm font-medium transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting} className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white rounded-xl py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2">
          {isSubmitting ? (
            <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Guardando...</>
          ) : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
};
