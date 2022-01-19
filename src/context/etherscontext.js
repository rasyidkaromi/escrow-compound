/* eslint-disable */
/* eslint-disable-next-line */

// import socketIOClient from "socket.io-client";
// const ENDPOINT = "http://localhost:4000";
// const socket = socketIOClient(ENDPOINT, {
//   cors: {
//     origin: { origins: '*:*'}
//   }
// });

import React, { useState, createContext, useEffect } from 'react';
import { ethers } from 'ethers'
const EtherContext = createContext();
const EtherProvider = ({ socket, children }) => {

    const [errorMessage, setErrorMessage] = useState(null);
    const [defaultAccount, setDefaultAccount] = useState(null)
    const [userBalance, setUserBalance] = useState(0);
    // const [metamaskStatus, setmetamaskStatus] = useState(false)

    const [provider, setProvider] = useState(null);
    const [providerSigner, setProviderSigner] = useState(null);
    // const [JsonRpcProvider, setJsonRpcProvider] = useState(null)

    // COntract
    const [Escrow, setEscrow] = useState(null)
    const [CEther, setCEther] = useState(null)

    // DATA BALANCE
    const [escrowBalanceOfCether, setEscrowBalanceOfCether] = useState(null)
    const [escrowBalanceOUnderlyingfCether, setEscrowBalanceOUnderlyingfCether] = useState(null)
    const [meBorrowBalanceOfCEther, setmeBorrowBalanceOfCEther] = useState(null)

    const [CEtherBalance, setCEtherBalance] = useState(null)
    const [CEthertotalSupply, setCEthertotalSupply] = useState(null)

    // Data Escrow
    const [OwnerAddress, setOwnerAddress] = useState(null)
    const [AgentAddress, setAgentAddress] = useState([])
    const [accountStatus, setaccountStatus] = useState('Loading')
    const [EscrowBalance, setEscrowBalance] = useState(null)
    const [accountSampleList, setAccountSampleList] = useState([
        '0x90f79bf6eb2c4f870365e785982e1f101e93b906',
        '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65',
        '0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc'
    ])

    // from server
    const [myTransaction, setmyTransaction] = useState({})
    const [agentAction, setAgentAction] = useState([])

    // LOG ============================
    // useEffect(() => {
    //     console.log('OwnerAddress', OwnerAddress)
    //     console.log('AgentAddress', AgentAddress)
    //     console.log('defaultAccount', defaultAccount)
    // }, [OwnerAddress, AgentAddress, defaultAccount])

    // useEffect(() => {
    //     console.log('errorMessage', errorMessage)
    // }, [errorMessage])

    // useEffect(() => {
    //     console.log('accountStatus', accountStatus)
    // }, [accountStatus])

    // useEffect(()=>{
    //     console.log('myTransaction', myTransaction)
    // },[myTransaction])

    // useEffect(()=>{
    //     console.log('agentAction', agentAction)
    // },[agentAction])
    // useEffect(() => {
    //     if (Escrow) {
    //         console.log('Escrow_Contract', Escrow)
    //     }
    // }, [Escrow])
    // ================================

    useEffect(() => {
        socket.on('serverUpdate', (data) => {
            console.log('serverUpdate', data)
        })

        window.ethereum.on('accountsChanged', (accounts) => {
            if (!accounts.length) {
            }
            if (accounts.length > 0) {
                setDefaultAccount(accounts[0])
                setErrorMessage(null)
            }
        });
    }, [])

    useEffect(() => {
        if (provider) {
            callProvider()
        }
    }, [provider])

    useEffect(() => {
        if (provider && defaultAccount) {
            setProviderSigner(provider.getSigner())
        }
    }, [defaultAccount, provider])

    useEffect(() => {
        if (defaultAccount && OwnerAddress || defaultAccount && AgentAddress.length > 0) {
            if (defaultAccount.toLowerCase() == OwnerAddress.toLowerCase()) {
                setaccountStatus('Admin')
            } else {
                if (defaultAccount && AgentAddress.length > 0) {
                    if (AgentAddress.some(res => res.agentAddress.toLowerCase() === defaultAccount)) {
                        setaccountStatus('Agent')
                    } else {
                        setaccountStatus('Client')
                    }
                }
            }
        }
    }, [defaultAccount, OwnerAddress, AgentAddress])

    useEffect(() => {
        if (defaultAccount) {
            provider.getBalance(defaultAccount)
                .then(balanceResult => {
                    setUserBalance(ethers.utils.formatEther(balanceResult));
                })
            myTransactions()
            agentActions()

        }
    }, [defaultAccount])

    useEffect(() => {
        if (defaultAccount && Escrow) {
            provider.getBalance(defaultAccount).then(balanceResult => {
                setUserBalance(ethers.utils.formatEther(balanceResult));
            })
            Escrow['owner()']().then(res => {
                setOwnerAddress(res)
            })
            Escrow.getAgentList().then(res => {
                setAgentAddress(res)
            })
        }
    }, [defaultAccount, Escrow])

    useEffect(() => {
        if (CEther) {
            CEther.totalSupply().then(res => {
                setCEthertotalSupply(res.toString())
            })
        }
    }, [CEther])

    useEffect(() => {
        if (defaultAccount && CEther) {
            getBalanceCollection()
        }
    }, [defaultAccount, CEther])

    useEffect(() => {
        if (providerSigner) {
            setEscrow(new ethers.Contract(ESCROW, ESCROW_abi, providerSigner))
            setCEther(new ethers.Contract(CETH, CETH_abi, providerSigner))
        }
    }, [providerSigner])

    const getBalanceCollection = () => {
        if (defaultAccount && CEther) {
            CEther.callStatic.balanceOfUnderlying(ESCROW).then(res => {
                setEscrowBalanceOUnderlyingfCether(ethers.utils.formatEther(res))
            })
            CEther.callStatic.balanceOf(ESCROW).then(res => {
                setEscrowBalanceOfCether(res.toString())
            })
            CEther.callStatic.borrowBalanceCurrent(ESCROW).then(res => {
                setmeBorrowBalanceOfCEther(res.toString())
            })
        }
    }

    const connectWalletHandler = () => {
        if (window.ethereum && defaultAccount == null) {
            setProvider(new ethers.providers.Web3Provider(window.ethereum))
            window.ethereum.request({ method: 'eth_requestAccounts' })
                .then(result => {
                    setDefaultAccount(result[0]);
                })
                .catch(error => {
                    setErrorMessage(error.message);
                });

        } else if (!window.ethereum) {
            setErrorMessage('Please install MetaMask browser extension to interact');
        }
    }
    const callProvider = () => {
        provider.getBalance(CETH).then(res => {
            setCEtherBalance(ethers.utils.formatEther(res))
        })
        provider.getBalance(ESCROW).then(res => {
            setEscrowBalance(ethers.utils.formatEther(res))
        })
    }
    const myTransactions = () => {
        socket.emit('myTransactions', defaultAccount, (cb) => {
            setmyTransaction(cb)
        })
    }
    const agentActions = () => {
        socket.emit('agentAction', defaultAccount, (cb) => {
            setAgentAction(cb)
        })
    }
    const escrow_releaseOwner = async (str) => {
        if(Escrow){
            await Escrow.releaseOwner(str)
        }
    }
    const escrow_releaseAgent = async (str) => {
        if(Escrow){
            await Escrow.releaseAgent(str)
        }
    }
    const escrow_reverseReceiver = async (str) => {
        if(Escrow){
            await Escrow.reverseReceiver(str)
        }
    }
    const escrow_reverseAgent = async (str) => {
        if(Escrow){
            await Escrow.reverseAgent(str)
        }
    }
    const escrow_Disputed = async (str) => {
        if(Escrow){
            await Escrow.dispute(str)
        }
    }
    const escrow_Withdraw = async (str) => {
        if(Escrow){
            await Escrow.withdraw(str)
        }
    }

    return (
        <EtherContext.Provider value={{
            errorMessage, setErrorMessage,
            defaultAccount, setDefaultAccount,
            userBalance, setUserBalance,

            provider, setProvider,
            providerSigner, setProviderSigner,

            connectWalletHandler, Escrow,
            CEther, 

            CEtherBalance, CEthertotalSupply,

            escrowBalanceOfCether, escrowBalanceOUnderlyingfCether,
            meBorrowBalanceOfCEther,
            callProvider,

            // Escrow
            OwnerAddress, AgentAddress, accountStatus, EscrowBalance, myTransaction, agentAction, accountSampleList,
            myTransactions, getBalanceCollection,
            escrow_releaseOwner, escrow_releaseAgent, escrow_reverseReceiver, escrow_reverseAgent, escrow_Disputed, escrow_Withdraw, 
        }}>
            {children}
        </EtherContext.Provider>
    )
}

export { EtherContext, EtherProvider }