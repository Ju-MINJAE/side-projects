import { supabase } from '../supabaseClient';
import { useCallback, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';

import Modal from './Modal';
import { FaRegTrashAlt } from 'react-icons/fa';
import '../index.css';

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
    <div className="h-full">
      <div className="flex justify-between items-center w-full h-16 bg-green-300 rounded-t-2xl">
        <p className="p-2 text-sm font-light">
          {formattedDate}
          <br />
          <strong>{weekday}</strong>
        </p>
        <button
          className="bg-green-700 text-white mr-3 py-1 px-3 rounded-md text-sm"
          onClick={logout}
        >
          Logout
        </button>
      </div>
      <div className="todo__list h-124 overflow-y-scroll bg-white p-4">
        <ul className="list-none m-4 p-0">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex justify-between items-center p-2 bg-gray-100 mb-2 rounded-lg shadow-md"
            >
              <div className="flex flex-col">
                <span
                  className={`text-lg font-semibold cursor-pointer ${
                    todo.is_complete
                      ? 'line-through text-gray-500'
                      : 'text-gray-900'
                  }`}
                  onClick={() => toggleComplete(todo.id, todo.is_complete)}
                >
                  {todo.title}
                </span>
                <span className="text-sm text-gray-600 mt-1">
                  ~{todo.deadline}
                </span>
              </div>
              <button
                className="text-lg cursor-pointer hover:text-red-600"
                onClick={() => deleteTodo(todo.id)}
              >
                <FaRegTrashAlt />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <footer className="flex justify-center items-center h-16 bg-white rounded-b-2xl">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_MODAL' })}
          className="w-12 h-12 bg-green-700 text-white rounded-full flex items-center justify-center text-2xl hover:bg-green-800 hover:scale-110 transition-transform duration-300"
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
