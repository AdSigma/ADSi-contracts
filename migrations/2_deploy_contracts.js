var ADSigmaSmartToken = artifacts.require("./Crowdsale/ADSigmaSmartToken");
var ADSigmaCrowdsale = artifacts.require("./Crowdsale/ADSigmaCrowdsale");

module.exports = function(deployer) {

    const MIN = 60;
    const HOUR = 60 * MIN;
    const DAY =  24 * HOUR;


    const startTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 60 * 2;
    const endTime = startTime + DAY * 14;
    const rate = new web3.BigNumber(1000)
    const wallet = web3.eth.accounts[0]

    deployer.deploy(ADSigmaSmartToken).then(function(e) {
        return deployer.deploy(ADSigmaCrowdsale,
            startTime,
            endTime,
            web3.eth.accounts[0],
            web3.eth.accounts[1],
            web3.eth.accounts[2],
            ADSigmaSmartToken.address)
    })
     
};
