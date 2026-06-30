import React from 'react';
import { LogIn } from 'lucide-react';
import { motion } from 'motion/react';
// @ts-ignore
import loginIllustration from '../assets/images/login_illustration_1782836272108.jpg';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm text-center"
      >
        <div className="mb-6 overflow-hidden rounded-2xl">
          <img 
            src={loginIllustration} 
            alt="Manager Pro intermodular" 
            className="w-full h-40 object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <h1 className="text-2xl font-black text-zinc-900 mb-2">Manager Pro intermodular</h1>
        <p className="text-zinc-500 mb-8 text-sm">Plataforma avanzada de aprendizaje y gestión intermodular.</p>
        
        <button 
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-3 bg-zinc-900 text-white py-3.5 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-md hover:shadow-lg"
        >
          <LogIn className="h-5 w-5" />
          Iniciar sesión con Google
        </button>
        
        <p className="mt-6 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
          Plataforma Segura
        </p>
      </motion.div>
    </div>
  );
}
