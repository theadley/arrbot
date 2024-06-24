#!/bin/sh
docker build . -t headleytm/arr-bot --platform linux/x86_64
docker tag headleytm/arr-bot headleytm/arr-bot:latest
docker image push headleytm/arr-bot