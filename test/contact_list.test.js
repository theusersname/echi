// let BN = web3.utils.BN
// let ContactList = artifacts.require('ContactList')
// let Verifiers = artifacts.require('Verifiers')
// let catchRevert = require("./exceptionsHelpers.js").catchRevert

// require('dotenv').config()
// const VERIFIER_KEY_1 = process.env.VERIFIER_KEY_1
// const VERIFIER_KEY_2 = process.env.VERIFIER_KEY_2
// const VERIFIER_KEY_3 = process.env.VERIFIER_KEY_3

// // let mnemonic = "adult race orient figure leg buzz sugar lecture chief fold knife barely"

// contract('ContactList', async function(accounts) {

//     const verifier1 = accounts[0]
//     const verifier2 = accounts[8]
//     const verifier3 = accounts[9]
//     const alice = accounts[1]
//     const bob = accounts[2]
//     const emptyAddress = '0x0000000000000000000000000000000000000000'

//     const contactInfo = "11234567890"
//     let contacthash = // get hash of contact info
//     let clInstance, verifiersInstance, verifierDeposit, registrationFee

//     beforeEach(async () => {
//         clInstance = await ContactList.new()
//         verifiersInstance = await Verifiers.new(clInstance.address)
//         verifierDeposit = await verifiersInstance.verifierDeposit.call()
//         registrationFee = await clInstance.registrationFee.call()
//         await clInstance.setVerifiersAddress(verifiersInstance.address, {from: verifier1})
//         await verifiersInstance.addVerifier({from: verifier1, value: verifierDeposit})
//         await verifiersInstance.addVerifier({from: verifier2, value: verifierDeposit})
//         await verifiersInstance.addVerifier({from: verifier3, value: verifierDeposit})
//     })

//     it("allow a user to be assigned verifiers no Entry balance", async() => {
//         let tx = await clInstance.assignVerifiers(contacthash, {from: alice, value: registrationFee})
//         let entry = await clInstance.contactListToEntry.call(contacthash)

//         let block = await web3.eth.getBlock(tx.receipt.blockNumber)
//         let time = block.timestamp

//         // look for LogVerifiersAssigned event

//         assert.equal(entry.requestingAddress, alice, 'alice should be the requesting address')
//         assert.equal(entry.owner, emptyAddress, 'pointsTo address should be empty')
//         assert.equal(entry.pointsTo, emptyAddress, 'owner of the entry should be empty')
//         assert.equal(entry.balance.toString(), "0", 'entry balance should be 0')
//         assert.equal(entry.flaggedByVerifier, false, 'the registrant should not be flagged')
//         assert.equal(entry.time.toString(), time, 'the block timestamp should match the entry timestamp')
//         assert.equal(entry.fee.toString(), registrationFee, 'the registration fee should be the amount specified in the contract')
//     })

//     it("should log a LogEncryptedData event when the function is called", async() => {

//     })

//     it("verifiers should be able to decrypt the contact info from the LogEncryptedData event", async() => {

//     })

//     // it("allow a user to initialize registration with no Entry balance", async() => {
//     //     let tx = await clInstance.initRegistration(contactInfo, {from: alice, value: registrationFee})
//     //     let entry = await clInstance.contactListToEntry.call(contactInfo)

//     //     let block = await web3.eth.getBlock(tx.receipt.blockNumber)
//     //     let time = block.timestamp
        
//     //     assert.equal(entry.requestingAddress, alice, 'alice should be the requesting address')
//     //     assert.equal(entry.owner, emptyAddress, 'pointsTo address should be empty')
//     //     assert.equal(entry.pointsTo, emptyAddress, 'owner of the entry should be empty')
//     //     assert.equal(entry.balance.toString(), "0", 'entry balance should be 0')
//     //     assert.equal(entry.flaggedByVerifier, false, 'the registrant should not be flagged')
//     //     assert.equal(entry.time.toString(), time, 'the block timestamp should match the entry timestamp')
//     //     assert.equal(entry.fee.toString(), registrationFee, 'the registration fee should be the amount specified in the contract')
//     // })

//     it("should return excess funds sent to the contract during registration", async() => {
//         let fee = web3.utils.toBN("100").add(registrationFee)
//         let tx = await clInstance.assignVerifiers(contacthash, {from: alice, value: fee})
//         let entry = await clInstance.contactListToEntry.call(contacthash)

//         let block = await web3.eth.getBlock(tx.receipt.blockNumber)
//         let time = block.timestamp
        
//         // TODO
//         // check balances

//         //assert.equal(entry[0], emptyAddress, 'pointsTo address should be empty')
//         //assert.equal(entry[1], emptyAddress, 'owner of the entry should be empty')
//         //assert.equal(entry[2].toString(), "0", 'entry balance should be 0')
//         //assert.equal(entry[3], verifier1, 'the only registered verifier should be the verifier address in the entry')
//         //assert.equal(entry[4].toString(), time, 'the block timestamp should match the entry timestamp')
//         //assert.equal(entry[5], alice, 'alice should be the requesting address')
//         //assert.equal(entry[6].toString(), registrationFee, 'the registration fee should be the amount specified in the contract') 
//     })   

//     it("should not allow a user to register with paying a deposit", async() => {
//         let fee = registrationFee.sub(web3.utils.toBN("1"))
//         await catchRevert(clInstance.assignVerifiers(contacthash, {from: alice, value: fee}))
//     })    
    
//     it("should let a registrant add their contact info the contract", async() => {
//         let initTx = await clInstance.assignVerifiers(contacthash, {from: alice, value: registrationFee})

//         // 1. watch for which verifieres were selected
//         // 2. get those verifiers public keys from the Verifiers contract
//         // 3. encrypt the contact info with the public keys
//         // 4. call submitEncryptedContactInfo() with each encrypted message
//         // 5. have the verifier watch for the submitted ecrypted data
//         // 6. have the verifiers decrypt the data, then send it to the registrant
//         // 7. have the registrant submit all of the signed data
//         // 8. check that the Entry was updated correctly

//         let block = await web3.eth.getBlock(initTx.receipt.blockNumber)
//         let time = block.timestamp

//         // let hash = web3.eth.accounts.hashMessage(contactInfo)
//         let sig1 = await web3.eth.accounts.sign(contactInfo, VERIFIER_KEY_1)
//         let sig2 = await web3.eth.accounts.sign(contactInfo, VERIFIER_KEY_2)
//         let sig3 = await web3.eth.accounts.sign(contactInfo, VERIFIER_KEY_3)
//         let length = contactInfo.length
    
//         let tx = await clInstance.addInfoToRegistry(contactInfo, length.toString(), sig1.signature, sig2.signature, sig3.signature, bob, {from: alice})
//         let entry = await clInstance.contactListToEntry.call(contactInfo)

//         assert.equal(entry.requestingAddress, alice, 'alice should be the requesting address')
//         assert.equal(entry.owner, alice, 'the owner should be alice')
//         assert.equal(entry.pointsTo, bob, 'should point to bob')
//         assert.equal(entry.balance.toString(), "0", 'entry balance should be 0')
//         assert.equal(entry.flaggedByVerifier, false, 'the registrant should not be flagged')
//         assert.equal(entry.time.toString(), time, 'the block timestamp should match the entry timestamp')
//         assert.equal(entry.fee.toString(), registrationFee, 'the registration fee should be the amount specified in the contract')
//     }) 

//     it("should assign three verifiers to a registrant", async() => {
//         // watch for event
        
//         // clInstance.LogInitRegistrationNoBalance()
//         let tx = await clInstance.initRegistration(contactInfo, {from: alice, value: registrationFee})

//     })

//     it("should allow a registrant to update the address that an Entry points to", async() => {
//         let initTx = await clInstance.initRegistration(contactInfo, {from: alice, value: registrationFee})
//         let sig1 = await web3.eth.accounts.sign(contactInfo, VERIFIER_KEY_1)
//         let sig2 = await web3.eth.accounts.sign(contactInfo, VERIFIER_KEY_2)
//         let sig3 = await web3.eth.accounts.sign(contactInfo, VERIFIER_KEY_3)
//         let length = contactInfo.length

//         await clInstance.addInfoToRegistry(contactInfo, length.toString(), sig1.signature, sig2.signature, sig3.signature, bob, {from: alice})
//         await clInstance.updateEntryPointer(contactInfo, alice, {from: alice})
//         let entry = await clInstance.contactListToEntry.call(contactInfo)

//         assert.equal(entry.pointsTo, alice, 'the entry should point to alice')
//     })

//     it("should store any funds sent to unregistered 'contactInfo'", async() => {
//         let sendAmount = web3.utils.toBN(web3.utils.toWei("1", "ether"))
        
//         await clInstance.sendTo(contactInfo, {from: alice, value: sendAmount})
//         let entry = await clInstance.contactListToEntry.call(contactInfo)
//         let balanceMinusFee = sendAmount.sub(registrationFee)

//         assert.equal(entry.pointsTo, emptyAddress, 'the entry should point to an empty address')
//         assert.equal(entry.owner, emptyAddress, 'the entry owner should be an empty address')
//         assert.equal(entry.requestingAddress, emptyAddress, 'the requestingAddress should be an empty address')
//         assert.equal(entry.time.toString(), "0", 'the entry time should be 0')
//         assert.equal(entry.fee.toString(), registrationFee, 'the entry should point to alice')
//         assert.equal(entry.balance.toString(), balanceMinusFee.toString(), 'the entry should point to alice')
//     })
    
//     it("should allow registrants with a balance to withdraw their funds", async() => {
//     })

//     it("should store any funds sent to unregistered 'contactInfo'", async() => {
//     }) 

//     it("should not allow funds associated with an unregistered Entry to be withdrawn", async() => {
//     })     

// })