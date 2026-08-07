import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_BASE = "https://web-based-e-ward-management-system.onrender.com";

// Order doesn't matter much, but put your most-issued cert types first
// since this stops at the first match.
const VERIFY_ENDPOINTS = [
  {
    type: "birth",
    url: (id) => `${API_BASE}/v1/birth-registration/certificate/verify/${id}`,
  },
  {
    type: "death",
    url: (id) => `${API_BASE}/v1/death-registration/certificate/verify/${id}`,
  },
  {
    type: "migration",
    url: (id) =>
      `${API_BASE}/v1/migration-registration/certificate/verify/${id}`,
  },
  {
    type: "recommendation",
    url: (id) =>
      `${API_BASE}/v1/recommendation-letter/certificate/verify/${id}`,
  },
];

export default function VerifyCertificate() {
  const { id } = useParams();
  const [status, setStatus] = useState("loading"); // loading | valid | invalid
  const [data, setData] = useState(null);
  const [certType, setCertType] = useState(null);

  useEffect(() => {
    async function checkCertificate() {
      for (const endpoint of VERIFY_ENDPOINTS) {
        try {
          const res = await fetch(endpoint.url(id));
          if (res.ok) {
            const json = await res.json();
            setData(json);
            setCertType(endpoint.type);
            setStatus("valid");
            return;
          }
        } catch (err) {
          // network error on this endpoint — just try the next one
        }
      }
      setStatus("invalid");
    }
    checkCertificate();
  }, [id]);

  if (status === "loading") return <p>Verifying certificate…</p>;

  if (status === "invalid") {
    return (
      <div>
        <h2>❌ Certificate not found</h2>
        <p>
          This certificate ID could not be verified. It may be invalid or
          revoked.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2>✅ Certificate is valid</h2>
      <p>
        <strong>Type:</strong> {certType}
      </p>
      <p>
        <strong>Certificate No:</strong> {data.certificate_no}
      </p>
      <p>
        <strong>Name:</strong> {data.child_full_name}
      </p>
      <p>
        <strong>Status:</strong> {data.register_status}
      </p>
      <p>
        <strong>Issued:</strong>{" "}
        {new Date(data.issued_date).toLocaleDateString()}
      </p>

      {data.pdf_url && (
        <a href={data.pdf_url} target="_blank" rel="noopener noreferrer">
          View / Download Certificate PDF
        </a>
      )}
    </div>
  );
}
