import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

import styles from '../styles/Nav.module.css';

const Nav = () => {
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <header className={styles.header}>
      <h1>This is header</h1>
      <button className={styles.logout__btn} onClick={logout}>
        logout
      </button>
    </header>
  );
};

export default Nav;
