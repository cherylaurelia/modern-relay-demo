import json,random,sys
n=int(sys.argv[1]); out=sys.argv[2]; dim=1536; random.seed(702)
vocab=[f"w{i:05d}" for i in range(20000)]
try:
    import numpy as np
    rng=np.random.default_rng(702); vec=lambda: np.round(rng.normal(size=dim),3).tolist()
except ImportError:
    vec=lambda:[round(random.gauss(0,1),3) for _ in range(dim)]
with open(out,'w') as f:
    for i in range(n):
        f.write(json.dumps({"type":"Doc","data":{"slug":f"d{i}","body":' '.join(random.choices(vocab,k=60)),"embedding":vec()}})+"\n")
