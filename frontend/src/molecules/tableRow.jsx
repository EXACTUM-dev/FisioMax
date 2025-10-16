/**
 * @fileoverview Table row component with action event handling
 * @author EXACTUM-dev
 * @version 1.0.0
 * @description Prevents default link behavior for action columns
 */
import React from "react";
import Checkbox from "../atoms/checkBox";

export default function TableRow({
  row,
  columns = [],
  checked = false,
  onToggle = null,
}) {
  // Function to handle cell clicks for action columns
  const handleActionClick = (e, col, row) => {
    // Prevent default navigation behavior
    e.preventDefault();
    e.stopPropagation();

    // If the column has a render function with onClick behavior, let it handle
    // No additional handling needed here since render functions contain the event handlers
  };

  return (
    <tr className="border-t border-neutral-200 hover:bg-neutral-50/50">
      <td className="w-12 pl-4 pr-2 py-3">
        <Checkbox
          ariaLabel={`Select ${row.name || row.id}`}
          checked={checked}
          onChange={onToggle}
        />
      </td>

      {columns.map((col) => {
        // Get cell alignment class
        const align = col?.align || (col?.isAction ? "right" : "left");
        const alignClass =
          align === "center"
            ? "text-center"
            : align === "right"
            ? "text-right"
            : "text-left";

        return (
          <td
            key={col.key}
            className={`py-3 pr-4 ${alignClass} ${col.className || ""}`}
            onClick={
              col.isAction ? (e) => handleActionClick(e, col, row) : undefined
            }
          >
            {col.render ? col.render(row) : row[col.key] || "—"}
          </td>
        );
      })}
    </tr>
  );
}
