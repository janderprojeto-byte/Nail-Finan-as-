
import React, { useState } from 'react';
import { Sparkles, Lock, Mail, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (userName: string, email: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const savedUser = localStorage.getItem(`user_${email.toLowerCase().trim()}`);
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (userData.password === password) {
          onLogin(userData.name, email.toLowerCase().trim());
        } else {
          setError('Senha incorreta. Tente novamente.');
        }
      } else {
        setError('E-mail não encontrado. Crie uma conta primeiro.');
      }
    } else {
      if (!name || !email || !password) {
        setError('Preencha todos os campos.');
        return;
      }
      const userData = { name, email: email.toLowerCase().trim(), password };
      localStorage.setItem(`user_${email.toLowerCase().trim()}`, JSON.stringify(userData));
      onLogin(name, email.toLowerCase().trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFD] p-4 relative overflow-hidden">
      {/* Marca d'água Dinâmica */}
      <div className="watermark-bg top-0 left-0">Expert Finanças</div>
      <div className="watermark-bg bottom-0 right-0 opacity-[0.02]" style={{ animationDelay: '-10s' }}>Stúdio de Unhas</div>

      {/* Elementos Decorativos de Fundo */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-vibrantPink-100/30 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/30 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-white rounded-[32px] shadow-xl shadow-vibrantPink-100 mb-6 glow-pink">
            <Sparkles className="w-10 h-10 text-vibrantPink-500" />
          </div>
          <h1 className="text-4xl font-display font-bold wave-text tracking-tight">Expert Finanças</h1>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-[0.3em] mt-2">Gestão para Nail Designers</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[48px] shadow-2xl border border-white/50">
          <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8">
            <button 
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase transition-all ${isLogin ? 'bg-white text-vibrantPink-600 shadow-md scale-[1.02]' : 'text-gray-400'}`}
            >
              <LogIn size={14} /> Entrar
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase transition-all ${!isLogin ? 'bg-white text-vibrantPink-600 shadow-md scale-[1.02]' : 'text-gray-400'}`}
            >
              <UserPlus size={14} /> Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Seu Nome Profissional</label>
                <div className="relative">
                  <input 
                    required 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Ana Silva Nails"
                    className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-vibrantPink-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail de Acesso</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input 
                  required 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-5 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-vibrantPink-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sua Senha</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input 
                  required 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-vibrantPink-500 outline-none transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-vibrantPink-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-[10px] font-bold text-center bg-red-50 py-2 rounded-lg border border-red-100">
                {error}
              </p>
            )}

            <button 
              type="submit"
              className="w-full py-4 bg-vibrantPink-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-vibrantPink-100 hover:bg-vibrantPink-600 active:scale-95 transition-all mt-4"
            >
              {isLogin ? 'Acessar Stúdio' : 'Criar minha Conta'}
            </button>
          </form>

          <p className="mt-8 text-center text-[10px] text-gray-400 font-medium">
            Seus dados são armazenados localmente com total discrição e segurança. Use o botão de Backup para salvar fora do navegador.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
