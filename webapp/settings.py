#!/usr/bin/python

import os

# We need to know when we are running under OpenShift
# because of socket handling issues in the default
# frontend.
using_openshift = 'OPENSHIFT_APP_NAME' in os.environ

static_dir = os.path.join(
        os.environ.get('OPENSHIFT_REPO_DIR', '.'),
        'static',
        )

template_dir = os.path.join(
        os.environ.get('OPENSHIFT_REPO_DIR', '.'),
        'templates',
        )

