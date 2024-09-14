import { useReducer } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const initialState = {
  email: '',
  password: '',
  isSignup: true,
  error: '',
};
const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_EMAIL':
      return { ...state, email: action.payload };
    case 'SET_PASSWORD':
      return { ...state, password: action.payload };
    case 'TOGGLE_SIGNUP':
      return { ...state, isSignup: !state.isSignup };
    case 'ERROR':
      return { ...state, error: action.payload };
    case 'RESET_ERROR':
      return { ...state, error: '' };
    default:
      return state;
  }
};

const Auth = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { email, password, isSignup } = state;

  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    dispatch({ type: 'RESET_ERROR' });

    if (isSignup) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } else {
        alert('Signup successful! Check your email for a confirmation link.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } else {
        alert('Login successful!');
        navigate('/');
      }
    }
  };

  let headerText, toggleText;
  if (isSignup) {
    headerText = 'SignUp';
    toggleText = 'Already have an account? LogIn';
  } else {
    headerText = 'LogIn';
    toggleText = 'Need an account? SignUp';
  }

  return (
    <div className="max-w-[480px] mx-auto">
      <div className="w-full h-[6vh] bg-[#bbed72] rounded-t-lg flex items-center justify-center">
        <p className="m-0 text-2xl font-medium">{headerText}</p>
      </div>
      <form className="flex flex-col h-124 bg-white" onSubmit={handleAuth}>
        <div className="mb-5 text-center">
          <label
            htmlFor="email"
            className="block mt-2 mb-2 text-lg font-semibold"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) =>
              dispatch({ type: 'SET_EMAIL', payload: e.target.value })
            }
            placeholder="Email@example.com"
            className="w-4/5 p-2 border border-gray-300 rounded-md text-lg"
          />
        </div>
        <div className="mb-5 text-center">
          <label
            htmlFor="password"
            className="block mb-2 text-lg font-semibold"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) =>
              dispatch({ type: 'SET_PASSWORD', payload: e.target.value })
            }
            placeholder="Password"
            className="w-4/5 p-2 border border-gray-300 rounded-md text-lg"
          />
        </div>
        <button
          className="w-4/5 mx-auto mt-6 bg-green-500 text-white py-2 rounded-md text-lg mb-3 hover:bg-green-600"
          onClick={handleAuth}
        >
          {headerText}
        </button>
        <button
          className="w-4/5 mx-auto bg-transparent text-gray-800 py-2 rounded-md text-lg border border-gray-800 hover:bg-gray-200"
          onClick={() => dispatch({ type: 'TOGGLE_SIGNUP' })}
        >
          {toggleText}
        </button>
      </form>
    </div>
  );
};

export default Auth;
