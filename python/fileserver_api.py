# python/fileserver_api.py

import sys
import requests
import json

from readeet_api import login

DOMAIN = 'http://star.u.cb.icmanage.com:8080/fileserver/api'

# HTTP REQUESTS ============================================

def getResource(resource, token):
    auth = createAuthHeader(token)
    url = DOMAIN + '/resource?resource=' + resource
    r = requests.get(url, headers=auth)
    return json.loads(r.text)

def mkdir(directory, token):
    auth = createAuthHeader(token)
    url = DOMAIN + '/directory?resource=' + directory
    r = requests.put(url, headers=auth)
    return json.loads(r.text)

def mkfile(file, body, token):
    auth = createAuthHeader(token)
    url = DOMAIN + '/file?resource=' + file
    r = requests.put(url, data=body, headers=auth)
    return json.loads(r.text)

def rm(resource, token):
    auth = createAuthHeader(token)
    url = DOMAIN + '/resource?resource=' + resource
    r = requests.delete(url, headers=auth)
    return json.loads(r.text)

def copy(file, copy, token):
    r = getResource(file, token)
    body = {
        'payload' : r['content']
    }
    return mkfile(copy, body, token)

def move(file, newFile, token):
    messages = []
    messages.append(copy(file, newFile, token))
    messages.append(rm(file, token))
    return messages

# HELPERS ==================================================

def createAuthHeader(token):
    auth = {'Authorization': 'Bearer ' + token}
    return auth

# TEST FUNCTIONS ===========================================

LOGIN = {
    'username': 'eeplord',
    'password': 'qfnk2'
}

body = {
    'payload' : 'test'
}

def test_login():
    token = login(LOGIN)
    print(token)
    return token

def test_getResource(token):
    print(json.dumps(getResource('/fast/FrqU/Cncs', token), indent=1))

def test_mkdir(token):
    print(json.dumps(mkdir('/fast/FrqU/Cncs/TestFolder', token), indent=1))

def test_mkfile(token):
    print(json.dumps(mkfile('/fast/FrqU/Cncs/TestFolder/TestFile', body, token), indent=1))

def test_rm(token):
    print(json.dumps(rm('/fast/FrqU/Cncs/TestFolder', token), indent=1))

def test_copy(token):
    print(json.dumps(copy('/fast/FrqU/Cncs/TestFolder/TestFile', '/fast/FrqU/Cncs/TestFolder/CopyFile', token), indent=1))

def test_move(token):
    print(json.dumps(move('/fast/FrqU/Cncs/TestFolder/TestFile', '/fast/FrqU/Cncs/TestFolder/MoveFile', token), indent=1))

# TEST AREA ================================================

print('\n<-- login(login) Test: -->')
token = test_login()

#print('\n<-- getResource(resource, token) Test: -->')
#test_getResource(token)

#print('\n<-- mkdir(directory, token) Test: -->')
#test_mkdir(token)

print('\n<-- mkfile(file, token) Test: -->')
test_mkfile(token)

#print('\n<-- getResource(resource, token) Test: -->')
#test_getResource(token)

#print('\n<-- rm(resource, token) Test: -->')
#test_rm(token)

#print('\n<-- getResource(resource, token) Test: -->')
#test_getResource(token)

print('\n<-- copy(file, copy, token) Test: -->')
test_copy(token)

print('\n<-- move(file, newFile, token) Test: -->')
test_move(token)
