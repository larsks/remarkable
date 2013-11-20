#!/usr/bin/python

import bottle
import zmq
import gevent

from webapp import app

@app.route('/')
def index():
    return 'This is a test.'

