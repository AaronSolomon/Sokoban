from flask import Flask, render_template, request
app = Flask(__name__)

@app.route('/')
def main():
    level = int(request.values.get('level', '1'))
    #board="  HHH\n  HDH\n  H HHHH\nHHHB BDH\nHD BW HH\nHHHHBHH\n   HDH\n   HHH\n"
    return render_template('sokoban.html', level=level, board=readBoard(level))

def readBoard(level):
    fn = 'Boards/map{:03}.txt'.format(level)
    with open(fn) as infile:
        s = infile.read()
    return s

if __name__ == "__main__":
    app.run(debug=True)

