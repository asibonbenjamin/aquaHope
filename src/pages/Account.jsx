import { useWallet } from '../wallet/WalletContext.jsx'

export default function Account() {
  const { account, connectWallet } = useWallet()
  const donors = JSON.parse(localStorage.getItem('donors') || '[]')
  const myDonations = account ? donors.filter(d => d.address?.toLowerCase() === account.toLowerCase()) : []

  return (
    <div>
      <div className="page-hero">
        <div className="pill">My Profile</div>
        <h2 style={{ margin: '6px 0 10px' }}>Account & Donations</h2>
        <p className="muted">Connect to view your donations and wallet address.</p>
      </div>
      {!account ? (
        <div className="card">
          <p className="muted">Connect your wallet to view your donations.</p>
          <button onClick={connectWallet}>Connect Wallet</button>
        </div>
      ) : (
        <div className="card">
          <div><strong>Wallet:</strong> {account}</div>
          <div style={{ marginTop: 12 }}>
            <strong>Your Donations</strong>
            <div className="list" style={{ marginTop: 8 }}>
              {myDonations.length === 0 && <div className="muted">No donations found.</div>}
              {myDonations.map((d, i) => (
                <div key={i} className="list-item">
                  <span>{d.name}</span>
                  <strong>{Number(d.amount).toFixed(3)} ETH</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


