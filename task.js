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

  displayMenu() {
    console.log("Available moves:");
    this.moves.forEach((move, index) => {
        console.log(`${index + 1} - ${move}`);
    });
    console.log("0 - Exit");
  }

  playGame(selectedMoveIndex) {
    const userMove = this.moves[selectedMoveIndex - 1];
    const hmac = HMACGenerator.generateHMAC(this.randomKey, userMove);
  
    console.log(`HMAC key: ${hmac}\n`);
  
    const computerMove = RandomGenerator.getRandomMove(this.moves);
  
    console.log(`Your move: ${userMove}`);
    console.log(`Computer move: ${computerMove}`);
  
    const userIndex = selectedMoveIndex;
    const computerIndex = this.moves.indexOf(computerMove) + 1;
    const result = this.table.getTable()[userIndex][computerIndex];
  
    console.log(result === "Win" ? "You win!" : result === "Lose" ? "You lose!" : "It's a draw!");
    console.log(`HMAC: ${this.randomKey}`);
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
  console.log("Enter '?', 'help' to see the game rules and moves.");
  console.log(`HMAC key: ${game.randomKey}`);
  game.displayMenu();

  let userInput = "";

  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  readline.setPrompt("Your move: ");
  readline.prompt();

  readline.on("line", (input) => {
    userInput = input.trim();

    if (userInput === "0") {
      console.log("Thanks for playing! Goodbye!");
      readline.close();
      return;
    } else if (userInput === "?") {
      game.displayHelp();
    } else if (parseInt(userInput) >= 1 && parseInt(userInput) <= moves.length) {
      const selectedMoveIndex = parseInt(userInput);
      game.playGame(selectedMoveIndex);
      game.displayMenu(); 
    } else {
      console.log("Invalid input. Please enter a valid move number or 'exit'.");
      game.displayMenu();
    }
  
    if (userInput !== "exit") {
      readline.prompt();
    }
  });
}
