import logo from "../assets/nepal-sarkar.png";

function Row({ labelNp, labelEn, value }) {
  return (
    <div className="flex border-b border-gray-200 py-2">
      <div className="w-1/2 text-gray-600">
        {labelNp} <span className="text-xs">({labelEn})</span>
      </div>
      <div className="w-1/2 font-medium">{value || "—"}</div>
    </div>
  );
}

function DeathPreview({ formData }) {
  const { deceased, death_detail, informant, address } = formData;

  const fullNameEn = [
    deceased.deceased_first_name,
    deceased.deceased_middle_name,
    deceased.deceased_last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const fullNameNp = [
    deceased.deceased_nepali_first_name,
    deceased.deceased_nepali_middle_name,
    deceased.deceased_nepali_last_name,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="bg-white p-10 rounded-xl shadow-md print:shadow-none">
      <div className="flex flex-col items-center text-center mb-8 border-b-2 border-gray-800 pb-6">
        <img src={logo} alt="Government of Nepal" className="w-20 h-20 mb-2" />
        <p className="text-sm uppercase tracking-widest text-gray-500">
          नेपाल सरकार (Government of Nepal)
        </p>
        <h1 className="text-3xl font-bold mt-1">मृत्यु दर्ता प्रमाणपत्र</h1>
        <p className="text-lg text-gray-600">Death Registration Certificate</p>
      </div>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-blue-700 mb-3">
          मृतकको विवरण (Deceased Information)
        </h2>
        <Row
          labelNp="नाम"
          labelEn="Name"
          value={`${fullNameEn}${fullNameNp ? ` / ${fullNameNp}` : ""}`}
        />
        <Row labelNp="लिंग" labelEn="Gender" value={deceased.deceased_gender} />
        <Row
          labelNp="जन्म मिति (वि.सं.)"
          labelEn="Date of Birth (BS)"
          value={deceased.deceased_dob_bs}
        />
        <Row
          labelNp="उमेर"
          labelEn="Age"
          value={
            deceased.deceased_age_years || deceased.deceased_age_months
              ? `${deceased.deceased_age_years || 0} वर्ष ${deceased.deceased_age_months || 0} महिना ${deceased.deceased_age_days || 0} दिन`
              : ""
          }
        />
        <Row
          labelNp="वैवाहिक स्थिति"
          labelEn="Marital Status"
          value={deceased.deceased_marital_status}
        />
        <Row
          labelNp="नागरिकता नं."
          labelEn="Citizenship No."
          value={deceased.deceased_citizenship_no}
        />
        <Row
          labelNp="पेशा"
          labelEn="Occupation"
          value={deceased.deceased_occupation}
        />
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-red-700 mb-3">
          मृत्यु सम्बन्धी विवरण (Death Detail)
        </h2>
        <Row
          labelNp="मृत्यु मिति (वि.सं.)"
          labelEn="Death Date (BS)"
          value={death_detail.death_date_bs}
        />
        <Row labelNp="समय" labelEn="Time" value={death_detail.death_time} />
        <Row
          labelNp="मृत्यु स्थान"
          labelEn="Place of Death"
          value={
            death_detail.death_place_type === "OTHER"
              ? death_detail.death_place_other_detail
              : death_detail.death_place_type
          }
        />
        <Row
          labelNp="मृत्युको प्रकार"
          labelEn="Type of Death"
          value={
            death_detail.death_type === "OTHER"
              ? death_detail.death_type_other_detail
              : death_detail.death_type
          }
        />
        <Row
          labelNp="मृत्युको कारण"
          labelEn="Cause"
          value={death_detail.death_cause}
        />
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-green-700 mb-3">
          ठेगाना (Address)
        </h2>
        <Row
          labelNp="स्थायी ठेगाना"
          labelEn="Permanent Address"
          value={`${address.ward_nepali_name || ""}, वडा नं. ${address.deceased_ward_number || ""}, ${address.ward_nepali_municipality || ""}, ${address.ward_nepali_district || ""}, ${address.ward_nepali_province || ""}`}
        />
        <Row labelNp="टोल" labelEn="Tole" value={address.deceased_tole} />
      </section>

      <section>
        <h2 className="text-xl font-semibold text-orange-700 mb-3">
          सूचनादाता (Informant)
        </h2>
        <Row labelNp="नाम" labelEn="Name" value={informant.informant_name} />
        <Row
          labelNp="सम्बन्ध"
          labelEn="Relationship"
          value={informant.informant_relationship}
        />
        <Row
          labelNp="सम्पर्क नं."
          labelEn="Contact"
          value={informant.informant_contact_no}
        />
        <Row
          labelNp="घोषणा मिति"
          labelEn="Declared Date"
          value={informant.declared_date_bs}
        />
      </section>
    </div>
  );
}

export default DeathPreview;
