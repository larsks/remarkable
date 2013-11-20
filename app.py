#!/usr/bin/env python

import os

virtenv = os.environ['OPENSHIFT_PYTHON_DIR'] + '/virtenv/'
virtualenv = os.path.join(virtenv, 'bin/activate_this.py')
try:
    execfile(virtualenv, dict(__file__=virtualenv))
except IOError:
    pass

from app import app
app.run(server='gevent',
        host=os.environ.get('OPENSHIFT_PYTHON_IP', '127.0.0.1),
        port=os.environ.get('OPENSHIFT_PYTHON_PORT', 8080))
