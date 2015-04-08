# httpRequests.py

import sys
import requests
import ast # converts response strings to usable data structures
import json # can be removed, just used to pretty print

DOMAIN = 'http://star.u.cb.icmanage.com:8080'

# HTTP REQUESTS ============================================ 

def getAllPosts():
    r = requests.get(DOMAIN + '/posts')
    return ast.literal_eval(r.text)

def getPost(id):
    r = requests.get(DOMAIN + '/posts/' + id)
    return json.loads(r.text)

# TEST FUNCTIONS ===========================================

def test_getAllPosts():
    for post in getAllPosts():
        print(json.dumps(post, indent=1))

def test_getPost():
    print(json.dumps(getPost('552598d5d1fd74256fba839e'), indent=1))

print('\n<-- getAllPosts() Test: -->')
test_getAllPosts()
print('\n<-- getPost(id) Test: -->')
test_getPost()
