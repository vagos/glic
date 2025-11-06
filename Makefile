PREFIX ?= /usr/local
BINDIR ?= $(PREFIX)/bin
DATADIR ?= $(PREFIX)/share/glic

.PHONY: install uninstall

install:
	install -d $(DESTDIR)$(DATADIR)
	cp -r lib $(DESTDIR)$(DATADIR)
	install -m 0755 glic $(DESTDIR)$(DATADIR)/
	install -d $(DESTDIR)$(BINDIR)
	ln -sf $(DATADIR)/glic $(DESTDIR)$(BINDIR)/glic

uninstall:
	rm -f $(DESTDIR)$(BINDIR)/glic
	rm -rf $(DESTDIR)$(DATADIR)
