const crypto = require("crypto");

class GameTable {
  constructor(moves) {
    this.table = this.generateTable(moves);
  }

  generateTable(moves) {
    const size = moves.length;
    const table = Array.from(Array(size + 1), () => Array(size + 1).fill("Draw"));

    for (let i = 1; i <= size; i++) {
      table[0][i] = moves[i - 1];
      table[i][0] = moves[i - 1];
    }

    for (let i = 1; i <= size; i++) {
      for (let j = 1; j <= size; j++) {
        const halfSize = Math.floor(size / 2);

        if (i === j) {
          table[i][j] = "Draw";
        } else if (j >= i + halfSize) {
          table[i][j] = "Win";
        } else {
          table[i][j] = "Lose";
        }
      }
    }

    return table;
  }

  getTable() {
    return this.table;
  }
}

class RandomGenerator {
  static generateRandomKey(length) {
    return crypto.randomBytes(Math.ceil(length / 8)).toString("hex");
  }

  static getRandomMove(moves) {
    return moves[Math.floor(Math.random() * moves.length)];
  }
}

class HMACGenerator {
  static generateHMAC(key, data) {
    const hmac = crypto.createHmac("sha256", key);
    hmac.update(data);
    return hmac.digest("hex");
  }
}

class Game {
  constructor(moves) {
    this.moves = moves;
    this.table = new GameTable(moves);
    this.randomKey = RandomGenerator.generateRandomKey(256);
  }

  displayHelp() {
    const table = this.table.getTable();
    console.log("Help:");
    for (let row of table) {
      console.log(row.join("\t"));
    }
  }

  playGame(userMove) {
    if (!this.moves.includes(userMove)) {
      console.log("Invalid move. Please choose one of the following moves:");
      console.log(this.moves.join(", "));
      return;
    }

    const computerMove = RandomGenerator.getRandomMove(this.moves);
    const hmac = HMACGenerator.generateHMAC(this.randomKey, userMove);

    console.log(`Your move: ${userMove}`);
    console.log(`Computer's move: ${computerMove}`);
    console.log(`HMAC: ${hmac}`);

    const userIndex = this.moves.indexOf(userMove) + 1;
    const computerIndex = this.moves.indexOf(computerMove) + 1;
    const result = this.table.getTable()[userIndex][computerIndex];

    if (result === "Win") {
      console.log("You win!");
    } else if (result === "Lose") {
      console.log("You lose!");
    } else {
      console.log("It's a draw!");
    }

    console.log(`Random key: ${this.randomKey}`);
  }
}

const args = process.argv.slice(2);

if (args.length < 3 || args.length % 2 === 0 || new Set(args).size !== args.length) {
  console.log("Error: Incorrect arguments. Please provide an odd number (>=3) of unique moves.");
  console.log("Example: node task.js Rock Paper Scissors");
} else {
  const moves = args;
  const game = new Game(moves);

  console.log("Welcome to the Rock-Paper-Scissors game!");
  console.log("Enter 'help' to see the game rules and moves.");
  console.log("Enter 'exit' to quit the game.");

  let userInput = "";

  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  readline.setPrompt("Your move: ");
  readline.prompt();

  readline.on("line", (input) => {
    userInput = input.trim();

    if (userInput === "exit") {
      console.log("Thanks for playing! Goodbye!");
      readline.close();
    } else if (userInput === "help") {
      game.displayHelp();
    } else {
      game.playGame(userInput);
    }

    readline.prompt();
  });
}
