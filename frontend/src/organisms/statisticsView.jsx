/**
 * @fileoverview Statistics view component for membership reports
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Displays three charts: residence locations, membership categories, and education levels
 */

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { fetchWithClerk } from "../utils/api";
import Button from "../atoms/button";
import Loading from "../atoms/loading";
import { Download, Calendar } from "lucide-react";

/**
 * Formats a date string (YYYY-MM-DD) to a readable format (DD/MM/YYYY)
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date string in DD/MM/YYYY format
 */
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString + "T00:00:00");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Abbreviates long state names for better display in charts
 * @param {string} stateName - Full state name
 * @returns {string} Abbreviated state name
 */
const abbreviateStateName = (stateName) => {
  if (!stateName) return stateName;

  const abbreviations = {
    "Baja California Sur": "BCS",
    "Baja California": "BC",
    "Mexico City": "CDMX",
    "Ciudad de México": "CDMX",
    "Nuevo León": "NL",
    "Jalisco": "Jal.",
    "Yucatán": "Yuc.",
    "Querétaro": "Qro.",
    "Michoacán": "Mich.",
    "Guanajuato": "Gto.",
    "Lunda Norte Province": "Lunda Norte",
    "Plateaux Department": "Plateaux",
    "Badakhshan": "Badakh.",
  };

  /** Check if we have a specific abbreviation */
  if (abbreviations[stateName]) {
    return abbreviations[stateName];
  }

  /** If name is longer than 12 characters, try to abbreviate common words */
  if (stateName.length > 12) {
    return stateName
      .replace(/\bProvince\b/gi, "Prov.")
      .replace(/\bDepartment\b/gi, "Dept.")
      .replace(/\bCalifornia\b/gi, "Calif.")
      .replace(/\bNorth\b/gi, "N.")
      .replace(/\bSouth\b/gi, "S.")
      .replace(/\bEast\b/gi, "E.")
      .replace(/\bWest\b/gi, "W.");
  }

  return stateName;
};

/**
 * StatisticsView Component
 * @description Renders three bar charts with date filtering and PDF export functionality
 * @returns {JSX.Element} Statistics view with charts and controls
 */
export default function StatisticsView() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    residence: [],
    category: [],
    education: [],
  });
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [exporting, setExporting] = useState(false);

  /**
   * Fetches statistics data from the backend API.
   * @async
   * @function fetchStatistics
   * @returns {Promise<void>}
   */
  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const params = new URLSearchParams();

      if (dateRange.startDate) {
        params.append("startDate", dateRange.startDate);
      }
      if (dateRange.endDate) {
        params.append("endDate", dateRange.endDate);
      }

      const queryString = params.toString();
      const url = `/api/statistics/memberships${queryString ? `?${queryString}` : ""}`;

      const response = await fetchWithClerk(url, { method: "GET" }, token);

      const data = response?.data || response || {};

      const limitData = (arr) => (arr || []).slice(0, 5);

      setStatistics({
        residence: data.residence || [],
        category: limitData(data.category),
        education: limitData(data.education),
      });
    } catch (err) {
      setError("Error al cargar estadísticas. Por favor intente más tarde.");
    } finally {
      setLoading(false);
    }
  }, [getToken, dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  /**
   * Handles PDF export functionality.
   * Downloads a PDF report with the current statistics data and date range.
   * @async
   * @function handleExportPDF
   * @returns {Promise<void>}
   */
  const handleExportPDF = async () => {
    try {
      setExporting(true);
      const token = await getToken();
      const params = new URLSearchParams();

      if (dateRange.startDate) {
        params.append("startDate", dateRange.startDate);
      }
      if (dateRange.endDate) {
        params.append("endDate", dateRange.endDate);
      }

      const queryString = params.toString();
      const url = `/api/statistics/memberships/export${queryString ? `?${queryString}` : ""}`;

      /** Use fetch directly for PDF blob response */
      const headers = new Headers();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      const response = await fetch(url, { method: "GET", headers });

      if (!response.ok) {
        throw new Error(`Error exporting PDF: ${response.status} ${response.statusText}`);
      }

      /** Get PDF as blob */
      const blob = await response.blob();

      /** Create download link */
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `reporte-membresias-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      /** Clean up blob URL */
      URL.revokeObjectURL(link.href);
    } catch (err) {
      setError("Error al exportar el reporte. Por favor intente más tarde.");
    } finally {
      setExporting(false);
    }
  };

  /**
   * Renders a horizontal wide bar chart (for residence with many states).
   * @param {string} title - Chart title
   * @param {Array<Object>} data - Chart data array with label and value properties
   * @param {Array<string>} [colorScheme=["#D2B40D", "#296B00", "#E58E15", "#cad00f"]] - Array of colors for bars
   * @param {boolean} [abbreviateLabels=false] - Whether to abbreviate labels (for states)
   * @returns {JSX.Element} Horizontal bar chart component
   */
  const renderHorizontalBarChart = (title, data, colorScheme = ["#D2B40D", "#296B00", "#E58E15", "#cad00f"], abbreviateLabels = false) => {
    if (!data || data.length === 0) {
      return (
        <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No hay datos disponibles</p>
        </div>
      );
    }

    const maxValue = Math.max(...data.map((d) => d.value || 0), 1);
    const yAxisDisplayMax = Math.max(Math.ceil(maxValue / 5) * 5, 5);

    /** Calculate Y-axis ticks */
    const yAxisTicks = 5;
    const tickInterval = Math.ceil(yAxisDisplayMax / yAxisTicks);
    const yAxisLabels = [];
    for (let i = 0; i <= yAxisTicks; i++) {
      yAxisLabels.push(i * tickInterval);
    }

    return (
      <div className="w-full bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          {title}
        </h3>
        <div className="relative" style={{ height: "300px" }}>
          {/* Y-axis with labels */}
          <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between pr-2" style={{ width: "40px" }}>
            {yAxisLabels.reverse().map((tick, idx) => (
              <div key={idx} className="relative">
                <span className="text-xs text-gray-600 font-medium">
                  {tick}
                </span>
                <div
                  className="absolute right-0 top-1/2 w-2 h-px bg-gray-300 transform -translate-y-1/2 translate-x-full"
                  style={{ marginRight: "-8px" }}
                />
              </div>
            ))}
          </div>

          {/* Chart area with bars - horizontal scrollable */}
          <div className="ml-10 mr-4 relative" style={{ height: "260px" }}>
            {/* Y-axis grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {yAxisLabels.map((tick, idx) => (
                <div
                  key={idx}
                  className="w-full border-t border-gray-200"
                />
              ))}
            </div>

            {/* Bars - horizontal layout with scroll */}
            <div className="flex items-end justify-start gap-1.5 h-full px-2 pb-2 overflow-x-auto">
              {data.map((item, index) => {
                const chartHeight = 260;
                const maxBarHeight = chartHeight * 0.95;
                const barHeight = ((item.value || 0) / yAxisDisplayMax) * maxBarHeight;
                const color = colorScheme[index % colorScheme.length];
                /** Calculate bar width based on number of items, with min and max constraints */
                const barWidth = Math.max(20, Math.min(40, 800 / Math.max(data.length, 10)));

                return (
                  <div
                    key={item.label || index}
                    className="flex flex-col items-center relative group flex-shrink-0"
                    style={{ width: `${barWidth}px` }}
                  >
                    {/* Bar */}
                    <div
                      className="w-full rounded-t transition-all duration-500 relative"
                      style={{
                        height: `${barHeight}px`,
                        backgroundColor: color,
                        minHeight: item.value > 0 ? "4px" : "0",
                      }}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        {item.value || 0}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* X-axis labels - scrollable */}
          <div className="ml-10 mr-4 mt-2 flex justify-start gap-1.5 px-2 overflow-x-auto">
            {data.map((item, index) => {
              const displayLabel = abbreviateLabels
                ? abbreviateStateName(item.label || "Sin etiqueta")
                : (item.label || "Sin etiqueta");
              const barWidth = Math.max(20, Math.min(40, 800 / Math.max(data.length, 10)));

              return (
                <div
                  key={index}
                  className="text-center flex-shrink-0"
                  style={{ width: `${barWidth}px` }}
                >
                  <span
                    className="text-gray-600 block break-words leading-tight px-1"
                    style={{ fontSize: abbreviateLabels ? "0.6rem" : "0.65rem" }}
                    title={item.label || "Sin etiqueta"}
                  >
                    {displayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Renders a vertical bar chart with Y and X axes.
   * @param {string} title - Chart title
   * @param {Array<Object>} data - Chart data array with label and value properties
   * @param {Array<string>} [colorScheme=["#D2B40D", "#296B00", "#E58E15", "#cad00f"]] - Array of colors for bars
   * @param {boolean} [abbreviateLabels=false] - Whether to abbreviate labels (for states)
   * @returns {JSX.Element} Vertical bar chart component
   */
  const renderBarChart = (title, data, colorScheme = ["#D2B40D", "#296B00", "#E58E15", "#cad00f"], abbreviateLabels = false) => {
    if (!data || data.length === 0) {
      return (
        <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No hay datos disponibles</p>
        </div>
      );
    }

    const maxValue = Math.max(...data.map((d) => d.value || 0), 1);

    /** Calculate dynamic maximum for Y-axis based on actual data */
    /** Round up to next multiple of 5 for cleaner scale */
    const yAxisDisplayMax = Math.max(Math.ceil(maxValue / 5) * 5, 5);

    const yAxisTicks = 5;
    const tickInterval = Math.ceil(yAxisDisplayMax / yAxisTicks);
    const yAxisLabels = [];
    for (let i = 0; i <= yAxisTicks; i++) {
      yAxisLabels.push(i * tickInterval);
    }

    return (
      <div className="w-full bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          {title}
        </h3>
        <div className="relative" style={{ height: "400px" }}>
          {/* Y-axis with labels */}
          <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between pr-2" style={{ width: "40px" }}>
            {yAxisLabels.reverse().map((tick, idx) => (
              <div key={idx} className="relative">
                <span className="text-xs text-gray-600 font-medium">
                  {tick}
                </span>
                <div
                  className="absolute right-0 top-1/2 w-2 h-px bg-gray-300 transform -translate-y-1/2 translate-x-full"
                  style={{ marginRight: "-8px" }}
                />
              </div>
            ))}
          </div>

          {/* Chart area with bars */}
          <div className="ml-10 mr-4 relative" style={{ height: "360px" }}>
            {/* Y-axis grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {yAxisLabels.map((tick, idx) => (
                <div
                  key={idx}
                  className="w-full border-t border-gray-200"
                />
              ))}
            </div>

            {/* Bars */}
            <div className="flex items-end justify-around gap-2 h-full px-2 pb-2">
              {data.map((item, index) => {
                /** Calculate height in pixels based on dynamic Y-axis maximum */
                /** Container height is 360px, use ~95% for the tallest bar */
                const chartHeight = 360; /** Container height in pixels */
                const maxBarHeight = chartHeight * 0.95; /** 95% of container for tallest bar */
                /** Calculate proportional height: (value / axis max) * max bar height */
                const barHeight = ((item.value || 0) / yAxisDisplayMax) * maxBarHeight;
                const color = colorScheme[index % colorScheme.length];

                return (
                  <div
                    key={item.label || index}
                    className="flex flex-col items-center flex-1 relative group"
                    style={{ maxWidth: "120px" }}
                  >
                    {/* Bar */}
                    <div
                      className="w-full rounded-t transition-all duration-500 relative"
                      style={{
                        height: `${barHeight}px`,
                        backgroundColor: color,
                        minHeight: item.value > 0 ? "4px" : "0",
                      }}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        {item.value || 0}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* X-axis labels */}
          <div className="ml-10 mr-4 mt-2 flex justify-around gap-1 px-2">
            {data.map((item, index) => {
              const displayLabel = abbreviateLabels
                ? abbreviateStateName(item.label || "Sin etiqueta")
                : (item.label || "Sin etiqueta");

              return (
                <div
                  key={index}
                  className="flex-1 text-center min-w-0"
                  style={{ maxWidth: "120px" }}
                >
                  <span
                    className="text-gray-600 block break-words leading-tight px-1"
                    style={{ fontSize: abbreviateLabels ? "0.65rem" : "0.7rem" }}
                    title={item.label || "Sin etiqueta"}
                  >
                    {displayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <Loading fullscreen={false} message="Cargando estadísticas..." size={40} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Controls: Date Range and Export */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">
              Fecha inicio:
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Fecha fin:
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>
        <Button
          variant="brand"
          size="sm"
          radius="lg"
          onClick={handleExportPDF}
          disabled={exporting}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          {exporting ? "Exportando..." : "Exportar PDF"}
        </Button>
      </div>

      {/* Date Range Message */}
      {!loading && (
        <div className="w-full text-center">
          <p className="text-sm text-gray-600 font-medium">
            {dateRange.startDate && dateRange.endDate
              ? `Mostrando datos del ${formatDate(dateRange.startDate)} al ${formatDate(dateRange.endDate)}`
              : dateRange.startDate
                ? `Mostrando datos desde el ${formatDate(dateRange.startDate)}`
                : dateRange.endDate
                  ? `Mostrando datos hasta el ${formatDate(dateRange.endDate)}`
                  : "Mostrando todos los datos disponibles"}
          </p>
        </div>
      )}

      {/* Charts Layout */}
      <div className="w-full space-y-6">
        {/* Horizontal chart for residence - full width */}
        {renderHorizontalBarChart(
          "Lugares de Residencia",
          statistics.residence,
          ["#D2B40D", "#296B00", "#E58E15", "#cad00f"],
          true /** Abbreviate state names */
        )}

        {/* Two square charts below - side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderBarChart(
            "Categoría de Membresía",
            statistics.category,
            ["#D2B40D", "#296B00", "#E58E15", "#cad00f"],
            false
          )}
          {renderBarChart(
            "Grado de Estudios",
            statistics.education,
            ["#D2B40D", "#296B00", "#E58E15", "#cad00f"],
            false
          )}
        </div>
      </div>
    </div>
  );
}







