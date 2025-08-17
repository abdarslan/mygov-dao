const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const NUM_USERS = 200;
const MYGOV_INITIAL = 100;
const TL_INITIAL = 10000;

describe("MyGov Testing", function () {
    let myGov: any;
    let tlToken: any;
    let gov: any;
    let getter: any;
    let deployer: any;
    let donation: any;
    let survey: any;
    let users: any[] = [];

    let diamondAddress: string;
    let diamondCutFacet: any;
    let diamondLoupeFacet: any;

    before(async function () {
        const signers = await ethers.getSigners();
        deployer = signers[0];
        users = signers.slice(1, NUM_USERS + 1);

        // Deploy TLToken 
        const TLToken = await ethers.getContractFactory('TLToken');
        tlToken = await TLToken.connect(deployer).deploy();

        // Deploy DiamondCutFacet
        const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
        const diamondCutFacetInstance = await DiamondCutFacet.deploy();

        // Deploy DiamondLoupeFacet
        const DiamondLoupeFacet = await ethers.getContractFactory("DiamondLoupeFacet");
        const diamondLoupeFacetInstance = await DiamondLoupeFacet.deploy();

        // Deploy OwnershipFacet
        const OwnershipFacet = await ethers.getContractFactory("OwnershipFacet");
        const ownershipFacetInstance = await OwnershipFacet.deploy();

        // Deploy DiamondInit (initialization contract for setting up shared storage)
        const DiamondInit = await ethers.getContractFactory("DiamondInit");
        const diamondInitInstance = await DiamondInit.deploy();

        // Deploy the Diamond
        const MyGov = await ethers.getContractFactory("MyGov");
        const diamond = await MyGov.deploy(deployer.address, await diamondCutFacetInstance.getAddress());
        diamondAddress = await diamond.getAddress();

        // Deploy custom facets
        const GovFacet = await ethers.getContractFactory("GovFacet");
        const govFacet = await GovFacet.deploy();

        const ERC20Facet = await ethers.getContractFactory("ERC20Facet");
        const erc20Facet = await ERC20Facet.deploy();

        const SurveyFacet = await ethers.getContractFactory("SurveyFacet");
        const surveyFacet = await SurveyFacet.deploy();

        const GetterFacet = await ethers.getContractFactory("GetterFacet");
        const getterFacet = await GetterFacet.deploy();

        const DonationFacet = await ethers.getContractFactory("DonationFacet");
        const donationFacet = await DonationFacet.deploy();

        // Prepare the cut
        const FacetCutAction = { Add: 0, Replace: 1, Remove: 2 };
        const diamondCut = await ethers.getContractAt("IDiamondCut", diamondAddress);

        function getSelectors(contract: any) {
            // In ethers v6, we need to use contract.interface.fragments
            const fragments = contract.interface.fragments;
            return fragments
                .filter((fragment: any) => fragment.type === 'function')
                .map((fragment: any) => fragment.selector);
        }


        const cut = [
            {
                facetAddress: await diamondLoupeFacetInstance.getAddress(),
                action: FacetCutAction.Add,
                functionSelectors: getSelectors(diamondLoupeFacetInstance),
            },
            {
                facetAddress: await ownershipFacetInstance.getAddress(),
                action: FacetCutAction.Add,
                functionSelectors: getSelectors(ownershipFacetInstance),
            },
            {
                facetAddress: await govFacet.getAddress(),
                action: FacetCutAction.Add,
                functionSelectors: getSelectors(govFacet),
            },
            {
                facetAddress: await erc20Facet.getAddress(),
                action: FacetCutAction.Add,
                functionSelectors: getSelectors(erc20Facet),
            },
            {
                facetAddress: await surveyFacet.getAddress(),
                action: FacetCutAction.Add,
                functionSelectors: getSelectors(surveyFacet),
            },
            {
                facetAddress: await getterFacet.getAddress(),
                action: FacetCutAction.Add,
                functionSelectors: getSelectors(getterFacet),
            },
            {
                facetAddress: await donationFacet.getAddress(),
                action: FacetCutAction.Add,
                functionSelectors: getSelectors(donationFacet),
            }
        ];

        // Encode DiamondInit initializer call (if needed)
        const functionCall = diamondInitInstance.interface.encodeFunctionData("initAll", [
            "My Governance",        // _name
            "MYGOV",              // _symbol
            18,                 // _decimals
            ethers.parseUnits("10000000", 18), // _initialSupply (e.g. 10 millions of tokens)
            deployer.address,      // _owner (your test deployer or owner address)
            await tlToken.getAddress()     // _tlToken (address of your TLToken contract, or zero address if none)
        ]);


        // Diamond cut with init call
        const tx = await diamondCut.diamondCut(cut, await diamondInitInstance.getAddress(), functionCall);
        const receipt = await tx.wait();
        if (receipt.status !== 1) {
            throw new Error("Diamond upgrade failed");
        }
        myGov = await ethers.getContractAt("contracts/interfaces/IERC20.sol:IERC20", diamondAddress);
        gov = await ethers.getContractAt("IGov", diamondAddress);
        getter = await ethers.getContractAt("IGetter", diamondAddress);
        donation = await ethers.getContractAt("IDonation", diamondAddress);
        survey = await ethers.getContractAt("ISurvey", diamondAddress);
        for (let user of users) {
            await tlToken.mint(user.address, TL_INITIAL);
        }
        // At this point, diamond is fully deployed and upgraded with your facets
    });

    it("should return correct facet addresses", async function () {
        console.log(diamondAddress);
        const loupe = await ethers.getContractAt("IDiamondLoupe", diamondAddress);
        const facets = await loupe.facets();

        expect(facets.length).to.be.greaterThan(0);
    });

    describe("Faucet Functionality", function () {
        let initialBalance: any;
        let i = 1;
        beforeEach(async () => {
            // increse index for each test
            i++;
            initialBalance = await myGov.balanceOf(users[1].address);
        });

        it("should allow user to request tokens from the faucet", async () => {
            const faucetUser = users[i];

            // Request tokens from faucet
            await myGov.connect(faucetUser).faucet();

            // Check new balance of the user
            const newBalance = await myGov.balanceOf(faucetUser.address);
            expect(newBalance).to.equal(initialBalance + 1n);
            // Check if the user is marked as a member
            const isMember = await getter.isMember(faucetUser.address);
            expect(isMember).to.be.true;
        });

        it("should not allow user to request tokens from faucet more than once", async () => {
            const faucetUser = users[i];
            // First request
            await myGov.connect(faucetUser).faucet();

            // Attempt to request again
            await expect(
                myGov.connect(faucetUser).faucet()
            ).to.be.revertedWith("GovFacet: Faucet already used");
        });

        it("should mark user as member after using faucet", async () => {
            const faucetUser = users[i];

            // Request tokens from faucet
            await myGov.connect(faucetUser).faucet();

            // Verify that the user is added to the members list
            const isMember = await getter.isMember(faucetUser.address);
            expect(isMember).to.be.true;
        });
    });

    describe("Voting Functionality", function () {
        let deadline: any;
        let payschedule: any;
        let url: any;
        let timestamp: any;
        let payamounts: any;
        let index = -1;
        beforeEach(async () => {
            // approve myGov to spend TL tokens
            timestamp = await time.latest();
            payamounts = [1, 2, 3];
            payschedule = [timestamp + 10 * 60, timestamp + 15 * 60, timestamp + 25 * 60];
            url = "https://example.com";
            deadline = timestamp + 8 * 60;
            index++;
        });

        it("should allow a member to vote on a proposal", async () => {
            const voter = users[5];
            const voter2 = users[6];
            const projectOwner = users[7];
            // send myGov tokens to the users
            await myGov.connect(deployer).sendTokens(projectOwner.address, 10);
            await myGov.connect(deployer).sendTokens(voter.address, 10);
            await myGov.connect(deployer).sendTokens(voter2.address, 10);
            // approval from project owner to myGov
            await tlToken.connect(projectOwner).approve(await myGov.getAddress(), 4000);
            await myGov.connect(projectOwner).approve(await myGov.getAddress(), 4000);
            await gov.connect(projectOwner).submitProjectProposal(url, deadline, payamounts, payschedule);
            await gov.connect(voter).voteForProjectProposal(index, true);
            await gov.connect(voter2).voteForProjectProposal(index, false);
            // Check if the vote was recorded
            const votes = await getter.connect(projectOwner).getNumOfVotes(0);
            // Check if the vote was recorded
            expect(votes.yes).to.equal(1);
            expect(votes.no).to.equal(1);
        });
        it("should not allow voting after the deadline", async () => {
            const member = users[8];
            const projectOwner = users[9];
            // send myGov tokens to the users
            await myGov.connect(deployer).sendTokens(projectOwner.address, 10);
            await myGov.connect(deployer).sendTokens(member.address, 10);
            // approval from project owner to myGov
            await tlToken.connect(projectOwner).approve(await myGov.getAddress(), 4000);
            await myGov.connect(projectOwner).approve(await myGov.getAddress(), 5);
            await gov.connect(projectOwner).submitProjectProposal(url, deadline, payamounts, payschedule);

            // Move time to the deadline
            await time.increaseTo(deadline + 1);
            // Attempt to vote after the deadline
            await expect(
                gov.connect(member).voteForProjectProposal(index, true)
            ).to.be.revertedWith("GovFacet: Proposal vote deadline has passed");
        });
        it("should not allow a non-member to vote on a proposal", async () => {
            const nonMember = users[10];
            const projectOwner = users[11];
            // send myGov tokens to the users
            await myGov.connect(deployer).sendTokens(projectOwner.address, 10);
            // approval from project owner to myGov
            await tlToken.connect(projectOwner).approve(await myGov.getAddress(), 4000);
            await myGov.connect(projectOwner).approve(await myGov.getAddress(), 5);

            await gov.connect(projectOwner).submitProjectProposal(url, deadline, payamounts, payschedule);

            await expect(
                gov.connect(nonMember).voteForProjectProposal(index, true)
            ).to.be.revertedWith("GovFacet: Caller is not a member (zero MyGovToken balance)");
        });
        it("should not allow a member to vote on a proposal more than once", async () => {
            const voter = users[12];
            const projectOwner = users[13];
            // send myGov tokens to the users
            await myGov.connect(deployer).sendTokens(projectOwner.address, 10);
            await myGov.connect(deployer).sendTokens(voter.address, 10);
            // approval from project owner to myGov
            await tlToken.connect(projectOwner).approve(await myGov.getAddress(), 4000);
            await myGov.connect(projectOwner).approve(await myGov.getAddress(), 5);
            await gov.connect(projectOwner).submitProjectProposal(url, deadline, payamounts, payschedule);
            // Vote for the first time
            await gov.connect(voter).voteForProjectProposal(index, true);

            await expect(
                gov.connect(voter).voteForProjectProposal(index, false)
            ).to.be.revertedWith("GovFacet: Already voted on proposal");
        });
        it("should not allow a member to vote on a non-existent proposal", async () => {
            const voter = users[14];
            myGov.connect(voter).faucet();
            // Attempt to vote on a non-existent proposal
            await expect(
                gov.connect(voter).voteForProjectProposal(999, true)
            ).to.be.revertedWith("GovFacet: Project doesn't exist");
            index--;
        });
        it("should allow a member to delegate their vote to another member", async () => {
            const delegator = users[15];
            const delegatee = users[16];
            const projectOwner = users[17];
            // send myGov tokens to the users
            await myGov.connect(deployer).sendTokens(projectOwner.address, 10);
            await myGov.connect(deployer).sendTokens(delegator.address, 10);
            await myGov.connect(deployer).sendTokens(delegatee.address, 10);
            // approval from project owner to myGov
            await tlToken.connect(projectOwner).approve(await myGov.getAddress(), 4000);
            await myGov.connect(projectOwner).approve(await myGov.getAddress(), 5);

            await gov.connect(projectOwner).submitProjectProposal(url, deadline, payamounts, payschedule);

            // Delegate vote
            await gov.connect(delegator).delegateVoteTo(delegatee.address, index);
            await gov.connect(delegatee).voteForProjectProposal(index, true);

            let votes = await getter.connect(projectOwner).getNumOfVotes(index);
            expect(votes.yes).to.equal(2);
        });
        it("should not allow a member to delegate their vote to a non-member", async () => {
            const delegator = users[18];
            const delegatee = users[19];
            const projectOwner = users[20];
            // send myGov tokens to the users
            await myGov.connect(deployer).sendTokens(projectOwner.address, 10);
            await myGov.connect(deployer).sendTokens(delegator.address, 10);
            // approval from project owner to myGov
            await tlToken.connect(projectOwner).approve(await myGov.getAddress(), 4000);
            await myGov.connect(projectOwner).approve(await myGov.getAddress(), 5);

            await gov.connect(projectOwner).submitProjectProposal(url, deadline, payamounts, payschedule);

            // Attempt to delegate vote to a non-member
            await expect(
                gov.connect(delegator).delegateVoteTo(delegatee.address, index)
            ).to.be.revertedWith("GovFacet: Delegatee is not a member");
        });
        it("should not allow a member to delegate their vote on a non-existent proposal", async () => {
            const delegator = users[21];
            const delegatee = users[22];

            await myGov.connect(deployer).sendTokens(delegator.address, 10);
            // Attempt to delegate vote on a non-existent proposal
            await expect(
                gov.connect(delegator).delegateVoteTo(delegatee.address, 999)
            ).to.be.revertedWith("GovFacet: Project doesn't exist");
            index--;
        });
        it("should not allow a member to delegate their vote more than once", async () => {
            const delegator = users[23];
            const delegatee = users[24];
            const projectOwner = users[25];
            // send myGov tokens to the users
            await myGov.connect(deployer).sendTokens(projectOwner.address, 10);
            await myGov.connect(deployer).sendTokens(delegator.address, 10);
            await myGov.connect(deployer).sendTokens(delegatee.address, 10);
            // approval from project owner to myGov
            await tlToken.connect(projectOwner).approve(await myGov.getAddress(), 4000);
            await myGov.connect(projectOwner).approve(await myGov.getAddress(), 5);

            await gov.connect(projectOwner).submitProjectProposal(url, deadline, payamounts, payschedule);

            // Delegate vote for the first time
            await gov.connect(delegator).delegateVoteTo(delegatee.address, index);

            // Attempt to delegate again
            await expect(
                gov.connect(delegator).delegateVoteTo(delegatee.address, index)
            ).to.be.revertedWith("GovFacet: Already delegated vote for this project");
        });
        it("should not allow a member to delegate their vote to themselves", async () => {
            const delegator = users[26];
            const projectOwner = users[27];
            // send myGov tokens to the users
            await myGov.connect(deployer).sendTokens(projectOwner.address, 10);
            await myGov.connect(deployer).sendTokens(delegator.address, 10);
            // approval from project owner to myGov
            await tlToken.connect(projectOwner).approve(await myGov.getAddress(), 4000);
            await myGov.connect(projectOwner).approve(await myGov.getAddress(), 5);

            await gov.connect(projectOwner).submitProjectProposal(url, deadline, payamounts, payschedule);

            // Attempt to delegate vote to themselves
            await expect(
                gov.connect(delegator).delegateVoteTo(delegator.address, index)
            ).to.be.revertedWith("GovFacet: Cannot delegate to self through a chain");
        });
        it("should not allow a member to delegate their vote that they already used", async () => {
            const delegator = users[28];
            const delegatee = users[29];
            const projectOwner = users[30];
            // send myGov tokens to the users
            await myGov.connect(deployer).sendTokens(projectOwner.address, 10);
            await myGov.connect(deployer).sendTokens(delegator.address, 10);
            await myGov.connect(deployer).sendTokens(delegatee.address, 10);
            // approval from project owner to myGov
            await tlToken.connect(projectOwner).approve(await myGov.getAddress(), 4000);
            await myGov.connect(projectOwner).approve(await myGov.getAddress(), 5);

            await gov.connect(projectOwner).submitProjectProposal(url, deadline, payamounts, payschedule);

            // Vote for the first time
            await gov.connect(delegator).voteForProjectProposal(index, true);

            // Attempt to delegate after voting
            await expect(
                gov.connect(delegator).delegateVoteTo(delegatee.address, index)
            ).to.be.revertedWith("GovFacet: Already voted, cannot delegate");
        });
        it("should allow a member to vote for payment of a project", async () => {
            const voter = users[31];
            const projectOwner = users[32];
            // send myGov tokens to the users
            await myGov.connect(deployer).sendTokens(projectOwner.address, 10);
            await myGov.connect(deployer).sendTokens(voter.address, 10);
            // approval from project owner to myGov
            await tlToken.connect(projectOwner).approve(await myGov.getAddress(), 4000);
            await myGov.connect(projectOwner).approve(await myGov.getAddress(), 5);
            deadline = await time.latest() + 60;
            payschedule = [deadline + 30 * 60, timestamp + 40 * 60, timestamp + 55 * 60];
            await gov.connect(projectOwner).submitProjectProposal(url, deadline, payamounts, payschedule);
            await gov.connect(voter).voteForProjectProposal(index, true);
            // make time travel to the payment schedule
            await time.increaseTo(payschedule[0] - 30);
            // set block timestamp to 30 seconds in the future
            await gov.connect(projectOwner).reserveProjectGrant(index);
            ;
            // Vote for payment
            await gov.connect(voter).voteForProjectPayment(index, true);

            // Check if the payment was recorded
            const paymentVotes = await getter.connect(projectOwner).getNumOfVotesPayment(index);
            expect(paymentVotes.yes).to.equal(1);
        });
        it("should allow project owner to reserve project grant", async () => {
            const projectOwner = users[33];
            const voter = users[34];
            // send myGov tokens to the users
            await myGov.connect(deployer).sendTokens(projectOwner.address, 10);
            await myGov.connect(deployer).sendTokens(voter.address, 10);
            // approval from project owner to myGov
            await tlToken.connect(projectOwner).approve(await myGov.getAddress(), 4000);
            await myGov.connect(projectOwner).approve(await myGov.getAddress(), 5);

            await gov.connect(projectOwner).submitProjectProposal(url, deadline, payamounts, payschedule);
            await gov.connect(voter).voteForProjectProposal(index, true);
            // Reserve project grant
            let numberOfFundedProjects = await getter.getNoOfFundedProjects();
            await time.increaseTo(payschedule[0] - 30);
            await gov.connect(projectOwner).reserveProjectGrant(index);
            // Check if the project grant was reserved
            expect(await getter.getNoOfFundedProjects() - numberOfFundedProjects).to.equal(1);
        });
        it("should allow project owner to withdraw the payment on the schedule", async () => {
            const projectOwner = users[35];
            const voter = users[36];
            // send myGov tokens to the users
            await myGov.connect(deployer).sendTokens(projectOwner.address, 10);
            await myGov.connect(deployer).sendTokens(voter.address, 10);
            // approval from project owner to myGov
            await tlToken.connect(projectOwner).approve(await myGov.getAddress(), 4000);
            await myGov.connect(projectOwner).approve(await myGov.getAddress(), 5);

            await gov.connect(projectOwner).submitProjectProposal(url, deadline, payamounts, payschedule);
            await gov.connect(voter).voteForProjectProposal(index, true);
            // Reserve project grant
            await time.increaseTo(deadline + 30);
            await gov.connect(projectOwner).reserveProjectGrant(index);
            // Withdraw payment
            await gov.connect(voter).voteForProjectPayment(index, true);

            await time.increaseTo(payschedule[0] - 1);
            const balanceBefore = await tlToken.balanceOf(projectOwner.address);
            await gov.connect(projectOwner).withdrawProjectTLPayment(index);

            // Check if the payment was withdrawn
            expect(await (tlToken.balanceOf(projectOwner.address)) - balanceBefore).to.equal(payamounts[0]);
        });
        it("should update the project as not eligible for payment if rate of yes to member becomes less than 1%", async () => {
            const projectOwner = users[37];
            const voter = users[38];
            // send myGov tokens to the users
            await myGov.connect(deployer).sendTokens(projectOwner.address, 10);
            await myGov.connect(deployer).sendTokens(voter.address, 10);
            // approval from project owner to myGov
            await tlToken.connect(projectOwner).approve(await myGov.getAddress(), 4000);
            await myGov.connect(projectOwner).approve(await myGov.getAddress(), 5);

            await gov.connect(projectOwner).submitProjectProposal(url, deadline, payamounts, payschedule);
            await gov.connect(voter).voteForProjectProposal(index, true);
            await time.increaseTo(deadline + 20);
            // Reserve project grant
            await gov.connect(projectOwner).reserveProjectGrant(index);
            // Vote for payment
            await gov.connect(voter).voteForProjectPayment(index, true);

            await time.increaseTo(payschedule[0] - 1);
            // Check if the project is eligible for payment
            expect(await getter.getProjectEligibleForPayment(index)).to.be.true;
            // hundret of faucet users to make them member and lower the yes to member ratio
            for (let i = 0; i < 100; i++) {
                const faucetUser = users[i + 39];
                await myGov.connect(faucetUser).faucet();
            }
            // check if the project is not eligible for payment
            await time.increaseTo(payschedule[1] - 1);
            expect(await getter.getProjectEligibleForPayment(index)).to.be.false;
        });
    });
    describe("Donation Functionality", function () {
        let donationAmount: any;
        let projectOwner: any;
        let donator: any;
        let previousBalanceDonator: any;
        let previousBalanceMyGov: any;
        beforeEach(async () => {
            donator = users[141];
            // send myGov tokens to the users
            await myGov.connect(deployer).sendTokens(donator.address, 100);
            // approval from project owner to myGov
            await tlToken.connect(donator).approve(await myGov.getAddress(), 10000);
            await myGov.connect(donator).approve(await myGov.getAddress(), 100);
        });
        it("should allow a user to donate TL tokens", async () => {
            previousBalanceDonator = await tlToken.balanceOf(donator.address);
            previousBalanceMyGov = await tlToken.balanceOf(await myGov.getAddress());
            donationAmount = 4000;
            await donation.connect(donator).donateTLToken(donationAmount);

            // Check if the donation was successful
            expect(await tlToken.balanceOf(donator.address) - previousBalanceDonator).to.equal(-1 * donationAmount);
            expect(await tlToken.balanceOf(await myGov.getAddress()) - previousBalanceMyGov).to.equal(donationAmount);
        });
        it("should allow a user to donate MYGOV tokens", async () => {
            previousBalanceDonator = await myGov.balanceOf(donator.address);
            previousBalanceMyGov = await myGov.balanceOf(await myGov.getAddress());
            donationAmount = 10;
            await donation.connect(donator).donateMyGovToken(donationAmount);
            // Check if the donation was successful
            expect(previousBalanceDonator - await myGov.balanceOf(donator.address)).to.equal(donationAmount);
            expect((await myGov.balanceOf(await myGov.getAddress())) - previousBalanceMyGov).to.equal(donationAmount);
        });
        it("should not allow mygov balance to be less than 1 if user's voting power is active on a project", async () => {
            projectOwner = users[142];
            // send myGov tokens to the users
            await myGov.connect(deployer).sendTokens(projectOwner.address, 5);
            await myGov.connect(deployer).sendTokens(donator.address, 10);
            // approval from project owner to myGov
            await tlToken.connect(projectOwner).approve(await myGov.getAddress(), 4000);
            await myGov.connect(projectOwner).approve(await myGov.getAddress(), 5);

            await gov.connect(projectOwner).submitProjectProposal("url", await time.latest() + 60, [1, 2], [await time.latest() + 5 * 60, await time.latest() + 5 * 120]);
            await gov.connect(donator).voteForProjectProposal(13, true);
            donationAmount = await myGov.balanceOf(donator.address);
            await expect(
                donation.connect(donator).donateMyGovToken(donationAmount)
            ).to.be.revertedWith("DonationFacet: MyGovToken balance insufficient for donation amount");
        });
    });
    describe("Survey Functionality", function () {
        const weburl = "https://example.com";
        const surveydeadline = 2 * 60;
        const numchoices = 3;
        const atmostchoice = 2;
        // submiting survey requires 2 mygov and 1000 tl
        it("should allow a user to submit a survey", async () => {
            const surveyOwner = users[143];
            // send myGov tokens to the users
            await myGov.connect(deployer).sendTokens(surveyOwner.address, 10);
            // approval from project owner to myGov
            await tlToken.connect(surveyOwner).approve(await myGov.getAddress(), 1000);
            await myGov.connect(surveyOwner).approve(await myGov.getAddress(), 2);

            const tx = await survey.connect(surveyOwner).submitSurvey(weburl, await time.latest() + surveydeadline, numchoices, atmostchoice);
            // Check if the survey was submitted successfully
            const receipt = await tx.wait();
            const event = receipt.logs.find((log: any) => {
                try {
                    const parsedLog = survey.interface.parseLog(log);
                    return parsedLog && parsedLog.name === "SurveySubmitted";
                } catch {
                    return false;
                }
            });
            const parsedEvent = survey.interface.parseLog(event);
            const surveyid = parsedEvent.args.surveyid;

            expect(surveyid).to.equal(0);
        });
        it("should allow a user to take a survey", async () => {
            const surveyOwner = users[145];
            const surveyTaker = users[146];
            // send myGov tokens to the users
            await myGov.connect(deployer).sendTokens(surveyOwner.address, 10);
            await myGov.connect(deployer).sendTokens(surveyTaker.address, 10);
            // approval from project owner to myGov
            await tlToken.connect(surveyOwner).approve(await myGov.getAddress(), 1000);
            await myGov.connect(surveyOwner).approve(await myGov.getAddress(), 2);

            const tx = await survey.connect(surveyOwner).submitSurvey(weburl, await time.latest() + surveydeadline, numchoices, atmostchoice);
            const receipt = await tx.wait();

            const event = receipt.logs.find((log: any) => {
                try {
                    const parsedLog = survey.interface.parseLog(log);
                    return parsedLog && parsedLog.name === "SurveySubmitted";
                } catch {
                    return false;
                }
            });
            const parsedEvent = survey.interface.parseLog(event);
            const surveyid = parsedEvent.args.surveyid;
            await survey.connect(surveyTaker).takeSurvey(surveyid, [1, 2]);

            // Check if the survey was taken successfully
            const [numtaken, results] = await getter.getSurveyResults(surveyid);
            expect(numtaken).to.equal(1);
            expect(results.length).to.equal(numchoices);
        });
    });
});
