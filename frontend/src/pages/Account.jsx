import { useState, useEffect } from 'react'
import { useWallet } from '../wallet/WalletContext.jsx'
import ENSAddress from '../components/ENSAddress.jsx'
import ENSManager from '../components/ENSManager.jsx'

export default function Account() {
  const { account, connectWallet, ensName, ensLoading, formatAddress } = useWallet()
  const donors = JSON.parse(localStorage.getItem('donors') || '[]')
  const myDonations = account ? donors.filter(d => d.address?.toLowerCase() === account.toLowerCase()) : []
  
  const [votingPower, setVotingPower] = useState(0)
  const [tokenBalance, setTokenBalance] = useState(0)
  const [badgeCount, setBadgeCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (account) {
      loadAccountData()
    }
  }, [account])

  const loadAccountData = async () => {
    setLoading(true)
    try {
      // Load voting power
      const votingResponse = await fetch(`/api/blockchain/donor-voting-power/${account}`)
      if (votingResponse.ok) {
        const votingData = await votingResponse.json()
        if (votingData.success) {
          setVotingPower(parseFloat(votingData.votingPower))
        }
      }

      // Load token balance
      const tokenResponse = await fetch(`/api/blockchain/donor-token-balance/${account}`)
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json()
        if (tokenData.success) {
          setTokenBalance(parseFloat(tokenData.balance))
        }
      }

      // Load badge count
      const badgeResponse = await fetch(`/api/blockchain/donor-badges/${account}`)
      if (badgeResponse.ok) {
        const badgeData = await badgeResponse.json()
        if (badgeData.success) {
          setBadgeCount(badgeData.badges.length)
        }
      }
    } catch (error) {
      console.error('Failed to load account data:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalDonated = myDonations.reduce((sum, d) => sum + parseFloat(d.amount), 0)
  const totalTokens = myDonations.reduce((sum, d) => sum + (d.tokens || 0), 0)

  return (
    <div>
      <div className="page-hero">
        <div className="pill">👤 My Profile</div>
        <h2 style={{ margin: '6px 0 10px' }}>Account & Donations</h2>
        <p className="muted">View your donations, tokens, and governance participation.</p>
      </div>
      
      {!account ? (
        <div className="card">
          <p className="muted">Connect your wallet to view your account details.</p>
          <button onClick={connectWallet}>Connect Wallet</button>
        </div>
      ) : (
        <div>
          {/* ENS Management */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <ENSManager />
          </div>

          {/* Account Overview */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3>Account Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div>
                <h4 style={{ margin: '0 0 8px 0', color: '#667eea' }}>Wallet Address</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ENSAddress 
                    address={account}
                    showAvatar={true}
                    copyable={true}
                    className="wallet-address"
                  />
                  {ensLoading && <span className="ens-loading">⏳</span>}
                </div>
                {ensName && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    ENS Name: {ensName}
                  </div>
                )}
              </div>
              
              <div>
                <h4 style={{ margin: '0 0 8px 0', color: '#28a745' }}>Total Donated</h4>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                  {totalDonated.toFixed(3)} ETH
                </div>
              </div>
              
              <div>
                <h4 style={{ margin: '0 0 8px 0', color: '#ffc107' }}>AIT Tokens</h4>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
                  {loading ? '⏳' : `${tokenBalance.toFixed(0)} AIT`}
                </div>
              </div>
              
              <div>
                <h4 style={{ margin: '0 0 8px 0', color: '#17a2b8' }}>Voting Power</h4>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#17a2b8' }}>
                  {loading ? '⏳' : `${votingPower.toFixed(2)}`}
                </div>
              </div>
            </div>
          </div>

          {/* Donation History */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3>Your Donation History</h3>
            {myDonations.length === 0 ? (
              <div className="muted">No donations found. Make your first donation to get started!</div>
            ) : (
              <div className="list">
                {myDonations.map((donation, i) => (
                  <div key={i} className="list-item">
                    <div className="donor-info">
                      <div className="donor-name">{donation.name}</div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        {new Date(donation.time).toLocaleDateString()}
                      </div>
                      {donation.message && (
                        <div className="donation-message">"{donation.message}"</div>
                      )}
                      {donation.location && (
                        <div className="donation-location">📍 {donation.location}</div>
                      )}
                    </div>
                    <div className="donation-details">
                      <div className="donation-amount">{Number(donation.amount).toFixed(3)} ETH</div>
                      {donation.tokens && (
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {donation.tokens} AIT tokens
                        </div>
                      )}
                      {donation.tokenCode && (
                        <div style={{ fontSize: '10px', color: '#999', fontFamily: 'monospace' }}>
                          Code: {donation.tokenCode}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Token & Badge Summary */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3>Tokens & Badges</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '15px', 
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#ffc107' }}>AIT Tokens</h4>
                <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {loading ? '⏳' : `${tokenBalance.toFixed(0)}`}
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                  Use your tokens to vote on governance proposals and earn yield from DeFi protocols.
                </p>
              </div>
              
              <div style={{ 
                background: '#f8f9fa', 
                padding: '15px', 
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#17a2b8' }}>NFT Badges</h4>
                <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {loading ? '⏳' : badgeCount}
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                  Unique badges representing your contribution level and impact on clean water projects.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3>Quick Actions</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => window.location.href = '/donate'}>
                Make Another Donation
              </button>
              <button onClick={() => window.location.href = '/claim-tokens'}>
                Claim Tokens
              </button>
              <button onClick={() => window.location.href = '/governance'}>
                View Governance
              </button>
              <button onClick={() => window.location.href = '/donations'}>
                View All Donations
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}