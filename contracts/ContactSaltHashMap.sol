// pragma experimental ABIEncoderV2;
pragma solidity ^0.5.0;

import "./Verifiers.sol";
import "./ECDSA.sol";
//import "./@openzeppelin/contracts/ownership/Ownable.sol";

contract ContactSaltHashMap {
    using ECDSA for bytes32;

    // store requests separately fron Entries
    struct Request {
        address payable[3] verifiers;
        mapping(address => Verifier) verifierMapping;
        uint time;
        uint feePaid;
        bool flaggedByVerifier;
    }

    struct Entry {
        address owner;
        address pointsTo;
        uint balance;
    }

    struct Verifier {
        bool assigned;
        bool strike;
        bool encryptedMessageSent;
        bool approved;
    }

    Verifiers verifiersInstance;
    mapping(bytes32 => Entry) public contactHashToEntry;
    mapping(address => Request) public requesterToRequest;

    uint public registrationFee = 20 finney;
    event LogInitiateRequest(address sender, address indexed verifier1, address indexed verifier2, address indexed verifier3);
    event LogEncryptedData(address indexed sender, address indexed verifier, bytes encryptedData);

    // verify that below event are needed
    event LogAddNumberToRegistry(address indexed sender, bytes32  indexed _contactHash, address _pointsTo);
    event LogUpdateEntryPointer(address indexed sender, bytes32  indexed _contactHash, address indexed _newAddress);
    event LogUpdateEntryOwner(address indexed sender, bytes32  indexed _contactHash, address indexed _newAddress);
    event LogSend(bytes32  indexed toContact, address indexed to, address indexed from, uint amount);
    event LogWithdrawal(address indexed withdrawer, uint amount);
    event LogMarkRequestInvalid(address indexed verifier, address requester);

    event LogVerifySignature(address indexed verifier, address indexed sender);

     function setVerifiersAddress(address _address)
        public
    {
        require(address(verifiersInstance) == address(0), "This can only be set once");
        verifiersInstance = Verifiers(_address);
    }

    // a user calls this function when the want to register contact info
    // the requester object is assigned three pseudorandom verifiers
    // the user will encrypt their request using the verifiers public key and call the submitAllEncryptedData() function
    function initiateRequest()
        public
        payable
    {
        require(requesterToRequest[msg.sender].time + 24 hours < now,
            "a new request to init contact info must be at least 24 hours later");
        address payable[3] memory verifiers = verifiersInstance.getPseudoRandomVerifiers();
        requesterToRequest[msg.sender].verifierMapping[verifiers[0]].assigned = true;
        requesterToRequest[msg.sender].verifierMapping[verifiers[1]].assigned = true;
        requesterToRequest[msg.sender].verifierMapping[verifiers[2]].assigned = true;

        Request memory aRequest = requesterToRequest[msg.sender];
        uint feeDue = registrationFee - aRequest.feePaid;
        if (feeDue > 0){ // fee is already set if the contactInfo has already been sent money
            require(msg.value >= feeDue, "You need to pay at least 0.02 ETH");
            aRequest.feePaid += feeDue;
        }
        aRequest.verifiers = verifiers;
        aRequest.time = now;
        requesterToRequest[msg.sender] = aRequest;
        msg.sender.transfer(msg.value - feeDue); // return any extra funds sent

        emit LogInitiateRequest(msg.sender, verifiers[0], verifiers[1], verifiers[2]);
    }

    // this function is called 3 times (once for each verifier)
    // each time, the verifier and the encryptedData is unique
    // verifiers watch for this event, to know when to derypt the contact info and send verification message
    function submitEncryptedContactInfo(address verifier, bytes memory encryptedData)
        public
    {
        requesterToRequest[msg.sender].verifierMapping[verifier].encryptedMessageSent = true;
        emit LogEncryptedData(msg.sender, verifier, encryptedData);
    }

    // UX improvement function, so the user only has to sign one tx to submit all encrypted data
    function submitAllEncryptedData(
        address verifier1,
        bytes memory encryptedData1,
        address verifier2,
        bytes memory encryptedData2,
        address verifier3,
        bytes memory encryptedData3)
            public
    {
        submitEncryptedContactInfo(verifier1, encryptedData1);
        submitEncryptedContactInfo(verifier2, encryptedData2);
        submitEncryptedContactInfo(verifier3, encryptedData3);
    }

    // verifier will sign  keccack256(contactInfo + salt)
    function checkAndLogSignedMessage(bytes32 messageHash, bytes memory signature)
        public
    {
        address verifier = messageHash.recover(signature);
        requesterToRequest[msg.sender].verifierMapping[verifier].approved = true;
        emit LogVerifySignature(verifier, msg.sender);
    }

    function checkAndLogAllSignedMessages(bytes32 _contactInfoSaltHash,
        bytes memory signature1,
        bytes memory signature2,
        bytes memory signature3,
        address pointsTo)
        public
    {
        bytes32 messageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _contactInfoSaltHash));
        checkAndLogSignedMessage(messageHash, signature1);
        checkAndLogSignedMessage(messageHash, signature2);
        checkAndLogSignedMessage(messageHash, signature3);

        for(uint i = 0; i < 3; i++){
            address payable v = requesterToRequest[msg.sender].verifiers[i];
            require(requesterToRequest[msg.sender].verifierMapping[v].approved == true, "all verifier signatures must be approved");
            v.transfer(requesterToRequest[msg.sender].feePaid / 3);
        }

        addInfoToRegistry(_contactInfoSaltHash, pointsTo);
    }

    function addInfoToRegistry(bytes32 _contactInfoSaltHash, address _pointsTo)
        internal
    {
        contactHashToEntry[_contactInfoSaltHash].pointsTo = _pointsTo;
        contactHashToEntry[_contactInfoSaltHash].owner = msg.sender;
        emit LogAddNumberToRegistry(msg.sender, _contactInfoSaltHash, _pointsTo);
    }

    /*

        Dispute Functions

    */

    function addStrike(address _verifier)
        public
    {
        require(requesterToRequest[msg.sender].verifierMapping[_verifier].encryptedMessageSent == true, "requester must have sent encrypted message");
        requesterToRequest[msg.sender].verifierMapping[_verifier].strike = true;
    }

    // a verifier calls this function if there is bad contact info
    // this must be called before the requester reports the verifier as providing bad info
    //
    function markRequestInvalid(address _requester)
        public
    {
        require(requesterToRequest[_requester].verifierMapping[msg.sender].assigned == true, "Must be a verifier for this request");
        require(requesterToRequest[_requester].verifierMapping[msg.sender].encryptedMessageSent == true, "requester must have sent encrypted message");
        require(requesterToRequest[_requester].verifierMapping[msg.sender].strike == false, "requester must not have striked verifier");
        require(requesterToRequest[_requester].verifierMapping[msg.sender].approved == false, "request must not be approved");
        requesterToRequest[_requester].feePaid = 0;
        requesterToRequest[_requester].flaggedByVerifier = true;
        emit LogMarkRequestInvalid(msg.sender, _requester);
    }

    /*

        Update Functions

    */

    // updates the address that the Entry points to
    // can only be changed by the Entry owner
    function updateEntryPointer(bytes32 _contactHash, address _newPointer)
        public
        payable
    {
        require(contactHashToEntry[_contactHash].owner == msg.sender, "Only the current address can update");
        contactHashToEntry[_contactHash].pointsTo = _newPointer;
        emit LogUpdateEntryPointer(msg.sender, _contactHash, _newPointer);
    }

    // updates the address that owns the Entry
    // can only be updated by the Entry owner
    function updateEntryOwner(bytes32 _contactHash, address _newOwner)
        public
        payable
    {
        require(contactHashToEntry[_contactHash].owner == msg.sender, "Only the current address can update");
        contactHashToEntry[_contactHash].owner = _newOwner;
        emit LogUpdateEntryOwner(msg.sender, _contactHash, _newOwner);
    }

    /*

        Payment Functions

    */

    // money goes to the account associated with the _contactHash
    // if the account cannot be found, there needs to be a mechanism to notify the recipient that they have received funds
    // sender of money will send a private key with a small balance on it to pay registration fees (off chain)
    // msg.value should be a smaller amount than than the money sender inputs into the app
    //  - the difference goes to a new account, for which the recipient gets the private key
    function sendTo(bytes32 _contactHash)
        public
        payable
    {
        address to = contactHashToEntry[_contactHash].pointsTo;
        if(to == address(0)){
            contactHashToEntry[_contactHash].balance = msg.value;
        }
        else {  // should this else block be removed?
            (bool success, ) = to.delegatecall(msg.data);
            require(success, "Transfer failed");
        }
        emit LogSend(_contactHash, to, msg.sender, msg.value);
    }

    // Withdraw funds to specific address
    function withdraw(bytes32 _contactHash, address payable _to)
        public
    {
        require(contactHashToEntry[_contactHash].owner == msg.sender, "Only the registered address can withdraw");
        emit LogWithdrawal(msg.sender, contactHashToEntry[_contactHash].balance);
        _to.transfer(contactHashToEntry[_contactHash].balance);
        contactHashToEntry[_contactHash].balance = 0;
    }

}