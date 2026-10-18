import Settings from './pages/Settings.jsx';
import History from './pages/History.jsx';
import Reports from './pages/Reports.jsx';
import GradCAM from './pages/GradCAM.jsx';
import XrayAnalysis from './pages/XrayAnalysis.jsx';
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import XRayAnalysis from "./pages/XRayAnalysis";
import Placeholder from "./pages/Placeholder";
function Protected({children}){return <ProtectedRoute><Layout>{children}</Layout></ProtectedRoute>}
export default function App(){return <AuthProvider><Routes><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/><Route path="/dashboard" element={<Protected><Dashboard/></Protected>}/><Route path="/patients" element={<Protected><Patients/></Protected>}/><Route path="/analysis" element={<Protected><XRayAnalysis/></Protected>}/><Route path="/history" element={<Protected><Placeholder title="Analysis History" description="Previous analyses will appear here after AI inference is connected."/></Protected>}/><Route path="/reports" element={<Protected><Placeholder title="Reports" description="Preliminary AI reports will be implemented after the analysis module."/></Protected>}/><Route path="/settings" element={<Protected><Placeholder title="Settings" description="Doctor profile and application settings."/></Protected>}/><Route path="/" element={<Navigate to="/dashboard" replace/>}/><Route path="*" element={<Navigate to="/dashboard" replace/>}/>  <Route path="/xray-analysis" element={<ProtectedRoute><Layout><XrayAnalysis /></Layout></ProtectedRoute>} />
  <Route path="/gradcam" element={<ProtectedRoute><Layout><GradCAM /></Layout></ProtectedRoute>} />
  <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
  <Route path="/history" element={<ProtectedRoute><Layout><History /></Layout></ProtectedRoute>} />
  <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
</Routes></AuthProvider>}
