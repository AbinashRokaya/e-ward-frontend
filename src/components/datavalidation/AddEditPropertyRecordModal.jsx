import { useState } from "react";
import { toast } from "react-toastify";
import API_URL from "../../api/api";

const PROPERTY_TYPES = [
  "RESIDENTIAL",
  "COMMERCIAL",
  "INSTITUTIONAL",
  "AGRICULTURAL",
  "INDUSTRIAL",
];
const CONSTRUCTION_TYPES = ["RCC", "SEMI_PUCCA", "MUD_BONDED", "TIN_ROOF"];
const LOCATION_ZONES = ["MAIN_ROAD", "SUB_ROAD", "INTERIOR"];

function AddEditPropertyRecordModal({ property, onClose, onSaved }) {
  const isEdit = Boolean(property);
  const [formData, setFormData] = useState({
    phone_number: property?.citizen_phone ?? "",
    lalpurja_number: property?.lalpurja_number ?? "",
    land_area_sqm: property?.land_area_sqm ?? "",
    built_up_area_sqm: property?.built_up_area_sqm ?? "",
    property_type: property?.property_type ?? "RESIDENTIAL",
    construction_type: property?.construction_type ?? "RCC",
    location_zone: property?.location_zone ?? "INTERIOR",
    number_of_floors: property?.number_of_floors ?? "",
  });
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = isEdit
        ? `${API_URL}/v1/tax/properties/${property.id}`
        : `${API_URL}/v1/tax/properties`;
      const body = { ...formData };
      if (isEdit) delete body.phone_number; // phone/citizen link is fixed at creation

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw data;

      toast.success(
        isEdit ? "Property record updated" : "Property record added",
      );
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err?.detail || "Failed to save property record");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-slate-800">
            {isEdit ? "Edit Property Record" : "Add Property Record"}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-red-500"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Citizen phone number
              </label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
                placeholder="98XXXXXXXX"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              />
              <p className="text-xs text-slate-400 mt-1">
                Must belong to a citizen already registered in this ward.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Lalpurja number
            </label>
            <input
              type="text"
              name="lalpurja_number"
              value={formData.lalpurja_number}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Land area (sqm)
              </label>
              <input
                type="number"
                step="0.01"
                name="land_area_sqm"
                value={formData.land_area_sqm}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Built-up area (sqm)
              </label>
              <input
                type="number"
                step="0.01"
                name="built_up_area_sqm"
                value={formData.built_up_area_sqm}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Property type
              </label>
              <select
                name="property_type"
                value={formData.property_type}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Construction type
              </label>
              <select
                name="construction_type"
                value={formData.construction_type}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              >
                {CONSTRUCTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Location zone
              </label>
              <select
                name="location_zone"
                value={formData.location_zone}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              >
                {LOCATION_ZONES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Floors
              </label>
              <input
                type="number"
                name="number_of_floors"
                value={formData.number_of_floors}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting
                ? "Saving..."
                : isEdit
                  ? "Save changes"
                  : "Add record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEditPropertyRecordModal;
