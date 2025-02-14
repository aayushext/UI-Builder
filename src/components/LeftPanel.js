const LeftPanel = ({ onAddKivyButton, onAddKivyLabel, onExport }) => {
  return (
    <aside className="w-64 bg-gray-200 p-4">
      <p>Left Panel</p>
      <button
        onClick={onAddKivyButton}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
        Add Kivy Button
      </button>
      <button
        onClick={onAddKivyLabel}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4">
        Add Kivy Label
      </button>
      <button
        onClick={onExport}
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4">
        Export to .kv
      </button>
    </aside>
  );
};

export default LeftPanel;
