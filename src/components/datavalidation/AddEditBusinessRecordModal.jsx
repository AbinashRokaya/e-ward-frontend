import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API_URL from "../../api/api";

const SCALE_TIERS = ["SMALL", "MEDIUM", "LARGE"];

function AddEditBusinessRecordModal({ business, onClose, onSaved }) {
  const isEdit = Boolean(business);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    phone_number: business?.citizen_phone ?? "",
    business_name: business?.business_name ?? "",
    category_id: business?.category_id ?? "",
    scale_tier: business?.scale_tier ?? "SMALL",
    registration_number: business?.registration_number ?? "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/v1/tax/business-categories`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.data || []);
        if (!isEdit && data.data?.length) {
          setFormData((p) => ({
            ...p,
            category_id: p.category_id || data.data[0].id,
          }));
        }
      })
      .catch(() => toast.error("Failed to load business categories"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = isEdit
        ? `${API_URL}/v1/tax/businesses/${business.id}`
        : `${API_URL}/v1/tax/businesses`;
      const body = { ...formData };
      if (isEdit) delete body.phone_number;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw data;

      toast.success(
        isEdit ? "Business record updated" : "Business record added",
      );
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err?.detail || "Failed to save business record");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-slate-800">
            {isEdit ? "Edit Business Record" : "Add Business Record"}
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
                Owner's phone number
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
              Business name
            </label>
            <input
              type="text"
              name="business_name"
              value={formData.business_name}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Scale
              </label>
              <select
                name="scale_tier"
                value={formData.scale_tier}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              >
                {SCALE_TIERS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Registration number{" "}
              <span className="text-slate-400">(optional)</span>
            </label>
            <input
              type="text"
              name="registration_number"
              value={formData.registration_number}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
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

export default AddEditBusinessRecordModal;
