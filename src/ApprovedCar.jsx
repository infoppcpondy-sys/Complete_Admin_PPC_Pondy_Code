 

import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import { FaEye, FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { useSelector } from 'react-redux';

const ApprovedCar = () => {
  const [properties, setProperties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [ppcIdSearch, setPpcIdSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusProperties, setStatusProperties] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPpcId, setCurrentPpcId] = useState('');
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState('');
  const [deletionReason, setDeletionReason] = useState('');
  const [phoneNumberSearch, setPhoneNumberSearch] = useState('');
const [featureStatusFilter, setFeatureStatusFilter] = useState('');
 
const [sortOption, setSortOption] = useState('');
const [hasLocation, setHasLocation] = useState('');
const [hasPhoto, setHasPhoto] = useState('');
const [notViewed, setNotViewed] = useState(false);
const [bankLoan, setBankLoan] = useState('');
const [priceFilter, setPriceFilter] = useState('');
const [propertyTypeFilter, setPropertyTypeFilter] = useState('');
const [showMoveToModal, setShowMoveToModal] = useState(false);
const [selectedPropertyForMove, setSelectedPropertyForMove] = useState(null);
  

const navigate = useNavigate();
    const mapRef = useRef(null);
  
  useEffect(() => {
    const fetchPendingProperties = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/fetch-active-users-datas-all`);
        
        const sortedUsers = res.data.users.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setProperties(sortedUsers);
        setFiltered(sortedUsers);
        
        const statusMap = {};
        sortedUsers.forEach(prop => {
          statusMap[prop.ppcId] = prop.isDeleted ? 'delete' : 'active';
        });
        setStatusProperties(statusMap);
        
      } catch (err) {
      }
    };
    fetchPendingProperties();
  }, []);

 

    const tableRef = useRef();
  
    const handlePrintt = () => {
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
const DEFAULT_IMAGE = 'https://d17r9yv50dox9q.cloudfront.net/car_gallery/default.jpg';

const handleSearch = () => {
  let result = [...properties];

  // PPC ID Search
  if (ppcIdSearch.trim()) {
    const query = ppcIdSearch.trim().toLowerCase();
    result = result.filter((prop) =>
      String(prop.ppcId || '').toLowerCase().includes(query)
    );
  }

  // Phone Number Search
  if (phoneNumberSearch.trim()) {
    const query = phoneNumberSearch.trim().toLowerCase();
    result = result.filter((prop) =>
      String(prop.phoneNumber || '').toLowerCase().includes(query)
    );
  }

  // Date Range Filter
  result = result.filter((prop) => {
    const createdDate = new Date(prop.createdAt).toISOString().split("T")[0];
    const matchStart = !startDate || createdDate >= startDate;
    const matchEnd = !endDate || createdDate <= endDate;
    return matchStart && matchEnd;
  });

  // Feature Status Filter
  if (featureStatusFilter) {
    result = result.filter((prop) =>
      (prop.featureStatus || '').toLowerCase() === featureStatusFilter.toLowerCase()
    );
  }

  // Location Filter
  if (hasLocation === 'yes') {
    result = result.filter((prop) => !!prop.locationCoordinates);
  } else if (hasLocation === 'no') {
    result = result.filter((prop) => !prop.locationCoordinates);
  }

  // Photo Filter
  if (hasPhoto === 'yes') {
    result = result.filter(
      (prop) => prop.photos && prop.photos.length > 0 && `http://localhost:5006/${prop.photos[0]}` !== DEFAULT_IMAGE
    );
  } else if (hasPhoto === 'no') {
    result = result.filter(
      (prop) => !prop.photos || prop.photos.length === 0 || `http://localhost:5006/${prop.photos[0]}` === DEFAULT_IMAGE
    );
  }

  // Not Viewed
  if (notViewed) {
    result = result.filter((prop) => !prop.views || prop.views === 0);
  }

  // Bank Loan
  if (bankLoan === 'yes') {
    result = result.filter((prop) => (prop.bankLoan || '').toLowerCase() === 'yes');
  } else if (bankLoan === 'no') {
    result = result.filter((prop) => (prop.bankLoan || '').toLowerCase() !== 'yes');
  }

  // House Price Filter (by price only)
  if (priceFilter === 'house30') {
    result = result.filter((prop) => Number(prop.price) < 3000000);
  } else if (priceFilter === 'house30to50') {
    result = result.filter((prop) => Number(prop.price) >= 3000000 && Number(prop.price) <= 5000000);
  } else if (priceFilter === 'plot15') {
    result = result.filter((prop) => String(prop.propertyType).toLowerCase() === 'plot' && Number(prop.price) < 1500000);
  }

  // Agricultural Land Filter
  if (propertyTypeFilter === 'agri') {
    result = result.filter((prop) => String(prop.propertyType).toLowerCase() === 'agricultural land');
  }

  // Sorting
  if (sortOption === 'priceLowHigh') {
    result.sort((a, b) => a.price - b.price);
  } else if (sortOption === 'priceHighLow') {
    result.sort((a, b) => b.price - a.price);
  } else if (sortOption === 'oldToNew') {
    result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sortOption === 'newToOld') {
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  setFiltered(result);
};

useEffect(() => {
  handleSearch();
}, [
  properties,
  ppcIdSearch,
  phoneNumberSearch,
  startDate,
  endDate,
  featureStatusFilter,
  sortOption,
  hasLocation,
  hasPhoto,
  notViewed,
  bankLoan,
  priceFilter,
  propertyTypeFilter
]);

  const handleReset = () => {
    setPpcIdSearch('');
      setPhoneNumberSearch('');

    setStartDate('');
    setEndDate('');
    setFiltered(properties);
  };

  // Delete functionality
  const handleDeleteClick = (ppcId, phoneNumber) => {
    setCurrentPpcId(ppcId);
    setCurrentPhoneNumber(phoneNumber);
    setShowDeleteModal(true);
  };



  const updatedList = properties.map(prop => 
    prop.ppcId === currentPpcId
      ? {
          ...prop,
          isDeleted: true,
          deletionReason: deletionReason.trim(),
          deletionDate: new Date().toISOString(),
        }
      : prop
  );
  

const handleDeleteConfirm = async () => {
  try {
    await axios.put(`${process.env.REACT_APP_API_URL}/admin-delete`, 
      { deletionReason }, 
      { params: { ppcId: currentPpcId } }
    );

    // Update properties state to reflect the delete immediately
    const updated = properties.map(prop => 
      prop.ppcId === currentPpcId
        ? {
            ...prop,
            isDeleted: true,
            deletionReason: deletionReason.trim(),
            deletionDate: new Date().toISOString(),
          }
        : prop
    );
    setProperties(updated); // Immediately reflect the change

    // Update statusProperties to manage status
    setStatusProperties(prev => ({
      ...prev,
      [currentPpcId]: 'delete', // Mark as 'delete' in the status
    }));

    // Close modal & reset form
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
  
      // Update properties state to reflect the undo action
      const updated = properties.map(prop => 
        prop.ppcId === ppcId
          ? {
              ...prop,
              isDeleted: false,
              deletionReason: null,
              deletionDate: null,
            }
          : prop
      );
      setProperties(updated);
  
      // Update statusProperties to reflect the change back to 'active'
      setStatusProperties(prev => ({
        ...prev,
        [ppcId]: 'active',
      }));
    } catch (error) {
      alert(error.response?.data?.message || 'Error undoing delete');
    }
  };
  
 
  // Feature status toggle
  const handleFeatureStatusChange = async (ppcId, currentStatus) => {
    const newStatus = currentStatus === "yes" ? "no" : "yes";
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/update-feature-status`, {
        ppcId,
        featureStatus: newStatus,
      });

      setProperties(prev => prev.map(prop =>
        prop.ppcId === ppcId ? { ...prop, featureStatus: newStatus } : prop
      ));
      setFiltered(prev => prev.map(prop =>
        prop.ppcId === ppcId ? { ...prop, featureStatus: newStatus } : prop
      ));
    } catch (error) {
    }
  };

  // Move To handler
  const handleMoveToClick = (property) => {
    setSelectedPropertyForMove(property);
    setShowMoveToModal(true);
  };

  const handleMoveToOption = async (targetLabel) => {
    if (!selectedPropertyForMove) return;

    // Map user-facing labels to backend-allowed status values
    const mapping = {
      'preapproved property': 'complete',
      'pending property': 'pending',
      'removed property': 'delete',
    };

    const key = String(targetLabel || '').toLowerCase().trim();
    const backendStatus = mapping[key];

    if (!backendStatus) {
      alert('Invalid target status');
      return;
    }

    try {
      // Call API to update the status
      await axios.put(`${process.env.REACT_APP_API_URL}/update-property-status`, {
        ppcId: selectedPropertyForMove.ppcId,
        status: backendStatus,
      });

      // Update properties locally
      setProperties(prev => prev.map(prop =>
        prop.ppcId === selectedPropertyForMove.ppcId 
          ? { ...prop, status: backendStatus } 
          : prop
      ));
      setFiltered(prev => prev.map(prop =>
        prop.ppcId === selectedPropertyForMove.ppcId 
          ? { ...prop, status: backendStatus } 
          : prop
      ));

      // Close modal
      setShowMoveToModal(false);
      const movedPpcId = selectedPropertyForMove.ppcId;
      setSelectedPropertyForMove(null);
      alert(`Property moved to ${targetLabel}`);

      // If moved to preapproved, navigate to Preapproved page and pass ppcId to clear followup/bill
      if (backendStatus === 'complete') {
        navigate('/dashboard/pre-approved-car', { state: { clearedPpcIds: [movedPpcId] } });
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error moving property');
    }
  };




const handleCreateBill = (type, ppcId) => {
  if (type === 'Bill' && ppcId) {
    navigate(`/dashboard/edit-bill/${ppcId}`);
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
     
     const fileName = "Approved Property"; // current file
     
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


const handlePrint = (prop) => {
  // Utility to parse lat/lng
  const lat = parseFloat(prop?.latitude);
  const lng = parseFloat(prop?.longitude);

  const parseCoordinates = (locationCoordinates) => {
    if (!locationCoordinates) return null;
    const [lat, lng] = locationCoordinates.split(",").map(Number);
    return { lat, lng };
  };

  // Initialize map
  
  const photoCount = prop.photos?.length || 0;
  const videoCount = prop.videos?.length || 0;
  const coords = parseCoordinates(prop?.locationCoordinates);

  const printWindow = window.open('', '_blank');
  const content = `
    <html>
    <head>
       <title>PPC Property Detail</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        td, th { border: 1px solid #000; padding: 4px; vertical-align: top; }
        .yellow { background-color: yellow; font-weight: bold; }
        .header { font-weight: bold; font-size: 18px; }
        .sub-header { text-align: right; }
        .full-row { height: 30px; }
@media print {
  .yellow {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}

      </style>

    </head>
    <body>
      <table>
        <tr>
          <td colspan="1" rowspan="2" class="header">PONDY PROPERTY</td>
          <td colspan="1" rowspan="2">OFFICE USE ONLY</td>
            <td colspan="1" class="yellow">PPC ID:</td>
          <td colspan="1">${prop.ppcId}</td>
        </tr>
        <tr>
          <td colspan="1">PHOTO: ${photoCount}</td>
          <td colspan="1">VIDEO: ${videoCount}</td>
        </tr>
     

        <!-- Property Details -->
        <tr>
          <td class="yellow" colspan="2">prop details</td>
          <td class="yellow" colspan="2">prop features</td>
        </tr>
        <tr><td>Property Mode</td><td>${prop.propertyMode || ''}</td><td>Bedroom</td><td>${prop.bedrooms || ''}</td></tr>
        <tr><td>Property Type</td><td>${prop.propertyType || ''}</td><td>No. of Floors</td><td>${prop.numberOfFloors || ''}</td></tr>
        <tr><td>Price</td><td>${prop.price || ''}</td><td>Kitchen</td><td>${prop.kitchen || ''}</td></tr>
        <tr><td>Negotiation</td><td>${prop.negotiation || ''}</td><td>Balconies</td><td>${prop.balconies || ''}</td></tr>
        <tr><td>Length</td><td>${prop.length || ''}</td><td>Attached</td><td>${prop.attachedBathrooms || ''}</td></tr>
        <tr><td>Breadth</td><td>${prop.breadth || ''}</td><td>Western</td><td>${prop.western || ''}</td></tr>
        <tr><td>Total Area / sq.ft</td><td>${prop.totalArea || ''}</td><td>Car Park</td><td>${prop.carParking || ''}</td></tr>
        <tr><td>Ownership</td><td>${prop.ownership || ''}</td><td>Lift</td><td>${prop.lift || ''}</td></tr>
        <tr><td>Property Age</td><td>${prop.propertyAge || ''}</td><td class="yellow" colspan="2">other details</td></tr>
        <tr><td>Property Approved</td><td>${prop.propertyApproved || ''}</td><td>FURNISHED</td><td>${prop.furnished || ''}</td></tr>
        <tr><td>Bank Loan</td><td>${prop.bankLoan || ''}</td><td>Facing</td><td>${prop.facing || ''}</td></tr>
        <tr><td class="yellow">description</td><td colspan="1"></td><td>Sale Type</td><td>${prop.saleType || ''}</td></tr>
        <tr><td rowspan="4" colspan="2">${prop.description || ''}</td><tr><td colspan="1">Sale Mode</td><td>${prop.saleMode || ''}</td></tr><tr><td>Posted By</td><td>${prop.postedBy || ''}</td></tr>
        </tr>

        <tr><td>Posted Date</td><td>${new Date(prop.createdAt).toLocaleDateString()}</td></tr>

        <!-- Location and Owner -->
        <tr><td class="yellow" colspan="2">PROP LOCATION</td><td class="yellow" colspan="2">OWNER details</td></tr>
        <tr><td>COUNTRY</td><td>${prop.country || ''}</td><td>Name</td><td>${prop.paymentData?.ownerName || ''}</td></tr>
        <tr><td>STATE</td><td>${prop.state || ''}</td><td>Email</td><td>${prop.paymentData?.email || ''}</td></tr>
        <tr><td>DISTRICT</td><td>${prop.district || ''}</td><td>Mobile Number</td><td>${prop.phoneNumber}</td></tr>
        <tr><td>CITY</td><td>${prop.city || ''}</td><td>Alternate Number</td><td>${prop.alternatePhone || ''}</td></tr>
        <tr><td>NAGAR</td><td>${prop.nagar || ''}</td><td>Best Time to Call</td><td>${prop.bestTimeToCall || ''}</td></tr>
        <tr><td>AREA</td><td>${prop.area || ''}</td><td class="yellow">MAP</td><td>${prop.mapLocation || ''}</td></tr>
  <tr>
    <td>STREET</td>
    <td>${prop.streetName || ''}</td>
    <td rowspan="7" colspan="2"> 
  <!--     <h6>Property Location on Map:</h6>
<div id="map"></div>
   <img 
              src="https://maps.googleapis.com/maps/api/staticmap?center=${prop.locationCoordinates}&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7C${prop.locationCoordinates}&key=AIzaSyB0wL8bW7T1bHM0YXMQgJbd1XKk-YIxaDU&libraries=places"
            alt="Property Location Map"
            style="width:100%; max-width:400px; height:auto;"
          /> -->

          <!-- Right block spans all 7 left rows -->
  </tr>
  <tr>
    <td>DOOR NO</td>
    <td>${prop.doorNumber || ''}</td>
  </tr>
  <tr>
    <td>PINCODE</td>
    <td>${prop.pinCode || ''}</td>
  </tr>
  <tr>
    <td>LONG&LAT</td>
    <td>${prop.locationCoordinates || ''}</td>
  </tr>
  <tr rowspan="3">
    <td colspan="2">ADDRESS: ${prop.rentalPropertyAddress || ''}</td></tr>
      <tr>
  
  </tr>

</table>
<table>
<h3 class="yellow">OFFICE USE ONLY</h3>
        <!-- Footer Office Use -->
          <!-- <tr><td class="yellow" colspan="4">OFFICE USE ONLY</td></tr> -->
        <tr><td colspan="1">PPC ID: ${prop.ppcId}</td><td  colspan="3">MOB.NO: ${prop.phoneNumber}</td></tr>
        <tr>
        <td colspan="1">APP BY: ${prop.createdBy || ''}</td>
        <td colspan="1">BILL NO: ${prop.billNumber || ''}</td> 
        <td colspan="1">APP.DATE: ${new Date(prop.createdAt).toLocaleDateString()}</td>
        <td colspan="1">AMT: ${prop.paymentData?.amount || ''}</td>
        </tr>
      </table>
      <script>
        window.onload = () => {
          window.print();
        }
      </script>
    </body>
    </html>
  `;
    printWindow.document.open();

  printWindow.document.write(content);
  printWindow.document.close();
};



  return (
    <div className="container-fluid">
      {/* Search and Filter Controls */}
      <div   style={{ 
  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', 
  padding: '20px', 
  backgroundColor: '#fff' 
}} className="row mb-3">
        <div className="col-md-3">
          <Form.Control
            type="text"
            placeholder="Search by PPC ID"
            value={ppcIdSearch}
            onChange={(e) => setPpcIdSearch(e.target.value)}
          />
        </div>
        <div className="col-md-3">
  <Form.Control
    type="text"
    placeholder="Search by Phone Number"
    value={phoneNumberSearch}
    onChange={(e) => setPhoneNumberSearch(e.target.value)}
  />
</div>
 <div className="col-md-3">
<select value={featureStatusFilter} onChange={(e) => setFeatureStatusFilter(e.target.value)}>
  <option value="">All Feature Status</option>
  <option value="yes">Yes</option>
  <option value="no">No </option>
</select>

</div>
        <div className="col-md-2">
          <Form.Control
            type="date"
            placeholder="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <Form.Control
            type="date"
            placeholder="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="d-flex flex-wrap gap-2 my-2">
<Button onClick={() => setSortOption('priceLowHigh')}>Price: Low to High</Button>
<Button onClick={() => setSortOption('priceHighLow')}>Price: High to Low</Button>
<Button onClick={() => setSortOption('oldToNew')}>Date: Old to New</Button>
<Button onClick={() => setSortOption('newToOld')}>Date: New to Old</Button>

<Button onClick={() => setHasLocation('yes')}>With Location</Button>
<Button onClick={() => setHasLocation('no')}>Without Location</Button>

<Button onClick={() => setHasPhoto('yes')}>With Photo</Button>
<Button onClick={() => setHasPhoto('no')}>Without Photo</Button>

<Button onClick={() => setNotViewed(true)}>Not Viewed</Button>

<Button onClick={() => setBankLoan('yes')}>Bank Loan: Yes</Button>
<Button onClick={() => setBankLoan('no')}>Bank Loan: No</Button>

<Button onClick={() => setPriceFilter('house30')}>House below 30L</Button>
<Button onClick={() => setPriceFilter('house30to50')}>House 30L - 50L</Button>
<Button onClick={() => setPriceFilter('plot15')}>Plot below 15L</Button>

<Button onClick={() => setPropertyTypeFilter('agri')}>Agri Land</Button>
</div>

        <div >
          <Button variant="primary" onClick={handleSearch}>
            Search
          </Button>
          <Button variant="secondary" onClick={handleReset} className="ms-2">
            Reset
          </Button>
        </div>
      </div>
             <button className="btn btn-secondary mb-3" style={{background:"tomato"}} onClick={handlePrintt}>
  Print Page
</button>
      {/* Property Table */}
      <div className="table-responsive" ref={tableRef}>
        <Table striped bordered hover responsive className="table-sm align-middle">
          <thead className="sticky-top">
            <tr>
              <th>S.No</th>
              <th>Image</th>
              <th className="sticky-col sticky-col-1">PPC ID</th>
              <th>Views</th>
              <th className="sticky-col sticky-col-2">Phone Number</th>
              <th>Otp Status</th>
              <th>Direct Verified User</th>
              <th>Property Type</th>
              <th>Property Mode</th>
              <th>Price</th>
              <th>City</th>
              <th>CreatedBy</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th>Mandatory</th>
              <th>Status</th>
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
              <th>Action</th>
               <th>Create Bill</th>
              <th>Feature Status</th>
              <th>Move To</th>
              <th>Features Property Status</th>
              <th>FollowUp Admin Name</th>
              <th>Bill Date</th>
              <th>Validity (days)</th>
              <th>Bill Expiry Date</th>
              <th>Print  </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="25" className="text-center">
                  No properties found.
                </td>
              </tr>
            ) : (
              filtered.map((prop, idx) => (
                <tr key={prop._id} className={prop.isDeleted ? 'table-danger' : ''}>
                  <td>{idx + 1}</td>
                  <td>
                    <img
                      src={
                        prop.photos && prop.photos.length > 0
                          ? `http://localhost:5006/${prop.photos[0]}`
                          : 'https://d17r9yv50dox9q.cloudfront.net/car_gallery/default.jpg'
                      }
                      alt="Property"
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                  </td>
                  <td className="sticky-col sticky-col-1"                     style={{
        cursor: "pointer",
      }}    onClick={() =>
                        navigate('/dashboard/detail', {
                          state: { ppcId: prop.ppcId, phoneNumber: prop.phoneNumber },
                        })
                      }>{prop.ppcId}</td>
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
                  <td>{prop.city}</td>
                  <td>{prop.createdBy}</td>
                  <td>{new Date(prop.createdAt).toLocaleDateString()}</td>
                  <td>{new Date(prop.updatedAt).toLocaleDateString()}</td>
                  <td>{prop.required}</td>
                  <td>{prop.status}</td>
                    <td>{prop.setPpcId ? 'True' : 'False'}</td>
  <td>{prop.assignedPhoneNumber || 'N/A'}</td>
  <td>{prop.setPpcIdAssignedAt ? new Date(prop.setPpcIdAssignedAt).toLocaleDateString() : 'N/A'}</td>
 
                  <td>{prop.planName}</td>
                  <td>{prop.packageType}</td>
              <td>{new Date(prop.planCreatedAt).toLocaleDateString()}</td>
              <td>{prop.planExpiryDate}</td>
              <td>{prop.paymentData?.payustatususer}</td>
              <td>{prop.paymentData?.txnid }</td>
                <td>{prop.paymentData?.amount}</td>
              <td>{prop.paymentData?.firstname }</td>  
              <td>{prop.paymentData?.email }</td>
                            <td>{prop.paymentData?.payUdate }</td>
                  <td>{prop.deletionReason || '-'}</td>
                  <td>{prop.deletionDate ? new Date(prop.deletionDate).toLocaleString() : '-'}</td>
                  <td>
                    {prop.isDeleted ? (
                      <Button variant="secondary" size="sm" onClick={() => handleUndo(prop.ppcId)}>
                        Undo
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="info"
                          size="sm"
                          className="ms-2"
                          onClick={() =>
                            navigate('/dashboard/edit-property', {
                              state: { ppcId: prop.ppcId, phoneNumber: prop.phoneNumber },
                            })
                          }
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="ms-2 mt-2"
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
               
                  <td>
                    <button
                      className="text-primary"
                      onClick={() => handleCreateBill('Bill', prop.ppcId)}
                    >
                      Edit Bill
                    </button>
                  </td>
                  <td>{prop.featureStatus}</td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => handleMoveToClick(prop)}
                    >
                      Move To
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant={prop.featureStatus === "yes" ? "danger" : "success"}
                      size="sm"
                      onClick={() => handleFeatureStatusChange(prop.ppcId, prop.featureStatus)}
                    >
                      {prop.featureStatus === "yes" ? "Set to No" : "Set to Yes"}
                    </Button>
                  </td>
                  <td>{prop.followUpAdminName}</td>
                  <td>{prop.billDate}</td>
                  <td>{prop.validity}</td>
                  <td>{prop.billExpiryDate}</td>
                  <td>         <Button
  variant="secondary"
  size="sm"
  className="ms-2"
  onClick={() => handlePrint(prop)}
>
  Print
</Button></td>
      
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
          <Form.Group controlId="deletionReason">
            <Form.Label>Deletion Reason</Form.Label>
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

      {/* Move To Modal */}
      <Modal show={showMoveToModal} onHide={() => setShowMoveToModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Move Property</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Select where you want to move this property:</p>
          <div className="d-flex flex-column gap-2">
            <Button
              variant="primary"
              onClick={() => handleMoveToOption('preapproved property')}
              className="w-100"
            >
              Preapproved Property
            </Button>
            <Button
              variant="warning"
              onClick={() => handleMoveToOption('pending property')}
              className="w-100"
            >
              Pending Property
            </Button>
            <Button
              variant="danger"
              onClick={() => handleMoveToOption('removed property')}
              className="w-100"
            >
              Removed Property
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ApprovedCar;


























