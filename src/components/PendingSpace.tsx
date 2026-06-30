import React, { useState } from 'react';
import { 
  Clock, 
  User, 
  Camera, 
  Check, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { AppUser } from '../types';

interface PendingSpaceProps {
  currentUser: AppUser;
  onUpdateCurrentUser: (updatedUser: AppUser) => void;
  onLogoutToAdmin: () => void;
}

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Max',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Sophie',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Buster'
];

export default function PendingSpace({ 
  currentUser, 
  onUpdateCurrentUser,
  onLogoutToAdmin
}: PendingSpaceProps) {
  const [tempName, setTempName] = useState(currentUser.name);
  const [tempAvatar, setTempAvatar] = useState(currentUser.avatarUrl);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) {
      alert('El nombre no puede estar vacío.');
      return;
    }

    const initials = tempName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'US';
    onUpdateCurrentUser({
      ...currentUser,
      name: tempName,
      avatarUrl: tempAvatar,
      initials
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSelectPreset = (url: string) => {
    setTempAvatar(url);
    setIsSaved(false);
  };

  const handleApplyCustomUrl = () => {
    if (customAvatarUrl.trim()) {
      setTempAvatar(customAvatarUrl.trim());
      setCustomAvatarUrl('');
      setIsSaved(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between" id="pending-space-root">
      
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xs">
            <Clock className="h-4.5 w-4.5 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-zinc-900 block">Manager pro Sostenible</span>
            <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider block">Espacio de Espera</span>
          </div>
        </div>

        <button
          onClick={onLogoutToAdmin}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900 text-xs font-semibold cursor-pointer transition-all"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Volver al Admin</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 flex flex-col lg:flex-row gap-8 justify-center items-stretch my-auto">
        
        {/* Left Card: Welcome Message */}
        <div className="flex-1 bg-white border border-zinc-200/80 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col justify-between">
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Check className="h-6 w-6 stroke-[3]" />
            </div>

            <div className="space-y-3">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase tracking-widest rounded-full border border-emerald-100">
                ¡Acceso Confirmado!
              </span>
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight leading-tight">
                Ya estás dentro de la plataforma
              </h2>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                Tu cuenta ha sido registrada correctamente con el correo <strong className="text-zinc-700 font-bold">{currentUser.email}</strong>. El proceso de autenticación inicial ha sido exitoso.
              </p>
            </div>

            {/* Warning card for missing roles */}
            <div className="p-4 bg-amber-50/50 border border-amber-200/60 rounded-2xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs text-amber-900 block">Falta asignar rol y aula</span>
                <span className="text-[11px] text-amber-700 leading-relaxed mt-1 block">
                  Para poder navegar y usar los espacios interactivos de la academia, un Administrador debe asignarte tu perfil correspondiente (<strong className="font-bold">Profesor</strong> o <strong className="font-bold">Alumno</strong>) y tu <strong className="font-bold">Aula de estudios</strong>.
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-100 mt-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-semibold text-zinc-600">
                Esperando respuesta del administrador...
              </span>
            </div>
            
            <p className="text-[11px] text-zinc-400">
              💡 Mientras tanto, puedes personalizar tu perfil en el panel de la derecha para que tus profesores o alumnos te reconozcan de inmediato con tu foto y nombre correctos.
            </p>
          </div>
        </div>

        {/* Right Card: Profile Customizer */}
        <div className="flex-1 bg-white border border-zinc-200/80 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col">
          <h3 className="text-sm font-bold text-zinc-900 tracking-tight flex items-center gap-1.5 mb-6">
            <User className="h-4.5 w-4.5 text-zinc-500" />
            <span>Personalizar Perfil Provisional</span>
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-5">
              
              {/* Dynamic Avatar Viewer */}
              <div className="flex items-center gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-150">
                <div className="relative shrink-0">
                  <img 
                    src={tempAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(tempName)}`} 
                    alt="Vista previa avatar" 
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md bg-white"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-zinc-900 text-white p-1 rounded-full border-2 border-white">
                    <Camera className="w-3 h-3" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <span className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider block">Vista Previa</span>
                  <span className="font-extrabold text-sm text-zinc-900 truncate block">{tempName || 'Tu Nombre'}</span>
                  <span className="text-[10px] text-zinc-400 font-mono block">Perfil Provisional</span>
                </div>
              </div>

              {/* Name Field */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                  Nombre Completo
                </label>
                <input 
                  type="text" 
                  value={tempName}
                  onChange={(e) => {
                    setTempName(e.target.value);
                    setIsSaved(false);
                  }}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                  placeholder="Introduce tu nombre y apellidos"
                  required
                />
              </div>

              {/* Preset Avatars Selection */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                  Seleccionar Ilustración de Perfil
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_AVATARS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectPreset(url)}
                      className={`relative rounded-xl border overflow-hidden p-0.5 cursor-pointer bg-zinc-50 hover:bg-zinc-100 hover:scale-105 transition-all ${
                        tempAvatar === url ? 'border-zinc-950 ring-2 ring-zinc-900 bg-white' : 'border-zinc-200'
                      }`}
                    >
                      <img src={url} alt={`Avatar ${i}`} referrerPolicy="no-referrer" className="w-full h-auto" />
                      {tempAvatar === url && (
                        <div className="absolute top-0 right-0 bg-zinc-900 text-white rounded-bl-lg p-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Image URL Field */}
              <div className="space-y-2 pt-1">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                  O introduce una URL de foto personalizada
                </label>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    placeholder="https://ejemplo.com/tu-foto.jpg"
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl cursor-pointer transition-all border border-zinc-200"
                  >
                    Aplicar
                  </button>
                </div>
              </div>

            </div>

            {/* Buttons */}
            <div className="pt-4 mt-6">
              <button
                type="submit"
                className={`w-full py-3 rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all flex items-center justify-center gap-2 ${
                  isSaved 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="h-4 w-4 stroke-[3]" />
                    <span>¡Perfil Actualizado!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Guardar Cambios de Perfil</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-150 py-4 text-center">
        <p className="text-[11px] text-zinc-400 font-medium">
          Manager pro Sostenible © 2026 • Plataforma Educativa Integrada
        </p>
      </footer>

    </div>
  );
}
