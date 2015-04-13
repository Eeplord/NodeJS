// server/routes/filesystem.js

// MODULES =================================================

var express  = require('express');
var router   = express.Router();
var fs       = require('fs');
var path     = require('path');
var mongoose = require('mongoose');

var jwt      = require('express-jwt');
var auth     = jwt({secret: 'SECRET', userProperty: 'payload'});

var User     = mongoose.model('User');

// HTTP REQUESTS ===========================================

// filesystem main page
router.get('/', function(req, res) {
    res.render('filesystem');
});

// serve the tree
router.get('/api/tree', function(req, res) {
    var _p;
    if (req.query.id == 1) {
	_p = path.resolve(__dirname, '../..');
	processReq(_p, res);
    } else {
	if (req.query.id) {
	    _p = req.query.id;
	    processReq(_p, res);
	} else {
	    res.json(['No valid data found']);
	}
    }
});

// serve a resource
router.get('/api/resource', auth, function(req, res) {
    res.send(fs.readFileSync(req.query.resource, 'UTF-8'));
});

// create a resource relative to user's cwd
router.post('/api/resource', auth, function(req, res) {
    res.send(req.query.resource);
});

// get current working directoy for user based on auth token
router.get('/api/cwd', auth, function(req, res) {
    User.findOne({ 'username': req.payload.username }, function(err, user) {
	if (err){ return next(err); }

	res.send(user.cwd);
    });
});



// FUNCTIONS ===============================================

function processReq(_p, res) {
    var resp = [];
    fs.readdir(_p, function(err, list) {
	for (var i = list.length - 1; i >= 0; i--) {
	    resp.push(processNode(_p, list[i]));
	}
	res.json(resp);
    });
}

function processNode(_p, f) {
    var s = fs.statSync(path.join(_p, f));
    return {
	'id': path.join(_p, f),              // ID of the node
	'text': f,                           // Text appearing on the node
	'icon': s.isDirectory() ? 'jstree-custom-folder': 'jstree-custom-file', // set custom icon depending
	                                                                        // on type of node
	'state': {
	    'opened': false,                 // should node be opened on load?
	    'disabled': false,               // is the node disabled?
	    'selected': false                // is the node selected?
	},
	'li_attr': {                         // custom attrs to li tag
	    'base': path.join(_p, f),        // path of the current file
	    'isLeaf': !s.isDirectory()       // is this node a leaf?
	},
	'children': s.isDirectory()          // does this node have children?
    };
}

module.exports = router;
