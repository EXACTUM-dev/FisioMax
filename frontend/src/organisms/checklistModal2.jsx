import React, { useMemo, useState, useEffect } from "react";
import Modal from "../molecules/modal";
import Button from "../atoms/button";
import { Title2 } from "../atoms/typography";
import CheckBox from "../atoms/checkBox";
import FieldBox from "../molecules/form";
import DataTable from "../organisms/dataTable";

/**
 * Modal to edit role with a privileges checklist.
 * Props:
 * - open: boolean
 * - title: string
 * - roleName: string
 * - tableData: array<{ id: string, label: string, checked?: boolean }>
 * - confirmLabel: string
 * - onConfirm: (roleName: string, selectedPrivilegesIds: string[]) => void
 * - onCancel: () => void
 */
export default function ChecklistModal({
  open,
  title = "Modify Role",
  roleName: initialRoleName = "Administrator",
  tableData = [],
  confirmLabel = "Save changes",
  onConfirm,
  onCancel,
}) {
  // Local state for role name
  const [roleName, setRoleName] = useState(initialRoleName);

  // Local state for privileges selection map: { [id]: boolean }
  const [checkedPrivileges, setCheckedPrivileges] = useState({});

  /**
   * Sync local state whenever modal opens or incoming props change.
   * This guarantees fresh data each time the modal is opened.
   */
  useEffect(() => {
    if (!open) return;
    setRoleName(initialRoleName);
    const map = (tableData || []).reduce((acc, priv) => {
      acc[priv.id] = !!priv.checked;
      return acc;
    }, {});
    setCheckedPrivileges(map);
  }, [open, initialRoleName, tableData]);

  /**
   * Toggle a privilege by id
   */
  const handleToggle = (id) => {
    setCheckedPrivileges((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  /**
   * Confirm and return selected privileges to parent
   */
  const handleConfirm = () => {
    const selectedPrivileges = Object.entries(checkedPrivileges)
      .filter(([, isChecked]) => isChecked)
      .map(([id]) => id);

    onConfirm?.(roleName, selectedPrivileges);
  };

  // Define columns for the privileges table
  const tableColumns = useMemo(
    () => [
      {
        key: "id",
        label: "ID",
        headAlign: "left",
        align: "left",
      },
      {
        key: "checked",
        label: "Sel.",
        headAlign: "center",
        align: "center",
        isAction: true,
        render: (row) => (
          <CheckBox
            ariaLabel={`Toggle ${row.label}`}
            checked={!!checkedPrivileges[row.id]}
            onChange={() => handleToggle(row.id)}
          />
        ),
      },
      {
        key: "label",
        label: "Permission",
        headAlign: "left",
        align: "left",
      },
    ],
    [checkedPrivileges]
  );

  // Do not render anything if not open (Modal also guards, but this avoids work)
  if (!open) return null;

  return (
    <Modal open={open} onClose={onCancel} size="xl" className="p-8">
      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-12 w-full">
        {/* Left column - form */}
        <div className="flex-1 min-w-[320px] flex flex-col justify-center">
          <div className="flex flex-col items-center justify-center h-full">
            <Title2 className="mb-6">{title}</Title2>

            <FieldBox
              label="Role name"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Enter role name"
            />

            <Button
              label={confirmLabel}
              variant="brand"
              onClick={handleConfirm}
              radius="lg"
              className="w-full py-3 text-base mt-4"
            />
          </div>
        </div>

        {/* Right column - privileges checklist */}
        <div className="flex-1 min-w-[320px]">
          <div
            className="bg-white rounded-lg border border-slate-200 max-h-[32rem] overflow-y-auto p-2
            [&::-webkit-scrollbar]:w-3
            [&::-webkit-scrollbar-track]:bg-slate-100
            [&::-webkit-scrollbar-track]:rounded-lg
            [&::-webkit-scrollbar-thumb]:bg-slate-300
            [&::-webkit-scrollbar-thumb]:rounded-lg
            [&::-webkit-scrollbar-thumb]:hover:bg-slate-400"
          >
            <DataTable columns={tableColumns} data={tableData} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
