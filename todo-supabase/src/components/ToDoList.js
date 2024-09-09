import { supabase } from '../supabaseClient';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Modal from './Modal';
import { FaRegTrashAlt } from 'react-icons/fa';
import styles from '../styles/ToDoList.module.css';

const ToDoList = () => {
  const navigate = useNavigate();

  const [todos, setTodos] = useState([]);
  const [newToDoTitle, setNewToDoTitle] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [formattedDate, setFormattedDate] = useState('');
  const [weekday, setWeekday] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    const getDate = () => {
      const now = new Date();
      const dateOptions = {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      };
      const formattedDate = new Intl.DateTimeFormat('ko-KR', dateOptions)
        .format(now)
        .replace(/\./g, '.')
        .trim();
      const weekdayOptions = {
        timeZone: 'Asia/Seoul',
        weekday: 'long',
      };
      const formattedWeekday = new Intl.DateTimeFormat(
        'en-US',
        weekdayOptions
      ).format(now);

      setFormattedDate(formattedDate);
      setWeekday(formattedWeekday);
    };
    fetchUser();
    getDate();
  }, []);

  const fetchTodos = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
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
  }, [user]);

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
            user_id: user.id,
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

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div>
      <div className={styles.header}>
        <p>
          {formattedDate}
          <br />
          <strong>{weekday}</strong>
        </p>
        <button className={styles.logout__btn} onClick={logout}>
          Logout
        </button>
      </div>
      <div className={styles.todo__list}>
        <ul>
          {todos.map((todo) => (
            <li key={todo.id} className={styles.todo__item}>
              <div className={styles.todo__content}>
                <span
                  className={`${styles.todo__title} ${
                    todo.is_complete ? styles.completed : ''
                  }`}
                  onClick={() => toggleComplete(todo.id, todo.is_complete)}
                >
                  {todo.title}
                </span>
                <span className={styles.todo__deadline}>~{todo.deadline}</span>
              </div>
              <button
                className={styles.delete__btn}
                onClick={() => deleteTodo(todo.id)}
              >
                <FaRegTrashAlt />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button onClick={() => setIsModalOpen(true)} className={styles.add__task}>
        + New Task
      </button>
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
