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

variable "env" {}
variable "location" {}
variable "rg-name" {}

locals {
  subscriptions = [
    "crm",
    "logger",
    "timereport-service",
    "ticket-service",
    "search-service",
    "marketing-service",
    "consultant-service",
    "workrequest-service",
    "customer-service",
    "notification-service"
  ]
}

resource "azurerm_servicebus_namespace" "service-bus" {
  location = var.location
  name = "bonliva-sb-${var.env}"
  resource_group_name = var.rg-name
  sku = "Standard"

  tags = {
    env = var.env
    terraform = true
  }
}

resource "azurerm_servicebus_topic" "topic-main" {
  name = "main"
  namespace_name = azurerm_servicebus_namespace.service-bus.name
  resource_group_name = azurerm_servicebus_namespace.service-bus.resource_group_name
}

resource "azurerm_servicebus_subscription" "crm-subscription" {
  for_each = toset(local.subscriptions)

  max_delivery_count = 1
  name = each.key
  namespace_name = azurerm_servicebus_namespace.service-bus.name
  resource_group_name = azurerm_servicebus_namespace.service-bus.resource_group_name
  topic_name = azurerm_servicebus_topic.topic-main.name
}

output "conn-str" {
  value = azurerm_servicebus_namespace.service-bus.default_secondary_connection_string
  sensitive = true
}

output "topic-name" {
  value = azurerm_servicebus_topic.topic-main.name
}
