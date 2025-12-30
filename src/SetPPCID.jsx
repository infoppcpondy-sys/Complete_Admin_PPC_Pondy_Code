






import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaTrash, FaUndo } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const SetPPCID = () => {
  const [ppcId, setPpcId] = useState('');
  const [assignedPhoneNumber, setAssignedPhoneNumber] = useState('');
  const [allProperties, setAllProperties] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAssignPhone = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/assign-phone`, {
        ppcId,
        assignedPhoneNumber,
      });
      setMessage(response.data.message);
      setError('');
      fetchAllProperties(); // refresh table
      setPpcId('');
      setAssignedPhoneNumber('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error occurred');
      setMessage('');
    }
  };

  const handleDelete = async (ppcId) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/unassign-phone`, { ppcId });
      setMessage('Phone assignment removed temporarily.');
      setError('');
      fetchAllProperties();
    } catch (err) {
      setError(err.response?.data?.error || 'Error occurred during delete');
      setMessage('');
    }
  };

  const handleUndo = async (ppcId) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/undo-unassign-phone`, { ppcId });
      setMessage('Phone assignment restored.');
      setError('');
      fetchAllProperties();
    } catch (err) {
      setError(err.response?.data?.error || 'Error occurred during undo');
      setMessage('');
    }
  };

  const fetchAllProperties = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/get-property-details`);
      setAllProperties(response.data);
    } catch (err) {
    }
  };

  useEffect(() => {
    fetchAllProperties();
  }, []);


  const handlePermanentDelete = async (ppcId) => {
  const confirmed = window.confirm(`Are you sure you want to permanently delete PPC ID ${ppcId}?`);
  if (!confirmed) return;

  try {
    await axios.delete(`${process.env.REACT_APP_API_URL}/permanent-delete/${ppcId}`);
    setMessage(`Permanently deleted PPC ID ${ppcId}`);
    setError('');
    fetchAllProperties();
  } catch (err) {
    setError(err.response?.data?.error || 'Error during permanent deletion');
    setMessage('');
  }
};
  const tableRef = useRef();

  const handlePrint = () => {
    const printContent = tableRef.current.innerHTML;
    const printWindow = window.open("", "", "width=1200,height=800");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Table</title>
          <style>
            table { border-collapse: collapse; width: 100%; font-size: 12px; }
            th, td { border: 1px solid #000; padding: 6px; text-align: left; }
            th { background: #f0f0f0; }
          </style>
        </head>
        <body>
          <h3>Filtered Users</h3>
          <table>${printContent}</table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Property Phone Set PPCID Assign</h2>

      <div style={{ marginBottom: '10px' }}>
        <label>PPC ID: </label>
        <input
          type="text"
          value={ppcId}
          onChange={(e) => setPpcId(e.target.value)}
          placeholder="Enter PPC ID"
          style={{ marginRight: '10px' }}
        />

        <label>Assign Phone: </label>
        <input
          type="text"
          value={assignedPhoneNumber}
          onChange={(e) => setAssignedPhoneNumber(e.target.value)}
          placeholder="Enter Phone"
          style={{ marginRight: '10px' }}
        />

        <button className='text-white bg-primary' onClick={handleAssignPhone}>Assign</button>
      </div>
             <button className="btn btn-secondary mb-3" style={{background:"tomato"}} onClick={handlePrint}>
  Print
</button>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h3 style={{ marginTop: '30px' }}>All Property Assignments</h3>
    <div ref={tableRef}> <table border="1" cellPadding="10" style={{ marginTop: '10px', borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>#</th>
            <th>PPC ID</th>
            <th>Original Phone Number</th>
            <th>Assigned Phone Number</th>
            <th>Assignment Status</th>
            <th> Date </th>
            <th>Actions</th>
            <th>Permanent</th>
 
          </tr>
        </thead>
        <tbody>
          {allProperties.map((prop, index) => (
            <tr key={prop.ppcId}>
              <td>{index + 1}</td>
              <td style={{cursor: "pointer"}}  onClick={() =>
                              navigate(`/dashboard/detail`, {
                                state: { ppcId: prop.ppcId, phoneNumber: prop.phoneNumber },
                              })
                            }>{prop.ppcId}</td>
              <td>{prop.originalPhoneNumber || 'N/A'}</td>
              <td>{prop.assignedPhoneNumber || 'Not Assigned'}</td>
              <td>{prop.setPpcId ? 'Assigned' : 'Unassigned'}</td>
<td>
  {prop.setPpcIdAssignedAt
    ? new Date(prop.setPpcIdAssignedAt).toISOString().split('T')[0]
    : 'N/A'}
</td>              <td>
                {prop.setPpcId ? (
                  <button style={{ background: '#dc3545', color: '#fff' }} onClick={() => handleDelete(prop.ppcId)}>
                    <FaTrash />
                  </button>
                ) : (
                  <button style={{ background: '#28a745', color: '#fff' }} onClick={() => handleUndo(prop.ppcId)}>
                    <FaUndo />
                  </button>
                )}
              </td>

              <td>
  <button
    style={{ background: '#000', color: '#fff' }}
    onClick={() => handlePermanentDelete(prop.ppcId)}
  >
    Permanent Delete
  </button>
</td>
 
            </tr>
          ))}
        </tbody>
      </table>
      </div> 
    </div>
  );
};

export default SetPPCID;


