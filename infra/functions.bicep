@description('The location for the Function App.')
param location string

@description('The name of the Function App.')
param functionAppName string

@description('The name of the storage account for the Function App.')
param storageAccountName string

@description('The connection string for Application Insights.')
@secure()
param appInsightsConnectionString string

@description('The name of the Key Vault to link to the Function App.')
param keyVaultName string

@description('The connection string for the PostgreSQL database.')
@secure()
param dbConnectionString string

var appServicePlanName = '${functionAppName}-plan'

resource appServicePlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
  properties: {}
}

resource functionApp 'Microsoft.Web/sites@2022-09-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https,AccountName=${storageAccountName},EndpointSuffix=${environment().storage.suffix},AccountKey=${listKeys(resourceId('Microsoft.Storage/storageAccounts', storageAccountName), '2023-01-01').keys[0].value}'
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'node'
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsightsConnectionString
        }
        {
          name: 'DATABASE_URL'
          value: dbConnectionString
        }
        {
          name: 'JWT_SECRET'
          value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=JwtSecret)'
        }
        {
            name: 'AZURE_STORAGE_ACCOUNT_NAME'
            value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=StorageAccountName)'
        }
        {
            name: 'AZURE_STORAGE_ACCOUNT_KEY'
            value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=StorageAccountKey)'
        }
        {
            name: 'NODE_ENV'
            value: 'production'
        }
      ]
      ftpsState: 'FtpsOnly'
    }
  }
}

output principalId string = functionApp.identity.principalId
output name string = functionApp.name