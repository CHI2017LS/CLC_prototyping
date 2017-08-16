import json
from flask import Flask, render_template, request
from etherpad_lite import EtherpadLiteClient
from watson_developer_cloud import AuthorizationV1
from watson_developer_cloud import SpeechToTextV1
from OpenSSL import SSL
 
import os
 
context = SSL.Context(SSL.SSLv23_METHOD)
cer = os.path.join('/etc/letsencrypt/live/chi17-lanbridge.com/cert.pem')
key = os.path.join('/etc/letsencrypt/live/chi17-lanbridge.com/privkey.pem')


app = Flask(__name__)
app.config.update(
	TEMPLATES_AUTO_RELOAD = True
)
app.config['SECRET_KEY'] = 'secret!'

@app.route("/")
def login():
	return render_template('login.html')

@app.route("/index")
def index():
	return render_template('index.html')

@app.route("/menu")
def menu():
	return render_template('menu.html')

@app.route("/slides")
def slides():
	return render_template('slides.html')

@app.route("/worker")
# use Google API
def worker():
	return render_template('worker_Google.html')

@app.route("/test")
def test():
	return render_template('test.html')	

@app.route("/test_google_api")
def test_google_api():
	return render_template('test_google_api.html')	

@app.route("/worker2")
# use IBM API
def worker2(token = None):
	authorization = AuthorizationV1(
	    username='340ed380-e330-439f-b7e8-1383e16367e8',
	    password='HzoBlN2H5dEX'
	)

	token = authorization.get_token(url=SpeechToTextV1.default_url)
	return render_template('worker_IBM.html', token = token)


@app.route("/createpad")
def createPad():
	id = request.args.get('padID')
	text = request.args.get('text')
	print(id)
	c = EtherpadLiteClient(base_params={'apikey':'8b370ace91baa8557c685d75d70a6c2005e19761a5cf55a83611c3773d3d4c38'})
	padList = c.listAllPads()
	if id in padList['padIDs']:
		c.deletePad(padID=id)
	message = c.createPad(padID=id)
	message = c.setText(padID=id, text=text)
	return json.dumps(message)

@app.route("/setText")
def pasteText(padID=None,text=None):
	text = request.args.get('text')
	padID = request.args.get('padID')
	c = EtherpadLiteClient(base_params={'apikey':'8b370ace91baa8557c685d75d70a6c2005e19761a5cf55a83611c3773d3d4c38'})
	#padList = c.listAllPads()
	#padList['padIDs']['']
	message = c.appendText(padID=padID, text=text)
	return json.dumps(message)


if __name__ == "__main__":
    # app.run(host='0.0.0.0')
    # app.run()
    # socketio.run(app, debug=True, host='0.0.0.0')
    context = (cer, key)
    app.run(host='0.0.0.0', port=5000, debug = True, ssl_context=context)
    # app.run(host='0.0.0.0', port=5000, debug = True)

