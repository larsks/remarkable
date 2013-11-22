This is a simple web application for presenting a [remark][] slideshow
to a number of connected clients.  As the presenter changes slides,
all the clients will follow along.

Usage
=====

Assuming that you are hosting this application at
`slides.example.com`, the presenter creates the slideshow by
connecting to http://slides.example.com/present and entering (a) a
name for the presentation and (b) the base URL of the remark slides.

Clicking **Create** will register the slideshow with the application.

Clients connect to http://slides.example.com/watch/NAME, where *NAME*
is the name the presenter selected for the presentation.  They will
initally see whatever the presenter entered for the base URL.

As the presenter changes slides (using the "+1" button, etc), clients
will follow along.  Entering an explicit slide number in the *Current
slide* field and clicking **Sync slide** will update the presentation
to that particular slide.

Entering an arbitrary URL in the *Current URL* field and clicking
**Sync URL** will update all clients to point to that URL.  Note that
in many cases this won't work very well (for example, if the new
location performs a redirect, or does not permit access from within a
frame).

The presenter can specify a presenter password in the *Secret* field;
this will prevent someone else controlling the presentation knowing
just the name.

Compatability
=============

Seems to work with:

- [Firefix][] 25
- [Chrome][] 31
- [Safari][] 7
- [Midori][] 0.5.5
- [dwb][] 2013.03.30

[remark]: https://github.com/gnab/remark
[firefox]: http://getfirefox.com/
[chrome]: http://www.google.com/chrome/
[midori]: http://midori-browser.org/
[dwb]: http://portix.bitbucket.org/dwb/

Limitations
===========

At least in Firefox, Remarkable will not work correctly if you attempt
to open the same presentation twice in the same browser.

