import { useState } from "react";
import ChairpersonManager from "./ChairpersonManager";
import { WARD_CHAIRPERSON_LIST } from "../config/wardChairpersonTypes";
import { colorsFor } from "../config/colorClasses";

function CertificateCard({ config, onSelect }) {
  const colors = colorsFor(config.color);
  return (
    <button
      type="button"
      onClick={() => onSelect(config.key)}
      className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-left transition-all hover:shadow-md ${colors.cardBorder} cursor-pointer`}
    >
      <div className="text-4xl mb-3">{config.icon}</div>
      <h3 className="text-lg font-semibold text-slate-800">
        {config.label}{" "}
        <span className="text-slate-400">({config.labelNp})</span>
      </h3>
      <p className="text-sm text-slate-500 mt-1">
        Review pending signatures and issue {config.label.toLowerCase()}s.
      </p>
    </button>
  );
}

function WardChairpersonHome() {
  const [selectedKey, setSelectedKey] = useState(null);

  if (selectedKey) {
    const config = WARD_CHAIRPERSON_LIST.find((c) => c.key === selectedKey);
    return (
      <ChairpersonManager config={config} onBack={() => setSelectedKey(null)} />
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-800">
          Ward Chairperson — Certificate Issuance
        </h1>
        <p className="text-slate-500">
          Choose a certificate type to review and sign.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {WARD_CHAIRPERSON_LIST.map((config) => (
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

export default WardChairpersonHome;
