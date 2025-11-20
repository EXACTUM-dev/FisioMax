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
   * Fetches statistics data from the backend
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
      
      setStatistics({
        residence: data.residence || [],
        category: data.category || [],
        education: data.education || [],
      });
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
    } finally {
      setLoading(false);
    }
  }, [getToken, dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  /**
   * Handles PDF export
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
      
      const response = await fetchWithClerk(url, { method: "GET" }, token);
      
      // If backend returns a blob URL or file, handle download
      if (response?.url || response?.blob) {
        const link = document.createElement("a");
        link.href = response.url || URL.createObjectURL(response.blob);
        link.download = `reporte-membresias-${new Date().toISOString().split("T")[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.warn("Formato de respuesta no esperado para exportación PDF");
      }
    } catch (err) {
      console.error("Error al exportar PDF:", err);
      alert("Error al exportar el reporte. Por favor intente más tarde.");
    } finally {
      setExporting(false);
    }
  };

  /**
   * Renders a simple bar chart (placeholder - can be replaced with Chart.js or Recharts)
   */
  const renderBarChart = (title, data, colorScheme = ["#f59e0b", "#10b981", "#3b82f6", "#ef4444"]) => {
    if (!data || data.length === 0) {
      return (
        <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No hay datos disponibles</p>
        </div>
      );
    }

    const maxValue = Math.max(...data.map((d) => d.value || 0), 1);

    return (
      <div className="w-full bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          {title}
        </h3>
        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = ((item.value || 0) / maxValue) * 100;
            const color = colorScheme[index % colorScheme.length];
            
            return (
              <div key={item.label || index} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 font-medium">
                    {item.label || "Sin etiqueta"}
                  </span>
                  <span className="text-gray-600 font-semibold">
                    {item.value || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color,
                    }}
                  >
                    {percentage > 10 && (
                      <span className="text-white text-xs font-medium">
                        {Math.round(percentage)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderBarChart(
          "Lugares de Residencia",
          statistics.residence,
          ["#f59e0b", "#10b981", "#3b82f6", "#ef4444"]
        )}
        {renderBarChart(
          "Categoría de Membresía",
          statistics.category,
          ["#10b981", "#f59e0b", "#3b82f6", "#ef4444"]
        )}
        {renderBarChart(
          "Grado de Estudios",
          statistics.education,
          ["#3b82f6", "#f59e0b", "#10b981", "#ef4444"]
        )}
      </div>
    </div>
  );
}






