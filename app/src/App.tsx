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
import Admin from './screens/Admin'
import Stats from './screens/Stats'

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
        <Route path="/admin" element={<Admin />} />
        <Route path="/stats" element={<Stats />} />
      </Route>
    </Routes>
  )
}
