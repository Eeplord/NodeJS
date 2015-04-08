# httpRequests.py

import sys
import requests
import json
import ast # converts response strings to usable data structures
import jwt

DOMAIN = 'http://star.u.cb.icmanage.com:8080'
AUTH_SECRET = 'SECRET'

# HTTP REQUESTS ============================================ 

# returns [array of jsons] of all posts
def getAllPosts():
    r = requests.get(DOMAIN + '/posts')
    return ast.literal_eval(r.text)

# returns post with id as json
def getPost(id):
    r = requests.get(DOMAIN + '/posts/' + id)
    return json.loads(r.text)

# creates post (need to figure out how to authenticate in python)
def createPost(body, login):
    auth = createAuthHeader(login)
    r = requests.post(DOMAIN + '/posts', data=body, headers=auth)
    return json.loads(r.text)

# increment upvote of post with id by one
def upvotePost(id, login):
    auth = createAuthHeader(login)
    r = requests.put(DOMAIN + '/posts/' + id + '/upvote', headers=auth)
    return json.loads(r.text)

# create new comment at post with id
def createComment(id, body, login):
    auth = createAuthHeader(login)
    r = requests.post(DOMAIN + '/posts/' + id + '/comments', data=body, headers=auth)
    return json.loads(r.text)

# increment upvote of comment with id by one
def upvoteComment(post_id, comment_id, login):
    auth = createAuthHeader(login)
    r = requests.put(DOMAIN + '/posts/' + post_id + '/comments/' + comment_id + '/upvote', headers=auth)
    return json.loads(r.text)

# HELPERS ==================================================

# create jwt for authentication in request header
def createAuthHeader(login):
    auth = {'Authorization': 'Bearer ' + jwt.encode(login, AUTH_SECRET)}
    return auth

# TEST FUNCTIONS ===========================================

LOGIN = {
    'username': 'eeplord',
    'password': 'qfnk2'
}

def test_getAllPosts():
    for post in getAllPosts():
        print(json.dumps(post, indent=1))

def test_getPost():
    print(json.dumps(getPost('552598d5d1fd74256fba839e'), indent=1))


def test_createPost():
    body = {
        'title': 'Python Post',
        'link': 'http://www.python.com',
    }
    print(json.dumps(createPost(body, LOGIN), indent=1))

def test_upvotePost():
    print(json.dumps(upvotePost('552598d5d1fd74256fba839e', LOGIN), indent=1))

def test_createComment():
    body = {
        'body': 'I am snake'
    }
    print(json.dumps(createComment('552598d5d1fd74256fba839e', body, LOGIN), indent=1))

def test_upvoteComment():
    print(json.dumps(upvoteComment('552598d5d1fd74256fba839e', '5525b613830fd1357579971a', LOGIN), indent=1))
    

# TEST AREA : HARDHAT REQUIRED =============================

"""
print('\n<-- getAllPosts() Test: -->')
test_getAllPosts()

print('\n<-- getPost(id) Test: -->')
test_getPost()

print('\n<-- createPost(data, login) Test: -->')
test_createPost()

print('\n<-- upvotePost(id, login) Test: -->')
test_upvotePost()

print('\n<-- createComment(id, body, login) Test: -->')
test_createComment()

print('\n<-- upvoteComment(post_id, comment_id, login) Test: -->')
test_upvoteComment()
"""
