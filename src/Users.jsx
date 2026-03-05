import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useSelector } from "react-redux";
import { Table, Button, Row, Col, Form, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import AdminForm from "./AdminForm";
import { toast, ToastContainer } from "react-toastify";

const Users = () => {
              
  const adminName = useSelector((state) => state.admin.name);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    office: "AUROBINDO",
    username: "",
    password: "",
    role: "",
    mobile: "",
    otp: 0,
  });

  // Fetch available roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/available-roles`);
        if (response.data.success) {
          setAvailableRoles(response.data.data);
        } else {
          // Fallback to default roles
          setAvailableRoles(['Manager', 'Admin', 'Accountant']);
        }
      } catch (err) {
        console.error('Error fetching roles:', err);
        // Fallback to default roles
        setAvailableRoles(['Manager', 'Admin', 'Accountant']);
      }
    };

    fetchRoles();
  }, []);

  // Helper function to fetch roles
  const fetchRolesFunc = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/available-roles`);
      if (response.data.success) {
        setAvailableRoles(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  // ✅ Record view on mount
useEffect(() => {
 const recordDashboardView = async () => {
   try {
     await axios.post(`${process.env.REACT_APP_API_URL}/record-view`, {
       userName: adminName,
       viewedFile: "Users",
       viewTime: moment().format("YYYY-MM-DD HH:mm:ss"),
     });
   } catch (err) {
   }
 };

 if (adminName) {
   recordDashboardView();
 }
}, [adminName]);

  // Initialize staff data on mount
  useEffect(() => {
    const initialStaffData = [
      { id: 1, name: "PARAMESHWARI", office: "AUROBINDO", username: "diviauro", password: "divya19497", role: "Manager", mobile: "8124827429", otp: 0 },
      { id: 2, name: "MONIHA", office: "AUROBINDO", username: "MONIHA", password: "MONI@PM", role: "Manager", mobile: "9786362362", otp: 0 },
      { id: 3, name: "sathish", office: "AUROBINDO", username: "sathish", password: "ssk@1850", role: "Admin", mobile: "9894061868", otp: 689905 },
      { id: 4, name: "Balarks", office: "AUROBINDO", username: "balarks", password: "bbg@2334455", role: "Admin", mobile: "9944244409", otp: 689905 },
      { id: 5, name: "punkuzhali", office: "AUROBINDO", username: "vallavan", password: "pm@1980", role: "Admin", mobile: "8608435347", otp: 689905 },
      { id: 6, name: "Suganya", office: "AUROBINDO", username: "sug@puc", password: "sug@750", role: "Manager", mobile: "6385580750", otp: 0 },
      { id: 7, name: "DEEPIKA", office: "AUROBINDO", username: "deep@auro", password: "vkypri", role: "Manager", mobile: "8111022555", otp: 0 },
      { id: 8, name: "Ashwitha", office: "AUROBINDO", username: "ash@auro", password: "ash@362362", role: "Manager", mobile: "9786362362", otp: 0 },
      { id: 9, name: "Malini", office: "AUROBINDO", username: "mal@auro", password: "mal@rpl123", role: "Manager", mobile: "9876543210", otp: 0 },
      { id: 10, name: "GANESH", office: "AUROBINDO", username: "GANESH", password: "2096", role: "Admin", mobile: "9600902096", otp: 689905 },
    ];
    setStaffData(initialStaffData);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenModal = (staff = null) => {
    // Refetch roles every time modal opens to get latest roles
    fetchRolesFunc();
    
    if (staff) {
      setEditingId(staff.id);
      setFormData(staff);
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        office: "AUROBINDO",
        username: "",
        password: "",
        role: "",
        mobile: "",
        otp: 0,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleSaveUser = () => {
    if (!formData.name || !formData.username || !formData.password || !formData.role || !formData.mobile) {
      toast.error("All fields are required");
      return;
    }

    if (editingId) {
      // Update existing user
      setStaffData((prev) =>
        prev.map((staff) => (staff.id === editingId ? { ...formData, id: editingId } : staff))
      );
      toast.success("User updated successfully");
    } else {
      // Create new user
      const newUser = {
        id: Math.max(...staffData.map((s) => s.id), 0) + 1,
        ...formData,
      };
      setStaffData((prev) => [...prev, newUser]);
      toast.success("User created successfully");
    }
    handleCloseModal();
  };

  const handleDeleteUser = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setStaffData((prev) => prev.filter((staff) => staff.id !== id));
      toast.success("User deleted successfully");
    }
  };

  return (
    <div className="container mt-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <AdminForm />

      <h4 className="mb-3 mt-4 text-danger">Staff Details</h4>
      <div className="mb-3 d-flex justify-content-between">
        <div>
          <a href="#" className="text-primary me-3">Export All to excel</a>
          <a href="#" className="text-primary">Print All to print</a>
        </div>
        <Button 
          variant="success" 
          onClick={() => handleOpenModal()}
          className="ms-3"
        >
          + Create New User
        </Button>
      </div>

      <Table striped bordered hover responsive className="table-sm align-middle">
        <thead className="sticky-top">
          <tr>
            <th>Sl</th>
            <th>Staff Name</th>
            <th>Office</th>
            <th>Username</th>
            <th>Password</th>
            <th>Roles</th>
            <th>Mobile Number</th>
            <th>Export OTP</th>
            <th>Edit / Delete</th>
          </tr>
        </thead>
        <tbody>
          {staffData.map((staff, index) => (
            <tr key={staff.id}>
              <td>{index + 1}</td>
              <td>{staff.name}</td>
              <td>{staff.office}</td>
              <td>{staff.username}</td>
              <td>{staff.password}</td>
              <td>{staff.role}</td>
              <td>{staff.mobile}</td>
              <td>{staff.otp}</td>
              <td>
                <Button 
                  variant="link" 
                  size="sm"
                  onClick={() => handleOpenModal(staff)}
                >
                  ✏️
                </Button>
                <Button 
                  variant="link" 
                  size="sm"
                  onClick={() => handleDeleteUser(staff.id)}
                >
                  🗑️
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for Create/Edit User */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? "Edit User" : "Create New User"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Staff Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter staff name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Office</Form.Label>
              <Form.Control
                as="select"
                name="office"
                value={formData.office}
                onChange={handleInputChange}
              >
                <option value="AUROBINDO">AUROBINDO</option>
                <option value="SAINT">SAINT</option>
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter username"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role (Dynamic)</Form.Label>
              <Form.Control
                as="select"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="">Select Role</option>
                {availableRoles.length > 0 ? (
                  availableRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                    <option value="Accountant">Accountant</option>
                  </>
                )}
              </Form.Control>
              <small className="text-muted d-block mt-2">
                💡 Roles are fetched from Roll management. Create new roles there.
              </small>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                placeholder="Enter mobile number"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>OTP</Form.Label>
              <Form.Control
                type="number"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                placeholder="Enter OTP"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveUser}>
            {editingId ? "Update User" : "Create User"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Users;
