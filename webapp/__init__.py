import os

from gevent import monkey; monkey.patch_all()
import bottle

static_dir = os.path.join(
        os.environ.get('OPENSHIFT_REPO_DIR', '.'),
        'static',
        )

template_dir = os.path.join(
        os.environ.get('OPENSHIFT_REPO_DIR', '.'),
        'templates',
        )

app = bottle.app()

from webapp import views
from webapp import api

