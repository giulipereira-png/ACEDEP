/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { StatsImpact } from './components/StatsImpact';
import { AboutSection } from './components/AboutSection';
import { ModalitiesSection } from './components/ModalitiesSection';
import { AthletesShowcase } from './components/AthletesShowcase';
import { PhotoGallery } from './components/PhotoGallery';
import { CommunitySection } from './components/CommunitySection';
import { CtaSection } from './components/CtaSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { SupportModal } from './components/SupportModal';
import { ContactModal } from './components/ContactModal';
import { AthleteEnrollmentModal } from './components/AthleteEnrollmentModal';
import { PhotosProvider } from './context/PhotosContext';
import { CommunityProvider } from './context/CommunityContext';
import { AdminPhotoManagerModal } from './components/AdminPhotoManagerModal';
import { MemberPortalModal } from './components/MemberPortalModal';
import { AdminCoachPortalModal } from './components/AdminCoachPortalModal';
import { CommunityNewsModal } from './components/CommunityNewsModal';

export default function App() {
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [memberPortalOpen, setMemberPortalOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <PhotosProvider>
      <CommunityProvider>
        <div className="min-h-screen bg-[#0a192f] text-slate-100 selection:bg-[#d4af37] selection:text-[#060e1c]">
          {/* Header & Navbar */}
          <Navbar
            onOpenSupportModal={() => setSupportModalOpen(true)}
            onOpenContactModal={() => setContactModalOpen(true)}
            onOpenMemberPortal={() => setMemberPortalOpen(true)}
          />

          {/* Main Content Area */}
          <main>
            {/* 1. Hero Section */}
            <Hero
              onOpenSupportModal={() => setSupportModalOpen(true)}
              onOpenContactModal={() => setContactModalOpen(true)}
              onOpenEnrollModal={() => setEnrollModalOpen(true)}
            />

            {/* 2. About Section (Nossa História / Quem Somos) */}
            <AboutSection />

            {/* 3. Modalities & Training Programs (Natação S14) */}
            <ModalitiesSection onOpenEnrollModal={() => setEnrollModalOpen(true)} />

            {/* 4. Athletes & Technical Staff (Nossa Equipe) */}
            <AthletesShowcase />

            {/* 5. Photo Gallery (Galeria de Fotos) */}
            <PhotoGallery />

            {/* 6. Community & News Section (Mural de Notícias & Comunidade) */}
            <CommunitySection />

            {/* 7. Impact & Structure (Excelência & Conquistas) */}
            <StatsImpact onOpenNucleos={() => scrollToSection('modalidades')} />

            {/* 8. Call To Action (Novos Atletas / Apoiadores) */}
            <CtaSection
              onOpenSupportModal={() => setSupportModalOpen(true)}
              onOpenEnrollModal={() => setEnrollModalOpen(true)}
            />

            {/* 9. Perguntas Frequentes (FAQ Compacto no final da página) */}
            <FaqSection
              onOpenContactModal={() => setContactModalOpen(true)}
              onOpenEnrollModal={() => setEnrollModalOpen(true)}
            />
          </main>

          {/* 10. Footer (Rodapé) */}
          <Footer
            onOpenSupportModal={() => setSupportModalOpen(true)}
            onOpenContactModal={() => setContactModalOpen(true)}
            onOpenMemberPortal={() => setMemberPortalOpen(true)}
          />

          {/* Interactive Modals */}
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

          {/* Admin Photo Manager Modal */}
          <AdminPhotoManagerModal />
        </div>
      </CommunityProvider>
    </PhotosProvider>
  );
}

