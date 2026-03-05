import React from 'react';

/**
 * AccessDenied Component
 * Displays when a user's role doesn't have permission to access a page
 * @param {string} userRole - The current user's role
 * @param {string} fileName - The name of the page being accessed (optional)
 */
const AccessDenied = ({ userRole = 'Unknown', fileName = 'this page' }) => {
  return (
    <div className="text-center text-red-500 font-semibold text-lg mt-10" style={{ padding: '40px' }}>
      <p style={{ fontSize: '28px', color: '#dc3545', marginBottom: '15px' }}>
        ❌ Access Denied
      </p>
      <p style={{ fontSize: '16px', color: '#333', marginBottom: '10px' }}>
        doesn't have permission to access <strong>{fileName}</strong>.
      </p>
      {/* <p style={{ fontSize: '13px', color: '#666', marginTop: '15px' }}> */}
        {/* Please contact your administrator to grant access to this page. */}
      {/* </p> */}
    </div>
  );
};

export default AccessDenied;
