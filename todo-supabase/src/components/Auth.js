import { useReducer } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

import styles from '../styles/Auth.module.css';

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
  const { email, password, isSignup, error } = state;

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
    <div className={styles.container}>
      <div className={styles.header}>{headerText}</div>
      <form className={styles.form} onSubmit={handleAuth}>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) =>
              dispatch({ type: 'SET_EMAIL', payload: e.target.value })
            }
            placeholder="Email@example.com"
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) =>
              dispatch({ type: 'SET_PASSWORD', payload: e.target.value })
            }
            placeholder="Password"
          />
        </div>
        <button className={styles.submitButton} onClick={handleAuth}>
          {headerText}
        </button>
        <button
          className={styles.toggleButton}
          onClick={() => dispatch({ type: 'TOGGLE_SIGNUP' })}
        >
          {toggleText}
        </button>
      </form>
    </div>
  );
};

export default Auth;
