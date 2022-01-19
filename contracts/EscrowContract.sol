// SPDX-License-Identifier: MIT

pragma solidity 0.8.11;


abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }
    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

abstract contract Ownable is Context {
    address private _owner;
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    constructor() {
        _transferOwnership(_msgSender());
    }
    function owner() public view virtual returns (address) {
        return _owner;
    }
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

interface CEth {
    function mint() external payable;
    function exchangeRateCurrent() external returns (uint256);
    function supplyRatePerBlock() external returns (uint256);
    function redeem(uint) external returns (uint);
    function redeemUnderlying(uint) external returns (uint);
    function balanceOfUnderlying(address) external returns (uint);
}

contract EscrowCompound is Ownable {

    event Initiated(string referenceId, address payer, uint256 amount, address payee, address trustedParty, uint256 lastBlock);
    event Signature(string referenceId, address signer, string signedOwner, string signedAgent, uint256 lastBlock);
    event Finalized(string referenceId, address winner, uint256 lastBlock);
    event Disputed(string referenceId, address disputer, uint256 lastBlock);
    event Withdrawn(string referenceId, address payee, uint256 amount, uint256 lastBlock);

    event getAgentLists(AgentList[] agentList);

    CEth cEth;
    struct Record {
        string referenceId;
        address payable owner;
        address payable sender;
        address payable receiver;
        address payable agent;
        uint256 fund;
        bool disputed;
        bool finalized;
        uint256 lastTxBlock;
    }
    mapping(string => Record) public _escrow;

    struct Sign {
        string referenceId;
        bool signerOwner;
        bool signerReceiver;
        bool signerAgent;
        string signedOwner;
        string signedReceiver;
        string signedAgent;
        uint256 releaseCount;
        uint256 revertCount;
    }
    mapping(string => Sign) public _sign;

    struct AgentList {
        address agentAddress;
        bool isAgent;
    }
    
    AgentList[] public agentList;

    struct RefRecord {
        string _referenceId;
        address _sender;
        address _receiver;
        address _agent;
    }
    RefRecord[] public refID;
    RefRecord[] private bufrefID;

    function getEscrowSignbyRef(string memory ref) public view  returns (Record memory, Sign memory){
        return (_escrow[ref], _sign[ref]);
    }

    function getRefID() public view  returns (RefRecord[] memory){
        return refID;
    }

    function addSingleAgent(address newAgent) public {
        require(_msgSender() != address(0), "Sender should not be null");
        require(_msgSender() == owner(), "Sender its not owner");
        for (uint i = 0; i < agentList.length; i ++) {
            require(agentList[i].agentAddress != newAgent, "agent address already added");
        }
        AgentList memory newAgentList;
        newAgentList.agentAddress = newAgent;
        newAgentList.isAgent    = true;
        agentList.push(newAgentList);
    }

    function addCEthAddress(address newCEth) public {
        require(_msgSender() != address(0), "Sender should not be null");
        require(_msgSender() == owner(), "Sender its not owner");
        cEth = CEth(newCEth);
    }

    function getAgentList() public view returns(AgentList[] memory) {
        return agentList;
    }

    function getAgentListEmit() public {
        emit getAgentLists(agentList);
    }

    function getCEthAddress() public view returns(address) {
        return address(cEth);
    }

    modifier multisigcheck(string memory _referenceId) {
        require(bytes(_referenceId).length != 0, "_referenceId should not have empty");
        _;

        Record storage e = _escrow[_referenceId];
        Sign memory s = _sign[_referenceId];
        if(s.releaseCount == 2) {
        transferOwner(e);
        }else if(s.revertCount == 2) {
        finalize(e);
        }else if(s.releaseCount == 1 && s.revertCount == 1) {
        dispute(e); 
        }
    }

    function init(string memory _referenceId, address payable _receiver, address payable _agent) public payable returns(bool) {
        require(_msgSender() != address(0), "Sender should not be null");
        require(_receiver != address(0), "Receiver should not be null");
        Record storage e = _escrow[_referenceId];
        e.referenceId = _referenceId;
        e.owner = payable(_msgSender());
        e.sender = payable(_msgSender());
        e.receiver = _receiver;
        e.agent = _agent;
        e.fund = msg.value;
        e.disputed = false;
        e.finalized = false;
        e.lastTxBlock = block.number;
        Sign storage s = _sign[_referenceId];
        s.referenceId = _referenceId;
        s.signerOwner = true;
        s.signerReceiver = true;
        s.signerAgent  = true;
        s.releaseCount = 0;
        s.revertCount = 0;
        RefRecord memory newRefID;
        newRefID._agent = _agent;
        newRefID._receiver = _receiver;
        newRefID._sender = _msgSender();
        newRefID._referenceId = _referenceId;
        refID.push(newRefID);
        cEth.mint{ value: msg.value, gas: 250000 }();
        emit Initiated(_referenceId, _msgSender(), msg.value, _receiver, _agent, 0);
        return true;
    }

    function releaseOwner(string memory _referenceId) public multisigcheck(_referenceId) returns(bool){
        require(!_escrow[_referenceId].finalized, "Escrow should not be finalized");
        require(_escrow[_referenceId].owner == _msgSender(), "msg sender should be as sender");
        require(_sign[_referenceId].signerOwner, "signer owner must be sign");

        Record memory e = _escrow[_referenceId];
        Sign storage s = _sign[_referenceId];
        s.signedOwner = "RELEASE";
        s.releaseCount++;
        emit Signature(_referenceId, _msgSender(), s.signedOwner, s.signedAgent,e.lastTxBlock); 
        return true;
    }
    function releaseAgent(string memory _referenceId) public multisigcheck(_referenceId) returns(bool){
        require(!_escrow[_referenceId].finalized, "Escrow should not be finalized");
        require(_escrow[_referenceId].agent == _msgSender(), "msg sender should be as agent");
        require(_sign[_referenceId].signerAgent, "signer agent must be sign");

        Record memory e = _escrow[_referenceId];
        Sign storage s = _sign[_referenceId];
        s.signedAgent = "RELEASE";
        s.releaseCount++;
        emit Signature(_referenceId, _msgSender(), s.signedOwner, s.signedAgent,e.lastTxBlock); 
        return true;
    }

    function reverseReceiver(string memory _referenceId) public multisigcheck(_referenceId) returns(bool){
        require(!_escrow[_referenceId].finalized, "Escrow should not be finalized");
        require(_escrow[_referenceId].receiver == _msgSender(), "msg sender should be as sender");
        require(_sign[_referenceId].signerOwner, "signer owner must be sign");

        Record memory e = _escrow[_referenceId];
        Sign storage s = _sign[_referenceId];
        s.signedReceiver = "REVERT";
        s.revertCount++;
        emit Signature(_referenceId, _msgSender(), s.signedOwner, s.signedAgent, e.lastTxBlock);
        return true;
    }
    function reverseAgent(string memory _referenceId) public multisigcheck(_referenceId) returns(bool){
        require(!_escrow[_referenceId].finalized, "Escrow should not be finalized");
        require(_escrow[_referenceId].agent == _msgSender(), "msg sender should be as agent");
        require(_sign[_referenceId].signerAgent, "signer agent must be sign");
        Record memory e = _escrow[_referenceId];
        Sign storage s = _sign[_referenceId];
        s.signedAgent = "REVERT";
        s.revertCount++;
        emit Signature(_referenceId, _msgSender(), s.signedOwner, s.signedAgent, e.lastTxBlock);
        return true;
    }

    function dispute(string memory _referenceId) public returns(bool) {
        Record storage e = _escrow[_referenceId];
        require(!e.finalized, "Escrow should not be finalized");
        require(_msgSender() == e.sender || _msgSender() == e.receiver, "Only sender or receiver can call dispute");
        dispute(e);
        return true;
    }
    
    function withdraw(string memory _referenceId) public returns(bool) {
        Record storage e = _escrow[_referenceId];
        require(e.finalized, "Escrow should be finalized before withdrawal");
        require(_msgSender() == e.owner, "only owner can withdrawfunds");
        require(e.fund <=  cEth.balanceOfUnderlying(address(this)));
        e.lastTxBlock = block.number;
        cEth.redeemUnderlying(e.fund);
        require((e.owner).send(e.fund));
        e.fund = 0;
        for(uint i=0; i < refID.length; i++){
            if(keccak256(bytes(refID[i]._referenceId)) != keccak256(bytes(_referenceId))){
                RefRecord memory newRefID;
                newRefID._agent = refID[i]._agent;
                newRefID._receiver = refID[i]._receiver;
                newRefID._sender = refID[i]._sender;
                newRefID._referenceId = refID[i]._referenceId;
                bufrefID.push(newRefID);
            }
        }
        delete refID;
        refID = bufrefID;
        delete bufrefID;
        emit Withdrawn(_referenceId, _msgSender(), e.fund, e.lastTxBlock);
        return true;
    }

    function transferOwner(Record storage e) internal {
        e.owner = e.receiver;
        finalize(e);
        e.lastTxBlock = block.number;
    }

    function dispute(Record storage e) internal {
        e.disputed = true;
        e.lastTxBlock = block.number;
        emit Disputed(e.referenceId, _msgSender(), e.lastTxBlock);
    }

    function finalize(Record storage e) internal {
        require(!e.finalized, "Escrow should not be finalized");
        e.finalized = true;
        emit Finalized(e.referenceId, e.owner, e.lastTxBlock);
    }



    receive() external payable {}
}