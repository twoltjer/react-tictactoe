import React from 'react';
import ReactDOM from 'react-dom';
import ComboBox from "react-widgets/ComboBox";
import './index.scss';
import "react-widgets//styles.css";
import x_small from './images/x_24x24.png';
import o_small from './images/o_24x24.png';

function Square(props) {
  // Used https://reactgo.com/react-images/ to learn about adding images in react
  if (props.value === null) {
    return (
      <button className="square" onClick={props.onClick} />
    );
  }

  let image = props.value === 'X' ? x_small : o_small;
  return (
    <button className="square" onClick={props.onClick}>
      <img src={image} alt={props.value} />
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  renderRow(i) {
    let squares = [];

    for (let col = 0; col < this.props.boardSize; col++) {
      squares.push(this.renderSquare(i * this.props.boardSize + col))
    }

    return (
      <div className="board-row">
        {squares}
      </div>
    );
  }

  render() {
    let rows = [];

    for (let row = 0; row < this.props.boardSize; row++) {
      rows.push(this.renderRow(row));
    }

    return (
      <div>
        {rows}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null)
        }
      ],
      stepNumber: 0,
      xIsNext: true,
      boardSize: 3
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  handleBoardSizeChange(newSize) {
    let size;
    if (newSize === '3x3') {
      size = 3;
    } else if (newSize === '4x4') {
      size = 4;
    } else if (newSize === '5x5') {
      size = 5;
    } else {
      alert("Invalid board size!");
    }
    this.setState({
      boardSize: size,
      history: [
        {
          squares: Array(size * size).fill(null)
        }
      ],
      stepNumber: 0,
      xIsNext: true,
    })
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={i => this.handleClick(i)}
            boardSize={this.state.boardSize}
          />
        </div>
        <div className="game-info">
          <ComboBox
            defaultValue="3x3"
            data={["3x3", "4x4", "5x5"]}
            onChange={value => this.handleBoardSizeChange(value)}
          />
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  let sideLength = Math.sqrt(squares.length);
  let lines = [];
  // Diagonals are described as they would be understood if drawing the board from top to bottom
  let leftToRightDiag = [];
  let rightToLeftDiag = [];
  for (let i = 0; i < sideLength; i++) {
    var row = [];
    var col = [];
    for (let j = 0; j < sideLength; j++) {
      // Row i will have indices of i * sideLength, i * sideLength + 1, etc
      row.push(i * sideLength + j);
      // Column i will have indices of i, i + sideLength, i + sideLength * 2, etc
      col.push(i + j * sideLength);
    }
    lines.push(row);
    lines.push(col);
    // 5x5 grid left-to-right diag will be 0, 6, 12, 18, 24
    leftToRightDiag.push(i * (sideLength + 1));
    // 5x5 grid right-to-left diag will be 4, 8, 12, 16, 20
    rightToLeftDiag.push((i + 1) * (sideLength - 1));
  }
  lines.push(leftToRightDiag);
  lines.push(rightToLeftDiag);

  for (let i = 0; i < lines.length; i++) {
    let possibleWinner = squares[lines[i][0]];
    if (possibleWinner) {
      let isWinner = true;
      for (let j = 1; j < sideLength; j++) {
        if (!(squares[lines[i][j]] === possibleWinner)) {
          isWinner = false;
        }
      }
      if (isWinner) {
        return possibleWinner;
      }
    }
  }
  return null;
}
