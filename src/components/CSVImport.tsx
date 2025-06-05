'use client';

import { useState, useCallback, useRef } from 'react';
import { Project, Task, ProjectStatus, ProjectPriority } from '../lib/types';

interface CSVImportProps {
  onImportProjects: (projects: Project[]) => void;
  onClose: () => void;
}

export default function CSVImport({ onImportProjects, onClose }: CSVImportProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  }, []);

  const processFile = (file: File) => {
    setFileName(file.name);
    setError(null);
    
    // Check file type
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file');
      return;
    }

    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const projects = parseCSV(event.target?.result as string);
        onImportProjects(projects);
        setIsProcessing(false);
        onClose();
      } catch (err) {
        setError(`Failed to process CSV: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsProcessing(false);
      }
    };
    
    reader.onerror = () => {
      setError('Failed to read file');
      setIsProcessing(false);
    };
    
    reader.readAsText(file);
  };

  const parseCSV = (csvContent: string): Project[] => {
    const lines = csvContent.split('\n');
    
    // Validate headers
    const headers = lines[0].split(',').map(h => h.trim());
    const requiredHeaders = ['name', 'client', 'clientType', 'startDate', 'dueDate', 'status', 'priority'];
    
    for (const header of requiredHeaders) {
      if (!headers.includes(header)) {
        throw new Error(`Missing required column: ${header}`);
      }
    }
    
    const projects: Project[] = [];
    
    // Skip header row (i=0)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      const values = parseCSVLine(line);
      
      if (values.length !== headers.length) {
        throw new Error(`Invalid CSV format at line ${i + 1}`);
      }
      
      // Map CSV values to object with keys from headers
      const rowData: Record<string, string> = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index];
      });
      
      // Determine tasks based on client type
      let tasks: Task[] = [];
      const clientType = rowData.clientType?.toLowerCase().trim();
      
      if (clientType === 'private') {
        // Use default tasks for private clients
        tasks = [
          { id: '1', name: 'TOR Submitted', completed: false, order: 1 },
          { id: '2', name: 'Data Collection', completed: false, order: 2 },
          { id: '3', name: 'Transit and AT Network', completed: false, order: 3 },
          { id: '4', name: 'Traffic Analysis', completed: false, order: 4 },
          { id: '5', name: 'Site Plan Review', completed: false, order: 5 },
          { id: '6', name: 'Site Circulation and Access Review', completed: false, order: 6 },
          { id: '7', name: 'Sightline Review', completed: false, order: 7 },
          { id: '8', name: 'Turn Lane Warrants', completed: false, order: 8 },
          { id: '9', name: 'Signal Warrants', completed: false, order: 9 },
          { id: '10', name: 'Parking and Loading Review', completed: false, order: 10 },
          { id: '11', name: 'TDM Plan', completed: false, order: 11 },
          { id: '12', name: 'Draft Report Submitted', completed: false, order: 12 },
          { id: '13', name: 'Comments Received', completed: false, order: 13 },
          { id: '14', name: 'Final Report Submitted', completed: false, order: 14 },
        ];
      } else {
        // Public client gets a placeholder task to be filled in later
        tasks = [{ id: '1', name: 'Define project scope', completed: false, order: 1 }];
      }
      
      // Validate project status and priority
      const status = validateStatus(rowData.status);
      const priority = validatePriority(rowData.priority);
      
      const project: Project = {
        id: Date.now().toString() + i, // Generate unique ID
        name: rowData.name,
        client: rowData.client,
        clientType: clientType === 'private' ? 'private' : 'public',
        startDate: rowData.startDate,
        dueDate: rowData.dueDate,
        status,
        priority,
        tasks,
        notes: [],
        assignedTeam: []
      };
      
      projects.push(project);
    }
    
    return projects;
  };
  
  // Helper function to properly parse CSV line considering quoted values
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    // Don't forget the last field
    result.push(current);
    return result;
  };
  
  const validateStatus = (status: string): ProjectStatus => {
    const validStatuses: ProjectStatus[] = ['on-track', 'at-risk', 'delayed', 'completed'];
    const normalizedStatus = status.toLowerCase().trim();
    
    if (validStatuses.includes(normalizedStatus as ProjectStatus)) {
      return normalizedStatus as ProjectStatus;
    }
    return 'on-track'; // Default
  };
  
  const validatePriority = (priority: string): ProjectPriority => {
    const validPriorities: ProjectPriority[] = ['low', 'medium', 'high'];
    const normalizedPriority = priority.toLowerCase().trim();
    
    if (validPriorities.includes(normalizedPriority as ProjectPriority)) {
      return normalizedPriority as ProjectPriority;
    }
    return 'medium'; // Default
  };

  const downloadSampleCSV = () => {
    const sampleContent = `name,client,clientType,startDate,dueDate,status,priority
"Downtown Traffic Study","City of Example","private","2023-12-01","2024-02-15","on-track","high"
"Highway Capacity Analysis","State DOT","public","2023-11-15","2024-01-30","at-risk","medium"
"Residential Development Review","Private Developer Inc.","private","2024-01-05","2024-03-20","on-track","low"`;
    
    const blob = new Blob([sampleContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Import Projects from CSV</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20' : 'border-gray-300 dark:border-gray-600'
          } transition-colors duration-150`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".csv"
            className="hidden"
          />
          
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            {fileName ? `File selected: ${fileName}` : 'Drag and drop your CSV file here'}
          </p>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            or
          </p>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Browse Files'}
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded">
            {error}
          </div>
        )}
        
        <div className="mt-6 flex justify-between">
          <button
            onClick={downloadSampleCSV}
            className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Download Sample Template
          </button>
          
          <div>
            <button
              onClick={onClose}
              className="px-4 py-2 border dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mr-2"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 