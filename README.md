# Maya Garden 🌱

Integração Home Assistant para controle inteligente de irrigação.

## Funcionalidades

- **2 Zonas de irrigação** com válvulas independentes
- **4 horários programáveis por zona** com duração individual
- **3 modos de operação**: Desligado, Automático, Com Chuva
- **Pausa por chuva** manual e automática (via sensor)
- **Motor de agendamento** integrado (verifica a cada 1 minuto)
- **Card Lovelace personalizado** com controles visuais
- **Controle de bomba** automático

## Instalação via HACS

1. Adicione este repositório como repositório customizado no HACS
2. Instale "Maya Garden"
3. Reinicie o Home Assistant
4. Vá em **Configurações > Dispositivos e Serviços > Adicionar Integração > Maya Garden**

## Configuração

Na tela de configuração, selecione:
- **Entidade da Bomba**: switch que controla a bomba d'água
- **Entidades das Válvulas**: switches que controlam as válvulas de cada zona
- **Sensor de Chuva** (opcional): binary_sensor que indica chuva

## Entidades Criadas

Para cada zona configurada, a integração cria automaticamente:

| Tipo | Entidade | Descrição |
|------|---------|-----------|
| `select` | `Modo Zona N` | Desligado / Automático / Com Chuva |
| `switch` | `Zona N - Horário X Ativo` | Ativa/desativa horário |
| `switch` | `Pausar Zona N por Chuva` | Pausa manual |
| `time` | `Zona N - Horário X` | Hora programada |
| `number` | `Zona N - Horário X - Duração` | Duração em minutos |

## Card Lovelace

O card personalizado é registrado automaticamente. Para usá-lo:

```yaml
type: custom:maya-garden-card
```

## Licença

MIT
