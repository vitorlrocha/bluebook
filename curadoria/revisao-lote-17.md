# Revisão do lote 17 (Pediatria, documentos científicos da SBP; PDFs abertos e conferidos)

| Registro | Veredito | Motivo |
|---|---|---|
| SAF e TEAF | APROVADO | Hoyme (≤ P10, ≥ 1,5 DP), 14 g/dose, T-ACE (> 2 pontos), FAEEs conferem (DC 197/208). Complementar à ficha obstétrica do lote 14 (Q86.0, Ginecologia). |
| Dor de crescimento | APROVADO | 10-20%, 80%, 95%, 20-47%, corticoide contraindicado: conferem. Analgésico sem dose, PENDENTE. CID M79.6 existe e é o mais adequado disponível. |
| FPIES | APROVADO | Diretriz 152 lida: salina 10-20 mL/kg (fluxograma 20), ondansetrona 0,15 mg/kg máx. 16 mg > 6 meses, metilprednisolona 1 mg/kg máx. 60-80 mg, TPO 0,06-0,6 g/kg (0,3) em 3 doses/30 min, máx. 3 g proteína ou 10 g, observação 4-6 h, TPO 12-18 meses: tudo confere. |
| Proctocolite alérgica | APROVADO | 65%, 60%, 2-8 semanas, 2-4 semanas, 72-96 h e 2 semanas: conferem. Cálcio/vitamina D PENDENTE. |
| Enteropatia induzida por proteína alimentar | REPROVADO | Seção da fonte tem ~15 linhas; ficha curta e com diagnóstico diferencial que não consta ali. Movida para pulados (não fundida). |
| Lúpus eritematoso neonatal | APROVADO | 1:12.500-20.000, 2%, 755 casos (65/33,1/15,5/10,3%), 17,5%/30%, 70%, < 50 bpm, eco 16ª-28ª semana: conferem. CID P00.8 mantido (Q24.6 só cobre o bloqueio). Doses PENDENTES. |
| VEOIBD | APROVADO | DC 67 aberto: 150-250 µg/g, DHR, ~20% de rendimento, > 40% monogênica, cirurgia ~50%: conferem. K50.9/K51.9 mantidos. |
| DRC pediátrica | APROVADO | Schwartz 0,413/0,55/0,70, ferritina < 100, TSAT < 20%, Hb por idade, ESCAPE: conferem. N18.9 mantido. Doses PENDENTES. |
| Disquesia do lactente | APROVADO | 4%, 9 meses, ≥ 10 min, sem laxante/supositório: conferem. K59.8 mantido (mais adequado existente). |
| Síndrome da ruminação no lactente | APROVADO COM AJUSTES | Roma IV e prevalência conferem. Não é duplicata: o registro do acervo é um esboço de Psiquiatria (TCC, ARFID); esta é Roma IV do lactente (SBP). Ajustada conduta 4 (psicologia/serviço social não constam na fonte). F98.2 é o CID da ruminação infantil. |
| Diarreia funcional | APROVADO | Roma IV (≥ 4 evacuações, > 4 semanas, 6-60 meses), 7%: conferem. K59.1. |
| Obesidade monogênica e sindrômica | APROVADO COM AJUSTES | Quadro 1 do documento: abaixo de 5 anos, obesidade é > P99,9 (Z +3), não ≥ P97. E66.8 mantido. |

Pendências de dose: todas marcadas "PENDENTE DE VERIFICAÇÃO"; nenhuma dose sem fonte.

## Ajustes aplicados em lote-17.json
- Obesidade, criterios: "menores de 5 anos, obesidade ≥ P97 (Z +2)" passou a "menores de 5 anos, sobrepeso de P97 a P99,9 e obesidade > P99,9 (Z +3); de 5 a 19 anos, sobrepeso P85 a < P97, obesidade ≥ P97 e grave > P99,9".
- Ruminação, conduta 4: removido "psicologia, serviço social"; incluído o escopo (lactente e < 4 anos) e a remissão ao registro de Psiquiatria para adolescentes e adultos.
- Enteropatia: removida de `doencas` e incluída em `pulados`.
- checar_lote.js: OK (11 registros; avisos de CID compartilhado esperados).
