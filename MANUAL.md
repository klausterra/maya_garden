# 📖 Manual de Utilização — Maya Garden

> **O primeiro sistema de irrigação com inteligência artificial do mercado.**
>
> [www.hiperenge.com.br](https://www.hiperenge.com.br) · [www.mayahome.ia.br](https://www.mayahome.ia.br)

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Painel de Status](#-painel-de-status)
3. [Controle de Zonas](#-controle-de-zonas)
4. [Programando Horários](#-programando-horários)
5. [Sensor de Chuva](#-sensor-de-chuva)
6. [Histórico de Irrigação](#-histórico-de-irrigação)
7. [Modos de Operação](#-modos-de-operação)
8. [Perguntas Frequentes](#-perguntas-frequentes)
9. [Especificações Técnicas](#-especificações-técnicas)

---

## 🌱 Visão Geral

O **Maya Garden** é um sistema inteligente de irrigação que controla automaticamente a rega do seu jardim. Ele funciona através de um painel visual dentro do Home Assistant, onde você pode:

- Programar **até 4 horários por zona** para regar automaticamente
- Definir a **duração** de cada rega (de 1 a 10 minutos)
- Pausar a irrigação quando estiver **chovendo**
- Acompanhar o **histórico** de todas as regas realizadas

O sistema controla **2 zonas** independentes do jardim, cada uma com sua própria válvula e programação.

---

## 📊 Painel de Status

No topo do card, você encontra **3 indicadores** que mostram o estado atual do sistema:

| Indicador | O que mostra |
|---|---|
| 💧 **Bomba** | Se a bomba d'água está **Ligada** ou **Desligada** |
| 🌿 **Irrigação** | Se alguma zona está sendo regada agora e **qual zona** |
| ☀️ **Clima** | Se o sensor de chuva detectou chuva (**Chovendo**) ou está **Seco** |

### Como ler os indicadores:

- **Bomba: Ligada** (verde) → A bomba está funcionando, alguma zona está sendo regada
- **Bomba: Desligada** → Nenhuma irrigação ativa no momento
- **Irrigação: Zona 1** → A Zona 1 está sendo regada agora
- **Irrigação: Parada** → Nenhuma rega acontecendo
- **Clima: Chovendo** (laranja) → O sensor detectou chuva, a irrigação automática pode estar pausada
- **Clima: Seco** → Tempo seco, irrigação funciona normalmente

---

## 🌿 Controle de Zonas

Cada zona do jardim tem seu próprio painel com:

### Modo de Operação

O seletor **"Modo"** define como a zona funciona:

| Modo | Comportamento |
|---|---|
| ⛔ **Desligado** | A zona **não irriga** em nenhum horário. Use quando não quiser regar essa área. |
| 🤖 **Automático** | A zona irriga nos horários programados. Se o sensor de chuva detectar chuva, a irrigação é **pausada automaticamente**. |
| 🌧️ **Com Chuva** | A zona irriga nos horários programados **mesmo quando está chovendo**. Use para plantas que precisam de rega constante. |

### Pausa Chuva (Manual)

O botão **"Pausa Chuva"** permite pausar manualmente a irrigação de uma zona:

- **☀️ NÃO** → A zona funciona normalmente
- **🌧️ SIM** → A zona está pausada (não irriga mesmo nos horários programados)

> 💡 **Dica:** Use a Pausa Manual quando você regou o jardim com mangueira e não quer que o sistema regue novamente.

---

## ⏰ Programando Horários

Cada zona tem **4 turnos** de irrigação (Turno 1, 2, 3 e 4). Para cada turno, você configura:

### 1️⃣ Ativar/Desativar (Botão ON/OFF)

- **ON** (verde) → O turno está ativo e vai irrigar no horário programado
- **OFF** (cinza) → O turno está desativado

### 2️⃣ Hora

Campo para definir **a que horas** a irrigação deve começar.

> Exemplo: `06:00` para regar às 6 da manhã

### 3️⃣ Duração (Slider)

O controle deslizante define **por quanto tempo** a zona será regada:

- Mínimo: **1 minuto**
- Máximo: **10 minutos**
- O valor atual aparece ao lado (ex: "5 min")

### Exemplo de Programação

Para regar a **Zona 1** duas vezes por dia:

1. **Turno 1:** ON → Hora: `06:00` → Duração: 5 min
2. **Turno 2:** ON → Hora: `18:00` → Duração: 5 min
3. **Turno 3:** OFF (não usado)
4. **Turno 4:** OFF (não usado)

> ⚠️ **Importante:** Para o turno funcionar, ele precisa estar em **ON** E a zona precisa estar em modo **Automático** ou **Com Chuva**.

---

## 🌧️ Sensor de Chuva

O Maya Garden pode ser conectado a um **sensor de chuva** que detecta automaticamente quando está chovendo.

### Como funciona:

1. Quando o sensor detecta chuva → O indicador de **Clima** muda para "🌧️ Chovendo"
2. Zonas em modo **Automático** → A irrigação é **pausada automaticamente**
3. Zonas em modo **Com Chuva** → A irrigação **continua normalmente**
4. Quando para de chover → A irrigação volta a funcionar nos próximos horários

> 💡 **Dica:** Se você não tem sensor de chuva instalado, use o botão "Pausa Chuva" manualmente quando precisar.

---

## 📋 Histórico de Irrigação

Na parte inferior do card, o **Histórico de Irrigação** mostra as últimas regas realizadas:

| Coluna | Descrição |
|---|---|
| 🟢 / 🔵 Bolinha | **Verde** = Zona 1 · **Azul** = Zona 2 |
| **Zona** | Qual zona foi irrigada |
| **Hora** | Quando a irrigação aconteceu (Hoje, Ontem ou data) |
| **Duração** | Quanto tempo durou a rega |

> O histórico mostra as irrigações das **últimas 48 horas** e atualiza automaticamente a cada 5 minutos.

Se aparecer **"⏱️ Em curso"**, significa que a irrigação está acontecendo neste momento.

---

## 🤖 Modos de Operação

### Resumo dos Modos

```
┌─────────────────────────────────────────────────────┐
│  DESLIGADO                                          │
│  → Zona completamente desativada                    │
│  → Nenhum horário funciona                          │
│  → Badge: ⛔ Desligada                              │
├─────────────────────────────────────────────────────┤
│  AUTOMÁTICO (recomendado)                           │
│  → Irriga nos horários programados                  │
│  → Para automaticamente quando chove                │
│  → Badge: ✅ Pronta                                 │
├─────────────────────────────────────────────────────┤
│  COM CHUVA                                          │
│  → Irriga nos horários programados                  │
│  → Ignora o sensor de chuva                         │
│  → Badge: ✅ Pronta                                 │
└─────────────────────────────────────────────────────┘
```

### Quando a zona está irrigando:

O badge muda para **"💧 Irrigando"** (verde pulsante), e os indicadores de Bomba e Irrigação ficam verdes no painel de status.

### Quando a zona está pausada por chuva:

O badge muda para **"🌧️ Pausada"** (laranja).

---

## ❓ Perguntas Frequentes

### O jardim não está sendo regado. O que verificar?

1. ✅ O **Modo** da zona está em "Automático" ou "Com Chuva"?
2. ✅ Pelo menos um **Turno** está em **ON**?
3. ✅ O **horário** do turno já passou hoje?
4. ✅ A **Pausa Chuva** está em "NÃO"?
5. ✅ O sensor de chuva **não** está indicando chuva? (se modo Automático)

### Posso regar manualmente?

O Maya Garden funciona por agendamento automático. Para regar manualmente, programe um turno para o próximo minuto com a duração desejada.

### A bomba não desliga. O que fazer?

A bomba só desliga automaticamente quando **todas** as zonas terminam de irrigar. Se uma zona ainda estiver ativa, a bomba permanece ligada. Caso o problema persista, entre em contato com o suporte técnico.

### Quantas vezes por dia posso regar?

Cada zona tem **4 turnos**, então você pode regar até **4 vezes por dia** por zona. Com 2 zonas, o sistema pode fazer até **8 regas por dia** no total.

### A duração máxima é 10 minutos?

Sim. Cada turno pode regar por no máximo **10 minutos**. Para regas mais longas, programe turnos consecutivos (ex: Turno 1 às 06:00 por 10 min + Turno 2 às 06:11 por 10 min).

### O que acontece se faltar energia?

Quando a energia voltar, o Home Assistant reinicia automaticamente e o Maya Garden retoma a programação. Os horários e configurações são salvos permanentemente.

---

## ⚙️ Especificações Técnicas

| Especificação | Valor |
|---|---|
| Zonas de irrigação | 2 |
| Turnos por zona | 4 |
| Duração por turno | 1 a 10 minutos |
| Intervalo de verificação | 30 segundos |
| Histórico | 48 horas |
| Sensor de chuva | Binary sensor (opcional) |
| Controle de bomba | Automático (liga/desliga) |
| Modos de operação | 3 (Desligado, Automático, Com Chuva) |
| Integração | Home Assistant (Custom Component) |
| Compatibilidade HACS | ✅ Sim |

---

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o Maya Garden:

- 🌐 [www.hiperenge.com.br](https://www.hiperenge.com.br)
- 🌐 [www.mayahome.ia.br](https://www.mayahome.ia.br)

---

*Maya Garden · Hiperenge Engenharia · Irrigação Inteligente com IA*
