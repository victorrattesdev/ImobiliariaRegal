# Regal Imobiliária — Next.js

Portal migrado para **Next.js 15 (App Router)**, UI profissional em **português (pt-BR)**, filtros corrigidos, admin aprimorado e segurança reforçada.

## Rodar local

```bash
npm install
npm run db:seed
npm run dev
```

Abra **http://localhost:3000**

| Rota | Função |
|------|--------|
| `/` | Imóveis gerais (exclui Teresópolis) |
| `/teresopolis` | Banner + imóveis de Teresópolis |
| `/imovel/[id]` | Detalhe do imóvel |
| `/login` | Login admin |
| `/admin` | Criação e gestão de imóveis |

**Login:** `admin` / `admin123`

Por padrão o `.env` usa `STORAGE=json` (dados em `data/`), então o site sobe sem Postgres.

---

## Hospedagem gratuita (recomendada)

### 1. Banco — [Neon](https://console.neon.tech) (free)

1. Crie conta → New Project  
2. Copie a **Connection string** (`DATABASE_URL`)  
3. No `.env` local:

```env
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require
STORAGE=
SESSION_SECRET=uma-chave-longa-aleatoria
ADMIN_PASSWORD=admin123
```

4. Rode:

```bash
npm run db:push
npm run db:seed
```

### 2. Site — [Vercel](https://vercel.com) (Hobby free)

1. Importe o repositório no Vercel  
2. Em Environment Variables, adicione:
   - `DATABASE_URL` (Neon)
   - `SESSION_SECRET`
   - `STORAGE=` (vazio, para usar Postgres)
3. Deploy

Vercel + Neon é o combo gratuito mais alinhado com Next.js.

> Se a senha antiga do Neon foi exposta no `.env`, **rotacione** no painel do Neon.

---

## Segurança incluída

- Cookie de sessão **httpOnly** assinado (JWT / `jose`)
- Rotas de escrita só para `role=admin`
- Rate limit no login
- Upload com whitelist MIME + limite 5MB
- Headers (CSP, X-Frame-Options, nosniff)
- Embed de mapa apenas de domínios Google
