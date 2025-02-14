const KivyLabel = ({ text, fontSize, textColor, backgroundColor, radius }) => {
  return (
    <div
      className="flex w-full h-full rounded justify-center items-center"
      style={{
        fontSize: `${fontSize}px`,
        color: textColor,
        backgroundColor: backgroundColor,
        borderRadius: `${radius}px`,
        transition: "background-color 0.2s ease",
      }}>
      <span className="align-middle">{text}</span>
    </div>
  );
};

export default KivyLabel;
