#!/bin/bash

PROJECT_HOME="/home/shreyaspurohit/Project/Node.JS/node_sample_app"
DIST_DIR="dist"

cd $PROJECT_HOME
if [ -d "$DIST_DIR" ]; then
	echo "Cleaning 'dist' directory"
	rm -r dist/
fi
mkdir dist

echo "Copying 'src', 'scripts' and 'log' .."
cp -r ./{src,log,scripts} ./$DIST_DIR

echo "Copying 'package.json' and 'run.js' .."
cp ./package.json ./run.js ./$DIST_DIR

echo "Copying 'resources' .."
mkdir -p ./dist/resources/js/min
cp ./resources/*.js ./resources/*.css ./$DIST_DIR/resources
cp ./resources/js/min/excanvas.min.js ./resources/js/min/ie8-compat.min.js ./resources/js/min/jquery.min.js ./$DIST_DIR/resources/js/min

echo "Generating distributable zip .."
zip -y -r -q ./$DIST_DIR/dist.zip ./$DIST_DIR/

echo "Removing temporary files .."
find ./$DIST_DIR -mindepth 1 \! -name 'dist.zip' -print0 | xargs --null rm -rf

echo "Done .."
