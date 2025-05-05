# TODO:
# 1. resize (especially on mobile phone)
# 2. group progress
# 3. Verify solution

from flask import Flask, render_template, request, redirect, make_response
from flask_mail import Mail, Message
from datetime import datetime
from urllib.parse import quote
app = Flask(__name__)

BEST_FILE = "Boards/best.csv"
PLAY_FILE = "play.csv"

@app.route('/')
def main():
    level = int(request.values.get('level', '1'))
    levelPlayed = int(request.cookies.get('levelPlayed', '1'))
    if level > levelPlayed:  # Users are disallowed to jump to levels
        level = levelPlayed  # which they haven't played
    try:
        board = readBoard(level)
        nBest = best.get(level, '---')
        port = request.environ.get('SERVER_PORT')
        remote = request.remote_addr
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        username = request.cookies.get('username', 'guest')
        with open(PLAY_FILE, "a") as outfile:
            print(f"{now},{level},{username},{port},{remote}", file=outfile)
        return render_template('sokoban.html', level=level, 
            best=nBest, board=readBoard(level))
    except FileNotFoundError:
        return render_template('allFinished.html')

@app.route('/record-and-next', methods=['POST'])
def record():
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    level = int(request.values.get('level'))
    username = request.values.get('username')
    steps = request.values.get('steps')
    response = make_response(redirect(f'/?level={level+1}'))
    if len(steps) > 0 and len(username) > 0:
        response.set_cookie('levelPlayed', str(level+1), max_age=86400*365)
        if level not in best or len(steps) < best[level]:
            msg = f'你破了第 {level} 關的最佳紀錄!'
            response.set_cookie('msg', quote(msg))  # Chinese must be encoded
            best[level] = len(steps)
            with open(BEST_FILE, "a") as outfile:
                print(f"{now},{level},{username},{steps}", file=outfile)
        elif len(steps) == best[level]:
            # Pass a message to JavaScript via cookie
            msg = f'你在第 {level} 關的表現和最佳紀錄一樣好.'
            response.set_cookie('msg', quote(msg))
    return response

def readBoard(level):
    fn = 'Boards/maze{:03}.txt'.format(level)
    with open(fn) as infile:
        s = infile.read()
    return s

def readBest(fn):
    d = {}
    try:
        with open(fn) as infile:
            for line in infile:
                ts, level, user, steps = line[:-1].split(',')
                level = int(level)
                if level not in d or len(steps) < d[level]:
                    d[level] = len(steps)
    except FileNotFoundError:
        print('No BEST_FILE exists.  A new file will be created.')
    return d

def notifyNewLevel(level):
    mail = Mail(app)
    msg = Message(f'[Sokoban] Level {level-1} is solved', \
        sender='solomon@kghs3.ncnu.net', \
        recipients=['solomon@2025.ipv6.club.tw'])
    msg.body = f'Please construct Level {level}.'
    # msg.html = 'This is the <b>HTML</b> body'
    with app.app_context():
        mail.send(msg)

# === Main Program ===
# === Initialization ===
best = readBest(BEST_FILE)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)

