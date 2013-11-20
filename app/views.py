#!/usr/bin/python

import bottle
import zmq
import gevent

from app import app

@app.route('/')
def index():
    return 'This is a test.'

