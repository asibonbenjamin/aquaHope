import React, { useState, useEffect } from 'react';

/**
 * ENS Connection Modal
 * Shows when user connects wallet to ask for ENS name first
 */
export default function ENSConnectionModal({ 
  isOpen, 
  onClose, 
  onProceed, 
  account 
}) {
  const [ensName, setEnsName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load existing ENS name if available
  useEffect(() => {
    if (account && isOpen) {
      const savedEnsName = localStorage.getItem(`ens_name_${account.toLowerCase()}`);
      if (savedEnsName) {
        setEnsName(savedEnsName);
      }
    }
  }, [account, isOpen]);

  // Auto-save as user types (with debounce)
  useEffect(() => {
    if (!isOpen || !ensName.trim() || !account) return;
    
    const timeoutId = setTimeout(() => {
      if (isValidEnsName(ensName)) {
        try {
          localStorage.setItem(`ens_name_${account.toLowerCase()}`, ensName);
        } catch (error) {
          console.warn('Auto-save failed:', error);
        }
      }
    }, 500); // 0.5 second debounce for faster response

    return () => clearTimeout(timeoutId);
  }, [ensName, isOpen, account]);

  const isValidEnsName = (name) => {
    // Basic ENS name validation
    const ensRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.eth$/i;
    return ensRegex.test(name);
  };

  const handleProceed = async () => {
    if (!account) return;

    setLoading(true);
    try {
      // Save ENS name if provided
      if (ensName.trim()) {
        if (!isValidEnsName(ensName)) {
          alert('Please enter a valid ENS name (e.g., "myname.eth")');
          return;
        }
        
        localStorage.setItem(`ens_name_${account.toLowerCase()}`, ensName.trim());
        setSaved(true);
        
        // Show success message briefly
        setTimeout(() => {
          setSaved(false);
          onProceed();
        }, 1000);
      } else {
        // Proceed without ENS name
        onProceed();
      }
    } catch (error) {
      console.error('Failed to save ENS name:', error);
      alert('Failed to save ENS name');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onProceed();
  };

  if (!isOpen) return null;

  return (
    <div className="ens-modal-overlay">
      <div className="ens-modal">
        <div className="ens-modal-header">
          <h2>🌐 Set Your Display Name</h2>
          <p>Choose how you'd like to be identified throughout the platform</p>
        </div>

        <div className="ens-modal-content">
          <div className="wallet-info">
            <div className="wallet-address">
              <strong>Connected Wallet:</strong>
              <span className="address">{account}</span>
            </div>
          </div>

          <div className="ens-input-section">
            <label htmlFor="ens-input">ENS Name (Optional)</label>
            <input
              id="ens-input"
              type="text"
              value={ensName}
              onChange={(e) => setEnsName(e.target.value)}
              placeholder="Enter your ENS name (e.g., myname.eth)"
              className="ens-input"
              autoFocus
            />
            <small className="input-help">
              This will be your display name throughout the app. You can change it later in your account settings.
            </small>
          </div>

          <div className="ens-preview">
            <h4>Live Preview:</h4>
            <div className="preview-display">
              {ensName.trim() ? (
                <span className="ens-name">
                  {ensName}
                  {!isValidEnsName(ensName) && ensName.trim() && (
                    <span className="validation-warning"> (Invalid format)</span>
                  )}
                </span>
              ) : (
                <span className="address-fallback">
                  {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Unknown'}
                </span>
              )}
            </div>
            <div className="preview-note">
              {ensName.trim() && isValidEnsName(ensName) ? (
                <span className="valid-ens">✅ Valid ENS name</span>
              ) : ensName.trim() ? (
                <span className="invalid-ens">⚠️ Invalid format (e.g., "myname.eth")</span>
              ) : (
                <span className="no-ens">ℹ️ Will show truncated address</span>
              )}
            </div>
          </div>

          {saved && (
            <div className="success-message">
              ✅ ENS name saved successfully!
            </div>
          )}
        </div>

        <div className="ens-modal-actions">
          <button 
            onClick={handleSkip}
            className="skip-button"
            disabled={loading}
          >
            Skip for Now
          </button>
          <button 
            onClick={handleProceed}
            className="proceed-button"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
