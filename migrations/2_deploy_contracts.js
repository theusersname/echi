const ContactSaltHashMap = artifacts.require("ContactSaltHashMap");
const Verifiers = artifacts.require("Verifiers");
const ECDSA = artifacts.require("ECDSA.sol");

module.exports = function(deployer, network, accounts) {

    let verifierDeposit = web3.utils.toWei("100", "finney")
    let clInstance, verifiersInstance

    deployer.deploy(ECDSA)
    deployer.link(ECDSA, ContactSaltHashMap)
    
    deployer.deploy(ContactSaltHashMap).then((pb) => {
      clInstance = pb
      return deployer.deploy(Verifiers, clInstance.address);
    }).then((verifiers)=>{
      verifiersInstance = verifiers
      clInstance.setVerifiersAddress(verifiers.address, {from: accounts[0]})
    })

};
