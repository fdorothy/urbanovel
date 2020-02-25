#!/usr/bin/env bash
DIRNAME=`dirname $0`
$DIRNAME/urbanovel.py
pushd build
static-server ./
popd
