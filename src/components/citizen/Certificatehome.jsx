import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { CERTIFICATE_LIST } from "../config/certificateTypes";
import { colorsFor } from "../config/colorClasses";
import API_URL from "../../api/api";
import CertificateManager from "./ertificateManager";
import { useLanguage } from "../../context/LanguageContext";

const CERT_LABELS_NP = {
  birth: {
    label: "जन्म दर्ता प्रमाणपत्र",
    desc: "जन्म दर्ता प्रमाणपत्र हेर्नुहोस्, पेश गर्नुहोस् वा व्यवस्थापन गर्नुहोस्।",
  },
  death: {
    label: "मृत्यु दर्ता प्रमाणपत्र",
    desc: "मृत्यु दर्ता प्रमाणपत्र हेर्नुहोस्, पेश गर्नुहोस् वा व्यवस्थापन गर्नुहोस्।",
  },
  migration: {
    label: "बसाईंसराई प्रमाणपत्र",
    desc: "बसाईंसराई प्रमाणपत्र हेर्नुहोस्, पेश गर्नुहोस् वा व्यवस्थापन गर्नुहोस्।",
  },
  recommendation: {
    label: "सिफारिस पत्र",
    desc: "सिफारिस पत्र हेर्नुहोस्, पेश गर्नुहोस् वा व्यवस्थापन गर्नुहोस्।",
  },
  complaint: {
    label: "गुनासो दर्ता",
    desc: "गुनासो दर्ता हेर्नुहोस्, पेश गर्नुहोस् वा व्यवस्थापन गर्नुहोस्।",
  },
  notice: {
    label: "वडा सूचनाहरू",
    desc: "वडा सूचनाहरू हेर्नुहोस्, पेश गर्नुहोस् वा व्यवस्थापन गर्नुहोस्।",
  },
  tax: {
    label: "मेरो कर",
    desc: "मेरो कर रेकर्डहरू हेर्नुहोस्, पेश गर्नुहोस् वा व्यवस्थापन गर्नुहोस्।",
  },
};

function CertificateCard({ config, onSelect, isNepali }) {
  const colors = colorsFor(config.color);
  const npEntry = CERT_LABELS_NP[config.key];

  const label = isNepali && npEntry ? npEntry.label : config.label;
  const desc =
    isNepali && npEntry
      ? npEntry.desc
      : `View, submit, or manage ${config.label.toLowerCase()} records.`;

  return (
    <button
      type="button"
      onClick={() => onSelect(config.key)}
      className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-left transition-all hover:shadow-md ${colors.cardBorder} cursor-pointer`}
    >
      <div className="text-4xl mb-3">{config.icon}</div>
      <h3 className="text-lg font-semibold text-slate-800">{label}</h3>
      <p className="text-sm text-slate-500 mt-1">{desc}</p>
    </button>
  );
}

function CertificateHome() {
  const [selectedKey, setSelectedKey] = useState(null);
  const [wards, setWards] = useState([]);

  const { language } = useLanguage();
  const isNepali = language === "ne";

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
          {isNepali ? "वडा प्रमाणपत्र तथा सेवाहरू" : "Ward Certificate Services"}
        </h1>
        <p className="text-slate-500">
          {isNepali
            ? "रेकर्डहरू हेर्न, पेश गर्न वा व्यवस्थापन गर्न प्रमाणपत्रको प्रकार छान्नुहोस्।"
            : "Choose a certificate type to view, submit, or manage records."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {CERTIFICATE_LIST.map((config) => (
          <CertificateCard
            key={config.key}
            config={config}
            onSelect={setSelectedKey}
            isNepali={isNepali}
          />
        ))}
      </div>
    </main>
  );
}

export default CertificateHome;