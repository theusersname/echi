const ethers = require('ethers');
let ContactList = require('../build/contracts/ContactList.json')
let Verifiers = require('../build/contracts/Verifiers.json')
const Nexmo = require('nexmo');

require('dotenv').config()

const nexmo = new Nexmo({
    apiKey: process.env.NEXMO_API_KEY,
    apiSecret: process.env.NEXMO_API_SECRET
  })

const PRIV_KEY = process.env.PRIV_KEY
const VERIFIER_KEY = process.env.VERIFIER_PRIV_KEY

let httpProvider = new ethers.providers.JsonRpcProvider();
let ropstenProvider = ethers.getDefaultProvider('ropsten');
let rinkebyProvider = ethers.getDefaultProvider('rinkeby');
let mainnetProvider = ethers.getDefaultProvider('homestead');

let verifierWallet = new ethers.Wallet(VERIFIER_KEY, httpProvider);

const rinkebyAddress = ContactList.networks['4'].address
const ganacheAddress = ContactList.networks['5777'].address
const ContactListABI = ContactList.abi
const rinkebyContactListContract = new ethers.Contract(rinkebyAddress, ContactListABI, rinkebyProvider)
const ganacheContactListContract = new ethers.Contract(ganacheAddress, ContactListABI, httpProvider)

let to, text, from = "13024862330"

function sendAText(from, to, text){
    nexmo.message.sendSms(from, to, text, (err, res) => {
        if (err) {
            console.log(err);
        } else {
            if(res.messages[0]['status'] === "0") {
                console.log("Message sent successfully.");
            } else {
                console.log(`Message failed with error: ${res.messages[0]['error-text']}`);
            }
        }
    })
}

ganacheContactListContract.on("LogInitRegistrationWithBalance", async (address, contactInfo, verifier, event) => {
    console.log("address:", address, 
                "info: ", contactInfo, 
                "verifier: ",  verifier, 
                "event: ", event)
    to = contactInfo
    let hash = ethers.utils.id(contactInfo)
    let signedContactInfo = await verifierWallet.signMessage(contactInfo)
    text = `Hash: ${hash}
            Signed Message: ${signedContactInfo}`
    sendAText(from, to, text)
})

ganacheContactListContract.on("LogInitRegistrationNoBalance", async (address, contactInfo, verifier, event) => {
    console.log("address:", address, 
                "info: ", contactInfo, 
                "verifier: ",  verifier, 
                "event: ", event)
    to = contactInfo
    let hash = ethers.utils.id(contactInfo)
    let signedContactInfo = await verifierWallet.signMessage(contactInfo)
    text = `Hash: ${hash}
            Signed Message: ${signedContactInfo}`
    sendAText(from, to, text)
})




