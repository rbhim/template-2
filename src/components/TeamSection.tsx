'use client';

import { useState, useEffect } from 'react';
import { Project, TeamMember } from '../lib/types';

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
}

// Sample avatars for team members
const avatars = [
  'https://randomuser.me/api/portraits/men/1.jpg',
  'https://randomuser.me/api/portraits/women/2.jpg',
  'https://randomuser.me/api/portraits/men/3.jpg',
  'https://randomuser.me/api/portraits/women/4.jpg',
  'https://randomuser.me/api/portraits/men/5.jpg',
  'https://randomuser.me/api/portraits/women/6.jpg',
];

// Sample roles for the dropdown
const roles = [
  'Project Manager',
  'Traffic Engineer',
  'Transportation Planner',
  'Civil Engineer',
  'Data Analyst',
  'Field Technician',
  'Administrative',
];

export default function TeamSection({ projects, initialTeamMembers = [], onUpdateTeamMembers }: TeamSectionProps) {
  // Team members state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
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
          avatar: avatars[0],
        },
        {
          id: '2',
          name: 'Jane Smith',
          role: 'Traffic Engineer',
          email: 'jane.smith@example.com',
          avatar: avatars[1],
        },
        {
          id: '3',
          name: 'Robert Johnson',
          role: 'Transportation Planner',
          email: 'robert.johnson@example.com',
          avatar: avatars[2],
        },
      ]);
    }
  }, [initialTeamMembers]);
  
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMember, setNewMember] = useState<MemberFormData>({
    name: '',
    role: 'Traffic Engineer',
    email: '',
    selectedProjects: [],
  });
  const [activeTab, setActiveTab] = useState<'members' | 'projects'>('members');
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<MemberFormData>({
    name: '',
    role: '',
    email: '',
    selectedProjects: [],
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
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
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
    
    setNewMember({
      name: '',
      role: 'Traffic Engineer',
      email: '',
      selectedProjects: [],
    });
    setIsAddingMember(false);
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
          }
        : member
    );
    
    updateTeamMembers(updatedMembers);
    setEditingMemberId(null);
    
    // Update project assignments is not implemented here as we don't have access to update projects
  };

  // Delete team member
  const deleteTeamMember = (id: string) => {
    const updatedMembers = teamMembers.filter(member => member.id !== id);
    updateTeamMembers(updatedMembers);
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

  // Handle project selection in add/edit forms
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

      {/* Team Members View */}
      {activeTab === 'members' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h3>
            <button 
              onClick={() => setIsAddingMember(!isAddingMember)}
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
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
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

              <button
                onClick={addTeamMember}
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
              >
                Add Team Member
              </button>
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
                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                            className="w-full p-1.5 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            {roles.map(role => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
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
                          onClick={() => setEditingMemberId(null)}
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
                              });
                            }}
                            className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600"
                            aria-label="Edit member"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteTeamMember(member.id)}
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