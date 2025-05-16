import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function RescheduleModal({ interview, onClose, onReschedule }) {
  const [newDate, setNewDate] = useState(interview.date);
  const [newTime, setNewTime] = useState(interview.time);

  const today = new Date().toISOString().split('T')[0];

  const handleUpdate = async () => {
    const scheduledDateTime = new Date(`${newDate}T${newTime}`);
    if (scheduledDateTime < new Date()) {
      alert('Cannot schedule in the past.');
      return;
    }

    const { error } = await supabase
      .from('interviews')
      .update({ 
        date: newDate, 
        time: newTime, 
        status: 'Rescheduled' // ✅ now marks correctly!
      })
      .eq('id', interview.id);

    if (!error) {
      await supabase.from('applicant_logs').insert({
        applicant_id: interview.applicant_id,
        action: 'Interview rescheduled',
        performed_by: 'Admin',
        timestamp: new Date().toISOString(),
      });

      alert('Interview rescheduled!');
      onReschedule();
      onClose();
    } else {
      console.error(error);
      alert('Error updating schedule: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-[#b69d73] dark:text-[#e0c79c]">Reschedule Interview</h2>

        <div className="space-y-4">
          <div>
            <label className="block mb-1">New Date</label>
            <input
              type="date"
              min={today}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block mb-1">New Time</label>
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">Cancel</button>
          <button onClick={handleUpdate} className="px-4 py-2 bg-[#b69d73] text-white rounded hover:bg-[#a68c65]">Update</button>
        </div>
      </div>
    </div>
  );
}
