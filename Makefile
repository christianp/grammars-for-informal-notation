all: expander.js base.js

expander.js: expander.pegjs
	pegjs --export-var expander --format globals expander.pegjs
base.js: base.pegjs
	echo var baseSource=\"\\\\n\\\\ > $@ && cat base.pegjs | sed 's#\\\#\\\\\\\\#g' | sed 's#"#\\"#g' | sed 's#$$#\\\n\\\#' >> $@ && echo \" >> $@
