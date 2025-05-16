import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function OnboardingPage() {
  const [applicants, setApplicants] = useState([]);

  const fetchApplicants = async () => {
    const { data, error } = await supabase
      .from('applicants')
      .select('*')
      .in('status', ['Interviewed', 'Offer Sent'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applicants:', error);
    } else {
      setApplicants(data);
    }
  };

  const handleHire = async (id) => {
    const { error } = await supabase
      .from('applicants')
      .update({ status: 'Hired' })
      .eq('id', id);

    if (error) {
      alert('Failed to mark as hired.');
    } else {
      fetchApplicants();
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  return (
    <div className="min-h-screen pt-16 bg-white dark:bg-[#0f172a] text-[#3f3f3f] dark:text-white p-6">
      <h2 className="text-2xl font-semibold text-[#b69d73] mb-6 dark:text-[#e0c89b]">Applicant’s Lists</h2>

      <div className="space-y-6">
        {applicants.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-300">No applicants available for onboarding.</p>
        ) : (
          applicants.map((applicant) => (
            <div
              key={applicant.id}
              className="border border-gray-300 dark:border-gray-600 rounded p-4 shadow-sm bg-[#fdfdfd] dark:bg-[#1e293b]"
            >
              <p className="font-semibold text-[#b69d73] dark:text-[#e0c89b]">
                Name: {applicant.first_name} {applicant.last_name}
              </p>
              <p>Position: {applicant.position || 'N/A'}</p>
              <p>Status: {applicant.status}</p>
              <p>Date Applied: {new Date(applicant.created_at).toLocaleDateString()}</p>
              <p>When to start: TBD</p>
              <button
                onClick={() => handleHire(applicant.id)}
                className="mt-2 px-4 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 dark:bg-green-700 dark:text-white dark:hover:bg-green-600"
              >
                Hire
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}