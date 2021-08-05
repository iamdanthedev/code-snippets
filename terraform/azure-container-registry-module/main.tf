terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=2.60.0"
    }
  }
}

provider "azurerm" {
  features {}
}

variable "location" {}

resource "azurerm_container_registry" "acr" {
  location                 = var.location
  name                     = "bonlivacr"
  resource_group_name      = "azure-devops-rg"
  sku                      = "Premium"
  admin_enabled            = true
}

output "name" {
  value = azurerm_container_registry.acr.name
}

output "rg" {
  value = azurerm_container_registry.acr.resource_group_name
}

output "login-server" {
  value = azurerm_container_registry.acr.login_server
}

output "admin-username" {
  value = azurerm_container_registry.acr.admin_username
}

output "admin-password" {
  value = azurerm_container_registry.acr.admin_password
}
