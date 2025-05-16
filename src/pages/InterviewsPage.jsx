import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import RescheduleModal from '../components/RescheduleModal';

export default function InterviewsPage() {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [search, setSearch] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [searchInterviews, setSearchInterviews] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editInterview, setEditInterview] = useState(null);

  const fetchApplicants = async () => {
    const { data, error } = await supabase
      .from('applicants')
      .select('id, first_name, last_name, status, position, education, institution');
    if (!error) setApplicants(data);
  };

  const fetchInterviews = async () => {
    const { data, error } = await supabase.from('interviews').select('*');
    if (!error) setInterviews(data);
  };

  useEffect(() => {
    fetchApplicants();
    fetchInterviews();
  }, []);

  const handleCheckboxChange = (id) => {
    setSelectedApplicants((prev) =>
      prev.includes(id) ? prev.filter((appId) => appId !== id) : [...prev, id]
    );
  };

  const handleSchedule = async () => {
    const today = new Date();
    const selected = new Date(`${selectedDate}T${selectedTime}`);
    if (selected < today) {
      alert('Cannot schedule in the past.');
      return;
    }

    const payload = selectedApplicants.map((id) => ({
      applicant_id: id,
      date: selectedDate,
      time: selectedTime,
      type: selectedType,
      status: 'Scheduled',
      result: 'Pending',
    }));

    const { error: interviewErr } = await supabase.from('interviews').insert(payload);

    if (!interviewErr) {
      for (let id of selectedApplicants) {
        await supabase.from('applicants').update({ status: 'Pending Interview' }).eq('id', id);
        await supabase.from('applicant_logs').insert({
          applicant_id: id,
          action: 'Scheduled interview → Status set to Pending Interview',
          performed_by: 'Admin',
          timestamp: new Date().toISOString(),
        });
      }

      alert('Interview(s) scheduled!');
      setSelectedApplicants([]);
      fetchApplicants();
      fetchInterviews();
    } else {
      console.error(interviewErr);
    }
  };

  const updateApplicantStatus = async (id, newStatus) => {
    // Step 1: Update status
    const { error: updateError } = await supabase
      .from('applicants')
      .update({ status: newStatus })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating applicant status:', updateError);
      alert('Failed to update status.');
      return;
    }

    // Step 2: Log the change
    const { error: logError } = await supabase.from('applicant_logs').insert({
      applicant_id: id,
      action: `Status changed to ${newStatus}`,
      performed_by: 'Admin',
      timestamp: new Date().toISOString(),
    });

    if (logError) {
      console.error('Error logging status change:', logError);
    }

    // Step 3: If final status, delete interviews
    if (['Offer Sent', 'Rejected', 'Hired'].includes(newStatus)) {
      const { error: deleteError } = await supabase
        .from('interviews')
        .delete()
        .eq('applicant_id', id);

      if (deleteError) {
        console.error('Error deleting interviews:', deleteError);
      }
    }

    // Step 4: Refresh state
    fetchApplicants();
    fetchInterviews();
  };

  const today = new Date().toISOString().split('T')[0];

  const filteredApplicants = applicants
    .filter((a) => a.status === 'Applied')
    .filter((a) =>
      `${a.first_name} ${a.last_name}`.toLowerCase().includes(search.toLowerCase())
    );

  const filteredInterviews = interviews.filter((int) => {
    const matchSearch =
      searchInterviews === '' ||
      `${int.applicant_id}`.includes(searchInterviews) ||
      applicants.find((a) => a.id === int.applicant_id)?.first_name
        .toLowerCase()
        .includes(searchInterviews.toLowerCase());

    const matchStatus =
      filterStatus === '' || int.status.toLowerCase() === filterStatus.toLowerCase();

    const applicant = applicants.find((a) => a.id === int.applicant_id);
    const hideIfFinal = ['Offer Sent', 'Rejected', 'Hired'].includes(applicant?.status);

    return matchSearch && matchStatus && !hideIfFinal;
  });

  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#121212] text-[#3f3f3f] dark:text-white pt-16 p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#1f1f1f] p-6 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4 text-[#b69d73] dark:text-[#e0c79c] text-center">Select Date and Time</h2>
        <div className="flex justify-center">
          <div className="flex flex-wrap gap-4">
            <input type="date" min={today} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border px-3 py-2 rounded dark:bg-[#1a1919] dark:text-white" />
            <input type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="border px-3 py-2 rounded dark:bg-[#24292e] dark:text-white" />
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="border px-3 py-2 rounded dark:bg-[#24292e] dark:text-white">
              <option value="">Types</option>
              <option value="Office">Office</option>
              <option value="Virtual">Virtual</option>
            </select>
            <button onClick={handleSchedule} className="bg-[#b69d73] text-white px-4 py-2 rounded hover:bg-[#a68c65]">Schedule</button>
          </div>
        </div>
      </div>

      {/* Applicant Table */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-[#b69d73] dark:text-[#e0c79c]">Select Applicants</h3>
        <input type="text" placeholder="Search applicants..." value={search} onChange={(e) => setSearch(e.target.value)} className="border px-3 py-2 rounded text-sm dark:bg-[#24292e] dark:text-white" />
      </div>
      <table className="w-full border text-left text-sm mb-10">
        <thead>
          <tr className="bg-[#f9f9f9] dark:bg-[#24292e]">
            <th className="px-4 py-2 border"></th>
            <th className="px-4 py-2 border text-[#b69d73] dark:text-[#e0c79c]">Name</th>
            <th className="px-4 py-2 border">Position</th>
            <th className="px-4 py-2 border">Education</th>
            <th className="px-4 py-2 border">Institution</th>
          </tr>
        </thead>
        <tbody>
          {filteredApplicants.map((a) => (
            <tr key={a.id} className="border hover:bg-gray-100 dark:hover:bg-gray-800">
              <td className="px-4 py-2 border">
                <input type="checkbox" checked={selectedApplicants.includes(a.id)} onChange={() => handleCheckboxChange(a.id)} />
              </td>
              <td className="px-4 py-2 border">{a.first_name} {a.last_name}</td>
              <td className="px-4 py-2 border">{a.position}</td>
              <td className="px-4 py-2 border">{a.education}</td>
              <td className="px-4 py-2 border">{a.institution}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Search + Filter */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
        <h3 className="text-lg font-semibold text-[#b69d73] dark:text-[#e0c79c]">Scheduled Interviews</h3>
        <input type="text" placeholder="Search ID or Name..." value={searchInterviews} onChange={(e) => setSearchInterviews(e.target.value)} className="border px-3 py-2 rounded text-sm dark:bg-[#24292e] dark:text-white" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border px-3 py-2 rounded text-sm dark:bg-[#24292e] dark:text-white">
          <option value="">All</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Rescheduled">Rescheduled</option>
        </select>
      </div>

      {/* Interview List */}
      <ul className="space-y-2 text-sm">
        {filteredInterviews.map((int) => {
          const applicant = applicants.find((a) => a.id === int.applicant_id);
          return (
            <li key={int.id} className="bg-white dark:bg-[#1f1f1f] p-4 rounded border dark:border-gray-700">
              <div className="flex flex-wrap justify-between gap-4">
                <div className="text-sm leading-relaxed space-y-1">
                  <p><strong>Date:</strong> {int.date} &nbsp;&nbsp; <strong>Time:</strong> {int.time}</p>
                  <p><strong>Type:</strong> {int.type} &nbsp;&nbsp; <strong>Status:</strong> {int.status}</p>
                  <p><strong>Applicant ID:</strong> {int.applicant_id} &nbsp;&nbsp; <strong>Name:</strong> {applicant ? `${applicant.first_name} ${applicant.last_name}` : 'N/A'}</p>
                </div>
                <div className="flex flex-wrap gap-2 items-start">
                  <button onClick={() => { setEditInterview(int); setShowModal(true); }} className="px-3 py-1 bg-[#b69d73] text-white rounded hover:bg-[#a88c65]">Reschedule</button>
                  <button onClick={() => updateApplicantStatus(int.applicant_id, 'Offer Sent')} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500">Send Offer</button>
                  <button onClick={() => updateApplicantStatus(int.applicant_id, 'Rejected')} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500">Reject</button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Reschedule Modal */}
      {showModal && (
        <RescheduleModal
          interview={editInterview}
          onClose={() => {
            setShowModal(false);
            setEditInterview(null);
          }}
          onReschedule={() => {
            fetchInterviews();
            fetchApplicants();
          }}
        />
      )}
    </div>
  );
}
