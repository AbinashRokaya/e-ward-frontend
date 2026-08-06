import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { CERTIFICATE_LIST } from "../config/certificateTypes";
import { colorsFor } from "../config/colorClasses";
import API_URL from "../../api/api";
import CertificateManager from "./ertificateManager";

function CertificateCard({ config, onSelect }) {
  const colors = colorsFor(config.color);
  return (
    <button
      type="button"
      onClick={() => onSelect(config.key)}
      className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-left transition-all hover:shadow-md ${colors.cardBorder} cursor-pointer`}
    >
      <div className="text-4xl mb-3">{config.icon}</div>
      <h3 className="text-lg font-semibold text-slate-800">{config.label}</h3>
      <p className="text-sm text-slate-500 mt-1">
        View, submit, or manage {config.label.toLowerCase()} records.
      </p>
    </button>
  );
}

function CertificateHome() {
  const [selectedKey, setSelectedKey] = useState(null);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/v1/admin/ward`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) =>
        res.json().then((data) => {
          if (!res.ok) throw data;
          return data;
        }),
      )
      .then((data) => setWards(data.data.ward_list))
      .catch((err) => {
        console.error("Failed to fetch wards:", err);
        toast.error("Failed to fetch wards.");
      });
  }, []);

  if (selectedKey) {
    const config = CERTIFICATE_LIST.find((c) => c.key === selectedKey);
    return (
      <CertificateManager
        config={config}
        wards={wards}
        onBack={() => setSelectedKey(null)}
      />
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-800">
          Ward Certificate Services
        </h1>
        <p className="text-slate-500">
          Choose a certificate type to view, submit, or manage records.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {CERTIFICATE_LIST.map((config) => (
          <CertificateCard
            key={config.key}
            config={config}
            onSelect={setSelectedKey}
          />
        ))}
      </div>
    </main>
  );
}

export default CertificateHome;
