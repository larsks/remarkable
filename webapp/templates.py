#!/usr/bin/python

import os
import sys

import jinja2
from jinja2.loaders import FileSystemLoader

from webapp import template_dir

template_env = jinja2.Environment(
        loader = FileSystemLoader(template_dir))

def view(viewname):
    def view_decorator(f):
        def view_wrapper(*args, **kwargs):
            d = f(*args, **kwargs)

            if not isinstance(d, dict):
                return d

            try:
                t = template_env.get_template(viewname)
            except jinja2.TemplateNotFound:
                t = template_env.get_template('%s.html' % viewname)

            return t.render(**d)
        return view_wrapper

    return view_decorator

