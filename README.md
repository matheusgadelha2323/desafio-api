# Desafio Técnico - Consumo de API Externa

Aplicação Rails que consome a API externa JSONPlaceholder e atualiza dados de uma Task sem reload da página.

## Stack

- Ruby 3.3.0
- Rails 8.0.2
- Hotwire (Turbo Stream + Stimulus)
- ViewComponent
- Tailwind CSS + Flowbite
- SQLite
- Faraday (HTTP client)
- RSpec + WebMock + FactoryBot

## Como rodar (Docker) [Recomendado]

```bash
# Build e iniciar containers (modo detached)
docker-compose up --build -d

# Rodar migrations e seeds
docker-compose exec web rails db:migrate db:seed

# Acessar a aplicação
http://localhost:3000
```

### Reset completo (do zero)

```bash
# Parar containers e remover volumes
docker-compose down -v

# Remover banco local (Rails 8 usa storage/ para SQLite)
rm -f storage/*.sqlite3*

# Rebuild e iniciar
docker-compose up --build -d

# Setup do banco
docker-compose exec web rails db:migrate db:seed
```

## Como rodar (Local)

```bash
# Instalar dependências
bundle install
yarn install

# Setup do banco
rails db:migrate db:seed

# Iniciar servidor
bin/dev
```

## Como rodar os testes

```bash
# Via Docker
docker-compose exec web rspec

# Local
bundle exec rspec
```

## Funcionalidade

1. Acesse `http://localhost:3000`
2. Clique no botão "Sincronizar usuário"
3. Os dados do usuário são buscados da API `https://jsonplaceholder.typicode.com/users/1`
4. A interface atualiza sem reload (Turbo Stream)

## Arquitetura

```
app/
├── components/           # ViewComponents
│   ├── task_card_component.rb
│   └── sync_button_component.rb
├── controllers/
│   └── tasks_controller.rb
├── models/
│   └── task.rb
├── services/             # Service Objects
│   ├── external_user_api_client.rb
│   └── user_sync_service.rb
└── javascript/
    └── controllers/
        └── sync_controller.js
```

## Decisões Técnicas

- **SQLite**: Simplicidade para o desafio, zero configuração
- **Faraday**: HTTP client robusto, fácil de mockar nos testes
- **Service Objects**: Separação de responsabilidades, testabilidade
- **ViewComponent**: Componentização real em vez de partials
- **Turbo Stream**: Atualização declarativa da UI, idiomático Rails 8
- **Result Pattern**: Tratamento de erros explícito nos services
