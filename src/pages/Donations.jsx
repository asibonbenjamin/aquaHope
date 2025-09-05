export default function Donations() {
  const donors = JSON.parse(localStorage.getItem('donors') || '[]')
  const total = Number(localStorage.getItem('total_donations_eth') || '0')

  return (
    <div>
      <div className="page-hero">
        <div className="pill">Transparency</div>
        <h2 style={{ margin: '6px 0 10px' }}>Donations & Totals</h2>
        <p className="muted">Thanks to our generous supporters making clean water possible.</p>
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <div><strong>Total Donated:</strong> {total.toFixed(3)} ETH</div>
          <div><strong>Total Donors:</strong> {donors.length}</div>
        </div>
      </div>
      <div className="list">
        {donors.length === 0 && <div className="muted">No donations yet. Be the first to give.</div>}
        {donors.map((d, idx) => (
          <div className="list-item" key={idx}>
            <div style={{ display: 'grid' }}>
              <strong>{d.name}</strong>
              <span className="muted" title={d.address}>{d.address.slice(0, 6)}…{d.address.slice(-4)}</span>
            </div>
            <div>
              <strong>{Number(d.amount).toFixed(3)} ETH</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


