// UI functions

let rowsItems = {}
let colsItems = {}
let squaresItems = {}
const items = []
let selection = 0
let stepsTaken = []
let loadedBoard = ""

function n2r(n, size = 9) {
  return Math.floor(n / size)
}
function n2c(n, size = 9) {
  return n % size
}
function n2s(n) {
  return Math.floor(n2c(n) / 3) +
    (3 * (n2r(n2r(n), 3)))
}
function rc2n(r, c, size = 9) {
  return (r * size) + c
}

function rowItems(n) {
  if (rowsItems[n]) {
    return rowsItems[n]
  }
  let result = []
  for (let i = 0; i < 81; i++) {
    if (n2r(i) === n) {
      result.push(items[i])
    }
  }
  rowsItems[n] = result
  return result
}
function columnItems(n) {
  if (colsItems[n]) {
    return colsItems[n]
  }
  const result = []
  for (let i = 0; i < 81; i++) {
    if (n2c(i) === n) {
      result.push(items[i])
    }
  }
  colsItems[n] = result
  return result
}
function squareItems(n) {
  if (squaresItems[n]) {
    return squaresItems[n]
  }
  const result = []
  for (let i = 0; i < 81; i++) {
    if (n2s(i) === n) {
      result.push(items[i])
    }
  }
  squaresItems[n] = result
  return result
}

// UI functions
// item == HTML LI element
function setHighlighted(item) {
  item.dataset.highlighted = '1'
}
function unsetHighlighted(item) {
  delete item.dataset.highlighted
}
function setSelected(item) {
  item.dataset.selected = '1'
}
function unsetSelected(item) {
  delete item.dataset.selected
}
function setN(item, n) {
  if (item.dataset.locked) {
    return
  }
  if (n) {
    item.dataset.number = n
    stepsTaken.push(item)
  } else {
    delete item.dataset.number
  }
  computeAllHints()
  checkSolved()
}
function setHint(item, hint) {
  item.dataset['hint' + hint] = '1'
}
function unsetHint(item, hint) {
  delete item.dataset['hint' + hint]
}
function clearHighlight() {
  items.forEach(item => unsetHighlighted(item))
  items.forEach(item => unsetSelected(item))
}
function highlightItem(n) {
  clearHighlight()
  //selection = n
  //if (items[n].dataset.locked) {
  //  return
  //}
  selection = n
  rowItems(n2r(n)).forEach(item => setHighlighted(item))
  columnItems(n2c(n)).forEach(item => setHighlighted(item))
  squareItems(n2s(n)).forEach(item => setHighlighted(item))
  setSelected(items[n])
}
function moveSelection(x, y) {
  //let found = false
  let r = n2r(selection)
  let c = n2c(selection)
  //for (let i = 0; i < 9; i++) {
  r += x
  c += y
  if (r < 0 || r > 8 || c < 0 || c > 8) {
    return
  }
  //if (!items[rc2n(r, c)].dataset.locked) {
  //  found = true
  //break
  //}
  //}
  //if (found) {
  const n = rc2n(r, c)
  highlightItem(n)
  //}
}
function setAllHintsOf(n) {
  for (let i = 1; i < 10; i++) {
    setHint(items[n], i)
  }
}
function clearAllHintsOf(n) {
  for (let i = 1; i < 10; i++) {
    delete items[n].dataset['hint' + i]
  }
}
function clearAllHints() {
  for (let i = 0; i < 81; i++) {
    clearAllHintsOf(i)
  }
}
function computeAllHintsOf(n) {
  if (items[n].dataset.number) {
    clearAllHintsOf(n)
    return
  }
  const r = n2r(n)
  const c = n2c(n)
  const s = n2s(n)
  const rr = rowItems(r)
  const cc = columnItems(c)
  const ss = squareItems(s)
  const numbersSet = new Set([
    ...rr.map(item => item.dataset.number),
    ...cc.map(item => item.dataset.number),
    ...ss.map(item => item.dataset.number)
  ])
  setAllHintsOf(n)
  numbersSet.forEach(number => {
    unsetHint(items[n], number)
  })
}
function computeAllHints() {
  clearAllHints()
  for (let i = 0; i < 81; i++) {
    computeAllHintsOf(i)
  }
}
function undoMove() {
  if (stepsTaken.length > 0) {
    const item = stepsTaken.pop()
    setN(item, null)
    console.log(item)
    highlightItem(parseInt(item.dataset.id))
  }
}
function autoSolveSingles() {
  computeAllHints()
  let found = true
  while (found) {
    found = false
    items.forEach(item => {
      if (!item.dataset.locked && !item.dataset.number) {
        const hints = new Set()
        for (let i = 1; i < 10; i++) {
          if (item.dataset['hint' + i]) {
            hints.add(i)
          }
        }
        if (hints.size === 1) {
          setN(item, hints.values().next().value)
          found = true
        }
      }
    })
  }
}
function isCurrentBoardSolved() {
  for (let i = 0; i < 9; i++) {
    let s = new Set(rowItems(i).map(item => item.dataset.number))
    s.delete(undefined)
    if (s.size !== 9) {
      return false
    }
    s = new Set(columnItems(i).map(item => item.dataset.number))
    s.delete(undefined)
    if (s.size !== 9) {
      return false
    }
    s = new Set(squareItems(i).map(item => item.dataset.number))
    s.delete(undefined)
    if (s.size !== 9) {
      return false
    }
  }
  return true
}
function checkSolved() {
  if (isCurrentBoardSolved()) {
    clearHighlight()
    document.body.style.backgroundColor = '#bbffbb'
  } else {
    document.body.style.backgroundColor = '#ffffff'
  }
}

function boardAsString() {
  let s = ''
  items.forEach(item => {
    s += (item.dataset.number || 0)
  })
  return s
}
function clear() {
  rowsItems = {}
  colsItems = {}
  squaresItems = {}
  selection = null
  clearHighlight()
  stepsTaken = []
  for (let i = 0; i < 81; i++) {
    delete items[i].dataset.locked
    delete items[i].dataset.number
  }
  setN(items[0], null)
}

// fill grid from string containing 81 chars
function load(s) {
  clear()
  loadedBoard = s
  for (let i = 0; i < 81; i++) {
    if (s[i] !== '0') {
      items[i].dataset.number = s[i]
      items[i].dataset.locked = '1'
    } else {
      delete items[i].dataset.number
      delete items[i].dataset.locked
    }
  }
  highlightItem(0)
  computeAllHints()
  checkSolved()
}

// event handlers for UI elements
document.body.addEventListener('keyup', e => {
  e.preventDefault()
  if (e.code === 'Space') {
    autoSolveSingles()
    return
  } else if (e.code === 'Backspace') {
    undoMove()
    return
  } else if (e.code === 'KeyG') {
    let num = parseInt(prompt("HOW MANY CLUES DO YOU WANT?\n\nEasiest: 47+\nEasy: 36-46\n"
      + "Medium: 32-35\nHard: 28-31\nExtremely hard: 21-27\n", 30))
    if (!isNaN(num)) {
      if (num < 21 || num > 81) {
        alert("Please enter an integer between 21 and 81.")
      } else {
        //TODO generate
        load(create(num))
      }
    }
    return
  } else if (e.code === 'KeyS') {
    let s = boardAsString()
    prompt("Copy and store current board:", s)
    return
  } else if (e.code === 'KeyR') {
    if (confirm("Revert to loaded?")) {
      load(loadedBoard)
    }
    return
  } else if (e.code === 'KeyH') {
    toggleHints()
    return
  } else if (e.code === 'KeyL') {
    let s = prompt('Enter new board as string of 81 digits:')
    if (s) {
      load(s)
    }
    return
  }
  if (selection === null) {
    return
  }
  const item = items[selection]
  //if (item.dataset.locked) {
  //  return
  //}
  if (e.code === 'Escape') {
    setN(item, null)
    return
  } else if (e.code.startsWith('Digit')) {
    const n = e.code.substr(5)
    if (n === '0') {
      setN(item, null)
      return
    }
    setN(item, n)
    return
  } else if (e.code.startsWith('Numpad')) {
    const n = parseInt(e.code.substr(6))
    if (!isNaN(n) && n != '0') {
      setN(item, n)
      return
    } else {
      setN(item, null)
    }
    return
  } else if (e.code === 'ArrowUp') {
    moveSelection(-1, 0)
    return
  } else if (e.code === 'ArrowDown') {
    moveSelection(1, 0)
    return
  } else if (e.code === 'ArrowLeft') {
    moveSelection(0, -1)
    return
  } else if (e.code === 'ArrowRight') {
    moveSelection(0, 1)
    return
  } else if (e.code === 'Enter') {
    let s = document.getElementById("help").style
    s.display = s.display == "none" ? "block" : "none"
    return
  } else {
    console.log(e.code)
    return
  }
})

let hintCSS
let showHints = false
function toggleHints() {
  const color = showHints ? '#999999' : 'transparent'
  showHints = !showHints
  if (!hintCSS) {
    for (let i = 0; i < document.styleSheets.length; i++) {
      const styleSheet = document.styleSheets[i]
      for (let j = 0; j < styleSheet.cssRules.length; j++) {
        const rule = styleSheet.cssRules[j]
        if (rule.selectorText === '.hint') {
          hintCSS = rule.styleMap
        }
      }
    }
  }
  if (hintCSS) {
    hintCSS.set('color', color)
  }
}

// initialize UI
const grid = document.getElementById('grid')
for (let i = 0; i < 81; i++) {
  const e = document.createElement('li')
  e.dataset.id = i

  //for (let j = 1; j < 10; j++) {
  for (let j of [7, 8, 9, 4, 5, 6, 1, 2, 3]) {
    const e2 = document.createElement('span')
    e2.className = 'hint'
    e2.innerHTML = j
    e2.addEventListener('click', (e) => {
      highlightItem(i)
    })
    e.appendChild(e2)
  }

  grid.appendChild(e)
  items.push(e)
  e.addEventListener('click', (e) => {
    highlightItem(i)
  })
}

load(create(30))

// Sudoku generator and solver - not related to UI
// rondomly shuffle an array
function shuffle(array) {
  let currentIndex = array.length; let randomIndex

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]]
  }

  return array
}
// shuffled indices from 0 to 80
function shuffledIndices() {
  const result = [...Array(81).keys()]
  shuffle(result)
  return result
}
// index to coordinates
function i2rc(index) {
  return { row: index / 9 | 0, col: index % 9 }
}
// coordinates to index
function rc2i(row, col) {
  return row * 9 + col
}
// digit to byte
function d2b(digit) {
  return 1 << (digit - 1)
}
// byte to digit
function b2d(byte) {
  let i
  for (i = 0; byte; byte >>= 1, i++);
  return i
}
// byte to digits array
function b2ds(byte) {
  const digits = []
  for (let i = 1; byte; byte >>= 1, i++) { if (byte & 1) digits.push(i) }
  return digits
}
// string to binary encoded board
function s2b(str) {
  return str.split('').map(c => c === '0' ? 0 : d2b(parseInt(c)))
}
// binary encoded board to string
function b2s(values) {
  return values.map(b2d).join('')
}
// possible moves for cell of binary encoded board
function getMoves(board, index) {
  const { row, col } = i2rc(index)
  const r1 = 3 * (row / 3 | 0)
  const c1 = 3 * (col / 3 | 0)
  let moves = 0
  for (let r = r1, i = 0; r < r1 + 3; r++) {
    for (let c = c1; c < c1 + 3; c++, i++) {
      moves |= board[rc2i(r, c)] |
        board[rc2i(row, i)] |
        board[rc2i(i, col)]
    }
  }
  return moves ^ 511
}
// check for uniqueness of given move, value must be binary encoded
function unique(allowed, index, value) {
  const { row, col } = i2rc(index)
  const r1 = 3 * (row / 3 | 0)
  const c1 = 3 * (col / 3 | 0)
  let ir = 9 * row
  let ic = col
  let uniqRow = true; let uniqCol = true; let uniqSquare = true
  for (let r = r1; r < r1 + 3; ++r) {
    for (let c = c1; c < c1 + 3; ++c, ++ir, ic += 9) {
      if (uniqSquare) {
        const i = rc2i(r, c)
        if (i !== index && allowed[i] & value) uniqSquare = false
      }
      if (uniqRow) {
        if (ir !== index && allowed[ir] & value) uniqRow = false
      }
      if (uniqCol) {
        if (ic !== index && allowed[ic] & value) uniqCol = false
      }

      if (!(uniqSquare || uniqRow || uniqCol)) return false
    }
  }
  return true // uniqRow || uniqCol || uniqSquare;
}
// suggests the best move for given binary encoded board
function analyze(board) {
  const allowed = board.map((x, i) => x ? 0 : getMoves(board, i))
  let bestIndex; let bestLen = 100
  for (const i of shuffledIndices()) {
    if (!board[i]) {
      let moves = allowed[i]
      let len = 0
      for (let m = 1; moves; m <<= 1) {
        if (moves & m) {
          ++len
          if (unique(allowed, i, m)) {
            allowed[i] = m
            len = 1
            break
          }
          moves ^= m
        }
      }
      if (len < bestLen) {
        bestLen = len
        bestIndex = i
        if (!bestLen) break
      }
    }
  }
  return {
    index: bestIndex,
    moves: allowed[bestIndex],
    len: bestLen,
    allowed
  }
}
// backtracking with some tweaks
function solve(board, solutions, limit = 1) {
  let { index, moves } = analyze(board)
  if (index == null) {
    solutions.add(b2s(board))
    return true
  }
  for (let m = 1; moves; m <<= 1) {
    if (moves & m) {
      board[index] = m
      if (solve(board, solutions, limit)) {
        if (solutions.size >= limit) {
          return true
        }
      }
      moves ^= m
    }
  }
  board[index] = 0
  return false
}

// create a puzzle
// levels (for now) are decided by number of clues left to player
// which is wrong according to i.e. https://www.sudokuoftheday.com/difficulty
// Easiest: more than 46 clues
// Easy: 36-46 clues
// Medium: 32-35 clues
// Hard: 28-31
// Extremely hard: 17-27
function create(clues = 50) {
  let done = false
  let solutions
  let board

  solutions = new Set()
  while (!done) {
    board = Array(81).fill(0)
    solve(board, solutions, 1)
    const indices = shuffledIndices()
    let remainingCells = 81

    while (remainingCells > clues && indices.length) {
      solutions = new Set()
      const cell = indices.pop()
      const oldVal = board[cell]
      board[cell] = 0
      solve(Array.from(board), solutions, 2)
      if (solutions.size === 1) {
        remainingCells--
      } else {
        board[cell] = oldVal
      }
    }
    if (remainingCells === clues) {
      done = true
    }
  }
  let result = ''
  if (done) {
    result = b2s(board)
  }
  return result
}
