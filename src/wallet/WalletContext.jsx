import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ethers } from 'ethers'

const WalletContext = createContext({})

export function WalletProvider({ children }) {
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [account, setAccount] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    if (window.ethereum) {
      const browserProvider = new ethers.BrowserProvider(window.ethereum)
      setProvider(browserProvider)
      browserProvider.listAccounts().then(accs => {
        if (accs && accs.length) {
          setAccount(accs[0].address)
          browserProvider.getSigner().then(s => setSigner(s))
        }
      }).catch(() => {})

      const handleAccountsChanged = (accs) => {
        if (!accs || accs.length === 0) {
          setAccount(null)
          setSigner(null)
        } else {
          setAccount(accs[0])
          browserProvider.getSigner().then(s => setSigner(s))
        }
      }
      window.ethereum.on?.('accountsChanged', handleAccountsChanged)
      return () => window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged)
    }
  }, [])

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask not found. Please install it to donate.')
      return
    }
    if (isConnecting) return
    try {
      setIsConnecting(true)
      const accs = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setAccount(accs[0])
      const browserProvider = new ethers.BrowserProvider(window.ethereum)
      setProvider(browserProvider)
      const s = await browserProvider.getSigner()
      setSigner(s)
    } catch (err) {
      console.error(err)
    } finally {
      setIsConnecting(false)
    }
  }

  const value = useMemo(() => ({ provider, signer, account, isConnecting, connectWallet }), [provider, signer, account, isConnecting])
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  return useContext(WalletContext)
}




