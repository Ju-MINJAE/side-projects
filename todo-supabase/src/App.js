import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

import './index.css';
import Auth from './components/Auth';
import ToDoList from './components/ToDoList';
import Weather from './components/Weather';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error fetching session:', error);
      } else {
        setSession(data.session);
      }
      setLoading(false);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <div className="mx-auto flex flex-col md:flex-row justify-between p-5 bg-white rounded-2xl shadow-md max-w-[840px] my-5 m:bg-stone-300">
        <div className="flex-1 basis-full md:basis-1/2 mx-2 hidden md:block">
          <Weather />
        </div>
        <div className="flex-1 basis-full md:basis-1/2 mx-2 p-5 bg-[#e3dede1d] shadow-md rounded-lg">
          <Routes>
            <Route
              path="/"
              element={
                session ? <ToDoList /> : <Navigate to="/auth" replace={true} />
              }
            />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
