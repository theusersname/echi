let BN = web3.utils.BN
// let ContactList = artifacts.require('ContactList')
let Verifiers = artifacts.require('Verifiers')
let catchRevert = require("./exceptionsHelpers.js").catchRevert

require('dotenv').config()
const VERIFIER_KEY_1 = process.env.VERIFIER_KEY_1
const VERIFIER_KEY_2 = process.env.VERIFIER_KEY_2
const VERIFIER_KEY_3 = process.env.VERIFIER_KEY_3

contract('Verifiers', function(accounts) {

    const verifier1 = accounts[0]
    const verifier2 = accounts[8]
    const verifier3 = accounts[9]
    const alice = accounts[1]
    const bob = accounts[2]
    const emptyAddress = '0x0000000000000000000000000000000000000000'

    let clInstance, verifiersInstance, verifierDeposit

    // beforeEach(async () => {
    //     clInstance = await ContactList.new()
    //     verifiersInstance = await Verifiers.new(clInstance.address)
    //     verifierDeposit = await verifiersInstance.verifierDeposit.call()
    //     registrationFee = await clInstance.registrationFee.call()
    //     await clInstance.setVerifiersAddress(verifiersInstance.address, {from: verifier1})
    //     await verifiersInstance.addVerifier({from: verifier1, value: verifierDeposit})
    //     await verifiersInstance.addVerifier({from: verifier2, value: verifierDeposit})
    //     await verifiersInstance.addVerifier({from: verifier3, value: verifierDeposit})
    // })

    // it("should allow a registrant to strike a verifier", async() => {
    // }) 

    // it("should allow a registrant to strike two verifiers", async() => {
    // }) 

    // it("should allow a registrant to strike three verifiers", async() => {
    // }) 

})