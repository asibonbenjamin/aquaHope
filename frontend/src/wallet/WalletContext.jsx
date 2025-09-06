import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_CONFIG } from '../contracts/contractConfig.js'

const WalletContext = createContext({})

export function WalletProvider({ children }) {
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [account, setAccount] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [contract, setContract] = useState(null)
  const [network, setNetwork] = useState(null)

  useEffect(() => {
    if (window.ethereum) {
      const browserProvider = new ethers.BrowserProvider(window.ethereum)
      setProvider(browserProvider)
      
      // Get network info
      browserProvider.getNetwork().then(net => {
        setNetwork(net)
      }).catch(() => {})
      
      browserProvider.listAccounts().then(accs => {
        if (accs && accs.length) {
          setAccount(accs[0].address)
          browserProvider.getSigner().then(s => {
            setSigner(s)
            // Initialize contract
            if (CONTRACT_CONFIG.CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
              const contractInstance = new ethers.Contract(
                CONTRACT_CONFIG.CONTRACT_ADDRESS,
                CONTRACT_CONFIG.CONTRACT_ABI,
                s
              )
              setContract(contractInstance)
            }
          })
        }
      }).catch(() => {})

      const handleAccountsChanged = (accs) => {
        if (!accs || accs.length === 0) {
          setAccount(null)
          setSigner(null)
          setContract(null)
        } else {
          setAccount(accs[0])
          browserProvider.getSigner().then(s => {
            setSigner(s)
            if (CONTRACT_CONFIG.CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
              const contractInstance = new ethers.Contract(
                CONTRACT_CONFIG.CONTRACT_ADDRESS,
                CONTRACT_CONFIG.CONTRACT_ABI,
                s
              )
              setContract(contractInstance)
            }
          })
        }
      }

      const handleChainChanged = (chainId) => {
        window.location.reload()
      }

      window.ethereum.on?.('accountsChanged', handleAccountsChanged)
      window.ethereum.on?.('chainChanged', handleChainChanged)
      
      return () => {
        window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged)
        window.ethereum?.removeListener?.('chainChanged', handleChainChanged)
      }
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
      
      // Get network info
      const net = await browserProvider.getNetwork()
      setNetwork(net)
      
      const s = await browserProvider.getSigner()
      setSigner(s)
      
      // Initialize contract
      if (CONTRACT_CONFIG.CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
        const contractInstance = new ethers.Contract(
          CONTRACT_CONFIG.CONTRACT_ADDRESS,
          CONTRACT_CONFIG.CONTRACT_ABI,
          s
        )
        setContract(contractInstance)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsConnecting(false)
    }
  }

  const value = useMemo(() => ({ 
    provider, 
    signer, 
    account, 
    isConnecting, 
    connectWallet, 
    contract, 
    network 
  }), [provider, signer, account, isConnecting, contract, network])
  
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  return useContext(WalletContext)
}




