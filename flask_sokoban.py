from flask import Flask, render_template, request, redirect
from datetime import datetime
app = Flask(__name__)

@app.route('/')
def main():
    level = int(request.values.get('level', '1'))
    #msg = '<script>alert("Congratulations!");</script>'
    return render_template('sokoban.html', level=level, board=readBoard(level))

@app.route('/record-and-next', methods=['POST'])
def record():
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    level = int(request.values.get('level'))
    username = request.values.get('username')
    steps = request.values.get('steps')
    with open("best.csv", "a") as outfile:
        print(f"{now},{level},{username},{steps}", file=outfile)
    return redirect(f'/?level={level+1}')

def readBoard(level):
    fn = 'Boards/map{:03}.txt'.format(level)
    with open(fn) as infile:
        s = infile.read()
    return s

if __name__ == "__main__":
    app.run(debug=True)

