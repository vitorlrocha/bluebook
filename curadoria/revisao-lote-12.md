# Revisão do lote 12 (hanseníase) — revisor independente, 13/11/2026
Fontes lidas: Guia Prático sobre a Hanseníase (MS, 2017; texto extraído do PDF, Quadro 4 e caps. 8, 9, 10, 14) e PCDT de Hanseníase (Conitec, 2022; quadro 1, itens 6.3, 10.2.3, 12.2, 13, 14). O PCDT 2022 adota a PQT-U (3 fármacos também nos PB) desde 2021 e prevalece sobre o guia de 2017. `checar_lote.js`: OK (7 registros após a retirada).

| Registro | Veredito | Motivo |
|---|---|---|
| Hanseníase indeterminada | APROVADO COM AJUSTES | PB no guia 2017 era rifampicina+dapsona; PCDT 2022: PQT-U com clofazimina 300 mg mensal + 50 mg/dia. Esquema de substituição da dapsona trocado pelo quadro 5 do PCDT |
| Hanseníase tuberculóide | APROVADO COM AJUSTES | Mesmo ajuste de PQT-U (PB) |
| Hanseníase dimorfa | APROVADO COM AJUSTES | Substituição da dapsona pelo quadro 5; "segundo ciclo de 12 cartelas" contradiz o PCDT (não autoriza passar de 12 meses; só com resistência comprovada) |
| Hanseníase em menores de 15 anos | APROVADO COM AJUSTES | Quadro 4 do guia confere (rif 10-20, dapsona 1-2 mg/kg máx 50 mg/dia, clofazimina 5 mg/kg mensal e 1 mg/kg/dia), mas o PCDT 2022 difere: rif 10, clofazimina 6, dapsona 2 mg/kg mensal; dapsona 2 e clofazimina 1 mg/kg/dia; 30-50 kg: rif 450 + clof 150 + dapsona 50 mensal, dapsona 50 diária + clof 50 em dias alternados. Prevalece o PCDT |
| Efeitos adversos da PQT | APROVADO COM AJUSTES | Conteúdo confere com guia 8.1; substituição da dapsona trocada pelo quadro 5 do PCDT |
| Avaliação neurológica simplificada e GIF | APROVADO COM AJUSTES | Distinta da ficha do lote-02 (técnica do exame, nervos, urgências), embora com sobreposição de GIF/OMP; periodicidade ajustada ao PCDT 14.1 (diagnóstico, a cada 3 meses, última dose, novas queixas) |
| Prevenção de incapacidades e autocuidado | REPROVADO | Duplicata da ficha do lote-02 "Hanseníase: prevenção de incapacidades e sequelas neurais" (B92), mais bem fundamentada (Manual 2008 + PCDT 2022); mantida a do lote-02. Movida para `pulados` |
| Investigação e vigilância de contatos | APROVADO COM AJUSTES | BCG: guia dava a todo contato sem sinais; PCDT 13.1: maiores de 1 ano, não vacinados ou com 1 dose (cartão/cicatriz); contraindicações ampliadas (neoplasia, corticoide em dose alta). Pendência da cicatriz resolvida; dose/via da BCG segue PENDENTE |

## Ajustes aplicados (texto antigo -> novo)
- 1, 2: PQT-PB (rifampicina 600 + dapsona 100; clofazimina só se suspender dapsona) -> PQT-U PB: rifampicina 600 + clofazimina 300 + dapsona 100 mensais; dapsona 100 + clofazimina 50 diárias; 6 meses. Cartelas infantis -> PQT-U infantil. (PCDT quadro 1, item 10.1)
- 1-3, 5: substituição da dapsona (clofazimina 50 mg/dia no PB; ofloxacina OU minociclina no MB) -> rifampicina 600 + clofazimina 300 + ofloxacino 400 (ou minociclina 100) mensais e clofazimina 50 + ofloxacino/minociclina diários; PB 6 e MB 12 meses (PCDT quadro 5).
- 3: segundo ciclo de 12 cartelas -> investigar resistência (item 11.2); sem extensão além de 12 meses.
- 4: doses pediátricas conforme o PCDT (acima); observação registra a divergência com o guia 2017. A nota do máximo de 50 mg/dia de dapsona não consta no PCDT e foi retirada.
- 6: periodicidade da ANS e do GIF conforme PCDT 14.1.
- 8: BCG e contraindicações conforme PCDT 13.1; seguimento anual por 5 anos mantido (guia) com a ressalva do PCDT para anti-PGL1 positivos.
- Fonte PCDT 2022 adicionada em `fontes` dos registros alterados. Mantidos, sem alteração: critérios clínicos, baciloscopia/biópsia, prova da histamina, GIF (conferidos por amostragem no guia).
