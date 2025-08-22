import React from 'react';
import { useParams } from 'react-router-dom';

export default function MRVReportPage() {
  const { reportId } = useParams();
  
  return (
    <div>
      <h1 className="text-2xl font-bold">MRV Report Details</h1>
      <p>Report ID: {reportId}</p>
      <p>Coming soon - detailed MRV report view with satellite evidence and verification details.</p>
    </div>
  );
}
