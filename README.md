# CLC_prototyping
This is a prototype of our application!
The current server and database is on Heroku.

## Etherpad API Key
### Generate API key
The api key is a long random string stored in APIKEY.txt under the root of etherpad-lite. The file will be generated after first run `bin/run.sh` in the root of etherpad-lite. 

### Installation
The etherpad api support multiplt language. In our case, we use python. Type this command to install. `pip install etherpad_lite`

## To Test Etherpad API Locally
1. Download etherpad-lite: https://github.com/ether/etherpad-lite
2. Run the etherpad server first. In our case, run `bin/run.sh` in etherpad-lite/
3. Open a new window in terminal: (Make sure you have finished the python API installation.)
```
$ python -m etherpad_lite -p apikey=secret_from_APIKEY.txt
=> Welcome to the Etherpad Lite shell !
=> Command example: createPad padID=test text="Lorem ipsum dolor sit amet."
% createPad padID=test text="Lorem ipsum dolor sit amet."
ok
% getHTML padID=test
{u'html': u'Lorem ipsum dolor sit amet.<br>'}
% deletePad padID=test
ok
```

## Heroku Settings
### Install
Download etherpad-lite-heroku and push it to heroku server.
### Add etherpad API key
Add the api key to heroku's configuration either by heroku web settings or the command:
`heroku config:add ETHERPAD_API_KEY=somereallylongrandomstring`

For more information about the usage of etherpad api:      
1. http://etherpad.org/doc/v1.6.0/#index_paduserscount_padid       
2. https://github.com/Changaco/python-etherpad_lite
