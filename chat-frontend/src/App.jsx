import { useState, useEffect } from 'react'
import './App.css'
import ChatBot from './components/Chatbot'
import Auth from './components/Auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignIn = (userData) => {
    setSession(userData)
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      {!session ? (
        <Auth onSignIn={handleSignIn} />
      ) : (
        <ChatBot session={session} />
      )}
    </div>
  )
}

export default App
