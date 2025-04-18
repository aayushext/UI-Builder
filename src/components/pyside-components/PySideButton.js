import { useState } from "react";

const PySideButton = ({
    text,
    fontSize,
    textColor,
    backgroundColor,
    radius,
    pressedColor,
    hoverColor,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    let currentBackgroundColor = backgroundColor;
    if (isPressed) {
        currentBackgroundColor = pressedColor;
    } else if (isHovered) {
        currentBackgroundColor = hoverColor;
    }

    const buttonStyle = {
        fontSize: `${fontSize}px`,
        color: textColor,
        backgroundColor: currentBackgroundColor,
        borderRadius: `${radius}px`,
        border: "none",
        padding: "10px 15px",
        cursor: "pointer",
        transition: "background-color 0.2s ease",
    };

    return (
        <button
            className="w-full h-full"
            style={buttonStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseOut={() => setIsPressed(false)}>
            {text}
        </button>
    );
};

export default PySideButton;
