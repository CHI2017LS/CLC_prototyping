import json
from flask import Flask, render_template, request
from etherpad_lite import EtherpadLiteClient
from flask_socketio import SocketIO, emit	# pip install flask-socketio

app = Flask(__name__)
app.config.update(
	TEMPLATES_AUTO_RELOAD = True
)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
thread = None

def background_thread():
    """Example of how to send server generated events to clients."""
    while True:
        socketio.sleep(3)
        data = getPadUsersCount()
        socketio.emit('response',
                      {'data': data}, namespace='/getpadusercount')

def getPadUsersCount():
	c = EtherpadLiteClient(base_params={'apikey':'f42591e743037bc39d530ba6b1550b0d558aed32f3e9f5e8f12cdeaa1a48b0cd'})
	padList = c.listAllPads()
	userCount = {}

	for ID in padList['padIDs']:
		userCount[ID] = c.padUsersCount(padID=ID)['padUsersCount']
	
	return json.dumps(userCount)

@app.route("/")
def index():
	return render_template('index.html')
@app.route("/menu")
def menu():
	return render_template('menu.html')

@app.route("/slides")
def slides():
	return render_template('slides.html')

@app.route("/worker")
def worker():
	return render_template('worker.html')

@app.route("/test")
def test():
	return render_template('test.html')	

@app.route("/createpad")
def createPad():
	id = request.args.get('padID')
	print(id)
	c = EtherpadLiteClient(base_params={'apikey':'f42591e743037bc39d530ba6b1550b0d558aed32f3e9f5e8f12cdeaa1a48b0cd'})
	padList = c.listAllPads()
	if id in padList['padIDs']:
		c.deletePad(padID=id)
	message = c.createPad(padID=id)
	message = c.setText(padID=id, text="")
	return json.dumps(message)

@app.route("/setText")
def pasteText(padID=None,text=None):
	text = request.args.get('text')
	padID = request.args.get('padID')
	c = EtherpadLiteClient(base_params={'apikey':'f42591e743037bc39d530ba6b1550b0d558aed32f3e9f5e8f12cdeaa1a48b0cd'})
	#padList = c.listAllPads()
	#padList['padIDs']['']
	message = c.appendText(padID=padID, text=text)
	return json.dumps(message)

@socketio.on('connect', namespace='/getpadusercount')
def test_connect():
	global thread
	if thread is None:
		thread = socketio.start_background_task(target=background_thread)
	emit('response', {'data': 'Connected'})

@socketio.on('disconnect', namespace='/getpadusercount')
def test_disconnect():
    print('Client disconnected', request.sid)
    emit('response', {'data': 'Disconnected'})

if __name__ == "__main__":
    # app.run(host='0.0.0.0')
    # app.run()
    socketio.run(app, debug=True)

