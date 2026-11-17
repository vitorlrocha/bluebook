# Revisão de fontes — lote 03

Revisor independente. Baixei e li (pdftotext) o Guia para o uso de hemocomponentes, 2ª ed., MS 2015 (seção 3.1, págs. 31-34 do guia) e a diretriz SBOC Melanoma cutâneo (publicação 25/05/2024). `checar_lote.js`: OK. Sem duplicatas em `dados/diseases.json` (existem "Melanoma", "Melanoma metastático", "Nevo displásico", mas nenhum in situ/D03; não há anemia aguda pós-hemorrágica).

| # | Registro | Veredito | Motivo |
|---|---|---|---|
| 1 | Anemia aguda pós-hemorrágica (D62) | APROVADO COM AJUSTES | Classes, sinais, limiares de Hb, 1 g/dL por unidade, 60-120 min, 10-15 mL/kg, filtro 170 µ, 4 h, NaCl 0,9% conferem. Compatibilidade ABO não confere com o Quadro 3 |
| 2 | Melanoma in situ (D03.9) | APROVADO COM AJUSTES | Margem 0,5-1 cm (NE muito baixo/FR forte), sem imagem de rotina, sem shaving, biópsia incisional conferem. Seguimento está na fonte e estava como PENDENTE |

## Pontos levantados pelo redator
- **Hífens do D62:** o PDF perdeu os hífens de intervalo em todo o documento (ex.: "5060 mL", "200300 mL", "68 U", "1020 mL/kg" são 50-60, 200-300, 6-8, 10-20). Portanto "12 horas" = 1-2 h e "2030 mL/kg/h" = 20-30 mL/kg/h, como o redator leu. Não consegui renderizar a imagem da página (sem pdftoppm); a conclusão é por padrão sistemático do documento, e o texto do guia sobre o Ht ("só começa a diminuir uma a duas horas") reforça o 1-2 h. Mantido.
- **Ano da SBOC:** 2024 está certo (publicação 25/05/2024; a URL de 2026 é só a data de upload).

## Ajustes aplicados
1. D62, prescrição item 4 — antes: "O recebe O; A e B recebem do mesmo grupo ou O; AB recebe qualquer grupo; RhD negativo recebe RhD negativo". Depois: reescrito conforme o Quadro 3 (seção 3.1.1, p. 33): O+ recebe O+/O-; A+ recebe A+/A-; B+ recebe B+/B-; AB+ recebe AB, O, A ou B; RhD negativo só RhD negativo; urgência admite RhD positivo; o quadro não lista hemácias O para A e B, seguir o banco de sangue. Motivo: "A e B recebem O" não está no quadro da fonte.
2. D62, exames — acrescentado "(prática geral, não consta na seção 3.1)" após função renal/lactato/gasometria.
3. Melanoma, conduta e prescrição — antes: seguimento "PENDENTE". Depois: acompanhamento dermatológico a cada 6 a 12 meses, ou mais frequente se indicado (SBOC, Seguimento da doença localizada, p. 19; NE baixo/FR forte).

Não aplicável por falta de fonte (mantido como PENDENTE pelo redator): cristaloide, plasma, plaquetas, hemorragia maciça. Aceitável, pois a ficha avisa.
