#!/usr/bin/env python

import os

from app import app
app.run(server="gevent", port=os.environ.get("OPENSHIFT_PYTHON_PORT", 8080))

