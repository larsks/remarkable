#!/usr/bin/python

import os
import bottle

from webapp import app, static_dir, template_dir, api, stats
from webapp.templates import view

@app.route('/stats')
@view('stats')
def show_stats():
    return {
            'shows': api.shows,
            'stats': stats,
            }

@app.route('/')
@view('home')
def default():
    return {}

@app.route('/static/<path:path>')
def static_asset(path):
    return bottle.static_file(path, static_dir)

@app.route('/watch/<id>')
@view('slideshow')
def watch_show(id):
    if not id in api.shows:
        raise bottle.HTTPError(404)

    return api.shows[id]

@app.route('/present', name='present')
@view('present')
def present():
    return {}

