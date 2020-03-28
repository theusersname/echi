pragma solidity ^0.5.0;

import "./ContactSaltHashMap.sol";

contract Verifiers {

    ContactSaltHashMap public contactHashInstance;

    struct VerifierData {
        uint index;
        uint deposit;
        uint strikes;
        bytes publicKey;
    }

    uint public verifierDeposit = 100 finney;
    uint public count = 0;
    uint public strikeOutCount = 3;

    address payable[] public verifiers;
    mapping(address => VerifierData) public verifierInfo;

    event LogAddVerifier(address indexed _newVerifier, uint deposit);
    event LogStrikeVerifier(address indexed slasher, address indexed verifier, uint strikeCount);
    // event LogSelfRemoveVerifier(address indexed verifier, uint depositRedeemed);
    event LogRemoveVerifier(address verifier, uint depositLost);

    constructor(address contactHashAddress)
        public
    {
        contactHashInstance = ContactSaltHashMap(contactHashAddress);
    }

    function addVerifier(bytes memory _publicKey)
        public
        payable
    {
        require(publicKeyToAddress(_publicKey) == bytes20(msg.sender), "public key must match msg.sender");
        require(msg.value >= verifierDeposit, "Verifier deposit must be greater than 0.1 ETH");
        verifiers.push(msg.sender);
        verifierInfo[msg.sender] = VerifierData(count, verifierDeposit, 0, _publicKey);
        count++;
        if(msg.value > verifierDeposit) msg.sender.transfer(msg.value - verifierDeposit);
        emit LogAddVerifier(msg.sender, msg.value);
    }

    // call this function if the verifier does not text you or send invalid signatures
    // this costs the registrant more gas, so they should not call this method unless necessary
    function strikeVerifier(address _verifier)
        public
    {
        (uint time, ,bool flagged) = contactHashInstance.requesterToRequest(msg.sender);
        require(time + 10 minutes >= now, "Cannot slash until 10 minutes from your init request");
        require(flagged == false, "requester cannot strike an invalid request");

        verifierInfo[_verifier].strikes++;
        if(verifierInfo[_verifier].strikes == strikeOutCount){
            removeVerifier(_verifier);
        }

        bytes memory addStrikePayload = abi.encodeWithSignature("addStrike(address)", _verifier);
        (bool success1, ) = address(contactHashInstance).delegatecall(addStrikePayload);
        require(success1, "addStrike() delegate call not successful");

        // restart initRegistration if signatures are bad
        bytes memory payload = abi.encodeWithSignature("initiateRequest()");
        (bool success2, ) = address(contactHashInstance).delegatecall(payload);
        require(success2, "delegate call not successful");

        emit LogStrikeVerifier(msg.sender, _verifier, verifierInfo[_verifier].strikes);
    }

    // replace the verifier that is being removed with the last verifier, to keep the array clean of empty addresses
    function removeVerifier(address verifier)
        internal
    {
        uint index = verifierInfo[verifier].index;
        address payable updatedAddress = verifiers[verifiers.length--];
        verifiers.pop();
        verifiers[index] = updatedAddress;
        verifierInfo[verifier].index = 0;
        verifierInfo[verifier].deposit = 0;
        verifierInfo[verifier].strikes = 0;
        verifierInfo[verifier].publicKey = new bytes(0);
        verifierInfo[updatedAddress].index = index;
        emit LogRemoveVerifier(verifier, verifierInfo[verifier].deposit);
    }

    // Should verifiers be able to remove themselves?
    // function selfRemoveVerifier()
    //     public
    // {
    //     uint deposit = verifierInfo[msg.sender].deposit;
    //     msg.sender.transfer(deposit);
    //     delete verifiers[verifierInfo[msg.sender].index];
    //     verifierInfo[msg.sender] = VerifierData(0, 0);
    //     emit LogSelfRemoveVerifier(msg.sender, deposit);
    // }

    // gets pseudo random verifier from the verifiers array
    // takes some entropy to randomly-ish pick the verifier
    // the verifier selected must be different from the others already picked
    function getPseudoRandomVerifier(uint32 _entropy, address _must_be_different, address _must_be_different_1)
        public
        view
        returns (address payable)
    {
        uint index = _entropy % verifiers.length;
        if(verifiers[index] == _must_be_different || verifiers[index] == _must_be_different_1) {
            getPseudoRandomVerifier(toUint32(abi.encodePacked(keccak256(abi.encodePacked(_entropy))), 0), _must_be_different, _must_be_different_1);
        }
        return verifiers[index];
    }

    function getPseudoRandomVerifiers() public view returns (address payable[3] memory _verifiers) {
        bytes memory bh = abi.encodePacked(blockhash(block.number));
        _verifiers[0] = getPseudoRandomVerifier(toUint32(bh, 0), address(0), address(0));
        _verifiers[1] = getPseudoRandomVerifier(toUint32(hashAndEncode(hashAndEncode(bh)), 0), _verifiers[0], address(0));
        _verifiers[2] = getPseudoRandomVerifier(toUint32(hashAndEncode(bh), 0), _verifiers[0], _verifiers[1]);
    }

    /*

        Helper functions

    */

    function hashAndEncode(bytes memory _bytes)
        internal
        pure
        returns(bytes memory)
    {
        return abi.encodePacked(keccak256(_bytes));
    }

    // calculates address of a public key
    function publicKeyToAddress(bytes memory publicKey) public pure returns (bytes20) {
        require (publicKey.length == 64);
        return bytes20 (uint160 (uint256 (keccak256 (publicKey))));
    }

    // from: https://github.com/GNSPS/solidity-bytes-utils/blob/master/contracts/BytesLib.sol
    // bytes to uint
    function toUint32(bytes memory _bytes, uint _start) internal pure returns (uint32) {
        require(_bytes.length >= (_start + 4));
        uint32 tempUint;
        assembly {
            tempUint := mload(add(add(_bytes, 0x4), _start))
        }
        return tempUint;
    }

}
