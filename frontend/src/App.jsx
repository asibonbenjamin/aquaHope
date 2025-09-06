import './App.css'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import Home from './pages/Home.jsx'
import Donate from './pages/Donate.jsx'
import Gallery from './pages/Gallery.jsx'
import Donations from './pages/Donations.jsx'
import Account from './pages/Account.jsx'
import Governance from './pages/Governance.jsx'
import ClaimTokens from './pages/ClaimTokens.jsx'
import { WalletProvider, useWallet } from './wallet/WalletContext.jsx'
import ENSAddress from './components/ENSAddress.jsx'
import ENSConnectionModal from './components/ENSConnectionModal.jsx'

function UtilityBar() {
  return (
    <div className="utility-bar">
      <span>FAQ</span>
      <span>|</span>
      <span>What We Do</span>
      <span>|</span>
      <span>Become A Volunteer</span>
      <span>|</span>
      <span>Contact Us</span>
    </div>
  )
}

function NavBar() {
  const { account, connectWallet, disconnectWallet, isConnecting, ensName, ensLoading } = useWallet()
  const topbarRef = useRef(null)
  const [showFloating, setShowFloating] = useState(false)

  useEffect(() => {
    if (!topbarRef.current) return
    const observer = new IntersectionObserver(([entry]) => {
      setShowFloating(!entry.isIntersecting)
    }, { threshold: 0 })
    observer.observe(topbarRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <header>
      <UtilityBar />
      <div className="stats-bar">
        <div className="brand">AquaHope</div>
        <div className="stats-inline">
        </div>
        <div className="wallet">
          {account ? (
            <div className="wallet-info">
              <span className="connection-status">Connected:</span>
              <ENSAddress 
                address={account}
                showAvatar={true}
                copyable={true}
                className="wallet-address"
                title={`${ensName || 'Address'}: ${account}`}
              />
              {ensLoading && <span className="ens-loading">⏳</span>}
              <button 
                onClick={disconnectWallet} 
                className="logout-button"
                title="Disconnect Wallet"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <button onClick={connectWallet} disabled={isConnecting}>
              {isConnecting ? 'Connecting…' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
      <div className="topbar-wrap" ref={topbarRef}>
        <div className="topbar">
          <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'link active' : 'link'}>Home</NavLink>
          <NavLink to="/donate" className={({ isActive }) => isActive ? 'link active' : 'link'}>Donate</NavLink>
          <NavLink to="/governance" className={({ isActive }) => isActive ? 'link active' : 'link'}>Governance</NavLink>
          <NavLink to="/claim-tokens" className={({ isActive }) => isActive ? 'link active' : 'link'}>Claim Tokens</NavLink>
          <NavLink to="/gallery" className={({ isActive }) => isActive ? 'link active' : 'link'}>Gallery</NavLink>
          <NavLink to="/donations" className={({ isActive }) => isActive ? 'link active' : 'link'}>Donations</NavLink>
          <NavLink to="/account" className={({ isActive }) => isActive ? 'link active' : 'link'}>Account</NavLink>
          </nav>
        </div>
      </div>
      {showFloating && (
        <div className="floating-nav show">
          <div className="floating-nav-inner">
            <nav className="nav" style={{ justifyContent: 'center' }}>
              <NavLink to="/" end className={({ isActive }) => isActive ? 'link active' : 'link'}>Home</NavLink>
              <NavLink to="/donate" className={({ isActive }) => isActive ? 'link active' : 'link'}>Donate</NavLink>
              <NavLink to="/governance" className={({ isActive }) => isActive ? 'link active' : 'link'}>Governance</NavLink>
              <NavLink to="/claim-tokens" className={({ isActive }) => isActive ? 'link active' : 'link'}>Claim Tokens</NavLink>
              <NavLink to="/gallery" className={({ isActive }) => isActive ? 'link active' : 'link'}>Gallery</NavLink>
              <NavLink to="/donations" className={({ isActive }) => isActive ? 'link active' : 'link'}>Donations</NavLink>
              <NavLink to="/account" className={({ isActive }) => isActive ? 'link active' : 'link'}>Account</NavLink>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

function Layout() {
  const { showEnsModal, pendingAccount, completeWalletConnection } = useWallet()
  
  return (
    <div className="layout">
      <NavBar />
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/governance" element={<Governance />} />
          <Route path="/claim-tokens" element={<ClaimTokens />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/donations" element={<Donations />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </main>
      
      {/* ENS Connection Modal */}
      <ENSConnectionModal
        isOpen={showEnsModal}
        onClose={() => {
          // Reset connection state if user closes modal
          window.location.reload()
        }}
        onProceed={() => completeWalletConnection(pendingAccount)}
        account={pendingAccount}
      />
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <h4>AquaHope</h4>
            <p>Towards the end of the 19th century, communities began to organize and fund clean water solutions. We continue that mission on-chain.</p>
          </div>
          <div>
            <h4>Contact Info</h4>
            <div>Box 3233</div>
            <div>1810 Kings Way</div>
            <div>King Street, 5th Avenue, New York</div>
            <div style={{ marginTop: 8 }}>New York: 1800-2355-2356</div>
            <div>London: 020-1455-236-34</div>
            <div>contact@aquahope.org</div>
          </div>
          <div>
            <h4>Quick Links</h4>
            <div><a href="#">About Our Organization</a></div>
            <div><a href="#">Become a Volunteer</a></div>
            <div><a href="#">Case Studies</a></div>
            <div><a href="#">Sponsors</a></div>
            <div><a href="#">FAQ</a></div>
          </div>
          <div>
            <h4>Urgent Causes</h4>
            <div className="muted">Save Child Africa — 51% Donated</div>
            <div className="muted">Education Needed — 41% Donated</div>
            <div className="muted">Second Hand Goods — 31% Donated</div>
          </div>
        </div>
        <div className="footer-note">© {new Date().getFullYear()} AquaHope, All Rights Reserved</div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </WalletProvider>
  )
}