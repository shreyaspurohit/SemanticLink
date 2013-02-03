#!/bin/bash

YUI_COMPRESS_PATH=~/Downloads/yuicompressor-master/build/yuicompress
PROJECT_ROOT=~/Project/Node.JS/node_sample_app

cd $PROJECT_ROOT/resources/css

$YUI_COMPRESS_PATH -o ../all1.min.css app.css grid.css 
