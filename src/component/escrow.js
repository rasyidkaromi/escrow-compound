/* eslint-disable */
/* eslint-disable-next-line */

import React, { useState, useContext } from 'react'
import { ethers } from 'ethers'
import { Container, Row, Col, Button, Form, Card } from 'react-bootstrap'
import { EtherContext } from '../context/etherscontext'
import './Wallet.css'

const Escrow = () => {

    const {
        errorMessage,
        defaultAccount,
        Escrow, callProvider, connectWalletHandler,
        accountStatus, AgentAddress, myTransaction, agentAction, accountSampleList,
        myTransactions, getBalanceCollection,
        escrow_releaseOwner, escrow_releaseAgent, escrow_reverseReceiver, escrow_reverseAgent, escrow_Disputed, escrow_Withdraw,
    } = useContext(EtherContext)

    const [addAgentAddress, setaddAgentAddress] = useState('')
    const [disablebuttonaddAgent, setdisablebuttonaddAgent] = useState(false)

    const [_sendValueEther, set_sendValueEther] = useState(0)
    const [_receiverAddress, set_receiverAddress] = useState('')
    const [_agentAddress, set_agentAddress] = useState('')

    const addAgent = async () => {
        if (Escrow && addAgentAddress != '') {
            Escrow["addSingleAgent(address)"](addAgentAddress).then((res) => {
                setaddAgentAddress('')
                callProvider()
                getBalanceCollection()
                myTransactions()
            }, (err) => {
                console.log(err.data.message)
            })
        }

    }
    const onAgentView = () => {
        if (agentAction.length > 0) {
            return (
                <Card.Body>
                    <h4>Client Data</h4>
                    <div className='mt-5' />
                    {agentAction.map((val, idx) => {
                        let backcol = () => {
                            if (val.data_escrow.disputed) {
                                return 'red'
                            }
                            if (val.data_sign.signedOwner == 'RELEASE') {
                                return 'green'
                            }

                        }
                        let backText = () => {
                            if (val.data_escrow.disputed || val.data_sign.signedOwner == 'RELEASE') {
                                return 'white'
                            } else {
                                return []
                            }
                        }
                        let status = () => {
                            switch (val.data_sign.signedOwner) {
                                case '':
                                    return 'PROCESS'
                                case 'RELEASE':
                                    return 'RELEASE'
                                case 'REVERT':
                                    return 'REVERT'

                                default:
                                    return ''
                            }
                        }
                        return (<div key={idx} >
                            <Row style={{}}>
                                <Col md={6}>
                                    <Card style={{
                                        fontSize: 10,
                                        textAlign: 'left',
                                        padding: 10,
                                        backgroundColor: backcol(),
                                        color: backText()
                                    }}>
                                        Sender {val._sender} <br />
                                        Receiver {val._receiver}<br />
                                        {val.data_escrow.fund / 10 ** 18} eth
                                        {val.data_escrow.disputed ? " Status Dispute" : ' Status : ' + status()}
                                    </Card>
                                </Col>
                                <Col md={3}>
                                    <Card style={{
                                        fontSize: 10,
                                    }}>
                                        <Button
                                            // variant={!val.data_escrow.finalized ? "dark" : "warning"}
                                            variant={
                                                val.data_escrow.disputed ? 'danger' : 'dark' ||
                                                    val.data_sign.signedOwner == 'RELEASE' ? "warning" : "dark" ||
                                                        val.data_escrow.finalized ? 'warning' : 'dark'
                                            }
                                            disabled={status() == 'PROCESS'}
                                            onClick={async () => {
                                                let agentRelease = await escrow_releaseAgent(val._referenceId)
                                                await agentRelease.wait(1)
                                                myTransactions()
                                                getBalanceCollection()
                                            }}>{"Release"}
                                        </Button>
                                    </Card>
                                </Col>
                                <Col md={3}>
                                    <Card style={{
                                        fontSize: 10,
                                    }}>
                                        <Button
                                            // variant={!val.data_escrow.finalized ? "dark" : "warning"}
                                            variant={
                                                val.data_escrow.disputed ? 'danger' : 'dark' ||
                                                    val.data_sign.signedOwner == 'RELEASE' ? "warning" : "dark" ||
                                                        val.data_escrow.finalized ? 'warning' : 'dark'
                                            }
                                            disabled={status() == 'PROCESS'}
                                            onClick={async () => {
                                                let agentreverse = await escrow_reverseAgent(val._referenceId)
                                                await agentreverse.wait(1)
                                                myTransactions()
                                                getBalanceCollection()
                                            }}>{"Reverse"}</Button>
                                    </Card>
                                </Col>
                            </Row>
                            <div className='mt-2' />
                        </div>
                        )
                    })}
                </Card.Body>
            )
        }
    }
    const sentInitTransaction = async () => {
        let refId = 'refId_' + new Date().getTime()

        if (_receiverAddress != '' && isAddress(_receiverAddress) && _agentAddress != '' && isAddress(_agentAddress) && _sendValueEther != 0) {
            const options = { value: ethers.utils.parseEther(_sendValueEther) }
            let sendInit = await Escrow.init(refId, _receiverAddress, _agentAddress, options)
            await sendInit.wait(1)
            callProvider()
            connectWalletHandler()
            set_sendValueEther(0)
            set_receiverAddress('')
            set_agentAddress('')
            myTransactions()
            getBalanceCollection()
        }

    }
    const onSenderView = () => {
        if (isObj(myTransaction) && myTransaction.senderId.length > 0) {
            return (
                <Row>
                    <Col md={12}>
                        <Card style={{
                            fontSize: 10,
                        }}>
                            <Card.Body>
                                On Sender
                                <div className='mt-5' />
                                {myTransaction.senderId.map((val, idx) => {
                                    return (<div key={idx} >
                                        <Row>
                                            <Col md={6}>
                                                <Card style={{
                                                    fontSize: 10,
                                                    textAlign: 'left',
                                                    padding: 10
                                                }}>
                                                    {'Agent '}  <div style={{ color: 'green', fontWeight: 'bold', fontSize: 11 }}>{val._agent} </div>
                                                    {'Receiver'} <div style={{ color: 'green', fontWeight: 'bold', fontSize: 11 }}>{val._receiver} </div>
                                                    <div style={{ color: 'green', fontWeight: 'bold', fontSize: 11 }}>{val._referenceId}{' | '}{val.data_escrow.fund / 10 ** 18}{' eth '}{val.data_sign.signedOwner != '' ? val.data_sign.signedOwner == 'RELEASE' ? 'with status RELASE' : 'with status REVERT' : []} </div> <br />
                                                </Card>
                                            </Col>
                                            <Col md={2}>
                                                <Card style={{
                                                    fontSize: 10,
                                                }}>
                                                    <Button variant={!val.data_escrow.finalized ? "success" : "warning"} disabled={val.data_escrow.finalized || val.data_sign.signedOwner == "RELEASE"} onClick={async () => {
                                                        let resRelease = await escrow_releaseOwner(val._referenceId)
                                                        await resRelease.wait(1)
                                                        myTransactions()
                                                        getBalanceCollection()
                                                    }}>{"Release"}</Button>
                                                </Card>
                                            </Col>
                                            <Col md={2}>
                                                <Card style={{
                                                    fontSize: 10,
                                                }}>
                                                    <Button variant={!val.data_escrow.disputed ? "success" : "warning"} disabled={val.data_escrow.disputed || val.data_sign.signedOwner == "RELEASE"} onClick={async () => {
                                                        let senderDispute = await escrow_Disputed(val._referenceId)
                                                        await senderDispute.wait(1)
                                                        myTransactions()
                                                        getBalanceCollection()
                                                    }}>{"Dispute"}</Button>
                                                </Card>
                                            </Col>
                                            <Col md={2}>
                                                <Card style={{
                                                    fontSize: 10,
                                                }}>
                                                    <Button variant={!val.data_escrow.disputed ? "success" : "warning"} disabled={!val.data_escrow.finalized || val.data_sign.signedOwner == "RELEASE"} onClick={async () => {
                                                        let senderWithdraw = await escrow_Withdraw(val._referenceId)
                                                        await senderWithdraw.wait(1)
                                                        myTransactions()
                                                        getBalanceCollection()
                                                    }}>{"Withdraw"}</Button>
                                                </Card>
                                            </Col>
                                            <div className='mt-2' />
                                        </Row>
                                    </div>
                                    )
                                })}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )
        }
    }
    const onReceiverViews = () => {
        if (isObj(myTransaction) && myTransaction.receiverId.length > 0) {
            return (
                <Row>
                    <Col md={12}>
                        <Card style={{
                            fontSize: 10,
                        }}>
                            <Card.Body>
                                On Receiver
                                <div className='mt-5' />
                                {myTransaction.receiverId.map((val, idx) => {
                                    return (<div key={idx} >
                                        <Row>
                                            <Col md={6}>
                                                <Card style={{
                                                    fontSize: 10,
                                                    textAlign: 'left',
                                                    padding: 10,
                                                }}>
                                                    {/* Sender {val._sender} <br />
                                        Receiver {val._receiver}<br />
                                        {val.data_escrow.fund / 10 ** 18} eth */}
                                                    {'Agent '}  <div style={{ color: 'green', fontWeight: 'bold', fontSize: 11 }}>{val._agent} </div>
                                                    {'Receiver'} <div style={{ color: 'green', fontWeight: 'bold', fontSize: 11 }}>{val._sender} </div>
                                                    <div style={{ color: 'green', fontWeight: 'bold', fontSize: 11 }}>{val._referenceId}{' | '}{val.data_escrow.fund / 10 ** 18}{' eth '}{val.data_sign.signedOwner != '' ? val.data_sign.signedOwner == 'RELEASE' ? 'with status RELASE' : 'with status REVERT' : []} </div> <br />
                                                </Card>
                                            </Col>
                                            <Col md={2}>
                                                <Card style={{
                                                    fontSize: 10,
                                                }}>
                                                    <Button
                                                        variant={!val.data_escrow.finalized ? "dark" : "warning"}
                                                        disabled={
                                                            val.data_escrow.finalized ||
                                                            !val.data_escrow.disputed
                                                        }
                                                        onClick={async () => {
                                                            let resreveRec = await escrow_reverseReceiver(val._referenceId)
                                                            await resreveRec.wait(1)
                                                            myTransactions()
                                                            getBalanceCollection()
                                                        }}>{"Reverse"}
                                                    </Button>
                                                </Card>
                                            </Col>
                                            <Col md={2}>
                                                <Card style={{
                                                    fontSize: 10,
                                                }}>
                                                    <Button
                                                        variant={!val.data_escrow.finalized ? "dark" : "warning"}
                                                        disabled={
                                                            val.data_escrow.finalized ||
                                                            val.data_escrow.disputed
                                                        }
                                                        onClick={async () => {
                                                            let resDipute = await escrow_Disputed(val._referenceId)
                                                            await resDipute.wait(1)
                                                            myTransactions()
                                                            getBalanceCollection()
                                                        }}>{"Dispute"}
                                                    </Button>
                                                </Card>
                                            </Col>
                                            <Col md={2}>
                                                <Card style={{
                                                    fontSize: 10,
                                                }}>
                                                    <Button
                                                        variant={val.data_escrow.finalized ? "dark" : "warning"}
                                                        disabled={
                                                            !val.data_escrow.finalized ||
                                                            val.data_sign.signedOwner == '' ||
                                                            !val.data_sign.signedOwner == 'RELEASE' ||
                                                            val.data_sign.signedOwner == 'REVERT' ||

                                                            val.data_sign.signedAgent == '' ||
                                                            !val.data_sign.signedAgent == 'RELEASE' ||
                                                            val.data_sign.signedAgent == 'REVERT'
                                                        }
                                                        onClick={async () => {
                                                            let resWithdra = await escrow_Withdraw(val._referenceId)
                                                            await resWithdra.wait(1)
                                                            myTransactions()
                                                            getBalanceCollection()
                                                        }}>{"Withdraw"}</Button>
                                                </Card>
                                            </Col>
                                        </Row>
                                        <div className='mt-2' />
                                    </div>
                                    )
                                })}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )
        }
    }
    const sendtoEscrow = () => {
        return (
            <Row>
                <Col md={12}>
                    <Card style={{
                        fontSize: 10,
                    }}>
                        <Form style={{ padding: 10, }}>
                            Escrow
                            {/* {'Selected Agent Address'} */}
                            <div className='mt-2' />
                            <Form.Select aria-label="Default select example" onChange={(res) => {
                                let AddresChange = res.target.value
                                if (AddresChange != '') {
                                    set_agentAddress(AddresChange)
                                } else {
                                    set_agentAddress('')
                                }
                            }}>
                                <option value={''}>Selected agent address</option>
                                {AgentAddress.map((res, key) => {
                                    if (res.isAgent) {
                                        return <option key={key} value={res.agentAddress}>{res.agentAddress}</option>
                                        // return res.agentAddress + '\n'
                                    }
                                })}
                            </Form.Select>
                            <div className='mt-2' />

                            <Form.Select aria-label="Default select example" onChange={(res) => {
                                let AddresSampleChange = res.target.value
                                if (AddresSampleChange != '') {
                                    set_receiverAddress(AddresSampleChange)
                                } else {
                                    set_receiverAddress('')
                                }
                            }}>
                                <option value={''}>{'Address receiver => send eth to'} </option>
                                {accountSampleList.map((res, key) => {
                                    if (res != defaultAccount) {
                                        return <option key={key} value={res}>{res}</option>
                                        // return res.agentAddress + '\n'
                                    }
                                })}
                            </Form.Select>
                            <div className='mt-2' />

                            <Form.Control
                                placeholder={'ether'}
                                type="number"
                                id="valueether"
                                value={_sendValueEther}
                                onChange={(res) => {
                                    if (res.target.value != "") {
                                        set_sendValueEther(res.target.value)
                                    } else {
                                        set_sendValueEther('')
                                    }
                                }}
                            />
                            <div className='mt-3' />
                            <Button variant="primary" type="submit" onClick={sentInitTransaction}>
                                Submit
                            </Button>
                        </Form>
                    </Card>
                </Col>
            </Row>
        )
    }

    const AdminView = () => {
        if (accountStatus == 'Admin') {
            return (
                <Row>

                    <Col sm={12}>
                        <Card.Body>
                            {'input agent address'}
                            <br /><br />
                            <input
                                name="eth supply"
                                type="text"
                                value={addAgentAddress}
                                onChange={(res) => {
                                    if (res.target.value === "" || Number(res.target.value) === 0) {
                                        setaddAgentAddress('')
                                    } else {
                                        setaddAgentAddress(res.target.value)
                                    }
                                }} />
                            <br />	<br />
                            <Button variant="dark" disabled={disablebuttonaddAgent} onClick={addAgent}>{"add Agent"}</Button>
                            <br /><br />
                        </Card.Body>
                    </Col>
                </Row>
            )
        }
    }
    const AgentView = () => {
        if (accountStatus == 'Agent') {
            return (
                <Card.Body>
                    {onAgentView()}
                </Card.Body>
            )
        }
    }
    const ClientView = () => {
        if (accountStatus == 'Client') {
            return (
                <>
                    <Card.Body>
                        {onSenderView()}
                        <div className='mt-5' />
                        {onReceiverViews()}
                        <div className='mt-5' />
                        {sendtoEscrow()}
                    </Card.Body>
                </>
            )
        }

    }

    return (
        <>
            <br />
            <Container>
                <Card body>
                    {errorMessage ? errorMessage : []}
                    {AdminView()}
                    {AgentView()}
                    {ClientView()}
                </Card>
                <br /><br />
            </Container>
        </>
    )
}

export default Escrow;



