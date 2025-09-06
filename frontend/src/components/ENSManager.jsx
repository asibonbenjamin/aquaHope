import React, { useState, useEffect } from 'react';
import { useWallet } from '../wallet/WalletContext.jsx';

/**
 * ENS Manager Component
 * Allows users to manually set and manage their ENS name
 */
export default function ENSManager() {
  const { account, ensName, ensLoading, refreshEnsNames } = useWallet();
  const [customEnsName, setCustomEnsName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load saved ENS name from localStorage
  useEffect(() => {
    if (account) {
      const savedEnsName = localStorage.getItem(`ens_name_${account.toLowerCase()}`);
      if (savedEnsName) {
        setCustomEnsName(savedEnsName);
      }
    }
  }, [account]);

  const handleSave = async () => {
    if (!customEnsName.trim()) {
      alert('Please enter an ENS name');
      return;
    }

    setLoading(true);
    try {
      // Validate ENS name format
      if (!isValidEnsName(customEnsName)) {
        alert('Please enter a valid ENS name (e.g., "myname.eth")');
        return;
      }

      // Save to localStorage
      if (account) {
        localStorage.setItem(`ens_name_${account.toLowerCase()}`, customEnsName);
        setSaved(true);
        setIsEditing(false);
        
        // Refresh ENS names throughout the app
        await refreshEnsNames();
        
        // Auto-reload the page to update all components
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
        // Show success message
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save ENS name:', error);
      alert('Failed to save ENS name');
    } finally {
      setLoading(false);
    }
  };

  // Auto-save as user types (with debounce)
  useEffect(() => {
    if (!isEditing || !customEnsName.trim()) return;
    
    const timeoutId = setTimeout(async () => {
      if (isValidEnsName(customEnsName) && account) {
        try {
          localStorage.setItem(`ens_name_${account.toLowerCase()}`, customEnsName);
          await refreshEnsNames();
        } catch (error) {
          console.warn('Auto-save failed:', error);
        }
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [customEnsName, isEditing, account, refreshEnsNames]);

  const handleCancel = () => {
    // Reset to saved value
    if (account) {
      const savedEnsName = localStorage.getItem(`ens_name_${account.toLowerCase()}`);
      setCustomEnsName(savedEnsName || '');
    }
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const isValidEnsName = (name) => {
    // Basic ENS name validation
    const ensRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.eth$/i;
    return ensRegex.test(name);
  };

  const getDisplayName = () => {
    if (customEnsName) return customEnsName;
    if (ensName) return ensName;
    return account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Unknown';
  };

  if (!account) {
    return (
      <div className="ens-manager">
        <p>Please connect your wallet to manage ENS names</p>
      </div>
    );
  }

  return (
    <div className="ens-manager">
      <h3>ENS Name Management</h3>
      
      <div className="ens-display">
        <div className="current-ens">
          <strong>Current Display Name:</strong>
          <div className="ens-name-display">
            {getDisplayName()}
            {ensLoading && <span className="ens-loading">⏳</span>}
          </div>
        </div>
        
        <div className="ens-sources">
          <div className="ens-source">
            <span className="source-label">Auto-resolved:</span>
            <span className="source-value">{ensName || 'Not found'}</span>
          </div>
          <div className="ens-source">
            <span className="source-label">Custom:</span>
            <span className="source-value">{customEnsName || 'Not set'}</span>
          </div>
        </div>
      </div>

      {!isEditing ? (
        <div className="ens-actions">
          <button onClick={handleEdit} className="edit-button">
            {customEnsName ? 'Edit ENS Name' : 'Set Custom ENS Name'}
          </button>
          {customEnsName && (
            <button 
              onClick={async () => {
                localStorage.removeItem(`ens_name_${account.toLowerCase()}`);
                setCustomEnsName('');
                setSaved(true);
                
                // Refresh ENS names throughout the app
                await refreshEnsNames();
                
                setTimeout(() => setSaved(false), 3000);
              }}
              className="clear-button"
            >
              Clear Custom Name
            </button>
          )}
        </div>
      ) : (
        <div className="ens-edit-form">
          <div className="form-group">
            <label>Custom ENS Name</label>
            <input
              type="text"
              value={customEnsName}
              onChange={(e) => setCustomEnsName(e.target.value)}
              placeholder="Enter your ENS name (e.g., myname.eth)"
              className="ens-input"
            />
            <small className="form-help">
              Enter your ENS name to display it instead of your address throughout the app
            </small>
          </div>
          
          <div className="form-actions">
            <button 
              onClick={handleSave} 
              disabled={loading || !customEnsName.trim()}
              className="save-button"
            >
              {loading ? 'Saving...' : 'Save ENS Name'}
            </button>
            <button 
              onClick={handleCancel}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {saved && (
        <div className="success-message">
          ✅ ENS name saved successfully!
        </div>
      )}

      <div className="ens-info">
        <h4>How it works:</h4>
        <ul>
          <li><strong>Auto-resolved:</strong> Automatically detected from the blockchain</li>
          <li><strong>Custom:</strong> Manually set by you for display purposes</li>
          <li><strong>Priority:</strong> Custom name takes precedence over auto-resolved</li>
          <li><strong>Scope:</strong> This name will be used throughout the entire app</li>
        </ul>
      </div>
    </div>
  );
}
