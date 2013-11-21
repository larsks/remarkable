#!/usr/bin/python

import os

openshift_use_alt_port = 'OPENSHIFT_APP_NAME' in os.environ

static_dir = os.path.join(
        os.environ.get('OPENSHIFT_REPO_DIR', '.'),
        'static',
        )

template_dir = os.path.join(
        os.environ.get('OPENSHIFT_REPO_DIR', '.'),
        'templates',
        )

