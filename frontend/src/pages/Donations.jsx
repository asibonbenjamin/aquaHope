import { useState, useEffect } from 'react'
import ENSAddress from '../components/ENSAddress.jsx'
import { useMultipleENS } from '../hooks/useENS.js'

export default function Donations() {
  const donors = JSON.parse(localStorage.getItem('donors') || '[]')
  const total = Number(localStorage.getItem('total_donations_eth') || '0')
  
  // Get all unique addresses for ENS resolution
  const addresses = [...new Set(donors.map(d => d.address))]
  const { ensNames, loading: ensLoading } = useMultipleENS(addresses)

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
          {ensLoading && <div className="ens-loading">⏳ Resolving ENS names...</div>}
        </div>
      </div>
      
      <div className="list">
        {donors.length === 0 && <div className="muted">No donations yet. Be the first to give.</div>}
        {donors.map((d, idx) => (
          <div className="list-item" key={idx}>
            <div style={{ display: 'grid', gap: '4px' }}>
              <strong>{d.name}</strong>
              <ENSAddress 
                address={d.address}
                showAvatar={true}
                copyable={true}
                className="donor-address"
                title={`${d.name}: ${d.address}`}
              />
              {d.message && (
                <div className="donation-message" style={{ 
                  fontSize: '14px', 
                  color: '#666', 
                  fontStyle: 'italic',
                  marginTop: '4px'
                }}>
                  "{d.message}"
                </div>
              )}
              {d.location && (
                <div className="donation-location" style={{ 
                  fontSize: '12px', 
                  color: '#888',
                  marginTop: '2px'
                }}>
                  📍 {d.location}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div><strong>{Number(d.amount).toFixed(3)} ETH</strong></div>
              {d.tokens && (
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {d.tokens} AIT tokens
                </div>
              )}
              <div style={{ fontSize: '11px', color: '#999' }}>
                {new Date(d.time).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}