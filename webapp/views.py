#!/usr/bin/python

import os

from webapp import app, static_dir, template_dir, api
from webapp.templates import view

@app.route('/static/<path:path>')
def static_asset(path):
    return bottle.static_file(path, static_dir)

@app.route('/watch/<id>')
@view('slideshow')
def watch_show(id):
    if not id in api.shows:
        raise bottle.HTTPError(404)

    return api.shows[id]

@app.route('/present')
@view('present')
def present():
    return {}

