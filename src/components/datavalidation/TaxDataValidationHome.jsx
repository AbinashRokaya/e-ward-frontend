import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API_URL from "../../api/api";
import TaxRecordTable from "../../components/datavalidation/TaxRecordTable";
import AddEditPropertyRecordModal from "../../components/datavalidation/AddEditPropertyRecordModal";
import AddEditBusinessRecordModal from "../../components/datavalidation/AddEditBusinessRecordModal";
import TaxImportReview from "../../components/datavalidation/TaxImportReview";
import WardTaxAssessments from "../../components/datavalidation/WardTaxAssessments";

const PROPERTY_COLUMNS = [
  { key: "lalpurja_number", label: "Lalpurja No." },
  { key: "property_type", label: "Type" },
  { key: "land_area_sqm", label: "Land (sqm)" },
  { key: "location_zone", label: "Zone" },
];

const BUSINESS_COLUMNS = [
  { key: "business_name", label: "Business" },
  { key: "scale_tier", label: "Scale" },
  { key: "registration_number", label: "Reg. No." },
];

function TaxDataValidationHome({ onBack }) {
  const [activeTab, setActiveTab] = useState("property"); // property | business | import | payments
  const [properties, setProperties] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProperty, setEditingProperty] = useState(null);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [showAddBusiness, setShowAddBusiness] = useState(false);

  function fetchProperties() {
    return fetch(`${API_URL}/v1/tax/properties`, { credentials: "include" })
      .then((res) =>
        res.json().then((d) => {
          if (!res.ok) throw d;
          return d;
        }),
      )
      .then((d) => setProperties(d.data || []))
      .catch(() => toast.error("Failed to fetch property records"));
  }

  function fetchBusinesses() {
    return fetch(`${API_URL}/v1/tax/businesses`, { credentials: "include" })
      .then((res) =>
        res.json().then((d) => {
          if (!res.ok) throw d;
          return d;
        }),
      )
      .then((d) => setBusinesses(d.data || []))
      .catch(() => toast.error("Failed to fetch business records"));
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchProperties(), fetchBusinesses()]).finally(() =>
      setLoading(false),
    );
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1"
        >
          ← सबै लाइनहरू (All Queues)
        </button>
        <h1 className="text-xl font-semibold text-emerald-700">💰 Tax (कर)</h1>
      </div>

      <div className="flex flex-wrap gap-2 bg-white p-1 rounded-md shadow-sm border border-slate-200">
        {[
          { key: "property", label: "Property Tax" },
          { key: "business", label: "Business Tax" },
          { key: "import", label: "Import Survey Excel" },
          { key: "payments", label: "Payments" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-emerald-100 text-emerald-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "property" && (
        <div className="bg-white rounded-md shadow-sm border border-slate-200 p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">
              Property Records — This Ward
            </h2>
            <button
              onClick={() => setShowAddProperty(true)}
              className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
            >
              + Add Record
            </button>
          </div>
          {loading ? (
            <p className="text-sm text-slate-400 py-6 text-center">Loading…</p>
          ) : (
            <TaxRecordTable
              records={properties}
              columns={PROPERTY_COLUMNS}
              onEdit={setEditingProperty}
            />
          )}
        </div>
      )}

      {activeTab === "business" && (
        <div className="bg-white rounded-md shadow-sm border border-slate-200 p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">
              Business Records — This Ward
            </h2>
            <button
              onClick={() => setShowAddBusiness(true)}
              className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
            >
              + Add Record
            </button>
          </div>
          {loading ? (
            <p className="text-sm text-slate-400 py-6 text-center">Loading…</p>
          ) : (
            <TaxRecordTable
              records={businesses}
              columns={BUSINESS_COLUMNS}
              onEdit={setEditingBusiness}
            />
          )}
        </div>
      )}

      {activeTab === "import" && <TaxImportReview />}

      {activeTab === "payments" && <WardTaxAssessments />}

      {(showAddProperty || editingProperty) && (
        <AddEditPropertyRecordModal
          property={editingProperty}
          onClose={() => {
            setShowAddProperty(false);
            setEditingProperty(null);
          }}
          onSaved={fetchProperties}
        />
      )}

      {(showAddBusiness || editingBusiness) && (
        <AddEditBusinessRecordModal
          business={editingBusiness}
          onClose={() => {
            setShowAddBusiness(false);
            setEditingBusiness(null);
          }}
          onSaved={fetchBusinesses}
        />
      )}
    </main>
  );
}

export default TaxDataValidationHome;
