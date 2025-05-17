"use client";

import { useAuth } from '../lib/hooks/useAuth';

export default function SignInWithMicrosoft() {
  const { signInWithMicrosoft } = useAuth();

  return (
    <button
      onClick={signInWithMicrosoft}
      className="flex items-center justify-center bg-white text-gray-700 font-semibold py-2 px-4 rounded-full border border-gray-300 hover:bg-gray-100 transition duration-300 ease-in-out"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2" viewBox="0 0 23 23">
        <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
        <path fill="#f35325" d="M1 1h10v10H1z"/>
        <path fill="#81bc06" d="M12 1h10v10H12z"/>
        <path fill="#05a6f0" d="M1 12h10v10H1z"/>
        <path fill="#ffba08" d="M12 12h10v10H12z"/>
      </svg>
      Sign in with Microsoft
    </button>
  );
} 