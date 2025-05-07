import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { HexAlphaColorPicker } from "react-colorful";

const CustomColorPicker = ({ value, onChange }) => {
    const [color, setColor] = useState(value || "#ffffff");
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [pickerPosition, setPickerPosition] = useState({
        top: true,
        left: true,
    });
    const pickerRef = useRef(null);
    const swatchRef = useRef(null);

    useEffect(() => {
        if (value && value !== color) {
            setColor(value);
        }
    }, [value]);

    useEffect(() => {
        if (isPickerOpen && swatchRef.current) {
            const rect = swatchRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            const spaceRight = viewportWidth - rect.right;
            const spaceLeft = rect.left;
            const spaceBottom = viewportHeight - rect.bottom;
            const spaceTop = rect.top;

            setPickerPosition({
                top: spaceBottom > spaceTop,
                left: spaceRight > spaceLeft,
            });
        }
    }, [isPickerOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(event.target)
            ) {
                setIsPickerOpen(false);
            }
        };

        if (isPickerOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isPickerOpen]);

    const handleColorChange = (newColor) => {
        setColor(newColor);
        onChange(newColor);
    };

    return (
        <div className="relative" ref={pickerRef}>
            {/* Color swatch that toggles the picker */}
            <div
                ref={swatchRef}
                className="mt-1 w-full h-8 rounded-lg border bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 cursor-pointer"
                style={{
                    backgroundColor: color,
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                }}
                onClick={() => setIsPickerOpen(!isPickerOpen)}
            />

            {/* Color picker popup */}
            {isPickerOpen && (
                <div
                    className="absolute z-40 p-2 rounded-xl shadow-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    style={{
                        top: pickerPosition.top ? "calc(100% + 8px)" : "auto",
                        bottom: !pickerPosition.top
                            ? "calc(100% + 8px)"
                            : "auto",
                        left: pickerPosition.left ? "0" : "auto",
                        right: !pickerPosition.left ? "0" : "auto",
                        marginTop: "0",
                        marginBottom: "0",
                    }}>
                    <HexAlphaColorPicker
                        color={color}
                        onChange={handleColorChange}
                    />
                    <input
                        type="text"
                        className="mt-2 py-1 px-2 block w-full rounded-md bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 sm:text-sm transition-colors duration-150"
                        value={color}
                        onChange={(e) => handleColorChange(e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

CustomColorPicker.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
};

export default CustomColorPicker;
