#!/usr/bin/python

import time
import json

import bottle
import zmq
import gevent
from gevent import queue

from webapp import app

ctx = zmq.Context()
shows = {}
max_lifetime = 60 * 60 * 3

def delete_show(id):
    global shows

    this = shows[id]

    this['s'].send_json({
        'msg': 'close',
        })
    this['s'].close()

    del shows[id]

def query_worker(id, q):
    global shows

    s = ctx.socket(zmq.SUB)
    s.setsockopt(zmq.SUBSCRIBE, '')
    s.connect('inproc://%s' % id)

    while True:
        msg = s.recv_json()

        if msg['msg'] == 'close':
            break
        elif msg['msg'] != 'update':
            continue

        q.put( json.dumps({
            'msg': 'update',
            'id': id,
            'url': msg['url'],
            }))

        break

    s.close()
    q.put(StopIteration)

@app.route('/show/<id>/poll')
def api_poll_show(id):
    global shows

    if not id in shows:
        raise bottle.HTTPError(404)

    q = queue.Queue()
    task = gevent.spawn(query_worker, id, q)
    return q

@app.route('/show/<id>', method='GET')
def api_query_show(id):
    global shows

    if not id in shows:
        raise bottle.HTTPError(404)

    return json.dumps({
        'id': id,
        'base': shows[id]['base'],
        'url': shows[id]['url'],
        })

@app.route('/show/<id>', method='PUT')
def api_update_show(id):
    global shows

    if not id in shows:
        raise bottle.HTTPError(404)

    url = bottle.request.params['url']
    secret = bottle.request.params.get('secret')

    if shows[id]['secret'] is not None and shows[id]['secret'] != secret:
        raise bottle.HTTPError(401)

    shows[id]['url'] = url
    shows[id]['s'].send_json({
        'msg': 'update',
        'url': bottle.request.params['url'],
        })

    return {
            'id': id,
            'status': 'updated',
            'url': url,
            }

@app.route('/show/<id>', method='POST')
def api_create_show(id):
    global shows

    now = time.time()
    url = bottle.request.params['url']
    secret = bottle.request.params.get('secret')

    if id in shows:
        this = shows[id]

        if this['secret'] is not None and this['secret'] == secret:
            # allow owner to replace show
            delete_show(id)
        elif this['created'] < (now - max_lifetime):
            # allow stale shows to be replaced
            delete_show(id)
        else:
            raise bottle.HTTPError(409)

    shows[id] = {
            'id': id,
            'created': time.time(),
            'base': url,
            'url': url,
            'secret': secret,
            's': ctx.socket(zmq.PUB),
            }
    shows[id]['s'].bind('inproc://%s' % id)

    return { 'id': id, 'status': 'created' }

@app.route('/show/<id>', method='DELETE')
def api_delete_show(id):
    global shows

    now = time.time()
    secret = bottle.request.params.get('secret')

    try:
        this = shows[id]

        if this['secret'] is not None and this['secret'] == secret:
            # allow owner to replace show
            delete_show(id)
        elif this['created'] < (now - max_lifetime):
            # allow stale shows to be replaced
            delete_show(id)
        else:
            raise bottle.HTTPError(401)
    except KeyError:
        raise bottle.HTTPError(404)

    return { 'id': id, 'status': 'deleted' }

