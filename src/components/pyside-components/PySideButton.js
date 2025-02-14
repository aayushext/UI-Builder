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
  const [isPressed, setIsPressed] = useState(false); // Track pressed state

  // Determine the current background color based on state
  let currentBackgroundColor = backgroundColor;
  if (isPressed) {
    currentBackgroundColor = pressedColor;
  } else if (isHovered) {
    currentBackgroundColor = hoverColor;
  }

  const buttonStyle = {
    fontSize: `${fontSize}px`,
    color: textColor,
    backgroundColor: currentBackgroundColor, // Use the dynamic background color
    borderRadius: `${radius}px`,
    border: "none",
    padding: "10px 15px",
    cursor: "pointer", // Add cursor style
    transition: "background-color 0.2s ease", // Smooth transition
  };

  return (
    <button
      className="w-full h-full"
      style={buttonStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)} // Set pressed state
      onMouseUp={() => setIsPressed(false)} // Clear pressed state
      onMouseOut={() => setIsPressed(false)} //also clear it if moved outside the button
    >
      {text}
    </button>
  );
};

export default PySideButton;
