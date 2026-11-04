#!/usr/bin/env python3
"""Read workload over ten node types (Doc0..Doc9), half vector, half text; samples RSS.
usage: drive10.py <pid> <port> <graph> <seconds> <out.csv>  env HOT=fraction of requests sent to Doc0 and Doc1 (default: uniform)"""
import json,os,random,subprocess,sys,time,threading,urllib.request
pid,port,graph,secs,out=sys.argv[1],sys.argv[2],sys.argv[3],int(sys.argv[4]),sys.argv[5]
H={"Authorization":"Bearer secret","Omnigraph-Http-Api":"0.14","Content-Type":"application/json"}
HOT=float(os.environ.get("HOT","0")); ok=[0];err=[0];last=[None];lat=[];stop=time.time()+secs
def call(name,params):
    r=urllib.request.Request(f"http://127.0.0.1:{port}/graphs/{graph}/queries/{name}",data=json.dumps({"params":params}).encode(),headers=H)
    t=time.time()
    try:
        urllib.request.urlopen(r,timeout=120).read(); ok[0]+=1; lat.append(time.time()-t)
    except Exception as e:
        err[0]+=1; last[0]=str(getattr(e,'read',lambda:e)())[:300]
def worker(seed):
    rnd=random.Random(seed)
    while time.time()<stop:
        i=rnd.randrange(2) if rnd.random()<HOT else rnd.randrange(10)
        if rnd.random()<.5: call(f"t{i}",{"q":f"w{rnd.randrange(20000):05d}"})
        else: call(f"v{i}",{"q":[round(rnd.gauss(0,1),4) for _ in range(1536)]})
ts=[threading.Thread(target=worker,args=(i,),daemon=True) for i in range(4)]
[t.start() for t in ts]
t0=time.time()
with open(out,'w') as f:
    f.write("seconds,rss_mb,ok,err\n")
    while time.time()<stop:
        try:
            rss=int(subprocess.check_output(["ps","-o","rss=","-p",pid]).strip())/1024
        except subprocess.CalledProcessError:
            f.write(f"{time.time()-t0:.0f},DEAD,{ok[0]},{err[0]}\n"); f.flush(); break
        f.write(f"{time.time()-t0:.0f},{rss:.0f},{ok[0]},{err[0]}\n"); f.flush(); time.sleep(10)
lat.sort()
if not lat: lat=[0]
print("ok",ok[0],"err",err[0],"p50_ms",round(lat[len(lat)//2]*1000,1),"p99_ms",round(lat[int(len(lat)*.99)]*1000,1),"last",last[0])
