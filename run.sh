#!/bin/bash
forever start -o logs/out.log -e logs/err.log -l logs/forever.log -c nodemon --exitcrash app.js
