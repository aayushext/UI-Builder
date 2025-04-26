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
                className="mt-1 w-full h-6 rounded-md border bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 cursor-pointer"
                style={{
                    backgroundColor: color,
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                }}
                onClick={() => setIsPickerOpen(!isPickerOpen)}
            />

            {/* Color picker popup */}
            {isPickerOpen && (
                <div
                    className="absolute z-10 p-2 rounded-xl shadow-lg dark:bg-gray-900"
                    style={{
                        top: pickerPosition.top ? "100%" : "auto",
                        bottom: !pickerPosition.top ? "100%" : "auto",
                        left: pickerPosition.left ? "0" : "auto",
                        right: !pickerPosition.left ? "0" : "auto",
                        marginTop: pickerPosition.top ? "4px" : "0",
                        marginBottom: !pickerPosition.top ? "4px" : "0",
                    }}>
                    <HexAlphaColorPicker
                        color={color}
                        onChange={handleColorChange}
                    />
                    <input
                        type="text"
                        className="mt-2 py-1 px-2 block w-full rounded-md bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
