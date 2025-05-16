import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import WorkHistoryModal from './WorkHistoryModal';

export default function WorkHistoryList({ applicantId }) {
  const [history, setHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('work_history')
      .select('*')
      .eq('applicant_id', applicantId)
      .order('start_date', { ascending: false });

    if (!error) setHistory(data || []);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="border p-4 rounded dark:border-gray-700 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-[#b69d73]">Work History</h4>
        <button
          onClick={() => setShowModal(true)}
          className="text-sm bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600"
        >
          + Add
        </button>
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-gray-500">No records available.</p>
      ) : (
        <ul className="text-sm space-y-2">
          {history.map((item) => (
            <li key={item.id} className="border-b pb-2">
              <p className="font-semibold">{item.company}</p>
              <p>{item.position_title}</p>
              <p className="text-xs text-gray-400">
                {new Date(item.start_date).toLocaleDateString()} – {new Date(item.end_date).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}

      {showModal && (
        <WorkHistoryModal
          applicantId={applicantId}
          onClose={() => setShowModal(false)}
          onSave={fetchHistory}
        />
      )}
    </div>
  );
}
