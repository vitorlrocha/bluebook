# Critérios de fontes e de dose (decisão do autor, 27/11/2026)

Vale para todo conteúdo clínico: doenças (prescrição, conduta, exames), fichas de medicamento, calculadora pediátrica,
Plantão, calculadoras e escores. Prevalece sobre regras antigas de fonte nos briefs e lotes.

## 1. Duas edições

- **Edição Brasil (a atual):** a fonte brasileira vem primeiro, em tudo.
- **Edição internacional (futura, por exemplo EUA):** as diretrizes internacionais ficam guardadas como 2ª opção, na
  linha `Ref. internacional:`. Nessa edição, a ordem se inverte: FDA, AAP, IDSA, ACOG, CDC e as sociedades locais vêm primeiro.

## 2. Hierarquia das fontes (edição Brasil)

| Nível | Fontes | Para quê |
|---|---|---|
| **A — Oficial do SUS** | PCDT e DDT da Conitec; protocolos, manuais e cadernos do Ministério da Saúde (Guia de Vigilância em Saúde, Cadernos de Atenção Básica, Protocolos SAMU 192, Gestação de Alto Risco, Atenção à Saúde do Recém-Nascido, Manual de Tuberculose etc.); PNI (Manual de Normas e Procedimentos para Vacinação, calendário); RENAME e Formulário Terapêutico Nacional (FTN); notas técnicas vigentes do MS; alertas da Anvisa | Escolha do tratamento, esquema, dose e conduta |
| **B — Sociedades brasileiras** | Diretrizes, consensos e documentos científicos da SBP, FEBRASGO, SBC, SBPT, SBEM, SBD, SBI, SBN, ABN, AMIB, SBR, SBH, ABP e outras; Projeto Diretrizes AMB/CFM | Quando o nível A não cobre o tema ou está desatualizado |
| **C — Bula brasileira** | Bula profissional registrada na Anvisa | Dose, via, faixa etária, teto e ajuste renal ou hepático. Ela define os limites da dose |
| **D — Internacional de referência** | OMS/OPAS primeiro (base de muitas diretrizes brasileiras); depois IDSA, AAP, ACOG, AHA/ESC, GINA, GOLD, KDIGO, Surviving Sepsis, NICE e CDC | Só quando não houver fonte A, B ou C; dizer na linha Base que é internacional |
| **E — Rótulo estrangeiro** | Rótulo FDA (DailyMed) ou EMA | Dose quando a bula brasileira não estiver acessível ou o remédio não tiver registro no Brasil |

**Não servem como fonte única:** livros-texto, UpToDate, Medscape, Drugs.com, outros aplicativos, blogs e respostas de IA.
Podem ajudar a achar a fonte primária, e é essa que se cita.

**Desempate:**
1. O nível mais alto vence.
2. No mesmo nível, vence a versão mais recente.
3. Documento superado por um mais novo do mesmo nível não se usa.
4. Conflito de segurança vai para a decisão do autor e não se aplica sozinho. Exemplos: fonte internacional mais nova com
   alerta, medicamento retirado do mercado brasileiro, dose acima do teto da bula.
5. Na edição Brasil, medicamento sem registro no Brasil não entra como 1ª opção.

## 3. Regra da dose: uma dose-base que faça sentido para a doença

Nem sempre existe a dose exata para aquela doença. Não se inventa nada: usa-se o que já existe, nesta ordem.

1. **Dose da mesma indicação**, na fonte de nível mais alto.
2. **A fonte da doença escolhe o remédio, mas não dá a dose.** Usar a dose usual do medicamento para a situação clínica
   equivalente (FTN, bula Anvisa ou diretriz da classe). Precisa ser a mesma via, a mesma faixa etária e a mesma
   gravidade. Exemplo: "infecção grave", "dor leve a moderada". Escrever de onde veio: "dose usual (FTN 2010, infecções
   graves)".
3. **A fonte diz só a classe**, como "analgésico simples", "AINE" ou "anti-histamínico". Usar o de 1ª escolha da RENAME ou
   da diretriz brasileira da classe: analgésico simples → paracetamol ou dipirona; AINE → ibuprofeno; anti-histamínico →
   dexclorfeniramina ou loratadina; antisséptico bucal → clorexidina 0,12%. Para antibiótico, só quando uma diretriz
   (nível A, B ou D) tratar daquela síndrome. Se nenhuma tratar, remeter ao registro da síndrome no app.
4. **Remissão** ("ver a ficha X deste app" ou "ver o registro Y"), quando a dose da ficha já serve e copiá-la só
   alongaria o texto. O script confere que a ficha citada existe.
5. **PENDENTE DE VERIFICAÇÃO** só quando nada acima se aplica, ou quando o caso cai nas exceções abaixo.

**Exceções: nunca transferir a dose de outra indicação ou população.** Estes casos exigem fonte específica:
- profilaxia e tratamento; dose de ataque e de manutenção;
- infecção do sistema nervoso central (meningite, abscesso), endocardite, osteomielite e sepse neonatal, que têm doses
  próprias, em geral mais altas;
- recém-nascido a partir da dose da criança, e criança a partir da dose do adulto. Usar o mg/kg pediátrico da bula ou do
  FTN; nunca dividir a dose do adulto;
- gestação e lactação: só com fonte que trate da gestação, ou bula que permita o uso; senão, PENDENTE;
- quimioterapia, imunossupressores, antirretrovirais pediátricos, anticoagulantes, insulina e remédios de janela estreita
  (digoxina, lítio, aminoglicosídeos guiados por nível): seguir o PCDT ou protocolo específico;
- insuficiência renal ou hepática: ajuste da bula.

**Teto:** nunca passar do máximo da bula ou do FTN. Se uma diretriz de nível A ou B indicar dose maior, citar a diretriz no texto.

## 4. O que não é dose

| Pendência | Fonte única | Texto quando a fonte não define |
|---|---|---|
| Notificação | Lista Nacional de Notificação Compulsória vigente (Portaria do MS) | "Não consta na lista nacional de notificação compulsória (Portaria vigente)" |
| Exames e periodicidade | Diretriz da doença | "Periodicidade conforme a evolução clínica (a fonte não define)" |
| Apresentação e nome comercial | Lista CMED/Anvisa vigente | "Sem registro no Brasil (lista CMED mês/ano)" |
| Conduta de especialista (oncologia, transplante, HIV pediátrico, doença rara) | PCDT da doença | "Prescrição pelo especialista conforme o PCDT X (ano)" |

Esses textos dizem o que a fonte realmente traz. Por isso não levam PENDENTE.

## 5. Formato

- A prescrição termina com `Base: <instituição>, <documento>, <ano>[, item ou capítulo].`, citando a fonte usada de fato
  (brasileira, sempre que houver).
- Linha opcional `Ref. internacional: <instituição, documento, ano>.`: 2ª opção, guardada para a edição internacional.
- Dose tirada de outra categoria clínica: dizer qual ("dose usual do FTN para infecção grave").
- Calculadora pediátrica (`PED_DB`):
  - toda via traz `rev: "Conferida em <mês/ano> com <fonte>"`;
  - preferência: bula Anvisa, FTN e SBP; o rótulo FDA, quando faltar a brasileira;
  - as entradas antigas conferidas pelo FDA continuam e só mudam quando houver divergência ou revisão.

## 6. Como aplicar: em massa, não um a um

1. Trabalhar por fonte: ler uma fonte ampla (FTN, um PCDT, um manual do MS) e aplicar em todos os registros que ela
   cobre, de uma vez.
2. Script em `curadoria/`:
   - idempotente, com o trecho antigo e o novo;
   - confere que as fichas citadas existem;
   - recusa registro original da v71 que não esteja na lista `CORRECOES` de `ferramentas/testar_build.js`.
3. A lista de fontes de cada rodada fica em `docs/FONTES_*.md`.
4. Decide o autor: mudança em registro original da v71, conflito de segurança e qualquer caso das exceções da seção 3.
