import os

from gevent import monkey; monkey.patch_all()
import bottle

app = bottle.app()

from webapp import views
from webapp import api

