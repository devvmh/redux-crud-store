#!/bin/bash

NEW_TAG=$1
LAST_TAG=$(git describe --tags --abbrev=0 HEAD^)
CHANGELOG=$(git log ${LAST_TAG}..HEAD --oneline)
git tag -a -m "${CHANGELOG}" $NEW_TAG HEAD
