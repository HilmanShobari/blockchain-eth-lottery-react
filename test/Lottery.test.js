const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const { abi, evm } = require('../compile');

let accounts;
let lottery;

beforeEach(async () => {
  /*get list of all accounts */
  accounts = await web3.eth.getAccounts();

  // use one of those accounts to deploy the contract
  lottery = await new web3.eth.Contract(abi)
  .deploy({data: evm.bytecode.object})
  .send({from: accounts[0], gas: '1000000'});
});

describe('Lottery', () => {
  it('deployed a contract', () => {
    assert.ok(lottery.options.address);
  });

  it('allows one account to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });

    const players = await lottery.methods.getPlayers().call();
    
    assert.equal(1, players.length);
    assert.equal(players[0], accounts[0]);
  });

  it('allows multiple accounts to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.02', 'ether')
    });
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.02', 'ether')
    });

    const players = await lottery.methods.getPlayers().call();
    
    assert.equal(3, players.length);
    assert.equal(players[0], accounts[0]);
    assert.equal(players[1], accounts[1]);
    assert.equal(players[2], accounts[2]);
  });

  it('requires minimum ether to enter', async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 0          
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('require manager to pick winner', async () => {
    try {     
      await lottery.methods.pickWinner().send({
        from: accounts[1],
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('pick a winner and reset the players', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('2', 'ether')
    });

    const initialBalance = await web3.eth.getBalance(accounts[0]);

    await lottery.methods.pickWinner().send({
      from: accounts[0],
    });

    const finalBalance = await web3.eth.getBalance(accounts[0]);
    const difference = finalBalance - initialBalance;
    const players = await lottery.methods.getPlayers().call();

    console.log(initialBalance, finalBalance, difference);
    
    assert(difference > web3.utils.toWei('1.8', 'ether'));
    assert(players.length == 0);

  })
});


