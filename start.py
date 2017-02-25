from flask import Flask
from etherpad_lite import EtherpadLiteClient
from flask import render_template
from flask import request
import json

app = Flask(__name__)

@app.route("/")
def index():
	return render_template('index.html')

@app.route("/getpadusercount")
def getPadUsersCount(userCount = None):
	c = EtherpadLiteClient(base_params={'apikey':'521b9da922ce0c1a01c929eab6e35970edbc25629c2a3080a9a59437a9810138'})
	
	padList = c.listAllPads()
	userCount = {}

	for ID in padList['padIDs']:
		userCount[ID] = c.padUsersCount(padID=ID)['padUsersCount']
	
	return json.dumps(userCount)

if __name__ == "__main__":
    app.run(debug = True)