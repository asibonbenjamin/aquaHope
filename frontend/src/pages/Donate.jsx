import { useState } from 'react'
import { ethers } from 'ethers'
import { useWallet } from '../wallet/WalletContext.jsx'
import ENSAddress from '../components/ENSAddress.jsx'

export default function Donate() {
  const { signer, account, connectWallet, contract, ensName, ensLoading } = useWallet()
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

    if (!name.trim()) {
      alert('Please enter your name.')
      return
    }

    if (!location.trim()) {
      alert('Please select a preferred project location.')
      return
    }

    if (parseFloat(amount) <= 0) {
      alert('Please enter a valid donation amount.')
      return
    }

    setLoading(true)
    try {
      const tx = await contract.donate(
        name,
        email,
        message,
        location,
        { value: ethers.parseEther(amount) }
      )
      
      console.log('Transaction sent:', tx.hash)
      
      // Wait for transaction to be mined
      const receipt = await tx.wait()
      console.log('Transaction confirmed:', receipt)
      
      // Get the generated token code from the transaction logs
      const donationEvent = receipt.logs.find(log => {
        try {
          const decoded = contract.interface.parseLog(log)
          return decoded.name === 'DonationReceived'
        } catch {
          return false
        }
      })
      
      if (donationEvent) {
        const decoded = contract.interface.parseLog(donationEvent)
        const generatedTokenCode = decoded.args.tokenCode.toString()
        setTokenCode(generatedTokenCode)
        
        // Store donation in localStorage for display
        const donationData = {
          name,
          email,
          address: account,
          ensName: ensName || null,
          amount: parseFloat(amount),
          message,
          location,
          time: new Date().toISOString(),
          tokens: Math.floor(parseFloat(amount) * 1000), // 1000 tokens per ETH
          tokenCode: generatedTokenCode
        }
        
        const existingDonors = JSON.parse(localStorage.getItem('donors') || '[]')
        existingDonors.push(donationData)
        localStorage.setItem('donors', JSON.stringify(existingDonors))
        
        // Update total donations
        const currentTotal = parseFloat(localStorage.getItem('total_donations_eth') || '0')
        localStorage.setItem('total_donations_eth', (currentTotal + parseFloat(amount)).toString())
        
        // Send email with token code
        try {
          await fetch('/api/email/send-donation-confirmation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              name,
              amount,
              tokenCode: generatedTokenCode,
              location,
              message
            })
          })
        } catch (emailError) {
          console.warn('Failed to send email:', emailError)
        }
        
        setShowSuccess(true)
      }
      
    } catch (error) {
      console.error('Donation failed:', error)
      alert(`Donation failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setAmount('0.05')
    setName('')
    setEmail('')
    setMessage('')
    setLocation('')
    setTokenCode('')
    setShowSuccess(false)
  }

  if (showSuccess) {
    return (
      <div>
        <div className="page-hero">
          <div className="pill">🎉 Success!</div>
          <h2 style={{ margin: '6px 0 10px' }}>Thank You for Your Donation!</h2>
          <p className="muted">Your contribution is making a difference in providing clean water access.</p>
        </div>
        
        <div className="card" style={{ marginBottom: 20 }}>
          <h3>Donation Confirmed</h3>
          <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
            <div><strong>Donor:</strong> {name}</div>
            <div><strong>Email:</strong> {email}</div>
            <div><strong>Address:</strong> 
              <ENSAddress 
                address={account}
                showAvatar={true}
                copyable={true}
                className="donor-address"
              />
              {ensLoading && <span className="ens-loading">⏳</span>}
            </div>
            <div><strong>Amount:</strong> {amount} ETH</div>
            <div><strong>Location:</strong> {location}</div>
            {message && <div><strong>Message:</strong> "{message}"</div>}
          </div>
          
          <div style={{ 
            background: '#e8f4fd', 
            padding: '15px', 
            borderRadius: '8px',
            borderLeft: '4px solid #667eea',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#667eea' }}>🔑 Your Token Code</h4>
            <div style={{ 
              fontFamily: 'monospace', 
              fontSize: '18px', 
              fontWeight: 'bold',
              color: '#333',
              background: '#f8f9fa',
              padding: '10px',
              borderRadius: '4px',
              textAlign: 'center',
              marginBottom: '10px'
            }}>
              {tokenCode}
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              This code has been sent to your email and can be used to claim your AIT tokens and NFT badge.
            </p>
          </div>
          
          <div style={{ 
            background: '#f0f8f0', 
            padding: '15px', 
            borderRadius: '8px',
            borderLeft: '4px solid #28a745',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#28a745' }}>🎁 What You'll Receive</h4>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li><strong>AIT Tokens:</strong> {Math.floor(parseFloat(amount) * 1000)} tokens for voting on future projects</li>
              <li><strong>NFT Badge:</strong> A unique badge showing your contribution level</li>
              <li><strong>Governance Rights:</strong> Vote on where the next boreholes should be built</li>
              <li><strong>Yield Earnings:</strong> Your donation earns yield through DeFi protocols</li>
            </ul>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={resetForm}>
              Make Another Donation
            </button>
            <button onClick={() => window.location.href = '/claim-tokens'}>
              Claim Your Tokens
            </button>
            <button onClick={() => window.location.href = '/governance'}>
              View Governance
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-hero">
        <div className="pill">💧 Donate</div>
        <h2 style={{ margin: '6px 0 10px' }}>Support Clean Water Projects</h2>
        <p className="muted">Your donation helps build boreholes and provide clean water access to communities in need.</p>
      </div>

      {!account ? (
        <div className="card">
          <h3>Connect Your Wallet</h3>
          <p>Please connect your wallet to make a donation.</p>
          <button onClick={connectWallet} disabled={loading}>
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      ) : (
        <div className="donate-panel">
          <h3>Make a Donation</h3>
          
          <div style={{ 
            background: '#f8f9fa', 
            padding: '15px', 
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Connected Wallet</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ENSAddress 
                address={account}
                showAvatar={true}
                copyable={true}
                className="wallet-address"
              />
              {ensLoading && <span className="ens-loading">⏳ Resolving ENS...</span>}
            </div>
          </div>

          <label>Donation Amount (ETH)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.05"
            step="0.01"
            min="0.001"
          />

          <label>Your Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />

          <label>Email Address *</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
          <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
            Required for token delivery and voting notifications
          </small>

          <label>Preferred Project Location</label>
          <select
            value={location}
            onChange={e => setLocation(e.target.value)}
            required
          >
            <option value="">Select a location</option>
            <option value="Kenya">Kenya</option>
            <option value="Uganda">Uganda</option>
            <option value="Tanzania">Tanzania</option>
            <option value="Ethiopia">Ethiopia</option>
            <option value="Ghana">Ghana</option>
            <option value="Nigeria">Nigeria</option>
            <option value="Other">Other</option>
          </select>

          <label>Message (Optional)</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Leave a message of support..."
            rows="3"
          />

          <div style={{ 
            background: '#e8f4fd', 
            padding: '15px', 
            borderRadius: '8px',
            borderLeft: '4px solid #667eea',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#667eea' }}>What You'll Receive</h4>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li><strong>AIT Tokens:</strong> {Math.floor(parseFloat(amount || 0) * 1000)} tokens for governance voting</li>
              <li><strong>NFT Badge:</strong> A unique badge based on your contribution level</li>
              <li><strong>Email Confirmation:</strong> Token code sent to your email for claiming</li>
              <li><strong>DeFi Yield:</strong> Your donation earns yield through Aave integration</li>
            </ul>
          </div>

          <button onClick={donate} disabled={loading || !name || !email || !location}>
            {loading ? 'Processing Donation...' : `Donate ${amount} ETH`}
          </button>
        </div>
      )}
    </div>
  )
}