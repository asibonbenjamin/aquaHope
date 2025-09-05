import { useState } from 'react'
import { ethers } from 'ethers'
import { useWallet } from '../wallet/WalletContext.jsx'
// import { useNavigate } from 'react-router-dom'

export default function Donate() {
  const { signer, account, connectWallet } = useWallet()
  const [amount, setAmount] = useState('0.05')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  // const navigate = useNavigate()

  const donate = async () => {
    if (!account) {
      await connectWallet()
      if (!signer) return
    }
    try {
      setLoading(true)
      // NOTE: For demo purposes, we send to the same connected account. Replace with
      // a real donation address for production.
      const toAddress = account
      const tx = await signer.sendTransaction({
        to: toAddress,
        value: ethers.parseEther(String(amount || '0')),
      })
      await tx.wait()

      const donors = JSON.parse(localStorage.getItem('donors') || '[]')
      const impactTokens = Math.floor(Number(amount) * 1000 * 0.10) // 10% credit ratio
      const entry = { name: name || 'Anonymous', address: account, amount: Number(amount), txHash: tx.hash, time: Date.now(), tokens: impactTokens }
      donors.unshift(entry)
      localStorage.setItem('donors', JSON.stringify(donors))
      const prev = Number(localStorage.getItem('total_donations_eth') || '0')
      localStorage.setItem('total_donations_eth', String(prev + Number(amount)))
      setName('')
      setAmount('0.05')
    } catch (e) {
      console.error(e)
      alert('Transaction failed or rejected.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-hero">
        <div className="pill">Donate Today</div>
        <h2 style={{ margin: '6px 0 10px' }}>Provide Clean Water With ETH</h2>
        <p className="muted">Your donation funds borehole drilling and maintenance training in African villages.</p>
      </div>
      <div className="donate-panel">
      <h3>Donate ETH</h3>
      <p className="muted">Support borehole drilling projects. Every contribution moves us closer to universal access to clean water.</p>
      <label>Name (optional)</label>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name or leave blank" />
      <label>Amount (ETH)</label>
      <input type="number" min="0" step="0.001" value={amount} onChange={e => setAmount(e.target.value)} />
      <button onClick={donate} disabled={loading}>{loading ? 'Processing…' : account ? 'Donate' : 'Connect Wallet & Donate'}</button>
      <p className="muted" style={{ marginTop: 8 }}>Note: This demo sends ETH to your connected account for testing. Configure a real donation address before production use.</p>
      </div>
    </div>
  )
}


