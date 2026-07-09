
# 🚀 MissclicKS - Controle de KS MJR

Sistema de ranking futurista para acompanhamento de Kill Score.

## 📁 Como preparar para o GitHub
Para que o sistema funcione corretamente, seu repositório deve ter esta estrutura:
```
/
├── index.html
├── index.tsx
├── types.ts
├── dados.csv        <-- SEU ARQUIVO DE DADOS AQUI
├── services/
└── components/
```

## 🔗 Por que não consigo conectar ao GitHub?
Se você tentar usar o link direto `https://github.com/.../dados.csv`, o navegador receberá uma página HTML em vez dos dados puros.

**A Solução:**
1. No GitHub, clique no arquivo `dados.csv`.
2. Clique no botão **"Raw"** no topo superior direito do arquivo.
3. Use a URL que abrirá (começa com `raw.githubusercontent.com`).
4. **DICA:** Se você subir o arquivo `dados.csv` na mesma pasta do `index.html`, o app agora o detectará automaticamente sem precisar de links externos!

## ⚡ Deploy na Vercel
1. Crie uma conta em [vercel.com](https://vercel.com).
2. Conecte seu repositório do GitHub.
3. No campo "Build Command", deixe vazio (ou coloque `npx tailwindcss -o output.css`).
4. Clique em **Deploy**.

---
*Desenvolvido para a comunidade MJR.*
