import { supabase } from '../supabaseClient';
import { useEffect, useState } from 'react';

import Modal from './Modal';
import '../styles/ToDoList.module.css';

const ToDoList = () => {
  const [todos, setTodos] = useState([]);
  const [newToDoTitle, setNewToDoTitle] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching todos:', error);
      return;
    }

    if (data) {
      setTodos(data);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const toggleComplete = async (id, currentStatus) => {
    const { data, error } = await supabase
      .from('todos')
      .update({ is_complete: !currentStatus })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error toggling complete:', error);
      return;
    }

    if (data) {
      setTodos(todos.map((todo) => (todo.id === id ? data[0] : todo)));
    }
  };

  const addTodo = async () => {
    if (newToDoTitle.trim()) {
      const { data, error } = await supabase
        .from('todos')
        .insert([
          {
            title: newToDoTitle,
            deadline: newDeadline,
            is_complete: false,
          },
        ])
        .select();

      if (error) {
        console.error('Error adding todo:', error);
        return;
      }

      if (data && Array.isArray(data)) {
        setTodos((prevTodos) => [...prevTodos, ...data]);
        setNewToDoTitle('');
        setNewDeadline('');
        setIsModalOpen(false);
      }
    }
  };

  const deleteTodo = async (id) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);

    if (error) {
      console.error('Error deleting todo:', error);
      return;
    }

    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <span
              onClick={() => toggleComplete(todo.id, todo.is_complete)}
              style={{
                textDecoration: todo.is_complete ? 'line-through' : 'none',
                cursor: 'pointer',
              }}
            >
              {todo.title} {todo.deadline}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <button onClick={() => setIsModalOpen(true)}>Add New Task</button>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTodo={addTodo}
        newToDoTitle={newToDoTitle}
        setNewToDoTitle={setNewToDoTitle}
        newDeadline={newDeadline}
        setNewDeadline={setNewDeadline}
      />
    </div>
  );
};

export default ToDoList;
