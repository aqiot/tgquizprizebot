.PHONY: help build dev prod stop clean logs shell test

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Build production Docker image
	docker-compose build

dev: ## Start development environment with hot-reloading
	docker-compose -f docker-compose.dev.yml up --build

dev-d: ## Start development environment in detached mode
	docker-compose -f docker-compose.dev.yml up -d --build

prod: ## Start production environment
	docker-compose up --build

prod-d: ## Start production environment in detached mode
	docker-compose up -d --build

stop: ## Stop all containers
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

clean: ## Stop containers and remove volumes
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v
	docker system prune -f

logs: ## Show container logs
	docker-compose logs -f

logs-prod: ## Show production container logs
	docker-compose logs -f app nginx

logs-dev: ## Show development container logs
	docker-compose -f docker-compose.dev.yml logs -f

shell: ## Open shell in app container
	docker-compose exec app sh

shell-dev: ## Open shell in development container
	docker-compose -f docker-compose.dev.yml exec app-dev sh

test: ## Run tests in container
	docker-compose -f docker-compose.dev.yml run --rm app-dev npm test

build-push: ## Build and push to Docker Hub (requires login)
	docker build -t telegram-quiz-app:latest .
	docker tag telegram-quiz-app:latest $(DOCKER_REGISTRY)/telegram-quiz-app:latest
	docker push $(DOCKER_REGISTRY)/telegram-quiz-app:latest

health: ## Check health status of the app
	curl -f http://localhost:3001/api/health || exit 1

restart: ## Restart all containers
	docker-compose restart

restart-dev: ## Restart development containers
	docker-compose -f docker-compose.dev.yml restart

ps: ## Show running containers
	docker-compose ps

env-check: ## Verify environment variables are set
	@echo "Checking required environment variables..."
	@test -n "$(GOOGLE_PROJECT_ID)" || (echo "GOOGLE_PROJECT_ID is not set" && exit 1)
	@test -n "$(GOOGLE_CLIENT_EMAIL)" || (echo "GOOGLE_CLIENT_EMAIL is not set" && exit 1)
	@echo "Environment variables are properly configured!"