import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API_URL from "../../api/api";

const TAX_TYPES = ["PROPERTY", "HOUSE_RENT", "BUSINESS"];
const PROPERTY_TYPES = [
  "RESIDENTIAL",
  "COMMERCIAL",
  "INSTITUTIONAL",
  "AGRICULTURAL",
  "INDUSTRIAL",
];
const CONSTRUCTION_TYPES = ["RCC", "SEMI_PUCCA", "MUD_BONDED", "TIN_ROOF"];
const LOCATION_ZONES = ["MAIN_ROAD", "SUB_ROAD", "INTERIOR"];
const SCALE_TIERS = ["SMALL", "MEDIUM", "LARGE"];

const EMPTY_FORM = {
  tax_type: "PROPERTY",
  property_type: "RESIDENTIAL",
  construction_type: "RCC",
  location_zone: "INTERIOR",
  business_scale_tier: "SMALL",
  rate_value: "",
  fiscal_year: "",
};

function WardTaxRates() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  function fetchRates() {
    return fetch(`${API_URL}/v1/tax/rates/mine`, { credentials: "include" })
      .then((res) =>
        res.json().then((d) => {
          if (!res.ok) throw d;
          return d;
        }),
      )
      .then((d) => setRates(d.data || []))
      .catch(() => toast.error("Failed to fetch tax rates"));
  }

  useEffect(() => {
    setLoading(true);
    fetchRates().finally(() => setLoading(false));
  }, []);

  function openAdd() {
    setEditingRate(null);
    setFormData(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(rate) {
    setEditingRate(rate);
    setFormData({
      tax_type: rate.tax_type,
      property_type: rate.property_type || "RESIDENTIAL",
      construction_type: rate.construction_type || "RCC",
      location_zone: rate.location_zone || "INTERIOR",
      business_scale_tier: rate.business_scale_tier || "SMALL",
      rate_value: rate.rate_value,
      fiscal_year: rate.fiscal_year,
    });
    setShowForm(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Only send the fields relevant to the selected tax_type — matches
      // the backend model, where the unused columns stay null.
      const body = {
        tax_type: formData.tax_type,
        rate_value: parseFloat(formData.rate_value),
        fiscal_year: formData.fiscal_year,
        property_type:
          formData.tax_type === "PROPERTY" ? formData.property_type : null,
        construction_type:
          formData.tax_type === "PROPERTY" ? formData.construction_type : null,
        location_zone:
          formData.tax_type === "PROPERTY" ? formData.location_zone : null,
        business_scale_tier:
          formData.tax_type === "BUSINESS"
            ? formData.business_scale_tier
            : null,
      };

      const url = editingRate
        ? `${API_URL}/v1/tax/rates/mine/${editingRate.id}`
        : `${API_URL}/v1/tax/rates/mine`;

      const res = await fetch(url, {
        method: editingRate ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw data;

      toast.success(
        editingRate
          ? "Rate updated — applies to new assessments only, already-issued bills are unaffected"
          : "Rate added — the Data Validation Officer's next entry for this tax type will use it automatically",
      );
      setShowForm(false);
      fetchRates();
    } catch (err) {
      toast.error(err?.detail || "Failed to save tax rate");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-md shadow-sm border border-slate-200 p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Tax Rates — This Ward
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Whatever rate is set here is what the Data Validation Officer's
            entries and Excel imports automatically calculate against — no
            manual calculation needed on their side.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 shrink-0"
        >
          + Add Rate
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 py-6 text-center">Loading…</p>
      ) : rates.length === 0 ? (
        <p className="text-sm text-slate-400 py-6 text-center">
          No rates set yet. Add one for each tax type your ward collects — until
          then, the DVO can still enter survey data, but bills won't calculate
          until a rate exists.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2 pr-4 font-medium">Tax Type</th>
                <th className="py-2 pr-4 font-medium">Applies To</th>
                <th className="py-2 pr-4 font-medium">Rate</th>
                <th className="py-2 pr-4 font-medium">Fiscal Year</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rates.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="py-2 pr-4 text-slate-700">
                    {r.tax_type.replace("_", " ")}
                  </td>
                  <td className="py-2 pr-4 text-slate-500 text-xs">
                    {r.tax_type === "PROPERTY" &&
                      `${r.property_type} · ${r.construction_type} · ${r.location_zone}`}
                    {r.tax_type === "BUSINESS" && r.business_scale_tier}
                    {r.tax_type === "HOUSE_RENT" && "All rentals"}
                  </td>
                  <td className="py-2 pr-4 text-slate-700">
                    {r.tax_type === "PROPERTY"
                      ? `Rs. ${r.rate_value}/sqm`
                      : `${r.rate_value}%`}
                  </td>
                  <td className="py-2 pr-4 text-slate-700">{r.fiscal_year}</td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => openEdit(r)}
                      className="text-emerald-600 hover:text-emerald-800 text-xs font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingRate ? "Edit Tax Rate" : "Add Tax Rate"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-2xl text-gray-400 hover:text-red-500"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tax type
                </label>
                <select
                  name="tax_type"
                  value={formData.tax_type}
                  onChange={handleChange}
                  disabled={Boolean(editingRate)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm disabled:bg-slate-50"
                >
                  {TAX_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              {formData.tax_type === "PROPERTY" && (
                <>
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
                        Construction
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
                </>
              )}

              {formData.tax_type === "BUSINESS" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Business scale
                  </label>
                  <select
                    name="business_scale_tier"
                    value={formData.business_scale_tier}
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
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Rate{" "}
                  {formData.tax_type === "PROPERTY" ? "(Rs. per sqm)" : "(%)"}
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="rate_value"
                  value={formData.rate_value}
                  onChange={handleChange}
                  required
                  placeholder={
                    formData.tax_type === "PROPERTY" ? "e.g. 150" : "e.g. 12.5"
                  }
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fiscal year
                </label>
                <input
                  type="text"
                  name="fiscal_year"
                  value={formData.fiscal_year}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 2082/83"
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                />
                <p className="text-xs text-slate-400 mt-1">
                  New entries for this tax type will be calculated using the
                  most recently added rate — set this before your DVO starts
                  entering data for a new fiscal year.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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
                    : editingRate
                      ? "Save changes"
                      : "Add rate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default WardTaxRates;
