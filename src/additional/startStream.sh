#!/bin/sh

xvfb-run -n 122 --server-args="-screen 0 720x480x24" python3 stream.py -s "https://staging.conference.walkerit.dev/bigbluebutton/api" -p "BTuVERx5HDGs6jy4Kvao4Ft4tEQBcM8X8heQ2y33c" -i "2hwpu5zmzkg0bze8alu07hqgwtb6urnifwiuarki" -I "false" -B "" -E "" -l "" -d "" -S "" -P "" -C "" -V "" -A "" -M "" -T "" -u "" -t "rtmp://a.rtmp.youtube.com/live2/34a9-gsc6-y8ws-4gth-9ztj" -c ""

