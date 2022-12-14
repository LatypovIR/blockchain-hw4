const { expect } = require("chai");
const { Contract } = require("ethers");
const { ethers } = require('hardhat');
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Uniswap", function () {

    async function deployApple() {
        console.log('     -> Try to deploy Apple');
        let Apple = await ethers.getContractFactory('Apple');
        let apple = await Apple.deploy();
        console.log('     -> Success deployed Apple');
        return apple;
    }

    async function deployBanana() {
        console.log('     -> Try to deploy Banana');
        let Banana = await ethers.getContractFactory('Banana');
        let banana = await Banana.deploy();
        console.log('     -> Success deployed Banana');
        return banana;
    }

    async function getOwner() {
        console.log('     -> Try to getOwner');
        const [owner,] = await ethers.getSigners();
        console.log('     -> Success getOwner:', owner);
        return owner;
    }

    async function getSigner() {
        console.log('     -> Try to getSigner');
        const [_, signer,] = await ethers.getSigners();
        console.log('     -> Success getSigner:', owner);
        return signer;
    }

    async function deploy() {
        let apple = await deployApple();
        let banana = await deployBanana();
        const [owner, signer,] = await ethers.getSigners();
        return { apple, banana, owner, signer };
    }

    describe("Right owner", function () {
        it("Should success deploy apple", async function () {
            const [owner,] = await ethers.getSigners();
            const apple = await deployApple();
            expect(await apple.owner()).to.equal(owner.address);
        });
        it("Should success deploy banana", async function () {
            const [owner,] = await ethers.getSigners();
            const banana = await deployBanana();
            expect(await banana.owner()).to.equal(owner.address);
        });
    });

    describe("Deploy", function () {
        it("Should assign the total supply", async function () {
            const { apple, banana, owner } = await loadFixture(deploy);
            const appleSupply = await apple.totalSupply();
            const bananaSupply = await banana.totalSupply();
            const address = owner.address;
            expect(await apple.balanceOf(address) == appleSupply);
            expect(await banana.balanceOf(address) == bananaSupply);
        });
    });

    async function createUniswapPair(apple, banana, owner) {
        const IUniswapV2Factory = require('@uniswap/v2-core/build/IUniswapV2Factory.json');
        const uniswapV2FactoryAddress = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
        const IUniswapV2Pair = require('@uniswap/v2-core/build/IUniswapV2Pair.json');

        const appleAddress = apple.address;
        const bananaAddress = banana.address;

        console.log('      -> Uniswap factory contract on:', uniswapV2FactoryAddress);
        const factory = new Contract(uniswapV2FactoryAddress, IUniswapV2Factory.abi, owner);
        console.log('      -> Uniswap pair');
        const transaction = await factory.createPair(appleAddress, bananaAddress);
        const response = await transaction.wait();

        expect(response.events.length == 1, 'expect one pair');

        const args = response.events[0].args;

        expect(args.tokenA == appleAddress);
        expect(args.tokenB == bananaAddress);
        const pairAddress = args.pair;
        console.log('      -> Pair created on:', pairAddress);

        const uniswapPair = new Contract(pairAddress, IUniswapV2Pair.abi, owner);
        return {uniswapPair, pairAddress};
    }


    describe("Swap apple and banana", function () {
        it("After deployment swap should be completed", async function () {
            const { apple, banana, owner, signer } = await loadFixture(deploy);
            const {uniswapPair, pairAddress} = await createUniswapPair(apple, banana, owner);
            let [tokenA, tokenB] = apple.address < banana.address ? [apple, banana] : [banana, apple];

            const balanceA = 100;
            const balanceB = 10000;
            await tokenA.transfer(pairAddress, balanceA);
            await tokenB.transfer(pairAddress, balanceB);
            await uniswapPair.sync();

            const reserves = await uniswapPair.getReserves();
            expect(reserves.reserve0 == balanceA);
            expect(reserves.reserve1 == balanceB);
            expect(await tokenA.balanceOf(pairAddress) == balanceA);
            expect(await tokenB.balanceOf(pairAddress) == balanceB);
            console.log('      -> Liquidity created: reserves: ', balanceA, '--', balanceB);

            const swap = 10;
            console.log('      -> Transfer', swap);
            await tokenA.transfer(pairAddress, swap);
            console.log('      -> After swap check balance');
            expect(await tokenA.balanceOf(signer.address) == 0);
            expect(await tokenB.balanceOf(signer.address) == swap);
        });
    })
});