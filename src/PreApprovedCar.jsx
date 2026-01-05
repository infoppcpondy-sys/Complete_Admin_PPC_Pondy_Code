


import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useSelector } from "react-redux";
import { Table, Form, Button,Modal } from 'react-bootstrap';
import { useNavigate, useLocation } from "react-router-dom";
import { FaEdit, FaEye } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";

const PreApprovedCar = () => {
  const [properties, setProperties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [ppcIdSearch, setPpcIdSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusProperties, setStatusProperties] = useState({});
  const [previousStatuses, setPreviousStatuses] = useState({});  
  const [showFollowUpButton, setShowFollowUpButton] = useState(false); // 🌟 NEW STATE
   const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentPpcId, setCurrentPpcId] = useState('');
    const [currentPhoneNumber, setCurrentPhoneNumber] = useState('');
    const [deletionReason, setDeletionReason] = useState('');
  const [phoneNumberSearch, setPhoneNumberSearch] = useState('');
const [featureStatusFilter, setFeatureStatusFilter] = useState('');

  const [billMap, setBillMap] = useState({});


 

const handleStatusChange = async (ppcId, currentStatus) => {
  const newStatus = currentStatus === "active" ? "pending" : "active";

  const hasFollowUp = followUpMap[ppcId];
  const hasBill = billMap[ppcId];

  if (!hasFollowUp || !hasBill) {
    const proceed = window.confirm(
      `⚠️ Either Follow-Up or Bill is not created for PPC ID ${ppcId}.\n\nDo you still want to change the status to "${newStatus.toUpperCase()}"?`
    );

    if (!proceed) return;
  }

  try {
    await axios.put(`${process.env.REACT_APP_API_URL}/update-property-status`, {
      ppcId,
      status: newStatus,
    });

    setStatusProperties((prev) => ({
      ...prev,
      [ppcId]: newStatus,
    }));
  } catch (error) {
    alert("Failed to update status.");
    console.error(error);
  }
};

 

  const fetchBills = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/bills`);
      const map = {};
  
      res.data.data.forEach(bill => {
        if (!map[bill.ppId]) {
          map[bill.ppId] = {
            adminName: bill.adminName,
            billNo: bill.billNo
          };
        }
      });
  
      // Remove any ppcIds passed via navigation state that should be treated as cleared
      const cleared = location?.state?.clearedPpcIds || [];
      if (Array.isArray(cleared) && cleared.length > 0) {
        cleared.forEach(id => {
          if (map[id]) delete map[id];
        });
      }

      setBillMap(map);
    } catch (error) {
    }
  };
  
useEffect(() => {
  fetchBills();
}, []);


  const [followUpMap, setFollowUpMap] = useState({});
  const fetchFollowUps = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/followup-list`);
      const map = {};
  
      res.data.data.forEach(f => {
        if (!map[f.ppcId]) {
          map[f.ppcId] = {
            adminName: f.adminName,
            createdAt: f.createdAt
          };
        }
      });
  
      // Remove cleared ppcIds from follow-up map as well
      const cleared2 = location?.state?.clearedPpcIds || [];
      if (Array.isArray(cleared2) && cleared2.length > 0) {
        cleared2.forEach(id => {
          if (map[id]) delete map[id];
        });
      }

      setFollowUpMap(map);
    } catch (err) {
    }
  };
  
  
  useEffect(() => {
    fetchFollowUps();
  }, []);
  



  // Handle creating bill or follow-up with confirmation
  const handleCreateAction = (actionType, ppcId, phoneNumber) => {
    const confirmMessage = `Do you want to create ${actionType}?`;

    const isConfirmed = window.confirm(confirmMessage);

    if (isConfirmed) {
      const currentDate = new Date().toLocaleDateString(); // Store current date

      // Update the specific property with the current date for the action
      setProperties(prevProperties =>
        prevProperties.map((prop) =>
          prop.ppcId === ppcId && prop.phoneNumber === phoneNumber
            ? {
                ...prop,
                [`create${actionType}Date`]: currentDate, // Dynamically set date field
              }
            : prop
        )
      );

      // Navigate to the respective page (Follow-up or Bill creation)
      if (actionType === 'FollowUp') {
        navigate('/dashboard/create-followup', {
          state: { ppcId: ppcId, phoneNumber: phoneNumber },
        });
      } else if (actionType === 'Bill') {
        navigate('/dashboard/create-bill', {
          state: { ppcId: ppcId, phoneNumber: phoneNumber },
        });
      }
    }
  };


  useEffect(() => {
  const initialStatus = {};
  filtered.forEach((p) => {
    initialStatus[p.ppcId] = p.status; // assuming each property has `.status`
  });
  setStatusProperties(initialStatus);
}, [filtered]);

const statusColorMap = {
  active: "#28a745",            // Green
  pending: "#ffc107",           // Yellow
  complete: "#6610f2",          // Teal
 
};


  const navigate=useNavigate();
  const location = useLocation();

   const [search, setSearch] = useState("");
      const [fromDate, setFromDate] = useState("");

 
      useEffect(() => {
        const fetchPreApprovedProperties = async () => {
          try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/properties/pre-approved-all`);
            
            const sortedUsers = res.data.users.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt) // New to old
            );
            
            // Filter for properties with status 'complete' (all mandatory fields filled)
            const completeProperties = sortedUsers.filter(prop => 
              prop.status === 'complete' || !prop.status // Include if no status (backward compatibility)
            );
            
            setProperties(completeProperties);
            setFiltered(completeProperties);
          } catch (err) {
          }
        };
        fetchPreApprovedProperties();
      }, []);
      

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
  // Handle filtering

  const handleSearch = () => {
    let result = [...properties];

    if (ppcIdSearch.trim()) {
      const query = ppcIdSearch.trim().toLowerCase();
      result = result.filter((prop) => {
        const ppc = String(prop.ppcId || '').toLowerCase();
        return ppc.includes(query);
      });
    }
  if (phoneNumberSearch.trim()) {
    const query = phoneNumberSearch.trim().toLowerCase();
    result = result.filter((prop) => {
      const phone = String(prop.phoneNumber || '').toLowerCase();
      return phone.includes(query);
    });
  }
    if (featureStatusFilter) {
    result = result.filter((prop) => prop.status === featureStatusFilter);
  }
    result = result.filter((prop) => {
      const createdDate = new Date(prop.createdAt).toISOString().split("T")[0];
      const matchStart = !startDate || createdDate >= startDate;
      const matchEnd = !endDate || createdDate <= endDate;
      return matchStart && matchEnd;
    });

    setFiltered(result);
  };

    useEffect(() => {
      handleSearch();
    }, [properties, ppcIdSearch, startDate, endDate , featureStatusFilter]);
    
  const handleReset = () => {
      setPhoneNumberSearch('');
    setPpcIdSearch('');
    setStartDate('');
    setEndDate('');
    setFeatureStatusFilter('');
    setFiltered(properties);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/admin-delete`, 
        { deletionReason }, 
        { params: { ppcId: currentPpcId } }
      );
      
      // Update local state
      setProperties(prev => prev.map(prop => 
        prop.ppcId === currentPpcId ? { 
          ...prop, 
          isDeleted: true,
          deletionReason: deletionReason.trim(),
          deletionDate: new Date().toISOString()
        } : prop
      ));
      
      setStatusProperties(prev => ({ ...prev, [currentPpcId]: 'delete' }));
      setShowDeleteModal(false);
      setDeletionReason('');
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting property');
    }
  };

  // Undo delete functionality
  const handleUndo = async (ppcId) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/admin-undo-delete`, 
        {}, 
        { params: { ppcId } }
      );
      
      // Update local state
      setProperties(prev => prev.map(prop => 
        prop.ppcId === ppcId ? { 
          ...prop, 
          isDeleted: false,
          deletionReason: null,
          deletionDate: null
        } : prop
      ));
      
      setStatusProperties(prev => ({ ...prev, [ppcId]: 'active' }));
      // handleSearch(); // Refresh filtered results
    } catch (error) {
      alert(error.response?.data?.message || 'Error undoing delete');
    }
  };


  
  // Delete functionality
  const handleDeleteClick = (ppcId, phoneNumber) => {
    setCurrentPpcId(ppcId);
    setCurrentPhoneNumber(phoneNumber);
    setShowDeleteModal(true);
  };
  
  
  
  const handleFeatureStatusChange = async (ppcId, currentStatus) => {
    const newStatus = currentStatus === "yes" ? "no" : "yes"; // Toggle status
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/update-feature-status`, {
        ppcId,
        featureStatus: newStatus,
      });

      setProperties((prevProperties) =>
        prevProperties.map((property) =>
          property.ppcId === ppcId ? { ...property, featureStatus: newStatus } : property
        )
      );
    } catch (error) {
    }
  };

 


  
  
    const reduxAdminName = useSelector((state) => state.admin.name);
    const reduxAdminRole = useSelector((state) => state.admin.role);
    
    const adminName = reduxAdminName || localStorage.getItem("adminName");
    const adminRole = reduxAdminRole || localStorage.getItem("adminRole");



const handlePermanentDelete = async (ppcId) => {
  const confirmDelete = window.confirm("Are you sure you want to permanently delete this record?");
  if (!confirmDelete) return;

  const adminName = reduxAdminName || localStorage.getItem("adminName");

  if (!adminName) {
    alert("Admin name is missing. Please log in again.");
    return;
  }

  try {
    const response = await axios.delete(
      `${process.env.REACT_APP_API_URL}/delete-ppcId-data`,
      {
        params: { ppcId },
        data: {
          deletedBy: adminName
        }
      }
    );

    if (response.status === 200) {
      alert("User permanently deleted successfully!");

      setProperties((prev) => prev.filter((property) => property.ppcId !== ppcId));

      const updatedStatus = { ...statusProperties };
      delete updatedStatus[ppcId];
      setStatusProperties(updatedStatus);
      localStorage.setItem("statusProperties", JSON.stringify(updatedStatus));
    } else {
      alert(response.data.message || "Failed to delete user.");
    }
  } catch (error) {
    alert("An error occurred while deleting.");
    console.error(error);
  }
};
    
     const [allowedRoles, setAllowedRoles] = useState([]);
         const [loading, setLoading] = useState(true);
     
     const fileName = "PreApproved Property"; // current file
     
     // Sync Redux to localStorage
     useEffect(() => {
       if (reduxAdminName) localStorage.setItem("adminName", reduxAdminName);
       if (reduxAdminRole) localStorage.setItem("adminRole", reduxAdminRole);
     }, [reduxAdminName, reduxAdminRole]);
     
     // Record dashboard view
     useEffect(() => {
       const recordDashboardView = async () => {
         try {
           await axios.post(`${process.env.REACT_APP_API_URL}/record-view`, {
             userName: adminName,
             role: adminRole,
             viewedFile: fileName,
             viewTime: moment().format("YYYY-MM-DD HH:mm:ss"),
           });
         } catch (err) {
         }
       };
     
       if (adminName && adminRole) {
         recordDashboardView();
       }
     }, [adminName, adminRole]);
     
    
    
     // Fetch role-based permissions
     useEffect(() => {
       const fetchPermissions = async () => {
         try {
           const res = await axios.get(`${process.env.REACT_APP_API_URL}/get-role-permissions`);
           const rolePermissions = res.data.find((perm) => perm.role === adminRole);
           const viewed = rolePermissions?.viewedFiles?.map(f => f.trim()) || [];
           setAllowedRoles(viewed);
         } catch (err) {
         } finally {
           setLoading(false);
         }
       };
     
       if (adminRole) {
         fetchPermissions();
       }
     }, [adminRole]);
     
    
     if (loading) return <p>Loading...</p>;
    
     if (!allowedRoles.includes(fileName)) {
       return (
         <div className="text-center text-red-500 font-semibold text-lg mt-10">
           Only admin is allowed to view this file.
         </div>
       );
     }

  return (
    <div className="p-3">
      <h4>Pending Properties</h4>
<form   className="d-flex flex-row gap-2 align-items-center flex-nowrap"

 onSubmit={(e) => e.preventDefault()}>
  <input
    type="text"
    className="form-control"
    placeholder="PPC ID"
    value={ppcIdSearch}
    onChange={(e) => setPpcIdSearch(e.target.value)}
    style={{ maxWidth: "150px" }}
  />

  <input
    type="text"
    className="form-control"
    placeholder="Phone Number"
    value={phoneNumberSearch}
    onChange={(e) => setPhoneNumberSearch(e.target.value)}
  />

  <select
    className="form-select"
    value={featureStatusFilter}
    onChange={(e) => setFeatureStatusFilter(e.target.value)}
    style={{ maxWidth: "150px" }}
  >
    <option value="">All Status</option>
    <option value="complete">Complete</option>
    <option value="pending">Pending</option>
    <option value="active">Active</option>
  </select>

  <input
    type="date"
    className="form-control"
    value={startDate}
    onChange={(e) => setFromDate(e.target.value)}
    style={{ maxWidth: "150px" }}
  />

  <input
    type="date"
    className="form-control"
    value={endDate}
    onChange={(e) => setEndDate(e.target.value)}
    style={{ maxWidth: "150px" }}
  />

  <button type="button" className="btn btn-outline-primary" onClick={handleSearch}>
    Search
  </button>

  <button type="button" className="btn btn-secondary" onClick={handleReset}>
    Reset
  </button>
</form>
             <button className="btn btn-secondary mb-3" style={{background:"tomato"}} onClick={handlePrint}>
  Print
</button>
          <h3 className="text-success mt-3 mb-4"> Pre Approved Properties All Datas </h3>
 <div ref={tableRef}>
    <Table striped bordered hover responsive className="table-sm align-middle">
  <thead className="sticky-top">
    <tr>
      <th>S.No</th>
      <th>Image</th>
      <th className="sticky-col sticky-col-1">PPC ID</th>
      <th>Views</th>
      <th className="sticky-col sticky-col-2">PhoneNumber</th>
      <th>Otp Status</th>
              <th>Direct Verified User</th>
      <th>Property Type</th>
      <th>Property Mode</th>
      <th>Price</th>
      <th>City</th>
      <th>CreatedBy</th>
      <th>Created At</th>
      <th>Updated At</th>
      <th>No.Of.Ads</th>
      <th>Mandatory</th>
      <th>Set PPCID Status</th>
      <th>Set PPCID Assigned Date</th>
      <th>Set PPCID Assigned PhoneNumber</th>
      <th>Plan Name</th>
      <th>Plan Type</th>
      <th>Plan Created</th>
      <th>Plan Expiry</th>
      <th>PayU Status</th>
      <th>Transaction ID</th>
      <th>Plan Amount</th>
      <th>Plan CreatedBy</th>
      <th>Email</th>
      <th>payU Date</th>
      <th>Deletion Reason</th>
      <th>Deleted At</th>
      <th>Feature Status</th>
            <th>Status</th>
      <th>Action</th>

      <th>Change Status</th>
      <th>Create FollowUp</th>
      <th>Create Bill</th>
    </tr>
  </thead>
  <tbody>
    {filtered.length === 0 ? (
      <tr>
        <td colSpan="33" className="text-center">No properties found.</td>
      </tr>
    ) : (
      filtered.map((prop, idx) => (
        <tr key={prop._id}>
          <td>{idx + 1}</td>
          <td>
            <img
              src={prop.photos?.[0] ? `https://ppcpondy.com/PPC/${prop.photos[0].replace(/\\/g, '/')}` : 'https://d17r9yv50dox9q.cloudfront.net/car_gallery/default.jpg'}
              alt="Property"
              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
            />
          </td>
          <td
            className="sticky-col sticky-col-1"
            style={{ cursor: "pointer" }}
            onClick={() =>
              navigate('/dashboard/detail', {
                state: { ppcId: prop.ppcId, phoneNumber: prop.phoneNumber }
              })
            }
          >
            {prop.ppcId}
          </td>
          <td><FaEye /> {prop.views}</td>
            <td
  className={`sticky-col sticky-col-2 ${
    prop.otpStatus !== 'verified' || !prop.isVerifiedUser ? 'text-danger' : ''
  }`}
>
  {prop.phoneNumber}
</td>
                  <td>{prop.otpStatus}</td>
<td>{prop.isVerifiedUser ? 'True' : 'False'}</td>
          <td>{prop.propertyType}</td>
          <td>{prop.propertyMode}</td>
          <td>{prop.price}</td>
          <td>{prop.city || '-'}</td>
          <td>{prop.createdBy}</td>
          <td>{prop.createdAt ? new Date(prop.createdAt).toLocaleDateString() : new Date(prop.planCreatedAt).toLocaleDateString()}</td>
          <td>{prop.updatedAt ? new Date(prop.updatedAt).toLocaleDateString() : '-'}</td>
          <td>{prop.adsCount}</td>
          <td>{prop.required}</td>

       

          <td>{prop.setPpcId ? 'True' : 'False'}</td>
          <td>{prop.setPpcIdAssignedAt ? new Date(prop.setPpcIdAssignedAt).toLocaleDateString() : 'N/A'}</td>
          <td>{prop.assignedPhoneNumber || 'N/A'}</td>
          <td>{prop.planName}</td>
          <td>{prop.packageType}</td>
          <td>{new Date(prop.planCreatedAt).toLocaleDateString()}</td>
          <td>{prop.planExpiryDate}</td>
          <td>{prop.paymentData?.payustatususer}</td>
          <td>{prop.paymentData?.txnid}</td>
          <td>{prop.paymentData?.amount}</td>
          <td>{prop.paymentData?.firstname}</td>
          <td>{prop.paymentData?.email}</td>
          <td>{prop.paymentData?.payUdate}</td>
          <td>{prop.deletionReason || '-'}</td>
          <td>{prop.deletionDate ? new Date(prop.deletionDate).toLocaleString() : '-'}</td>

                     {/* Feature Status    */}
                         <td>
                          <Button
                            variant={prop.featureStatus === "yes" ? "danger" : "success"}
                            size="sm"
                            onClick={() => handleFeatureStatusChange(prop.ppcId, prop.featureStatus)}
                          >
                            {prop.featureStatus === "yes" ? "Set to No" : "Set to Yes"}
                          </Button>
                        </td>

   

          {/* Status badge with optional deletion info */}
<td>
  {statusProperties[prop.ppcId] === "delete" ? (
    <div>
      <span style={{
        padding: "5px 10px",
        borderRadius: "5px",
        backgroundColor: statusColorMap["delete"],
        color: "white",
        display: "inline-block",
        marginBottom: "5px"
      }}>
        {statusProperties[prop.ppcId]}
      </span>
      <div style={{ fontSize: "0.8rem", color: "#666" }}>
        <strong>Reason:</strong> {prop.deletionReason || "-"}<br />
        <strong>Date:</strong> {prop.deletionDate ? new Date(prop.deletionDate).toLocaleString() : "-"}
      </div>
    </div>
  ) : (
    <span style={{
      padding: "5px 10px",
      borderRadius: "5px",
      backgroundColor: statusColorMap[statusProperties[prop.ppcId]] || "#343a40",
      color: "white",
    }}>
      {statusProperties[prop.ppcId]}
    </span>
  )}
</td>

          
          {/* Action Buttons */}
          <td>
            {statusProperties[prop.ppcId] === "delete" ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleUndo(prop.ppcId)}
              >
                Undo
              </Button>
            ) : (
              <>
                <Button
                  variant="info"
                  size="sm"
                  className="me-2"
                  onClick={() =>
                    navigate('/dashboard/edit-property', {
                      state: { ppcId: prop.ppcId, phoneNumber: prop.phoneNumber }
                    })
                  }
                >
                  <FaEdit />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteClick(prop.ppcId, prop.phoneNumber)}
                >
                  <MdDeleteForever />
                </Button>

                 <Button
                                          variant="danger"
                                          size="sm"
                                          className="mt-2"
                                          onClick={() => handlePermanentDelete(prop.ppcId)}
                                        >
                                          <MdDeleteForever /> Permanent
                                        </Button>
              </>
            )}
          </td>

          {/* Status Toggle Button */}
          <td>
            <Button
              variant=""
              size="sm"
              style={{
    backgroundColor: "#6c757d",  // Bootstrap gray
    color: "#fff",
    border: "none"
  }}
              onClick={() => handleStatusChange(prop.ppcId, statusProperties[prop.ppcId] || "pending")}
            >
              {statusProperties[prop.ppcId] === "active" ? "Set Pending" : "Set Active"}
            </Button>
          </td>

          {/* Follow-up Column */}
          <td>
            {followUpMap[prop.ppcId] ? (
              <div className="text-success">
                <div><strong>{followUpMap[prop.ppcId].adminName}</strong></div>
                <div>
                  <small>{new Date(followUpMap[prop.ppcId].createdAt).toLocaleDateString()}</small>
                </div>
              </div>
            ) : (
              <button
                className="btn btn-sm btn-primary"
                onClick={() => handleCreateAction("FollowUp", prop.ppcId, prop.phoneNumber)}
              >
                Create Follow-up
              </button>
            )}
          </td>

          {/* Bill Column */}
          <td>
            {followUpMap[prop.ppcId] && !billMap[prop.ppcId] ? (
              <button
                className="btn btn-sm btn-success"
                onClick={() => handleCreateAction("Bill", prop.ppcId, prop.phoneNumber)}
              >
                Create Bill
              </button>
            ) : billMap[prop.ppcId] ? (
              <span className="text-success">Bill Created</span>
            ) : (
              <span className="text-muted">Follow-up Required</span>
            )}
          </td>
        </tr>
      ))
    )}
  </tbody>
</Table>
</div>

   
    
{/* Delete Confirmation Modal */}
<Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Confirm Deletion</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <p>Are you sure you want to delete property {currentPpcId}?</p>
    <Form.Group controlId="deletionReason">
      <Form.Label>Deletion Reason (required)</Form.Label>
      <Form.Control
        as="textarea"
        rows={3}
        value={deletionReason}
        onChange={(e) => setDeletionReason(e.target.value)}
        placeholder="Enter reason for deletion"
        required
      />
    </Form.Group>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
      Cancel
    </Button>
    <Button 
      variant="danger" 
      onClick={handleDeleteConfirm}
      disabled={!deletionReason.trim()}
    >
      Confirm Delete
    </Button>
  </Modal.Footer>
</Modal>

    </div>
  );
};



export default PreApprovedCar;






















