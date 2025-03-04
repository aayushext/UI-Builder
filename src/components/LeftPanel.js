import { useRef } from "react";

const LeftPanel = ({
  onAddPySideButton,
  onAddPySideLabel,
  onExport,
  onSaveToJson,
  onLoadFromJson,
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onLoadFromJson(file);
    }
    // Reset the input so the same file can be selected again
    event.target.value = "";
  };

  return (
    <aside className="w-64 bg-gray-200 p-4 flex flex-col h-full">
      <div className="flex-1">
        <h2 className="text-lg font-bold mb-2">Components</h2>
        <button
          onClick={onAddPySideButton}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 w-full">
          Add PySide Button
        </button>
        <button
          onClick={onAddPySideLabel}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4 w-full">
          Add PySide Label
        </button>
      </div>

      <div className="mt-auto pt-4 space-y-2">
        <button
          onClick={onSaveToJson}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded w-full">
          Save Design
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded w-full">
          Load Design
        </button>

        <button
          onClick={onExport}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full">
          Export to .py
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </aside>
  );
};

export default LeftPanel;
