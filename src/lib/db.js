"use strict"

const jsonfile = require('jsonfile');
const NeDB = require('nedb');
const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-upsert'));
const uuidV4 = require('uuid/v4');
const path = require('path');
const flat = require('flat');

var db = {};

db.all = () => db.localDB.find({
    $not: {
        deleted: true
    }
}).sort({
    updatedAt: -1
});

db.get = (id) => db.localDB.findOne({
    _id: id
});

db.filter = (q) => db.localDB.find(q).sort({
    updatedAt: -1
});

db.labels = () => db.all().exec((err, docs) => {
    docs.map((doc) => {
        console.log(doc._id)
    })
})

db.clone = (data) => new Promise((resolve, reject) => {
    var clonedData = $.extend(true, {}, data);
    resolve(clonedData)
})

db.clean = (data) => {
    delete data._rev
    delete data.description
    if ('res_time' in data) {
        delete data.res_time
    }
    if (data.kernel) {
        if ('local_num_threads' in data.kernel) {
            delete data.kernel.local_num_threads
        }
        if ('time' in data.kernel) {
            delete data.kernel.time
        }
        if ($.isEmptyObject(data.kernel)) {
            delete data.kernel
        }
    }
    data.nodes.map((node) => {
        delete node.ids
        delete node.index
        delete node.vx
        delete node.vy
        delete node.fx
        delete node.fy
        if (node.n == 1) {
            delete node.n
        }
        if ($.isEmptyObject(node.params)) {
            delete node.params
        } else {
            var pkeys = Object.keys(node.params);
            pkeys.map((pkey) => {
                if (typeof(node.params[pkey]) == 'object') {
                    delete node.params[pkey]
                }
            })
        }

    })
    data.links.map((link) => {
        if ('conn_spec' in link) {
            if ($.isEmptyObject(link.conn_spec)) {
                delete link.conn_spec
            } else {
                if (link.conn_spec.rule == 'all_to_all') {
                    delete link.conn_spec
                }
            }
        }
        if ('syn_spec' in link) {
            if ($.isEmptyObject(link.syn_spec)) {
                delete link.syn_spec
            } else {
                if (link.syn_spec.model == 'static_synapse') {
                    delete link.syn_spec.model
                }
                if ('receptor_type' in link.syn_spec) {
                    if (link.syn_spec.receptor_type == 0) {
                        delete link.syn_spec.receptor_type
                    }
                }
                if (link.syn_spec.weight == 1) {
                    delete link.syn_spec.weight
                }
                if (link.syn_spec.delay == 1) {
                    delete link.syn_spec.delay
                }
                if ($.isEmptyObject(link.syn_spec)) {
                    delete link.syn_spec
                }
            }
        }
    })
}

db.update = (data) => {
    app.message.log('Update database')
    db.clean(data);
    var date = new Date;
    data.updatedAt = date;
    data.user = app.config.app().user.id;
    data.group = 'user';
    data.version = app.config.app().version;
    data.hash = app.hash(data);
    delete data._id;
    db.localDB.update({
        _id: app.simulation.id
    }, data, {}, () => {
        db.localDB.findOne({
            _id: app.simulation.id
        })
    });
}

db.add = (data) => new Promise((resolve, reject) => {
    db.clean(data);
    data.parentId = app.simulation.id;
    data._id = uuidV4();
    var date = new Date;
    data.createdAt = date;
    data.updatedAt = date;
    data.user = app.config.app().user.id;
    data.group = 'user';
    data.version = app.config.app().version;
    db.localDB.insert(data, (err, newDocs) => {
        app.screen.capture(newDocs, false)
        resolve(true)
    })
})

db.delete = (data) => {
    data.deleted = true;
    app.db.localDB.update({
        _id: data._id
    }, data);
}

db.export = (data) => {
    var id = data._id;
    db.get(id).exec((err, doc) => {
        if (err) return
        var filepath = path.join(app.dataPath, 'exports', id + '.json')
        jsonfile.writeFileSync(filepath, doc, {
            spaces: 4
        })
    })
}

db.backup = () => {
    return new Promise((resolve, reject) => {
        db.all().exec((err, docs) => {
            if (err) return
            var date = new Date;
            var filename = path.join(app.dataPath, app.simulation.id + '_' + date.toJSON() + '.backup');
            var backupDB = new NeDB({
                filename: filename,
                timestampData: true,
                autoload: true,
            })
            backupDB.insert(docs, (err, docs) => {
                console.log('Backup successful: ' + docs.length + ' docs')
                resolve(true)
            })
        })
    })
}

db.init = () => {
    app.message.log('Initialize database')
    var filename = path.join(app.dataPath, app.config.app().db.name + '.db');

    db.localDB = new NeDB({
        filename: filename,
        timestampData: true,
        autoload: true,
    })
}

module.exports = db;
