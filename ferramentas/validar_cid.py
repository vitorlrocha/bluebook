import json,re
import sys,os
p=sys.argv[1] if len(sys.argv)>1 else os.path.join(os.path.dirname(__file__),'..','index.html')
t=open(p,encoding='utf-8').read()
F=json.loads(re.search(r'var CID_FULL = (\{.*?\});\n',t,re.S).group(1))
valid={c[0] for c in F['cat']}|{s[0] for s in F['sub']}
bad=[]
for l in t.split('\n'):
    s=l.strip().rstrip(',')
    if s.startswith('{"area":'):
        d=json.loads(s)
        for c in re.split(r'[,;]',d['cid']):
            c=c.strip()
            if re.match(r'^[A-Z]\d\d(\.\d)?$',c) and c.replace('.','') not in valid: bad.append((d['nome'],c))
            elif c and not re.match(r'^[A-Z]\d\d(\.\d)?(\s*[–-]\s*[A-Z]\d\d(\.\d)?)?$',c): bad.append((d['nome'],'FMT '+c))
print(bad)
