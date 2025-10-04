@description('The base name for all resources.')
param baseName string = 'limpopo${uniqueString(resourceGroup().id)}'

@description('The location for all resources.')
param location string = resourceGroup().location

@description('The admin username for the PostgreSQL server.')
@secure()
param postgresAdmin string

@description('The admin password for the PostgreSQL server.')
@secure()
param postgresAdminPassword string

@description('The PostgreSQL server name.')
param postgresServerName string = 'limpopoconnect-db'

var storageAccountName = '${baseName}sa'
var functionAppName = '${baseName}-api'
var keyVaultName = '${baseName}-kv'
var appInsightsName = '${baseName}-ai'
var logAnalyticsWorkspaceName = '${baseName}-logs'

// Application Insights & Log Analytics
module appInsights 'appinsights.bicep' = {
  name: 'appInsightsDeployment'
  params: {
    location: location
    appInsightsName: appInsightsName
    logAnalyticsWorkspaceName: logAnalyticsWorkspaceName
  }
}

// Key Vault
module keyVault 'keyvault.bicep' = {
  name: 'keyVaultDeployment'
  params: {
    location: location
    keyVaultName: keyVaultName
    tenantId: tenant().tenantId
  }
}

// Storage Account
module storage 'storage.bicep' = {
  name: 'storageAccountDeployment'
  params: {
    location: location
    storageAccountName: storageAccountName
  }
}

// PostgreSQL Server
module db 'db.bicep' = {
  name: 'dbDeployment'
  params: {
    location: location
    serverName: postgresServerName
    adminUsername: postgresAdmin
    adminPassword: postgresAdminPassword
  }
}

// Function App
module functions 'functions.bicep' = {
  name: 'functionsDeployment'
  params: {
    location: location
    functionAppName: functionAppName
    storageAccountName: storageAccountName
    appInsightsConnectionString: appInsights.outputs.connectionString
    keyVaultName: keyVault.outputs.name
    dbConnectionString: db.outputs.connectionString
  }
}

// Define the Key Vault Secrets User role ID
var keyVaultSecretsUserRoleId = '4633458b-17de-408a-b874-0445c86b69e6'

// Grant Function App's Managed Identity access to Key Vault secrets
resource functionAppRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.outputs.name, functions.outputs.principalId, keyVaultSecretsUserRoleId)
  scope: keyVault
  properties: {
    roleDefinitionId: resourceId('Microsoft.Authorization/roleDefinitions', keyVaultSecretsUserRoleId)
    principalId: functions.outputs.principalId
    principalType: 'ServicePrincipal'
  }
}

output functionAppPrincipalId string = functions.outputs.principalId
output functionAppName string = functionAppName
output apiUrl string = 'https://${functionAppName}.azurewebsites.net/api'
output dbConnectionString string = db.outputs.connectionString