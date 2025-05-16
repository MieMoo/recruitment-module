import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const WorkHistoryModal = ({ applicantId, onClose, onSave }) => {
  const today = new Date().toISOString().split('T')[0];
  const defaultStart = new Date(new Date().setFullYear(new Date().getFullYear() - 2)).toISOString().split('T')[0];

  const [entry, setEntry] = useState({
    company: '',
    position_title: '',
    start_date: defaultStart,
    end_date: today,
  });

  const handleChange = (e) => {
    setEntry((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    if (!entry.company || !entry.position_title) {
      alert('Please fill in all fields.');
      return;
    }

    const { error } = await supabase.from('work_history').insert([
      {
        ...entry,
        applicant_id: applicantId,
      },
    ]);

    if (error) {
      console.error(error);
      alert('Error saving work history.' + error.message);
    } else {
      alert('Work history saved!');
      onSave?.(); // optional callback
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 text-black dark:text-white w-full max-w-md rounded-lg shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">Add Work History</h3>
        <div className="space-y-4">
          <input
            type="text"
            name="company"
            value={entry.company}
            onChange={handleChange}
            placeholder="Company Name"
            className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
          />
          <input
            type="text"
            name="position_title"
            value={entry.position_title}
            onChange={handleChange}
            placeholder="Position Title"
            className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              name="start_date"
              value={entry.start_date}
              onChange={handleChange}
              className="border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
            />
            <input
              type="date"
              name="end_date"
              value={entry.end_date}
              onChange={handleChange}
              className="border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 dark:border-gray-500 dark:text-white dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkHistoryModal;
