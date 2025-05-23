import React, { useState } from 'react';
import { Event, createEvent, updateEventInfo } from '../lib/eventApi';

interface EventFormProps {
  initialData?: Partial<Event>;
  onSubmitSuccess?: (event: Event) => void;
  isEditing?: boolean;
  eventId?: string;
}

export const EventForm: React.FC<EventFormProps> = ({ 
  initialData = {}, 
  onSubmitSuccess,
  isEditing = false,
  eventId
}) => {
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    description: '',
    date: '',
    location: '',
    price: 0,
    status: 'DRAFT',
    ...initialData
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [dateError, setDateError] = useState<string>('');

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Fungsi untuk validasi tanggal
  const validateDate = (dateString: string): boolean => {
    if (!dateString) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset jam ke 00:00:00
    
    const selectedDate = new Date(dateString);
    selectedDate.setHours(0, 0, 0, 0);
    
    return selectedDate >= today;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Validasi khusus untuk field tanggal
    if (name === 'date') {
      const isValid = validateDate(value);
      if (!isValid) {
        setDateError('Event date must be today or in the future');
      } else {
        setDateError('');
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi tanggal sebelum submit
    if (formData.date && !validateDate(formData.date)) {
      setDateError('Event date must be today or in the future');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      let result;
      
      if (isEditing && eventId) {
        result = await updateEventInfo(eventId, formData);
      } else {
        result = await createEvent(formData as Event);
      }
      
      if (onSubmitSuccess) {
        onSubmitSuccess(result);
      }
    } catch (err) {
      setError('Failed to save event. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Event Title*
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title || ''}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows={4}
          className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Date*
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formatDateForInput(formData.date)}
          onChange={handleChange}
          required
          className={`w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 ${
            dateError ? 'border-red-500' : ''
          }`}
          min={formatDateForInput(new Date().toISOString())} // Set min attribute to today
        />
        {dateError && (
          <p className="mt-1 text-sm text-red-600">{dateError}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location*
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location || ''}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
          Price (Rp)*
        </label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price || 0}
          onChange={handleChange}
          required
          min="0"
          step="1000"
          className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      {isEditing && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <div className="mt-1">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
              formData.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 
              formData.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
              'bg-gray-100 text-gray-800'
            }`}>
              {formData.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Status tidak dapat diubah melalui form ini. Gunakan tombol di halaman detail event.
          </p>
        </div>
      )}
      
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
      </button>
    </form>
  );
};