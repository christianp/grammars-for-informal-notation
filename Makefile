all: jme-nearley.js

jme-nearley.js:
	nearleyc jme.ne -e jme_grammar > $@
