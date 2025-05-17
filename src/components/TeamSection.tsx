'use client';

import { useState, useEffect, useRef } from 'react';
import { Project, TeamMember } from '../lib/types';
import ConfirmationDialog from './ConfirmationDialog';

interface TeamSectionProps {
  projects: Project[];
  initialTeamMembers?: TeamMember[];
  onUpdateTeamMembers?: (teamMembers: TeamMember[]) => void;
}

// For tracking selected projects when adding/editing team members 
// (since TeamMember type doesn't have a projects field)
interface MemberFormData {
  name: string;
  role: string;
  email: string;
  selectedProjects: string[]; // Project IDs
  avatar: string; // URL to the avatar image
}

// Sample avatars for team members
const defaultAvatar = 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png';

// Game-style preset avatars - TO BE REPLACED with user-provided samples
const avatars: string[] = [
  // Will be populated with user-provided sample avatars
];

// Sample roles for the dropdown
const roles = [
  'Project Manager',
  'Traffic Engineer',
  'Transportation Planner',
  'Designer',
  'Analyst',
  'Admin',
];

export default function TeamSection({ projects, initialTeamMembers = [], onUpdateTeamMembers }: TeamSectionProps) {
  // Team members state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  // Custom roles state
  const [customRoles, setCustomRoles] = useState<string[]>(() => {
    // Try to load custom roles from localStorage
    if (typeof window !== 'undefined') {
      const savedRoles = localStorage.getItem('customTeamRoles');
      return savedRoles ? JSON.parse(savedRoles) : [];
    }
    return [];
  });
  const [newCustomRole, setNewCustomRole] = useState<string>('');
  const [showCustomRoleInput, setShowCustomRoleInput] = useState<boolean>(false);
  
  // File upload state
  const [uploadMode, setUploadMode] = useState<'preset' | 'upload'>('preset');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedEditImage, setUploadedEditImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  
  // Confirmation dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [isCancelAddDialogOpen, setIsCancelAddDialogOpen] = useState(false);
  const [isCancelEditDialogOpen, setIsCancelEditDialogOpen] = useState(false);
  
  // Initialize team members from props or use default
  useEffect(() => {
    if (initialTeamMembers.length > 0) {
      setTeamMembers(initialTeamMembers);
    } else {
      // Use default if no team members provided
      setTeamMembers([
        {
          id: '1',
          name: 'John Doe',
          role: 'Project Manager',
          email: 'john.doe@example.com',
          avatar: defaultAvatar,
        },
        {
          id: '2',
          name: 'Jane Smith',
          role: 'Traffic Engineer',
          email: 'jane.smith@example.com',
          avatar: defaultAvatar,
        },
        {
          id: '3',
          name: 'Robert Johnson',
          role: 'Transportation Planner',
          email: 'robert.johnson@example.com',
          avatar: defaultAvatar,
        },
      ]);
    }
  }, [initialTeamMembers]);
  
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [newMember, setNewMember] = useState<MemberFormData>({
    name: '',
    role: 'Traffic Engineer',
    email: '',
    selectedProjects: [],
    avatar: defaultAvatar, // Default generic avatar
  });
  const [activeTab, setActiveTab] = useState<'members' | 'projects'>('members');
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [showEditAvatarSelector, setShowEditAvatarSelector] = useState(false);
  const [editForm, setEditForm] = useState<MemberFormData>({
    name: '',
    role: '',
    email: '',
    selectedProjects: [],
    avatar: '',
  });

  // Update parent component when team members change
  const updateTeamMembers = (updatedMembers: TeamMember[]) => {
    setTeamMembers(updatedMembers);
    if (onUpdateTeamMembers) {
      onUpdateTeamMembers(updatedMembers);
    }
  };

  // Add a new team member
  const addTeamMember = () => {
    if (!newMember.name || !newMember.email) return;
    
    const member: TeamMember = {
      id: Date.now().toString(),
      name: newMember.name,
      role: newMember.role,
      email: newMember.email,
      avatar: newMember.avatar,
    };
    
    const updatedMembers = [...teamMembers, member];
    updateTeamMembers(updatedMembers);
    
    // Update projects with team member assignments
    newMember.selectedProjects.forEach(projectId => {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        const assignedTeam = [...(project.assignedTeam || []), member.id];
        // We would need to update the project here, but we don't have access to update projects directly
        // This would need to be handled through a callback prop if needed
      }
    });
    
    // Reset all form fields and states
    setNewMember({
      name: '',
      role: 'Traffic Engineer',
      email: '',
      selectedProjects: [],
      avatar: defaultAvatar, // Default generic avatar
    });
    setIsAddingMember(false);
    setShowAvatarSelector(false);
    setUploadMode('preset');
    setUploadedImage(null);
  };

  // Update team member
  const updateTeamMember = (id: string) => {
    if (!editForm.name || !editForm.email) return;
    
    const updatedMembers = teamMembers.map(member => 
      member.id === id
        ? { 
            ...member, 
            name: editForm.name,
            role: editForm.role,
            email: editForm.email,
            avatar: editForm.avatar,
          }
        : member
    );
    
    updateTeamMembers(updatedMembers);
    setEditingMemberId(null);
    setShowEditAvatarSelector(false);
    
    // Update project assignments is not implemented here as we don't have access to update projects
  };

  // Delete team member
  const deleteTeamMember = (id: string) => {
    const updatedMembers = teamMembers.filter(member => member.id !== id);
    updateTeamMembers(updatedMembers);
    setIsDeleteDialogOpen(false);
    setMemberToDelete(null);
  };

  // Show confirmation dialog for member deletion
  const handleDeleteClick = (id: string) => {
    setMemberToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setMemberToDelete(null);
  };

  // Get projects for a member
  const getMemberProjects = (memberId: string) => {
    return projects.filter(project => project.assignedTeam?.includes(memberId));
  };

  // Get team members for a project
  const getProjectMembers = (projectId: string) => {
    return teamMembers.filter(member => {
      return projects.find(p => p.id === projectId)?.assignedTeam?.includes(member.id);
    });
  };

  // Toggle project selection in add/edit forms
  const toggleProjectSelection = (projectId: string, isEditing = false) => {
    if (isEditing) {
      const updatedProjects = editForm.selectedProjects.includes(projectId)
        ? editForm.selectedProjects.filter(id => id !== projectId)
        : [...editForm.selectedProjects, projectId];
      
      setEditForm({ ...editForm, selectedProjects: updatedProjects });
    } else {
      const updatedProjects = newMember.selectedProjects.includes(projectId)
        ? newMember.selectedProjects.filter(id => id !== projectId)
        : [...newMember.selectedProjects, projectId];
      
      setNewMember({ ...newMember, selectedProjects: updatedProjects });
    }
  };
  
  // Add custom role
  const addCustomRole = () => {
    if (!newCustomRole.trim()) return;
    
    // Check if role already exists in default roles or custom roles
    const roleExists = [...roles, ...customRoles].some(
      role => role.toLowerCase() === newCustomRole.trim().toLowerCase()
    );
    
    if (!roleExists) {
      const updatedRoles = [...customRoles, newCustomRole.trim()];
      setCustomRoles(updatedRoles);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('customTeamRoles', JSON.stringify(updatedRoles));
      }
      
      // Auto-select the new role
      setNewMember(prev => ({ ...prev, role: newCustomRole.trim() }));
    }
    
    setNewCustomRole('');
    setShowCustomRoleInput(false);
  };

  // Handle file upload for avatar
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size should be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (isEdit) {
        setUploadedEditImage(result);
        setEditForm(prev => ({ ...prev, avatar: result }));
      } else {
        setUploadedImage(result);
        setNewMember(prev => ({ ...prev, avatar: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Trigger file input click
  const triggerFileInput = (isEdit = false) => {
    if (isEdit) {
      editFileInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  // Check if new member form has any data
  const hasUnsavedAddChanges = () => {
    return newMember.name !== '' || 
           newMember.email !== '' || 
           newMember.selectedProjects.length > 0 || 
           newMember.avatar !== defaultAvatar;
  };

  // Check if edit form has unsaved changes
  const hasUnsavedEditChanges = (member: TeamMember) => {
    const assignedProjects = projects
      .filter(project => project.assignedTeam?.includes(member.id))
      .map(project => project.id);
      
    return editForm.name !== member.name || 
           editForm.role !== member.role || 
           editForm.email !== member.email || 
           editForm.avatar !== member.avatar ||
           !arraysEqual(editForm.selectedProjects, assignedProjects);
  };

  // Helper to compare arrays
  const arraysEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, idx) => val === sortedB[idx]);
  };

  // Handle canceling add form
  const handleCancelAdd = () => {
    if (hasUnsavedAddChanges()) {
      setIsCancelAddDialogOpen(true);
    } else {
      resetAddForm();
    }
  };

  // Reset add form
  const resetAddForm = () => {
    setNewMember({
      name: '',
      role: 'Traffic Engineer',
      email: '',
      selectedProjects: [],
      avatar: defaultAvatar,
    });
    setIsAddingMember(false);
    setShowAvatarSelector(false);
    setUploadMode('preset');
    setUploadedImage(null);
  };

  // Handle canceling edit form
  const handleCancelEdit = (member: TeamMember) => {
    if (hasUnsavedEditChanges(member)) {
      setIsCancelEditDialogOpen(true);
    } else {
      resetEditForm();
    }
  };

  // Reset edit form
  const resetEditForm = () => {
    setEditingMemberId(null);
    setShowEditAvatarSelector(false);
    setUploadMode('preset');
    setUploadedEditImage(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tab Navigation */}
      <div className="border-b dark:border-gray-700">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('members')}
            className={`py-2 px-1 font-medium text-sm transition-colors ${
              activeTab === 'members'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Team Members
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-2 px-1 font-medium text-sm transition-colors ${
              activeTab === 'projects'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Project Teams
          </button>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Team Member"
        message={memberToDelete ? `Are you sure you want to delete ${teamMembers.find(m => m.id === memberToDelete)?.name || 'this team member'}? This action cannot be undone.` : "Are you sure you want to delete this team member?"}
        onConfirm={() => memberToDelete && deleteTeamMember(memberToDelete)}
        onCancel={cancelDelete}
      />

      <ConfirmationDialog
        isOpen={isCancelAddDialogOpen}
        title="Discard Changes"
        message="You have unsaved changes. Are you sure you want to discard them?"
        onConfirm={() => {
          setIsCancelAddDialogOpen(false);
          resetAddForm();
        }}
        onCancel={() => setIsCancelAddDialogOpen(false)}
        confirmText="Discard"
        confirmButtonClass="bg-yellow-600 hover:bg-yellow-700"
      />

      <ConfirmationDialog
        isOpen={isCancelEditDialogOpen}
        title="Discard Changes"
        message="You have unsaved changes. Are you sure you want to discard them?"
        onConfirm={() => {
          setIsCancelEditDialogOpen(false);
          resetEditForm();
        }}
        onCancel={() => setIsCancelEditDialogOpen(false)}
        confirmText="Discard"
        confirmButtonClass="bg-yellow-600 hover:bg-yellow-700"
      />

      {/* Team Members View */}
      {activeTab === 'members' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h3>
            <button 
              onClick={() => {
                if (isAddingMember && hasUnsavedAddChanges()) {
                  setIsCancelAddDialogOpen(true);
                } else {
                  setIsAddingMember(!isAddingMember);
                  if (isAddingMember) {
                    resetAddForm();
                  }
                }
              }}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              {isAddingMember ? 'Cancel' : 'Add Member'}
            </button>
          </div>

          {/* Add New Member Form */}
          {isAddingMember && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6 animate-slide-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                  <div className="flex flex-col space-y-2">
                    <select
                      value={newMember.role}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        if (selectedValue === "add-custom") {
                          setShowCustomRoleInput(true);
                        } else {
                          setNewMember({ ...newMember, role: selectedValue });
                        }
                      }}
                      className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <optgroup label="Standard Roles">
                        {roles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </optgroup>
                      
                      {customRoles.length > 0 && (
                        <optgroup label="Custom Roles">
                          {customRoles.map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </optgroup>
                      )}
                      
                      <option value="add-custom">+ Add Custom Role</option>
                    </select>
                    
                    {showCustomRoleInput && (
                      <div className="flex mt-2 animate-fade-in">
                        <input
                          type="text"
                          value={newCustomRole}
                          onChange={(e) => setNewCustomRole(e.target.value)}
                          placeholder="Enter custom role"
                          className="flex-1 p-2 border dark:border-gray-600 rounded-l bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          autoFocus
                        />
                        <button
                          onClick={addCustomRole}
                          className="px-3 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700"
                          disabled={!newCustomRole.trim()}
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter email"
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile Picture</label>
                  <button 
                    type="button"
                    onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {showAvatarSelector ? 'Hide Options' : 'Change Picture'}
                  </button>
                </div>
                
                <div className="flex items-center">
                  <img 
                    src={newMember.avatar}
                    alt="Selected avatar"
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-200 dark:border-blue-900"
                  />
                  <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                    {showAvatarSelector ? 'Select an avatar or upload your own' : 'Click "Change Picture" to select an avatar'}
                  </span>
                </div>
                
                {showAvatarSelector && (
                  <div className="mt-3 animate-fade-in">
                    {/* Upload option */}
                    <div className="mb-3 flex flex-col">
                      <div className="flex space-x-2 mb-2">
                        <button
                          type="button"
                          onClick={() => setUploadMode('upload')}
                          className={`px-3 py-1.5 text-xs rounded ${
                            uploadMode === 'upload' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          Upload Image
                        </button>
                        <button
                          type="button"
                          onClick={() => setUploadMode('preset')}
                          className={`px-3 py-1.5 text-xs rounded ${
                            uploadMode === 'preset' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          Use Preset Avatar
                        </button>
                      </div>
                      
                      {uploadMode === 'upload' && (
                        <div>
                          <input 
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => handleFileUpload(e)}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => triggerFileInput()}
                            className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                            </svg>
                            Select Image
                          </button>
                          <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                            Max size: 2MB. Formats: JPG, PNG, GIF
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Preset avatars */}
                    {uploadMode === 'preset' && (
                      <>
                        <div className="text-xs mb-2 text-gray-600 dark:text-gray-400">
                          Select an avatar:
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                          <button
                            type="button"
                            onClick={() => setNewMember({ ...newMember, avatar: defaultAvatar })}
                            className={`relative p-1 rounded-full ${
                              newMember.avatar === defaultAvatar 
                                ? 'ring-2 ring-blue-600 dark:ring-blue-400 bg-blue-50 dark:bg-blue-900/30'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <img 
                              src={defaultAvatar}
                              alt="Default avatar"
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            {newMember.avatar === defaultAvatar && (
                              <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full w-5 h-5 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </div>
                            )}
                          </button>
                          {avatars.length > 0 && avatars.map((avatar, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setNewMember({ ...newMember, avatar })}
                              className={`relative p-1 rounded-full ${
                                newMember.avatar === avatar 
                                  ? 'ring-2 ring-blue-600 dark:ring-blue-400 bg-blue-50 dark:bg-blue-900/30'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              <img 
                                src={avatar}
                                alt={`Avatar option ${index + 1}`}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              {newMember.avatar === avatar && (
                                <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full w-5 h-5 flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assign to Projects</label>
                <div className="flex flex-wrap gap-2">
                  {projects.map(project => (
                    <label key={project.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newMember.selectedProjects.includes(project.id)}
                        onChange={() => toggleProjectSelection(project.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded border-gray-300 dark:border-gray-600"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{project.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCancelAdd}
                  className="px-4 py-2 border dark:border-gray-600 rounded text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>

                <button
                  onClick={addTeamMember}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  disabled={!newMember.name || !newMember.email}
                >
                  Add Team Member
                </button>
              </div>
            </div>
          )}

          {/* Team Member List */}
          <div className="space-y-4">
            {teamMembers.map(member => (
              <div 
                key={member.id} 
                className="border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md"
              >
                <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  
                  {editingMemberId === member.id ? (
                    <div className="flex-1 space-y-3 w-full animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Name</label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full p-1.5 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Role</label>
                          <select
                            value={editForm.role}
                            onChange={(e) => {
                              const selectedValue = e.target.value;
                              if (selectedValue === "add-custom") {
                                setShowCustomRoleInput(true);
                              } else {
                                setEditForm({ ...editForm, role: selectedValue });
                              }
                            }}
                            className="w-full p-1.5 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <optgroup label="Standard Roles">
                              {roles.map(role => (
                                <option key={role} value={role}>{role}</option>
                              ))}
                            </optgroup>
                            
                            {customRoles.length > 0 && (
                              <optgroup label="Custom Roles">
                                {customRoles.map(role => (
                                  <option key={role} value={role}>{role}</option>
                                ))}
                              </optgroup>
                            )}
                            
                            <option value="add-custom">+ Add Custom Role</option>
                          </select>
                          
                          {showCustomRoleInput && (
                            <div className="flex mt-2 animate-fade-in">
                              <input
                                type="text"
                                value={newCustomRole}
                                onChange={(e) => setNewCustomRole(e.target.value)}
                                placeholder="Enter custom role"
                                className="flex-1 p-1.5 text-sm border dark:border-gray-600 rounded-l bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                autoFocus
                              />
                              <button
                                onClick={() => {
                                  addCustomRole();
                                  setEditForm(prev => ({ ...prev, role: newCustomRole.trim() }));
                                }}
                                className="px-2 py-1 text-xs bg-blue-600 text-white rounded-r hover:bg-blue-700"
                                disabled={!newCustomRole.trim()}
                              >
                                Add
                              </button>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="w-full p-1.5 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                      
                      {/* Avatar Selector for Edit Form */}
                      <div className="my-3">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Profile Picture</label>
                          <button 
                            type="button"
                            onClick={() => setShowEditAvatarSelector(!showEditAvatarSelector)}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {showEditAvatarSelector ? 'Hide Options' : 'Change Picture'}
                          </button>
                        </div>
                        
                        <div className="flex items-center">
                          <img 
                            src={editForm.avatar}
                            alt="Selected avatar"
                            className="w-12 h-12 rounded-full object-cover border-2 border-blue-100 dark:border-blue-900"
                          />
                          <span className="ml-3 text-xs text-gray-500 dark:text-gray-400">
                            {showEditAvatarSelector ? 'Select an avatar or upload your own' : 'Click "Change Picture" to select'}
                          </span>
                        </div>
                        
                        {showEditAvatarSelector && (
                          <div className="mt-2 animate-fade-in">
                            {/* Upload option */}
                            <div className="mb-2 flex flex-col">
                              <div className="flex space-x-2 mb-2">
                                <button
                                  type="button"
                                  onClick={() => setUploadMode('upload')}
                                  className={`px-2 py-1 text-xs rounded ${
                                    uploadMode === 'upload' 
                                      ? 'bg-blue-600 text-white' 
                                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                  }`}
                                >
                                  Upload Image
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setUploadMode('preset')}
                                  className={`px-2 py-1 text-xs rounded ${
                                    uploadMode === 'preset' 
                                      ? 'bg-blue-600 text-white' 
                                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                  }`}
                                >
                                  Use Preset Avatar
                                </button>
                              </div>
                              
                              {uploadMode === 'upload' && (
                                <div>
                                  <input 
                                    type="file"
                                    ref={editFileInputRef}
                                    onChange={(e) => handleFileUpload(e, true)}
                                    accept="image/*"
                                    className="hidden"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => triggerFileInput(true)}
                                    className="flex items-center px-2 py-1.5 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-xs"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                                    </svg>
                                    Select Image
                                  </button>
                                  <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                                    Max size: 2MB
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Preset avatars */}
                            {uploadMode === 'preset' && (
                              <>
                                <div className="text-xs mb-2 text-gray-500 dark:text-gray-400">
                                  Select an avatar:
                                </div>
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditForm({ ...editForm, avatar: defaultAvatar })}
                                    className={`relative p-1 rounded-full ${
                                      editForm.avatar === defaultAvatar 
                                        ? 'ring-2 ring-blue-600 dark:ring-blue-400 bg-blue-50 dark:bg-blue-900/30'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                  >
                                    <img 
                                      src={defaultAvatar}
                                      alt="Default avatar"
                                      className="w-10 h-10 rounded-full object-cover"
                                    />
                                    {editForm.avatar === defaultAvatar && (
                                      <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full w-4 h-4 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                          <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                      </div>
                                    )}
                                  </button>
                                  {avatars.length > 0 && avatars.map((avatar, index) => (
                                    <button
                                      key={index}
                                      type="button"
                                      onClick={() => setEditForm({ ...editForm, avatar })}
                                      className={`relative p-1 rounded-full ${
                                        editForm.avatar === avatar 
                                          ? 'ring-2 ring-blue-600 dark:ring-blue-400 bg-blue-50 dark:bg-blue-900/30'
                                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                      }`}
                                    >
                                      <img 
                                        src={avatar}
                                        alt={`Avatar option ${index + 1}`}
                                        className="w-10 h-10 rounded-full object-cover"
                                      />
                                      {editForm.avatar === avatar && (
                                        <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full w-4 h-4 flex items-center justify-center">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                          </svg>
                                        </div>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Assigned Projects */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Assigned Projects</label>
                        <div className="flex flex-wrap gap-2">
                          {projects.map(project => (
                            <label key={project.id} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={editForm.selectedProjects.includes(project.id)}
                                onChange={() => toggleProjectSelection(project.id, true)}
                                className="h-3 w-3 text-blue-600 focus:ring-blue-500 rounded border-gray-300 dark:border-gray-600"
                              />
                              <span className="ml-1.5 text-xs text-gray-700 dark:text-gray-300">{project.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => updateTeamMember(member.id)}
                          className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => handleCancelEdit(member)}
                          className="px-2 py-1 border text-xs rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{member.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{member.role}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                        
                        <div className="flex mt-2 sm:mt-0">
                          <button
                            onClick={() => {
                              setEditingMemberId(member.id);
                              // Find assigned projects for this member
                              const assignedProjects = projects
                                .filter(project => project.assignedTeam?.includes(member.id))
                                .map(project => project.id);
                                
                              setEditForm({
                                name: member.name,
                                role: member.role,
                                email: member.email,
                                selectedProjects: assignedProjects,
                                avatar: member.avatar,
                              });
                              setShowEditAvatarSelector(false); // Reset the avatar selector
                            }}
                            className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600"
                            aria-label="Edit member"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(member.id)}
                            className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600"
                            aria-label="Delete member"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            </svg>
                          </button>
                          <button
                            onClick={() => setExpandedMemberId(expandedMemberId === member.id ? null : member.id)}
                            className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600"
                            aria-label={expandedMemberId === member.id ? "Collapse" : "Expand"}
                          >
                            {expandedMemberId === member.id ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m18 15-6-6-6 6"></path>
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m6 9 6 6 6-6"></path>
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* Assigned Projects */}
                      {expandedMemberId === member.id && (
                        <div className="mt-4 animate-fade-in">
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assigned Projects</h5>
                          <div className="space-y-2">
                            {getMemberProjects(member.id).length > 0 ? (
                              getMemberProjects(member.id).map(project => (
                                <div key={project.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                                  <span className="text-gray-700 dark:text-gray-300">{project.name}</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">Due: {project.dueDate}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400 italic">No assigned projects</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {teamMembers.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No team members added yet. Add your first team member to get started.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Project Teams View */}
      {activeTab === 'projects' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Teams</h3>
          
          <div className="space-y-6">
            {projects.map(project => (
              <div key={project.id} className="border dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">{project.name}</h4>
                  <div className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {getProjectMembers(project.id).length} members
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {getProjectMembers(project.id).length > 0 ? (
                    getProjectMembers(project.id).map(member => (
                      <div key={member.id} className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover mr-2"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-800 dark:text-white">{member.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{member.role}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic w-full text-center py-2">
                      No team members assigned to this project yet
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 