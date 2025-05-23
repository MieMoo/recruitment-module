import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const AddApplicantModal = ({ onClose }) => {
  const today = new Date().toISOString().split("T")[0];
  const defaultDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split("T")[0];

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    birthdate: '',
    sex: '',
    phone: '',
    position: '',
    education: '',
    institution: '',
    start_date: defaultDate,
    end_date: today,
    source: '',
    notes: '',
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[0-9]{10,15}$/;

      if (!emailRegex.test(form.email)) return alert('Invalid email.');
      if (!phoneRegex.test(form.phone)) return alert('Invalid phone number.');
      if (!resumeFile) return alert('Please upload a resume.');

      // Duplicate check
      const { data: existing, error: dupError } = await supabase
        .from('applicants')
        .select('id')
        .or(
          `and(first_name.eq.${form.first_name},last_name.eq.${form.last_name}),email.eq.${form.email},phone.eq.${form.phone}`
        );

      if (dupError) {
        console.error('Duplicate check failed:', dupError.message);
        return alert('Error checking for duplicates.');
      }

      if (existing.length > 0) {
        return alert('Duplicate applicant found (name, email, or phone already exists). Submission blocked.');
      }

      // Upload file
      const filePath = `resumes/${Date.now()}_${resumeFile.name}`;
      const { error: fileError } = await supabase.storage
        .from('applicant-docs')
        .upload(filePath, resumeFile);
      if (fileError) return alert('File upload failed.');

      const publicUrl = supabase
        .storage
        .from('applicant-docs')
        .getPublicUrl(filePath).data.publicUrl;

      const age = new Date().getFullYear() - new Date(form.birthdate).getFullYear();

      const { error } = await supabase.from('applicants').insert([
        {
          ...form,
          age,
          document_url: publicUrl,
          status: 'Applied',
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) alert(error.message);
      else {
        alert('Applicant submitted!');
        setForm({});
        setResumeFile(null);
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-10" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#1f1f1f] text-black dark:text-white w-full max-w-4xl rounded-lg shadow-lg p-8 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-6">Add New Applicant</h2>

        {/* Personal Info */}
        <section className="mb-6">
          <h3 className="font-semibold text-lg mb-2">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="first_name" value={form.first_name || ''} onChange={handleChange} placeholder="First Name" className="border px-3 py-2 rounded dark:bg-[#24292e] dark:text-white" />
            <input type="text" name="last_name" value={form.last_name || ''} onChange={handleChange} placeholder="Last Name" className="border px-3 py-2 rounded dark:bg-[#24292e] dark:text-white" />
            <input type="date" name="birthdate" value={form.birthdate || ''} max={today} onChange={handleChange} className="border px-3 py-2 rounded dark:bg-[#24292e] dark:text-white" />
            <select name="sex" value={form.sex || ''} onChange={handleChange} className="border px-3 py-2 rounded dark:bg-[#24292e] dark:text-white">
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <input type="email" name="email" value={form.email || ''} onChange={handleChange} placeholder="Email" className="border px-3 py-2 rounded col-span-2 dark:bg-[#24292e] dark:text-white" />
            <input type="text" name="phone" value={form.phone || ''} onChange={handleChange} placeholder="Phone Number" className="border px-3 py-2 rounded col-span-2 dark:bg-[#24292e] dark:text-white" />
          </div>
        </section>

        {/* Position */}
        <section className="mb-6">
          <h3 className="font-semibold text-lg mb-2">Position Applied For</h3>
          <select name="position" value={form.position || ''} onChange={handleChange} className="border px-3 py-2 rounded w-full dark:bg-[#24292e] dark:text-white">
            <option value="">Select Position</option>
            <option value="HR">HR</option>
            <option value="Recruiter">Recruiter</option>
            <option value="Payroll">Payroll</option>
            <option value="Attendance">Attendance</option>
            <option value="Purchasing">Purchasing</option>
            <option value="Inventory">Inventory</option>
          </select>
        </section>

        {/* Education */}
        <section className="mb-6">
          <h3 className="font-semibold text-lg mb-2">Educational Background</h3>
          <div className="grid grid-cols-2 gap-4">
            <select name="education" value={form.education || ''} onChange={handleChange} className="border px-3 py-2 rounded dark:bg-[#24292e] dark:text-white">
              <option value="">Select Education</option>
              <option value="High School">High School</option>
              <option value="Bachelor’s">Bachelor’s</option>
              <option value="Master’s">Master’s</option>
            </select>
            <div className="grid grid-cols-2 gap-4 col-span-2">
              <input type="date" name="start_date" value={form.start_date} onChange={handleChange} className="border px-3 py-2 rounded dark:bg-[#24292e] dark:text-white" />
              <input type="date" name="end_date" value={form.end_date} onChange={handleChange} className="border px-3 py-2 rounded dark:bg-[#24292e] dark:text-white" />
            </div>
            <input type="text" name="institution" value={form.institution || ''} onChange={handleChange} placeholder="Institution" className="border px-3 py-2 rounded col-span-2 dark:bg-[#24292e] dark:text-white" />
          </div>
        </section>

        {/* Resume */}
        <section className="mb-6">
          <h3 className="font-semibold text-lg mb-2">Supporting Document</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-dashed px-3 py-10 rounded text-center text-sm text-gray-500 dark:text-gray-400">
              <label className="cursor-pointer">
                📁 Click and Select files <span className="text-blue-600 underline">here.</span>
                <input type="file" onChange={(e) => setResumeFile(e.target.files[0])} className="hidden" />
              </label>
              {resumeFile && <p className="mt-2 text-green-500 text-sm">{resumeFile.name}</p>}
            </div>
            <select name="source" value={form.source || ''} onChange={handleChange} className="border px-3 py-2 rounded dark:bg-[#24292e] dark:text-white">
              <option value="">Select Source</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Referral">Referral</option>
              <option value="JobStreet">JobStreet</option>
            </select>
            <textarea name="notes" value={form.notes || ''} onChange={handleChange} placeholder="Notes" rows="4" className="border px-3 py-2 rounded col-span-2 dark:bg-[#24292e] dark:text-white" />
          </div>
        </section>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 dark:border-gray-500 dark:text-white dark:hover:bg-gray-700">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`px-6 py-2 rounded text-white ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#b69d73] hover:bg-[#a88c65]'}`}
          >
            {submitting ? 'Submitting...' : 'Submit Applicant'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddApplicantModal;
