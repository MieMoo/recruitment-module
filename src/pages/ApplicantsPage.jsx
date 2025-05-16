import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import AddApplicantModal from '../components/AddApplicantModal';
import ApplicantDetailsModal from '../components/ApplicantDetailModal';

const statusLabels = {
  Applied: 'New',
  'Pending Interview': 'Pending Interview',
  'Offer Sent': 'Offer Sent',
  Hired: 'Hired',
  Rejected: 'Rejected',
};

const statusStyles = {
  Applied: 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200',
  'Pending Interview': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200',
  'Offer Sent': 'bg-[#b69d73]/20 text-[#b69d73] dark:bg-[#a88c65]/30 dark:text-[#d9c7aa]',
  Hired: 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200',
};

export default function ApplicantsPage() {
  const [showModal, setShowModal] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState('All Positions');
  const [selectedDate, setSelectedDate] = useState('');
  const [searchName, setSearchName] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const applicantsPerPage = 5;

  const fetchApplicants = async () => {
    const { data, error } = await supabase
      .from('applicants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applicants:', error);
    } else {
      setApplicants(data);
      setFilteredApplicants(data);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  useEffect(() => {
    let results = [...applicants];

    if (selectedStatuses.length > 0) {
      results = results.filter((a) => selectedStatuses.includes(a.status));
    }

    if (selectedPosition !== 'All Positions') {
      results = results.filter((a) => a.position === selectedPosition);
    }

    if (selectedDate) {
      results = results.filter((a) => new Date(a.created_at) >= new Date(selectedDate));
    }

    if (searchName.trim() !== '') {
      const searchLower = searchName.toLowerCase();
      results = results.filter(
        (a) =>
          a.first_name.toLowerCase().includes(searchLower) ||
          a.last_name.toLowerCase().includes(searchLower)
      );
    }

    setFilteredApplicants(results);
    setCurrentPage(1);
  }, [selectedStatuses, selectedPosition, selectedDate, searchName, applicants]);

  const toggleStatus = (status) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const handleRefresh = () => {
    fetchApplicants();
    setShowModal(false);
    setSelectedApplicant(null);
  };

  const indexOfLast = currentPage * applicantsPerPage;
  const indexOfFirst = indexOfLast - applicantsPerPage;
  const currentApplicants = filteredApplicants.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredApplicants.length / applicantsPerPage);

  return (
    <div className="flex min-h-screen pt-16 overflow-hidden bg-[#f8f8f8] dark:bg-[#1e1e1e] text-[#3f3f3f] dark:text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#1a1919] border-r border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <input
          type="text"
          placeholder="Search applicants..."
          className="w-full px-3 py-2 border rounded text-sm bg-white dark:bg-[#1a1919] text-black dark:text-white"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />

        {/* Status Filter */}
        <div>
          <h3 className="font-medium mb-2">Status</h3>
          <div className="space-y-2 text-sm">
            {Object.keys(statusLabels).map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={status}
                  checked={selectedStatuses.includes(status)}
                  onChange={() => toggleStatus(status)}
                />
                <label htmlFor={status}>{statusLabels[status]}</label>
              </div>
            ))}
            <button
              onClick={() => setSelectedStatuses([])}
              className="text-xs text-blue-600 mt-2 hover:underline"
            >
              Clear Filter
            </button>
          </div>
        </div>

        {/* Position Filter */}
        <div>
          <h3 className="font-medium mb-2">Position</h3>
          <select
            className="w-full border px-3 py-2 rounded text-sm bg-white dark:bg-[#1f1f1f] text-black dark:text-white"
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
          >
            <option>All Positions</option>
            <option>HR</option>
            <option>Recruiter</option>
            <option>Payroll</option>
            <option>Attendance</option>
            <option>Purchasing</option>
            <option>Inventory</option>
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <h3 className="font-medium mb-2">Date Range</h3>
          <input
            type="date"
            className="w-full px-3 py-2 border rounded text-sm bg-white dark:bg-[#1f1f1f] text-black dark:text-white"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button
            onClick={() => setSelectedDate('')}
            className="text-xs text-blue-600 mt-2 hover:underline"
          >
            Clear Date
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 pt-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-medium">Applicants</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#b69d73] text-white px-4 py-2 rounded shadow-sm hover:bg-[#a68c62]"
          >
            + Add New Applicant
          </button>
        </div>

        <div className="space-y-4">
          {currentApplicants.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300">No applicants found.</p>
          ) : (
            currentApplicants.map((applicant) => (
              <div
                key={applicant.id}
                onClick={() => setSelectedApplicant(applicant)}
                className="cursor-pointer bg-white dark:bg-[#1f1f1f] border border-gray-300 dark:border-gray-700 rounded-lg p-6 flex justify-between items-center hover:shadow"
              >
                <div>
                  <h2 className="text-lg font-medium">
                    {applicant.first_name} {applicant.last_name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{applicant.position}</p>
                  <p className="text-sm mt-1">📧 {applicant.email}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    📅 Applied on {new Date(applicant.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-sm font-medium px-4 py-2 rounded ${
                    statusStyles[applicant.status] || 'bg-gray-200 text-gray-700 dark:bg-[#24292e] dark:text-white'
                  }`}
                >
                  {statusLabels[applicant.status] || 'N/A'}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 mb-10 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded border ${
                  currentPage === i + 1
                    ? 'bg-[#b69d73] text-white'
                    : 'bg-white dark:bg-[#24292e] dark:text-white'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {showModal && <AddApplicantModal onClose={handleRefresh} />}
      {selectedApplicant && (
        <ApplicantDetailsModal
          applicant={selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
          onStatusUpdate={handleRefresh}
        />
      )}
    </div>
  );
}
