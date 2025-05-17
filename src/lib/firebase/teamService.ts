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
  orderBy
} from 'firebase/firestore';
import { TeamMember } from '../types';

const TEAM_COLLECTION = 'team_members';

// Fetch all team members
export const getAllTeamMembers = async (): Promise<TeamMember[]> => {
  const teamQuery = query(collection(db, TEAM_COLLECTION), orderBy('name'));
  const snapshot = await getDocs(teamQuery);
  
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  } as TeamMember));
};

// Get a single team member by ID
export const getTeamMemberById = async (id: string): Promise<TeamMember | null> => {
  const teamDoc = doc(db, TEAM_COLLECTION, id);
  const snapshot = await getDoc(teamDoc);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  return {
    ...snapshot.data(),
    id: snapshot.id
  } as TeamMember;
};

// Add a new team member
export const addTeamMember = async (teamMember: Omit<TeamMember, 'id'>): Promise<TeamMember> => {
  const teamData = {
    ...teamMember,
    createdAt: serverTimestamp()
  };
  
  const docRef = await addDoc(collection(db, TEAM_COLLECTION), teamData);
  
  return {
    ...teamMember,
    id: docRef.id
  };
};

// Update a team member
export const updateTeamMember = async (id: string, teamMember: Partial<TeamMember>): Promise<void> => {
  const teamRef = doc(db, TEAM_COLLECTION, id);
  
  await updateDoc(teamRef, {
    ...teamMember,
    updatedAt: serverTimestamp()
  });
};

// Delete a team member
export const deleteTeamMember = async (id: string): Promise<void> => {
  const teamRef = doc(db, TEAM_COLLECTION, id);
  await deleteDoc(teamRef);
}; 