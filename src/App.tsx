import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AnchorProvider } from './context/AnchorContext'
import { useAuth } from './context/AuthContext'
import type { Role } from './types'

import Splash from './pages/onboarding/Splash'
import SignIn from './pages/onboarding/SignIn'
import SignUp from './pages/onboarding/SignUp'
import Otp from './pages/onboarding/Otp'
import CreatePin from './pages/onboarding/CreatePin'
import Profile from './pages/onboarding/Profile'
import Kyc from './pages/onboarding/Kyc'
import BusinessDocuments from './pages/onboarding/BusinessDocuments'
import AccountVerification from './pages/onboarding/AccountVerification'
import SelectAnchor from './pages/onboarding/SelectAnchor'
import Identity from './pages/onboarding/Identity'
import NcbaNow from './pages/onboarding/NcbaNow'
import BusinessProfile from './pages/onboarding/BusinessProfile'
import Premises from './pages/onboarding/Premises'
import Mandate from './pages/onboarding/Mandate'

import Dashboard from './pages/Dashboard'
import Anchors from './pages/Anchors'
import AnchorDetail from './pages/AnchorDetail'
import Loans from './pages/Loans'
import LoanDetail from './pages/LoanDetail'
import Transactions from './pages/Transactions'
import Notifications from './pages/Notifications'
import Support from './pages/Support'
import ProfileSettings from './pages/settings/ProfileSettings'

import Drawdown from './pages/loan/Drawdown'
import DrawdownTracker from './pages/customer/DrawdownTracker'
import SignatoryReview from './pages/signatory/SignatoryReview'
import Repay from './pages/repay/Repay'
import RepayStatus from './pages/repay/RepayStatus'

import RoleSwitch from './pages/RoleSwitch'

import AnchorLogin from './pages/anchor/AnchorLogin'
import AnchorDashboard from './pages/anchor/AnchorDashboard'
import AnchorSales from './pages/anchor/AnchorSales'
import AnchorCustomers from './pages/anchor/AnchorCustomers'
import AnchorCustomerDetail from './pages/anchor/AnchorCustomerDetail'
import AnchorTurnoverReview from './pages/anchor/AnchorTurnoverReview'
import AnchorNotifications from './pages/anchor/AnchorNotifications'
import AnchorTransactions from './pages/anchor/AnchorTransactions'
import AnchorReports from './pages/anchor/AnchorReports'
import AnchorSettings from './pages/anchor/AnchorSettings'
import StyleGuide from './pages/dev/StyleGuide'

import { LmsProvider } from './context/LmsContext'
import LmsDashboard from './pages/lms/LmsDashboard'
import LmsCustomers from './pages/lms/LmsCustomers'
import LmsPartnerNew from './pages/lms/LmsPartnerNew'
import LmsLimitNew from './pages/lms/LmsLimitNew'
import LmsQueue from './pages/lms/LmsQueue'
import LmsAccounting from './pages/lms/LmsAccounting'
import LmsExceptions from './pages/lms/LmsExceptions'

// Prototype-only role guard: an Anchor user cannot see the customer app and
// a Customer cannot see the Anchor portal. A production build would enforce
// this server-side too — this is the frontend half of that separation.
function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { role: current } = useAuth()
  if (current !== role) return <Navigate to="/role" replace />
  return <>{children}</>
}

function RequireAnyRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { role: current } = useAuth()
  if (!current || !roles.includes(current)) return <Navigate to="/role" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/role" element={<RoleSwitch />} />
      <Route path="/dev/StyleGuide" element={<StyleGuide />} />

      {/* Customer onboarding — before a role/session exists */}
      <Route path="/customer/login" element={<SignIn />} />
      <Route path="/customer/signup" element={<SignUp />} />
      <Route path="/customer/otp" element={<Otp />} />
      <Route path="/customer/create-pin" element={<CreatePin />} />
      <Route path="/customer/identity" element={<Identity />} />
      <Route path="/customer/ncba-now" element={<NcbaNow />} />
      <Route path="/customer/profile" element={<Profile />} />
      <Route path="/customer/kyc" element={<Kyc />} />
      <Route path="/customer/business-profile" element={<BusinessProfile />} />
      <Route path="/customer/premises" element={<Premises />} />
      <Route path="/customer/business-documents" element={<BusinessDocuments />} />
      <Route path="/customer/mandate" element={<Mandate />} />
      <Route path="/customer/account-verification" element={<AccountVerification />} />
      <Route path="/customer/select-anchors" element={<SelectAnchor />} />

      {/* Customer app */}
      <Route path="/customer/dashboard" element={<RequireRole role="CUSTOMER"><Dashboard /></RequireRole>} />
      <Route path="/customer/anchors" element={<RequireRole role="CUSTOMER"><Anchors /></RequireRole>} />
      <Route path="/customer/anchors/:id" element={<RequireRole role="CUSTOMER"><AnchorDetail /></RequireRole>} />
      <Route path="/customer/loans" element={<RequireRole role="CUSTOMER"><Loans /></RequireRole>} />
      <Route path="/customer/loans/:id" element={<RequireRole role="CUSTOMER"><LoanDetail /></RequireRole>} />
      <Route path="/customer/drawdown" element={<RequireRole role="CUSTOMER"><Drawdown /></RequireRole>} />
      <Route path="/customer/drawdown/:id" element={<RequireRole role="CUSTOMER"><DrawdownTracker /></RequireRole>} />
      <Route path="/signatory/review/:token" element={<SignatoryReview />} />
      <Route path="/customer/repay" element={<RequireRole role="CUSTOMER"><Repay /></RequireRole>} />
      <Route path="/customer/repay/status" element={<RequireRole role="CUSTOMER"><RepayStatus /></RequireRole>} />
      <Route path="/customer/transactions" element={<RequireRole role="CUSTOMER"><Transactions /></RequireRole>} />
      <Route path="/customer/notifications" element={<RequireRole role="CUSTOMER"><Notifications /></RequireRole>} />
      <Route path="/customer/support" element={<RequireRole role="CUSTOMER"><Support /></RequireRole>} />
      <Route path="/customer/profile/settings" element={<RequireRole role="CUSTOMER"><ProfileSettings /></RequireRole>} />

      {/* Anchor portal — entirely separate role, own provider, own shell */}
      <Route path="/anchor/login" element={<AnchorLogin />} />
      <Route
        path="/anchor/*"
        element={
          <RequireRole role="ANCHOR">
            <AnchorProvider>
              <Routes>
                <Route path="dashboard" element={<AnchorDashboard />} />
                <Route path="customers" element={<AnchorCustomers />} />
                <Route path="customers/:id" element={<AnchorCustomerDetail />} />
                <Route path="sales" element={<AnchorSales />} />
                <Route path="transactions" element={<AnchorTransactions />} />
                <Route path="turnover-review" element={<AnchorTurnoverReview />} />
                <Route path="notifications" element={<AnchorNotifications />} />
                <Route path="reports" element={<AnchorReports />} />
                <Route path="settings" element={<AnchorSettings />} />
                <Route path="*" element={<Navigate to="/anchor/dashboard" replace />} />
              </Routes>
            </AnchorProvider>
          </RequireRole>
        }
      />

      {/* LMS portal — Bank Maker & Checker Operations */}
      <Route
        path="/lms/*"
        element={
          <RequireAnyRole roles={['BANK_MAKER', 'BANK_CHECKER']}>
            <LmsProvider>
              <Routes>
                <Route path="dashboard" element={<LmsDashboard />} />
                <Route path="customers" element={<LmsCustomers />} />
                <Route path="partners/new" element={<LmsPartnerNew />} />
                <Route path="limits/new" element={<LmsLimitNew />} />
                <Route path="limits/queue" element={<LmsQueue />} />
                <Route path="accounting" element={<LmsAccounting />} />
                <Route path="exceptions" element={<LmsExceptions />} />
                <Route path="*" element={<Navigate to="/lms/dashboard" replace />} />
              </Routes>
            </LmsProvider>
          </RequireAnyRole>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
