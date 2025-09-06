import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, User } from 'lucide-react';
import { InstructorDto, InstructorService } from '@/lib/services/instructorService';

interface InstructorSelectProps {
  value?: number | null;
  onChange: (instructorId: number | null, instructor: InstructorDto | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
}

export const InstructorSelect: React.FC<InstructorSelectProps> = ({
  value,
  onChange,
  placeholder = "Select an instructor...",
  disabled = false,
  error,
  required = false
}) => {
  const [instructors, setInstructors] = useState<InstructorDto[]>([]);
  const [filteredInstructors, setFilteredInstructors] = useState<InstructorDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<InstructorDto | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Load all instructors on component mount
  useEffect(() => {
    const loadInstructors = async () => {
      setLoading(true);
      try {
        const data = await InstructorService.getAllActiveInstructors();
        setInstructors(data);
        setFilteredInstructors(data);
        
        // If there's a selected value, find the corresponding instructor
        if (value) {
          const selected = data.find(instructor => instructor.id === value);
          setSelectedInstructor(selected || null);
        }
      } catch (error) {
        console.error('Failed to load instructors:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInstructors();
  }, [value]);

  // Filter instructors based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredInstructors(instructors);
    } else {
      const filtered = instructors.filter(instructor =>
        InstructorService.getFullName(instructor).toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredInstructors(filtered);
    }
  }, [searchTerm, instructors]);

  const handleSelect = (instructor: InstructorDto) => {
    setSelectedInstructor(instructor);
    onChange(instructor.id, instructor);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    setSelectedInstructor(null);
    onChange(null, null);
    setSearchTerm('');
  };

  return (
    <div className="relative" aria-required={required}>
      <div className="relative">
        <div
          className={`
            w-full px-3 py-2 border rounded-md bg-white cursor-pointer
            flex items-center justify-between min-h-[40px]
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400'}
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : ''}
          `}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="flex items-center flex-1">
            <User className="w-4 h-4 text-gray-400 mr-2" />
            {selectedInstructor ? (
              <span className="text-gray-900">
                {InstructorService.formatForDisplay(selectedInstructor)}
              </span>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center">
            {selectedInstructor && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="text-gray-400 hover:text-gray-600 mr-2"
              >
                ×
              </button>
            )}
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search instructors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Options list */}
            <div className="max-h-48 overflow-y-auto">
              {loading ? (
                <div className="p-3 text-center text-gray-500">Loading instructors...</div>
              ) : filteredInstructors.length === 0 ? (
                <div className="p-3 text-center text-gray-500">
                  {searchTerm ? 'No instructors found' : 'No instructors available'}
                </div>
              ) : (
                filteredInstructors.map((instructor) => (
                  <div
                    key={instructor.id}
                    className={`
                      px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center
                      ${selectedInstructor?.id === instructor.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                    `}
                    onClick={() => handleSelect(instructor)}
                  >
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <div className="flex-1">
                      <div className="font-medium">
                        {InstructorService.getFullName(instructor)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {instructor.username} • {instructor.department || 'No department'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Click outside handler */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
