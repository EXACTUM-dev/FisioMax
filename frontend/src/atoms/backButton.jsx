/**
 * @fileoverview Back button atom component
 * @version 1.0.0
 * @author EXACTUM-dev
 * @description Reusable back button with consistent styling
 */

import { CircleArrowLeft } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * BackButton - Atomic button component for navigation back
 * @param {Object} props - Component props
 * @param {Function} props.onClick - Click handler function
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.ariaLabel - Accessibility label
 * @returns {JSX.Element} Back button component
 */
const BackButton = ({ 
  color = '#CAD00F', 
  size = 24, 
  onClick, 
  className = '',
  ariaLabel = 'Volver atrás'
}) => {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-opacity cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#CAD00F] ${className}`}
      aria-label={ariaLabel}
      type="button"
    >
      <CircleArrowLeft color={color} size={size} />
    </button>
  );
};

BackButton.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
  onClick: PropTypes.func,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
};

export default BackButton;
