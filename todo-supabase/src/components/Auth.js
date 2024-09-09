import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

import styles from '../styles/Auth.module.css';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    if (isSignup) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        alert(error);
      } else {
        alert('Signup successful! Check your email for a confirmation link.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        alert(error);
      } else {
        alert('Login successful!');
        navigate('/');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p>{isSignup ? 'SignUp' : 'LogIn'}</p>
      </div>
      <form className={styles.form} onSubmit={handleAuth}>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email@example.com"
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </div>
        <button className={styles.submitButton} onClick={handleAuth}>
          {isSignup ? 'SignUp' : 'LogIn'}
        </button>
        <button
          className={styles.toggleButton}
          onClick={() => setIsSignup(!isSignup)}
        >
          {isSignup
            ? 'Already have an account? LogIn'
            : 'Need an account? SignUp'}
        </button>
      </form>
    </div>
  );
};

export default Auth;
