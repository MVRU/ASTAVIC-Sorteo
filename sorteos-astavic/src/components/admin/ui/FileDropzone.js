// src/components/admin/ui/FileDropzone.js

import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Icon from "../../ui/Icon";

const FileDropzone = ({ onFile, disabled, fileToken }) => {
  const inputRef = useRef(null);

  const triggerPicker = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleKey = (event) => {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      triggerPicker();
      event.preventDefault();
    }
  };

  const handleChange = (event) => {
    if (disabled) return;
    const nextFile =
      event.target.files && event.target.files[0]
        ? event.target.files[0]
        : null;
    onFile(nextFile);
  };

  const handleDragOver = (event) => {
    if (disabled) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (event) => {
    if (disabled) return;
    event.preventDefault();
    const nextFile =
      event.dataTransfer.files && event.dataTransfer.files[0]
        ? event.dataTransfer.files[0]
        : null;
    onFile(nextFile);
  };

  useEffect(() => {
    if (!fileToken && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [fileToken]);

  return (
    <div
      className="card anim-fade-in"
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
      aria-label="Soltá tu archivo de participantes o presioná Enter para seleccionarlo"
      onKeyDown={handleKey}
      onClick={triggerPicker}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        padding: "1.25rem",
        border: "2px dashed var(--border)",
        borderRadius: "12px",
        background: "var(--surface-elevated)",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--surface)",
          color: "var(--brand-700)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}
      >
        <Icon name="paperclip" decorative size={26} strokeWidth={1.9} />
      </div>
      <div>
        <div
          style={{
            fontWeight: 700,
            color: "var(--text-primary)",
            fontSize: "1rem",
          }}
        >
          Soltá tu archivo (.csv, .tsv, .txt)
        </div>
        <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          También podés hacer clic o presionar Enter para buscarlo.
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.tsv,.txt"
        onChange={handleChange}
        disabled={disabled}
        aria-hidden="true"
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          width: 0,
          height: 0,
        }}
      />
    </div>
  );
};

FileDropzone.propTypes = {
  onFile: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  fileToken: PropTypes.string,
};

FileDropzone.defaultProps = {
  disabled: false,
  fileToken: "",
};

export default FileDropzone;
