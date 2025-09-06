import React, { useState, useEffect } from 'react';
import { useWallet } from '../wallet/WalletContext.jsx';
import ensService from '../services/ensService.js';

/**
 * Simple ENS Test Component
 * This component helps debug ENS functionality
 */
export default function ENSTest() {
  const { account, provider } = useWallet();
  const [ensName, setEnsName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (account && provider) {
      testENS();
    }
  }, [account, provider]);

  const testENS = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Initialize ENS service
      await ensService.initialize(provider);
      
      // Test with a known ENS name first
      const testAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // vitalik.eth
      const testName = await ensService.getEnsName(testAddress);
      console.log('Test ENS resolution:', testName);
      
      // Now test with user's address
      if (account) {
        const userEnsName = await ensService.getEnsName(account);
        console.log('User ENS name:', userEnsName);
        setEnsName(userEnsName);
      }
    } catch (err) {
      console.error('ENS test failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return <div>Please connect your wallet to test ENS</div>;
  }

  return (
    <div style={{ 
      background: '#f8f9fa', 
      padding: '15px', 
      borderRadius: '8px',
      border: '1px solid #e9ecef',
      margin: '10px 0'
    }}>
      <h4>ENS Test Debug</h4>
      <div><strong>Address:</strong> {account}</div>
      <div><strong>ENS Name:</strong> {loading ? 'Loading...' : ensName || 'Not found'}</div>
      <div><strong>Provider:</strong> {provider ? 'Connected' : 'Not connected'}</div>
      <div><strong>ENS Service:</strong> {ensService.initialized ? 'Initialized' : 'Not initialized'}</div>
      {error && <div><strong>Error:</strong> {error}</div>}
      <button onClick={testENS} disabled={loading}>
        {loading ? 'Testing...' : 'Test ENS'}
      </button>
    </div>
  );
}
