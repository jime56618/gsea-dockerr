import React from "react";
import { Calendar, Plug } from "lucide-react";
import PageLayout, { ConfigPageHeader } from "./PageLayout";
import { apiFetch } from "../utils/apiClient";
import "./css/SaaS.css";

export default function IntegrationsPage() {

    const handleGoogleConnect = async () => {
    try {
      const res = await apiFetch(
        "/integrations/google-calendar/redirect"
      );

      window.location.href = res.url;
    } catch (error) {
      console.error(error);
      alert("No se pudo iniciar la conexión con Google.");
    }
  };

  return (
    <PageLayout>
      <ConfigPageHeader
        icon={Plug}
        title="Integraciones"
        subtitle="Conecta aplicaciones externas con GSEA CRM."
      />

      <div className="gsea-config-grid">
        <div className="gsea-card gsea-card--section">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "16px",
                background: "#f5f5f5",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Calendar size={38} color="#4285F4" />
            </div>

            <div style={{ flex: 1 }}>
              <h2 className="gsea-card__title">
                Google Calendar
              </h2>

              <p
                style={{
                  color: "#6b7280",
                  lineHeight: 1.7,
                  marginTop: "12px",
                }}
              >
                Sincroniza tus eventos y actividades de GSEA CRM con tu
                calendario de Google para tener toda tu agenda organizada
                y acceder a tus citas desde cualquier dispositivo.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  marginTop: "24px",
                }}
              >
                <button className="gsea-btn-secondary">
                  Más información
                </button>

                <button className="gsea-btn-primary"
                  onClick={handleGoogleConnect}
                >
                  Conectar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}