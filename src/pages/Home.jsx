import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useWallet } from '../wallet/WalletContext.jsx'
import { ethers } from 'ethers'

export default function Home() {
  const totalDonationsEth = Number(localStorage.getItem('total_donations_eth') || '0')
  const villagesHelped = Number(localStorage.getItem('villages_helped') || '0') || Math.max(3, Math.floor(totalDonationsEth / 5))
  const totalDonors = JSON.parse(localStorage.getItem('donors') || '[]').length

  return (
    <div>
      <section className="hero">
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center'}}>
          <div className="pill" style={{ color: '#e5e7eb' }}>Get Involved</div>
          <h1 style={{ fontSize: 64, margin: '14px 0 8px' }}>
            Water Saves <span className="highlight">Life</span>
          </h1>
          <p style={{ fontSize: 20 }}>
            We build strength, stability, and self reliance through access to safe water.
          </p>
          <div className="cta" style={{ justifyContent: 'center', marginTop: 14 }}>
            <NavLink className="btn" to="/donate">Act Now</NavLink>
            <NavLink className="btn ghost" to="/gallery">See Impact</NavLink>
          </div>
          <div className="stats" style={{ marginTop: 18 }}>
            <div className="stat"><div className="num">{totalDonationsEth.toFixed(2)} ETH</div><div className="muted">Total Donated</div></div>
            <div className="stat"><div className="num">{villagesHelped}</div><div className="muted">Villages Helped</div></div>
            <div className="stat"><div className="num">{totalDonors}</div><div className="muted">Donors</div></div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 28 }} className="sections">
        <div className="card">
          <h3>Why Water?</h3>
          <p className="muted">Clean water reduces disease, empowers education, and boosts local economies.</p>
        </div>
        <div className="card">
          <h3>Our Approach</h3>
          <p className="muted">Local partners drill, train maintenance teams, and monitor long-term impact.</p>
        </div>
        <div className="card">
          <h3>Transparency</h3>
          <p className="muted">On-chain donations with public stats on total funds and donors.</p>
        </div>
      </section>

      <section style={{ marginTop: 40 }} className="split">
        <div>
          <div className="pill">About AquaHope</div>
          <h2 style={{ margin: '6px 0 10px' }}>More People, More Impact</h2>
          <p className="muted">We mobilize communities and resources to deliver reliable water sources. Together, we’re creating lasting change.</p>
          <div style={{ marginTop: 14 }}>
            <NavLink to="/donate" className="btn">Donate</NavLink>
            <NavLink to="/account" className="btn ghost" style={{ marginLeft: 10 }}>My Account</NavLink>
          </div>
        </div>
        <img alt="About program" src="https://images.unsplash.com/photo-1547051492-7f87fb92eedd?q=80&w=1200&auto=format&fit=crop" style={{ width: '100%', borderRadius: 12 }} />
      </section>

      <QuickDonate />

      <section style={{ marginTop: 40 }}>
        <div className="pill">How to Donate</div>
        <div className="card" style={{ marginTop: 12 }}>
          <ol>
            <li>Connect your wallet (MetaMask).</li>
            <li>Enter the amount in ETH and confirm the transaction.</li>
            <li>We update totals and donor list immediately.</li>
          </ol>
        </div>
      </section>

      <section style={{ marginTop: 40 }}>
        <div className="pill">Communities in Need</div>
        <div className="gallery-grid" style={{ marginTop: 12 }}>
          <img src="animal.png" alt="" />
          <img src="business.png" alt="" />
          <img src="education.png" alt="" />
          <img src="emergency.png" alt="" />
          <img src="other.png" alt="" />
        </div>
      </section>

      <section style={{ marginTop: 40 }}>
        <div className="pill">Partners</div>
        <div className="partners" style={{ marginTop: 12 }}>
          {[1,2,3,4,5,6].map(n => (
            <div key={n} className="partner">Partner {n}</div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 40 }} className="card">
        <div className="split">
          <div>
            <div className="pill">Newsletter</div>
            <h3 style={{ margin: '6px 0 10px' }}>Get updates on new boreholes</h3>
            <p className="muted">Monthly stories and impact stats straight to your inbox.</p>
          </div>
          <form onSubmit={(e)=>{e.preventDefault(); alert('Subscribed!')}} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input placeholder="Your Email Address" style={{ flex: 1 }} />
            <button className="btn" type="submit">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  )
}

function QuickDonate() {
  const { signer, account, connectWallet } = useWallet()
  const [amount, setAmount] = useState('0.05')
  const [loading, setLoading] = useState(false)
  const presets = ['0.01','0.05','0.1','0.25']

  const doDonate = async () => {
    if (!account) {
      await connectWallet()
      if (!signer) return
    }
    try {
      setLoading(true)
      const toAddress = account
      const tx = await signer.sendTransaction({ to: toAddress, value: ethers.parseEther(String(amount)) })
      await tx.wait()
      const donors = JSON.parse(localStorage.getItem('donors') || '[]')
      const impactTokens = Math.floor(Number(amount) * 1000 * 0.10)
      donors.unshift({ name: 'Anonymous', address: account, amount: Number(amount), txHash: tx.hash, time: Date.now(), tokens: impactTokens })
      localStorage.setItem('donors', JSON.stringify(donors))
      const prev = Number(localStorage.getItem('total_donations_eth') || '0')
      localStorage.setItem('total_donations_eth', String(prev + Number(amount)))
      alert('Thank you for your donation! Impact credits recorded locally.')
    } catch(e) {
      console.error(e)
      alert('Transaction failed or rejected.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section style={{ margin: '60px 0'}}>
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div className="pill">Donate Today</div>
        <h1 style={{ margin: '8px 0 8px', fontSize: '4.2rem' }}>Every Drop Counts</h1>
        <p className="muted" style={{ maxWidth: 700, margin: '5px auto 12px' }}>
          Your ETH donation helps drill boreholes and maintain water systems for villages across Africa.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
          {presets.map(p => (
            <button key={p} className="btn ghost" onClick={() => setAmount(p)}>{p} ETH</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', maxWidth: 520, margin: '0 auto 12px' }}>
          <input type="number" min="0" step="0.001" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (ETH)" style={{ flex: 1 }} />
          <button className="btn" onClick={doDonate} disabled={loading}>{loading ? 'Processing…' : 'Donate'}</button>
        </div>
        <p className="muted">Demo only: transfers to your own connected wallet. Replace donation address for production.</p>
      </div>
    </section>
  )
}


