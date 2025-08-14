import React, { useState } from 'react';
import api from '../services/api';

export default function CandidateActions() {
  const [uploading, setUploading] = useState(false);

  const handleDownloadTemplate = async () => {
      try {
        const response = await api.get('/candidates/download-template/', {
          responseType: 'blob', // Important for binary files
        });

        // Create a link element
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'candidate_upload_template.xlsx');
        document.body.appendChild(link);
        link.click();

        // Clean up
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error(error);
        alert('Failed to download template');
      }
  };


  const handleUploadExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await api.post('/candidates/upload-excel/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Candidates uploaded successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to upload candidates');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={handleDownloadTemplate}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Download Candidate Template
      </button>
      <label className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded cursor-pointer">
        {uploading ? 'Uploading...' : 'Upload Candidate Excel'}
        <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleUploadExcel} />
      </label>
    </div>
  );
}
