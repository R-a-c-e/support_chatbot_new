import React from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const Auth = ({ onSignIn }) => {
  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) throw error;
      if (data) {
        // Create user profile if it doesn't exist
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: data.user.id,
            display_name: data.user.user_metadata.full_name,
            last_active_at: new Date().toISOString()
          });

        if (profileError) throw profileError;
        onSignIn(data);
      }
    } catch (error) {
      console.error('Error signing in with Google:', error.message);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg" style={{ maxWidth: '400px', margin: '0 auto', borderRadius: '15px' }}>
        <div className="card-header bg-primary text-white text-center" 
             style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
          <h4 className="mb-0">Welcome to Secure Chatbot</h4>
        </div>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <i className="fas fa-robot fa-3x text-primary mb-3"></i>
            <h5>Sign in to start chatting</h5>
          </div>
          <button 
            className="btn btn-light w-100 border d-flex align-items-center justify-content-center gap-2"
            onClick={handleGoogleSignIn}
            style={{ transition: 'all 0.3s ease' }}
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '20px' }} />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth; 