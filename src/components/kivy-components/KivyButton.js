const KivyButton = ({
  text,
  fontSize,
  textColor,
  backgroundColor,
  radius,
  pressedColor,
  isPressed,
}) => {
  //Added isPressed
  return (
    <button
      className="w-full h-full rounded"
      style={{
        fontSize: `${fontSize}px`,
        color: textColor,
        backgroundColor: isPressed ? pressedColor : backgroundColor, // Change color on press
        borderRadius: `${radius}px`,
        transition: "background-color 0.2s ease", // Smooth transition
      }}>
      {text}
    </button>
  );
};

export default KivyButton;
