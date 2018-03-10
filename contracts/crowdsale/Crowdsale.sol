pragma solidity ^0.4.18;


import '../token/MintableToken.sol';
import '../math/SafeMath.sol';
import '../ADSigmaSmartToken.sol';

/**
 * @title Crowdsale
 * @dev Crowdsale is a base contract for managing a token crowdsale.
 * Crowdsales have a start and end timestamps, where investors can make
 * token purchases and the crowdsale will assign them tokens based
 * on a token per ETH rate. Funds collected are forwarded to a wallet
 * as they arrive.
 */
contract Crowdsale {
    using SafeMath for uint256;

    uint256 public constant TOKEN_CAP = 60000000;

    // The token being sold
    ADSigmaSmartToken public token;

    // start and end timestamps where investments are allowed (both inclusive)
    uint256 public startTime;

    uint256 public endTime;

    // address where funds are collected
    address public wallet;

    // how many token units a buyer gets per wei
    uint256 public presale_rate;
    uint256 public ico_rate;

    bytes32 public phase;
    // amount of raised money in wei
    uint256 public weiRaised;

    uint256 public tokenCap;

    /**
     * event for token purchase logging
     * @param purchaser who paid for the tokens
     * @param beneficiary who got the tokens
     * @param value weis paid for purchase
     * @param amount amount of tokens purchased
     */
    event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);
    event TokenIssue(address indexed beneficiary, uint256 amount);

    function Crowdsale(uint256 _startTime, uint256 _endTime, uint256 _presale_rate, uint256 _ico_rate, address _wallet, ADSigmaSmartToken _token) public {
        require(_startTime >= now);
        require(_endTime >= _startTime);
        require(_presale_rate > 0);
        require(_ico_rate > 0);
        require(_wallet != address(0));
        require(_token != address(0));

        startTime = _startTime;
        endTime = _endTime;
        phase = 'presale';
        presale_rate = _presale_rate;
        ico_rate = _ico_rate;
        wallet = _wallet;
        token = _token;
    }

    function setPhase(bytes32 _phase){
        require(_phase == 'presale' || _phase == 'ico');
        phase = _phase;
    }

    // fallback function can be used to buy tokens
    function() external payable {
        buyTokens(msg.sender);
    }

    // low level token purchase function
    function buyTokens(address beneficiary) public payable {
        require(beneficiary != address(0));
        require(validPurchase());

        uint256 weiAmount = msg.value;

        // calculate token amount to be created
        uint256 rate = phase == 'presale' ? presale_rate : ico_rate;
        uint256 tokens = weiAmount.mul(rate).div(1 ether);

        require(token.totalSupply() + tokens <= TOKEN_CAP);

        // update state
        weiRaised = weiRaised.add(weiAmount);

        token.issue(beneficiary, tokens);
        TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);

        forwardFunds();
    }

    function issueTokens(address beneficiary, uint256 tokens) public {
        require(beneficiary != address(0));
        require(now >= startTime && now <= endTime);
        require(token.totalSupply() + tokens <= TOKEN_CAP);

        token.issue(beneficiary, tokens);
        TokenIssue(beneficiary, tokens);
    }

    // send ether to the fund collection wallet
    // override to create custom fund forwarding mechanisms
    function forwardFunds() internal {
        wallet.transfer(msg.value);
    }

    // @return true if the transaction can buy tokens
    function validPurchase() internal view returns (bool) {
        bool withinPeriod = now >= startTime && now <= endTime;
        bool nonZeroPurchase = msg.value != 0;
        return withinPeriod && nonZeroPurchase;
    }

    // @return true if crowdsale event has ended
    function hasEnded() public view returns (bool) {
        return now > endTime;
    }

}
