# Querido Dante Partners

Crie uma plataforma web completa e responsiva de Dashboard de Afiliados e Embaixadores para o ecossistema "Querido Dante" (em pt-BR), com design profissional estilo SaaS financeiro de alta conversão (estilo Kiwify/Hotmart moderno, tema Dark minimalista com tons profundos de grafite/preto #0b0c10, cards em #15161e e destaques pontuais em roxo neon/violeta elétrico #8b5cf6, sem detalhes dourados).



O projeto usará a conexão nativa do Supabase (tabelas e RPCs já existentes no banco do ecossistema Dante).



---



### 1. REGRAS GLOBAIS DE ATRIBUIÇÃO & "CAÇADOR AGRESSIVO" (VALDIR / VSSD)

No carregamento de qualquer página ou rota pública do app:

- **Código Padrão:** `DEFAULT_SPONSOR_CODE = 'VSSD'`.

- **Modo Caçador Agressivo Ativo (`AGGRESSIVE_HUNT_MODE = true`):**

  1. Se o visitante entrar com link de terceiro (`?ref=QUALQUER_OUTRO` ou `?aff=...`), o sistema substitui imediatamente na memória e no `sessionStorage('aff_ref_code')` pelo código `VSSD`.

  2. Se o acesso for limpo/direto (sem parâmetros de URL), o `sessionStorage` grava `VSSD`.

  3. Parâmetros `?ref` ou `?aff` são removidos da barra de endereço via `history.replaceState` para manter a URL limpa.

- **Pixel de Tráfego do Subdomínio:** Registra silenciosamente a visita do subdomínio para a conta do Valdir (`VSSD`), aplicando a retenção ultra-rápida de 2 segundos (demais afiliados seguem a retenção padrão do banco).



---



### 2. VISÃO DO EMBAIXADOR (Área do Parceiro)

Dashboard intuitivo após login (autenticação unificada via Supabase `auth.users`):

1. **Cards de Métricas:**

   - Total de Visitas, Cadastros confirmados, Assinaturas ativas e Créditos de IA gerados.

   - Saldo de Coins disponível e valor equivalente em Reais (regra oficial de conversão: 100 Coins = R$ 0,01, ou seja, 10.000 Coins = R$ 1,00).

   - Multiplicador ativo no momento (ex: "Multiplicador Ativo: 2.0x" com tag de contagem regressiva de validade).

2. **Gerador de Links de Indicação:**

   - Link principal (`https://queridodante.site?ref=SEU_CODIGO`), links específicos por área e botão rápido de copiar link com feedback toast.

3. **Módulo Interativo de Raspadinha:**

   - Exibe status do evento (`affiliate_scratch_status`).

   - Se o embaixador tiver bilhetes liberados (gratuitos por plano ou comprados com Coins), mostra o card interativo com efeito de raspar (canvas ou overlay animado).

   - Ao raspar, executa o sorteio via RPC `affiliate_scratch_draw()`, revelando o código do bilhete (ex: `#004`), o multiplicador conquistado e a data limite (5 dias).

   - Histórico dos bilhetes já obtidos pelo parceiro e multiplicador acumulado (com regra cumulativa especial para plano Dante Premium+).

4. **Extrato Financeiro & Saque:**

   - Tabela detalhada de entradas de Coins (`affiliate_earnings`) com filtro por tipo (visitas, cadastros, assinaturas, lotes de créditos, Dantes ganhos, raspadinhas).

   - Formulário de solicitação de resgate Pix (chave Pix, tipo de chave, valor em Coins e cálculo automático em R$).



---



### 3. VISÃO DO ADMINISTRADOR (Painel Restrito `is_admin() = true`)

Aba ou seção exclusiva de controle para o dono da plataforma:

1. **Gestão de Embaixadores:**

   - Lista geral de parceiros com saldo, código, status e botão de bloquear/desbloquear.

   - Vínculo manual de novos indicados e ajuste de regras de lote personalizadas (ex: lote de créditos ou visitas).

2. **Controle Global do Evento de Raspadinhas:**

   - Botão para ligar/desligar o evento globalmente (`affiliate_scratch_event_active`).

   - Cadastro em lote de novos bilhetes (#001, #002, etc.) com seus respectivos multiplicadores.

3. **NOVA FERRAMENTA: Concessão & Liberação de Raspadinhas para Embaixador Específico:**

   - Modal/Painel para selecionar um embaixador específico na lista.

   - Campo para definir a **quantidade de novas raspadinhas extras** a serem concedidas para ele (concedendo bilhetes gratuitos ou resetando/expandindo o limite padrão de 5 bilhetes).

   - Permite dar "nova rodada" para o parceiro raspar imediatamente na conta dele, registrando o histórico da liberação.

4. **Gestão de Saques Pix:**

   - Fila de pedidos de saque com status (Pendente, Pago, Rejeitado) e ações rápidas de aprovação.



---



### 4. NAVEGAÇÃO & DETALHES

- Header moderno com avatar do usuário, badge do plano atual (Free, Plus, Premium, Premium+) e atalho para o Painel Admin quando for administrador.

- Botão sutil no cabeçalho ou rodapé: **"Voltar ao Querido Dante"** (apontando para o site principal com a persistência de referral).

- Notificações rápidas e elegantes em toasts (Sonner).

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a68e2bec-33cc-45ba-89bc-2c4f5765ff49).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
