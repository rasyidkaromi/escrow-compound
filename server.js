const express = require("express")
const socketIO = require("socket.io")
const http = require('http')
const cors = require("cors")
const ethers = require("ethers")

let jsoning = require('jsoning');
let db = new jsoning("./db/serverdb.json")

const { utils } = ethers;
const { formatEther } = utils;

const app = express();
const port = 4000;

const server = http.createServer(app);

app.use(cors());
app.use(express.json());
const EscrowCompoundContract = '0xab16A69A5a8c12C732e0DEFF4BE56A70bb64c926'
const ContractEscrow = new ethers.Contract(
    EscrowCompoundContract,
    require("./src/abi/LFGlobalEscrow.json").abi,
    new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/")
);

// ContractEscrow =======================================================================================
ContractEscrow.on('Initiated', (referenceId, payer, amount, payee, trustedParty, lastBlock) => {
    setDbInit(referenceId, payer, amount, payee, trustedParty, lastBlock)
})
ContractEscrow.on('getAgentLists', (AgentList) => {
    setAgentList(AgentList)
})
setInterval(() => {
    ContractEscrow.getRefID().then(res => {
        setRefId(res)
    })
}, 10000)

const io = socketIO(server, { cors: { origin: '*', } });

io.on("connection", (socket) => {
    console.log("New client connected")


    socket.emit('serverUpdate', 'from server')

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    })


    socket.on('listreferenceId', async (data, cb) => {
        try {
            const balance = await provider.getBalance(data.accountMetamask)
            cb({
                balance: formatEther(balance),
            })
        } catch (error) {
            return
        }

    })

    socket.on('myTransactions', async (address, cb) => {
        let resrfid = await ContractEscrow.getRefID()
        await setRefId(resrfid)
        let res = await db.get('refID')
        let senderId = []
        let receiverId = []
        let refIdx = 0
        res.forEach(async (val) => {
            if (val[1].toUpperCase() == address.toUpperCase()) {
                let resSignSender = await ContractEscrow.getEscrowSignbyRef(val[0])
                let refid = {
                    _referenceId: val[0],
                    _sender: val[1],
                    _receiver: val[2],
                    _agent: val[3],
                    data_escrow: {
                        referenceId: resSignSender[0][0],
                        owner: resSignSender[0][1],
                        sender: resSignSender[0][2],
                        receiver: resSignSender[0][3],
                        agent: resSignSender[0][4],
                        fund: resSignSender[0][5].toString(),
                        disputed: resSignSender[0][6],
                        finalized: resSignSender[0][7],
                        lastTxBlock: resSignSender[0][8].toString(),
                    },
                    data_sign: {
                        referenceId: resSignSender[1][0],
                        signerOwner: resSignSender[1][1],
                        signerReceiver: resSignSender[1][2],
                        signerAgent: resSignSender[1][3],
                        signedOwner: resSignSender[1][4],
                        signedReceiver: resSignSender[1][5],
                        signedAgent: resSignSender[1][6],
                        releaseCount: resSignSender[1][7].toString(),
                        revertCount: resSignSender[1][8].toString(),
                    }
                }
                senderId.push(refid)
            }
            if (val[2].toUpperCase() == address.toUpperCase()) {
                let resSignReceiver = await ContractEscrow.getEscrowSignbyRef(val[0])
                let refid = {
                    _referenceId: val[0],
                    _sender: val[1],
                    _receiver: val[2],
                    _agent: val[3],
                    data_escrow: {
                        referenceId: resSignReceiver[0][0],
                        owner: resSignReceiver[0][1],
                        sender: resSignReceiver[0][2],
                        receiver: resSignReceiver[0][3],
                        agent: resSignReceiver[0][4],
                        fund: resSignReceiver[0][5].toString(),
                        disputed: resSignReceiver[0][6],
                        finalized: resSignReceiver[0][7],
                        lastTxBlock: resSignReceiver[0][8].toString(),
                    },
                    data_sign: {
                        referenceId: resSignReceiver[1][0],
                        signerOwner: resSignReceiver[1][1],
                        signerReceiver: resSignReceiver[1][2],
                        signerAgent: resSignReceiver[1][3],
                        signedOwner: resSignReceiver[1][4],
                        signedReceiver: resSignReceiver[1][5],
                        signedAgent: resSignReceiver[1][6],
                        releaseCount: resSignReceiver[1][7].toString(),
                        revertCount: resSignReceiver[1][8].toString(),
                    }
                }
                receiverId.push(refid)
            }
            refIdx = refIdx + 1
            if (refIdx == res.length) {
                cb({ senderId, receiverId })
            }
        })
    })
    socket.on('agentAction', async (address, cb) => {
        let res = await db.get('refID')
        let agentId = []
        let refIdx = 0
        res.forEach(async (val) => {
            if (val[3].toUpperCase() == address.toUpperCase()) {
                let resSignSender = await ContractEscrow.getEscrowSignbyRef(val[0])
                let refid = {
                    _referenceId: val[0],
                    _sender: val[1],
                    _receiver: val[2],
                    _agent: val[3],
                    data_escrow: {
                        referenceId: resSignSender[0][0],
                        owner: resSignSender[0][1],
                        sender: resSignSender[0][2],
                        receiver: resSignSender[0][3],
                        agent: resSignSender[0][4],
                        fund: resSignSender[0][5].toString(),
                        disputed: resSignSender[0][6],
                        finalized: resSignSender[0][7],
                        lastTxBlock: resSignSender[0][8].toString(),
                    },
                    data_sign: {
                        referenceId: resSignSender[1][0],
                        signerOwner: resSignSender[1][1],
                        signerReceiver: resSignSender[1][2],
                        signerAgent: resSignSender[1][3],
                        signedOwner: resSignSender[1][4],
                        signedReceiver: resSignSender[1][5],
                        signedAgent: resSignSender[1][6],
                        releaseCount: resSignSender[1][7].toString(),
                        revertCount: resSignSender[1][8].toString(),
                    }
                }
                agentId.push(refid)
            }
            refIdx = refIdx + 1
            if (refIdx == res.length) {
                cb(agentId)
            }
        })
    })
});

server.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
});

const setDbInit = async (referenceId, payer, amount, payee, trustedParty, lastBlock) => {
    let isDb = await db.has(referenceId)
    if (!isDb) {
        await db.push(referenceId, JSON.stringify({
            referenceId: referenceId,
            payer: payer,
            amount: amount,
            payee: payee,
            trustedParty: trustedParty,
            lastBlock: lastBlock,
        }));
    }
}

const setAgentList = async (agentList) => {
    await db.set('agentList', JSON.stringify(agentList))
}

const setRefId = async (res) => {
    console.log('set RefId db')
    await db.set('refID', res)
}
