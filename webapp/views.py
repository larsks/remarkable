#!/usr/bin/python

import os
import bottle

from webapp import app, api, stats, settings
from webapp.templates import view

@app.route('/stats')
@view('stats')
def show_stats():
    if not settings.enable_stats:
        raise HTTPError(403)

    return {
            'shows': api.shows,
            'stats': stats,
            }

@app.route('/')
@view('home')
def default():
    return {}

@app.route('/panel/control')
@view('control')
def panel_control():
    return {}

@app.route('/panel/location')
@view('location')
def panel_location():
    return {}

@app.route('/static/<path:path>')
def static_asset(path):
    return bottle.static_file(path, settings.static_dir)

@app.route('/watch/<id>')
@view('slideshow')
def watch_show(id):
    if not id in api.shows:
        raise bottle.HTTPError(404)

    vars = { 'mode': 'viewer' }
    vars.update(api.shows[id])
    return vars

@app.route('/present', name='present')
@view('slideshow')
def present():
    return { 'mode': 'presenter' }

