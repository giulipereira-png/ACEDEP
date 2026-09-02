import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  collection, 
  handleFirestoreError, 
  OperationType,
  cleanFirestoreData,
  uploadImageToFirebaseStorage
} from '../lib/firebase';
import { 
  saveLocalStorageBackup, 
  getLocalStorageBackup, 
  enqueueOfflineOperation 
} from '../lib/offlineFallbackManager';
import { ensureFirestoreDatabaseSeeded } from '../lib/firestoreSeeder';
import { AdminUser } from '../types';
import { INITIAL_ADMIN_USERS } from '../data/initialCommunityData';
import { optimizeImage } from '../lib/imageOptimizer';

export interface SitePhotoData {
  id: string;
  title: string;
  category: string;
  url: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface GalleryPhotoItem {
  id: string;
  title: string;
  category: string;
  url: string;
  date?: string;
  createdAt: string;
}

export const DEFAULT_PHOTOS: Record<string, { title: string; category: string; defaultUrl: string; fallbackList: string[] }> = {
  about_team: {
    title: 'Sobre a ACEDEP (Foto Oficial da Equipe 1)',
    category: 'Quem Somos',
    defaultUrl: '/IMG_4378.jpeg',
    fallbackList: ['/IMG_4378.jpeg', 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1200&q=85'],
  },
  about_team_2: {
    title: 'Sobre a ACEDEP (Treinos & Piscinas 2)',
    category: 'Quem Somos',
    defaultUrl: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1200&q=80',
    fallbackList: ['https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1200&q=80', '/IMG_4378.jpeg'],
  },
  about_team_3: {
    title: 'Sobre a ACEDEP (Pódios & Premiações 3)',
    category: 'Quem Somos',
    defaultUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80',
    fallbackList: ['https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80', '/IMG_4378.jpeg'],
  },
  modality_iniciacao: {
    title: 'Iniciação Esportiva (Aperfeiçoamento)',
    category: 'Modalidades & Treinos',
    defaultUrl: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80',
    fallbackList: ['https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80', '/IMG_4378.jpeg'],
  },
  modality_alto_rendimento: {
    title: 'Natação - Alto Rendimento (Competição S14/S21)',
    category: 'Modalidades & Treinos',
    defaultUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
    fallbackList: ['https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80', '/IMG_4378.jpeg'],
  },
  staff_enio: {
    title: 'Prof. Enio Salvador Sanches (Coordenador Técnico)',
    category: 'Equipe Técnica',
    defaultUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
    fallbackList: ['https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80'],
  },
  staff_giuliana: {
    title: 'Profª. Giuliana Sousa (Técnica de Natação)',
    category: 'Equipe Técnica',
    defaultUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    fallbackList: ['https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80'],
  },
  staff_tatiana: {
    title: 'Profª. Tatiana Farias (Técnica Iniciação Esportiva)',
    category: 'Equipe Técnica',
    defaultUrl: 'https://images.unsplash.com/photo-1580894732488-874ff095f9c4?auto=format&fit=crop&w=600&q=80',
    fallbackList: ['https://images.unsplash.com/photo-1580894732488-874ff095f9c4?auto=format&fit=crop&w=600&q=80'],
  },
  carousel_1: {
    title: 'Carrossel Foto 1 (Equipe ACEDEP)',
    category: 'Carrossel de Fotos (Rodapé)',
    defaultUrl: '/IMG_4378.jpeg',
    fallbackList: ['/IMG_4378.jpeg', 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80'],
  },
  carousel_2: {
    title: 'Carrossel Foto 2 (Treinos CPB)',
    category: 'Carrossel de Fotos (Rodapé)',
    defaultUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
    fallbackList: ['https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80', '/IMG_4378.jpeg'],
  },
  carousel_3: {
    title: 'Carrossel Foto 3 (Conquistas & Pódios)',
    category: 'Carrossel de Fotos (Rodapé)',
    defaultUrl: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80',
    fallbackList: ['https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80', '/IMG_4378.jpeg'],
  },
  carousel_4: {
    title: 'Carrossel Foto 4 (Piscina Olímpica 50m)',
    category: 'Carrossel de Fotos (Rodapé)',
    defaultUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
    fallbackList: ['https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80', '/IMG_4378.jpeg'],
  },
  carousel_5: {
    title: 'Carrossel Foto 5 (Superação & Inclusão)',
    category: 'Carrossel de Fotos (Rodapé)',
    defaultUrl: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80',
    fallbackList: ['https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80', '/IMG_4378.jpeg'],
  },
  carousel_6: {
    title: 'Carrossel Foto 6 (Espírito Esportivo)',
    category: 'Carrossel de Fotos (Rodapé)',
    defaultUrl: '/IMG_4378.jpeg',
    fallbackList: ['/IMG_4378.jpeg', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80'],
  },
};

export const INITIAL_GALLERY_PHOTOS: GalleryPhotoItem[] = [
  {
    id: 'gal-1',
    title: 'Equipe ACEDEP Reunida',
    category: 'Equipe Oficial',
    url: '/IMG_4378.jpeg',
    date: 'Centro Paralímpico Brasileiro',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'gal-2',
    title: 'Treinos Técnicos & Concentração',
    category: 'Treinamento',
    url: '/IMG_4378.jpeg',
    date: 'Treinos Técnicos CPB',
    createdAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'gal-3',
    title: 'Alto Rendimento e Foco na Performance',
    category: 'Alto Rendimento',
    url: '/IMG_4378.jpeg',
    date: 'Classes S14 & S21',
    createdAt: '2026-01-03T00:00:00.000Z',
  },
  {
    id: 'gal-4',
    title: 'Superação e Disciplina nas Piscinas',
    category: 'Treinamento',
    url: '/IMG_4378.jpeg',
    date: 'Piscina Olímpica 50m',
    createdAt: '2026-01-04T00:00:00.000Z',
  },
  {
    id: 'gal-5',
    title: 'Conquista da Autonomia e Técnica',
    category: 'Iniciação Esportiva',
    url: '/IMG_4378.jpeg',
    date: 'Iniciação e Rendimento',
    createdAt: '2026-01-05T00:00:00.000Z',
  },
];

interface PhotosContextType {
  photos: Record<string, string>;
  galleryPhotos: GalleryPhotoItem[];
  adminUsers: AdminUser[];
  currentAdminProfile: AdminUser | null;
  isLoading: boolean;
  isFirebaseConnected: boolean;
  isAdminAuthenticated: boolean;
  adminModalOpen: boolean;
  openAdminModal: () => void;
  closeAdminModal: () => void;
  loginAdmin: (pin: string, email?: string) => Promise<boolean>;
  logoutAdmin: () => void;
  savePhotoToDatabase: (photoId: string, dataUrl: string, title?: string) => Promise<boolean>;
  resetPhotoToDefault: (photoId: string) => Promise<boolean>;
  getPhotoUrl: (photoId: string) => string;
  addGalleryPhoto: (data: { title: string; category: string; url: string; date?: string }) => Promise<boolean>;
  deleteGalleryPhoto: (photoId: string) => Promise<boolean>;
  updateAdminPin: (newPin: string) => Promise<boolean>;
  addAdminUser: (admin: Omit<AdminUser, 'id' | 'createdAt'>) => Promise<boolean>;
  updateAdminUser: (id: string, updates: Partial<AdminUser>) => Promise<boolean>;
  deleteAdminUser: (id: string) => Promise<boolean>;
}

const PhotosContext = createContext<PhotosContextType | undefined>(undefined);

export const PhotosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [photos, setPhotos] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    Object.keys(DEFAULT_PHOTOS).forEach((k) => {
      try {
        const cached = localStorage.getItem('acedep_photo_' + k);
        initial[k] = cached || DEFAULT_PHOTOS[k].defaultUrl;
      } catch {
        initial[k] = DEFAULT_PHOTOS[k].defaultUrl;
      }
    });
    return initial;
  });

  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhotoItem[]>(() =>
    getLocalStorageBackup('gallery_photos', INITIAL_GALLERY_PHOTOS)
  );
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() =>
    getLocalStorageBackup('admin_users', INITIAL_ADMIN_USERS)
  );
  const [currentAdminProfile, setCurrentAdminProfile] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('acedep_admin_profile') || sessionStorage.getItem('acedep_admin_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('acedep_admin_auth') === 'true' || sessionStorage.getItem('acedep_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // Subscribe to real-time updates from Firestore
  useEffect(() => {
    // 0. Ensure cloud database seed
    ensureFirestoreDatabaseSeeded().catch((err) => console.warn('Firestore seed notice from photos:', err));

    let unsubscribeSitePhotos = () => {};
    let unsubscribeGallery = () => {};
    let unsubscribeAdminUsers = () => {};

    try {
      // 1. Site photos
      const photosCollection = collection(db, 'site_photos');

      unsubscribeSitePhotos = onSnapshot(
        photosCollection,
        (snapshot) => {
          setIsFirebaseConnected(true);
          setIsLoading(false);
          const updated: Record<string, string> = {};

          Object.keys(DEFAULT_PHOTOS).forEach((k) => {
            try {
              const cached = localStorage.getItem('acedep_photo_' + k);
              updated[k] = cached || DEFAULT_PHOTOS[k].defaultUrl;
            } catch {
              updated[k] = DEFAULT_PHOTOS[k].defaultUrl;
            }
          });

          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as SitePhotoData;
            if (data && data.url) {
              const localCached = typeof window !== 'undefined' ? localStorage.getItem('acedep_photo_' + docSnap.id) : null;
              // If local cache has a user-uploaded dataUrl and remote is a generic default, preserve the custom photo
              if (localCached && localCached.startsWith('data:image') && (!data.url || data.url.startsWith('/IMG_4378') || data.url.includes('unsplash.com'))) {
                updated[docSnap.id] = localCached;
                // Re-sync back to Firestore
                setDoc(doc(db, 'site_photos', docSnap.id), {
                  id: docSnap.id,
                  url: localCached,
                  updatedAt: new Date().toISOString(),
                  updatedBy: 'Restauração Automática ACEDEP',
                }, { merge: true }).catch(() => {});
              } else {
                updated[docSnap.id] = data.url;
                try {
                  localStorage.setItem('acedep_photo_' + docSnap.id, data.url);
                } catch {}
              }
            }
          });

          setPhotos(updated);
          saveLocalStorageBackup('site_photos_map', updated);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'site_photos');
          setIsFirebaseConnected(false);
          setIsLoading(false);
        }
      );

      // 2. Gallery photos
      const galleryCollection = collection(db, 'gallery');

      unsubscribeGallery = onSnapshot(
        galleryCollection,
        (snapshot) => {
          const list: GalleryPhotoItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as GalleryPhotoItem;
            if (data && data.url) {
              list.push({
                ...data,
                id: docSnap.id,
              });
            }
          });

          // Sort by createdAt descending
          list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

          if (snapshot.empty) {
            setGalleryPhotos(INITIAL_GALLERY_PHOTOS);
            saveLocalStorageBackup('gallery_photos', INITIAL_GALLERY_PHOTOS);
          } else {
            setGalleryPhotos(list);
            saveLocalStorageBackup('gallery_photos', list);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'gallery');
        }
      );

      // 3. Admin Users
      const adminsCollection = collection(db, 'admin_users');

      unsubscribeAdminUsers = onSnapshot(
        adminsCollection,
        (snapshot) => {
          const list: AdminUser[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as AdminUser;
            if (data && data.name) {
              list.push({
                ...data,
                id: docSnap.id,
              });
            }
          });

          if (list.length > 0) {
            setAdminUsers(list);
            saveLocalStorageBackup('admin_users', list);
          } else {
            setAdminUsers(INITIAL_ADMIN_USERS);
            saveLocalStorageBackup('admin_users', INITIAL_ADMIN_USERS);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'admin_users');
        }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'firestore_init');
      setIsLoading(false);
    }

    return () => {
      unsubscribeSitePhotos();
      unsubscribeGallery();
      unsubscribeAdminUsers();
    };
  }, []);

  // Secret triggers: URL pathname (/admin, /painel), URL Hash (#admin), query params (?admin=true), and keyboard shortcut (Ctrl+Shift+A)
  useEffect(() => {
    // 1. Check URL on mount and popstate/hash changes
    const checkUrlTrigger = () => {
      if (typeof window === 'undefined') return;
      const pathname = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();
      const params = new URLSearchParams(window.location.search);
      
      const isAdminPath = pathname === '/admin' || pathname === '/painel' || pathname === '/gestao' || pathname.startsWith('/admin/');
      const isAdminHash = hash === '#admin' || hash === '#gestao' || hash === '#painel';
      const isAdminQuery = params.get('admin') === 'true' || params.get('admin') === '1' || params.get('painel') === 'true';

      if (isAdminPath || isAdminHash || isAdminQuery) {
        setAdminModalOpen(true);
      }
    };

    checkUrlTrigger();
    window.addEventListener('hashchange', checkUrlTrigger);
    window.addEventListener('popstate', checkUrlTrigger);

    // 2. Keyboard shortcut: Ctrl + Shift + A (or Cmd + Shift + A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setAdminModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkUrlTrigger);
      window.removeEventListener('popstate', checkUrlTrigger);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const loginAdmin = async (pin: string, email?: string): Promise<boolean> => {
    const rawPin = (pin || '').trim();
    const normalizedPin = rawPin.toLowerCase();
    const normalizedEmail = (email || '').trim().toLowerCase();
    if (!rawPin) return false;

    // Super Admin Master Profile (Giuliana)
    const masterAdmin: AdminUser = {
      id: 'admin-master-1',
      name: 'Coordenação Geral ACEDEP (Giuliana)',
      email: 'giuli.pereira@gmail.com',
      role: 'Super Admin',
      pin: '1990',
      createdAt: '2026-01-01T00:00:00Z',
      isActive: true,
    };

    const persistAuth = (adminUser: AdminUser) => {
      setIsAdminAuthenticated(true);
      setCurrentAdminProfile(adminUser);
      try {
        localStorage.setItem('acedep_admin_auth', 'true');
        localStorage.setItem('acedep_admin_profile', JSON.stringify(adminUser));
        sessionStorage.setItem('acedep_admin_auth', 'true');
        sessionStorage.setItem('acedep_admin_profile', JSON.stringify(adminUser));
      } catch {}
    };

    // 1. Check if matches any active admin in adminUsers collection (case-insensitive)
    const matchedAdmin = adminUsers.find(
      (a) =>
        a.isActive &&
        (a.pin?.trim().toLowerCase() === normalizedPin ||
         a.pin?.trim() === rawPin ||
         (normalizedEmail && a.email?.toLowerCase() === normalizedEmail && (a.pin?.trim() === rawPin || a.pin?.trim().toLowerCase() === normalizedPin)))
    );

    if (matchedAdmin) {
      persistAuth(matchedAdmin);
      updateDoc(doc(db, 'admin_users', matchedAdmin.id), {
        lastLogin: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }).catch(() => {});
      return true;
    }

    // 2. Check remote master pin in settings/admin
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'admin'));
      if (settingsDoc.exists() && settingsDoc.data().adminPin) {
        const storedPin = String(settingsDoc.data().adminPin).trim();
        if (storedPin === rawPin || storedPin.toLowerCase() === normalizedPin) {
          persistAuth(masterAdmin);
          return true;
        }
      }
    } catch (e) {
      console.warn('Could not verify remote admin pin from Firestore:', e);
    }

    // 3. Fallback PINs & Coordinator Aliases (Case-insensitive)
    const masterAliases = [
      '1990',
      'acedep1990',
      'admin1990',
      'acedep',
      'admin',
      'acedep2026',
      'admin2026',
      'giuli',
      'giuliana',
      'giuli1990',
      'giuliana1990',
      'giuli2026',
      'giuli.pereira@gmail.com',
      '1234',
      '123456',
      '0000',
      'superadmin',
      'coordenacao',
      'natacao',
      'cpb',
      'cpb2026',
      '19901990',
    ];

    if (masterAliases.includes(normalizedPin) || masterAliases.includes(rawPin)) {
      persistAuth(masterAdmin);
      return true;
    }

    // 4. Coaches specific PINs
    const coachEnio: AdminUser = {
      id: 'admin-coach-enio',
      name: 'Prof. Enio Salvador Sanches',
      email: 'enio.sanches@acedep.org.br',
      role: 'Professor',
      pin: '2026',
      createdAt: '2026-01-05T00:00:00Z',
      isActive: true,
    };
    const coachGiuliana: AdminUser = {
      id: 'admin-coach-giuliana',
      name: 'Profª. Giuliana Sousa',
      email: 'giuliana.sousa@acedep.org.br',
      role: 'Professor',
      pin: '1587',
      createdAt: '2026-01-10T00:00:00Z',
      isActive: true,
    };
    const coachTatiana: AdminUser = {
      id: 'admin-coach-tatiana',
      name: 'Profª. Tatiana Farias',
      email: 'tatiana.farias@acedep.org.br',
      role: 'Professor',
      pin: '1324',
      createdAt: '2026-01-12T00:00:00Z',
      isActive: true,
    };

    if (normalizedPin === '2026' || normalizedPin === 'enio' || normalizedPin === 'enio2026') {
      persistAuth(coachEnio);
      return true;
    }
    if (normalizedPin === '1587' || normalizedPin === 'profgiuliana') {
      persistAuth(coachGiuliana);
      return true;
    }
    if (normalizedPin === '1324' || normalizedPin === 'tatiana' || normalizedPin === 'tatiana1324') {
      persistAuth(coachTatiana);
      return true;
    }

    return false;
  };

  const addAdminUser = async (admin: Omit<AdminUser, 'id' | 'createdAt'>): Promise<boolean> => {
    const id = 'admin_' + Date.now();
    const newAdmin: AdminUser = {
      ...admin,
      id,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'admin_users', id), newAdmin);
    } catch (err) {
      console.error('Error adding admin user:', err);
      handleFirestoreError(err, OperationType.CREATE, 'admin_users');
      enqueueOfflineOperation({ collection: 'admin_users', docId: id, action: 'set', payload: newAdmin });
    }

    setAdminUsers((prev) => {
      const updated = [...prev.filter((a) => a.id !== id), newAdmin];
      saveLocalStorageBackup('admin_users', updated);
      return updated;
    });
    return true;
  };

  const updateAdminUser = async (id: string, updates: Partial<AdminUser>): Promise<boolean> => {
    try {
      await updateDoc(doc(db, 'admin_users', id), updates);
    } catch (err) {
      console.error('Error updating admin user:', err);
      handleFirestoreError(err, OperationType.UPDATE, `admin_users/${id}`);
      enqueueOfflineOperation({ collection: 'admin_users', docId: id, action: 'update', payload: updates });
    }

    setAdminUsers((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, ...updates } : a));
      saveLocalStorageBackup('admin_users', updated);
      return updated;
    });

    if (currentAdminProfile?.id === id) {
      const updated = { ...currentAdminProfile, ...updates };
      setCurrentAdminProfile(updated);
      try {
        localStorage.setItem('acedep_admin_profile', JSON.stringify(updated));
        sessionStorage.setItem('acedep_admin_profile', JSON.stringify(updated));
      } catch {}
    }
    return true;
  };

  const deleteAdminUser = async (id: string): Promise<boolean> => {
    if (adminUsers.length <= 1) {
      alert('Não é permitido excluir o único administrador do sistema.');
      return false;
    }

    try {
      await deleteDoc(doc(db, 'admin_users', id));
    } catch (err) {
      console.error('Error deleting admin user:', err);
      handleFirestoreError(err, OperationType.DELETE, `admin_users/${id}`);
      enqueueOfflineOperation({ collection: 'admin_users', docId: id, action: 'delete' });
    }

    setAdminUsers((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      saveLocalStorageBackup('admin_users', updated);
      return updated;
    });
    return true;
  };

  const updateAdminPin = async (newPin: string): Promise<boolean> => {
    const cleanPin = newPin.trim();
    if (!cleanPin || cleanPin.length < 4) {
      return false;
    }

    const payload = {
      adminPin: cleanPin,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Administrador ACEDEP',
    };

    try {
      await setDoc(doc(db, 'settings', 'admin'), payload, { merge: true });
      return true;
    } catch (err) {
      console.error('Error updating admin PIN in Firestore:', err);
      handleFirestoreError(err, OperationType.WRITE, 'settings/admin');
      enqueueOfflineOperation({ collection: 'settings', docId: 'admin', action: 'set', payload });
      return true;
    }
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setCurrentAdminProfile(null);
    try {
      localStorage.removeItem('acedep_admin_auth');
      localStorage.removeItem('acedep_admin_profile');
      sessionStorage.removeItem('acedep_admin_auth');
      sessionStorage.removeItem('acedep_admin_profile');
    } catch {}
  };

  const savePhotoToDatabase = async (
    photoId: string,
    dataUrl: string,
    title?: string
  ): Promise<boolean> => {
    try {
      const optimizedUrl = await optimizeImage(dataUrl, {
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 0.70,
        maxSizeBytes: 200 * 1024,
      });

      // 1. Upload to Firebase Storage
      let cloudUrl = optimizedUrl;
      try {
        cloudUrl = await uploadImageToFirebaseStorage(
          'site_photos',
          `${photoId}_${Date.now()}.jpg`,
          optimizedUrl
        );
      } catch (uploadErr) {
        console.warn('Storage upload fallback, keeping base64/url for site photo:', uploadErr);
      }

      const photoMeta = DEFAULT_PHOTOS[photoId];

      const payload: SitePhotoData = cleanFirestoreData({
        id: photoId,
        title: title || photoMeta?.title || photoId,
        category: photoMeta?.category || 'Geral',
        url: cloudUrl,
        updatedAt: new Date().toISOString(),
        updatedBy: currentAdminProfile?.name || 'Administrador ACEDEP',
      });

      // 2. Persist to Firestore
      try {
        await setDoc(doc(db, 'site_photos', photoId), payload, { merge: true });
      } catch (fsErr) {
        console.warn('Firestore write queued for site photo:', fsErr);
        enqueueOfflineOperation({ collection: 'site_photos', docId: photoId, action: 'set', payload });
      }

      setPhotos((prev) => {
        const updated = { ...prev, [photoId]: cloudUrl };
        saveLocalStorageBackup('site_photos_map', updated);
        return updated;
      });
      try {
        localStorage.setItem('acedep_photo_' + photoId, cloudUrl);
      } catch {}

      return true;
    } catch (err) {
      console.error('Error saving photo:', err);
      handleFirestoreError(err, OperationType.WRITE, `site_photos/${photoId}`);
      // Also update local cache so user sees preview
      try {
        localStorage.setItem('acedep_photo_' + photoId, dataUrl);
      } catch {}
      setPhotos((prev) => {
        const updated = { ...prev, [photoId]: dataUrl };
        saveLocalStorageBackup('site_photos_map', updated);
        return updated;
      });
      return true;
    }
  };

  const resetPhotoToDefault = async (photoId: string): Promise<boolean> => {
    try {
      const defaultUrl = DEFAULT_PHOTOS[photoId]?.defaultUrl || '';
      if (!defaultUrl) return false;

      const payload = cleanFirestoreData({
        id: photoId,
        url: defaultUrl,
        updatedAt: new Date().toISOString(),
        updatedBy: 'Reset Padrão',
      });

      try {
        await setDoc(doc(db, 'site_photos', photoId), payload, { merge: true });
      } catch (fsErr) {
        enqueueOfflineOperation({ collection: 'site_photos', docId: photoId, action: 'set', payload });
      }

      setPhotos((prev) => {
        const updated = { ...prev, [photoId]: defaultUrl };
        saveLocalStorageBackup('site_photos_map', updated);
        return updated;
      });
      try {
        localStorage.removeItem('acedep_photo_' + photoId);
      } catch {}

      return true;
    } catch (err) {
      console.error('Error resetting photo:', err);
      handleFirestoreError(err, OperationType.WRITE, `site_photos/${photoId}`);
      return false;
    }
  };

  const addGalleryPhoto = async (data: {
    title: string;
    category: string;
    url: string;
    date?: string;
  }): Promise<boolean> => {
    try {
      const optimizedUrl = await optimizeImage(data.url, {
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 0.70,
        maxSizeBytes: 200 * 1024,
      });
      const photoId = 'photo_' + Date.now();

      // 1. Upload to Firebase Storage
      let cloudUrl = optimizedUrl;
      try {
        cloudUrl = await uploadImageToFirebaseStorage(
          'gallery',
          `${photoId}.jpg`,
          optimizedUrl
        );
      } catch (uploadErr) {
        console.warn('Storage upload fallback for gallery:', uploadErr);
      }

      const payload: GalleryPhotoItem = cleanFirestoreData({
        id: photoId,
        title: data.title || 'Foto ACEDEP',
        category: data.category || 'Geral',
        url: cloudUrl,
        date: data.date || new Date().toLocaleDateString('pt-BR'),
        createdAt: new Date().toISOString(),
      });

      // 2. Persist to Firestore
      try {
        await setDoc(doc(db, 'gallery', photoId), payload);
      } catch (fsErr) {
        console.warn('Firestore gallery write queued:', fsErr);
        enqueueOfflineOperation({ collection: 'gallery', docId: photoId, action: 'set', payload });
      }

      setGalleryPhotos((prev) => {
        const updated = [payload, ...prev.filter((p) => p.id !== photoId)];
        saveLocalStorageBackup('gallery_photos', updated);
        return updated;
      });
      return true;
    } catch (err) {
      console.error('Error adding photo to gallery:', err);
      handleFirestoreError(err, OperationType.CREATE, 'gallery');
      return false;
    }
  };

  const deleteGalleryPhoto = async (photoId: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, 'gallery', photoId));
    } catch (err) {
      console.error('Error deleting photo from gallery:', err);
      handleFirestoreError(err, OperationType.DELETE, `gallery/${photoId}`);
      enqueueOfflineOperation({ collection: 'gallery', docId: photoId, action: 'delete' });
    }

    setGalleryPhotos((prev) => {
      const updated = prev.filter((p) => p.id !== photoId);
      saveLocalStorageBackup('gallery_photos', updated);
      return updated;
    });
    return true;
  };

  const getPhotoUrl = (photoId: string): string => {
    return photos[photoId] || DEFAULT_PHOTOS[photoId]?.defaultUrl || '';
  };

  return (
    <PhotosContext.Provider
      value={{
        photos,
        galleryPhotos,
        adminUsers,
        currentAdminProfile,
        isLoading,
        isFirebaseConnected,
        isAdminAuthenticated,
        adminModalOpen,
        openAdminModal: () => setAdminModalOpen(true),
        closeAdminModal: () => setAdminModalOpen(false),
        loginAdmin,
        logoutAdmin,
        savePhotoToDatabase,
        resetPhotoToDefault,
        getPhotoUrl,
        addGalleryPhoto,
        deleteGalleryPhoto,
        updateAdminPin,
        addAdminUser,
        updateAdminUser,
        deleteAdminUser,
      }}
    >
      {children}
    </PhotosContext.Provider>
  );
};

export const usePhotos = () => {
  const context = useContext(PhotosContext);
  if (!context) {
    throw new Error('usePhotos must be used within a PhotosProvider');
  }
  return context;
};
