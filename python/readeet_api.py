# python/readeet_api.py

import sys
import requests
import json
import ast

DOMAIN = 'http://star.u.cb.icmanage.com:8080'

# HTTP REQUESTS ============================================ 

# returns [array of jsons] of all posts
def getAllPosts():
    url = DOMAIN + '/posts'
    r = requests.get(url)
    return ast.literal_eval(r.text)

# returns post with id as json
def getPost(id):
    url = DOMAIN + '/posts/' + id
    r = requests.get(url)
    return json.loads(r.text)

# creates post (need to figure out how to authenticate in python)
def createPost(body, token):
    auth = createAuthHeader(token)
    url = DOMAIN + '/posts'
    r = requests.post(url, data=body, headers=auth)
    return json.loads(r.text)

# increment upvote of post with id by one
def upvotePost(id, token):
    auth = createAuthHeader(token)
    url = DOMAIN + '/posts/' + id + '/upvote'
    r = requests.put(url, headers=auth)
    return json.loads(r.text)

# create new comment at post with id
def createComment(id, body, token):
    auth = createAuthHeader(token)
    url = DOMAIN + '/posts/' + id + '/comments'
    r = requests.post(url, data=body, headers=auth)
    return json.loads(r.text)

# increment upvote of comment with id by one
def upvoteComment(post_id, comment_id, token):
    auth = createAuthHeader(token)
    url = DOMAIN + '/posts/' + post_id + '/comments/' + comment_id + '/upvote'
    r = requests.put(url, headers=auth)
    return json.loads(r.text)

# register account and get authentication token
def register(login):
    url = DOMAIN + '/register'
    r = requests.post(url, data=login)
    return json.loads(r.text)['token']

# login and get authentication token
def login(login):
    url = DOMAIN + '/login'
    r = requests.post(url, data=login)
    return json.loads(r.text)['token']

# HELPERS ==================================================

# create authentication header
def createAuthHeader(token):
    auth = {'Authorization': 'Bearer ' + token}
    return auth

# TEST FUNCTIONS ===========================================

LOGIN = {
    'username': 'roger',
    'password': '123'
}

def test_getAllPosts():
    for post in getAllPosts():
        print(json.dumps(post, indent=1))

def test_getPost():
    print(json.dumps(getPost('552598d5d1fd74256fba839e'), indent=1))


def test_createPost(token):
    body = {
        'title': 'I love this site',
        'link': 'http://www.enya.com',
    }
    print(json.dumps(createPost(body, token), indent=1))

def test_upvotePost(token):
    print(json.dumps(upvotePost('552598d5d1fd74256fba839e', token), indent=1))

def test_createComment(token):
    body = {
        'body': 'I am snake'
    }
    print(json.dumps(createComment('552598d5d1fd74256fba839e', body, token), indent=1))

def test_upvoteComment(token):
    print(json.dumps(upvoteComment('552598d5d1fd74256fba839e', '5525b613830fd1357579971a', token), indent=1))
    
def test_login():
    token = login(LOGIN)
    print(token)
    return token

def test_register():
    token = register(LOGIN)
    print(token)
    return token

# TEST AREA : HARDHAT REQUIRED =============================

"""
print('\n<-- getAllPosts() Test: -->')
test_getAllPosts()

print('\n<-- getPost(id) Test: -->')
test_getPost()

print('\n<-- login(login) Test: -->')
token = test_login()


print('\n<-- register(login) Test: -->')
token = test_register()


print('\n<-- createPost(data, token) Test: -->')
test_createPost(token)


print('\n<-- upvotePost(id, token) Test: -->')
test_upvotePost(token)

print('\n<-- createComment(id, body, token) Test: -->')
test_createComment(token)


print('\n<-- upvoteComment(post_id, comment_id, token) Test: -->')
test_upvoteComment(token)
"""
