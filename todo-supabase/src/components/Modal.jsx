import React from 'react';
import '../index.css';

const Modal = ({
  isOpen,
  onClose,
  onAddTodo,
  newToDoTitle,
  setNewToDoTitle,
  newDeadline,
  setNewDeadline,
}) => {
  if (!isOpen) return null;

  const handleAddClick = () => {
    onAddTodo();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-5 rounded-lg w-80 relative shadow-lg">
        <span
          className="absolute top-2 right-2 text-2xl cursor-pointer text-gray-700"
          onClick={onClose}
        >
          &times;
        </span>
        <h2 className="text-lg font-medium text-center mb-4">Add New Task</h2>
        <input
          type="text"
          value={newToDoTitle}
          onChange={(e) => setNewToDoTitle(e.target.value)}
          placeholder="New Task..."
          required
          className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md text-lg"
        />
        <input
          type="date"
          value={newDeadline}
          onChange={(e) => setNewDeadline(e.target.value)}
          className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-md text-sm"
        />
        <button
          onClick={handleAddClick}
          className="w-full py-2 bg-green-500 text-white rounded-md text-lg cursor-pointer transition-colors duration-300 hover:bg-green-600"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default Modal;
