import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import WorkHistoryModal from './WorkHistoryModal';

const statusOptions = [
  { label: 'New', value: 'Applied' },
  { label: 'Pending Interview', value: 'Pending Interview' },
  { label: 'Offer Sent', value: 'Offer Sent' },
  { label: 'Rejected', value: 'Rejected' },
];

export default function ApplicantDetailsModal({ applicant, onClose, onStatusUpdate }) {
  const [status, setStatus] = useState(applicant.status);
  const [workHistory, setWorkHistory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [showWorkModal, setShowWorkModal] = useState(false);
  const navigate = useNavigate();

  const fetchWorkHistory = async () => {
    const { data, error } = await supabase
      .from('work_history')
      .select('*')
      .eq('applicant_id', applicant.id)
      .order('start_date', { ascending: false });

    if (!error) setWorkHistory(data || []);
  };

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('applicant_logs')
      .select('*')
      .eq('applicant_id', applicant.id)
      .order('timestamp', { ascending: false });

    if (!error) setLogs(data || []);
  };

  useEffect(() => {
    fetchWorkHistory();
    fetchLogs();
  }, [applicant.id]);

  const logAction = async (action) => {
    await supabase.from('applicant_logs').insert([
      {
        applicant_id: applicant.id,
        action,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);

    const { error } = await supabase
      .from('applicants')
      .update({ status: newStatus })
      .eq('id', applicant.id);

    if (error) {
      alert('Status update failed.');
      console.error(error);
    } else {
      await logAction(newStatus === 'Rejected' ? 'Rejected' : `Status changed to ${newStatus}`);
      fetchLogs();
      onStatusUpdate();
    }
  };

  const handleHire = async () => {
    const { error } = await supabase
      .from('applicants')
      .update({ status: 'Hired' })
      .eq('id', applicant.id);

    if (error) {
      alert('Failed to mark as hired.');
      console.error(error);
    } else {
      alert('Applicant marked as Hired!');
      await logAction('Marked as Hired');
      onStatusUpdate();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-10"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 text-black dark:text-white w-full max-w-3xl rounded-lg shadow-lg p-8 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-semibold text-[#b69d73]">
            {applicant.first_name} {applicant.last_name}
          </h2>

          <div className="flex items-center gap-3">
            <select
              value={status}
              onChange={handleStatusChange}
              className="border px-3 py-1 rounded text-sm bg-white dark:bg-gray-800 dark:text-white"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              onClick={onClose}
              className="bg-[#b69d73] text-white px-3 py-1 rounded hover:bg-[#a88c65]"
            >
              Back
            </button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="mb-4 text-sm space-y-1">
          <p>Email: <span className="text-gray-700 dark:text-gray-300">{applicant.email}</span></p>
          <p>Phone Number: <span className="text-gray-700 dark:text-gray-300">{applicant.phone || 'N/A'}</span></p>
          <p>Job Position: <span className="text-gray-700 dark:text-gray-300">{applicant.position || 'N/A'}</span></p>
          <p>Recruiter: <span className="text-gray-700 dark:text-gray-300">{applicant.recruiter || 'N/A'}</span></p>
          <p>Date Applied: <span className="text-gray-700 dark:text-gray-300">{new Date(applicant.created_at).toLocaleDateString()}</span></p>
        </div>

        {/* Applicant Details */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="border p-4 rounded dark:border-gray-700">
            <h4 className="font-semibold text-[#b69d73] mb-2">Applicant</h4>
            <p>Degree: {applicant.education || 'N/A'}</p>
            <p>Availability: {applicant.availability || 'N/A'}</p>
          </div>

          <div className="border p-4 rounded dark:border-gray-700">
            <h4 className="font-semibold text-[#b69d73] mb-2">Sourcing</h4>
            <p>Source: {applicant.source || 'N/A'}</p>
            <p>Medium: {applicant.medium || 'N/A'}</p>
          </div>
        </div>

        {/* Resume */}
        {applicant.document_url && (
          <div className="border p-4 rounded dark:border-gray-700 mb-4">
            <h4 className="font-semibold text-[#b69d73] mb-2">Resume</h4>
            <a
              href={applicant.document_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View Attached Resume
            </a>
          </div>
        )}

        {/* Work History */}
        <div className="border p-4 rounded dark:border-gray-700 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-[#b69d73]">Work History</h4>
            <button
              onClick={() => setShowWorkModal(true)}
              className="text-sm bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600"
            >
              + Add
            </button>
          </div>

          {workHistory.length === 0 ? (
            <p className="text-sm text-gray-500">No records available.</p>
          ) : (
            <ul className="text-sm space-y-2">
              {workHistory.map((item) => (
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
        </div>

        {/* Action Logs */}
        {logs.length > 0 && (
          <div className="border p-4 rounded dark:border-gray-700 mb-4">
            <h4 className="font-semibold text-[#b69d73] mb-2">Applicant Logs</h4>
            <ul className="text-sm list-disc pl-5">
              {logs.map((log) => (
                <li key={log.id} className="text-gray-400">
                  {log.action} on {new Date(log.timestamp).toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          {(status === 'Applied' || status === 'Interviewed') && (
            <button
              onClick={() => navigate('/interviews')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Schedule Interview
            </button>
          )}

          {status === 'Offered' && (
            <button
              onClick={handleHire}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Mark as Hired
            </button>
          )}
        </div>

        {showWorkModal && (
          <WorkHistoryModal
            applicantId={applicant.id}
            onClose={() => setShowWorkModal(false)}
            onSave={fetchWorkHistory}
          />
        )}
      </div>
    </div>
  );
}