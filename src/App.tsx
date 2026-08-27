/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { ModalitiesSection } from './components/ModalitiesSection';
import { NewsAndCheersLanding } from './components/NewsAndCheersLanding';
import { CompactPhotoGallery } from './components/CompactPhotoGallery';
import { ExploreHubSection } from './components/ExploreHubSection';
import { CtaSection } from './components/CtaSection';
import { Footer } from './components/Footer';

// Full Dedicated Pages
import { TeamPage } from './pages/TeamPage';
import { CalendarPage } from './pages/CalendarPage';
import { GalleryPage } from './pages/GalleryPage';
import { FaqPage } from './pages/FaqPage';
import { CommunityPage } from './pages/CommunityPage';

// Action & Portal Modals
import { SupportModal } from './components/SupportModal';
import { ContactModal } from './components/ContactModal';
import { AthleteEnrollmentModal } from './components/AthleteEnrollmentModal';
import { MemberPortalModal } from './components/MemberPortalModal';
import { AdminCoachPortalModal } from './components/AdminCoachPortalModal';
import { CommunityNewsModal } from './components/CommunityNewsModal';

import { PhotosProvider } from './context/PhotosContext';
import { CommunityProvider } from './context/CommunityContext';

export type AppPage = 'home' | 'equipe' | 'calendario' | 'galeria' | 'faq' | 'comunidade';

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('home');

  // Action Modals
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [memberPortalOpen, setMemberPortalOpen] = useState(false);

  const handleNavigateToPage = (page: AppPage) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PhotosProvider>
      <CommunityProvider>
        <div className="min-h-screen bg-[#060e1c] text-slate-100 selection:bg-[#d4af37] selection:text-[#060e1c]">
          {/* Header & Navbar */}
          <Navbar
            currentPage={currentPage}
            onNavigateToPage={handleNavigateToPage}
            onOpenSupportModal={() => setSupportModalOpen(true)}
            onOpenContactModal={() => setContactModalOpen(true)}
            onOpenMemberPortal={() => setMemberPortalOpen(true)}
          />

          {/* Main Content Area: Conditional rendering based on active Page */}
          <main>
            {currentPage === 'home' && (
              <>
                {/* 1. Hero Section */}
                <Hero
                  onOpenSupportModal={() => setSupportModalOpen(true)}
                  onOpenContactModal={() => setContactModalOpen(true)}
                  onOpenEnrollModal={() => setEnrollModalOpen(true)}
                />

                {/* 2. About Section (Nossa História / Quem Somos) */}
                <AboutSection />

                {/* 3. Modalities & Training Programs (Natação S14 & Grade Horária) */}
                <ModalitiesSection onOpenEnrollModal={() => setEnrollModalOpen(true)} />

                {/* 4. Notícias Recentes & Mural de Recados da Torcida (Carrossel Compacto + Manchetes) */}
                <NewsAndCheersLanding 
                  onOpenCommunityModal={() => handleNavigateToPage('comunidade')}
                />

                {/* 5. Galeria de Fotos Compacta (Preview na Landing Page) */}
                <CompactPhotoGallery
                  onOpenFullGallery={() => handleNavigateToPage('galeria')}
                />

                {/* 6. Explore Hub Section (Navegação Rápida para Páginas Dedicadas) */}
                <ExploreHubSection
                  onNavigateToPage={handleNavigateToPage}
                  onOpenSupportModal={() => setSupportModalOpen(true)}
                />

                {/* 7. Call To Action (Novos Atletas / Apoiadores) */}
                <CtaSection
                  onOpenSupportModal={() => setSupportModalOpen(true)}
                  onOpenEnrollModal={() => setEnrollModalOpen(true)}
                />
              </>
            )}

            {/* Dedicated Page: Nossa Equipe & Atletas */}
            {currentPage === 'equipe' && (
              <TeamPage
                onBackToHome={() => handleNavigateToPage('home')}
                onOpenEnrollModal={() => setEnrollModalOpen(true)}
                onOpenSupportModal={() => setSupportModalOpen(true)}
                onNavigateToPage={handleNavigateToPage}
              />
            )}

            {/* Dedicated Page: Calendário Oficial 2026 */}
            {currentPage === 'calendario' && (
              <CalendarPage
                onBackToHome={() => handleNavigateToPage('home')}
                onOpenEnrollModal={() => setEnrollModalOpen(true)}
                onNavigateToPage={handleNavigateToPage}
              />
            )}

            {/* Dedicated Page: Galeria de Fotos Completa */}
            {currentPage === 'galeria' && (
              <GalleryPage
                onBackToHome={() => handleNavigateToPage('home')}
                onOpenSupportModal={() => setSupportModalOpen(true)}
                onNavigateToPage={handleNavigateToPage}
              />
            )}

            {/* Dedicated Page: FAQ (Dúvidas Frequentes) */}
            {currentPage === 'faq' && (
              <FaqPage
                onBackToHome={() => handleNavigateToPage('home')}
                onOpenContactModal={() => setContactModalOpen(true)}
                onOpenEnrollModal={() => setEnrollModalOpen(true)}
                onNavigateToPage={handleNavigateToPage}
              />
            )}

            {/* Dedicated Page: Mural & Comunidade */}
            {currentPage === 'comunidade' && (
              <CommunityPage
                onBackToHome={() => handleNavigateToPage('home')}
                onOpenSupportModal={() => setSupportModalOpen(true)}
                onNavigateToPage={handleNavigateToPage}
              />
            )}
          </main>

          {/* Footer (Rodapé Institucional) */}
          <Footer
            onNavigateToPage={handleNavigateToPage}
            onOpenSupportModal={() => setSupportModalOpen(true)}
            onOpenContactModal={() => setContactModalOpen(true)}
            onOpenMemberPortal={() => setMemberPortalOpen(true)}
          />

          {/* Action Modals */}
          <SupportModal
            isOpen={supportModalOpen}
            onClose={() => setSupportModalOpen(false)}
          />

          <ContactModal
            isOpen={contactModalOpen}
            onClose={() => setContactModalOpen(false)}
          />

          <AthleteEnrollmentModal
            isOpen={enrollModalOpen}
            onClose={() => setEnrollModalOpen(false)}
          />

          {/* Individual Member / Guardian Portal Modal */}
          <MemberPortalModal
            isOpen={memberPortalOpen}
            onClose={() => setMemberPortalOpen(false)}
          />

          {/* News Article Reader Modal */}
          <CommunityNewsModal />

          {/* Coach & Admin Management Portal Modal */}
          <AdminCoachPortalModal />
        </div>
      </CommunityProvider>
    </PhotosProvider>
  );
}

