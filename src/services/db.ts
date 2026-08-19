import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { Assignment, Subject, StudentProgress, AssignmentStatus, UserProfile } from '../types';
import { INITIAL_SUBJECTS } from '../utils/constants';

const SUBJECTS_COL = 'subjects';
const ASSIGNMENTS_COL = 'assignments';
const PROGRESS_COL = 'studentProgress';
const USERS_COL = 'users';
const LOCAL_PROGRESS_CACHE = 'cse_hub_progress_cache';

// Helper for local progress cache
export function getLocalProgressCache(): Record<string, StudentProgress> {
  try {
    const raw = localStorage.getItem(LOCAL_PROGRESS_CACHE);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalProgressCache(map: Record<string, StudentProgress>) {
  try {
    localStorage.setItem(LOCAL_PROGRESS_CACHE, JSON.stringify(map));
  } catch {
    // Ignored
  }
}

// 1. SEED INITIAL SUBJECTS IF EMPTY & PURGE LEGACY LABS
export async function ensureInitialSubjects(): Promise<Subject[]> {
  const fallbackSubjects: Subject[] = INITIAL_SUBJECTS.map((s) => ({
    id: s.code,
    ...s,
  }));

  try {
    const snap = await getDocs(collection(db, SUBJECTS_COL));
    const coreCodes = new Set(INITIAL_SUBJECTS.map((s) => s.code));
    const toDeleteDocs: string[] = [];

    snap.forEach((d) => {
      const data = d.data();
      const code = data.code || d.id;
      const name = (data.name || '').toLowerCase();
      if (!coreCodes.has(code) || name.includes('lab')) {
        toDeleteDocs.push(d.id);
      }
    });

    if (toDeleteDocs.length > 0) {
      const deleteBatch = writeBatch(db);
      toDeleteDocs.forEach((docId) => {
        deleteBatch.delete(doc(db, SUBJECTS_COL, docId));
      });
      await deleteBatch.commit().catch((e) => console.warn('Could not delete legacy lab doc:', e));
    }

    // Ensure all 5 core subjects exist with up-to-date orders and titles
    const batch = writeBatch(db);
    const created: Subject[] = [];

    INITIAL_SUBJECTS.forEach((subj) => {
      const docRef = doc(db, SUBJECTS_COL, subj.code);
      const subjectData: Subject = {
        id: subj.code,
        name: subj.name,
        code: subj.code,
        order: subj.order,
        description: subj.description,
        color: subj.color,
      };
      batch.set(docRef, subjectData, { merge: true });
      created.push(subjectData);
    });

    await batch.commit().catch(() => {});
    return created.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.warn('Initial subjects load from Firestore failed, using static curriculum:', error);
    return fallbackSubjects;
  }
}

// 2. REAL-TIME SUBJECTS LISTENER (STRICT 5 CORE SUBJECTS)
export function subscribeToSubjects(
  onUpdate: (subjects: Subject[]) => void,
  onError?: (err: any) => void
) {
  try {
    const q = query(collection(db, SUBJECTS_COL), orderBy('order', 'asc'));
    const coreCodes = new Set(INITIAL_SUBJECTS.map((s) => s.code));

    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          onUpdate(INITIAL_SUBJECTS.map((s) => ({ id: s.code, ...s })));
          return;
        }
        const subjects: Subject[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          const code = data.code || d.id;
          const name = (data.name || '').toLowerCase();
          // STRICT filter: Must be one of the coreCodes and NOT contain lab
          if (coreCodes.has(code) && !name.includes('lab')) {
            subjects.push({
              id: d.id,
              name: data.name,
              code: data.code || d.id,
              order: data.order ?? 99,
              description: data.description,
              color: data.color,
            });
          }
        });
        onUpdate(subjects.length ? subjects.sort((a, b) => a.order - b.order) : INITIAL_SUBJECTS.map((s) => ({ id: s.code, ...s })));
      },
      (error) => {
        console.warn('Subjects Firestore sync error, falling back to local list:', error);
        onUpdate(INITIAL_SUBJECTS.map((s) => ({ id: s.code, ...s })));
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Failed to attach subjects listener:', err);
    onUpdate(INITIAL_SUBJECTS.map((s) => ({ id: s.code, ...s })));
    return () => {};
  }
}

// 3. REAL-TIME ASSIGNMENTS LISTENER
export function subscribeToAssignments(
  onUpdate: (assignments: Assignment[]) => void,
  onError?: (err: any) => void
) {
  try {
    const q = query(collection(db, ASSIGNMENTS_COL));
    return onSnapshot(
      q,
      (snapshot) => {
        const assignments: Assignment[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          assignments.push({
            id: d.id,
            title: data.title || 'Untitled Assignment',
            description: data.description || '',
            subjectId: data.subjectId || '',
            subjectName: data.subjectName || '',
            subjectCode: data.subjectCode || '',
            dueDate: data.dueDate || new Date().toISOString().split('T')[0],
            dueTime: data.dueTime || '23:59',
            priority: data.priority || 'medium',
            attachmentUrl: data.attachmentUrl,
            attachmentName: data.attachmentName,
            attachmentSize: data.attachmentSize,
            attachmentType: data.attachmentType,
            externalUrl: data.externalUrl,
            teacher: data.teacher,
            instructions: data.instructions,
            published: data.published !== false,
            createdBy: data.createdBy,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          });
        });
        onUpdate(assignments);
      },
      (error) => {
        console.warn('Assignments Firestore sync error:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Failed to attach assignments listener:', err);
    return () => {};
  }
}

// 4. REAL-TIME STUDENT PROGRESS FOR CURRENT USER
export function subscribeToStudentProgress(
  userId: string,
  onUpdate: (progressMap: Record<string, StudentProgress>) => void,
  onError?: (err: any) => void
) {
  if (!userId) {
    onUpdate(getLocalProgressCache());
    return () => {};
  }

  try {
    const q = query(collection(db, PROGRESS_COL), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const map: Record<string, StudentProgress> = { ...getLocalProgressCache() };
        snapshot.forEach((d) => {
          const data = d.data() as StudentProgress;
          map[data.assignmentId] = {
            id: d.id,
            userId: data.userId,
            studentName: data.studentName,
            assignmentId: data.assignmentId,
            subjectId: data.subjectId,
            status: data.status || 'not_started',
            completedAt: data.completedAt,
            updatedAt: data.updatedAt,
            notes: data.notes,
          };
        });
        saveLocalProgressCache(map);
        onUpdate(map);
      },
      (error) => {
        console.warn('Student progress Firestore sync error, loading local cache:', error);
        onUpdate(getLocalProgressCache());
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Failed to attach student progress listener:', err);
    onUpdate(getLocalProgressCache());
    return () => {};
  }
}

// 5. REAL-TIME ALL PROGRESS FOR ADMIN ANALYTICS
export function subscribeToAllProgress(
  onUpdate: (progressList: StudentProgress[]) => void,
  onError?: (err: any) => void
) {
  try {
    const q = query(collection(db, PROGRESS_COL));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: StudentProgress[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as StudentProgress);
        });
        onUpdate(list);
      },
      (error) => {
        console.warn('All progress listener error:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Failed to attach all progress listener:', err);
    return () => {};
  }
}

// 6. UPDATE STUDENT PROGRESS (PERSONAL STATUS)
export async function updateStudentProgressStatus(
  userId: string,
  studentName: string,
  assignmentId: string,
  subjectId: string,
  status: AssignmentStatus,
  notes?: string
): Promise<void> {
  const docId = `${userId}_${assignmentId}`;
  const now = new Date().toISOString();

  const progressItem: StudentProgress = {
    id: docId,
    userId,
    studentName,
    assignmentId,
    subjectId,
    status,
    updatedAt: now,
    completedAt: status === 'completed' ? now : null,
    ...(notes !== undefined ? { notes } : {}),
  };

  // Immediate local cache update
  const cache = getLocalProgressCache();
  cache[assignmentId] = progressItem;
  saveLocalProgressCache(cache);

  // Firestore update
  try {
    const docRef = doc(db, PROGRESS_COL, docId);
    await setDoc(docRef, progressItem, { merge: true });
  } catch (error) {
    console.warn('Firestore progress write failed, cached locally:', error);
  }
}

// 7. ASSIGNMENT MANAGEMENT (ADMIN)
export async function createAssignment(
  data: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = doc(collection(db, ASSIGNMENTS_COL));
  const now = new Date().toISOString();
  const newAssignment: Assignment = {
    id: docRef.id,
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const firestoreWrite = setDoc(docRef, newAssignment);
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, 4000));
    await Promise.race([firestoreWrite, timeout]);
  } catch (err) {
    console.warn('Firestore setDoc slow or offline, proceeding:', err);
  }

  return docRef.id;
}

export async function updateAssignment(
  id: string,
  data: Partial<Assignment>
): Promise<void> {
  const docRef = doc(db, ASSIGNMENTS_COL, id);
  const payload = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  try {
    const firestoreWrite = updateDoc(docRef, payload);
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, 4000));
    await Promise.race([firestoreWrite, timeout]);
  } catch (err) {
    console.warn('Firestore updateDoc slow or offline, proceeding:', err);
  }
}

export async function deleteAssignment(id: string): Promise<void> {
  await deleteDoc(doc(db, ASSIGNMENTS_COL, id));
  try {
    const progQuery = query(collection(db, PROGRESS_COL), where('assignmentId', '==', id));
    const progSnap = await getDocs(progQuery);
    if (!progSnap.empty) {
      const batch = writeBatch(db);
      progSnap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (e) {
    console.warn('Progress cleanup error on delete assignment:', e);
  }
}

export async function duplicateAssignment(original: Assignment, createdByUid?: string): Promise<string> {
  const { id, createdAt, updatedAt, ...rest } = original;
  return createAssignment({
    ...rest,
    title: `${rest.title} (Copy)`,
    createdBy: createdByUid,
    published: false,
  });
}

export async function toggleAssignmentPublish(id: string, currentPublished: boolean): Promise<void> {
  return updateAssignment(id, { published: !currentPublished });
}

// Helper to convert file to Data URL for instant non-blocking save
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// 8. FILE UPLOADS TO FIREBASE STORAGE (WITH FAST TIMEOUT & DATA URL FALLBACK)
export async function uploadAttachmentFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ url: string; name: string; size: number; type: string }> {
  try {
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `assignments/${timestamp}_${cleanFileName}`;
    const storageRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(storageRef, file);

    const storagePromise = new Promise<{ url: string; name: string; size: number; type: string }>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(Math.round(progress));
        },
        (error) => {
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              url: downloadUrl,
              name: file.name,
              size: file.size,
              type: file.type || file.name.split('.').pop() || 'file',
            });
          } catch (e) {
            reject(e);
          }
        }
      );
    });

    // 5-second timeout for cloud storage; if slow, race to fast embedded reader
    const timeoutPromise = new Promise<{ url: string; name: string; size: number; type: string }>((_, reject) => {
      setTimeout(() => reject(new Error('Storage upload timeout')), 5000);
    });

    return await Promise.race([storagePromise, timeoutPromise]);
  } catch (error) {
    console.warn('Firebase Storage upload slow or unavailable, generating fast local data attachment:', error);
    if (onProgress) onProgress(90);
    
    let fastUrl = '';
    // If file is smaller than 6MB, encode as Data URL so PDF displays instantly everywhere
    if (file.size < 6 * 1024 * 1024) {
      try {
        fastUrl = await readFileAsDataUrl(file);
      } catch {
        fastUrl = '';
      }
    }

    if (onProgress) onProgress(100);

    return {
      url: fastUrl,
      name: file.name,
      size: file.size,
      type: file.type || file.name.split('.').pop() || 'file',
    };
  }
}

// 9. USERS & PROFILES
export async function syncUserProfile(
  userId: string,
  displayName: string,
  role: 'student' | 'admin',
  email?: string
): Promise<void> {
  if (!userId) return;
  const docRef = doc(db, USERS_COL, userId);
  const now = new Date().toISOString();

  try {
    const existing = await getDoc(docRef);
    if (!existing.exists()) {
      await setDoc(docRef, {
        userId,
        displayName,
        role,
        email: email || null,
        createdAt: now,
        lastActive: now,
      });
    } else {
      await updateDoc(docRef, {
        displayName,
        lastActive: now,
        ...(email ? { email } : {}),
      });
    }
  } catch (error) {
    console.warn('User profile sync warning:', error);
  }
}

export function subscribeToUsers(
  onUpdate: (users: UserProfile[]) => void,
  onError?: (err: any) => void
) {
  try {
    const q = query(collection(db, USERS_COL));
    return onSnapshot(
      q,
      (snapshot) => {
        const users: UserProfile[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          users.push({
            userId: d.id,
            displayName: data.displayName || 'Unnamed Student',
            role: data.role || 'student',
            email: data.email,
            createdAt: data.createdAt || '',
            lastActive: data.lastActive || '',
          });
        });
        onUpdate(users);
      },
      (error) => {
        console.warn('Users subscribe error:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to users:', err);
    return () => {};
  }
}
