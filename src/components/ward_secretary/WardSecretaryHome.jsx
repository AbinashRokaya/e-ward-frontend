import { useState } from "react";
import SecretaryManager from "./SecretaryManager";
import { WARD_SECRETARY_LIST } from "../config/wardSecretaryTypes";
import { colorsFor } from "../config/colorClasses";
import WardTaxRates from "./WardTaxRates"; // ADD — adjust path to wherever you place it

// ADD — tax rates aren't a "verify and forward" queue like every entry in
// WARD_SECRETARY_LIST, so this gets its own card + branch instead of an
// entry in wardSecretaryTypes.js, same reasoning as TAX_TAB on the DVO
// (DataValidationHome) side.
const TAX_RATE_TAB = {
  key: "tax_rates",
  label: "Tax Rates",
  labelNp: "कर दर",
  icon: "💰",
  color: "emerald",
};

function CertificateCard({ config, onSelect }) {
  const colors = colorsFor(config.color);

  // ADD — tax-specific description instead of the generic
  // "Verify documents and forward..." line, which doesn't apply here.
  const description =
    config.key === "tax_rates"
      ? "Set property, business, and house-rent tax rates for your ward — used automatically when the Data Validation Officer enters or imports tax data."
      : `Verify documents and forward ${config.label.toLowerCase()}s for approval.`;

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
      <p className="text-sm text-slate-500 mt-1">{description}</p>
    </button>
  );
}

function WardSecretaryHome() {
  const [selectedKey, setSelectedKey] = useState(null);

  // ADD — branch before the WARD_SECRETARY_LIST lookup below, same
  // pattern as the analytics/tax branches on the DVO home screen.
  if (selectedKey === "tax_rates") {
    return (
      <main className="max-w-5xl mx-auto px-4 py-12 space-y-6">
        <button
          type="button"
          onClick={() => setSelectedKey(null)}
          className="text-sm text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1"
        >
          ← All Queues
        </button>
        <WardTaxRates />
      </main>
    );
  }

  if (selectedKey) {
    const config = WARD_SECRETARY_LIST.find((c) => c.key === selectedKey);
    return (
      <SecretaryManager config={config} onBack={() => setSelectedKey(null)} />
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-800">
          Ward Secretary — Document Verification
        </h1>
        <p className="text-slate-500">
          Choose a certificate type to verify and forward.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* ADD — TAX_RATE_TAB prepended, everything else unchanged */}
        {[TAX_RATE_TAB, ...WARD_SECRETARY_LIST].map((config) => (
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

export default WardSecretaryHome;
