# Manual da Marca — EletroBidu Partners

Manual oficial da marca em 21 telas, a partir da versão HTML V2 original, sem mudanças intencionais de identidade visual, comportamento ou conteúdo.

## Tecnologia

**HTML5 + CSS3 + JavaScript (módulos ES)**. O projeto utiliza **Node.js 20 ou superior** apenas para o servidor local e a compilação estática, **sem React, sem dependências externas de npm e sem frameworks**. Isso mantém o site leve, fácil de editar e compatível com a Vercel. As fontes oficiais *Barlow Condensed* e *Inter* são carregadas via Google Fonts, tal como no HTML original, exigindo internet para carregar a versão web dessas fontes.

## Rodar no Windows (VS Code)

1. Instale o [Node.js LTS](https://nodejs.org/) e abra a pasta `manual-da-marca` no VS Code.
2. Abra o terminal (**Terminal > New Terminal**) e execute:

```powershell
npm install
npm run dev
```

3. Acesse **http://localhost:5173** no navegador. Ao alterar HTML, CSS ou JavaScript, atualize a página (F5). O servidor de desenvolvimento recompila automaticamente os arquivos na próxima requisição da página.

## Gerar / verificar produção

```powershell
npm run check
npm run build
npm run preview
```

- `npm run check` verifica as **21 telas**, entradas do menu, IDs usados pelo JavaScript, imports, recursos locais e downloads.
- `npm run build` gera a pasta **`dist/`**, que contém a versão estática para publicação.
- `npm run preview` abre a versão compilada em **http://localhost:4173**.

## Publicar pela Vercel

1. Crie um repositório vazio no GitHub e faça o upload/push do conteúdo da pasta `manual-da-marca`.
2. Na [Vercel](https://vercel.com/new), selecione **Add New > Project** e importe o repositório.
3. Em **Framework Preset**, selecione **Other** se necessário.
4. Configurações já definidas em `vercel.json`:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install` (sem dependências)
5. Clique em **Deploy**. A página inicial será servida por `dist/index.html`.

### Comandos Git (PowerShell)

```powershell
git init
git add .
git commit -m "Organiza manual EBP para publicação"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git push -u origin main
```

Substitua o endereço da linha `git remote add origin` pelo URL do repositório criado no GitHub. Para os próximos envios: `git add .`, `git commit -m "..."`, `git push`.

## Organização de pastas

```text
manual-da-marca/
├── src/
│   ├── templates/index.html          # Layout HTML principal e referências de CSS/JS
│   ├── components/                  # Menu, rodapé de controles e filtros visuais
│   ├── pages/                       # 21 telas do manual, em ordem numerada
│   ├── styles/                      # Base, identidade, aplicações, navegação, responsividade
│   └── scripts/                     # Inicialização, navegação, paleta, laboratório, checklist
├── public/
│   ├── assets/logos/                # Logos e símbolos originais, inclusive SVG
│   ├── assets/images/               # Fotografias reais do HTML V2
│   └── downloads/                   # Arquivo Illustrator e kit de logotipos oficiais
├── scripts/                         # Compilação, servidor local, checagem de integridade
├── package.json
├── package-lock.json
├── vercel.json
├── .gitignore
└── README.md
```

## Como editar sem mudar o visual

- **Página:** `src/pages/NN-nome.html` (cada tela é uma seção HTML autônoma).
- **Navegação:** `src/components/navigation.html` e `src/scripts/navigation.js`.
- **Controles:** `src/components/controls.html`.
- **Cores globais e fontes:** `src/styles/01-base.css`.
- **Estilos da identidade e das aplicações:** `src/styles/02-identidade.css`, `03-linguagem-aplicacoes.css`.
- **Botão flutuante:** `src/styles/04-navegacao.css`.
- **Celular e tablet:** `src/styles/05-responsivo.css`.
- **Imagens:** `public/assets/images/` e `public/assets/logos/`.
- **Downloads:** `public/downloads/`.

**Importante:** o nome do arquivo da página determina sua ordem. A compilação combina as páginas numeradas em uma única `index.html` de produção para manter o scroll entre as 23 telas, os links e a navegação original. O servidor local serve a mesma compilação que será enviada para a Vercel.

**Recursos preservados:** todos os PNGs, SVGs, fotos WebP e os arquivos AI/ZIP são cópias dos arquivos da versão V2, sem substituições. Não há fontes locais no pacote recebido; elas continuam sendo buscadas nas fontes web usadas na V2.


## Camada de experiência visual

O site mantém integralmente a identidade da EletroBidu Partners: **Barlow Condensed**, **Inter**, as cores da paleta oficial, os logotipos e os conteúdos de `src/pages`.

As melhorias visuais ficam isoladas em:

- `src/styles/06-experiencia.css`: superfícies, bordas, sombras sutis, raios, microinterações, adaptações responsivas e refinamentos de navegação.
- `src/scripts/experience.js`: entrada suave de cards ao rolar, iluminação discreta no card da capa e rótulo da página atual.
- `src/components/navigation.html` e `src/scripts/navigation.js`: busca de capítulos no menu e navegação acessível.
- `src/components/controls.html`: paginação contextual com o título da seção.

O efeito de entrada respeita `prefers-reduced-motion` e não altera os arquivos de marca. Para alterar somente o acabamento visual no futuro, comece por `06-experiencia.css`; não é necessário editar as 21 telas.

## Organização editorial (novembro de 2026)

As 21 telas reúnem **Distribuição de cores + Contraste** e **Tipografia + Hierarquia**. Os arquivos fonte `src/pages/11-contraste-e-legibilidade.html` e `src/pages/13-hierarquia-tipografica.html` foram preservados como referência histórica; o build não os publica separadamente. A interface mantém alternância Azul Bidu / branco e as variantes oficiais dos logotipos.
