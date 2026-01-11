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

## Como rodar (Docker)

```bash
# Build e iniciar containers
docker-compose up --build

# Em outro terminal, rodar migrations e seeds
docker-compose exec web rails db:migrate db:seed

# Acessar a aplicação
http://localhost:3000
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
