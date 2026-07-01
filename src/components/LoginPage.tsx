import React, { useState } from 'react';
import { LogIn, UserPlus, Key, Mail, User, Shield, GraduationCap, Check, Sparkles, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
// @ts-ignore
import loginIllustration from '../assets/images/login_illustration_1782836272108.jpg';

interface LoginPageProps {
  onLogin: () => void;
  onCredentialLogin?: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onCredentialRegister?: (name: string, email: string, code: string, password: string) => Promise<{ success: boolean; error?: string }>;
  classrooms?: string[];
}

export default function LoginPage({ 
  onLogin, 
  onCredentialLogin, 
  onCredentialRegister,
  classrooms = []
}: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCode, setRegCode] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Por favor completa todos los campos.');
      return;
    }

    setIsLoggingIn(true);
    try {
      if (onCredentialLogin) {
        const res = await onCredentialLogin(loginEmail.trim().toLowerCase(), loginPassword.trim());
        if (!res.success) {
          setLoginError(res.error || 'Credenciales incorrectas o usuario no registrado.');
        }
      } else {
        setLoginError('El inicio de sesión manual no está configurado.');
      }
    } catch (err) {
      setLoginError('Ocurrió un error al intentar iniciar sesión.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName.trim() || !regEmail.trim() || !regCode.trim() || !regPassword.trim()) {
      setRegError('Por favor completa todos los campos del registro.');
      return;
    }

    setIsRegistering(true);
    try {
      if (onCredentialRegister) {
        const res = await onCredentialRegister(
          regName.trim(),
          regEmail.trim().toLowerCase(),
          regCode.trim().toUpperCase(),
          regPassword.trim()
        );
        if (res.success) {
          setRegSuccess('¡Inscripción completada con éxito! Ya puedes iniciar sesión con tus credenciales.');
          // Reset form fields
          setRegName('');
          setRegEmail('');
          setRegCode('');
          setRegPassword('');
          // Auto switch to login tab after 2 seconds
          setTimeout(() => {
            setActiveTab('login');
            setRegSuccess('');
          }, 2500);
        } else {
          setRegError(res.error || 'No se pudo completar el registro. Comprueba el código de aula.');
        }
      } else {
        setRegError('El registro manual no está configurado.');
      }
    } catch (err) {
      setRegError('Ocurrió un error al procesar tu inscripción.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" id="login-page-root">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden"
      >
        {/* Banner/Header with Illustration */}
        <div className="relative h-44 overflow-hidden bg-zinc-900">
          <img 
            src={loginIllustration} 
            alt="Manager Pro Intermodular" 
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent flex flex-col justify-end p-6">
            <h1 className="text-2xl font-black text-white">Manager Pro Intermodular</h1>
            <p className="text-zinc-300 text-xs mt-1">Plataforma avanzada de aprendizaje y gestión sostenible.</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-1.5 gap-1.5">
          <button
            onClick={() => {
              setActiveTab('login');
              setLoginError('');
              setRegError('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-zinc-900 shadow-xs border border-zinc-100/55'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <LogIn className="h-4 w-4" />
            <span>Acceder</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setLoginError('');
              setRegError('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-zinc-900 shadow-xs border border-zinc-100/55'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>Inscribirse</span>
          </button>
        </div>

        {/* Forms content with Animation */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'login' ? (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLoginSubmit}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all text-zinc-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">Código de Seguridad / PIN</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <input
                      type="password"
                      placeholder="Introduce tu contraseña o PIN"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all text-zinc-800"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-bold leading-relaxed">
                    ⚠️ {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 bg-zinc-900 hover:bg-zinc-850 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <LogIn className="h-4 w-4" />
                  <span>{isLoggingIn ? 'Iniciando sesión...' : 'Acceder a la plataforma'}</span>
                </button>

                {/* Separator / Google Alternate option */}
                <div className="relative my-4 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-150"></div>
                  </div>
                  <span className="relative bg-white px-3 text-[10px] font-black uppercase text-zinc-400 tracking-widest">O también</span>
                </div>

                <button
                  type="button"
                  onClick={onLogin}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-4 w-4" />
                  <span>Acceso rápido con Google</span>
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="register-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleRegisterSubmit}
                className="space-y-3.5"
              >
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">Nombre Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Ej. Juan Gómez Pérez"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all text-zinc-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all text-zinc-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1">
                      <span>Código de Aula / Registro</span>
                      <Sparkles className="h-3 w-3 text-sky-500" />
                    </label>
                    <div className="group relative">
                      <HelpCircle className="h-3.5 w-3.5 text-zinc-400 cursor-help" />
                      <div className="absolute right-0 bottom-6 hidden group-hover:block bg-zinc-900 text-white p-3 rounded-lg text-[10px] w-56 font-normal leading-normal shadow-lg z-50">
                        <strong className="font-bold">Códigos fijos por aula:</strong>
                        <ul className="list-disc pl-3 mt-1 space-y-1 font-mono">
                          <li>Alumnos: JCB-[AULA] (ej. JCB-2HCA)</li>
                          <li>Profesores: PROF-JCB-[AULA] (ej. PROF-JCB-2HCA)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Ej. JCB-2HCA (Alumnos) o PROF-JCB-2HCA (Profes)"
                      value={regCode}
                      onChange={(e) => setRegCode(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold uppercase placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all text-zinc-800 tracking-wider"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">Elegir Código de Seguridad / PIN</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <input
                      type="password"
                      placeholder="Crea tu contraseña para futuros accesos"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all text-zinc-800"
                    />
                  </div>
                </div>

                {regError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-bold leading-relaxed">
                    ⚠️ {regError}
                  </div>
                )}

                {regSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 leading-relaxed">
                    <Check className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span>{regSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full py-3 bg-zinc-900 hover:bg-zinc-850 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{isRegistering ? 'Procesando registro...' : 'Completar Inscripción'}</span>
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info banner */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            IES Sostenible • Registro Automatizado de Aulas
          </p>
        </div>
      </motion.div>
    </div>
  );
}
