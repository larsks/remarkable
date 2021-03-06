from setuptools import setup

with open('requirements.txt') as fd:
    setup(name='Remarkable',
          version='1.0',
          description='Shared slideshows',
          author='Lars Kellogg-Stedman',
          author_email='lars@oddbit.com',
          url='http://blog.oddbit.com/',
          install_requires=fd.readlines(),
         )
