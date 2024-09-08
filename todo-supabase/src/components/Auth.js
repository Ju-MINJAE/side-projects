import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleAuth = async () => {
    setError('');
    if (isSignup) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
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
      } else {
        alert('Login successful!');
        navigate('/');
      }
    }
  };

  return (
    <div>
      <h2>{isSignup ? 'Sign Up' : 'Log In'}</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button onClick={handleAuth}>{isSignup ? 'Sign Up' : 'Log In'}</button>
      <button onClick={() => setIsSignup(!isSignup)}>
        {isSignup
          ? 'Already have an account? Log In'
          : 'Need an account? Sign Up'}
      </button>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Auth;
