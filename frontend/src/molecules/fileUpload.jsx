/**
 * @fileoverview Component to upload documents (PDF, JPG, JPEG, PNG)
 * @author EXACTUM-dev 
 * @version 1.1.0
 * @description Include the design of the component and the specification to accept PDF and image files (JPG, JPEG, PNG) up to 20MB
 */
import React, { useState } from "react";

export default function FileUpload({
  name,
  label,
  limitation = "PDF, JPG, JPEG o PNG hasta 20MB",
  required = false,
  accept = ".pdf,.jpg,.jpeg,.png",
  value,
  onChange,
  error
}) {
  const [dragActive, setDragActive] = useState(false);
  const [inputKey, setInputKey] = useState(Date.now());

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      onChange({ target: { name, files: [file] } });
      setInputKey(Date.now());
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e);
    }
  };

  const removeFile = () => {
    onChange({ target: { name, files: [] } });
    setInputKey(Date.now());
  };

  return (
    <div className="w-full">
      <label className="text-sm font-semibold text-gray-700 mb-1 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${dragActive
          ? "border-[#CAD00F] bg-[#CAD00F]/10"
          : "border-slate-300 hover:border-[#CAD00F]"
          } ${error ? "border-red-300 bg-red-50" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          key={inputKey}
          type="file"
          name={name}
          onChange={handleFileChange}
          accept={accept}
          id={`${name}-file`}
          className="sr-only"
          tabIndex={-1}
        />

        {value ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">{value.name}</p>
                <p className="text-xs text-gray-500">
                  {(value.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div className="mt-2">
              <label
                htmlFor={`${name}-file`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    document.getElementById(`${name}-file`).click();
                  }
                }}
                className="cursor-pointer text-sm font-medium text-[#CAD00F] hover:text-[#b8bc0d] focus:outline-none focus:ring-2 focus:ring-[#CAD00F] rounded px-2 py-1 inline-block"
              >
                Haz clic para seleccionar archivo
              </label>
              <p className="text-xs text-gray-500 mt-1">
                o arrastra y suelta aquí
              </p>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {limitation}
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
