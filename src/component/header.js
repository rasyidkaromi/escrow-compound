/* eslint-disable */
/* eslint-disable-next-line */

import React, { useState, useContext } from 'react'
import { Container, Row, Col, Button, Card, Navbar, Nav } from 'react-bootstrap'
import { EtherContext } from '../context/etherscontext'
import '../style.css'


const Header = () => {
    const {
        defaultAccount,
        userBalance,
        connectWalletHandler,
        CEtherBalance, CEthertotalSupply,
        escrowBalanceOfCether, escrowBalanceOUnderlyingfCether,
        OwnerAddress, AgentAddress, accountStatus, EscrowBalance,
    } = useContext(EtherContext)

    const [connButtonText, setConnButtonText] = useState('Connect Wallet')


    return (
        <>
            <Navbar bg="light" expand="lg" className="sticky-nav">
                <Container>
                    <Navbar.Brand href="#">{"ESCROW "} {accountStatus != 'Loading' ? accountStatus : []}</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    {defaultAccount ? <Navbar.Collapse className="justify-content-end">
                    {defaultAccount} | {Number(userBalance).toFixed(6)}
                    </Navbar.Collapse> : []}
                    {!defaultAccount ? (
                        <Navbar.Collapse className="justify-content-end">
                            <Button className="justify-content-end" onClick={connectWalletHandler}>{connButtonText}</Button>
                        </Navbar.Collapse>) : []}

                </Container>
            </Navbar>
            <Navbar bg="light" expand="lg" className="sticky-nav">
                <Container style={{ display: "block" }}>
                    <Card body >
                        <Row>
                            <Col md={3}>
                                <Card style={{
                                    fontSize: 10,
                                }}>
                                    <Card.Body>
                                        Total Eth CETH
                                        <br />
                                        {CEtherBalance}
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card style={{
                                    fontSize: 10,
                                }}>
                                    <Card.Body>
                                        Total Supply CETH
                                        <br />
                                        {CEthertotalSupply / (10 ** 8)}
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card style={{
                                    fontSize: 10,
                                }}>
                                    <Card.Body>
                                        Escrow Ether on CETH Underlying
                                        <br />
                                        {escrowBalanceOUnderlyingfCether}
                                        <br/>
                                        Escrow CETH Supply
                                        <br />
                                        {escrowBalanceOfCether / (10 ** 8)}
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card style={{
                                    fontSize: 10,
                                }}>
                                    <Card.Body>
                                        Escrow Total Balanced
                                        <br />
                                        {EscrowBalance}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                        <br/>
                        <Row>
                            <Col md={6}>
                                <Card style={{
                                    fontSize: 10,
                                }}>
                                    <Card.Body>
                                        Owner Address
                                        <br />
                                        {OwnerAddress}
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <Card style={{
                                    fontSize: 10,
                                }}>
                                    <Card.Body>
                                        Agent Address
                                        <br />
                                        {AgentAddress.map((res) => {
                                            if (res.isAgent) {
                                                return (
                                                    <div>{ res.agentAddress + '\n'}</div>
                                                )
                                            }
                                        })}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Card>
                </Container>
            </Navbar>

        </>
    )
}

export default Header

