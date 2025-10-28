/**
 * @fileoverview Custom hook for managing privilege selection state
 * @version 0.1.0
 * @author EXACTUM-dev
 */

import { useState, useMemo } from "react";

/**
 * Custom hook to manage privilege selection logic.
 * @param {Array} tableData - Array of privilege objects [{ id, label, checked }]
 * @returns {Object} - Privilege state and handlers
 */
export function usePrivileges(tableData) {
  const [checkedPrivileges, setCheckedPrivileges] = useState(() =>
    (tableData || []).reduce((acc, priv) => {
      acc[priv.id] = priv.checked ?? false;
      return acc;
    }, {})
  );

  const allSelected = useMemo(
    () =>
      tableData.length > 0 &&
      tableData.every((priv) => checkedPrivileges[priv.id]),
    [tableData, checkedPrivileges]
  );

  const handleToggle = (id) => {
    setCheckedPrivileges((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAll = () => {
    const allChecked = tableData.every((priv) => checkedPrivileges[priv.id]);
    const newState = {};
    tableData.forEach((priv) => {
      newState[priv.id] = !allChecked;
    });
    setCheckedPrivileges(newState);
  };

  const currentSelectedIds = useMemo(
    () =>
      Object.entries(checkedPrivileges)
        .filter(([, checked]) => !!checked)
        .map(([id]) => String(id)),
    [checkedPrivileges]
  );

  return {
    checkedPrivileges,
    allSelected,
    handleToggle,
    handleSelectAll,
    currentSelectedIds,
  };
}
