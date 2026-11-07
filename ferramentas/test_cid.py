#!/usr/bin/env python3
"""Confere contagens do cid_full.json e do HTML contra os CSV-fonte."""
import csv,json,sys,re
src,js,html=sys.argv[1:4]
def n(f): return len(list(csv.reader(open(src+'/'+f,encoding='latin-1',newline=''),delimiter=';')))-1
exp={'cap':n('CID-10-CAPITULOS.CSV'),'grp':n('CID-10-GRUPOS.CSV'),'cat':n('CID-10-CATEGORIAS.CSV'),'sub':n('CID-10-SUBCATEGORIAS.CSV')}
d=json.load(open(js,encoding='utf-8'))
for k,v in exp.items(): assert len(d[k])==v,(k,len(d[k]),v)
t=open(html,encoding='utf-8').read()
m=re.search(r'var CID_FULL = (\{.*?\});\n',t,re.S); assert m,'CID_FULL ausente no HTML'
h=json.loads(m.group(1))
for k,v in exp.items(): assert len(h[k])==v,('html',k,len(h[k]),v)
print('OK',exp)
