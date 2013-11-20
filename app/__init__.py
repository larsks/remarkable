from gevent import monkey; monkey.patch_all()
import bottle
app = bottle.app()
from app import views

