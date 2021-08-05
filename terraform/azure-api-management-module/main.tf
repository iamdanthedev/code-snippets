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

variable "ai-key" {}

variable "crm-audience" {}
variable "consultant-jwt-audience" {}
variable "consultant-jwt-issuer" {}
variable "consultant-jwt-secret" {}

variable "consultant-auth-service-url" {}
variable "consultant-service-url" {}
variable "customer-service-url" {}
variable "timereport-service-url" {}
variable "workrequest-service-url" {}
variable "notification-service-url" {}
variable "search-service-url" {}

locals {
  services = {
    "consultant-service": var.consultant-service-url,
    "customer-service": var.customer-service-url,
    "timereport-service": var.timereport-service-url,
    "workrequest-service": var.workrequest-service-url,
    "search-service": var.search-service-url
  }

  total = length(keys(local.services))
  ids = tolist(keys(local.services))
  urls = tolist(values(local.services))
}

resource "azurerm_api_management" "api" {
  location = var.location
  name = "bonliva-api-management-${var.env}"
  publisher_email = "daniel.khoroshko@bonliva.se"
  publisher_name = "Bonliva AB"
  resource_group_name = var.rg-name
  sku_name = "Developer_1"
}

data "local_file" "xml-policy-file" {
  filename = "${path.module}/policy.xml"
}

data "local_file" "xml-public-policy-file" {
  filename = "${path.module}/public-policy.xml"
}

resource "azurerm_api_management_logger" "logger" {
  name                = "apim-logger"
  api_management_name = azurerm_api_management.api.name
  resource_group_name = var.rg-name

  application_insights {
    instrumentation_key = var.ai-key
  }
}

#
#  NAMED VALUES
#

resource "azurerm_api_management_named_value" "crm-audience" {
  api_management_name = azurerm_api_management.api.name
  display_name = "crm-audience"
  name = "crm-audience"
  resource_group_name = var.rg-name
  value = var.crm-audience
}

resource "azurerm_api_management_named_value" "mobile-app-jwt-issuer" {
  api_management_name = azurerm_api_management.api.name
  display_name = "mobile-app-jwt-issuer"
  name = "mobile-app-jwt-issuer"
  resource_group_name = var.rg-name
  value = var.consultant-jwt-issuer
}

resource "azurerm_api_management_named_value" "mobile-app-jwt-audience" {
  api_management_name = azurerm_api_management.api.name
  display_name = "mobile-app-jwt-audience"
  name = "mobile-app-jwt-audience"
  resource_group_name = var.rg-name
  value = var.consultant-jwt-audience
}


resource "azurerm_api_management_named_value" "mobile-app-jwt-signing-key" {
  api_management_name = azurerm_api_management.api.name
  display_name = "mobile-app-jwt-signing-key"
  name = "mobile-app-jwt-signing-key"
  resource_group_name = var.rg-name
  value = base64encode(var.consultant-jwt-secret)
}

resource "azurerm_api_management_named_value" "openid-config-url" {
  api_management_name = azurerm_api_management.api.name
  display_name = "openid-config-url"
  name = "openid-config-url"
  resource_group_name = var.rg-name
  value = "https://login.microsoftonline.com/docconnectnordicab.onmicrosoft.com/.well-known/openid-configuration"
}

resource "azurerm_api_management_named_value" "min-app-required-version" {
  api_management_name = azurerm_api_management.api.name
  display_name = "min-app-required-version"
  name = "min-app-required-version"
  resource_group_name = var.rg-name
  value = "3.4.4"
}

#
#  CONSULTANT AUTH SERVICE
#

resource "azurerm_api_management_api" "consultant-auth-service" {
  api_management_name = azurerm_api_management.api.name
  display_name = "consultant-auth-service"
  name = "consultant-auth-service-api-${var.env}"
  path = "consultant-auth-service"
  protocols = ["https"]
  resource_group_name = var.rg-name
  revision = "1"
  subscription_required = false
  service_url = var.consultant-auth-service-url
}

resource "azurerm_api_management_api_operation" "consultant-auth-service-op-get" {
  api_management_name = azurerm_api_management.api.name
  api_name = azurerm_api_management_api.consultant-auth-service.name
  display_name = "proxy-get"
  method = "GET"
  operation_id = "proxy-get"
  resource_group_name = var.rg-name
  url_template = "/*"
}

resource "azurerm_api_management_api_operation" "consultant-auth-service-op-post" {
  api_management_name = azurerm_api_management.api.name
  api_name = azurerm_api_management_api.consultant-auth-service.name
  display_name = "proxy-post"
  method = "POST"
  operation_id = "proxy-post"
  resource_group_name = var.rg-name
  url_template = "/*"
}

#
#  NOTIFICATION
#

resource "azurerm_api_management_api" "notification-service" {
  api_management_name = azurerm_api_management.api.name
  display_name = "notification-service"
  name = "notification-service-api-${var.env}"
  path = "notification-service"
  protocols = ["https"]
  resource_group_name = var.rg-name
  revision = "1"
  subscription_required = false
  service_url = var.notification-service-url
}

resource "azurerm_api_management_api_operation" "notification-service-op-get" {
  api_management_name = azurerm_api_management.api.name
  api_name = azurerm_api_management_api.notification-service.name
  display_name = "proxy-get"
  method = "GET"
  operation_id = "proxy-get"
  resource_group_name = var.rg-name
  url_template = "/*"
}

resource "azurerm_api_management_api_operation" "notification-service-op-post" {
  api_management_name = azurerm_api_management.api.name
  api_name = azurerm_api_management_api.notification-service.name
  display_name = "proxy-post"
  method = "POST"
  operation_id = "proxy-post"
  resource_group_name = var.rg-name
  url_template = "/*"
}


#
# Policy-based
#

resource "azurerm_api_management_api" "apis" {
  count = local.total

  api_management_name = azurerm_api_management.api.name
  display_name = local.ids[count.index]
  name = "${local.ids[count.index]}-api-${var.env}"
  path = local.ids[count.index]
  protocols = ["https"]
  resource_group_name = var.rg-name
  revision = "1"
  subscription_required = false
  service_url = local.urls[count.index]
}

resource "azurerm_api_management_api_operation" "op-public-get" {
  count = local.total

  api_management_name = azurerm_api_management.api.name
  api_name = azurerm_api_management_api.apis[count.index].name
  display_name = "proxy-public-get"
  method = "GET"
  operation_id = "proxy-public-get"
  resource_group_name = var.rg-name
  url_template = "/api/public/*"
}

resource "azurerm_api_management_api_operation" "op-public-post" {
  count = local.total

  api_management_name = azurerm_api_management.api.name
  api_name = azurerm_api_management_api.apis[count.index].name
  display_name = "proxy-public-post"
  method = "POST"
  operation_id = "proxy-public-post"
  resource_group_name = var.rg-name
  url_template = "/api/public/*"
}

resource "azurerm_api_management_api_operation" "op-get" {
  count = local.total

  api_management_name = azurerm_api_management.api.name
  api_name = azurerm_api_management_api.apis[count.index].name
  display_name = "proxy-get"
  method = "GET"
  operation_id = "proxy-get"
  resource_group_name = var.rg-name
  url_template = "/*"
}

resource "azurerm_api_management_api_operation_policy" "op-get-policy" {
  count = local.total

  api_management_name = azurerm_api_management.api.name
  api_name = azurerm_api_management_api.apis[count.index].name
  operation_id = azurerm_api_management_api_operation.op-get[count.index].operation_id
  resource_group_name = var.rg-name

  xml_content = data.local_file.xml-policy-file.content
}

resource "azurerm_api_management_api_operation" "op-post" {
  count = local.total

  api_management_name = azurerm_api_management.api.name
  api_name = azurerm_api_management_api.apis[count.index].name
  display_name = "proxy-post"
  method = "POST"
  operation_id = "proxy-post"
  resource_group_name = var.rg-name
  url_template = "/*"
}

resource "azurerm_api_management_api_operation_policy" "op-post-policy" {
  count = local.total

  api_management_name = azurerm_api_management.api.name
  api_name = azurerm_api_management_api.apis[count.index].name
  operation_id = azurerm_api_management_api_operation.op-post[count.index].operation_id
  resource_group_name = var.rg-name

  xml_content = data.local_file.xml-policy-file.content
}
