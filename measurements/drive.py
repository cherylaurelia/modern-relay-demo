#!/usr/bin/env python3
"""Read-only workload against a running omnigraph-server; samples RSS once per interval.
usage: drive.py <pid> <port> <graph> <seconds> <out.csv>"""
import json,os,random,subprocess,sys,time,threading,urllib.request
pid,port,graph,secs,out=sys.argv[1],sys.argv[2],sys.argv[3],int(sys.argv[4]),sys.argv[5]
H={"Authorization":"Bearer secret","Omnigraph-Http-Api":"0.14","Content-Type":"application/json"}
DIM=int(os.environ.get("DIM","1536")); random.seed(1); ok=[0];err=[0];last=[None]; stop=time.time()+secs
def call(name,params):
    r=urllib.request.Request(f"http://127.0.0.1:{port}/graphs/{graph}/queries/{name}",data=json.dumps({"params":params}).encode(),headers=H)
    try:
        urllib.request.urlopen(r,timeout=120).read(); ok[0]+=1
    except Exception as e:
        err[0]+=1; last[0]=str(getattr(e,'read',lambda:e)())[:300]
def worker(seed):
    rnd=random.Random(seed)
    while time.time()<stop:
        if rnd.random()<.5: call("by_text",{"q":f"w{rnd.randrange(20000):05d}"})
        else: call("by_vector",{"q":[round(rnd.gauss(0,1),4) for _ in range(DIM)]})
ts=[threading.Thread(target=worker,args=(i,),daemon=True) for i in range(4)]
[t.start() for t in ts]
t0=time.time()
with open(out,'w') as f:
    f.write("seconds,rss_mb,ok,err\n")
    while time.time()<stop:
        rss=int(subprocess.check_output(["ps","-o","rss=","-p",pid]).strip())/1024
        f.write(f"{time.time()-t0:.0f},{rss:.0f},{ok[0]},{err[0]}\n"); f.flush(); time.sleep(10)
print("ok",ok[0],"err",err[0],"last",last[0])
