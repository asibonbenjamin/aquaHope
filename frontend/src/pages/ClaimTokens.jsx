import { useState } from 'react'
import { useWallet } from '../wallet/WalletContext.jsx'

export default function ClaimTokens() {
  const { account, connectWallet } = useWallet()
  const [tokenCode, setTokenCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [claimResult, setClaimResult] = useState(null)

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

      const result = await response.json()
      
      if (result.success && result.donation) {
        const donation = result.donation
        
        // Check if tokens are already minted
        if (donation.tokensMinted) {
          setClaimResult({
            success: true,
            message: 'Tokens already claimed!',
            donation: donation
          })
        } else {
          // Mint tokens and badge
          const mintResponse = await fetch('/api/blockchain/mint-tokens-badge', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              donationIndex: 0 // This would need to be the actual donation index
            })
          })

          const mintResult = await mintResponse.json()
          
          if (mintResult.success) {
            setClaimResult({
              success: true,
              message: 'Tokens and badge claimed successfully!',
              donation: donation,
              txHash: mintResult.txHash
            })
          } else {
            setClaimResult({
              success: false,
              message: `Failed to claim tokens: ${mintResult.error}`
            })
          }
        }
      } else {
        setClaimResult({
          success: false,
          message: 'Invalid token code or donation not found'
        })
      }
    } catch (error) {
      console.error('Failed to claim tokens:', error)
      setClaimResult({
        success: false,
        message: 'Failed to claim tokens. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTokenCode('')
    setClaimResult(null)
  }

  return (
    <div>
      <div className="page-hero">
        <div className="pill">🪙 Claim Your Tokens</div>
        <h2 style={{ margin: '6px 0 10px' }}>Claim Your Impact Tokens & Badge</h2>
        <p className="muted">Enter the token code you received via email to claim your AIT tokens and donor badge NFT.</p>
      </div>

      <div className="donate-panel">
        {!claimResult ? (
          <>
            <h3>Enter Your Token Code</h3>
            <p className="muted">Check your email for the token code sent after your donation.</p>
            
            <label>Token Code</label>
            <input 
              type="text"
              value={tokenCode}
              onChange={e => setTokenCode(e.target.value.toUpperCase())}
              placeholder="Enter your 8-character token code"
              maxLength="8"
              style={{ 
                fontFamily: 'monospace', 
                letterSpacing: '2px',
                textAlign: 'center',
                fontSize: '18px'
              }}
            />
            
            <button 
              onClick={claimTokens} 
              disabled={loading || !tokenCode.trim()}
            >
              {loading ? 'Claiming...' : account ? 'Claim Tokens & Badge' : 'Connect Wallet & Claim'}
            </button>
            
            <div style={{ 
              background: '#e8f4fd', 
              padding: '15px', 
              borderRadius: '8px', 
              margin: '20px 0',
              borderLeft: '4px solid #667eea'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#667eea' }}>What You'll Receive:</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li><strong>AquaHope Impact Tokens (AIT)</strong> - Your voting power</li>
                <li><strong>Donor Badge NFT</strong> - Unique digital badge</li>
                <li><strong>Governance Rights</strong> - Vote on future projects</li>
                <li><strong>Impact Tracking</strong> - See your contribution's impact</li>
              </ul>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            {claimResult.success ? (
              <>
                <div style={{ 
                  background: '#d4edda', 
                  border: '1px solid #c3e6cb', 
                  color: '#155724',
                  padding: '20px', 
                  borderRadius: '8px', 
                  marginBottom: '20px'
                }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#155724' }}>🎉 Success!</h3>
                  <p style={{ margin: 0 }}>{claimResult.message}</p>
                  {claimResult.txHash && (
                    <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
                      Transaction: <code>{claimResult.txHash}</code>
                    </p>
                  )}
                </div>
                
                {claimResult.donation && (
                  <div style={{ 
                    background: '#f8f9fa', 
                    padding: '20px', 
                    borderRadius: '8px', 
                    marginBottom: '20px',
                    textAlign: 'left'
                  }}>
                    <h4>Your Donation Details:</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div><strong>Amount:</strong> {claimResult.donation.amount} ETH</div>
                      <div><strong>Location:</strong> {claimResult.donation.location}</div>
                      <div><strong>Date:</strong> {new Date(claimResult.donation.timestamp * 1000).toLocaleDateString()}</div>
                      <div><strong>Tokens Earned:</strong> {Math.floor(parseFloat(claimResult.donation.amount) * 1000)} AIT</div>
                    </div>
                  </div>
                )}
                
                <div style={{ 
                  background: '#e8f4fd', 
                  padding: '15px', 
                  borderRadius: '8px', 
                  marginBottom: '20px',
                  borderLeft: '4px solid #667eea'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#667eea' }}>Next Steps:</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', textAlign: 'left' }}>
                    <li>Check your wallet for the AIT tokens</li>
                    <li>View your donor badge NFT</li>
                    <li>Visit the Governance page to vote on proposals</li>
                    <li>Track your impact on the platform</li>
                  </ul>
                </div>
              </>
            ) : (
              <div style={{ 
                background: '#f8d7da', 
                border: '1px solid #f5c6cb', 
                color: '#721c24',
                padding: '20px', 
                borderRadius: '8px', 
                marginBottom: '20px'
              }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#721c24' }}>❌ Claim Failed</h3>
                <p style={{ margin: 0 }}>{claimResult.message}</p>
              </div>
            )}
            
            <button onClick={resetForm}>
              {claimResult.success ? 'Claim Another Token' : 'Try Again'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
