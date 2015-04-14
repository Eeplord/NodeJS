// server/routes/fileserver.js

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

// serve a resource (ls)
router.get('/api/resource', auth, function(req, res) {
    try {
	stats = fs.lstatSync(req.query.resource);

	if (stats.isDirectory()) {
	    _p = req.query.resource;
	    processReq(_p, res);
	} else if (stats.isFile()) {
	    res.json(processNode('', req.query.resource));
	} else {
	    res.status(404).send('Not a file or directory');
	}
    } catch (err) {
	console.log('vvv fileserver/api/resource/ : ' + err.message);
	res.status(404).send('Cannot find resource');
    }
});

// delete file/directory (rm/rmdir)
router.delete('/api/resource', auth, function(req, res) {
    try {
	stats = fs.lstatSync(req.query.resource);

	if (stats.isDirectory()) {
	    rmdir(req.query.resource, function(err) { 
		if (err) throw err; 
		res.json({ message: 'Directory deleted' });
	    });
	} else if (stats.isFile()) {
	    fs.unlink(req.query.resource, function(err) { 
		if (err) throw err;
		res.json({ message: 'File deleted' });
	    });
	} else {
	    res.status(404).send('Not a file or directory');
	}
    } catch (err) {
	console.log('vvv fileserver/api/resource : ' + err.message);
	res.status(404).send('Cannot find resource');
    }
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

function rmdir(path, callback) {
    fs.readdir(path, function(err, files) {
	if(err) {
	    // Pass the error on to callback
	    callback(err, []);
	    return;
	}
	var wait = files.length,
	count = 0,
	folderDone = function(err) {
	    count++;
	    // If we cleaned out all the files, continue
	    if( count >= wait || err) {
		fs.rmdir(path,callback);
	    }
	};
	// Empty directory to bail early
	if(!wait) {
	    folderDone();
	    return;
	}
	// Remove one or more trailing slash to keep from doubling up
	path = path.replace(/\/+$/,"");
	files.forEach(function(file) {
	    var curPath = path + "/" + file;
	    fs.lstat(curPath, function(err, stats) {
		if( err ) {
		    callback(err, []);
		    return;
		}
		if( stats.isDirectory() ) {
		    rmdirAsync(curPath, folderDone);
		} else {
		    fs.unlink(curPath, folderDone);
		}
	    });
	});
    }); 
}

module.exports = router;
