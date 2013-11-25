#!/usr/bin/python

import sys
import time
import json
from contextlib import contextmanager

import bottle
from zmq import green as zmq
import gevent
from gevent import queue

from webapp import app, stats, settings

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

@contextmanager
def subcontext(id):
    global ctx

    s = ctx.socket(zmq.SUB)
    s.setsockopt(zmq.SUBSCRIBE, '')
    s.connect('inproc://%s' % id)

    yield s

    s.close()

@contextmanager
def pollcounter():
    stats.polling += 1
    yield
    stats.polling -= 1

def query_worker(id, rfile):
    global shows

    with subcontext(id) as s, pollcounter() as pc:
        poll = zmq.Poller()
        poll.register(s, zmq.POLLIN)
        poll.register(rfile, zmq.POLLERR|zmq.POLLIN)

        while True:
            events = dict(poll.poll())

            if rfile.fileno() in events:
                break

            msg = s.recv_json()

            if msg['msg'] == 'close':
                break
            elif msg['msg'] != 'update':
                continue

            yield( json.dumps({
                'msg': 'update',
                'id': id,
                'url': msg['url'],
                }))

            break

@app.route('/show/ping')
def api_ping():
    return {'msg': 'pong'}

@app.route('/show/<id>/poll')
def api_poll_show(id):
    global shows

    # On OpenShift this method will be called using an alternate
    # port so we need to add a CORS header.
    if settings.using_openshift:
        bottle.response.headers['Access-Control-Allow-Origin'] = '*'

    if not id in shows:
        raise bottle.HTTPError(404)

    rfile = bottle.request.environ['wsgi.input'].rfile
    return query_worker(id, rfile)

@app.route('/show/<id>', method='GET')
def api_query_show(id):
    global shows

    if not id in shows:
        raise bottle.HTTPError(404)

    return json.dumps({
        'msg': 'info',
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
            'created_at': time.time(),
            'created_by': bottle.request.environ.get(
                'HTTP_X_FORWARDED_FOR',
                bottle.request.environ.get('REMOTE_ADDR')),
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

