import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { 
  Menu, 
  X, 
  HeartHandshake, 
  MapPin, 
  Phone, 
  Mail, 
  ChevronRight, 
  ShieldCheck, 
  Lock, 
  UserCheck,
  UserPlus
} from 'lucide-react';
import { usePhotos } from '../context/PhotosContext';
import { useCommunity } from '../context/CommunityContext';

interface NavbarProps {
  onOpenSupportModal: () => void;
  onOpenContactModal: () => void;
  onOpenMemberPortal: () => void;
  onOpenCalendarModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSupportModal,
  onOpenContactModal,
  onOpenMemberPortal,
  onOpenCalendarModal,
}) => {
  const { openAdminModal, isAdminAuthenticated } = usePhotos();
  const { isGuardianAuthenticated, currentAthlete, setCoachManagerModalOpen } = useCommunity();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Active section tracker
      const sections = ['home', 'sobre', 'modalidades', 'calendario', 'equipe', 'galeria', 'comunidade', 'faq', 'contato'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Nossa História', href: '#sobre' },
    { name: 'Modalidades', href: '#modalidades' },
    { name: 'Calendário', href: '#calendario' },
    { name: 'Nossa Equipe', href: '#equipe' },
    { name: 'Galeria', href: '#galeria' },
    { name: 'Comunidade & Notícias', href: '#comunidade' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contato', href: '#contato' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Top Institutional Bar */}
      <div className={`bg-[#060e1c] border-b border-slate-800/80 text-xs text-slate-300 transition-all duration-300 ${
        isScrolled ? 'hidden md:hidden' : 'block'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5 text-[#d4af37] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Instituição Fundada em 1990
            </span>
            <span className="hidden sm:inline-block text-slate-500">•</span>
            <span className="hidden sm:flex items-center gap-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
              Polo: Centro Paralímpico Brasileiro (São Paulo - SP)
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <a 
              href="mailto:giuli.pereira@gmail.com" 
              className="hidden md:flex items-center gap-1 text-slate-300 hover:text-[#d4af37] transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[#d4af37]" />
              giuli.pereira@gmail.com
            </a>
            <a 
              href="tel:11998809708"
              className="flex items-center gap-1 text-slate-300 hover:text-[#d4af37] transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
              (11) 99880-9708
            </a>

            {/* Admin shortcut ONLY visible when already authenticated */}
            {isAdminAuthenticated && (
              <button
                onClick={openAdminModal}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer bg-[#d4af37]/20 text-[#f3e5ab] border border-[#d4af37]/40 hover:bg-[#d4af37]/30"
                title="Painel de Administração Ativo"
              >
                <Lock className="w-3 h-3 text-[#d4af37]" />
                <span className="hidden sm:inline">Admin (Ativo)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav
        className={`transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0a192f]/95 backdrop-blur-md shadow-xl shadow-black/30 border-b border-[#1e3a5f]/80 py-3'
            : 'bg-gradient-to-b from-[#0a192f]/95 to-[#0a192f]/80 backdrop-blur-sm border-b border-white/5 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#home"
            id="nav-logo-link"
            className="flex items-center gap-2 group transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
            title="ACEDEP Paradesporto"
          >
            <Logo variant="horizontal" className="h-12 md:h-14" />
          </a>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((link) => {
              const isCalendar = link.name === 'Calendário';
              const isActive = !isCalendar && activeSection === link.href.replace('#', '');

              if (isCalendar && onOpenCalendarModal) {
                return (
                  <button
                    key={link.name}
                    type="button"
                    onClick={onOpenCalendarModal}
                    id={`nav-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="px-3 py-2 text-sm font-semibold tracking-wide rounded-md text-slate-200 hover:text-[#d4af37] hover:bg-white/5 transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{link.name}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></span>
                  </button>
                );
              }

              return (
                <a
                  key={link.name}
                  href={link.href}
                  id={`nav-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`px-3 py-2 text-sm font-semibold tracking-wide rounded-md transition-all duration-200 ${
                    isActive
                      ? 'text-[#d4af37] bg-white/5 shadow-inner'
                      : 'text-slate-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
          </div>

          {/* Action Button & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Portal do Responsável Button */}
            <button
              id="btn-portal-responsavel-nav"
              onClick={onOpenMemberPortal}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                isGuardianAuthenticated
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30 shadow-md'
                  : 'bg-[#0f284a] hover:bg-[#163866] text-[#f3e5ab] border-[#1e3a5f] hover:border-[#d4af37]'
              }`}
              title={isGuardianAuthenticated ? `Portal: ${currentAthlete?.name}` : 'Acesso Individual do Responsável'}
            >
              <UserCheck className={`w-4 h-4 ${isGuardianAuthenticated ? 'text-emerald-400' : 'text-[#d4af37]'}`} />
              <span className="hidden sm:inline">
                {isGuardianAuthenticated ? `Portal (${currentAthlete?.name?.split(' ')[0]})` : 'Portal do Responsável'}
              </span>
              <span className="sm:hidden">
                {isGuardianAuthenticated ? 'Portal' : 'Responsável'}
              </span>
            </button>

            <button
              id="btn-seja-apoiador-nav"
              onClick={onOpenSupportModal}
              className="relative group overflow-hidden rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e5c058] to-[#c49e29] px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-[#060e1c] shadow-lg shadow-[#d4af37]/20 hover:shadow-[#d4af37]/40 transition-all duration-200 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <HeartHandshake className="w-4 h-4 text-[#060e1c] group-hover:scale-110 transition-transform duration-200" />
              <span className="hidden sm:inline">Seja um Apoiador</span>
              <span className="sm:hidden">Apoiar</span>
            </button>

            {/* Mobile menu button */}
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-slate-300 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#d4af37] cursor-pointer"
              aria-label="Abrir menu principal"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div 
          id="mobile-drawer-menu"
          className="lg:hidden bg-[#060e1c]/98 border-b border-[#1e3a5f] backdrop-blur-xl px-4 pt-3 pb-6 shadow-2xl transition-all animate-fadeIn"
        >
          <div className="space-y-1 divide-y divide-white/5">
            <div className="py-2 space-y-1">
              {navLinks.map((link) => {
                const isCalendar = link.name === 'Calendário';

                if (isCalendar && onOpenCalendarModal) {
                  return (
                    <button
                      key={link.name}
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenCalendarModal();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-base font-medium text-[#d4af37] bg-white/5 hover:bg-white/10 text-left cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span>{link.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f3e5ab]">
                          Eventos 2026
                        </span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#d4af37]" />
                    </button>
                  );
                }

                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-md text-base font-medium text-slate-200 hover:text-[#d4af37] hover:bg-white/5"
                  >
                    <span>{link.name}</span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </a>
                );
              })}
            </div>

            <div className="pt-4 space-y-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenMemberPortal();
                }}
                className="w-full py-3 bg-[#0f284a] border border-[#1e3a5f] text-[#f3e5ab] font-bold rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-[#d4af37]" />
                <span>{isGuardianAuthenticated ? `Ver Portal de ${currentAthlete?.name}` : 'Acessar Portal do Responsável'}</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSupportModal();
                }}
                className="w-full py-3 bg-[#d4af37] text-[#060e1c] font-bold rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <HeartHandshake className="w-4 h-4" />
                Seja um Apoiador / Patrocinador
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenContactModal();
                }}
                className="w-full py-2.5 border border-slate-700 hover:border-[#d4af37] text-slate-300 hover:text-[#d4af37] font-semibold text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                Fale Conosco / Avaliação
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

