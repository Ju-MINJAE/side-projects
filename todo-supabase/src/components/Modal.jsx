import React from 'react';
import styles from '../styles/Modal.module.css';

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
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <span className={styles.closeButton} onClick={onClose}>
          &times;
        </span>
        <h2>Add New Task</h2>
        <input
          type="text"
          value={newToDoTitle}
          onChange={(e) => setNewToDoTitle(e.target.value)}
          placeholder="New Task..."
          required
          className={styles.inputText}
        />
        <input
          type="date"
          value={newDeadline}
          onChange={(e) => setNewDeadline(e.target.value)}
          className={styles.inputDate}
        />
        <button onClick={handleAddClick} className={styles.addButton}>
          Add
        </button>
      </div>
    </div>
  );
};

export default Modal;
