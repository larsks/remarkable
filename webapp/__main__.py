#!/usr/bin/python

from webapp import app

if __name__ == '__main__':
    app.run(server="gevent")

