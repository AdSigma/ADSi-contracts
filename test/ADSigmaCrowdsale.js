import ether from './helpers/ether'
import {advanceBlock} from './helpers/advanceToBlock'
import {increaseTimeTo, duration} from './helpers/increaseTime'
import latestTime from './helpers/latestTime'
import EVMThrow from './helpers/EVMThrow'

const utils = require('./helpers/Utils');

const BigNumber = web3.BigNumber

const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should()

//const ADSigmaCrowdsale = artifacts.require('ADSigmaCrowdsale')
const ADSigmaCrowdsale = artifacts.require('../contracts/ADSigmaCrowdsale')
const ADSigmaSmartToken = artifacts.require('ADSigmaSmartToken.sol')

contract('ADSigmaCrowdsale', function([_, investor, owner, wallet, walletTeam, walletReserve]) {

    const value = ether(1)

    before(async function() {
        //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await advanceBlock()
    })
    beforeEach(async function() {
        this.startTime = latestTime() + duration.weeks(1);
        this.endTime = this.startTime + duration.weeks(1)
        this.afterEndTime = this.endTime + duration.seconds(1)
        this.token = await ADSigmaSmartToken.new({from: owner});

        this.crowdsale = await ADSigmaCrowdsale.new(this.startTime,
            this.endTime,
            wallet,
            walletTeam,
            walletReserve,
            this.token.address,
            {
                from: owner
            })

        await this.token.transferOwnership(this.crowdsale.address, {from: owner});

        await this.crowdsale.claimTokenOwnership({from: owner})

    })


    describe('Token destroy', function() {

        it('should not allow destroy before finalize', async function() {

            await increaseTimeTo(this.startTime)
            await this.crowdsale.sendTransaction({
                value: value,
                from: investor
            })

            try {
                await this.token.destroy(investor, 20, {from: investor});
            } catch (error) {
                return utils.ensureException(error);
            }
        })

        it('should allow destroy after finalize', async function() {

            await increaseTimeTo(this.startTime)
            await this.crowdsale.sendTransaction({
                value: value,
                from: investor
            })

            await increaseTimeTo(this.afterEndTime)
            await this.crowdsale.finalize({
                from: owner
            })

            await this.token.destroy(investor, 20, {from: investor});
        })
    })

    describe('Token transfer', function() {

        it('should not allow transfer before after finalize', async function() {

            await increaseTimeTo(this.startTime)
            await this.crowdsale.sendTransaction({
                value: value,
                from: investor
            })

            try {
                await this.token.transfer(walletTeam, 1, {
                    from: investor
                });
                assert(false, "didn't throw");
            } catch (error) {
                return utils.ensureException(error);
            }
        })

        it('should allow transfer after finalize', async function() {

            await increaseTimeTo(this.startTime)
            await this.crowdsale.sendTransaction({
                value: value,
                from: investor
            })

            await increaseTimeTo(this.afterEndTime)
            await this.crowdsale.finalize({
                from: owner
            })

            await this.token.transfer(walletTeam, 1, {
                from: walletReserve
            });
        })
    })

    describe('Finalize allocation', function() {

        beforeEach(async function() {
            await increaseTimeTo(this.startTime)
            await this.crowdsale.sendTransaction({
                value: value,
                from: investor
            })

            await increaseTimeTo(this.afterEndTime)
            await this.crowdsale.finalize({
                from: owner
            })

            this.totalSupply = await this.token.totalSupply()
        })

        it('Allocate Team token amount as 10% of the total supply', async function() {
            const expectedTeamTokenAmount = ether(10000000);
            let walletTeamBalance = await this.token.balanceOf(walletTeam);

            walletTeamBalance.should.be.bignumber.equal(expectedTeamTokenAmount);
        })


        it('Allocate Reserve token amount as 30% and remaining amount of the total supply', async function() {
            const expectedReserveTokenAmount = 30000000  + 60000000  - 3750 ;
            let walletReserveBalance = await this.token.balanceOf(walletReserve);
            walletReserveBalance /= ether(1);
            walletReserveBalance.should.be.bignumber.equal(expectedReserveTokenAmount);
        })

        it('should set finalized true value', async function() {
            assert.equal(await this.crowdsale.isFinalized(), true);
        })

        it('should set token owner to crowdsale owner', async function() {

            await this.token.claimOwnership({
                from: owner
            })

            let tokenOwner = await this.token.owner();
            assert.equal(tokenOwner, owner);
        })

    })

    
    describe('Total Found', function() {

                 it('should start with 0', async function() {
                     let total = await this.crowdsale.getTotalFundsRaised();

                     assert.equal(total, 0);
                 })

                 it('should total amount be equeal to 2', async function() {
                     await increaseTimeTo(this.startTime)
                     await this.crowdsale.sendTransaction({
                         value: ether(2),
                         from: investor
                     })

                    let total = await this.crowdsale.getTotalFundsRaised();
                    total.should.be.bignumber.equal(ether(2));
                 })
                 it('should allow only owner account to call setFiatRaisedConvertedToWei', async function() {
                    await increaseTimeTo(this.startTime)
                    const {
                        logs
                    } = await this.crowdsale.setFiatRaisedConvertedToWei(1, {
                        from: owner
                    });
       
                    const event = logs.find(e => e.event === "FiatRaisedUpdated")
                    should.exist(event)
                })
        
                it('should not allow non-owner account to call setFiatRaisedConvertedToWei', async function() {
                    try {
                        await increaseTimeTo(this.startTime)
                        await this.crowdsale.setFiatRaisedConvertedToWei(1, {
                            from: investor
                        });
                        assert(false, "didn't throw");
                    } catch (error) {
                        return utils.ensureException(error);
                    }
                })
        
       
                it('should not be at after crowdsale ended', async function() {
                    try {
                        await increaseTimeTo(this.afterEndTime)
                        
                        await this.crowdsale.setFiatRaisedConvertedToWei(1, {
                            from: owner
                        });
                        assert(false, "didn't throw");
                    } catch (error) {
                        return utils.ensureException(error);
                    }
                })
             })
        

    describe('Constructor Parameters', function() {
        it('should initilaized with a valid walletTeam adderss', async function() {
            try {
                this.token = await ADSigmaSmartToken.new({from: owner});

                this.crowdsale = await ADSigmaCrowdsale.new(this.startTime,
                    this.endTime,
                    wallet,
                    0x0,
                    walletReserve,
                    this.token.address,

                    {
                        from: owner
                    })

                await this.token.transferOwnership(this.crowdsale.address, {from: owner});

                await this.crowdsale.claimTokenOwnership({from: owner})
            } catch (error) {
                return utils.ensureException(error);
            }

            assert(false, "did not throw with invalid walletTeam address")
        })



        it('should initilaized with a valid walletReserve adderss', async function() {
            try {
                this.crowdsale = await ADSigmaCrowdsale.new(this.startTime,
                    this.endTime,
                    wallet,
                    walletTeam,
                    0x0,
                    this.token.address,

                    {
                        from: owner
                    })

                await this.token.transferOwnership(this.crowdsale.address, {from: owner});


                await this.crowdsale.claimTokenOwnership({from: owner})

            } catch (error) {
                return utils.ensureException(error);
            }

            assert(false, "did not throw with invalid walletReserve address")
        })

        it('should initilaized with a valid token adderss', async function() {
            try {
                this.crowdsale = await ADSigmaCrowdsale.new(this.startTime,
                    this.endTime,
                    wallet,
                    walletTeam,
                    walletReserve,
                    0x0,
                    {
                        from: owner
                    })

                await this.token.transferOwnership(this.crowdsale.address, {from: owner});


                await this.crowdsale.claimTokenOwnership({from: owner})

            } catch (error) {
                return utils.ensureException(error);
            }

            assert(false, "did not throw with invalid walletReserve address")
        })



        it('should initilaized with a valid parameters', async function() {
            this.crowdsale = await ADSigmaCrowdsale.new(this.startTime,
                this.endTime,
                wallet,
                walletTeam,
                walletReserve,
                this.token.address,
                {
                    from: owner
                })

            await this.token.transferOwnership(this.crowdsale.address, {from: owner});


            await this.crowdsale.claimTokenOwnership({from: owner})

        })
    })
})
