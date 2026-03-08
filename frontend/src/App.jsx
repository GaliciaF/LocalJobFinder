import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminLayout from './pages/admin/AdminLayout'
import EmployerLayout from './pages/employer/EmployerLayout'
import WorkerLayout from './pages/worker/WorkerLayout'

import AdminDashboard from './pages/admin/AdminDashboard'
import AllUsers from './pages/admin/AllUsers'
import IDVerifications from './pages/admin/IDVerifications'
import Suspended from './pages/admin/Suspended'
import AllJobs from './pages/admin/AllJobs'
import ServiceCategories from './pages/admin/ServiceCategories'
import FlaggedReports from './pages/admin/FlaggedReports'
import HandleDisputes from './pages/admin/HandleDisputes'
import FullAnalytics from './pages/admin/FullAnalytics'
import SecurityControls from './pages/admin/SecurityControls'
import SystemSettings from './pages/admin/SystemSettings'

import EmployerDashboard from './pages/employer/Dashboard'
import EmployerProfile from './pages/employer/Profile'
import PostJob from './pages/employer/PostJob'
import MyJob from './pages/employer/MyJob'
import ReviewApplicants from './pages/employer/ReviewApplicants'
import BrowseWorkers from './pages/employer/BrowseWorkers'
import EmployerMessages from './pages/employer/Messages'
import EmployerNotifications from './pages/employer/Notifications'
import RateWorkers from './pages/employer/RateWorkers'
import EmployerFileReport from './pages/employer/FileReport'
import EmployerSecurity from './pages/employer/Security'

import WorkerDashboard from './pages/worker/Dashboard'
import WorkerProfile from './pages/worker/MyProfile'
import BrowseJob from './pages/worker/BrowseJob'
import MyApplications from './pages/worker/MyApplications'
import WorkerMessages from './pages/worker/Messages'
import WorkerNotifications from './pages/worker/Notifications'
import WorkerReviews from './pages/worker/Reviews'
import MySchedule from './pages/worker/MySchedule'
import MyRate from './pages/worker/MyRate'
import WorkerFileReport from './pages/worker/FileReport'
import WorkerSecurity from './pages/worker/Security'

// ── Added: handle redirect after reload with loading check ──
function RoleRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-10 text-gray-400">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={`/${user.role}`} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Admin ── */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"     element={<AdminDashboard/>} />
            <Route path="users"         element={<AllUsers />} />
            <Route path="verifications" element={<IDVerifications />} />
            <Route path="suspended"     element={<Suspended />} />
            <Route path="jobs"          element={<AllJobs />} />
            <Route path="categories"    element={<ServiceCategories />} />
            <Route path="reports"       element={<FlaggedReports />} />
            <Route path="disputes"      element={<HandleDisputes />} />
            <Route path="analytics"     element={<FullAnalytics />} />
            <Route path="security"      element={<SecurityControls />} />
            <Route path="settings"      element={<SystemSettings />} />
          </Route>

          {/* ── Employer ── */}
          <Route path="/employer" element={<ProtectedRoute role="employer"><EmployerLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"     element={<EmployerDashboard />} />
            <Route path="profile"       element={<EmployerProfile />} />
            <Route path="create-job"    element={<PostJob />} />
            <Route path="jobs"          element={<MyJob />} />
            <Route path="applicants"    element={<ReviewApplicants />} />
            <Route path="workers"       element={<BrowseWorkers />} />
            <Route path="messages"      element={<EmployerMessages />} />
            <Route path="notifications" element={<EmployerNotifications />} />
            <Route path="reviews"       element={<RateWorkers />} />
            <Route path="report"        element={<EmployerFileReport />} />
            <Route path="security"      element={<EmployerSecurity />} />
          </Route>

          {/* ── Worker ── */}
          <Route path="/worker" element={<ProtectedRoute role="worker"><WorkerLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"     element={<WorkerDashboard />} />
            <Route path="profile"       element={<WorkerProfile />} />
            <Route path="browse-job"    element={<BrowseJob />} />
            <Route path="applications"  element={<MyApplications />} />
            <Route path="messages"      element={<WorkerMessages />} />
            <Route path="notifications" element={<WorkerNotifications />} />
            <Route path="reviews"       element={<WorkerReviews />} />
            <Route path="schedule"      element={<MySchedule />} />
            <Route path="salary"        element={<MyRate />} />
            <Route path="report"        element={<WorkerFileReport />} />
            <Route path="security"      element={<WorkerSecurity />} />
          </Route>

          <Route path="/unauthorized" element={
            <div className="flex items-center justify-center min-h-screen bg-[#0c0b14] text-red-400 text-xl font-bold">
              403 — Unauthorized
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}