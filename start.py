import json
from flask import Flask, render_template, request
from etherpad_lite import EtherpadLiteClient
from flask_socketio import SocketIO, emit	# pip install flask-socketio
from watson_developer_cloud import AuthorizationV1
from watson_developer_cloud import SpeechToTextV1

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
def worker(token = None):
	authorization = AuthorizationV1(
	    username='1aa8c4e0-7be1-4a39-9316-50f5014dbda7',
	    password='jiBwnAiiMF3w'
	)

	token = authorization.get_token(url=SpeechToTextV1.default_url)
	return render_template('worker.html', token = token)

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
	# emit('response', {'data': 'Connected'})

@socketio.on('disconnect', namespace='/getpadusercount')
def test_disconnect():
    print('Client disconnected', request.sid)
    # emit('response', {'data': 'Disconnected'})

if __name__ == "__main__":
    # app.run(host='0.0.0.0')
    # app.run()
    socketio.run(app, debug=True, host='0.0.0.0')

