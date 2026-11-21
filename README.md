# PDV Manu Presentes e Acessórios

Sistema de frente de caixa e gestão da loja, publicado no GitHub Pages como aplicativo (PWA).

- **Endereço do sistema:** https://krizekpedro.github.io/manu-pdv/
- Funciona sem internet depois de aberto uma vez.
- As chaves do Supabase **não** ficam neste repositório: são digitadas uma vez em
  *Configurações → Sincronização na nuvem* e ficam guardadas só no computador da loja.

## Como publicar uma versão nova

1. Substitua o arquivo `index.html` deste repositório pela versão nova
   (no GitHub: abra `index.html` → ícone de lápis, ou *Add file → Upload files* e envie o arquivo com o mesmo nome).
2. Clique em **Commit changes**.
3. Pronto. Em uns 2 minutos a aba **Actions** mostra um ✅ verde e o site já está atualizado.

Não precisa mexer em nenhum outro arquivo. A publicação automática
(`.github/workflows/deploy.yml`) liga o modo aplicativo no `index.html` e carimba
uma versão nova a cada envio.

## No celular (Android e iPhone)

1. **Instalar:** abra o endereço do sistema no celular.
   - Android (Chrome): menu ⋮ → **Instalar app** (ou "Adicionar à tela inicial").
   - iPhone (Safari): botão **Compartilhar** → **Adicionar à Tela de Início**.
2. **Conectar à nuvem:** no computador da loja, abra *Painel → Configurações → Nuvem → 📱 Conectar um celular*. Aparece um QR code.
   No celular, abra o app → **⚙ Painel** → **📱 Aparelho novo? Conectar este aparelho à nuvem** → **📷 Ler QR code**, aponte para o QR e digite só a senha da nuvem.
   O QR leva o endereço do projeto, a chave pública e o e-mail; **a senha nunca vai no QR**.
3. Depois de conectado, entre no Painel com o seu usuário e senha da loja.

O botão 📷 ao lado da busca do Caixa lê códigos de barras pela câmera (vários seguidos). Em *Produtos* há o botão **📷 Consultar pela câmera** para ver preço e estoque.

## Como os computadores da loja recebem a atualização

- O sistema procura versão nova ao abrir, a cada 10 minutos e quando volta a internet.
- Se houver, aparece um aviso **"Nova versão do sistema disponível — Atualizar agora"**.
- **Nunca atualiza no meio de uma venda**: com itens no cupom, janela aberta ou dados
  ainda salvando, ele espera. Se o caixa ficar 2 minutos parado e sem venda aberta,
  atualiza sozinho.

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html` | O sistema inteiro (é o único que muda no dia a dia) |
| `pwa.js` | Instalação como aplicativo e aviso de nova versão |
| `sw.js` | Guarda o sistema no computador para funcionar sem internet |
| `manifest.webmanifest`, `icons/` | Nome e ícone do aplicativo |
