#!/usr/bin/env python3
"""Importa a CID-10 do DATASUS (CSV, latin-1) e gera cid_full.json / cid_full.js.
Uso: python3 build_cid.py <pasta_csv> <saida_json>
"""
import csv,json,sys,os
src=sys.argv[1]; out=sys.argv[2]
def rd(f):
    with open(os.path.join(src,f),encoding='latin-1',newline='') as fh:
        r=list(csv.reader(fh,delimiter=';'))
    return [[c.strip() for c in row] for row in r[1:]]
cap=[[int(r[0]),r[1],r[2],r[3].split(' - ',1)[-1].strip()] for r in rd('CID-10-CAPITULOS.CSV')]
grp=[[r[0],r[1],r[2]] for r in rd('CID-10-GRUPOS.CSV')]
cat=[[r[0],r[1],r[2],r[4],r[5]] for r in rd('CID-10-CATEGORIAS.CSV')]
sub=[[r[0],r[1],r[2],r[3],r[4],r[6],r[7]] for r in rd('CID-10-SUBCATEGORIAS.CSV')]
d={'cap':cap,'grp':grp,'cat':cat,'sub':sub}
with open(out,'w',encoding='utf-8') as fh: json.dump(d,fh,ensure_ascii=False,separators=(',',':'))
print('capitulos',len(cap),'grupos',len(grp),'categorias',len(cat),'subcategorias',len(sub))
