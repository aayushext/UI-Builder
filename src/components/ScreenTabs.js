import React from "react";

const ScreenTabs = ({
  screens,
  currentScreenIndex,
  onScreenChange,
  onAddScreen,
  onDeleteScreen,
}) => {
  return (
    <div className="flex items-center border-b border-gray-300 bg-gray-100  px-4 py-2">
      {screens.map((screen, index) => (
        <div key={screen.id} className="flex items-center mr-2">
          <button
            onClick={() => onScreenChange(index)}
            className={`py-1 px-3 rounded-md ${
              index === currentScreenIndex
                ? "bg-white text-blue-600 border border-gray-300 border-b-gray-400"
                : "bg-gray-200 hover:bg-gray-300"
            }`}>
            {screen.name}
          </button>
          {screens.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteScreen(screen.id);
              }}
              className="bg-red-500 hover:bg-red-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ml-1">
              ×
            </button>
          )}
        </div>
      ))}
      <button
        onClick={onAddScreen}
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-1 px-3 rounded-md ml-2">
        +
      </button>
    </div>
  );
};

export default ScreenTabs;
