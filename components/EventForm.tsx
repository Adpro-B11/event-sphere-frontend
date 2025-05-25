import React, { useState } from "react";

export interface EventFormValues {
  title: string;
  description?: string;
  date: string;
  location: string;
  price: number;
}

interface EventFormProps {
  initialData?: Partial<EventFormValues>;
  onSubmit: (values: EventFormValues) => void;
  isSubmitting?: boolean;
  error?: string | null;
}

export const EventForm: React.FC<EventFormProps> = ({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  error,
}) => {
  const [formData, setFormData] = useState<EventFormValues>({
    title:       initialData.title || "",
    description: initialData.description || "",
    date:        initialData.date || "",
    location:    initialData.location || "",
    price:       initialData.price ?? 0,
  });
  const [dateError, setDateError] = useState<string>("");

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  const validateDate = (dateString: string): boolean => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(dateString);
    selected.setHours(0, 0, 0, 0);
    return selected >= today;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "date") {
      if (!validateDate(value)) {
        setDateError("Event date must be today or later");
      } else {
        setDateError("");
      }
    }
    setFormData(prev => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDate(formData.date)) {
      setDateError("Event date must be today or later");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Event Title*
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Date*
        </label>
        <input
          id="date"
          name="date"
          type="date"
          value={formatDateForInput(formData.date)}
          onChange={handleChange}
          required
          min={formatDateForInput(new Date().toISOString())}
          className={`w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 ${
            dateError ? "border-red-500" : ""
          }`}
        />
        {dateError && (
          <p className="mt-1 text-sm text-red-600">{dateError}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Location*
        </label>
        <input
          id="location"
          name="location"
          type="text"
          value={formData.location}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="price"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Price (Rp)*
        </label>
        <input
          id="price"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          required
          min={0}
          step={1000}
          className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "Saving..." : "Create Event"}
      </button>
    </form>
  );
};
