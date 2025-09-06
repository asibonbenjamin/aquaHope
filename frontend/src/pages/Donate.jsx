import { useState } from 'react'
import { ethers } from 'ethers'
import { useWallet } from '../wallet/WalletContext.jsx'

export default function Donate() {
  const { signer, account, connectWallet, contract } = useWallet()
  const [amount, setAmount] = useState('0.05')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [tokenCode, setTokenCode] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const donate = async () => {
    if (!account) {
      await connectWallet()
      if (!signer) return
    }
    
    if (!contract) {
      alert('Contract not deployed yet. Please contact the administrator.')
      return
    }

    // Validate required fields
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address for token delivery.')
      return
    }

    if (!location.trim()) {
      alert('Please specify a preferred project location.')
      return
    }
    
    try {
      setLoading(true)
      
      // Call the smart contract donate function with new parameters
      const tx = await contract.donate(
        name || 'Anonymous',
        email,
        message || 'Supporting clean water for African villages',
        location,
        { value: ethers.parseEther(String(amount || '0')) }
      )
      
      await tx.wait()

      // Generate token code (this would normally come from the backend)
      const generatedTokenCode = Math.random().toString(36).substring(2, 10).toUpperCase()
      setTokenCode(generatedTokenCode)

      // Update local storage for UI display
      const donors = JSON.parse(localStorage.getItem('donors') || '[]')
      const impactTokens = Math.floor(Number(amount) * 1000) // 1000 AIT per ETH
      const entry = { 
        name: name || 'Anonymous', 
        email: email,
        address: account, 
        amount: Number(amount), 
        txHash: tx.hash, 
        time: Date.now(), 
        tokens: impactTokens,
        message: message || 'Supporting clean water for African villages',
        location: location,
        tokenCode: generatedTokenCode
      }
      donors.unshift(entry)
      localStorage.setItem('donors', JSON.stringify(donors))
      const prev = Number(localStorage.getItem('total_donations_eth') || '0')
      localStorage.setItem('total_donations_eth', String(prev + Number(amount)))
      
      setShowSuccess(true)
      
      // Send email notification (this would be handled by the backend)
      try {
        await fetch('/api/email/process-donation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            donationIndex: donors.length - 1,
            tokenCode: generatedTokenCode
          })
        })
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError)
        // Don't fail the donation if email fails
      }
      
    } catch (e) {
      console.error(e)
      if (e.code === 'ACTION_REJECTED') {
        alert('Transaction was rejected by user.')
      } else {
        alert('Transaction failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (showSuccess) {
    return (
      <div>
        <div className="page-hero">
          <div className="pill">🎉 Donation Successful!</div>
          <h2 style={{ margin: '6px 0 10px' }}>Thank You for Your Contribution</h2>
          <p className="muted">Your donation has been recorded on the blockchain and is now generating yield for sustainable water projects.</p>
        </div>
        <div className="donate-panel" style={{ textAlign: 'center' }}>
          <h3>🌟 Your Impact Token Code</h3>
          <div style={{ 
            background: '#f0f8ff', 
            border: '2px dashed #667eea', 
            padding: '20px', 
            margin: '20px 0',
            borderRadius: '8px'
          }}>
            <h1 style={{ color: '#667eea', fontFamily: 'monospace', letterSpacing: '2px' }}>
              {tokenCode}
            </h1>
          </div>
          <p><strong>What happens next:</strong></p>
          <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
            <li>📧 Check your email for detailed instructions</li>
            <li>🪙 Claim your AquaHope Impact Tokens (AIT)</li>
            <li>🏆 Receive your unique donor badge NFT</li>
            <li>🗳️ Start voting on future borehole locations</li>
            <li>💰 Your donation is earning yield in our DeFi pool</li>
          </ul>
          <button 
            onClick={() => {
              setShowSuccess(false)
              setName('')
              setEmail('')
              setMessage('')
              setLocation('')
              setAmount('0.05')
              setTokenCode('')
            }}
            style={{ marginTop: '20px' }}
          >
            Make Another Donation
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-hero">
        <div className="pill">Donate Today</div>
        <h2 style={{ margin: '6px 0 10px' }}>Provide Clean Water With ETH</h2>
        <p className="muted">Your donation funds borehole drilling, generates yield for maintenance, and earns you voting tokens.</p>
      </div>
      <div className="donate-panel">
        <h3>Donate ETH & Earn Impact Tokens</h3>
        <p className="muted">Support borehole drilling projects. Every contribution moves us closer to universal access to clean water and earns you governance tokens.</p>
        
        <label>Name (optional)</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name or leave blank" />
        
        <label>Email Address *</label>
        <input 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          placeholder="your@email.com (required for token delivery)" 
          required
        />
        
        <label>Preferred Project Location *</label>
        <select value={location} onChange={e => setLocation(e.target.value)} required>
          <option value="">Select a location</option>
          <option value="Kenya">Kenya</option>
          <option value="Uganda">Uganda</option>
          <option value="Tanzania">Tanzania</option>
          <option value="Ethiopia">Ethiopia</option>
          <option value="Ghana">Ghana</option>
          <option value="Nigeria">Nigeria</option>
          <option value="Other">Other</option>
        </select>
        
        <label>Message (optional)</label>
        <textarea 
          value={message} 
          onChange={e => setMessage(e.target.value)} 
          placeholder="Your message of support"
          rows="3"
        />
        
        <label>Amount (ETH)</label>
        <input type="number" min="0" step="0.001" value={amount} onChange={e => setAmount(e.target.value)} />
        
        <div style={{ 
          background: '#e8f4fd', 
          padding: '15px', 
          borderRadius: '8px', 
          margin: '15px 0',
          borderLeft: '4px solid #667eea'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#667eea' }}>🌟 What You'll Receive:</h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li><strong>{Math.floor(Number(amount) * 1000)} AIT Tokens</strong> (1000 per ETH)</li>
            <li><strong>Voting Power</strong> to choose future borehole locations</li>
            <li><strong>NFT Badge</strong> showing your contribution level</li>
            <li><strong>Yield Generation</strong> from DeFi protocols</li>
          </ul>
        </div>
        
        <button onClick={donate} disabled={loading || !email || !location}>
          {loading ? 'Processing…' : account ? 'Donate & Earn Tokens' : 'Connect Wallet & Donate'}
        </button>
        
        <p className="muted" style={{ marginTop: 8 }}>
          Your donation will be recorded on the blockchain, deposited into our DeFi yield pool, and used to fund clean water projects in African villages.
        </p>
      </div>
    </div>
  )
}


