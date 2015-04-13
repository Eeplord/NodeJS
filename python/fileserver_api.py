# python/fileserver_api.py

import sys
import requests
import json
import urllib

from readeet_api import login

DOMAIN = 'http://star.u.cb.icmanage.com:8080/filesystem/api'


# HTTP REQUESTS ============================================

def getCWD(token):
    auth = createAuthHeader(token)
    url = DOMAIN + '/cwd'
    r = requests.get(url, headers=auth)
    return r.text

def getResource(token, resource):
    auth = createAuthHeader(token)
    url = DOMAIN + '/resource?resource=' + getCWD(token) + resource
    r = requests.post(url, headers=auth)
    return r.text

# HELPERS ==================================================

def createAuthHeader(token):
    auth = {'Authorization': 'Bearer ' + token}
    return auth

# TEST FUNCTIONS ===========================================

LOGIN = {
    'username': 'eeplord',
    'password': 'qfnk2'
}

def test_login():
    token = login(LOGIN)
    print(token)
    return token

def test_getCWD(token):
    print(getCWD(token))

def test_getResource(token):
    print(getResource(token, 'fast'))

# TEST AREA ================================================

print('\n<-- login(login) Test: -->')
token = test_login()

print('\n<-- getCWD(token) Test: -->')
test_getCWD(token)

print('\n<-- getResource(token, resource) Test: -->')
test_getResource(token)
