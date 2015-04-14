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

// create a directory (mkdir)
router.put('/api/directory', auth, function(req, res) {
    ensureExists(req.query.resource, function(err) {
	if (err) {
	    console.log('vvv fileserver/api/resource : ' + err.message);
	    res.status(400).send('Something went wrong');
	} else {
	    res.json({ message : 'Directory created successfully' });
	}
    });
});

// create a file
router.put('/api/file', auth, function(req, res) {
    fs.appendFile(req.query.resource, req.body.payload, function(err) {
	if (err) {
	    console.log('vvv fileserver/api/file : ' + err.message);
	    res.status(400).send('Something went wrong');
	}
	res.json({ message : 'File created successfully' });
    });
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
	console.log('vvv fileserver/api/directory : ' + err.message);
	res.status(404).send('Cannot find resource');
    }
});
	    

// FUNCTIONS ===============================================

// create an array of json representations of files/directories at given path
function processReq(_p, res) {
    var resp = [];
    fs.readdir(_p, function(err, list) {
	for (var i = list.length - 1; i >= 0; i--) {
	    resp.push(processNode(_p, list[i]));
	}
	res.json(resp);
    });
}

// create json representation of file/directory
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

// creates directory if it does not exist
function ensureExists(path, mask, cb) {
    if (typeof mask == 'function') {             // allow the 'mask' parameter to be optional
	cb = mask;
	mask = 0777;
    }
    fs.mkdir(path, mask, function(err) {
	if (err) {
	    if (err.code == 'EEXIST') cb(null); // ignore folder already exists error
	    else cb(err);                       // something else went wrong
	} else cb(null);                        // successfully created folder
    });
}

// deletes directory that contains files (rm -rf)
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
