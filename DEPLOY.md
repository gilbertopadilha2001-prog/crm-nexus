# Deploy — Nexus CRM na VPS Hostinger

## Pré-requisitos na VPS
- Docker + Docker Compose instalados
- Evolution API e n8n já rodando
- Porta 3000 livre (ou alterar a variável PORT)

## Passo 1: Enviar arquivos para a VPS

No seu Mac, execute:

```bash
# Crie um arquivo compactado (exclui node_modules e .next)
cd "/Users/gilbertopadilha/Documents/PROJETOS/PROJETOS/SITE CRM/nexusimoveis-crm-clone"
tar --exclude='node_modules' --exclude='.next' --exclude='.git' -czf nexus-crm.tar.gz .
```

Envie para a VPS:

```bash
scp nexus-crm.tar.gz root@SEU_IP_VPS:/opt/nexus-crm/
```

## Passo 2: Na VPS — Extrair e construir

```bash
ssh root@SEU_IP_VPS

# Criar diretório
mkdir -p /opt/nexus-crm
cd /opt/nexus-crm

# Extrair
tar -xzf nexus-crm.tar.gz
rm nexus-crm.tar.gz

# Construir e iniciar
docker compose up -d --build
```

## Passo 3: Verificar

```bash
# Ver logs
docker logs nexus-crm -f

# Verificar saúde
docker ps

# Testar acesso
curl http://localhost:3000
```

## Passo 4: Configurar proxy reverso (Nginx/Traefik)

Se estiver usando Nginx como proxy reverso:

```nginx
server {
    listen 80;
    server_name crm.nexusinovacoesimobiliarias.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Para HTTPS com Certbot:

```bash
certbot --nginx -d crm.nexusinovacoesimobiliarias.com.br
```

## Comandos úteis

```bash
# Reiniciar
docker compose restart nexus-crm

# Atualizar (novo deploy)
docker compose down
docker compose up -d --build

# Ver logs em tempo real
docker logs nexus-crm -f --tail 100
```

## Portas utilizadas

| Serviço | Porta |
|---------|-------|
| Nexus CRM | 3000 |
| Evolution API | (existente) |
| n8n | (existente) |
