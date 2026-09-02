import { 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  cleanFirestoreData 
} from './firebase';
import { 
  INITIAL_ATHLETES, 
  INITIAL_ADMIN_USERS, 
  INITIAL_NEWS_POSTS, 
  INITIAL_COMMUNITY_CHEERS, 
  INITIAL_ANNUAL_EVENTS, 
  INITIAL_ATTENDANCE_SESSIONS 
} from '../data/initialCommunityData';
import { DEFAULT_PHOTOS, INITIAL_GALLERY_PHOTOS } from '../context/PhotosContext';

let isSeedingRunning = false;

/**
 * Ensures the Cloud Firestore database has all base collections, documents,
 * administrators, athletes, photos, events and news.
 * Runs non-blockingly so the UI remains instant.
 */
export async function ensureFirestoreDatabaseSeeded(): Promise<void> {
  if (isSeedingRunning) return;
  isSeedingRunning = true;

  try {
    // Check if cloud database already has initialization marker
    const initRef = doc(db, 'settings', 'system_init');
    const initSnap = await getDoc(initRef);

    if (initSnap.exists()) {
      // Database is already seeded
      isSeedingRunning = false;
      return;
    }

    console.log('[Firestore Seeder] Initializing Cloud Firestore database with seed data...');

    // 1. Seed Master Admin and Settings only if not set
    const adminSnap = await getDoc(doc(db, 'settings', 'admin'));
    if (!adminSnap.exists()) {
      await setDoc(doc(db, 'settings', 'admin'), {
        adminPin: '1990',
        updatedAt: new Date().toISOString(),
        updatedBy: 'System Bootstrap',
      }, { merge: true });
    }

    // 2. Seed Admin Users (Coaches & Super Admin) only if not existing
    for (const admin of INITIAL_ADMIN_USERS) {
      const snap = await getDoc(doc(db, 'admin_users', admin.id));
      if (!snap.exists()) {
        await setDoc(doc(db, 'admin_users', admin.id), cleanFirestoreData(admin), { merge: true });
      }
    }

    // 3. Seed Athletes only if not existing
    for (const athlete of INITIAL_ATHLETES) {
      const snap = await getDoc(doc(db, 'athletes', athlete.id));
      if (!snap.exists()) {
        await setDoc(doc(db, 'athletes', athlete.id), cleanFirestoreData(athlete), { merge: true });
      }
    }

    // 4. Seed News Posts only if not existing
    for (const news of INITIAL_NEWS_POSTS) {
      const snap = await getDoc(doc(db, 'news_posts', news.id));
      if (!snap.exists()) {
        await setDoc(doc(db, 'news_posts', news.id), cleanFirestoreData(news), { merge: true });
      }
    }

    // 5. Seed Community Cheers only if not existing
    for (const cheer of INITIAL_COMMUNITY_CHEERS) {
      const snap = await getDoc(doc(db, 'community_cheers', cheer.id));
      if (!snap.exists()) {
        await setDoc(doc(db, 'community_cheers', cheer.id), cleanFirestoreData(cheer), { merge: true });
      }
    }

    // 6. Seed Annual Events only if not existing
    for (const event of INITIAL_ANNUAL_EVENTS) {
      const snap = await getDoc(doc(db, 'annual_events', event.id));
      if (!snap.exists()) {
        await setDoc(doc(db, 'annual_events', event.id), cleanFirestoreData(event), { merge: true });
      }
    }

    // 7. Seed Attendance Sessions only if not existing
    for (const session of INITIAL_ATTENDANCE_SESSIONS) {
      const snap = await getDoc(doc(db, 'attendance_sessions', session.id));
      if (!snap.exists()) {
        await setDoc(doc(db, 'attendance_sessions', session.id), cleanFirestoreData(session), { merge: true });
      }
    }

    // 8. Seed Default Site Photos (NEVER overwrite existing photos, and check localStorage backup first)
    for (const [key, photoMeta] of Object.entries(DEFAULT_PHOTOS)) {
      const snap = await getDoc(doc(db, 'site_photos', key));
      if (!snap.exists()) {
        let photoUrl = photoMeta.defaultUrl;
        try {
          if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('acedep_photo_' + key);
            if (cached && cached.trim()) {
              photoUrl = cached;
            }
          }
        } catch {}

        await setDoc(doc(db, 'site_photos', key), {
          id: key,
          title: photoMeta.title,
          category: photoMeta.category,
          url: photoUrl,
          updatedAt: new Date().toISOString(),
          updatedBy: 'Sistema ACEDEP',
        }, { merge: true });
      }
    }

    // 9. Seed Gallery Photos only if not existing
    for (const photo of INITIAL_GALLERY_PHOTOS) {
      const snap = await getDoc(doc(db, 'gallery', photo.id));
      if (!snap.exists()) {
        await setDoc(doc(db, 'gallery', photo.id), cleanFirestoreData(photo), { merge: true });
      }
    }

    // 10. Mark database as initialized
    await setDoc(initRef, {
      initialized: true,
      version: '2026.2',
      seededAt: new Date().toISOString(),
      databaseName: 'ai-studio-acedepassociaocu-fe62783f-4d2c-46d8-afc3-af28924ec5f2',
    });

    console.log('[Firestore Seeder] Cloud Firestore database successfully initialized.');
  } catch (error) {
    console.warn('[Firestore Seeder] Notice during database seed check:', error);
  } finally {
    isSeedingRunning = false;
  }
}
