pragma solidity ^0.4.18;


import '../../contracts/crowdsale/Crowdsale.sol';


contract CrowdsaleMock is Crowdsale {

  	function CrowdsaleMock(uint256 _startTime, uint256 _endTime, uint256 _presale_rate, uint256 _ico_rate, address _wallet, ADSigmaSmartToken _token) public
  		Crowdsale(_startTime, _endTime, _presale_rate, _ico_rate, _wallet, _token)
  	{
  	}

  	/// @dev Accepts new ownership on behalf of the ADSigmaCrowdsale contract. This can be used, by the token sale
  	/// contract itself to claim back ownership of the ADSigmaSmartToken contract.
  	function claimTokenOwnership() external {
    	token.claimOwnership();
	}
}
