import React from 'react';

export default function Downloads() {
  return (
    <div className="py-12 px-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Downloads & Forms</h1>
      <p className="text-gray-600 mb-4">Access and download standard application forms and guidelines.</p>
      <ul className="bg-white rounded-xl shadow divide-y">
        <li className="p-4 flex justify-between items-center">
          <span>Vital Registration Application Form.pdf</span>
          <button className="text-blue-600 font-medium text-sm hover:underline">Download</button>
        </li>
      </ul>
    </div>
  );
}