// src/components/admin/AdminTutorial.js
// ! DECISIÓN DE DISEÑO: La guía rápida se apoya en tokens tipográficos y de superficie para respetar accesibilidad en modo claro/oscuro.

import { TUTORIAL_STEPS } from "./adminConstants";
import Icon from "../ui/Icon";

const AdminTutorial = () => (
  <div className="card anim-fade-in">
    <h2
      style={{
        fontSize: "1.125rem",
        fontWeight: 700,
        margin: 0,
        marginBottom: "1rem",
      }}
    >
      Cómo crear un sorteo
    </h2>
    <ol
      className="stagger is-on"
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: "0.875rem",
      }}
    >
      {TUTORIAL_STEPS.map((step, index) => (
        <li
          key={step.title}
          className="anim-up"
          style={{
            display: "flex",
            gap: "1rem",
            padding: "0.875rem",
            borderRadius: "12px",
            border: "1px solid var(--color-border)",
            background: "var(--color-bg-surface)",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--brand-50)",
              color: "var(--brand-700)",
              flexShrink: 0,
            }}
          >
            <Icon name={step.iconName} decorative size={22} strokeWidth={1.8} />
          </div>
          <div>
            <strong
              style={{
                display: "block",
                marginBottom: "0.25rem",
                fontWeight: 700,
              }}
            >
              {index + 1}. {step.title}
            </strong>
            <span
              style={{
                fontSize: "0.925rem",
                color: "var(--color-fg-secondary)",
              }}
            >
              {step.description}
            </span>
          </div>
        </li>
      ))}
    </ol>
  </div>
);

export default AdminTutorial;
