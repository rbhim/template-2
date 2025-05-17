import { db } from './firebase';
import { 
  collection, 
  query, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  orderBy,
  where,
  writeBatch
} from 'firebase/firestore';
import { Project, ProjectStatus } from '../types';

const PROJECTS_COLLECTION = 'projects';

// Convert Firestore timestamp to ISO string for client-side use
const convertTimestamps = (project: any): Project => {
  return {
    ...project,
    createdAt: project.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: project.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  };
};

// Fetch all projects
export const getAllProjects = async (): Promise<Project[]> => {
  const projectsQuery = query(collection(db, PROJECTS_COLLECTION), orderBy('updatedAt', 'desc'));
  const snapshot = await getDocs(projectsQuery);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...convertTimestamps(data),
      id: doc.id
    } as Project;
  });
};

// Fetch projects by status
export const getProjectsByStatus = async (status: ProjectStatus): Promise<Project[]> => {
  const projectsQuery = query(
    collection(db, PROJECTS_COLLECTION), 
    where('status', '==', status),
    orderBy('updatedAt', 'desc')
  );
  const snapshot = await getDocs(projectsQuery);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...convertTimestamps(data),
      id: doc.id
    } as Project;
  });
};

// Get a single project by ID
export const getProjectById = async (id: string): Promise<Project | null> => {
  const projectDoc = doc(db, PROJECTS_COLLECTION, id);
  const snapshot = await getDoc(projectDoc);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  const data = snapshot.data();
  return {
    ...convertTimestamps(data),
    id: snapshot.id
  } as Project;
};

// Add a new project
export const addProject = async (project: Omit<Project, 'id'>): Promise<Project> => {
  const projectData = {
    ...project,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), projectData);
  
  return {
    ...project,
    id: docRef.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Add multiple projects in batch - used for CSV import
export const batchAddProjects = async (projects: Omit<Project, 'id'>[]): Promise<string[]> => {
  const batch = writeBatch(db);
  const projectsRef = collection(db, PROJECTS_COLLECTION);
  const projectRefs: any[] = [];
  
  // Add each project to the batch
  projects.forEach(project => {
    const newRef = doc(projectsRef);
    projectRefs.push(newRef);
    
    batch.set(newRef, {
      ...project,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  });
  
  // Commit the batch
  await batch.commit();
  
  // Return the IDs of the created projects
  return projectRefs.map(ref => ref.id);
};

// Update a project
export const updateProject = async (id: string, project: Partial<Project>): Promise<void> => {
  const projectRef = doc(db, PROJECTS_COLLECTION, id);
  
  await updateDoc(projectRef, {
    ...project,
    updatedAt: serverTimestamp()
  });
};

// Delete a project
export const deleteProject = async (id: string): Promise<void> => {
  const projectRef = doc(db, PROJECTS_COLLECTION, id);
  await deleteDoc(projectRef);
}; 