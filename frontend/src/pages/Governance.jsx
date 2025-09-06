import { useState, useEffect } from 'react'
import { useWallet } from '../wallet/WalletContext.jsx'

export default function Governance() {
  const { account, contract } = useWallet()
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(false)
  const [votingPower, setVotingPower] = useState(0)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    location: '',
    budget: ''
  })

  useEffect(() => {
    if (account) {
      loadVotingPower()
      loadProposals()
    }
  }, [account])

  const loadVotingPower = async () => {
    try {
      // This would call the AIT token contract to get voting power
      // For now, we'll simulate it
      const response = await fetch(`/api/blockchain/donor-voting-power/${account}`)
      const data = await response.json()
      if (data.success) {
        setVotingPower(parseFloat(data.votingPower))
      }
    } catch (error) {
      console.error('Failed to load voting power:', error)
    }
  }

  const loadProposals = async () => {
    try {
      // This would load proposals from the governance contract
      // For now, we'll use mock data
      const mockProposals = [
        {
          id: 1,
          title: "Borehole Installation in Kibera, Kenya",
          description: "Install a new borehole to provide clean water access to 5,000 residents in Kibera slum, Nairobi.",
          location: "Kibera, Nairobi, Kenya",
          budget: "2.5",
          proposer: "0x1234...5678",
          startTime: Date.now() - 86400000, // 1 day ago
          endTime: Date.now() + 518400000, // 6 days from now
          forVotes: "1500",
          againstVotes: "200",
          executed: false,
          cancelled: false,
          status: "Active"
        },
        {
          id: 2,
          title: "Water Purification System in Kampala",
          description: "Install advanced water purification systems in three schools in Kampala, Uganda.",
          location: "Kampala, Uganda",
          budget: "1.8",
          proposer: "0x8765...4321",
          startTime: Date.now() - 172800000, // 2 days ago
          endTime: Date.now() + 432000000, // 5 days from now
          forVotes: "800",
          againstVotes: "150",
          executed: false,
          cancelled: false,
          status: "Active"
        },
        {
          id: 3,
          title: "Maintenance Fund for Existing Wells",
          description: "Create a maintenance fund for 20 existing wells across rural Tanzania.",
          location: "Rural Tanzania",
          budget: "3.2",
          proposer: "0xabcd...efgh",
          startTime: Date.now() - 259200000, // 3 days ago
          endTime: Date.now() - 86400000, // 1 day ago
          forVotes: "2200",
          againstVotes: "300",
          executed: true,
          cancelled: false,
          status: "Executed"
        }
      ]
      setProposals(mockProposals)
    } catch (error) {
      console.error('Failed to load proposals:', error)
    }
  }

  const voteOnProposal = async (proposalId, support) => {
    if (!account) {
      alert('Please connect your wallet to vote')
      return
    }

    if (votingPower === 0) {
      alert('You need AIT tokens to vote. Make a donation first!')
      return
    }

    try {
      setLoading(true)
      
      const response = await fetch('/api/blockchain/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId: proposalId,
          support: support
        })
      })

      const result = await response.json()
      
      if (result.success) {
        alert(`Vote cast successfully! Transaction: ${result.txHash}`)
        loadProposals() // Reload proposals to show updated votes
      } else {
        alert(`Failed to vote: ${result.error}`)
      }
    } catch (error) {
      console.error('Failed to vote:', error)
      alert('Failed to cast vote. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const createProposal = async () => {
    if (!account) {
      alert('Please connect your wallet to create a proposal')
      return
    }

    if (!newProposal.title || !newProposal.description || !newProposal.location || !newProposal.budget) {
      alert('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      
      const response = await fetch('/api/blockchain/create-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProposal)
      })

      const result = await response.json()
      
      if (result.success) {
        alert(`Proposal created successfully! Transaction: ${result.txHash}`)
        setNewProposal({ title: '', description: '', location: '', budget: '' })
        setShowCreateForm(false)
        loadProposals() // Reload proposals
      } else {
        alert(`Failed to create proposal: ${result.error}`)
      }
    } catch (error) {
      console.error('Failed to create proposal:', error)
      alert('Failed to create proposal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getProposalStatus = (proposal) => {
    if (proposal.cancelled) return 'Cancelled'
    if (proposal.executed) return 'Executed'
    if (Date.now() > proposal.endTime) {
      return proposal.forVotes > proposal.againstVotes ? 'Succeeded' : 'Defeated'
    }
    return 'Active'
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  return (
    <div>
      <div className="page-hero">
        <div className="pill">🗳️ Governance</div>
        <h2 style={{ margin: '6px 0 10px' }}>Vote on Borehole Locations</h2>
        <p className="muted">Use your AIT tokens to vote on where the next boreholes should be built.</p>
      </div>

      {account && (
        <div className="donate-panel" style={{ marginBottom: '20px' }}>
          <h3>Your Voting Power</h3>
          <div style={{ 
            background: '#e8f4fd', 
            padding: '15px', 
            borderRadius: '8px',
            borderLeft: '4px solid #667eea'
          }}>
            <p style={{ margin: 0, fontSize: '18px' }}>
              <strong>{votingPower.toFixed(2)} AIT Tokens</strong>
            </p>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>
              {votingPower > 0 ? 'You can vote on proposals!' : 'Make a donation to earn voting tokens.'}
            </p>
          </div>
        </div>
      )}

      <div className="donate-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Active Proposals</h3>
          {account && votingPower > 0 && (
            <button onClick={() => setShowCreateForm(!showCreateForm)}>
              {showCreateForm ? 'Cancel' : 'Create Proposal'}
            </button>
          )}
        </div>

        {showCreateForm && (
          <div style={{ 
            background: '#f9f9f9', 
            padding: '20px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #ddd'
          }}>
            <h4>Create New Proposal</h4>
            <label>Title</label>
            <input 
              value={newProposal.title}
              onChange={e => setNewProposal({...newProposal, title: e.target.value})}
              placeholder="Proposal title"
            />
            
            <label>Description</label>
            <textarea 
              value={newProposal.description}
              onChange={e => setNewProposal({...newProposal, description: e.target.value})}
              placeholder="Detailed description of the project"
              rows="3"
            />
            
            <label>Location</label>
            <input 
              value={newProposal.location}
              onChange={e => setNewProposal({...newProposal, location: e.target.value})}
              placeholder="Project location"
            />
            
            <label>Budget (ETH)</label>
            <input 
              type="number"
              value={newProposal.budget}
              onChange={e => setNewProposal({...newProposal, budget: e.target.value})}
              placeholder="Required budget in ETH"
              step="0.1"
            />
            
            <button onClick={createProposal} disabled={loading}>
              {loading ? 'Creating...' : 'Create Proposal'}
            </button>
          </div>
        )}

        {proposals.length === 0 ? (
          <p>No proposals available.</p>
        ) : (
          proposals.map(proposal => (
            <div key={proposal.id} style={{ 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              padding: '20px', 
              marginBottom: '15px',
              background: proposal.status === 'Active' ? '#fff' : '#f9f9f9'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, color: proposal.status === 'Active' ? '#333' : '#666' }}>
                  {proposal.title}
                </h4>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  fontSize: '12px',
                  background: proposal.status === 'Active' ? '#e8f4fd' : '#f0f0f0',
                  color: proposal.status === 'Active' ? '#667eea' : '#666'
                }}>
                  {getProposalStatus(proposal)}
                </span>
              </div>
              
              <p style={{ color: '#666', margin: '10px 0' }}>{proposal.description}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '15px 0' }}>
                <div>
                  <strong>Location:</strong> {proposal.location}
                </div>
                <div>
                  <strong>Budget:</strong> {proposal.budget} ETH
                </div>
                <div>
                  <strong>Proposer:</strong> {proposal.proposer}
                </div>
                <div>
                  <strong>Ends:</strong> {formatTime(proposal.endTime)}
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: '#f8f8f8',
                padding: '10px',
                borderRadius: '4px',
                margin: '15px 0'
              }}>
                <div>
                  <span style={{ color: 'green' }}>✅ {proposal.forVotes} For</span>
                  <span style={{ margin: '0 15px', color: '#666' }}>|</span>
                  <span style={{ color: 'red' }}>❌ {proposal.againstVotes} Against</span>
                </div>
                {proposal.status === 'Active' && account && votingPower > 0 && (
                  <div>
                    <button 
                      onClick={() => voteOnProposal(proposal.id, true)}
                      disabled={loading}
                      style={{ marginRight: '10px', background: 'green', color: 'white' }}
                    >
                      Vote For
                    </button>
                    <button 
                      onClick={() => voteOnProposal(proposal.id, false)}
                      disabled={loading}
                      style={{ background: 'red', color: 'white' }}
                    >
                      Vote Against
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

