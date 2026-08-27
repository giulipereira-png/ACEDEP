import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, doc, getDoc, setDoc, deleteDoc, onSnapshot, collection, handleFirestoreError, OperationType } from '../lib/firebase';

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
    title: 'Sobre a ACEDEP (Equipe Oficial)',
    category: 'Quem Somos',
    defaultUrl: '/IMG_4378.jpeg',
    fallbackList: ['/IMG_4378.jpeg', '/IMG_4378.jpg', 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1200&q=85'],
  },
  modality_iniciacao: {
    title: 'Iniciação Esportiva (Aperfeiçoamento)',
    category: 'Modalidades & Treinos',
    defaultUrl: '/IMG_2382.jpeg',
    fallbackList: ['/IMG_2382.jpeg', '/IMG_2382.jpg', 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80'],
  },
  modality_alto_rendimento: {
    title: 'Natação - Alto Rendimento (Competição S14/S21)',
    category: 'Modalidades & Treinos',
    defaultUrl: '/IMG_5625.jpeg',
    fallbackList: ['/IMG_5625.jpeg', '/IMG_5625.jpg', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80'],
  },
};

export const INITIAL_GALLERY_PHOTOS: GalleryPhotoItem[] = [
  {
    id: 'gal-1',
    title: 'Equipe ACEDEP Reunida',
    category: 'Equipe Oficial',
    url: '/IMG_4378.jpeg',
    date: 'Campeonatos & Conquistas',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'gal-2',
    title: 'Iniciação Esportiva e Aperfeiçoamento',
    category: 'Iniciação Esportiva',
    url: '/IMG_2382.jpeg',
    date: 'Treinos Técnicos',
    createdAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'gal-3',
    title: 'Alto Rendimento e Foco na Performance',
    category: 'Alto Rendimento',
    url: '/IMG_5625.jpeg',
    date: 'Classes S14 & S21',
    createdAt: '2026-01-03T00:00:00.000Z',
  },
  {
    id: 'gal-4',
    title: 'Superação e Disciplina nas Piscinas',
    category: 'Treinamento',
    url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=85',
    date: 'Piscina Olímpica',
    createdAt: '2026-01-04T00:00:00.000Z',
  },
  {
    id: 'gal-5',
    title: 'Conquista da Autonomia e Técnica',
    category: 'Iniciação Esportiva',
    url: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1200&q=85',
    date: 'Formação Contínua',
    createdAt: '2026-01-05T00:00:00.000Z',
  },
];

interface PhotosContextType {
  photos: Record<string, string>;
  galleryPhotos: GalleryPhotoItem[];
  isLoading: boolean;
  isFirebaseConnected: boolean;
  isAdminAuthenticated: boolean;
  adminModalOpen: boolean;
  openAdminModal: () => void;
  closeAdminModal: () => void;
  loginAdmin: (pin: string) => Promise<boolean>;
  logoutAdmin: () => void;
  savePhotoToDatabase: (photoId: string, dataUrl: string, title?: string) => Promise<boolean>;
  resetPhotoToDefault: (photoId: string) => Promise<boolean>;
  getPhotoUrl: (photoId: string) => string;
  addGalleryPhoto: (data: { title: string; category: string; url: string; date?: string }) => Promise<boolean>;
  deleteGalleryPhoto: (photoId: string) => Promise<boolean>;
  updateAdminPin: (newPin: string) => Promise<boolean>;
}

const PhotosContext = createContext<PhotosContextType | undefined>(undefined);

export const PhotosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [photos, setPhotos] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    Object.keys(DEFAULT_PHOTOS).forEach((k) => {
      initial[k] = DEFAULT_PHOTOS[k].defaultUrl;
    });
    return initial;
  });

  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhotoItem[]>(INITIAL_GALLERY_PHOTOS);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('acedep_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // Helper to optimize and compress images to safe Firestore document size (clean JPEG ~1280px max)
  const optimizeImage = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      if (!dataUrl.startsWith('data:image')) {
        return resolve(dataUrl);
      }

      const img = new Image();
      img.onload = () => {
        const maxDim = 1280;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          resolve(compressed);
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  // Subscribe to real-time updates from Firestore collection `site_photos`
  useEffect(() => {
    let unsubscribeSitePhotos = () => {};
    let unsubscribeGallery = () => {};

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
            updated[k] = DEFAULT_PHOTOS[k].defaultUrl;
          });

          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as SitePhotoData;
            if (data && data.url) {
              updated[docSnap.id] = data.url;
            }
          });

          setPhotos(updated);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'site_photos');
          setIsFirebaseConnected(false);
          setIsLoading(false);
        }
      );

      // 2. Gallery photos
      const galleryCollection = collection(db, 'gallery');
      const galleryInitDocRef = doc(db, 'settings', 'gallery_init');

      // Check if initialization has occurred; if not, seed initial photos to Firestore
      getDoc(galleryInitDocRef)
        .then(async (initSnap) => {
          if (!initSnap.exists()) {
            try {
              for (const photo of INITIAL_GALLERY_PHOTOS) {
                await setDoc(doc(db, 'gallery', photo.id), photo);
              }
              await setDoc(galleryInitDocRef, { initialized: true, seededAt: new Date().toISOString() });
            } catch (seedErr) {
              handleFirestoreError(seedErr, OperationType.WRITE, 'gallery_seed');
            }
          }
        })
        .catch((err) => {
          handleFirestoreError(err, OperationType.GET, 'settings/gallery_init');
        });

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

          if (list.length > 0) {
            setGalleryPhotos(list);
          } else {
            // Check if user has explicitly deleted all photos or if it's unseeded
            getDoc(galleryInitDocRef)
              .then((initSnap) => {
                if (initSnap.exists()) {
                  setGalleryPhotos([]); // Empty because user deleted all photos
                } else {
                  setGalleryPhotos(INITIAL_GALLERY_PHOTOS);
                }
              })
              .catch(() => {
                setGalleryPhotos([]);
              });
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'gallery');
        }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'firestore_init');
      setIsLoading(false);
    }

    return () => {
      unsubscribeSitePhotos();
      unsubscribeGallery();
    };
  }, []);

  // Secret triggers: Keyboard shortcut (Ctrl+Shift+A) and URL Hash (#admin or ?admin=true)
  useEffect(() => {
    // 1. Check URL on mount and hash changes
    const checkUrlTrigger = () => {
      if (typeof window === 'undefined') return;
      const hash = (window.location.hash || '').toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (hash === '#admin' || hash === '#gestao' || params.get('admin') === 'true' || params.get('admin') === '1') {
        setAdminModalOpen(true);
      }
    };

    checkUrlTrigger();
    window.addEventListener('hashchange', checkUrlTrigger);

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
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const loginAdmin = async (pin: string): Promise<boolean> => {
    const normalized = pin.trim();
    if (!normalized) return false;

    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'admin'));
      if (settingsDoc.exists() && settingsDoc.data().adminPin) {
        const storedPin = settingsDoc.data().adminPin;
        if (storedPin === normalized) {
          setIsAdminAuthenticated(true);
          try {
            sessionStorage.setItem('acedep_admin_auth', 'true');
          } catch {}
          return true;
        }
        // Custom PIN is set, do not allow default password
        return false;
      }
    } catch (e) {
      console.warn('Could not verify remote admin pin from Firestore:', e);
    }

    // Default password fallback only if no custom PIN was set yet
    if (normalized === 'acedep1990' || normalized === '1990' || normalized === 'admin1990') {
      setIsAdminAuthenticated(true);
      try {
        sessionStorage.setItem('acedep_admin_auth', 'true');
      } catch {}
      return true;
    }

    return false;
  };

  const updateAdminPin = async (newPin: string): Promise<boolean> => {
    const cleanPin = newPin.trim();
    if (!cleanPin || cleanPin.length < 4) {
      return false;
    }

    try {
      await setDoc(
        doc(db, 'settings', 'admin'),
        {
          adminPin: cleanPin,
          updatedAt: new Date().toISOString(),
          updatedBy: 'Administrador ACEDEP',
        },
        { merge: true }
      );
      return true;
    } catch (err) {
      console.error('Error updating admin PIN in Firestore:', err);
      return false;
    }
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('acedep_admin_auth');
    } catch {}
  };

  const savePhotoToDatabase = async (
    photoId: string,
    dataUrl: string,
    title?: string
  ): Promise<boolean> => {
    try {
      const optimizedUrl = await optimizeImage(dataUrl);
      const photoMeta = DEFAULT_PHOTOS[photoId];

      const payload: SitePhotoData = {
        id: photoId,
        title: title || photoMeta?.title || photoId,
        category: photoMeta?.category || 'Geral',
        url: optimizedUrl,
        updatedAt: new Date().toISOString(),
        updatedBy: 'Administrador ACEDEP',
      };

      await setDoc(doc(db, 'site_photos', photoId), payload, { merge: true });

      setPhotos((prev) => ({
        ...prev,
        [photoId]: optimizedUrl,
      }));

      return true;
    } catch (err) {
      console.error('Error saving photo to Firestore:', err);
      return false;
    }
  };

  const resetPhotoToDefault = async (photoId: string): Promise<boolean> => {
    try {
      const defaultUrl = DEFAULT_PHOTOS[photoId]?.defaultUrl || '';
      if (!defaultUrl) return false;

      await setDoc(
        doc(db, 'site_photos', photoId),
        {
          id: photoId,
          url: defaultUrl,
          updatedAt: new Date().toISOString(),
          updatedBy: 'Reset Padrão',
        },
        { merge: true }
      );

      setPhotos((prev) => ({
        ...prev,
        [photoId]: defaultUrl,
      }));

      return true;
    } catch (err) {
      console.error('Error resetting photo in Firestore:', err);
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
      const optimizedUrl = await optimizeImage(data.url);
      const photoId = 'photo_' + Date.now();
      const payload: GalleryPhotoItem = {
        id: photoId,
        title: data.title || 'Foto ACEDEP',
        category: data.category || 'Geral',
        url: optimizedUrl,
        date: data.date || new Date().toLocaleDateString('pt-BR'),
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'gallery', photoId), payload);

      setGalleryPhotos((prev) => [payload, ...prev.filter((p) => p.id !== photoId)]);
      return true;
    } catch (err) {
      console.error('Error adding photo to gallery Firestore:', err);
      return false;
    }
  };

  const deleteGalleryPhoto = async (photoId: string): Promise<boolean> => {
    try {
      // Mark init as true so empty state doesn't reset to defaults
      const galleryInitDocRef = doc(db, 'settings', 'gallery_init');
      setDoc(galleryInitDocRef, { initialized: true }, { merge: true }).catch(() => {});

      await deleteDoc(doc(db, 'gallery', photoId));
      setGalleryPhotos((prev) => prev.filter((p) => p.id !== photoId));
      return true;
    } catch (err) {
      console.error('Error deleting photo from gallery Firestore:', err);
      // Still remove from local state to ensure UI responsiveness
      setGalleryPhotos((prev) => prev.filter((p) => p.id !== photoId));
      return true;
    }
  };

  const getPhotoUrl = (photoId: string): string => {
    return photos[photoId] || DEFAULT_PHOTOS[photoId]?.defaultUrl || '';
  };

  return (
    <PhotosContext.Provider
      value={{
        photos,
        galleryPhotos,
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
