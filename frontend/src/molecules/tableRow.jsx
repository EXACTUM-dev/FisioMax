/**
 * Version: 0.2.0
 * Generic data table row
 * Renders a selection checkbox and dynamic cells using column definitions
 */
import React from "react";
import Checkbox from "../atoms/checkbox";

export default function TableRow({ row, columns, checked, onToggle }) {
  return (
    <tr className="border-b border-neutral-200/80 hover:bg-neutral-50">
      {/* Selection checkbox */}
      <td className="w-12 pl-4 pr-2 py-4 align-middle">
        <Checkbox
          ariaLabel="Select row"
          checked={checked}
          onChange={onToggle}
        />
      </td>

      {/* Dynamic cells (supports col.render(row) */}
      {columns.map((col) => (
        <td
          key={col.key}
          className={`py-4 pr-4 align-middle text-[15px] text-slate-700 ${
            col.className ?? ""
          }`}
        >
          {col.render ? col.render(row) : row[col.key]}
        </td>
      ))}
    </tr>
  );
}
