#!/usr/bin/env python3
"""Appends 20 rows every second to a random node type until the deadline. usage: writer10.py <port> <seconds> <run label>"""
import json,random,sys,time,urllib.request
port,secs,label=sys.argv[1],int(sys.argv[2]),sys.argv[3]
H={"Authorization":"Bearer secret","Omnigraph-Http-Api":"0.14","Content-Type":"application/x-ndjson"}
rnd=random.Random(702); stop=time.time()+secs; n=0; ok=0; err=0; last=None
while time.time()<stop:
    t=rnd.randrange(10); rows=[]
    for _ in range(20):
        n+=1; rows.append(json.dumps({"type":f"Doc{t}","data":{"slug":f"{label}-{n}","body":" ".join(f"w{rnd.randrange(20000):05d}" for _ in range(60)),"embedding":[round(rnd.gauss(0,1),3) for _ in range(1536)]}}))
    r=urllib.request.Request(f"http://127.0.0.1:{port}/graphs/knowledge/load/ndjson?mode=append",data="\n".join(rows).encode(),headers=H)
    try:
        urllib.request.urlopen(r,timeout=60).read(); ok+=1
    except Exception as e:
        err+=1; last=str(getattr(e,'read',lambda:e)())[:200]
    time.sleep(1)
print("commits",ok,"err",err,"last",last)
