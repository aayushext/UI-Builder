const LeftPanel = ({ onAddPySideButton, onAddPySideLabel, onExport }) => {
  return (
    <aside className="w-64 bg-gray-200 p-4">
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
      <button
        onClick={onExport}
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4">
        Export to .py
      </button>
    </aside>
  );
};

export default LeftPanel;
