const chalk = require("chalk");
const prompt = require("prompt-sync")({ sigint: true });

const GAME_MESSAGES = {
  fall: "You've fallen into a hole of despair!",
  outOfBoundry: "Boundary breach detected.",
  win: "Congratulations! Hat's off to you.",
};
const HOLE_RATIO = 1 / 3;
const hat = "^";
const hole = "O";
const fieldCharacter = "░";
const pathCharacter = "*";

class Field {
  constructor(fieldArray) {
    this.fieldArray = fieldArray;
    this.userRow = 0;
    this.userCol = 0;
    this.gameOver = false;
    this.gameOverReason = "";
    this.gameWon = false;

    console.log(this.fieldArray);
    this.play();
  }

  play() {
    do {
      console.clear();
      this.print();
      this.updateGameStatus();

      let userChoice = prompt(
        chalk.blue(
          "which direction you wanna move?(use directional keys [A,W,S,D]) : "
        )
      );
      // sanatize user input
      userChoice = userChoice.trim().charAt(0).toUpperCase();
      if (userChoice) {
        this.moveUser(userChoice);
      }
    } while (!this.gameOver || !this.gameWon);
  }

  static generateField(height, width) {
    const area = height * width;
    const field = [];

    for (let i = 0; i < height; i++) {
      const row = [];
      for (let j = 0; j < width; j++) {
        row.push(fieldCharacter);
      }
      field[i] = row;
    }

    // dig holes
    let holes = Math.floor(area * HOLE_RATIO);

    while (holes > 0) {
      const row = Math.floor(Math.random() * height);
      const col = Math.floor(Math.random() * width);

      if (field[row][col] === fieldCharacter) {
        field[row][col] = hole;
        holes--;
      }
    }
    // user at (0,0)
    field[0][0] = pathCharacter;
    // place hat randomly on the field, at least in (1,1)
    const hatRow = Math.floor(Math.random() * (height - 1)) + 1;
    const hatCol = Math.floor(Math.random() * (width - 1)) + 1;
    field[hatRow][hatCol] = hat;

    return field;
  }

  moveUser(dirKey) {
    let userRow = this.userRow;
    let userCol = this.userCol;

    userRow =
      dirKey === "W" ? userRow - 1 : dirKey === "S" ? userRow + 1 : userRow;
    userCol =
      dirKey === "A" ? userCol - 1 : dirKey === "D" ? userCol + 1 : userCol;

    const rowOk = userRow >= 0 && userRow < this.fieldArray.length;
    const colOk = userCol >= 0 && userCol < this.fieldArray[0].length;

    if (!rowOk || !colOk) {
      this.gameOver = true;
      this.gameOverReason = GAME_MESSAGES.outOfBoundry;
    } else {
      // user falls in hole
      if (this.fieldArray[userRow][userCol] === hole) {
        this.gameOver = true;
        this.gameOverReason = GAME_MESSAGES.fall;
      }
      // user finds the hat
      if (this.fieldArray[userRow][userCol] === hat) {
        this.gameWon = true;
      }
      // update player location
      this.fieldArray[userRow][userCol] = pathCharacter;
      this.userRow = userRow;
      this.userCol = userCol;
    }
  }

  updateGameStatus() {
    if (this.gameOver) {
      console.log(chalk.redBright("Game Over! " + this.gameOverReason));
      process.exit(1);
    } else if (this.gameWon) {
      console.log(chalk.greenBright(GAME_MESSAGES.win));
      process.exit(1);
    }
  }

  print() {
    this.fieldArray.map((row) => {
      console.log(row.join(" "));
    });
  }
}

new Field(Field.generateField(8, 6));
