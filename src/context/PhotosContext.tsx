import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, doc, getDoc, setDoc, onSnapshot, collection } from '../lib/firebase';

export interface SitePhotoData {
  id: string;
  title: string;
  category: string;
  url: string;
  updatedAt?: string;
  updatedBy?: string;
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

interface PhotosContextType {
  photos: Record<string, string>;
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

  // Subscribe to real-time updates from Firestore collection `site_photos`
  useEffect(() => {
    let unsubscribe = () => {};

    try {
      const photosCollection = collection(db, 'site_photos');
      
      unsubscribe = onSnapshot(
        photosCollection,
        (snapshot) => {
          setIsFirebaseConnected(true);
          setIsLoading(false);
          const updated: Record<string, string> = {};

          // Seed defaults first
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
          console.warn('Firestore real-time subscription error:', error);
          setIsFirebaseConnected(false);
          setIsLoading(false);
        }
      );
    } catch (err) {
      console.warn('Failed to attach Firestore listener:', err);
      setIsLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const loginAdmin = async (pin: string): Promise<boolean> => {
    // Check against default pin 'acedep1990' or database pin
    const normalized = pin.trim();
    if (normalized === 'acedep1990' || normalized === '1990' || normalized === 'admin1990') {
      setIsAdminAuthenticated(true);
      try {
        sessionStorage.setItem('acedep_admin_auth', 'true');
      } catch {}
      return true;
    }

    // Check remote pin if configured
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'admin'));
      if (settingsDoc.exists() && settingsDoc.data().adminPin) {
        if (settingsDoc.data().adminPin === normalized) {
          setIsAdminAuthenticated(true);
          try {
            sessionStorage.setItem('acedep_admin_auth', 'true');
          } catch {}
          return true;
        }
      }
    } catch (e) {
      console.warn('Could not verify remote admin pin', e);
    }

    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('acedep_admin_auth');
    } catch {}
  };

  // Helper to optimize and compress images to safe Firestore document size (clean JPEG ~1200px max)
  const optimizeImage = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      // If it's already a regular URL or short string, return as is
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

      // Save to Firebase Firestore
      await setDoc(doc(db, 'site_photos', photoId), payload, { merge: true });

      // Immediate local state update for instant UI feedback
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

  const getPhotoUrl = (photoId: string): string => {
    return photos[photoId] || DEFAULT_PHOTOS[photoId]?.defaultUrl || '';
  };

  return (
    <PhotosContext.Provider
      value={{
        photos,
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
