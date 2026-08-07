import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_BASE = "https://web-based-e-ward-management-system.onrender.com";

export default function VerifyCertificate() {
  const { id } = useParams();
  const [status, setStatus] = useState("loading"); // loading | valid | invalid
  const [data, setData] = useState(null);

  useEffect(() => {
    async function checkCertificate() {
      try {
        const res = await fetch(
          `${API_BASE}/v1/recommendation-letter/certificate/verify/${id}`,
        );
        if (!res.ok) throw new Error("Not found");
        const json = await res.json();
        setData(json);
        setStatus("valid");
      } catch (err) {
        setStatus("invalid");
      }
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
