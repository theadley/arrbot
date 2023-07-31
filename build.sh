#!/bin/sh
docker build . -t headleytm/arr-bot
docker tag headleytm/arr-bot headleytm/arr-bot:latest
docker image push headleytm/arr-bot