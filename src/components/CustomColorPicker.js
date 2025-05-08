import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { HexAlphaColorPicker } from "react-colorful";
import { createPortal } from "react-dom";

/**
 * CustomColorPicker
 * A professional, accessible color picker component with alpha support.
 * - Uses react-colorful's HexAlphaColorPicker for modern UX.
 * - Renders the popup in a portal to avoid stacking issues.
 * - Handles positioning to avoid viewport overflow.
 * - Stops event propagation to prevent unwanted deselection.
 *
 * @component
 * @param {object} props
 * @param {string} props.value - The current color value (hex, e.g. "#RRGGBB" or "#RRGGBBAA").
 * @param {function} props.onChange - Callback when the color changes.
 * @returns {JSX.Element}
 */
const CustomColorPicker = ({ value = "#ffffff", onChange }) => {
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [popupStyle, setPopupStyle] = useState({});
    const swatchRef = useRef(null);
    const pickerRef = useRef(null);

    // Position the popup to avoid viewport overflow
    useEffect(() => {
        if (isPickerOpen && swatchRef.current) {
            const rect = swatchRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const popupWidth = 220;
            const popupHeight = 320;

            let left = rect.left;
            let top = rect.bottom + 8;

            if (left + popupWidth > viewportWidth) {
                left = viewportWidth - popupWidth - 8;
            }
            if (top + popupHeight > viewportHeight) {
                top = rect.top - popupHeight - 8;
            }
            setPopupStyle({
                position: "absolute",
                left: `${left}px`,
                top: `${top}px`,
                zIndex: 9999,
            });
        }
    }, [isPickerOpen]);

    // Close picker when clicking outside
    useEffect(() => {
        if (!isPickerOpen) return;
        const handleClickOutside = (event) => {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(event.target) &&
                !swatchRef.current.contains(event.target)
            ) {
                setIsPickerOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isPickerOpen]);

    /**
     * Handle color changes from picker or input.
     * @param {string} newColor - The new color value.
     */
    const handleColorChange = (newColor) => {
        onChange(newColor);
    };

    return (
        <div className="relative">
            {/* Color swatch button */}
            <div
                ref={swatchRef}
                className="mt-1 w-full h-8 rounded-lg border bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 cursor-pointer"
                style={{
                    backgroundColor: value,
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                }}
                onClick={() => setIsPickerOpen((open) => !open)}
                onMouseDown={(e) => e.stopPropagation()}
                aria-label="Open color picker"
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        setIsPickerOpen((open) => !open);
                        e.preventDefault();
                    }
                }}
            />
            {/* Popup rendered in portal for stacking */}
            {isPickerOpen &&
                createPortal(
                    <div
                        ref={pickerRef}
                        className="p-2 rounded-xl shadow-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        style={popupStyle}
                        onMouseDown={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true">
                        <HexAlphaColorPicker
                            color={value}
                            onChange={handleColorChange}
                            aria-label="Color picker"
                        />
                        <input
                            type="text"
                            className="mt-2 py-1 px-2 block w-full rounded-md bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 sm:text-sm transition-colors duration-150"
                            value={value}
                            onChange={(e) => handleColorChange(e.target.value)}
                            aria-label="Color value"
                            autoComplete="off"
                        />
                    </div>,
                    document.body
                )}
        </div>
    );
};

CustomColorPicker.propTypes = {
    /** The current color value (hex, e.g. "#RRGGBB" or "#RRGGBBAA") */
    value: PropTypes.string,
    /** Callback when the color changes */
    onChange: PropTypes.func.isRequired,
};

export default CustomColorPicker;
