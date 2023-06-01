import React, { useState, useEffect } from "react";
import web3 from "./web3";
import lottery from "./lottery";

function App() {
  const [manager, setManager] = useState("");
  const [players, setPlayers] = useState([]);
  const [balance, setBalance] = useState("");
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [lastWinner, setLastWinner] = useState("");

  useEffect(() => {
    async function fetchData() {
      const manager = await lottery.methods.manager().call();
      const players = await lottery.methods.getPlayers().call();
      const balance = await web3.eth.getBalance(lottery.options.address);
      const lastWinner = await lottery.methods.lastWinner().call();
      setManager(manager);
      setPlayers(players);
      setBalance(balance);
      setLastWinner(lastWinner !== "0x0000000000000000000000000000000000000000" ? lastWinner : "No Winner Yet");
    }
    fetchData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setMessage("Waiting for transaction to complete...");
      const accounts = await web3.eth.getAccounts();
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei(value, "ether"),
      });
      const players = await lottery.methods.getPlayers().call();
      const balance = await web3.eth.getBalance(lottery.options.address);
      setPlayers(players);
      setBalance(balance);
      setMessage("Transaction completed successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Transaction failed. Please try again later.");
    }
  };

  const handleClick = async () => {
    try {
      setMessage("Picking a winner...");
      const accounts = await web3.eth.getAccounts();
      await lottery.methods.pickWinner().send({
        from: accounts[0],
      });
      const players = await lottery.methods.getPlayers().call();
      const balance = await web3.eth.getBalance(lottery.options.address);
      const lastWinner = await lottery.methods.lastWinner().call();
      setPlayers(players);
      setBalance(balance);
      setLastWinner(lastWinner);
      setMessage("A winner has been picked!");
    } catch (err) {
      console.error(err);
      setMessage("Error picking a winner. Please try again later.");
    }
  };

  return (
    <div>
      <h2>Lottery</h2>
      <p>Manager address: {manager}</p>
      <p>Current Players: {players.length}</p>
      <p>All Players Address: {players.join(", ")}</p>
      <p>Money to Win: {web3.utils.fromWei(balance, "ether")} ether!</p>

      <hr />

      <form onSubmit={handleSubmit}>
        <div>
          <h4>Want to try your luck?</h4>
          <label>Amount ether to enter</label>
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </div>
        <button>Enter</button>
      </form>

      <hr />

      <h4>Ready to pick a winner?</h4>
      <button onClick={handleClick}>Pick a winner!</button>

      <h4>{lastWinner} is the winner!</h4>

      <h1>{message}</h1>
    </div>
  );
}

export default App;
