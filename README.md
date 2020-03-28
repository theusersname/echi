# Ethereum Contact Hashed Index + Escrow (CHIE)

```
 ______     __  __     __     ______    
/\  ___\   /\ \_\ \   /\ \   /\  ___\   
\ \ \____  \ \  __ \  \ \ \  \ \  __\   
 \ \_____\  \ \_\ \_\  \ \_\  \ \_____\ 
  \/_____/   \/_/\/_/   \/_/   \/_____/ 
                                                                                  
```

Phone number/email registry system for Ethereum addresses. This is meant to be supporting infrastructure for an easy to use, ethereum based "cash" transfer network. An ethereum wallet mobile app will connect to these smart contracts to provide an intuitive UI and quality UX.

Sending ETH through this contract to a phone number or email address (`sendTo(bytes32 _contactHash)`) will either route the transaction to the Ethereum account registered to the hash or hold the funds if the hash is not registered. The funds will be available to the phone number/email owner once they register an Ethereum account.

## Contracts

The system is two contracts.
[ContactSaltHashMap.sol](https://github.com/critesjosh/ethereum_phone_book/blob/master/contracts/ContactSaltHashMap.sol)
and [Verfiers.sol](https://github.com/critesjosh/ethereum_phone_book/blob/master/contracts/Verifiers.sol).

### Interfaces

#### ContactList.sol

```
contract ContactSaltHashMap {

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

    // Registration functions
    function initiateRequest() public payable;
    function submitEncryptedContactInfo(address verifier, bytes memory encryptedData) public;
    function submitAllEncryptedData(address verifier1,bytes memory encryptedData1, address verifier2, bytes memory encryptedData2, address verifier3, bytes memory encryptedData3) public;
    function checkAndLogSignedMessage(bytes32 messageHash, bytes memory signature) public;
    function checkAndLogAllSignedMessages(bytes32 _contactInfoSaltHash, bytes memory signature1, bytes memory signature2, bytes memory signature3, address pointsTo) public;

    // Dispute Functions
    function addStrike(address _verifier) public;
    function markRequestInvalid(address _requester) public;

    // Update functions
    function updateEntryPointer(bytes32 _contactHash, address _newPointer) public payable;
    function updateEntryOwner(bytes32 _contactHash, address _newOwner) public payable;

    // Payment functions
    function sendTo(bytes32 _contactHash) public payable;
    function withdraw(bytes32 _contactHash, address payable _to) public;
}
```

#### Verifiers.sol

```
contract Verifiers {

    struct VerifierData {
        uint index;
        uint deposit;
        uint strikes;
        bytes publicKey;
    }

    address[] public verifiers;
    mapping(address => VerifierData) public verifierInfo;

    function addVerifier() public payable;
    function strikeVerifier(string memory _contactInfo, address verifier) public;
    function getPseudoRandomVerifiers() public view returns (address);

}
```

## Users

### Registrants

Registrants send a request to the ContactSaltHashMap with `initiateRequest()` and pay a small fee. Three verifiers are pseudo-randomly selected from the Verfiers contract and assigned to the requester. The requester looks up the verifiers' public keys in the Verifiers contract and ecrypts their contact info with the corresponding public keys and calls `submitAllEncryptedData`. The requester can optionally choose to add [salt](https://en.wikipedia.org/wiki/Salt_(cryptography)) along with their encrypted message, so that their contact info hash is kept secret.

The requester will received a signed message from each verifier via the contact info they shared. The requester submits the signed messages they received from the verifiers to the contract to be verified by the contract. The registry is updated with an address that the `contactInfo` points to, provided the messages have been properly signed and verified. The verifiers split the requesters registration fee.

### Verifiers

Verifiers watch the ContactSaltHashMap contract, looking for new requests for which they are a verifier. When a user submits info encrypted for the verifier, the verifier will decrypt it, read the contact info to be registered (and salt, if there is any) and sign the keccak256(contactInfo + salt) and send it to the requester via the contact info method provided (SMS or email). This process can all be monitored and executed programmatically with a provided script.

The verifier for a given request is pseudo-randomly selected from the verifier pool with `getPseudoRandomVerifiers()`.

Verifiers will receive a small fee for every requester that they help register their contact info.

Anyone can become a verifier, it just takes a small deposit. If a verifier does not send a requester a message within 10 minutes, or does not send a properly signed message, the requester can ask for a new verifier (and the verifier that failed to provide a valid text message in the alloted time will lose their deposit).

## Potential Attacks

1. people try to register contact info that they do not own
2. verifiers do not send signatures to the requesting party
3. verifiers send bad signatures to the requesting party
4. Denial of service - an attacker tries to register a number that they do not own, preventing the real owner from registering it
5. One person registers multiple verifiers. If one person controls all 3 verifiers for a given requester Entry, they can sign incorrect contact info, allowing the registrant to register false information. 
6. Similar to point #5, all 3 selected verifiers could collude with a registrant, allowing the registrant to register false data.
7. Someone registers with no intention of verifying the contact information. They do it just to strike the verifiers and make them lose their deposits.
8. A registrant tries to strike a verifier after the verifier has rejected their registration request.

[add more]

## Addressing attacks

1. The false registrant will not receive the signed messages from the verifiers to actually register the contactInfo. The request expires after 24 hours.
2. A registrant can signal that a verifier has witheld or sent bad info, striking them and initiating a new registration request. Verifiers get 3 strikes before they lose their deposit.
3. see #2
4. Registration requests require a small fee be paid (deterant) and expire after 24 hours, after which time a new person can request to register given contactInfo.
5. This is why 3 verifiers are required for each registrant. Ideally there will be so many validators in the system that it would be prohibitively expensive (and not beneficial enough) for one person or group to collude to be all 3 verifiers for a given Entry request.
6. See #5
7. Registering contact info costs a fee and the verifiers selected for any given registrant are pseudo-random. The registrant will lose money and cannot target a specific verifier. Verifiers get 3 strikes before losing their deposit.
8. Once a verifier has reported a bad registration request, the requester cannot strike the verifier.

## Alternatives

## Off-Chain work

- If users want to send money to someone in their contacts list, they will look up the hash of their contact info in the index. If they don't see it, they can should message the person to see if they are registered under a different hash. If all of this is managed by the same mobile application, the salt could be shared with other contacts that also have the app, so it could be done behind the scenes. 
    - If the recipient does not have an account, they can send money to the index, which will act like an escrow account for the funds. The sender sends a small amount to a new account and shares the private key of the new account with the person they are sending money. The recipient uses the funds in the new account to pay for transaction fees to register their contact info.

## Future Work

- Talk with wallet developers to see if this is something that would be valuable. Would they integrate it?
- Contract Upgradability
- Ownable, controlled by Multi-Sig
- Use DAI in addition to ETH, or other ERC20s?
- Gas Station Network for new accounts with positive balance (so they don't need to get funds before they can withdraw them from the contract)
    - see [stablecoin.services](https://stablecoin.services/about.html) for a live example of what this might look like and how to build it
- zero knowledge proofs into the registry, to mask who is sending funds to a number
- javascript sdk for easy integration
