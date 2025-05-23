// Constants to denote directions
const S_LEFT = 1;
const S_UP = 2;
const S_DOWN = 3;
const S_RIGHT = 4;

// Variables to store touch start and end positions
let startX = 0;
let startY = 0;
let endX = 0;
let endY = 0;

let graphicMode = true;
let myBoard = readBoard(board) 
let steps = [];
if (graphicMode) {
  showBoard_G(myBoard);
} else { 
  showBoard_T(myBoard);
}
document.addEventListener('keydown', k);

// Check whether username is defined in cookie
const cookies = parseCookies(document.cookie);
let username;
if ('username' in cookies) {
  username = cookies.username;
  document.getElementById('username').innerHTML = username;
} else {
  username = purifyStr(prompt("Please input your username"));
  updateUsername(username);
}
document.getElementById('editUsername').addEventListener('click', editUsername);
// document.getElementById('zoomIn').addEventListener('click', zoomIn);
// document.getElementById('zoomOut').addEventListener('click', zoomOut);
// document.getElementById('scale').addEventListener('click', scale);

// Check whether the server sends a greeting message via cookie
if ('msg' in cookies) {
  alert(cookies.msg);
  // Delete the cookie 'msg'
  document.cookie = 'msg = delete; expires=Thu, 1 Jan 1970 00:00:00 UTC';
}

function purifyStr(s) {
  const punctuations = ' !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'
  for (const c of punctuations)
    s = s.replaceAll(c, '');
  return s;
}

function updateUsername(u) {
  username=u;
  document.getElementById('username').innerHTML = u;
  let d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  document.cookie = `username=${u}; expires = ${d.toUTCString()}`;
}

function editUsername () {
  // console.log("editUsername");
  username = purifyStr(prompt("Please input your username", username));
  updateUsername(username);
}
function parseCookies(cookieString) {   
    let cookies = {};
    cookieString.split(';').map( pair => {      
        const [key, value] = pair.split('=').map(x => x.trim());
        cookies[key] = decodeURIComponent(value);
    } );
    return cookies;
}



const boardArea = document.getElementById('boardArea');
// Add event listeners for touch events
boardArea.addEventListener("touchstart", (event) => {
    // Record the starting touch positions
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
});
boardArea.addEventListener("touchend", (event) => {
    // Record the ending touch positions
    endX = event.changedTouches[0].clientX;
    endY = event.changedTouches[0].clientY;

    // Detect the swipe direction
    detectSwipeDirection();
});
// Prevent scrolling during swipe
boardArea.addEventListener("touchmove",
  (event) => {
    event.preventDefault();
});

function readBoard(b) {
    const rows = b.board.split('\n');
    if (rows[rows.length-1] == '')
      rows.pop();
    const height = rows.length;
    let width = 0;
    let destinations = [];
    let worker;
    for (let i=0; i<height; ++i) {
        if (rows[i].length > width)
            width = rows[i].length;
        let row = '';
        for (let j=0; j<rows[i].length; ++j) {
            c = rows[i][j];
            switch (c) {
            case ' ':
                row += ' ';
                break;
            case '+':   // player on goal
                worker = { "row": i, "column": j };
                destinations.push( {"row": i, "column": j } );
                row += '@';
                break;
            case '@':
                worker = { "row": i, "column": j };
                row += c;
                break;
            case '.':
                destinations.push( {"row": i, "column": j } );
                row += ' ';
                break;
            case '*':   // box on goal
                destinations.push( {"row": i, "column": j } );
                row += '$';
                break;
            case '$':
            case '#':
                row += c;
                break;
            }
        }
        rows[i] = row;
    }
    result = {"level": b.level,
        "best": b.best,
        "board": rows,
        "height": height, "width": width, "worker": worker,
        "destinations": destinations
        };
    return result;
}

function showBoard_T(m) {
    chars = {
      ' ': { output_char: '&nbsp;', fg_color: 'white', bg_color: 'black' },
      '#': { output_char: '#', fg_color: 'green', bg_color: 'black' },// wall
      '@': { output_char: '@', fg_color: 'white', bg_color: 'black' },// player
      '$': { output_char: '$', fg_color: 'red', bg_color: 'black' },  // box
      '.': { output_char: ' ', fg_color: 'white', bg_color: 'cyan' }, // goal
      // No-break space U+00A0
      '*': { output_char: '$', fg_color: 'white', bg_color: 'cyan' },
      '+': { output_char: '@', fg_color: 'white', bg_color: 'cyan' },
    };
    let html = "<font id='font' face='Courier New' size=5>";
    const rows = m.board;
    let bg_color;
    for (let i=0; i<rows.length; ++i) {
        for (let j=0; j<rows[i].length; ++j) {
            let c = rows[i][j];
            let pos = {"row": i, "column": j};
            if (isGoal(m.destinations, pos)) {
              bg_color = 'cyan';
            } else {
              bg_color = 'black';
            }
            //if (c == '\n')
            //   html += '<br />\n';
            //else
               html += `<span style="color: ${chars[c].fg_color};
               background-color:
               ${bg_color};">${chars[c].output_char}</span>`;
        }
        if (rows[i].length < m.width) {
            html += `<span style="color: ${chars[' '].fg_color};
               background-color:
               ${chars[' '].bg_color};">` +
               '&nbsp;'.repeat(m.width - rows[i].length) +
               '</span>';
        }
        html += '<br />\n';
    }
    html += '</font>\n';
    // if (m.best == 0) {
    //    document.getElementById("best").innerHTML = "---";
    //} else {
    //   document.getElementById("best").innerHTML = m.best;
    //}
    document.getElementById("level").innerHTML = m.level;
    document.getElementById("boardArea").innerHTML = html;
}

function showBoard_G(m) {
    const PATH = '/static/';
    cell = {
      ' ': PATH+'blank.bmp',
      '#': PATH+'wall.bmp',
      '@': PATH+'worker.bmp',
      '+': PATH+'worker_at_dest.bmp',   // player on goal
      '$': PATH+'box.bmp',
      '.': PATH+'destination.bmp',
      '*': PATH+'arrival.bmp',          // box on goal
    };
    let html = "<P style='line-height: 0'>";
    const rows = m.board;
    let bg_color;
    for (let i=0; i<rows.length; ++i) {
        for (let j=0; j<rows[i].length; ++j) {
            let c = rows[i][j];
            let pos = {"row": i, "column": j};
            if (isGoal(m.destinations, pos)) {
                if (c == '$') {
                  c = '*';
                } else if (c == '@') {
                  c = '+';
                } else if (c == ' ') {
                  c = '.';
                }
            }
            html += `<img src='${cell[c]}'>`;
        }
        if (rows[i].length < m.width) {
            html += `<img src='${cell[' ']}'>`.repeat(m.width - rows[i].length);
        }
        html += '<br />\n';
    }
    html += '</p>\n';
    document.getElementById("level").innerHTML = m.level;
    document.getElementById("boardArea").innerHTML = html;
}

function k(e) {
    let font = document.getElementById('font');
    switch (e.key) {
    case '+':
        nSize = Number(font.size);
        if (nSize < 7)
            ++nSize;
        font.size = nSize;
        break;
    case '-':
        nSize = Number(font.size);
        if (nSize > 0)
            --nSize;
        font.size = nSize;
        break;
    case 't': // Toggle between text and graphic mod
        graphicMode = !graphicMode;
        if (graphicMode) {
          showBoard_G(myBoard);
        } else { 
          showBoard_T(myBoard);
        }
        break;
    case 'h':   // Left
    case 'ArrowLeft':
    case 'a':
        // console.log('Left');
        moveWorker(myBoard, S_LEFT);
        break;
    case 'l':   // Right
    case 'ArrowRight':
    case 'd':
        // console.log('Right');
        moveWorker(myBoard, S_RIGHT);
        break;
    case 'j':   // Down
    case 'ArrowDown':
    case 's':
        // console.log('Down');
        moveWorker(myBoard, S_DOWN);
        break;
    case 'k':   // Up
    case 'ArrowUp':
    case 'w':
        // console.log('Up');
        moveWorker(myBoard, S_UP);
        break;
    default:
        // alert("Illegal Key!");
        break;
    }
}

function moveWorker(b, d) {
  function nextToWorker(b, d) {
    const {row, column} = b.worker;     // Destructuring Assignment
    let c;
    switch (d) {
    case S_LEFT:
      c = b.board[row][column-1];
      break;
    case S_RIGHT:
      c = b.board[row][column+1];
      break;
    case S_UP:
      c = b.board[row-1][column];
      break;
    case S_DOWN:
      c = b.board[row+1][column];
      break;
    }
    return c;
  }

  function nextNextToWorker(b, d) {
    const {row, column} = b.worker;     // Destructuring Assignment
    let c;
    switch (d) {
    case S_LEFT:
      c = b.board[row][column-2];
      break;
    case S_RIGHT:
      c = b.board[row][column+2];
      break;
    case S_UP:
      c = b.board[row-2][column];
      break;
    case S_DOWN:
      c = b.board[row+2][column];
      break;
    }
    return c;
  }

  // Start of moveWorker(b, d)
  const message = document.getElementById('message');
  message.innerHTML = '';
  //const {row, column} = b.worker;     // Destructuring Assignment
  let i = b.worker.row;
  let j = b.worker.column;
  switch (d) {
  case S_RIGHT:
    if (nextToWorker(b, d) == ' ') {
       // b.board[i][j] = ' ';
       // However, JavaScript strings are immutable
       b.board[i] = subst(b.board[i], j, ' ');
       // b.board[i][j+1] = '@';
       b.board[i] = subst(b.board[i], j+1, '@');
       b.worker = { "row": i, "column": j+1 };
       steps.push('R');
    } else if (nextToWorker(b, d) == '$' &&
    nextNextToWorker(b, d) == ' ') {
       b.board[i] = b.board[i].slice(0, j) + ' @$' +
       b.board[i].slice(j+3);
       b.worker = { "row": i, "column": j+1 };
       steps.push('R');
    }
    break;
  case S_LEFT:
    if (nextToWorker(b, d) == ' ') {
       // b.board[i][j] = ' ';
       b.board[i] = subst(b.board[i], j, ' ');
       // b.board[i][j-1] = '@';
       b.board[i] = subst(b.board[i], j-1, '@');
       b.worker = { "row": i, "column": j-1 };
       steps.push('L');
    } else if (nextToWorker(b, d) == '$' &&
    nextNextToWorker(b, d) == ' ') {
       b.board[i] = b.board[i].slice(0, j-2) + '$@ ' +
       b.board[i].slice(j+1);
       b.worker = { "row": i, "column": j-1 };
       steps.push('L');
    }
    break;
  case S_UP:
    if (nextToWorker(b, d) == ' ') {
       // b.board[i][j] = ' ';
       b.board[i] = subst(b.board[i], j, ' ');
       // b.board[i-1][j] = '@';
       b.board[i-1] = subst(b.board[i-1], j, '@');
       b.worker = { "row": i-1, "column": j };
       steps.push('U');
    } else if (nextToWorker(b, d) == '$' &&
    nextNextToWorker(b, d) == ' ') {
       b.board[i-2] = subst(b.board[i-2], j, '$');
       b.board[i-1] = subst(b.board[i-1], j, '@');
       b.board[i  ] = subst(b.board[i  ], j, ' ');
       b.worker = { "row": i-1, "column": j };
       steps.push('U');
    }
    break;
  case S_DOWN:
    if (nextToWorker(b, d) == ' ') {
       // b.board[i][j] = ' ';
       b.board[i] = subst(b.board[i], j, ' ');
       // b.board[i+1][j] = '@';
       b.board[i+1] = subst(b.board[i+1], j, '@');
       b.worker = { "row": i+1, "column": j };
       steps.push('D');
    } else if (nextToWorker(b, d) == '$' &&
    nextNextToWorker(b, d) == ' ') {
       b.board[i  ] = subst(b.board[i  ], j, ' ');
       b.board[i+1] = subst(b.board[i+1], j, '@');
       b.board[i+2] = subst(b.board[i+2], j, '$');
       b.worker = { "row": i+1, "column": j };
       steps.push('D');
    }
    break;
  }
  if (graphicMode) {
    showBoard_G(myBoard);
  } else { 
    showBoard_T(myBoard);
  }
  document.getElementById('step').innerHTML = steps.length;
  if (allArrived(myBoard.board, myBoard.destinations)) {
    message.innerHTML = 'All boxes arrived.';
    document.getElementById('inputUsername').value = username;
    document.getElementById('inputSteps').value = steps.join('');
    const next = document.getElementById('next');
    next.style.backgroundColor = 'yellow';
    next.focus();
  }
}

function subst(s, i, c) {
    // s[i] = c
    // Because JavaScript strings are immutable, this function
    // helps to replace a character in s.
    let result = s.slice(0, i) + c + s.slice(i+1);
    if (i<0 || i>=s.length)
      result = '-'.repeat(s.length);
    return result;
}

function isGoal(dest, pos) {
    let match = false;
    for (let i=0; i<dest.length; ++i) {
      if (JSON.stringify(dest[i]) === JSON.stringify(pos))
        // Objects comparison returns true only when they
        // refer to the same object.
        match = true;
    }
    return match;
}

function allArrived(board, dest) {
  let all = true;
  for (let i=0; i<dest.length; ++i) {
    let {row, column} = dest[i];
    if (board[row][column] != '$')
      all = false; 
  }
  return all;
}

// Function to detect swipe direction
function detectSwipeDirection() {
    const deltaX = endX - startX;
    const deltaY = endY - startY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
            moveWorker(myBoard, S_RIGHT);
        } else {
            moveWorker(myBoard, S_LEFT);
        }
    } else {
        // Vertical swipe
        if (deltaY > 0) {
            moveWorker(myBoard, S_DOWN);
        } else {
            moveWorker(myBoard, S_UP);
        }
    }
}

function scale() {
  let m = myBoard;
  const rows = m.board;
  let width = window.innerWidth;
  // let height = window.innerHeight;
  let height = window.innerHeight - 32*2*4; // Some heights are for buttons
  let scale = Math.min( (width / 32 / m.width),
       (height / 32 / rows.length ) );    // BMP file is 32x32
  // let msg = "width:"+window.innerWidth + " height:" + window.innerHeight;
  // msg += "\nMap width:"+m.width+ " Height:"+m.height;
  // msg += "\nScale:" + scale;
  // alert(msg);
  return scale;
  // let width = window.innerWidth - 32*2;
  // alert("Width: " + width + " Height: " + height +
  // " Scale: " + scale +
  // " xScale: " + Math.floor(width / 32 / m.width) + " Height: " + 
  // Math.floor(height / 32 / rows.length ) );
}

/*
function zoomIn() {
  // document.body.style.zoom = "1.5";
  // let s = scale();
  // let msg = "Scale:" + s;
  // alert(msg);
  // Auto-resize
  // document.body.style.zoom = s;
    document.body.style.zoom += 0.1;
    console.log(document.body.style.zoom); 
}

function zoomOut() {
    document.body.style.zoom -= 0.1;
}
*/
