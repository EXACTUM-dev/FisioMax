import React, { useState, useRef, useEffect } from 'react';

export default function RolePicker({ row, roles = [], onSelect, onOpenPopup }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const current =
    row?.rol || row?.role || (Array.isArray(row?.roles) && row.roles[0]?.name) || row?.correo || '';

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <span
        onClick={() => onOpenPopup?.(row)}
        className="cursor-pointer hover:opacity-80"
      >
        {current || 'Asignar rol'}
      </span>
    </div>
  );
}
