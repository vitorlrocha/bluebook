# Revisão de fontes — lote 02

Revisor independente. Data: 13/11/2026. Li o guia de bolso do MS (PDF, `pdftotext`), o Manual de prevenção de incapacidades 2008 e o PCDT de Hanseníase 2022 (PDF), e as 11 páginas do CDC. `checar_lote.js`: OK (10 registros após a retirada). Duplicatas: nenhuma com `diseases.json` nem com os lotes 01 e 03-07 (existem "Fasciite necrosante", "Hanseníase", "Hanseníase: reações hansênicas", "Neuropatia por hanseníase e por compressão"; não há ficha de choque tóxico).

| Registro | Veredito | Motivo |
|---|---|---|
| Psitacose | APROVADO COM AJUSTES | Doses e critérios idênticos ao guia (p. 334-335). Edição: o PDF é a 8ª ed. rev., 1ª reimpr., 2013 (não "2010") |
| Coccidioidomicose | APROVADO COM AJUSTES | Anfotericina B 1-3 g, fluconazol 400 mg/dia, itraconazol 300 mg/dia, 6-12 meses: conferem (p. 112-114). Mesmo ajuste de edição |
| Febre por mordedura de rato | APROVADO COM AJUSTES | Confere com o CDC; Base passa a dizer "fonte internacional (EUA)" |
| Febre recorrente por carrapato mole | APROVADO COM AJUSTES | Todas as doses conferem com o CDC. Útil só como referência (rara ou não confirmada no Brasil); isso foi dito na introdução |
| Tifo exantemático epidêmico | APROVADO COM AJUSTES | Doses e duração conferem; "notificar imediatamente" é regra do CDC/EUA, trocada por texto com regra brasileira PENDENTE |
| Listeriose | APROVADO COM AJUSTES | Confere (20%, 25%, 14-21 dias, 5%, 2 meses); acrescentei o gatilho febre > 38,1 °C do CDC |
| Arenavírus do Novo Mundo (Sabiá) | APROVADO COM AJUSTES | Removi "antimicrobianos de amplo espectro razoáveis" (não achei na página) e "ocorrência muito rara" (não consta); notificação reescrita conforme a fonte |
| Triquinose | APROVADO COM AJUSTES | Fichas sem clínica: completei com o CDC Clinical Overview (fases, sorologia, biópsia, fontes de infecção). Doses conferem |
| Difilobotríase | REPROVADO | Só há tratamento; sem clínica, diagnóstico ou epidemiologia lidos. Movido para `pulados` |
| Hanseníase: prevenção de incapacidades | APROVADO COM AJUSTES | Manual 2008 confere; PCDT 2022 (item 7.1) não contradiz. Acrescentei força muscular no grau 1, escore OMP e "ao final do tratamento" |
| Doença estreptocócica invasiva: STSS e fasciite | APROVADO COM AJUSTES | Confere com o CDC; removi "crepitação" (CDC diz que gás costuma faltar em estreptococo); renomeei para "Síndrome do choque tóxico estreptocócico..." e remeti à ficha existente de fasciite |

## Ajustes aplicados (texto antigo → novo, resumidos)
- Psitacose/Cocci: "(8ª ed., 2010)" → "(8ª ed. rev., 1ª reimpr., 2013)", também em `fontes.ano`.
- Todas as Bases do CDC: "(complemento, sem documento brasileiro lido)" → "CDC (EUA) ... (fonte internacional, complemento; sem documento brasileiro lido)".
- Arenavírus, Tifo, Listeria, Hanseníase, STSS: frases acima. Triquinose: introdução, critérios e exames reescritos e 2ª fonte adicionada. Hanseníase: PCDT 2022 adicionado em `fontes`.
