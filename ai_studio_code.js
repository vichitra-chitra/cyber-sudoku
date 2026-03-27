const boardElement = document.getElementById("sudoku-board");
const generateBtn = document.getElementById("generate-btn");
const checkBtn = document.getElementById("check-btn");
const difficultySelect = document.getElementById("difficulty");
const statusText = document.getElementById("status");

let solutionGrid =[];
let puzzleGrid =[];

// Initialize board UI
function createBoardUI() {
    boardElement.innerHTML = "";
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const input = document.createElement("input");
            input.type = "text";
            input.maxLength = 1;
            input.className = "cell";
            input.dataset.row = r;
            input.dataset.col = c;
            
            // Add bold borders for 3x3 grids
            if ((c + 1) % 3 === 0 && c !== 8) input.classList.add("border-right");
            if ((r + 1) % 3 === 0 && r !== 8) input.classList.add("border-bottom");

            // Allow only numbers 1-9
            input.addEventListener("input", (e) => {
                const val = e.target.value;
                if (!/^[1-9]$/.test(val)) {
                    e.target.value = "";
                } else {
                    e.target.classList.add("user-input");
                    e.target.classList.remove("error");
                }
            });

            boardElement.appendChild(input);
        }
    }
}

// Sudoku Generator Logic
function generateGrid() {
    let grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    fillGrid(grid);
    return grid;
}

function fillGrid(grid) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] === 0) {
                let nums =[1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
                for (let num of nums) {
                    if (isValid(grid, row, col, num)) {
                        grid[row][col] = num;
                        if (fillGrid(grid)) return true;
                        grid[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function isValid(grid, row, col, num) {
    for (let x = 0; x < 9; x++) {
        if (grid[row][x] === num || grid[x][col] === num) return false;
    }
    let startRow = Math.floor(row / 3) * 3;
    let startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[startRow + i][startCol + j] === num) return false;
        }
    }
    return true;
}

function removeNumbers(grid, difficulty) {
    let attempts = difficulty === "easy" ? 40 : difficulty === "medium" ? 51 : 62;
    // Easy leaves ~41 clues, Medium leaves ~30 clues, Hard leaves ~19 clues
    let puzzle = JSON.parse(JSON.stringify(grid));
    while (attempts > 0) {
        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);
        if (puzzle[row][col] !== 0) {
            puzzle[row][col] = 0;
            attempts--;
        }
    }
    return puzzle;
}

// Start Game
function startGame() {
    statusText.innerText = "Generating Matrix...";
    statusText.style.color = "var(--neon-cyan)";
    
    setTimeout(() => {
        solutionGrid = generateGrid();
        let difficulty = difficultySelect.value;
        puzzleGrid = removeNumbers(solutionGrid, difficulty);

        const inputs = document.querySelectorAll(".cell");
        inputs.forEach(input => {
            let r = input.dataset.row;
            let c = input.dataset.col;
            input.classList.remove("read-only", "user-input", "error");
            input.readOnly = false;
            
            if (puzzleGrid[r][c] !== 0) {
                input.value = puzzleGrid[r][c];
                input.readOnly = true;
                input.classList.add("read-only");
            } else {
                input.value = "";
            }
        });
        statusText.innerText = "Matrix Online. Good Luck.";
    }, 500); // small delay for UI animation effect
}

// Verify User Input against Solution
function checkSolution() {
    const inputs = document.querySelectorAll(".cell");
    let isComplete = true;
    let hasErrors = false;

    inputs.forEach(input => {
        let r = input.dataset.row;
        let c = input.dataset.col;
        if (!input.readOnly) {
            if (input.value === "") {
                isComplete = false;
            } else if (parseInt(input.value) !== solutionGrid[r][c]) {
                input.classList.add("error");
                hasErrors = true;
                isComplete = false;
            } else {
                input.classList.remove("error");
            }
        }
    });

    if (hasErrors) {
        statusText.innerText = "Anomalies detected. Check red cells.";
        statusText.style.color = "red";
    } else if (isComplete) {
        statusText.innerText = "System Bypassed! You win!";
        statusText.style.color = "var(--neon-magenta)";
    } else {
        statusText.innerText = "Logic holds so far. Continue.";
        statusText.style.color = "var(--neon-cyan)";
    }
}

// Event Listeners
generateBtn.addEventListener("click", startGame);
checkBtn.addEventListener("click", checkSolution);

// Initialize
createBoardUI();
startGame();