# ADSigma's Crowdsale Contracts

Please see below ADSigma smart contracts for the [ADSigma Crowdsale][ADSigma].

![ADSigma Token](images/logo.png)

 is an ERC-20 compliant cryptocurrency built on top of the [Ethereum][ethereum] blockchain.


## Contracts

Please see the [contracts/](contracts) directory.

## The Crowdsale Specification
*	ADSI token is ERC-20 compliant.
*	ADSI Token is [Bancor][bancor] compliant.
*	Token allocation:
	* 60% of the total number of ADSI tokens will be allocated to contributors during the token sale.
	* 10% of the total number of ADSI tokens will be allocated to the team.
	* 30% of the total number of ADSI tokens will be allocated to ADSigma, to be used for future strategic plans and to develop the ADSigma' ecosystem

## ADSI PRICING PROGRAM
The ADSI / ETH rate will be 3000 ADSI for every ETH

## Develop

* Contracts are written in [Solidity][solidity] and tested using [Truffle][truffle] and [testrpc][testrpc].

* Our smart contract is based on [Sirin Labs ICO][sirinlabicogithub] and [Open Zeppelin][openzeppelin] smart contracts [v1.3.0][openzeppelin_v1.3.0]

* ADSI token is a **SmartToken**, implementing Bancor's SmartToken contract.

#### ADSigmaCrowdsale Functions

**getTotalFundsRaised**
```cs
function getTotalFundsRaised() public view returns (uint256)
```
Returns the total funds collected in wei(ETH and none ETH).

**addUpdateGrantee**
```cs
function addUpdateGrantee(address _grantee, uint256 _value) external onlyOwner beforeFinzalized
```
Adds/Updates address and token allocation for token grants.

Granted tokens are allocated to non-Ether, presale, buyers.


**setFiatRaisedConvertedToWei**
```cs
function setFiatRaisedConvertedToWei(uint256 _fiatRaisedConvertedToWei) external onlyOwner onlyWhileSale
```
Sets funds collected outside the crowdsale in wei.
funds are converted to wei using the market conversion rate of USD\ETH on the day on the purchase.



**hasEnded**
```cs
function hasEnded() public view returns (bool) {
```
Return true if the crowdsale cap was reached or endTime reached ( override crowdsale.sol)


**validPurchase**
```cs
function validPurchase() internal view returns (bool) {
```
Return true if hardcap was not reached ( override crowdsale.sol)


**deleteGrantee**
```cs
function deleteGrantee(address _grantee) external onlyOwner beforeFinzalized
```
Deletes entries from the grants list.


**claimTokenOwnership**
```cs
function claimTokenOwnership() external onlyOwner
```
Accepts new ownership on behalf of the ADSigmaCrowdsale contract. This can be used, by the token sale contract itself to claim back ownership of the ADSigmaSmartToken contract.

#### ADSigmaCrowdsale Events

**GrantAdded**
```cs
event GrantAdded(address indexed _grantee, uint256 _amount);
```


**GrantUpdated**
```cs
event GrantUpdated(address indexed _grantee, uint256 _oldAmount, uint256 _newAmount);
```


**GrantDeleted**
```cs
event GrantDeleted(address indexed _grantee, uint256 _hadAmount);
```

**FiatRaisedUpdated**
```cs
event FiatRaisedUpdated(address indexed _address, uint256 _fiatRaised)
```


### Dependencies

```bash
# Install Truffle and testrpc packages globally:
$ npm install -g truffle ethereumjs-testrpc

# Install local node dependencies:
$ npm install
```

### Test

```bash
$ ./scripts/test.sh
```


### Code Coverage

```bash
$ ./scripts/coverage.sh
```


## License

Apache License v2.0


[ADSigma]: https://www.ADSigma.network
[ethereum]: https://www.ethereum.org/

[solidity]: https://solidity.readthedocs.io/en/develop/
[truffle]: http://truffleframework.com/
[testrpc]: https://github.com/ethereumjs/testrpc
[bancor]: https://github.com/bancorprotocol/contracts
[openzeppelin]: https://openzeppelin.org
[sirinlabicogithub]: https://github.com/sirin-labs/crowdsale-smart-contract
[openzeppelin_v1.3.0]: https://github.com/OpenZeppelin/zeppelin-solidity/releases/tag/v1.3.0