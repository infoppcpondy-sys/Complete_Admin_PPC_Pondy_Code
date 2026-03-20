import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAdminData } from './redux/adminSlice';
import './Admin.css';
import 'react-toastify/dist/ReactToastify.css';

const Admin = () => {
  const [formData, setFormData] = useState({
    officeName: '',
    name: '',
    password: '',
    role: '',
    userType: '',
    otp: '',
  });

  const [step, setStep] = useState('login'); // 'login' | 'verify'
  const [loading, setLoading] = useState(false);

  // ── Dynamic roles fetched from Roll collection ───────────────────
  const [dynamicRoles, setDynamicRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const officeOptions = ['ADMIN', 'ARV 1', 'ARV 2', 'ARV 3'];

  // ── Fetch roles from Roll API on mount ───────────────────────────
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/roll-all`);
        // res.data is an array of { _id, rollType, createdDate }
        setDynamicRoles(res.data.map((r) => r.rollType));
      } catch (err) {
        console.error('Failed to load roles:', err);
        // Fallback to hardcoded roles if API fails
        setDynamicRoles(['manager', 'admin', 'accountant']);
      } finally {
        setRolesLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const { name, password, role, userType, officeName } = formData;

    if (!name || !password || !role || !userType || !officeName) {
      return toast.error('All fields are required');
    }

    setLoading(true);
    try {
      const loginRes = await axios.post(
        `${process.env.REACT_APP_API_URL}/adminlogin`,
        { name, password, role, userType }
      );

      const loginMessage = loginRes?.data?.message?.toLowerCase();

      if (loginRes.status === 200 && loginMessage?.includes('login successful')) {
        const otpRes = await axios.post(
          `${process.env.REACT_APP_API_URL}/send-otp-login`,
          { officeName, adminName: name }
        );

        if (otpRes?.data?.success) {
          toast.success('OTP sent to registered contact');
          setStep('verify');
        } else {
          toast.error(otpRes?.data?.message || 'OTP service error');
        }
      } else {
        const msg = loginMessage || '';
        if (msg.includes('password')) toast.error('Password is incorrect');
        else if (msg.includes('username')) toast.error('Username is incorrect');
        else toast.error(loginRes?.data?.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message?.toLowerCase() || 'connection error';
      if (errorMsg.includes('password')) toast.error('Password is incorrect');
      else if (errorMsg.includes('username')) toast.error('Username is incorrect');
      else if (errorMsg.includes('invalid credentials')) toast.error('Login failed. Please check name, password, role, and user type.');
      else toast.error(err.response?.data?.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!formData.otp) return toast.error('Enter OTP');

    setLoading(true);
    try {
      const otpRes = await axios.post(
        `${process.env.REACT_APP_API_URL}/verify-otp-login`,
        { officeName: formData.officeName, otp: formData.otp }
      );

      if (otpRes.data.success) {
        // ── Fetch and cache role permissions right after login ──
        try {
          const permRes = await axios.get(`${process.env.REACT_APP_API_URL}/get-role-permissions`);
          localStorage.setItem('rolePermissions', JSON.stringify(permRes.data));
        } catch (_) {}

        dispatch(setAdminData({
          name: formData.name,
          role: formData.role,
          userType: formData.userType,
          isVerified: true,
        }));

        toast.success('Login Successful');
        navigate('/dashboard/statistics');
      } else {
        toast.error(otpRes.data.message || 'Invalid OTP');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <ToastContainer />
      <Row className="w-100">
        <Col md={7} className="d-none d-md-block">
          <img
            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
            alt="Login Illustration"
            className="img-fluid"
          />
        </Col>
        <Col md={5} lg={4}>
          <div className="p-4 rounded shadow bg-white">
            <h5 className="text-primary text-center mb-4">ADMIN LOGIN</h5>
            <Form onSubmit={step === 'login' ? handleLogin : handleVerifyOtp}>

              {/* Office Dropdown */}
              <Form.Group className="mb-3">
                <Form.Label>Office Name</Form.Label>
                <Form.Control as="select" name="officeName" value={formData.officeName} onChange={handleChange} required>
                  <option value="">Select Office</option>
                  {officeOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Form.Control>
              </Form.Group>

              {step === 'login' && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text" name="name" value={formData.name}
                      onChange={handleChange} placeholder="Enter admin name" required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password" name="password" value={formData.password}
                      onChange={handleChange} placeholder="Enter password" required
                    />
                  </Form.Group>

                  {/* ── DYNAMIC ROLE DROPDOWN ── */}
                  <Form.Group className="mb-3">
                    <Form.Label>Role</Form.Label>
                    <Form.Control as="select" name="role" value={formData.role} onChange={handleChange} required>
                      <option value="">
                        {rolesLoading ? 'Loading roles...' : 'Select Role'}
                      </option>
                      {dynamicRoles.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>User Type</Form.Label>
                    <Form.Control as="select" name="userType" value={formData.userType} onChange={handleChange} required>
                      <option value="">Select Type</option>
                      <option value="all">ALL</option>
                      <option value="PUC">PUC</option>
                      <option value="TUC">TUC</option>
                    </Form.Control>
                  </Form.Group>
                </>
              )}

              {step === 'verify' && (
                <Form.Group className="mb-3">
                  <Form.Label>Enter OTP</Form.Label>
                  <Form.Control
                    type="text" name="otp" value={formData.otp}
                    onChange={handleChange} placeholder="Enter the OTP" required
                  />
                </Form.Group>
              )}

              <Button type="submit" className="w-100 mt-2" disabled={loading || rolesLoading}>
                {loading ? 'Processing...' : step === 'login' ? 'Send OTP' : 'Verify OTP & Login'}
              </Button>

              {step === 'verify' && (
                <Button
                  variant="link"
                  className="w-100 mt-2 text-secondary"
                  onClick={() => setStep('login')}
                >
                  ← Back to Login
                </Button>
              )}
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Admin;