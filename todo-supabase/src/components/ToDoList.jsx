import { supabase } from '../supabaseClient';
import { useCallback, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';

import Modal from './Modal';
import { FaRegTrashAlt } from 'react-icons/fa';
import styles from '../styles/ToDoList.module.css';

const initialState = {
  todos: [],
  toDoTitle: '',
  deadline: '',
  isModalOpen: false,
  user: null,
  formattedDate: '',
  weekday: '',
};
const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_TODOS':
      return { ...state, todos: action.payload };
    case 'ADD_TODO':
      return { ...state, todos: [...state.todos, action.payload] };
    case 'SET_TODOTITLE':
      return { ...state, toDoTitle: action.payload };
    case 'SET_DEADLINE':
      return { ...state, deadline: action.payload };
    case 'TOGGLE_MODAL':
      return { ...state, isModalOpen: !state.isModalOpen };
    case 'CLOSE_MODAL':
      return { ...state, isModalOpen: false };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_FORMATTEDDATE':
      return { ...state, formattedDate: action.payload };
    case 'SET_WEEKDAY':
      return { ...state, weekday: action.payload };
    default:
      return state;
  }
};

const ToDoList = () => {
  const navigate = useNavigate();

  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    todos,
    toDoTitle,
    deadline,
    isModalOpen,
    user,
    formattedDate,
    weekday,
  } = state;

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      dispatch({ type: 'SET_USER', payload: user });
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
      dispatch({ type: 'SET_FORMATTEDDATE', payload: formattedDate });
      dispatch({ type: 'SET_WEEKDAY', payload: formattedWeekday });
    };
    fetchUser();
    getDate();
  }, []);

  const fetchTodos = useCallback(async () => {
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
      dispatch({ type: 'SET_TODOS', payload: data });
    }
  }, [user]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

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
      dispatch({
        type: 'SET_TODOS',
        payload: todos.map((todo) => (todo.id === id ? data[0] : todo)),
      });
    }
  };

  const addTodo = async () => {
    if (toDoTitle.trim()) {
      const { data, error } = await supabase
        .from('todos')
        .insert([
          {
            title: toDoTitle,
            deadline: deadline,
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
        dispatch({ type: 'ADD_TODO', payload: data[0] });
        dispatch({ type: 'SET_TODOTITLE', payload: '' });
        dispatch({ type: 'SET_DEADLINE', payload: '' });
        dispatch({ type: 'CLOSE_MODAL' });
      }
    }
  };

  const deleteTodo = async (id) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);

    if (error) {
      console.error('Error deleting todo:', error);
      return;
    }
    dispatch({
      type: 'SET_TODOS',
      payload: todos.filter((todo) => todo.id !== id),
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div className={styles.todo__container}>
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
      <footer className={styles.todo__footer}>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_MODAL' })}
          className={styles.add__task}
        >
          +
        </button>
      </footer>
      <Modal
        isOpen={isModalOpen}
        onClose={() => dispatch({ type: 'TOGGLE_MODAL' })}
        onAddTodo={addTodo}
        newToDoTitle={toDoTitle}
        setNewToDoTitle={(title) =>
          dispatch({ type: 'SET_TODOTITLE', payload: title })
        }
        newDeadline={deadline}
        setNewDeadline={(date) =>
          dispatch({ type: 'SET_DEADLINE', payload: date })
        }
      />
    </div>
  );
};

export default ToDoList;
