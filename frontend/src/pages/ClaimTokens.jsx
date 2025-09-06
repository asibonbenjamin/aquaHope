import { useState } from 'react'
import { useWallet } from '../wallet/WalletContext.jsx'
import ENSAddress from '../components/ENSAddress.jsx'

export default function ClaimTokens() {
  const { account, connectWallet, ensName, ensLoading } = useWallet()
  const [tokenCode, setTokenCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [claimResult, setClaimResult] = useState(null)
  const [donationDetails, setDonationDetails] = useState(null)

  const claimTokens = async () => {
    if (!account) {
      await connectWallet()
      return
    }

    if (!tokenCode.trim()) {
      alert('Please enter your token code')
      return
    }

    try {
      setLoading(true)
      
      // Get donation details by token code
      const response = await fetch('/api/blockchain/donation-by-token-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenCode: tokenCode.trim() })
      })

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to find donation')
      }

      setDonationDetails(data.donation)

      // Check if tokens are already minted
      if (data.donation.tokensMinted) {
        setClaimResult({
          success: true,
          message: 'Tokens and badge have already been claimed for this donation.',
          alreadyClaimed: true
        })
        return
      }

      // Mint tokens and badge
      const mintResponse = await fetch('/api/blockchain/mint-tokens-badge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          tokenCode: tokenCode.trim(),
          donorAddress: account
        })
      })

      const mintData = await mintResponse.json()
      
      if (mintData.success) {
        setClaimResult({
          success: true,
          message: 'Tokens and badge successfully claimed!',
          txHash: mintData.txHash,
          tokens: mintData.tokens,
          badgeId: mintData.badgeId
        })
      } else {
        throw new Error(mintData.error || 'Failed to mint tokens and badge')
      }
      
    } catch (error) {
      console.error('Claim failed:', error)
      setClaimResult({
        success: false,
        message: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTokenCode('')
    setClaimResult(null)
    setDonationDetails(null)
  }

  return (
    <div>
      <div className="page-hero">
        <div className="pill">🎁 Claim Tokens</div>
        <h2 style={{ margin: '6px 0 10px' }}>Claim Your AIT Tokens & NFT Badge</h2>
        <p className="muted">Enter your token code from the donation confirmation email to claim your rewards.</p>
      </div>

      {!account ? (
        <div className="card">
          <h3>Connect Your Wallet</h3>
          <p>Please connect your wallet to claim your tokens and badge.</p>
          <button onClick={connectWallet}>Connect Wallet</button>
        </div>
      ) : (
        <div>
          {/* Connected Wallet Info */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3>Connected Wallet</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ENSAddress 
                address={account}
                showAvatar={true}
                copyable={true}
                className="wallet-address"
              />
              {ensLoading && <span className="ens-loading">⏳ Resolving ENS...</span>}
            </div>
            {ensName && (
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                ENS Name: {ensName}
              </div>
            )}
          </div>

          {/* Token Code Input */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3>Enter Token Code</h3>
            <p style={{ color: '#666', marginBottom: '15px' }}>
              Enter the token code you received in your donation confirmation email.
            </p>
            
            <div style={{ marginBottom: '15px' }}>
              <label>Token Code</label>
              <input
                type="text"
                value={tokenCode}
                onChange={e => setTokenCode(e.target.value)}
                placeholder="Enter your token code here..."
                style={{ 
                  fontFamily: 'monospace', 
                  fontSize: '16px',
                  padding: '12px',
                  border: '2px solid #e9ecef',
                  borderRadius: '6px',
                  width: '100%'
                }}
              />
            </div>

            <button 
              onClick={claimTokens} 
              disabled={loading || !tokenCode.trim()}
              style={{ width: '100%' }}
            >
              {loading ? 'Claiming...' : 'Claim Tokens & Badge'}
            </button>
          </div>

          {/* Donation Details */}
          {donationDetails && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3>Donation Details</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                <div><strong>Donor:</strong> {donationDetails.name}</div>
                <div><strong>Email:</strong> {donationDetails.email}</div>
                <div><strong>Address:</strong> 
                  <ENSAddress 
                    address={donationDetails.donor}
                    showAvatar={true}
                    copyable={true}
                    className="donor-address"
                  />
                </div>
                <div><strong>Amount:</strong> {donationDetails.amount} ETH</div>
                <div><strong>Location:</strong> {donationDetails.location}</div>
                <div><strong>Date:</strong> {new Date(donationDetails.timestamp * 1000).toLocaleDateString()}</div>
                {donationDetails.message && (
                  <div><strong>Message:</strong> "{donationDetails.message}"</div>
                )}
                <div><strong>Status:</strong> 
                  <span style={{ 
                    color: donationDetails.tokensMinted ? '#28a745' : '#ffc107',
                    fontWeight: 'bold'
                  }}>
                    {donationDetails.tokensMinted ? '✅ Claimed' : '⏳ Pending'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Claim Result */}
          {claimResult && (
            <div className="card" style={{ 
              background: claimResult.success ? '#d4edda' : '#f8d7da',
              borderColor: claimResult.success ? '#c3e6cb' : '#f5c6cb'
            }}>
              <h3 style={{ color: claimResult.success ? '#155724' : '#721c24' }}>
                {claimResult.success ? '✅ Success!' : '❌ Error'}
              </h3>
              
              <p style={{ color: claimResult.success ? '#155724' : '#721c24' }}>
                {claimResult.message}
              </p>

              {claimResult.success && !claimResult.alreadyClaimed && (
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.5)', 
                  padding: '15px', 
                  borderRadius: '6px',
                  marginTop: '15px'
                }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>What You Received:</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li><strong>AIT Tokens:</strong> {claimResult.tokens || 'Calculating...'} tokens</li>
                    <li><strong>NFT Badge:</strong> Badge ID #{claimResult.badgeId || 'Pending...'}</li>
                    <li><strong>Voting Power:</strong> You can now vote on governance proposals</li>
                    <li><strong>DeFi Yield:</strong> Your tokens will earn yield automatically</li>
                  </ul>
                </div>
              )}

              {claimResult.txHash && (
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.5)', 
                  padding: '10px', 
                  borderRadius: '4px',
                  marginTop: '10px',
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }}>
                  <strong>Transaction Hash:</strong> {claimResult.txHash}
                </div>
              )}

              <div style={{ marginTop: '15px' }}>
                <button onClick={resetForm}>
                  {claimResult.success ? 'Claim Another' : 'Try Again'}
                </button>
                {claimResult.success && (
                  <button 
                    onClick={() => window.location.href = '/governance'}
                    style={{ marginLeft: '10px' }}
                  >
                    View Governance
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="card">
            <h3>How to Claim</h3>
            <ol style={{ paddingLeft: '20px' }}>
              <li>Make a donation on the <a href="/donate">Donate page</a></li>
              <li>Check your email for the confirmation with your token code</li>
              <li>Connect your wallet to this page</li>
              <li>Enter your token code in the form above</li>
              <li>Click "Claim Tokens & Badge" to receive your rewards</li>
            </ol>
            
            <div style={{ 
              background: '#e8f4fd', 
              padding: '15px', 
              borderRadius: '8px',
              borderLeft: '4px solid #667eea',
              marginTop: '15px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#667eea' }}>💡 Pro Tip</h4>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Your token code is unique to your donation and wallet address. 
                Make sure you're connected with the same wallet you used for the donation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}