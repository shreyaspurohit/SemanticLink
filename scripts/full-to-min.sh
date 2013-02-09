#!/bin/bash

YUI_COMPRESS_PATH=~/Downloads/yuicompressor-master/build/yuicompress
PROJECT_ROOT=~/Project/Node.JS/node_sample_app

cd $PROJECT_ROOT/resources/js

$YUI_COMPRESS_PATH -o min/jquery.validationEngine.min.js full/jquery.validationEngine.js 
$YUI_COMPRESS_PATH -o min/jquery.validationEngine-en.min.js full/jquery.validationEngine-en.js 
$YUI_COMPRESS_PATH -o min/jquery.tagCloudGenerator.min.js full/jquery.tagCloudGenerator.js 
$YUI_COMPRESS_PATH -o min/jquery.fontVary.min.js full/jquery.fontVary.js
$YUI_COMPRESS_PATH -o min/ie8-compat.min.js full/ie8-compat.js
$YUI_COMPRESS_PATH -o min/excanvas.min.js full/excanvas.js
