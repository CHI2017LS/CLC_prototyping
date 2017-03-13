from flask import Flask
from etherpad_lite import EtherpadLiteClient
from flask import render_template
from flask import request
import json

app = Flask(__name__)
app.config.update(
	TEMPLATES_AUTO_RELOAD = True
)

@app.route("/")
def index():
	return render_template('index.html')

@app.route("/slides")
def slides():
	return render_template('slides.html')


@app.route("/getpadusercount")
def getPadUsersCount(userCount = None):
	c = EtherpadLiteClient(base_params={'apikey':'f42591e743037bc39d530ba6b1550b0d558aed32f3e9f5e8f12cdeaa1a48b0cd'})
	# c = EtherpadLiteClient(base_params={'apikey':'555ddf5d51cba5e38e93d538742a02f7d1b2ea968ca4dcccb983f31c954d632b'})
	padList = c.listAllPads()
	userCount = {}

	for ID in padList['padIDs']:
		userCount[ID] = c.padUsersCount(padID=ID)['padUsersCount']
	
	return json.dumps(userCount)

@app.route("/setText")
def pasteText(text=None):
	a = request.args.get('a')
	c = EtherpadLiteClient(base_params={'apikey':'f42591e743037bc39d530ba6b1550b0d558aed32f3e9f5e8f12cdeaa1a48b0cd'})
	padList = c.listAllPads()
	c.appendText(padID=padList['padIDs'][0], text=a)
	return json.dumps('test')

if __name__ == "__main__":
    app.run(host='0.0.0.0')

