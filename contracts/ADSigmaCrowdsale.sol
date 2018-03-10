pragma solidity ^0.4.18;


import './crowdsale/FinalizableCrowdsale.sol';
import './bancor/TokenHolder.sol';
import './math/SafeMath.sol';
import './ADSigmaSmartToken.sol';


contract ADSigmaCrowdsale is TokenHolder,FinalizableCrowdsale {


    // ADSI to ETH base rate
    uint256 public constant PRESALE_EXCHANGE_RATE = 3750;
    uint256 public constant ICO_EXCHANGE_RATE = 3000;

    // =================================================================================================================
    //                                      Modifiers
    // =================================================================================================================

    /**
     * @dev Throws if called after crowdsale was finalized
     */
    modifier beforeFinzalized() {
        require(!isFinalized);
        _;
    }
    /**
     * @dev Throws if called before crowdsale start time
     */
    modifier notBeforeSaleStarts() {
        require(now >= startTime);
        _;
    }
   /**
     * @dev Throws if called not during the crowdsale time frame
     */
    modifier onlyWhileSale() {
        require(now >= startTime && now < endTime);
        _;
    }

    // =================================================================================================================
    //                                      Members
    // =================================================================================================================

    // wallets address for 40% of ADSI allocation
    address public walletTeam;   //10% of the total number of ADSI tokens will be allocated to the team
    address public walletReserve;   //30% of the total number of ADSI tokens will be allocated to ADSigma reserves


    // Funds collected outside the crowdsale in wei
    uint256 public fiatRaisedConvertedToWei;


    // =================================================================================================================
    //                                      Events
    // =================================================================================================================

    event FiatRaisedUpdated(address indexed _address, uint256 _fiatRaised);

    // =================================================================================================================
    //                                      Constructors
    // =================================================================================================================

    function ADSigmaCrowdsale(uint256 _startTime,
    uint256 _endTime,
    address _wallet,
    address _walletTeam,
    address _walletReserve,
    ADSigmaSmartToken _adsigmaSmartToken)
    public
    Crowdsale(_startTime, _endTime, PRESALE_EXCHANGE_RATE, ICO_EXCHANGE_RATE, _wallet, _adsigmaSmartToken) {
        require(_walletTeam != address(0));
        require(_walletReserve != address(0));
        require(_adsigmaSmartToken != address(0));

        walletTeam = _walletTeam;
        walletReserve = _walletReserve;

        token = _adsigmaSmartToken;

    }


    // =================================================================================================================
    //                                      Impl FinalizableCrowdsale
    // =================================================================================================================

    //@Override
    function finalization() internal onlyOwner {
        super.finalization();

        uint256 remainingTokens = 60000000 - token.totalSupply();

        // 10% of the total number of ADSI tokens will be allocated ADSigma team
        token.issue(walletTeam, 10000000);

        // 30% of the total number of ADSI tokens will be allocated ADSigma reserves
        token.issue(walletReserve, 30000000 + remainingTokens);

        // Re-enable transfers after the token sale.
        token.disableTransfers(false);

        // Re-enable destroy function after the token sale.
        token.setDestroyEnabled(true);

        // transfer token ownership to crowdsale owner
        token.transferOwnership(owner);

    }

    // =================================================================================================================
    //                                      Public Methods
    // =================================================================================================================
    // @return the total funds collected in wei(ETH and none ETH).
    function getTotalFundsRaised() public view returns (uint256) {
        return fiatRaisedConvertedToWei.add(weiRaised);
    }

    // =================================================================================================================
    //                                      External Methods
    // =================================================================================================================
    // @dev Set funds collected outside the crowdsale in wei.
    //  note: we not to use accumulator to allow flexibility in case of humane mistakes.
    // funds are converted to wei using the market conversion rate of USD\ETH on the day on the purchase.
    // @param _fiatRaisedConvertedToWei number of none eth raised.
    function setFiatRaisedConvertedToWei(uint256 _fiatRaisedConvertedToWei) external onlyOwner onlyWhileSale {
        fiatRaisedConvertedToWei = _fiatRaisedConvertedToWei;
        FiatRaisedUpdated(msg.sender, fiatRaisedConvertedToWei);
    }

    // Issue tokens to promoters
    function issueTokens(address beneficiary, uint256 tokens) public onlyOwner {
        super.issueTokens(beneficiary, tokens);
    }


    /// @dev Accepts new ownership on behalf of the ADSigmaCrowdsale contract. This can be used, by the token sale
    /// contract itself to claim back ownership of the ADSigmaSmartToken contract.
    function claimTokenOwnership() external onlyOwner {
        token.claimOwnership();
    }

}
