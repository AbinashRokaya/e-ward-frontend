function EnclosuresInfo({ setFormData, formData }) {
  const inputStyle =
    "w-24 border border-gray-300 rounded-lg p-2 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

  const toggle = (field) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-6">
      <h2 className="text-2xl font-semibold text-red-700 mb-6">
        संलग्न कागजातहरु (Enclosures)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex items-center gap-3 border border-gray-200 rounded-lg p-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.enclosure_citizenship_copy}
            onChange={() => toggle("enclosure_citizenship_copy")}
          />
          नागरिकताको प्रतिलिपि (Copy of citizenship)
        </label>

        <label className="flex items-center gap-3 border border-gray-200 rounded-lg p-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.enclosure_address_proof}
            onChange={() => toggle("enclosure_address_proof")}
          />
          हालको स्थायी ठेगानाको प्रमाण (Proof of current permanent address)
        </label>

        <label className="flex items-center gap-3 border border-gray-200 rounded-lg p-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.enclosure_destination_proof}
            onChange={() => toggle("enclosure_destination_proof")}
          />
          बसाईसराई गर्ने स्थानको प्रमाण (Proof of migration destination)
        </label>

        <div className="flex items-center gap-3 border border-gray-200 rounded-lg p-3">
          <label>पासपोर्ट साइजको फोटो (Passport size photo) —</label>
          <input
            type="number"
            min={0}
            max={5}
            value={formData.enclosure_photo_count}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                enclosure_photo_count: Number(e.target.value),
              }))
            }
            className={inputStyle}
          />
          <span>प्रति (copies)</span>
        </div>
      </div>

      <div className="mt-4">
        <label>अन्य (Other)</label>
        <input
          type="text"
          value={formData.enclosure_other}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              enclosure_other: e.target.value,
            }))
          }
          placeholder="अन्य कागजात (यदि छ भने)"
          className="w-full border border-gray-300 rounded-lg p-3 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

export default EnclosuresInfo;
