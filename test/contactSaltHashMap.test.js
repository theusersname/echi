let BN = web3.utils.BN
let ContactSaltHashMap = artifacts.require('ContactSaltHashMap')
let Verifiers = artifacts.require('Verifiers')
let catchRevert = require("./exceptionsHelpers.js").catchRevert
const ethers = require('ethers')

require('dotenv').config()
const VERIFIER_PRIVATE_1 = process.env.VERIFIER_KEY_1
const VERIFIER_PRIVATE_2 = process.env.VERIFIER_KEY_2
const VERIFIER_PRIVATE_3 = process.env.VERIFIER_KEY_3
let signingKey1 = new ethers.utils.SigningKey(VERIFIER_PRIVATE_1)
let signingKey2 = new ethers.utils.SigningKey(VERIFIER_PRIVATE_2)
let signingKey3 = new ethers.utils.SigningKey(VERIFIER_PRIVATE_3)
const VERIFIER_PUBLIC_1 = "0x" + signingKey1.publicKey.substr(4)  // the first byte of public keys (04) is not relevant
const VERIFIER_PUBLIC_2 = "0x" + signingKey2.publicKey.substr(4)
const VERIFIER_PUBLIC_3 = "0x" + signingKey3.publicKey.substr(4)

contract('ContactSaltHashMap', async function(accounts) {

    const verifier1 = accounts[0]
    const verifier2 = accounts[8]
    const verifier3 = accounts[9]
    const alice = accounts[1]
    const bob = accounts[2]
    const emptyAddress = '0x0000000000000000000000000000000000000000'

    const contactInfo = "11234567890"
    let clInstance, verifiersInstance, verifierDeposit, registrationFee

    beforeEach(async () => {
        clInstance = await ContactSaltHashMap.new()
        verifiersInstance = await Verifiers.new(clInstance.address)
        verifierDeposit = await verifiersInstance.verifierDeposit.call()
        registrationFee = await clInstance.registrationFee.call()
        await clInstance.setVerifiersAddress(verifiersInstance.address, {from: verifier1})
        await verifiersInstance.addVerifier(VERIFIER_PUBLIC_1, {from: verifier1, value: verifierDeposit})
        await verifiersInstance.addVerifier(VERIFIER_PUBLIC_2, {from: verifier2, value: verifierDeposit})
        await verifiersInstance.addVerifier(VERIFIER_PUBLIC_3, {from: verifier3, value: verifierDeposit})
    })

    it("should have 3 verifiers initialized", async() => {
        let verifier1 = await verifiersInstance.verifiers(0, {from: alice})
        let verifier2 = await verifiersInstance.verifiers(1, {from: alice})
        let verifier3 = await verifiersInstance.verifiers(2, {from: alice})

        let verifierInfo1 = await verifiersInstance.verifierInfo(verifier1, {from: alice})
        let verifierInfo2 = await verifiersInstance.verifierInfo(verifier2, {from: alice})
        let verifierInfo3 = await verifiersInstance.verifierInfo(verifier3, {from: alice})

        // assert verifier info
    })

    it("allow a user to be assigned verifiers by calling iniate Request", async() => {
        await clInstance.initiateRequest({from: alice})
        await clInstance.requesterToRequest(alice, {from: alice})

        // check request
    })

    it("should log a LogEncryptedData event when the function is called", async() => {

    })

    it("verifiers should be able to decrypt the contact info from the LogEncryptedData event", async() => {

    })


    it("should return excess funds sent to the contract during registration", async() => {
    
    })   

    it("should not allow a user to register with paying a deposit", async() => {

    })    
    
    it("should let a registrant add their contact info the contract", async() => {

        // 1. watch for which verifieres were selected
        // 2. get those verifiers public keys from the Verifiers contract
        // 3. encrypt the contact info with the public keys
        // 4. call submitEncryptedContactInfo() with each encrypted message
        // 5. have the verifier watch for the submitted ecrypted data
        // 6. have the verifiers decrypt the data, then send it to the registrant
        // 7. have the registrant submit all of the signed data
        // 8. check that the Entry was updated correctly

    }) 

    it("should assign three verifiers to a registrant", async() => {

    })

    it("should allow a registrant to update the address that an Entry points to", async() => {
    })

    it("should store any funds sent to unregistered 'contactInfo'", async() => {
    })
    
    it("should allow registrants with a balance to withdraw their funds", async() => {
    })

    it("should store any funds sent to unregistered 'contactInfo'", async() => {
    }) 

    it("should not allow funds associated with an unregistered Entry to be withdrawn", async() => {
    })     

})