const LeftPanel = ({
  onAddPySideButton,
  onAddPySideLabel,
  onAddScreen,
  onDeleteScreen,
  screens,
  currentScreenIndex,
  onScreenChange,
  onExport,
}) => {
  return (
    <aside className="w-64 bg-gray-200 p-4 overflow-auto">
      <p>Left Panel</p>
      <button
        onClick={onAddPySideButton}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
        Add PySide Button
      </button>
      <button
        onClick={onAddPySideLabel}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4">
        Add PySide Label
      </button>

      <h2 className="text-lg font-bold mt-4 mb-2">Screens</h2>
      <button
        onClick={onAddScreen}
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-2 w-full">
        Add Screen
      </button>
      <div className="mt-2">
        {screens.map((screen, index) => (
          <div
            key={screen.id}
            className="flex items-center justify-between mb-1">
            <button
              onClick={() => onScreenChange(index)}
              className={`py-1 px-2 rounded w-full text-left ${
                index === currentScreenIndex
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}>
              {screen.name}
            </button>
            {screens.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent screen switch
                  onDeleteScreen(screen.id);
                }}
                className="bg-red-500 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded ml-2" // Smaller button
              >
                X
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={onExport}
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4">
        Export to .py
      </button>
    </aside>
  );
};

export default LeftPanel;
