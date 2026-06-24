import { Routes, Route } from 'react-router-dom'
import Shell from './Shell'
import Login from './screens/Login'
import HomeScreen from './screens/Home'
import Campaigns from './screens/Campaigns'
import CampaignDetail from './screens/CampaignDetail'
import Donate from './screens/Donate'
import QR from './screens/QR'
import Pay from './screens/Pay'
import Success from './screens/Success'
import Inventory from './screens/Inventory'
import Receive from './screens/Receive'
import Distribute from './screens/Distribute'
import Transactions from './screens/Transactions'
import TransactionDetail from './screens/TransactionDetail'
import Profile from './screens/Profile'
import Notifications from './screens/Notifications'
import Stats from './screens/Stats'
import FieldExpense from './screens/tnv/FieldExpense'
import Beneficiaries from './screens/tnv/Beneficiaries'
import Distributions from './screens/tnv/Distributions'
import AdminLayout from './screens/admin/AdminLayout'
import AdminHome from './screens/admin/AdminHome'
import CampaignManage from './screens/admin/CampaignManage'
import CampaignForm from './screens/admin/CampaignForm'
import Disbursement from './screens/admin/Disbursement'
import Users from './screens/admin/Users'

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/campaign/:id" element={<CampaignDetail />} />
        <Route path="/donate/:id" element={<Donate />} />
        <Route path="/qr" element={<QR />} />
        <Route path="/pay" element={<Pay />} />
        <Route path="/success" element={<Success />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/inventory/receive" element={<Receive />} />
        <Route path="/inventory/distribute/:id" element={<Distribute />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/transaction/:id" element={<TransactionDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/field-expense" element={<FieldExpense />} />
        <Route path="/beneficiaries" element={<Beneficiaries />} />
        <Route path="/distributions" element={<Distributions />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="campaigns" element={<CampaignManage />} />
          <Route path="campaigns/new" element={<CampaignForm />} />
          <Route path="campaigns/:slug/edit" element={<CampaignForm />} />
          <Route path="disbursement" element={<Disbursement />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Route>
    </Routes>
  )
}
