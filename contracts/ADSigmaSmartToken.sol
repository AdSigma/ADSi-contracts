pragma solidity ^0.4.18;


import './bancor/LimitedTransferBancorSmartToken.sol';
import './bancor/TokenHolder.sol';


/**
  A Token which is 'Bancor' compatible and can mint new tokens and pause token-transfer functionality
*/
contract ADSigmaSmartToken is TokenHolder, LimitedTransferBancorSmartToken {

    // =================================================================================================================
    //                                         Members
    // =================================================================================================================

    string public name = "ADSIGMA";

    string public symbol = "ADSI";

    uint8 public decimals = 18;

    // =================================================================================================================
    //                                         Constructor
    // =================================================================================================================

    function ADSigmaSmartToken() public {
        //Apart of 'Bancor' computability - triggered when a smart token is deployed
        NewSmartToken(address(this));
    }
}
