import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to CollabHub</h1>
        <p className="mb-8">Please sign up or log in to continue.</p>
        <button
          onClick={() => navigate("/signup")}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg mr-4"
        >
          Sign Up
        </button>
        <button
          onClick={() => navigate("/login")}
          className="bg-gray-500 text-white py-2 px-4 rounded-lg"
        >
          Log In
        </button>
      </div>
    </div>
  );
};

export default Home;
