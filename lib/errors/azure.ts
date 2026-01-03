import type { ErrorCode } from './types';

export const azureErrors: Record<string, ErrorCode> = {
    'AuthenticationFailed': {
      code: 'AuthenticationFailed',
      name: 'Authentication Failed: OAuth Token Validation Failure',
      description: `Your OAuth token failed ARM's validation checks—either expired, cryptographically invalid, or issued for the wrong tenant/audience. This is a client-side 401 error, meaning your credentials couldn't authenticate. ARM validates tokens against Azure AD (Entra ID) before allowing any resource operations on VMs, AKS clusters, Azure SQL databases, or App Services. The token's signature, expiration (exp claim), or audience (aud claim) didn't pass validation.`,
      metaDescription: 'Struggling with AuthenticationFailed? Decode tokens, check credentials, and verify tenant context with these diagnostic steps.',
      causes: [
        `Token Expiration: Access tokens typically expire after 1 hour, but this duration varies by token type and Azure AD configuration. The token's exp claim is less than the current Unix timestamp. This is transient—refreshing the token fixes it.`,
        `Credential Rotation: The client secret or certificate was rotated in Azure AD, but your application still holds the old credential. Service principal credentials have an endDate that may be in the past. This is persistent—you must update your application configuration.`,
        `Cross-Tenant Authentication: The token's issuer (iss claim) or tenant context doesn't match the subscription's Azure AD tenant. The subscription belongs to a different tenant than your service principal. Cross-tenant access requires B2B federation or guest user invitation.`,
        `Audience Mismatch: Calling different Azure services with the wrong token scope. For ARM control-plane operations, use scope 'https://management.azure.com/.default'. For Storage data-plane operations, use 'https://storage.azure.com/.default'. The scope determines the audience claim.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check if token is expired by decoding it (jwt.io) and checking the exp claim:\n   Decode your token and verify exp claim is greater than current Unix timestamp`,
        `Step 2: Diagnose - Check service principal credentials for rotation:\n   az ad sp credential list --id <app-id> --query "[].{keyId:keyId, endDate:endDate}"\n   Look for credentials with endDate in the past`,
        `Step 3: Diagnose - Verify tenant context matches subscription:\n   az account show --query "{tenantId:tenantId, subscriptionId:id}"\n   Compare tenantId to where your service principal exists`,
        `Step 4: Fix - Refresh expired tokens using your credential library's getToken() method. @azure/identity credential classes handle token refresh automatically.`,
        `Step 5: Fix - Update rotated credentials in your application configuration (environment variables, Key Vault references, certificate stores). Restart your application after updating.`,
        `Step 6: Fix - Use correct token scope for the operation. For ARM: 'https://management.azure.com/.default'. For Storage: 'https://storage.azure.com/.default'.`,
        `Step 7: Verify - Retry your operation. It should succeed with HTTP 200/201 instead of 401 AuthenticationFailed.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Authentication Diagnosis Script',
          code: `# This script helps diagnose AuthenticationFailed errors by checking credentials and tenant context

# Step 1: Check current subscription and tenant context
echo "Checking current subscription and tenant..."
az account show --query "{subscriptionId:id, tenantId:tenantId, name:name}" --output table

# Step 2: Check service principal credentials (replace APP_ID with your service principal ID)
APP_ID="your-service-principal-id"
echo "Checking service principal credentials for APP_ID: \$APP_ID"
az ad sp credential list --id \$APP_ID --query "[].{keyId:keyId, endDate:endDate}" --output table

# Step 3: Check if any credentials are expired
echo "Checking for expired credentials..."
CURRENT_DATE=\$(date +%s)
az ad sp credential list --id \$APP_ID --query "[?endDate < '\$CURRENT_DATE'].{keyId:keyId, endDate:endDate}" --output table

# Step 4: List all service principals in the current tenant
echo "Listing service principals in current tenant..."
az ad sp list --query "[].{appId:appId, displayName:displayName}" --output table

# Step 5: Test authentication by listing resource groups
echo "Testing authentication by listing resource groups..."
if az group list --output table 2>&1; then
  echo "Authentication successful"
else
  echo "Authentication failed - check the error message above"
fi

# Step 6: Check token audience (requires Azure CLI to be logged in)
echo "To check token audience, decode your token at https://jwt.io"
echo "Verify the 'aud' claim matches:"
echo "  - ARM operations: https://management.azure.com/"
echo "  - Storage operations: https://storage.azure.com/"`,
        },
      ],
      relatedCodes: ['AuthorizationFailed', 'InvalidAuthenticationInfo'],
      provider: 'azure',
    },
    'AuthorizationFailed': {
      code: 'AuthorizationFailed',
      name: 'Authorization Failed: RBAC Permission Denied',
      description: `You're authenticated, but your RBAC roles don't grant the required permission at the operation's scope. This 403 client-side error means ARM blocked the operation after authentication passed—your identity lacks the necessary role actions. ARM evaluates permissions hierarchically (subscription → resource group → resource), so a role at resource group scope won't help with subscription-level operations. Deny assignments at parent scopes always override allow assignments below them. Common across VM management, AKS clusters, Azure SQL databases, and App Service deployments.`,
      metaDescription: 'Debug Azure AuthorizationFailed. Find which role actions are missing and where to assign permissions in the RBAC hierarchy.',
      causes: [
        `RBAC Scope Mismatch: Your role is assigned at a narrower scope than the operation requires. Creating subscription-level resources (e.g., resource groups) fails when your role is at resource group scope. ARM doesn't automatically elevate permissions from child to parent scope.`,
        `Missing Role Actions: Your role (e.g., Reader) doesn't include the required action. Read operations succeed but writes fail. The error message includes the specific action needed (e.g., "Microsoft.Storage/storageAccounts/write").`,
        `Role Propagation Delay: Role assignments take time to propagate across Azure AD and ARM (typically 1-5 minutes, but not guaranteed). Operations fail immediately after assigning a role even though the assignment exists. This is transient—waiting and retrying helps.`,
        `Deny Assignment Blocking: Deny assignments at parent scopes override allow assignments at child scopes. Operations fail despite having the correct role because a deny assignment is blocking. Deny assignments take precedence over allow assignments.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check your role assignments at the operation scope:\n   az role assignment list --assignee <your-principal-id> --scope /subscriptions/<sub-id> --all --output table`,
        `Step 2: Diagnose - Check for deny assignments that might be blocking:\n   az role assignment list --scope <scope> --include-denied --output table`,
        `Step 3: Diagnose - Verify your role includes the required action:\n   az role definition show --name <role-name> --query "permissions[0].actions" --output table`,
        `Step 4: Fix - Assign role at the correct scope. For subscription-level operations:\n   az role assignment create --assignee <principal-id> --role <role-name> --scope /subscriptions/<sub-id>`,
        `Step 5: Fix - For resource group operations:\n   az role assignment create --assignee <principal-id> --role <role-name> --scope /subscriptions/<sub-id>/resourceGroups/<rg-name>`,
        `Step 6: Fix - If role doesn't include required action, assign a different role (e.g., Contributor instead of Reader).`,
        `Step 7: Verify - Wait 5-10 minutes for role propagation, then retry your operation. It should succeed instead of returning AuthorizationFailed.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'RBAC Permission Diagnosis',
          code: `# This script helps diagnose AuthorizationFailed errors by checking RBAC permissions

# Step 1: Get your current principal ID (user or service principal)
echo "Getting current principal information..."
CURRENT_USER=\$(az account show --query user.name -o tsv)
echo "Current user: \$CURRENT_USER"

# Step 2: Get subscription ID
SUBSCRIPTION_ID=\$(az account show --query id -o tsv)
echo "Subscription ID: \$SUBSCRIPTION_ID"

# Step 3: Check role assignments at subscription scope
echo "Checking role assignments at subscription scope..."
az role assignment list \\
  --assignee \$CURRENT_USER \\
  --scope /subscriptions/\$SUBSCRIPTION_ID \\
  --all \\
  --output table

# Step 4: Check for deny assignments
echo "Checking for deny assignments..."
az role assignment list \\
  --scope /subscriptions/\$SUBSCRIPTION_ID \\
  --include-denied \\
  --output table

# Step 5: Check role definition for a specific role (example: Contributor)
echo "Checking Contributor role permissions..."
az role definition show --name "Contributor" --query "permissions[0].actions" --output table

# Step 6: Check role assignments at resource group scope (replace RG_NAME)
RG_NAME="your-resource-group"
echo "Checking role assignments at resource group scope..."
az role assignment list \\
  --assignee \$CURRENT_USER \\
  --scope /subscriptions/\$SUBSCRIPTION_ID/resourceGroups/\$RG_NAME \\
  --all \\
  --output table

# Step 7: Test permission by attempting a read operation
echo "Testing read permission..."
az group list --output table

# Step 8: If you need to assign a role, use this command (requires appropriate permissions):
# az role assignment create \\
#   --assignee \$CURRENT_USER \\
#   --role "Contributor" \\
#   --scope /subscriptions/\$SUBSCRIPTION_ID`,
        },
      ],
      relatedCodes: ['AuthenticationFailed', 'Forbidden'],
      provider: 'azure',
    },
    'ResourceNotFound': {
      code: 'ResourceNotFound',
      name: 'Resource Not Found: ARM Resource URI Invalid',
      description: `ARM couldn't locate the resource at your specified path—the resource ID might be invalid, the resource was deleted, or you're hitting the wrong subscription. This 404 client-side error indicates the resource provider couldn't resolve your request. ARM checks the resource ID format first, then queries the provider. Resources like Key Vaults and Storage accounts can be soft-deleted, existing in a "Deleted" state during retention but inaccessible via standard GET operations. Applies to VMs, AKS clusters, Azure SQL databases, and App Service web apps.`,
      metaDescription: 'Solve the ResourceNotFound mystery. Check subscription context, verify resource IDs, and recover soft-deleted resources with these steps.',
      causes: [
        `Invalid Resource ID: Resource ID typos (subscription GUID format, resource group name, provider namespace, resource name). The resource ID format is incorrect or contains typos. Resource IDs must follow: /subscriptions/{guid}/resourceGroups/{name}/providers/{namespace}/{type}/{name}.`,
        `Soft-Deleted Resource: After deleting a Key Vault or Storage account, the resource may be soft-deleted. Soft-delete support varies by resource type—Key Vaults and Storage accounts support it, but many others don't. During retention, standard GET operations return ResourceNotFound even though the resource technically exists.`,
        `Wrong Subscription Context: Resources working before in a different subscription suggests wrong subscription context. ARM queries resources within your current authentication context. The resource is in subscription A while you're authenticated to subscription B.`,
        `Moved Resource: After moving resources, they exist but at a different path. Resources can be moved between subscriptions or resource groups, but code/configuration still referencing the old resource ID won't work.`,
      ],
      solutions: [
        `Step 1: Diagnose - Verify resource ID format and check if resource exists:\n   az resource show --ids <resource-id> --output table`,
        `Step 2: Diagnose - Search for resource by name across subscriptions:\n   az graph query -q "Resources | where name == '<resource-name>' | project id, name, type, location" --output table`,
        `Step 3: Diagnose - Check for soft-deleted Key Vaults:\n   az keyvault list-deleted --query "[?name=='<vault-name>']" --output table`,
        `Step 4: Diagnose - Check for soft-deleted Storage accounts:\n   az storage account list-deleted --query "[?name=='<account-name>']" --output table`,
        `Step 5: Diagnose - Verify current subscription context:\n   az account show --query "{subscriptionId:id, name:name}" --output table`,
        `Step 6: Fix - Switch to correct subscription if needed:\n   az account set --subscription <sub-id>`,
        `Step 7: Fix - Restore soft-deleted Key Vault if found:\n   az keyvault recover --name <vault-name> --location <location>`,
        `Step 8: Fix - Restore soft-deleted Storage account if found:\n   az storage account restore --name <account> --resource-group <rg> --deleted-account-name <deleted-name>`,
        `Step 9: Verify - Retry resource lookup after fixes:\n   az resource show --ids <resource-id> --output table`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Resource Lookup and Recovery',
          code: `# This script helps diagnose ResourceNotFound errors by finding and recovering resources

# Step 1: Get current subscription context
echo "Checking current subscription..."
az account show --query "{subscriptionId:id, name:name, tenantId:tenantId}" --output table

# Step 2: Example resource ID (replace with your actual resource ID)
RESOURCE_ID="/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/my-rg/providers/Microsoft.Compute/virtualMachines/my-vm"
echo "Checking resource: \$RESOURCE_ID"

# Step 3: Try to show the resource
if az resource show --ids \$RESOURCE_ID --output table 2>&1; then
  echo "Resource found"
else
  echo "Resource not found. Continuing diagnosis..."
fi

# Step 4: Search for resource by name (replace RESOURCE_NAME)
RESOURCE_NAME="my-vm"
echo "Searching for resource by name: \$RESOURCE_NAME"
az graph query -q "Resources | where name == '\$RESOURCE_NAME' | project id, name, type, location" --output table

# Step 5: Check for soft-deleted Key Vaults (replace VAULT_NAME)
VAULT_NAME="my-keyvault"
echo "Checking for soft-deleted Key Vault: \$VAULT_NAME"
az keyvault list-deleted --query "[?name=='\$VAULT_NAME']" --output table

# Step 6: Check for soft-deleted Storage accounts (replace ACCOUNT_NAME)
ACCOUNT_NAME="mystorageaccount"
echo "Checking for soft-deleted Storage account: \$ACCOUNT_NAME"
az storage account list-deleted --query "[?name=='\$ACCOUNT_NAME']" --output table

# Step 7: List all subscriptions to find where resource might be
echo "Listing all accessible subscriptions..."
az account list --query "[].{subscriptionId:id, name:name, state:state}" --output table

# Step 8: If resource is soft-deleted and you want to recover it:
# For Key Vault:
# az keyvault recover --name \$VAULT_NAME --location <location>
# For Storage account:
# az storage account restore --name \$ACCOUNT_NAME --resource-group <rg> --deleted-account-name \$ACCOUNT_NAME`,
        },
      ],
      relatedCodes: ['NotFound', 'InvalidResource'],
      provider: 'azure',
    },
    'InvalidAuthenticationInfo': {
      code: 'InvalidAuthenticationInfo',
      name: 'Invalid Authentication Info: Header Format Error',
      description: `Your Authorization header violates the OAuth 2.0 Bearer format—ARM can't parse it before even validating the token. This 401 client-side error means the header structure is wrong: missing "Bearer " prefix, wrong case ("authorization" vs "Authorization"), or malformed JWT (must have 3 dot-separated segments: header.payload.signature). ARM validates header format before token content, so this fails earlier than AuthenticationFailed. Appears in VM operations, AKS API calls, Azure SQL connections, and App Service deployments when headers are manually constructed.`,
      metaDescription: 'Resolve InvalidAuthenticationInfo. Fix Authorization header format, verify Bearer token syntax, and validate JWT structure.',
      causes: [
        `Missing Bearer Prefix: Your Authorization header contains the token but lacks the "Bearer " prefix. ARM requires exactly "Authorization: Bearer <token>" with a single space between "Bearer" and the token. Common mistakes include "Authorization: <token>" (no Bearer), "Authorization: bearer <token>" (lowercase), or "Authorization: Bearer<token>" (no space).`,
        `Header Name Case Mismatch: ARM's validation is case-sensitive for the Authorization header, even though HTTP headers are case-insensitive per RFC 7230. The header name must be exactly "Authorization" (capital A). "authorization" or "AUTHORIZATION" will fail.`,
        `JWT Structure Violation: Your token doesn't have exactly 3 dot-separated segments (header.payload.signature). Tokens with more or fewer segments can't be parsed by ARM. This happens when tokens are truncated, concatenated incorrectly, or corrupted during transmission.`,
        `Token Encoding Corruption: The token may contain invalid base64url characters, incorrect padding, or encoding issues. This can occur when tokens are modified, stored incorrectly, or transmitted through systems that alter encoding.`,
        `Extra Spaces or Characters: The format must be exactly "Bearer <token>" with no leading/trailing spaces or special characters.`,
      ],
      solutions: [
        `Step 1: Diagnose - Inspect the exact Authorization header value by logging or printing it. It should be exactly "Bearer <token>" with a single space.`,
        `Step 2: Diagnose - Check for missing "Bearer " prefix, lowercase "bearer", or missing space between "Bearer" and token.`,
        `Step 3: Diagnose - Verify header name is exactly "Authorization" (capital A). Use network inspection tools to confirm the case.`,
        `Step 4: Diagnose - Decode and validate JWT structure using jwt.io. Verify your token has exactly 3 dot-separated segments.`,
        `Step 5: Fix - Ensure Authorization header format is exactly "Authorization: Bearer <token>" with proper spacing.`,
        `Step 6: Fix - Use Azure SDK credential libraries instead of manually constructing headers. @azure/identity credential classes handle header formatting correctly.`,
        `Step 7: Fix - Verify your credential source isn't producing malformed tokens:\n   az ad app credential list --id <app-id> --query "[].{keyId:keyId, endDate:endDate}" --output table`,
        `Step 8: Verify - Retry your operation. It should succeed instead of returning InvalidAuthenticationInfo.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Authorization Header Validation',
          code: `# This script helps diagnose InvalidAuthenticationInfo errors by checking credential validity

# Step 1: Check service principal credentials (replace APP_ID)
APP_ID="your-service-principal-id"
echo "Checking service principal credentials for APP_ID: \$APP_ID"
az ad app credential list --id \$APP_ID --query "[].{keyId:keyId, endDate:endDate}" --output table

# Step 2: Check if credentials are expired
echo "Checking for expired credentials..."
CURRENT_DATE=\$(date +%s)
az ad app credential list --id \$APP_ID --query "[?endDate < '\$CURRENT_DATE'].{keyId:keyId, endDate:endDate}" --output table

# Step 3: Test authentication
echo "Testing authentication..."
if az account show --output table 2>&1; then
  echo "Authentication successful"
else
  echo "Authentication failed - check the error message above"
  echo "Common issues:"
  echo "  1. Missing 'Bearer ' prefix in Authorization header"
  echo "  2. Header name case mismatch (must be 'Authorization', not 'authorization')"
  echo "  3. JWT token structure violation (must have 3 dot-separated segments)"
  echo "  4. Token encoding corruption"
fi

# Step 4: Get a fresh token using Azure CLI
echo "Getting fresh access token..."
TOKEN=\$(az account get-access-token --query accessToken -o tsv)
if [ ! -z "\$TOKEN" ]; then
  echo "Token obtained successfully"
  echo "Token preview (first 50 chars): \${TOKEN:0:50}..."
  
  # Step 5: Validate JWT structure (check for 3 segments)
  SEGMENT_COUNT=\$(echo \$TOKEN | tr -cd '.' | wc -c)
  if [ \$SEGMENT_COUNT -eq 2 ]; then
    echo "JWT structure valid (3 segments found)"
  else
    echo "ERROR: JWT structure invalid (expected 3 segments, found \$((SEGMENT_COUNT + 1)))"
  fi
else
  echo "ERROR: Failed to obtain token"
fi

# Step 6: Instructions for manual header construction
echo ""
echo "If manually constructing headers, ensure:"
echo "  1. Header name is exactly 'Authorization' (capital A)"
echo "  2. Header value is exactly 'Bearer <token>' (with space)"
echo "  3. Token has 3 dot-separated segments"
echo "  4. No extra spaces or special characters"`,
        },
      ],
      relatedCodes: ['AuthenticationFailed', 'Unauthorized'],
      provider: 'azure',
    },
    'SubscriptionNotFound': {
      code: 'SubscriptionNotFound',
      name: 'Subscription Not Found: Invalid GUID or Access Denied',
      description: `ARM can't find the subscription—either the GUID format is wrong, the subscription was cancelled/deleted, or you lack Reader role (ARM returns 404 instead of 403 to avoid revealing subscription existence). This 404 client-side error means ARM validated the GUID format, then either couldn't locate it or determined you don't have access. Subscriptions enter "Cancelled" state due to payment failures or expired trials, then get permanently deleted after a grace period. Cross-tenant access requires explicit B2B configuration. Affects all operations: VMs, AKS clusters, Azure SQL, App Service.`,
      metaDescription: 'Troubleshoot SubscriptionNotFound. Validate GUID format, check subscription state, and verify Reader role assignments.',
      causes: [
        `Invalid Subscription GUID: The subscription ID doesn't match the UUID pattern (36 characters with hyphens: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx). Common mistakes include missing segments, wrong length, or typos in the GUID.`,
        `Cancelled or Deleted Subscription: Subscriptions enter "Cancelled" state due to payment failure, expired trial, or manual deletion. Cancelled subscriptions have a grace period before permanent deletion, but the duration varies. During this period, the subscription exists but isn't accessible.`,
        `Missing Reader Role: Your authenticated principal (user, service principal, or managed identity) doesn't have Reader role (or any role) assigned at the subscription scope. ARM returns 404 instead of 403, so you can't distinguish between "subscription doesn't exist" and "you don't have access".`,
        `Cross-Tenant Access: The subscription belongs to a different Azure AD tenant, and you haven't been granted access. Simply authenticating with a token from another tenant doesn't grant access—you must be explicitly invited or have B2B configured.`,
      ],
      solutions: [
        `Step 1: Diagnose - Verify subscription GUID format matches UUID pattern:\n   az account show --subscription <sub-id> --query "{state:state, id:id, tenantId:tenantId}" --output table`,
        `Step 2: Diagnose - Check subscription state:\n   az account show --subscription <sub-id> --query "{state:state, name:name}" --output table`,
        `Step 3: Diagnose - Check your role assignments at subscription scope:\n   az role assignment list --assignee <your-principal-id> --scope /subscriptions/<sub-id> --query "[].roleDefinitionName" --output table`,
        `Step 4: Diagnose - Verify tenant context:\n   az account show --query "{tenantId:tenantId, subscriptionId:id}" --output table`,
        `Step 5: Fix - If subscription GUID is invalid, use the correct format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (36 characters with hyphens).`,
        `Step 6: Fix - If subscription is cancelled, reactivate it (if possible) or use a different subscription.`,
        `Step 7: Fix - Grant Reader role at subscription scope:\n   az role assignment create --assignee <your-principal-id> --role Reader --scope /subscriptions/<sub-id>`,
        `Step 8: Verify - Wait 5-10 minutes for role propagation, then retry:\n   az account show --subscription <sub-id> --output table`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Subscription Access Diagnosis',
          code: `# This script helps diagnose SubscriptionNotFound errors

# Step 1: Get current subscription context
echo "Checking current subscription..."
az account show --query "{subscriptionId:id, name:name, tenantId:tenantId, state:state}" --output table

# Step 2: Example subscription ID (replace with your actual subscription ID)
SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
echo "Checking subscription: \$SUBSCRIPTION_ID"

# Step 3: Verify subscription GUID format (should be 36 characters with hyphens)
if [[ ! \$SUBSCRIPTION_ID =~ ^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\$ ]]; then
  echo "ERROR: Invalid subscription GUID format"
  echo "Expected format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  exit 1
fi
echo "Subscription GUID format is valid"

# Step 4: Try to show subscription details
if az account show --subscription \$SUBSCRIPTION_ID --query "{state:state, name:name, id:id}" --output table 2>&1; then
  echo "Subscription found and accessible"
else
  echo "Subscription not found or not accessible. Continuing diagnosis..."
fi

# Step 5: Check subscription state
SUBSCRIPTION_STATE=\$(az account show --subscription \$SUBSCRIPTION_ID --query state -o tsv 2>/dev/null)
if [ ! -z "\$SUBSCRIPTION_STATE" ]; then
  echo "Subscription state: \$SUBSCRIPTION_STATE"
  if [ "\$SUBSCRIPTION_STATE" == "Cancelled" ] || [ "\$SUBSCRIPTION_STATE" == "Deleted" ]; then
    echo "WARNING: Subscription is cancelled or deleted"
  fi
fi

# Step 6: Get your principal ID
CURRENT_USER=\$(az account show --query user.name -o tsv)
echo "Current user: \$CURRENT_USER"

# Step 7: Check role assignments at subscription scope
echo "Checking role assignments at subscription scope..."
az role assignment list \\
  --assignee \$CURRENT_USER \\
  --scope /subscriptions/\$SUBSCRIPTION_ID \\
  --query "[].{role:roleDefinitionName, scope:scope}" \\
  --output table

# Step 8: List all accessible subscriptions
echo "Listing all accessible subscriptions..."
az account list --query "[].{subscriptionId:id, name:name, state:state}" --output table

# Step 9: Check tenant context
echo "Checking tenant context..."
CURRENT_TENANT=\$(az account show --query tenantId -o tsv)
SUBSCRIPTION_TENANT=\$(az account show --subscription \$SUBSCRIPTION_ID --query tenantId -o tsv 2>/dev/null)
if [ ! -z "\$SUBSCRIPTION_TENANT" ]; then
  echo "Current tenant: \$CURRENT_TENANT"
  echo "Subscription tenant: \$SUBSCRIPTION_TENANT"
  if [ "\$CURRENT_TENANT" != "\$SUBSCRIPTION_TENANT" ]; then
    echo "WARNING: Tenant mismatch - cross-tenant access may be required"
  fi
fi`,
        },
      ],
      relatedCodes: ['ResourceNotFound', 'AccessDenied'],
      provider: 'azure',
    },
    'ConflictError': {
      code: 'ConflictError',
      name: 'Conflict Error: Resource State Constraint Violation',
      description: `The operation conflicts with the resource's current state—either the provisioningState blocks it (like "Deleting" or "Failed"), or a uniqueness constraint is violated (name already exists). This 409 client-side error means ARM checked the resource state and constraints before allowing the operation. Resources in "Deleting" state block all operations while ARM processes the deletion in the background (timing varies by resource type). Globally unique resources like storage accounts require names unique across all Azure subscriptions. Common in VMs, AKS clusters, Azure SQL databases, and App Service deployments.`,
      metaDescription: 'Resolve ConflictError. Check provisioning state, verify name uniqueness, and handle active resource leases blocking operations.',
      causes: [
        `Resource in Deleting State: Resources in "Deleting" provisioning state block all other operations while ARM processes the deletion in the background. ARM blocks concurrent operations to prevent race conditions. Deletion time varies by resource type (commonly 1-5 minutes, not guaranteed).`,
        `Resource in Failed State: Resources in "Failed" provisioning state may block certain operations depending on the resource type. Some operations require the resource to be in "Succeeded" state. Failed resources may need to be deleted and recreated, but this behavior varies by resource type.`,
        `Uniqueness Constraint Violation: A resource with that name already exists. Globally unique resources (e.g., storage accounts, Key Vaults) must have names unique across all Azure subscriptions. Other resources may have uniqueness scoped to a resource group or subscription (varies by resource type).`,
        `Active Resource Lease: Active resource leases block delete/update operations until the lease is broken or expires. Some resource types (e.g., Storage blobs) use leases to prevent concurrent modifications. Lease duration and behavior vary by resource type.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check resource provisioning state:\n   az resource show --ids <resource-id> --query "properties.provisioningState" --output table`,
        `Step 2: Diagnose - Check for existing resources with the same name:\n   az resource list --query "[?name=='<name>'].{id:id, name:name, type:type}" --output table`,
        `Step 3: Diagnose - Check storage account name availability:\n   az storage account check-name --name <account-name> --output table`,
        `Step 4: Diagnose - Check Key Vault name availability:\n   az keyvault check-name --name <vault-name> --output table`,
        `Step 5: Fix - Wait for deletion to complete if resource is in "Deleting" state:\n   az resource wait --ids <resource-id> --deleted --timeout 600`,
        `Step 6: Fix - Delete and recreate resource if it's in "Failed" state (varies by resource type).`,
        `Step 7: Fix - Use a different name if name conflict exists. Check name availability before creation.`,
        `Step 8: Fix - Break active leases for Storage blobs:\n   az storage blob lease break --container-name <container> --blob-name <blob> --account-name <account>`,
        `Step 9: Verify - Retry your operation. It should succeed instead of returning ConflictError.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Resource State and Conflict Diagnosis',
          code: `# This script helps diagnose ConflictError by checking resource state and name conflicts

# Step 1: Example resource ID (replace with your actual resource ID)
RESOURCE_ID="/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/my-rg/providers/Microsoft.Compute/virtualMachines/my-vm"
echo "Checking resource: \$RESOURCE_ID"

# Step 2: Check resource provisioning state
echo "Checking resource provisioning state..."
PROVISIONING_STATE=\$(az resource show --ids \$RESOURCE_ID --query "properties.provisioningState" -o tsv 2>/dev/null)
if [ ! -z "\$PROVISIONING_STATE" ]; then
  echo "Provisioning state: \$PROVISIONING_STATE"
  if [ "\$PROVISIONING_STATE" == "Deleting" ]; then
    echo "Resource is being deleted. Waiting for deletion to complete..."
    az resource wait --ids \$RESOURCE_ID --deleted --timeout 600
  elif [ "\$PROVISIONING_STATE" == "Failed" ]; then
    echo "WARNING: Resource is in Failed state. May need to delete and recreate."
  fi
else
  echo "Resource not found or inaccessible"
fi

# Step 3: Check for name conflicts (example: storage account)
ACCOUNT_NAME="mystorageaccount"
echo "Checking storage account name availability: \$ACCOUNT_NAME"
az storage account check-name --name \$ACCOUNT_NAME --output table

# Step 4: Check for name conflicts (example: Key Vault)
VAULT_NAME="my-keyvault"
echo "Checking Key Vault name availability: \$VAULT_NAME"
az keyvault check-name --name \$VAULT_NAME --output table

# Step 5: Search for existing resources by name
RESOURCE_NAME="my-vm"
echo "Searching for existing resources with name: \$RESOURCE_NAME"
az resource list --query "[?name=='\$RESOURCE_NAME'].{id:id, name:name, type:type, location:location}" --output table

# Step 6: Check for active leases on Storage blobs (if applicable)
STORAGE_ACCOUNT="mystorageaccount"
CONTAINER_NAME="mycontainer"
BLOB_NAME="myblob.txt"
echo "Checking for active leases on blob: \$BLOB_NAME"
# Note: Breaking leases requires storage account key or connection string
# az storage blob lease break --container-name \$CONTAINER_NAME --blob-name \$BLOB_NAME --account-name \$STORAGE_ACCOUNT

# Step 7: Wait for resource state to change (if needed)
if [ "\$PROVISIONING_STATE" == "Deleting" ]; then
  echo "Waiting for resource deletion to complete..."
  az resource wait --ids \$RESOURCE_ID --deleted --timeout 600
  echo "Deletion complete"
fi`,
        },
      ],
      relatedCodes: ['PreconditionFailed', 'ResourceModified'],
      provider: 'azure',
    },
    'InvalidRequestContent': {
      code: 'InvalidRequestContent',
      name: 'Invalid Request Content: Request Body Schema Violation',
      description: `Your request body JSON doesn't match the resource schema for the API version you're using—properties might be missing, have wrong types, or violate enum constraints. This 400 client-side error occurs after ARM validates your JSON syntax but finds schema mismatches. Schema requirements vary by API version; what's optional in one version becomes required in another, or enum values change. ARM checks your request body against the resource type's schema definition. Affects VM creation, AKS cluster configuration, Azure SQL database setup, and App Service app settings.`,
      metaDescription: 'Correct InvalidRequestContent errors. Validate request schemas, check API version differences, and fix property type mismatches.',
      causes: [
        `API Version Schema Drift: A property that was optional in an older API version becomes required in a newer one. Required properties vary by API version, so a request that worked with an older API version might fail with a newer one.`,
        `Invalid Enum Values: Property values don't match allowed enum values. Setting location to "East US" (with space) instead of "eastus" (lowercase, no space), or using a SKU that doesn't exist for that resource type, causes this.`,
        `Type Mismatch: A property has the wrong data type. A field expecting an integer but receiving a string, or an array where an object is expected, causes this.`,
        `Invalid Property Format: The value format is wrong (date format, GUID format, or string length exceeds limits). Limits and formats vary by property and aren't consistently documented.`,
      ],
      solutions: [
        `Step 1: Diagnose - Review the error message for the specific field causing the problem. Use the field path (e.g., "properties.location") from the error message.`,
        `Step 2: Diagnose - Check available API versions for your resource type:\n   az provider show --namespace <provider-namespace> --query "resourceTypes[?resourceType=='<type>'].apiVersions" --output table`,
        `Step 3: Diagnose - Get valid location names:\n   az account list-locations --query "[].name" --output table`,
        `Step 4: Fix - Validate ARM template before deployment:\n   az deployment group validate --resource-group <rg> --template-file template.json --parameters @params.json`,
        `Step 5: Fix - Ensure property names match the schema exactly (case-sensitive). Review the ARM REST API reference for your resource type and API version.`,
        `Step 6: Fix - Use exact allowed enum values. For location: use lowercase with no spaces (e.g., "eastus" not "East US").`,
        `Step 7: Fix - Convert values to the correct type. If a field expects an integer, ensure it's a number, not a string.`,
        `Step 8: Verify - Retry your request. It should succeed with HTTP 200/201 instead of 400 InvalidRequestContent.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Request Schema Validation',
          code: `# This script helps diagnose InvalidRequestContent errors by validating request schema

# Step 1: Get valid location names
echo "Getting valid location names..."
az account list-locations --query "[].{name:name, displayName:displayName}" --output table

# Step 2: Check available API versions for a resource type (example: Virtual Machines)
echo "Checking available API versions for Microsoft.Compute/virtualMachines..."
az provider show --namespace Microsoft.Compute --query "resourceTypes[?resourceType=='virtualMachines'].apiVersions" --output table

# Step 3: Validate ARM template (if using templates)
RESOURCE_GROUP="my-resource-group"
TEMPLATE_FILE="template.json"
PARAMS_FILE="params.json"
echo "Validating ARM template..."
if [ -f "\$TEMPLATE_FILE" ] && [ -f "\$PARAMS_FILE" ]; then
  az deployment group validate \\
    --resource-group \$RESOURCE_GROUP \\
    --template-file \$TEMPLATE_FILE \\
    --parameters @\$PARAMS_FILE \\
    --output table
else
  echo "Template files not found. Skipping template validation."
fi

# Step 4: Check provider capabilities for a specific resource type
echo "Checking provider capabilities..."
az provider show --namespace Microsoft.Compute --query "resourceTypes[?resourceType=='virtualMachines']" --output table

# Step 5: List available VM sizes in a region (example for VM creation)
REGION="eastus"
echo "Listing available VM sizes in region \$REGION..."
az vm list-sizes --location \$REGION --output table

# Step 6: Check valid SKU values (example: Storage account)
echo "Valid Storage account SKU values:"
echo "  - Standard_LRS"
echo "  - Standard_GRS"
echo "  - Standard_RAGRS"
echo "  - Standard_ZRS"
echo "  - Premium_LRS"

# Step 7: Instructions for fixing common issues
echo ""
echo "Common fixes for InvalidRequestContent:"
echo "  1. Check property names are case-sensitive (e.g., 'location' not 'Location')"
echo "  2. Use valid enum values (e.g., 'eastus' not 'East US')"
echo "  3. Ensure required properties are included for your API version"
echo "  4. Convert types correctly (integers vs strings, arrays vs objects)"
echo "  5. Validate date/GUID formats match schema requirements"`,
        },
      ],
      relatedCodes: ['BadRequest', 'ValidationError'],
      provider: 'azure',
    },
    'QuotaExceeded': {
      code: 'QuotaExceeded',
      name: 'Quota Exceeded: Resource Limit Reached',
      description: `You've hit Azure's hard quota limit for this resource type—the operation would push you over the subscription or regional cap. This 403 client-side error means ARM checked your current usage against the limit and blocked the operation. Quota limits vary by subscription tier and resource type (regional quotas differ from subscription-wide quotas). Most common with VM vCPU limits, but also appears with AKS cluster/node quotas, Azure SQL database instance limits, and App Service plan quotas. ARM enforces these before resource creation.`,
      metaDescription: 'Handle QuotaExceeded. Check current usage vs limits, delete unused resources, or request quota increases through Azure Support.',
      causes: [
        `Regional Quota Limit: Creating the resource in the specified region would push you over the regional quota for that resource type. VM cores have regional quotas that differ by subscription tier. Quota limits vary by resource type and subscription type.`,
        `Subscription-Level Quota: The total count of this resource type across all regions exceeds your subscription quota. Some resources have subscription-wide quotas in addition to regional quotas. The error response indicates which quota was exceeded.`,
        `Resource Group Quota: The resource group contains the maximum allowed number of resources of this type. Resource group quotas vary by resource type and are less common than regional or subscription quotas.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check VM quota usage in the region:\n   az vm list-usage --location <region> --query "[?name.value=='cores'].{current:currentValue, limit:limit}" --output table`,
        `Step 2: Diagnose - Check all quota usage in the region:\n   az vm list-usage --location <region> --output table`,
        `Step 3: Diagnose - Find unused resources that can be deleted:\n   az resource list --query "[?tags.Environment==null].{id:id, name:name, type:type}" --output table`,
        `Step 4: Fix - Delete unused resources to free up quota. Adjust the query based on your tagging strategy.`,
        `Step 5: Fix - Request quota increase through Azure Portal: Subscription > Usage + quotas, find the exceeded quota, click "Request increase", and fill out the support request. Approval typically takes 1-2 business days.`,
        `Step 6: Fix - Use a different region where you haven't hit the quota. Create the resource in a region where your quota usage is below the limit.`,
        `Step 7: Verify - Re-check quota usage after fixes:\n   az vm list-usage --location <region> --output table`,
        `Step 8: Verify - Retry your resource creation. It should succeed with HTTP 201 instead of 403 QuotaExceeded.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Quota Usage Diagnosis and Management',
          code: `# This script helps diagnose QuotaExceeded errors by checking quota usage

# Step 1: Set your region (replace with your target region)
REGION="eastus"
echo "Checking quota usage for region: \$REGION"

# Step 2: Check VM quota usage (cores)
echo "Checking VM core quota usage..."
az vm list-usage --location \$REGION --query "[?name.value=='cores'].{name:name.value, current:currentValue, limit:limit}" --output table

# Step 3: Check all VM quota usage
echo "Checking all VM quota usage..."
az vm list-usage --location \$REGION --output table

# Step 4: Check if quota is exceeded
CURRENT=\$(az vm list-usage --location \$REGION --query "[?name.value=='cores'].currentValue" -o tsv)
LIMIT=\$(az vm list-usage --location \$REGION --query "[?name.value=='cores'].limit" -o tsv)
echo "Current usage: \$CURRENT"
echo "Quota limit: \$LIMIT"

if [ ! -z "\$CURRENT" ] && [ ! -z "\$LIMIT" ]; then
  if [ \$CURRENT -ge \$LIMIT ]; then
    echo "WARNING: Quota limit reached or exceeded"
    echo "Current: \$CURRENT, Limit: \$LIMIT"
  else
    REMAINING=\$((LIMIT - CURRENT))
    echo "Quota remaining: \$REMAINING"
  fi
fi

# Step 5: Find unused resources that can be deleted (example: resources without Environment tag)
echo "Finding potentially unused resources..."
az resource list --query "[?tags.Environment==null].{id:id, name:name, type:type, location:location}" --output table

# Step 6: List all resource groups to identify candidates for cleanup
echo "Listing all resource groups..."
az group list --query "[].{name:name, location:location}" --output table

# Step 7: Check quota in alternative regions
echo "Checking quota in alternative regions..."
ALTERNATIVE_REGIONS=("westus2" "centralus" "westeurope")
for alt_region in "\${ALTERNATIVE_REGIONS[@]}"; do
  echo "Checking quota in \$alt_region..."
  az vm list-usage --location \$alt_region --query "[?name.value=='cores'].{region:location, current:currentValue, limit:limit}" --output table
done

# Step 8: Instructions for requesting quota increase
echo ""
echo "To request quota increase:"
echo "  1. Go to Azure Portal > Subscription > Usage + quotas"
echo "  2. Find the exceeded quota"
echo "  3. Click 'Request increase'"
echo "  4. Fill out the support request"
echo "  5. Approval typically takes 1-2 business days"`,
        },
      ],
      relatedCodes: ['TooManyRequests', 'LimitExceeded'],
      provider: 'azure',
    },
    'ResourceGroupNotFound': {
      code: 'ResourceGroupNotFound',
      name: 'Resource Group Not Found: Name Invalid or Deleted',
      description: `ARM can't locate the resource group—the name format might be invalid (1-90 characters, alphanumeric plus underscore/parentheses/hyphen/period), the group was deleted, or you're hitting the wrong subscription. This 404 client-side error occurs after ARM validates the name format but can't find the group. Resource group names are case-insensitive in Azure CLI but case-sensitive in direct ARM API calls, so case mismatches can cause failures. Soft-deleted resource groups exist during retention but aren't accessible via standard GET operations. Applies to VM resource groups, AKS clusters, Azure SQL databases, and App Service deployments.`,
      metaDescription: 'Diagnose ResourceGroupNotFound. Verify name format, check subscription context, and recover soft-deleted resource groups.',
      causes: [
        `Invalid Resource Group Name Format: The name contains invalid characters or exceeds the 90 character limit. Allowed characters are: alphanumeric, underscore, parentheses, hyphen, and period. ARM rejects names that violate these rules before querying.`,
        `Soft-Deleted Resource Group: Resource groups exist in a "Deleted" provisioningState with the retention period still active. During retention, standard GET operations return ResourceGroupNotFound even though the resource group technically exists. Retention period is configurable but varies.`,
        `Wrong Subscription Context: Resource groups in different subscriptions aren't accessible from your current subscription context. ARM only queries resource groups within your current subscription context. The resource group is in subscription A but you're authenticated to subscription B.`,
        `Case Sensitivity Mismatch: Resource group names are case-insensitive in Azure CLI but case-sensitive in ARM API calls. Using the exact name from CLI in an ARM API call with a case mismatch causes ResourceGroupNotFound.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check if resource group exists:\n   az group exists --name <rg-name> --output table`,
        `Step 2: Diagnose - Verify current subscription context:\n   az account show --query "{subscriptionId:id, name:name}" --output table`,
        `Step 3: Diagnose - List all resource groups in current subscription:\n   az group list --query "[].{name:name, location:location}" --output table`,
        `Step 4: Diagnose - Verify resource group name format (1-90 characters, alphanumeric + underscore/parentheses/hyphen/period).`,
        `Step 5: Fix - Create missing resource group:\n   az group create --name <rg-name> --location <location>`,
        `Step 6: Fix - Switch to correct subscription if needed:\n   az account set --subscription <sub-id>`,
        `Step 7: Fix - Ensure case matches exactly when using ARM API directly.`,
        `Step 8: Verify - Retry resource group lookup:\n   az group show --name <rg-name> --output table`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Resource Group Lookup and Creation',
          code: `# This script helps diagnose ResourceGroupNotFound errors

# Step 1: Get current subscription context
echo "Checking current subscription..."
az account show --query "{subscriptionId:id, name:name}" --output table

# Step 2: Example resource group name (replace with your actual resource group name)
RG_NAME="my-resource-group"
echo "Checking resource group: \$RG_NAME"

# Step 3: Check if resource group exists
echo "Checking if resource group exists..."
if az group exists --name \$RG_NAME --output tsv | grep -q "true"; then
  echo "Resource group exists"
else
  echo "Resource group does not exist"
fi

# Step 4: List all resource groups in current subscription
echo "Listing all resource groups in current subscription..."
az group list --query "[].{name:name, location:location}" --output table

# Step 5: Verify resource group name format (1-90 characters, alphanumeric + underscore/parentheses/hyphen/period)
if [[ ! \$RG_NAME =~ ^[a-zA-Z0-9._()-]{1,90}\$ ]]; then
  echo "ERROR: Invalid resource group name format"
  echo "Allowed: 1-90 characters, alphanumeric + underscore/parentheses/hyphen/period"
  exit 1
fi
echo "Resource group name format is valid"

# Step 6: Try to show resource group details
echo "Attempting to show resource group details..."
if az group show --name \$RG_NAME --output table 2>&1; then
  echo "Resource group found and accessible"
else
  echo "Resource group not found or not accessible"
  
  # Step 7: Create resource group if it doesn't exist
  LOCATION="eastus"
  echo "Creating resource group \$RG_NAME in location \$LOCATION..."
  az group create --name \$RG_NAME --location \$LOCATION --output table
fi

# Step 8: List all subscriptions to find where resource group might be
echo "Listing all accessible subscriptions..."
az account list --query "[].{subscriptionId:id, name:name, state:state}" --output table

# Step 9: Check resource group in different subscription (if needed)
# SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
# az account set --subscription \$SUBSCRIPTION_ID
# az group show --name \$RG_NAME --output table`,
        },
      ],
      relatedCodes: ['ResourceNotFound', 'SubscriptionNotFound'],
      provider: 'azure',
    },
    'StorageAccountNotFound': {
      code: 'StorageAccountNotFound',
      name: 'Storage Account Not Found: Name Invalid or Deleted',
      description: `ARM can't find the storage account—the name format is wrong (3-24 lowercase alphanumeric, no hyphens), the account was soft-deleted, or you're querying the wrong resource group/subscription. This 404 client-side error happens after ARM validates the name format but the provider can't resolve it. Storage account names are globally unique across all Azure subscriptions and case-sensitive. Soft-deleted accounts exist during retention but aren't accessible via standard GET operations. Common when referencing storage for VM disk backups, AKS container registries, Azure SQL backups, or App Service application storage.`,
      metaDescription: 'Locate missing storage accounts. Validate name format, search for soft-deleted accounts, and verify subscription/resource group context.',
      causes: [
        `Invalid Storage Account Name Format: The name doesn't match the required pattern (lowercase alphanumeric, 3-24 characters, no hyphens). ARM rejects names that violate these rules before querying.`,
        `Soft-Deleted Storage Account: Storage accounts exist in a "Deleted" state with the retention period still active. During retention, standard GET operations return StorageAccountNotFound even though the account technically exists. Retention period is configurable but varies.`,
        `Name Not Available Globally: Storage account names are globally unique, so if you're trying to create one and get this error, the name might already exist in another subscription. The name was never created or was permanently deleted after the retention period expired.`,
        `Wrong Resource Group or Subscription: Storage accounts in different resource groups or subscriptions aren't accessible from your current path. The account exists but in a different resource group or subscription than specified in your request path.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check storage account name format (3-24 lowercase alphanumeric, no hyphens).`,
        `Step 2: Diagnose - Check if storage account exists:\n   az storage account show --name <account-name> --resource-group <rg-name> --output table`,
        `Step 3: Diagnose - Check for soft-deleted storage accounts:\n   az storage account list-deleted --query "[?name=='<account-name>']" --output table`,
        `Step 4: Diagnose - Check name availability before creation:\n   az storage account check-name --name <account-name> --output table`,
        `Step 5: Fix - Restore soft-deleted account if found:\n   az storage account restore --name <account> --resource-group <rg> --deleted-account-name <deleted-name>`,
        `Step 6: Fix - Create storage account with unique name:\n   az storage account create --name <unique-name> --resource-group <rg> --location <location> --sku Standard_LRS`,
        `Step 7: Fix - Verify resource group and subscription in your request path match where the account actually exists.`,
        `Step 8: Verify - Retry storage account lookup:\n   az storage account show --name <account-name> --resource-group <rg-name> --output table`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Storage Account Lookup and Recovery',
          code: `# This script helps diagnose StorageAccountNotFound errors

# Step 1: Example storage account name (replace with your actual account name)
ACCOUNT_NAME="mystorageaccount"
RG_NAME="my-resource-group"
echo "Checking storage account: \$ACCOUNT_NAME"

# Step 2: Verify storage account name format (3-24 lowercase alphanumeric, no hyphens)
if [[ ! \$ACCOUNT_NAME =~ ^[a-z0-9]{3,24}\$ ]]; then
  echo "ERROR: Invalid storage account name format"
  echo "Required: 3-24 lowercase alphanumeric characters, no hyphens"
  exit 1
fi
echo "Storage account name format is valid"

# Step 3: Check name availability
echo "Checking name availability..."
az storage account check-name --name \$ACCOUNT_NAME --output table

# Step 4: Try to show storage account details
echo "Attempting to show storage account details..."
if az storage account show --name \$ACCOUNT_NAME --resource-group \$RG_NAME --output table 2>&1; then
  echo "Storage account found and accessible"
else
  echo "Storage account not found. Continuing diagnosis..."
fi

# Step 5: Check for soft-deleted storage accounts
echo "Checking for soft-deleted storage accounts..."
az storage account list-deleted --query "[?name=='\$ACCOUNT_NAME']" --output table

# Step 6: List all storage accounts in resource group
echo "Listing all storage accounts in resource group \$RG_NAME..."
az storage account list --resource-group \$RG_NAME --query "[].{name:name, location:location, sku:sku.name}" --output table

# Step 7: Search for storage account across all resource groups
echo "Searching for storage account across all resource groups..."
az storage account list --query "[?name=='\$ACCOUNT_NAME'].{name:name, resourceGroup:resourceGroup, location:location}" --output table

# Step 8: If storage account is soft-deleted and you want to restore it:
# DELETED_ACCOUNT_NAME="mystorageaccount"
# LOCATION="eastus"
# echo "Restoring soft-deleted storage account..."
# az storage account restore --name \$ACCOUNT_NAME --resource-group \$RG_NAME --deleted-account-name \$DELETED_ACCOUNT_NAME --location \$LOCATION

# Step 9: Create storage account if it doesn't exist
if ! az storage account show --name \$ACCOUNT_NAME --resource-group \$RG_NAME &>/dev/null; then
  echo "Storage account does not exist. Creating..."
  LOCATION="eastus"
  az storage account create \\
    --name \$ACCOUNT_NAME \\
    --resource-group \$RG_NAME \\
    --location \$LOCATION \\
    --sku Standard_LRS \\
    --output table
fi`,
        },
      ],
      relatedCodes: ['ResourceNotFound', 'ResourceGroupNotFound'],
      provider: 'azure',
    },
    'TooManyRequests': {
      code: 'TooManyRequests',
      name: 'Too Many Requests: ARM API Rate Limit Exceeded',
      description: `You're hitting ARM's rate limits—sending requests faster than the per-subscription limits allow for your authenticated principal. This 429 client-side error means ARM throttled your requests after exceeding the limit for this operation type (limits vary by operation and resource type, and aren't publicly documented). ARM tracks rate limits per subscription and principal, so concurrent requests from multiple processes can compound. The response includes a Retry-After header specifying the minimum wait time before retrying. Common during bulk VM operations, AKS cluster management, Azure SQL batch operations, and App Service deployments.`,
      metaDescription: 'Handle TooManyRequests throttling. Implement exponential backoff, respect Retry-After headers, and reduce request burst rates.',
      causes: [
        `ARM API Rate Limit Exceeded: Your request count exceeds the subscription-level limit for this operation type. Rate limits vary by operation type (read operations typically have higher limits than write operations) and aren't documented. The Retry-After header tells you how long to wait before retrying.`,
        `Service-Specific Rate Limits: Different Azure services (Storage, Compute, etc.) have their own throttling limits that may be more restrictive than ARM's general limits. You may be hitting service-specific limits in addition to ARM limits.`,
        `Concurrent Request Bursts: Multiple simultaneous requests exceed service capacity. ARM doesn't queue requests—excess requests immediately receive 429 responses. Rate limit counters reset over time, but the reset interval isn't documented and may vary.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check the Retry-After header value in the response headers (in seconds). This tells you the minimum wait time before retrying.`,
        `Step 2: Fix - Wait at least the duration specified in the Retry-After header before retrying.`,
        `Step 3: Fix - Implement client-side throttling to limit concurrent requests and prevent bursts. Use a rate limiter or queue to space out requests.`,
        `Step 4: Fix - Use exponential backoff with Retry-After support when retrying. Wait at least the duration specified in the Retry-After header, then retry. If you still get 429, wait longer (exponential backoff).`,
        `Step 5: Verify - After implementing throttling and retry logic, retry your operation. It should succeed with HTTP 200/201 instead of 429 TooManyRequests.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Rate Limiting and Retry Logic',
          code: `# This script demonstrates rate limiting and retry logic for TooManyRequests errors

# Step 1: Retry function with exponential backoff
retry_with_backoff() {
  local max_attempts=\$1
  local base_delay=\$2
  local max_delay=\$3
  local attempt=1
  shift 3
  local command="\$@"
  
  while [ \$attempt -le \$max_attempts ]; do
    echo "Attempt \$attempt of \$max_attempts..."
    
    if eval "\$command" 2>&1; then
      echo "Success! Operation completed on attempt \$attempt"
      return 0
    else
      ERROR_CODE=\$?
      
      # Check if error is 429 TooManyRequests
      if [ \$ERROR_CODE -eq 0 ]; then
        # Check for Retry-After header in response (if available)
        # Note: Azure CLI doesn't expose Retry-After header directly
        # You may need to parse the error message or use REST API directly
        echo "Operation failed. Checking for rate limiting..."
      fi
      
      if [ \$attempt -lt \$max_attempts ]; then
        # Calculate delay with exponential backoff
        DELAY=\$((base_delay * (2 ** (attempt - 1))))
        if [ \$DELAY -gt \$max_delay ]; then
          DELAY=\$max_delay
        fi
        
        echo "Rate limit exceeded. Waiting \$DELAY seconds before retry..."
        sleep \$DELAY
        attempt=\$((attempt + 1))
      else
        echo "Failed after \$max_attempts attempts"
        return 1
      fi
    fi
  done
}

# Step 2: Example usage - List resource groups with retry logic
echo "Listing resource groups with retry logic..."
retry_with_backoff 5 2 60 "az group list --output table"

# Step 3: Example usage - Create resource with retry logic
# RG_NAME="my-resource-group"
# LOCATION="eastus"
# echo "Creating resource group with retry logic..."
# retry_with_backoff 5 2 60 "az group create --name \$RG_NAME --location \$LOCATION --output table"

# Step 4: Rate limiting best practices
echo ""
echo "Rate limiting best practices:"
echo "  1. Implement exponential backoff (start with 2 seconds, double each retry)"
echo "  2. Respect Retry-After header when available"
echo "  3. Limit concurrent requests (use queues or semaphores)"
echo "  4. Batch operations when possible"
echo "  5. Cache results to reduce API calls"
echo "  6. Monitor rate limit usage in Azure Monitor"`,
        },
      ],
      relatedCodes: ['QuotaExceeded', 'Throttling'],
      provider: 'azure',
    },
    'ContainerNotFound': {
      code: 'ContainerNotFound',
      name: 'Container Not Found: Blob Container Does Not Exist',
      description: `The blob container doesn't exist in the storage account—name format might be invalid (3-63 characters, lowercase alphanumeric plus hyphens, no consecutive hyphens), the container was deleted, or the case doesn't match (containers are case-sensitive, so "MyContainer" ≠ "mycontainer"). This 404 client-side error occurs after Storage validates the name format but can't locate the container. Unlike Key Vaults and Storage accounts, containers don't support soft-delete—when deleted, they're permanently gone with no recovery period. Appears when accessing containers for VM disk backups, AKS container images, Azure SQL backups, or App Service application files.`,
      metaDescription: 'Find missing blob containers. Verify DNS-compliant name format, check case sensitivity, and list existing containers in your storage account.',
      causes: [
        `Invalid Container Name Format: The name doesn't match the DNS-compliant pattern (3-63 characters, lowercase alphanumeric + hyphens, no consecutive hyphens). Storage rejects names that violate these rules before querying.`,
        `Container Deleted: Deleted containers are permanently gone—containers don't support soft-delete. When a delete operation succeeds, the container is immediately and permanently deleted. There's no recovery period.`,
        `Case Sensitivity Mismatch: Container names are case-sensitive. "MyContainer" and "mycontainer" are different containers. The container name case doesn't exactly match the stored container name.`,
        `Container Never Existed: The container was never created, or you're using the wrong container name. Verify the container name is correct.`,
      ],
      solutions: [
        `Step 1: Diagnose - List all containers to see what exists:\n   az storage container list --account-name <account> --account-key <key> --query "[].name" --output table`,
        `Step 2: Diagnose - Check container existence:\n   az storage container show --name <container> --account-name <account> --account-key <key> --output table`,
        `Step 3: Diagnose - Verify container name format (3-63 characters, lowercase alphanumeric + hyphens, no consecutive hyphens).`,
        `Step 4: Fix - Create missing container:\n   az storage container create --name <container> --account-name <account> --account-key <key> --output table`,
        `Step 5: Fix - Verify exact case-sensitive name matches stored container name. List containers and compare the exact case.`,
        `Step 6: Verify - Retry container operation. It should succeed instead of returning ContainerNotFound.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Container Lookup and Creation',
          code: `# This script helps diagnose ContainerNotFound errors

# Step 1: Set storage account details (replace with your values)
STORAGE_ACCOUNT="mystorageaccount"
CONTAINER_NAME="mycontainer"
# Note: For production, use Azure Key Vault or managed identity instead of account key
ACCOUNT_KEY="your-storage-account-key"

# Step 2: Verify container name format (3-63 characters, lowercase alphanumeric + hyphens, no consecutive hyphens)
if [[ ! \$CONTAINER_NAME =~ ^[a-z0-9]([a-z0-9-]*[a-z0-9])?\$ ]] || [ \${#CONTAINER_NAME} -lt 3 ] || [ \${#CONTAINER_NAME} -gt 63 ]; then
  echo "ERROR: Invalid container name format"
  echo "Required: 3-63 characters, lowercase alphanumeric + hyphens, no consecutive hyphens"
  exit 1
fi
echo "Container name format is valid"

# Step 3: List all containers to see what exists
echo "Listing all containers in storage account \$STORAGE_ACCOUNT..."
az storage container list \\
  --account-name \$STORAGE_ACCOUNT \\
  --account-key \$ACCOUNT_KEY \\
  --query "[].{name:name, lastModified:properties.lastModified}" \\
  --output table

# Step 4: Check if container exists
echo "Checking if container \$CONTAINER_NAME exists..."
if az storage container show \\
  --name \$CONTAINER_NAME \\
  --account-name \$STORAGE_ACCOUNT \\
  --account-key \$ACCOUNT_KEY \\
  --output table 2>&1; then
  echo "Container found and accessible"
else
  echo "Container not found. Creating..."
  
  # Step 5: Create container if it doesn't exist
  az storage container create \\
    --name \$CONTAINER_NAME \\
    --account-name \$STORAGE_ACCOUNT \\
    --account-key \$ACCOUNT_KEY \\
    --output table
  
  echo "Container created successfully"
fi

# Step 6: Verify container case sensitivity
echo "Note: Container names are case-sensitive"
echo "  'MyContainer' and 'mycontainer' are different containers"
echo "  Ensure the exact case matches when referencing containers"`,
        },
      ],
      relatedCodes: ['StorageAccountNotFound', 'BlobNotFound'],
      provider: 'azure',
    },
    'BlobNotFound': {
      code: 'BlobNotFound',
      name: 'Blob Not Found: Blob Does Not Exist',
      description: `The blob doesn't exist in the container—either the name/path is wrong, the case doesn't match (blobs are case-sensitive), or the blob was soft-deleted and still in retention. This 404 client-side error occurs after Storage validates the blob name format but can't find it in the container. Blob names support virtual directory paths using forward slashes (e.g., "folder/blob.txt" vs "folder/subfolder/blob.txt" are different), and paths must match exactly. Soft-deleted blobs exist during retention but aren't accessible via standard GET operations. Common when accessing blobs for VM disk backups, AKS container images, Azure SQL backups, or App Service application files.`,
      metaDescription: 'Recover missing blobs. Search soft-deleted blobs, verify case-sensitive names, and check virtual directory path structure.',
      causes: [
        `Blob Name Case Mismatch: Blob names are case-sensitive. "MyBlob.txt" and "myblob.txt" are different blobs. The blob name case doesn't exactly match the stored blob name.`,
        `Soft-Deleted Blob: Soft-deleted blobs exist in a "Deleted" state with the retention period still active. During retention, standard GET operations return BlobNotFound even though the blob technically exists. Retention period is configurable but varies.`,
        `Virtual Directory Path Mismatch: Blob path segments don't match the stored blob path. Forward slashes create virtual directories, so "folder/blob.txt" and "folder/subfolder/blob.txt" are different paths. The path structure doesn't match exactly.`,
        `Blob Never Existed: The blob was never created or was permanently deleted after the retention period expired. Verify the blob name and path are correct.`,
      ],
      solutions: [
        `Step 1: Diagnose - List all blobs to see what exists:\n   az storage blob list --container-name <container> --account-name <account> --account-key <key> --query "[].name" --output table`,
        `Step 2: Diagnose - Check for soft-deleted blobs:\n   az storage blob list --container-name <container> --account-name <account> --account-key <key> --include deleted --output table`,
        `Step 3: Diagnose - Verify blob name and path structure. Blob names are case-sensitive, and virtual directory paths must match exactly.`,
        `Step 4: Fix - Restore soft-deleted blob if found:\n   az storage blob undelete --container-name <container> --name <blob> --account-name <account> --account-key <key>`,
        `Step 5: Fix - Create blob if it doesn't exist. Verify the blob name and path are correct before creating.`,
        `Step 6: Verify - Retry blob operation. It should succeed instead of returning BlobNotFound.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Blob Lookup and Recovery',
          code: `# This script helps diagnose BlobNotFound errors

# Step 1: Set storage account details (replace with your values)
STORAGE_ACCOUNT="mystorageaccount"
CONTAINER_NAME="mycontainer"
BLOB_NAME="myblob.txt"
# Note: For production, use Azure Key Vault or managed identity instead of account key
ACCOUNT_KEY="your-storage-account-key"

# Step 2: List all blobs in container to see what exists
echo "Listing all blobs in container \$CONTAINER_NAME..."
az storage blob list \\
  --container-name \$CONTAINER_NAME \\
  --account-name \$STORAGE_ACCOUNT \\
  --account-key \$ACCOUNT_KEY \\
  --query "[].{name:name, size:properties.contentLength, lastModified:properties.lastModified}" \\
  --output table

# Step 3: Check if blob exists
echo "Checking if blob \$BLOB_NAME exists..."
if az storage blob show \\
  --container-name \$CONTAINER_NAME \\
  --name \$BLOB_NAME \\
  --account-name \$STORAGE_ACCOUNT \\
  --account-key \$ACCOUNT_KEY \\
  --output table 2>&1; then
  echo "Blob found and accessible"
else
  echo "Blob not found. Continuing diagnosis..."
fi

# Step 4: Check for soft-deleted blobs
echo "Checking for soft-deleted blobs..."
az storage blob list \\
  --container-name \$CONTAINER_NAME \\
  --account-name \$STORAGE_ACCOUNT \\
  --account-key \$ACCOUNT_KEY \\
  --include deleted \\
  --query "[?name=='\$BLOB_NAME'].{name:name, deleted:properties.deleted, deletionTime:properties.deletionTime}" \\
  --output table

# Step 5: Restore soft-deleted blob if found
echo "Attempting to restore soft-deleted blob..."
if az storage blob undelete \\
  --container-name \$CONTAINER_NAME \\
  --name \$BLOB_NAME \\
  --account-name \$STORAGE_ACCOUNT \\
  --account-key \$ACCOUNT_KEY 2>&1; then
  echo "Blob restored successfully"
else
  echo "Blob could not be restored (may not be soft-deleted or retention period expired)"
fi

# Step 6: Search for blobs with similar names (case-insensitive search)
echo "Searching for blobs with similar names..."
az storage blob list \\
  --container-name \$CONTAINER_NAME \\
  --account-name \$STORAGE_ACCOUNT \\
  --account-key \$ACCOUNT_KEY \\
  --query "[?contains(name, '\$(echo \$BLOB_NAME | tr '[:upper:]' '[:lower:]')')].{name:name}" \\
  --output table

# Step 7: Note about case sensitivity and virtual directories
echo ""
echo "Important notes:"
echo "  1. Blob names are case-sensitive ('MyBlob.txt' != 'myblob.txt')"
echo "  2. Virtual directory paths must match exactly ('folder/blob.txt' != 'folder/subfolder/blob.txt')"
echo "  3. Soft-deleted blobs can be restored if retention period hasn't expired"
echo "  4. Verify exact case and path structure when referencing blobs"`,
        },
      ],
      relatedCodes: ['ContainerNotFound', 'ResourceNotFound'],
      provider: 'azure',
    },
    'PreconditionFailed': {
      code: 'PreconditionFailed',
      name: 'Precondition Failed: Conditional Header Failed',
      description: `Your conditional header condition failed—the If-Match ETag doesn't match the current resource ETag, If-None-Match: * failed because the resource exists, or If-Modified-Since timestamp is outdated. This 412 client-side error means ARM's optimistic concurrency control rejected the operation to prevent lost updates. ARM compares your conditional header value against the current resource state; mismatches indicate concurrent modifications happened between your read and write operations. ETags change immediately when resources are modified, so concurrent updates cause mismatches. Common in VM updates, AKS cluster modifications, Azure SQL database changes, and App Service configuration updates.`,
      metaDescription: 'Fix PreconditionFailed. Refresh ETags, implement read-modify-write patterns, and handle concurrent modification conflicts properly.',
      causes: [
        `ETag Mismatch: The resource ETag changed between read and write operations. Your If-Match header value doesn't match the current resource.etag, indicating another operation modified the resource concurrently. ARM updates ETags immediately when resources change, so concurrent modifications cause ETag mismatches.`,
        `Resource Already Exists: Using If-None-Match: * prevents overwriting existing resources. Your request includes If-None-Match: * which ensures you're creating a new resource, not overwriting an existing one. If the resource already exists, the condition fails.`,
        `Resource Modified After Timestamp: The resource's lastModified timestamp is greater than your If-Modified-Since header value. The resource was modified after the timestamp you specified. This occurs with conditional GET requests.`,
      ],
      solutions: [
        `Step 1: Diagnose - Get fresh ETag from current resource state. For Storage blobs:\n   az storage blob show --container-name <container> --name <blob> --account-name <account> --query "properties.etag" --output table`,
        `Step 2: Diagnose - Check resource properties to understand what changed:\n   az storage blob show --container-name <container> --name <blob> --account-name <account> --query "{etag:properties.etag, lastModified:properties.lastModified}" --output table`,
        `Step 3: Fix - Retry with fresh ETag using the read-modify-write pattern: GET the resource, modify it, then PUT with the fresh ETag.`,
        `Step 4: Fix - If using If-None-Match: *, remove the header if you want to allow overwrites, or use a different resource name.`,
        `Step 5: Fix - Use a more recent timestamp for If-Modified-Since, or get the current resource state.`,
        `Step 6: Verify - Retry your operation with the fresh ETag. It should succeed with HTTP 200/201 instead of 412 PreconditionFailed.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'ETag Management and Retry Logic',
          code: `# This script helps diagnose PreconditionFailed errors by managing ETags

# Step 1: Set storage account details (replace with your values)
STORAGE_ACCOUNT="mystorageaccount"
CONTAINER_NAME="mycontainer"
BLOB_NAME="myblob.txt"
# Note: For production, use Azure Key Vault or managed identity instead of account key
ACCOUNT_KEY="your-storage-account-key"

# Step 2: Get current ETag from blob
echo "Getting current ETag from blob..."
CURRENT_ETAG=\$(az storage blob show \\
  --container-name \$CONTAINER_NAME \\
  --name \$BLOB_NAME \\
  --account-name \$STORAGE_ACCOUNT \\
  --account-key \$ACCOUNT_KEY \\
  --query "properties.etag" \\
  --output tsv)

if [ ! -z "\$CURRENT_ETAG" ]; then
  echo "Current ETag: \$CURRENT_ETAG"
else
  echo "Blob not found or inaccessible"
  exit 1
fi

# Step 3: Get resource properties to understand what changed
echo "Getting blob properties..."
az storage blob show \\
  --container-name \$CONTAINER_NAME \\
  --name \$BLOB_NAME \\
  --account-name \$STORAGE_ACCOUNT \\
  --account-key \$ACCOUNT_KEY \\
  --query "{etag:properties.etag, lastModified:properties.lastModified, contentLength:properties.contentLength}" \\
  --output table

# Step 4: Retry function with ETag refresh
retry_with_etag() {
  local max_attempts=\$1
  local attempt=1
  shift 1
  
  while [ \$attempt -le \$max_attempts ]; do
    echo "Attempt \$attempt of \$max_attempts..."
    
    # Get fresh ETag before each attempt
    FRESH_ETAG=\$(az storage blob show \\
      --container-name \$CONTAINER_NAME \\
      --name \$BLOB_NAME \\
      --account-name \$STORAGE_ACCOUNT \\
      --account-key \$ACCOUNT_KEY \\
      --query "properties.etag" \\
      --output tsv)
    
    echo "Using ETag: \$FRESH_ETAG"
    
    # Perform operation with fresh ETag
    # Note: Azure CLI doesn't directly support If-Match headers
    # You would need to use REST API or SDK for conditional operations
    # This is a demonstration of the pattern
    
    if [ \$attempt -lt \$max_attempts ]; then
      echo "Waiting before retry..."
      sleep 1
      attempt=\$((attempt + 1))
    else
      echo "Max attempts reached"
      break
    fi
  done
}

# Step 5: Instructions for using ETags with REST API
echo ""
echo "To use ETags with conditional headers:"
echo "  1. GET the resource to obtain current ETag"
echo "  2. Include If-Match header with the ETag in your update request"
echo "  3. If you get 412 PreconditionFailed, GET the resource again for fresh ETag"
echo "  4. Retry the update with the fresh ETag"
echo ""
echo "Example REST API call with If-Match:"
echo "  PUT /subscriptions/{sub-id}/resourceGroups/{rg}/providers/..."
echo "  Headers:"
echo "    If-Match: \"\$CURRENT_ETAG\""
echo "    Authorization: Bearer <token>"`,
        },
      ],
      relatedCodes: ['ConflictError', 'ResourceModified'],
      provider: 'azure',
    },
    'InvalidResourceLocation': {
      code: 'InvalidResourceLocation',
      name: 'Invalid Resource Location: Region Not Available',
      description: `The region/location value is wrong—format might be invalid (must be lowercase with no spaces like "eastus", not "East US"), the resource type isn't available there, or your subscription lacks access to a restricted region. This 400 client-side error occurs after ARM validates the location format but finds the provider doesn't support that resource type in that region, or you need approval for restricted regions (government clouds, some commercial regions). Resource availability varies by provider and region. Common in VM deployments, AKS cluster creation, Azure SQL database provisioning, and App Service deployments when using unsupported or restricted regions.`,
      metaDescription: 'Correct InvalidResourceLocation. List available regions, verify resource type support, and request access to restricted regions via support tickets.',
      causes: [
        `Invalid Location Format: The location value doesn't match the canonical region identifier format. It must be lowercase with no spaces (e.g., "eastus" not "East US" or "EastUS"). ARM rejects locations that violate format rules before checking availability.`,
        `Resource Type Not Available in Region: The resource provider doesn't support this resource type in the specified region. Resource availability varies by provider and region. Some resource types are only available in specific regions.`,
        `Subscription Region Access Denied: Your subscription doesn't have access to a restricted region. Some regions (e.g., government clouds, restricted commercial regions) require support ticket approval before you can create resources there.`,
      ],
      solutions: [
        `Step 1: Diagnose - List all available regions:\n   az account list-locations --query "[].{name:name, displayName:displayName}" --output table`,
        `Step 2: Diagnose - Check resource type locations:\n   az provider show --namespace <provider-namespace> --query "resourceTypes[?resourceType=='<type>'].locations" --output table`,
        `Step 3: Diagnose - Verify location format is correct—lowercase with no spaces (e.g., "eastus" not "East US").`,
        `Step 4: Fix - Use a supported region from provider capabilities. Select a region from the locations array returned by the provider show command.`,
        `Step 5: Fix - Request access to restricted regions through Azure Portal support ticket. Approval time varies.`,
        `Step 6: Verify - Retry your resource creation operation with the supported region. It should succeed with HTTP 201 instead of 400 InvalidResourceLocation.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Location Validation and Region Availability',
          code: `# This script helps diagnose InvalidResourceLocation errors by validating regions

# Step 1: List all available regions
echo "Listing all available regions..."
az account list-locations --query "[].{name:name, displayName:displayName, regionalDisplayName:regionalDisplayName}" --output table

# Step 2: Example location (replace with your target location)
LOCATION="eastus"
echo "Validating location: \$LOCATION"

# Step 3: Verify location format (lowercase, no spaces)
if [[ ! \$LOCATION =~ ^[a-z0-9]+$ ]]; then
  echo "ERROR: Invalid location format"
  echo "Required: lowercase alphanumeric, no spaces (e.g., 'eastus' not 'East US')"
  exit 1
fi
echo "Location format is valid"

# Step 4: Check if location exists in available regions
if az account list-locations --query "[?name=='\$LOCATION'].name" --output tsv | grep -q "\$LOCATION"; then
  echo "Location \$LOCATION is available"
else
  echo "ERROR: Location \$LOCATION not found in available regions"
  echo "Available regions:"
  az account list-locations --query "[].name" --output table
  exit 1
fi

# Step 5: Check resource type availability in region (example: Virtual Machines)
PROVIDER_NAMESPACE="Microsoft.Compute"
RESOURCE_TYPE="virtualMachines"
echo "Checking if \$RESOURCE_TYPE is available in region \$LOCATION..."
AVAILABLE_LOCATIONS=\$(az provider show \\
  --namespace \$PROVIDER_NAMESPACE \\
  --query "resourceTypes[?resourceType=='\$RESOURCE_TYPE'].locations" \\
  --output tsv)

if echo "\$AVAILABLE_LOCATIONS" | grep -q "\$LOCATION"; then
  echo "Resource type \$RESOURCE_TYPE is available in region \$LOCATION"
else
  echo "WARNING: Resource type \$RESOURCE_TYPE may not be available in region \$LOCATION"
  echo "Available locations for \$RESOURCE_TYPE:"
  echo "\$AVAILABLE_LOCATIONS"
fi

# Step 6: Check for other resource types (example: Storage accounts)
echo "Checking Storage account availability..."
az provider show \\
  --namespace Microsoft.Storage \\
  --query "resourceTypes[?resourceType=='storageAccounts'].locations" \\
  --output table

# Step 7: Check AKS availability
echo "Checking AKS availability..."
az provider show \\
  --namespace Microsoft.ContainerService \\
  --query "resourceTypes[?resourceType=='managedClusters'].locations" \\
  --output table

# Step 8: Instructions for requesting restricted region access
echo ""
echo "To request access to restricted regions:"
echo "  1. Go to Azure Portal > Support + troubleshooting > New support request"
echo "  2. Select 'Service and subscription limits (quotas)'"
echo "  3. Select the region you need access to"
echo "  4. Fill out the request and submit"`,
        },
      ],
      relatedCodes: ['BadRequest', 'InvalidRequestContent'],
      provider: 'azure',
    },
    'OperationNotAllowed': {
      code: 'OperationNotAllowed',
      name: 'Operation Not Allowed: State or Policy Violation',
      description: `Something's blocking the operation—a resource lock (CanNotDelete or ReadOnly), an invalid provisioning state ("Deleting" or "Failed"), or an Azure Policy with Deny effect. This 409/403 client-side error means ARM evaluated constraints and found a blocker. Locks override RBAC permissions, so even Contributor role can't delete resources with CanNotDelete locks. Provisioning states like "Deleting" or "Failed" block most operations until state transitions complete. Azure Policy Deny assignments at subscription/resource group scopes block operations regardless of RBAC. Common in VM management, AKS cluster operations, Azure SQL database changes, and App Service deployments.`,
      metaDescription: 'Unblock OperationNotAllowed. Check for resource locks, verify provisioning states, and review Azure Policy Deny assignments blocking operations.',
      causes: [
        `Resource Lock: The resource has a CanNotDelete or ReadOnly lock that prevents delete/modify operations. Locks are applied at subscription, resource group, or resource scope and override RBAC permissions—even if you have Contributor role, a lock can block operations. CanNotDelete blocks deletes, ReadOnly blocks all modifications.`,
        `Invalid Provisioning State: The resource's provisioningState is "Deleting" or "Failed". Most operations require the resource to be in "Succeeded" state. For "Deleting", wait for deletion to complete. For "Failed", you may need to delete and recreate the resource (behavior varies by type).`,
        `Azure Policy Denial: A policy assignment with Deny effect at the subscription, resource group, or management group scope blocks the resource creation/modification. Policy evaluation happens after RBAC, so even with proper permissions, policies can block operations.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check for resource locks:\n   az lock list --scope <resource-id> --query "[].{name:name, level:level, type:type}" --output table`,
        `Step 2: Diagnose - Inspect resource provisioning state:\n   az resource show --ids <resource-id> --query "properties.provisioningState" --output table`,
        `Step 3: Diagnose - Check Azure Policy assignments:\n   az policy assignment list --scope <scope> --query "[?enforcementMode=='Default'].{name:name, policyDefinitionId:policyDefinitionId}" --output table`,
        `Step 4: Fix - Remove locks if you have permissions:\n   az lock delete --ids <resource-id> --name <lock-name>`,
        `Step 5: Fix - Wait for resource state transition if provisioningState is "Deleting" or "Failed".`,
        `Step 6: Fix - Modify or remove the blocking policy if you have permissions.`,
        `Step 7: Verify - Retry your operation. It should succeed instead of returning OperationNotAllowed.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Resource Lock and Policy Diagnosis',
          code: `# This script helps diagnose OperationNotAllowed errors by checking locks and policies

# Step 1: Example resource ID (replace with your actual resource ID)
RESOURCE_ID="/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/my-rg/providers/Microsoft.Compute/virtualMachines/my-vm"
echo "Checking resource: \$RESOURCE_ID"

# Step 2: Check for resource locks
echo "Checking for resource locks..."
az lock list --scope \$RESOURCE_ID --query "[].{name:name, level:level, type:type, notes:notes}" --output table

# Step 3: Check for locks at resource group scope
RESOURCE_GROUP_ID=\$(echo \$RESOURCE_ID | sed 's|/providers/.*||')
echo "Checking for locks at resource group scope: \$RESOURCE_GROUP_ID"
az lock list --scope \$RESOURCE_GROUP_ID --query "[].{name:name, level:level, type:type}" --output table

# Step 4: Check for locks at subscription scope
SUBSCRIPTION_ID=\$(echo \$RESOURCE_ID | sed 's|/subscriptions/\\([^/]*\\).*|\\1|')
echo "Checking for locks at subscription scope: /subscriptions/\$SUBSCRIPTION_ID"
az lock list --scope /subscriptions/\$SUBSCRIPTION_ID --query "[].{name:name, level:level, type:type}" --output table

# Step 5: Check resource provisioning state
echo "Checking resource provisioning state..."
PROVISIONING_STATE=\$(az resource show --ids \$RESOURCE_ID --query "properties.provisioningState" -o tsv 2>/dev/null)
if [ ! -z "\$PROVISIONING_STATE" ]; then
  echo "Provisioning state: \$PROVISIONING_STATE"
  if [ "\$PROVISIONING_STATE" == "Deleting" ]; then
    echo "WARNING: Resource is being deleted. Wait for deletion to complete."
  elif [ "\$PROVISIONING_STATE" == "Failed" ]; then
    echo "WARNING: Resource is in Failed state. May need to delete and recreate."
  fi
else
  echo "Could not retrieve provisioning state"
fi

# Step 6: Check Azure Policy assignments at subscription scope
echo "Checking Azure Policy assignments at subscription scope..."
az policy assignment list \\
  --scope /subscriptions/\$SUBSCRIPTION_ID \\
  --query "[?enforcementMode=='Default'].{name:name, policyDefinitionId:policyDefinitionId, effect:policy.rule.effect}" \\
  --output table

# Step 7: Check Azure Policy assignments at resource group scope
echo "Checking Azure Policy assignments at resource group scope..."
az policy assignment list \\
  --scope \$RESOURCE_GROUP_ID \\
  --query "[?enforcementMode=='Default'].{name:name, policyDefinitionId:policyDefinitionId, effect:policy.rule.effect}" \\
  --output table

# Step 8: Remove lock if found (requires appropriate permissions)
# LOCK_NAME="my-lock"
# echo "Removing lock: \$LOCK_NAME"
# az lock delete --ids \$RESOURCE_ID --name \$LOCK_NAME

# Step 9: Instructions for policy management
echo ""
echo "To modify or remove blocking policies:"
echo "  1. Identify the policy from the list above"
echo "  2. Use: az policy assignment delete --name <policy-name> --scope <scope>"
echo "  3. Or modify the policy assignment to change the effect"`,
        },
      ],
      relatedCodes: ['Forbidden', 'ConflictError'],
      provider: 'azure',
    },
    'BadRequest': {
      code: 'BadRequest',
      name: 'Bad Request: Malformed Request',
      description: `Your request format violates ARM's API contract—malformed JSON syntax, missing required headers (Content-Type: application/json or Authorization: Bearer), wrong parameter types, or invalid API version format (must match YYYY-MM-DD or YYYY-MM-DD-preview). This 400 client-side error occurs when ARM can't parse or validate the request structure. ARM checks JSON syntax first, then required headers, parameter types, and request body size limits. Unlike InvalidRequestContent (which means valid JSON but wrong schema), BadRequest indicates the request structure itself is broken. Appears in VM creation, AKS cluster configuration, Azure SQL database setup, and App Service app settings.`,
      metaDescription: 'Repair BadRequest errors. Validate JSON syntax, check required headers, verify API version format, and fix parameter type mismatches.',
      causes: [
        `Malformed JSON Syntax: The request body contains invalid JSON (unclosed brackets, trailing commas, invalid escape sequences, etc.). ARM can't parse the JSON, so it rejects the request before processing.`,
        `Missing Required Headers: The request is missing Content-Type: application/json or Authorization: Bearer <token> headers. ARM requires these headers for most operations.`,
        `Parameter Type Mismatch: Properties have the wrong data type. A field expecting an integer but receiving a string, or an array where an object is expected, causes this. ARM validates types before processing the request.`,
        `Invalid API Version Format: The API version doesn't match the required format (YYYY-MM-DD or YYYY-MM-DD-preview). API versions must follow this exact pattern.`,
      ],
      solutions: [
        `Step 1: Diagnose - Validate JSON syntax using JSON.parse() to verify your request body is valid JSON. Check for unclosed brackets, trailing commas, invalid escape sequences.`,
        `Step 2: Diagnose - Check required headers are present: Content-Type: application/json and Authorization: Bearer <token>. Inspect your request headers.`,
        `Step 3: Diagnose - Verify API version format matches YYYY-MM-DD or YYYY-MM-DD-preview pattern (e.g., "2023-01-01" or "2023-01-01-preview").`,
        `Step 4: Fix - Fix JSON syntax errors. Use a JSON validator to identify and correct syntax issues.`,
        `Step 5: Fix - Add missing headers. Ensure both Content-Type and Authorization headers are present with correct values.`,
        `Step 6: Fix - Convert parameter values to the correct type. If a field expects an integer, ensure it's a number, not a string.`,
        `Step 7: Verify - Retry your request. It should succeed with HTTP 200/201 instead of 400 BadRequest.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Request Validation and Format Check',
          code: `# This script helps diagnose BadRequest errors by validating request format

# Step 1: Validate JSON syntax (example JSON file)
JSON_FILE="request-body.json"
echo "Validating JSON file: \$JSON_FILE"

if [ -f "\$JSON_FILE" ]; then
  # Check if file is valid JSON using Python (if available)
  if command -v python3 &> /dev/null; then
    if python3 -m json.tool \$JSON_FILE > /dev/null 2>&1; then
      echo "JSON syntax is valid"
    else
      echo "ERROR: Invalid JSON syntax"
      python3 -m json.tool \$JSON_FILE 2>&1 | head -10
      exit 1
    fi
  else
    echo "Python not available. Use an online JSON validator or jq:"
    echo "  jq . \$JSON_FILE"
  fi
else
  echo "JSON file not found: \$JSON_FILE"
fi

# Step 2: Check API version format
API_VERSION="2023-01-01"
echo "Validating API version format: \$API_VERSION"

if [[ \$API_VERSION =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}(-preview)?$ ]]; then
  echo "API version format is valid"
else
  echo "ERROR: Invalid API version format"
  echo "Required format: YYYY-MM-DD or YYYY-MM-DD-preview"
  echo "Example: 2023-01-01 or 2023-01-01-preview"
  exit 1
fi

# Step 3: Validate request body size (example: 1MB limit)
MAX_SIZE=1048576  # 1MB in bytes
if [ -f "\$JSON_FILE" ]; then
  FILE_SIZE=\$(stat -f%z "\$JSON_FILE" 2>/dev/null || stat -c%s "\$JSON_FILE" 2>/dev/null)
  if [ ! -z "\$FILE_SIZE" ]; then
    if [ \$FILE_SIZE -gt \$MAX_SIZE ]; then
      echo "WARNING: Request body size (\$FILE_SIZE bytes) exceeds limit (\$MAX_SIZE bytes)"
    else
      echo "Request body size is within limit: \$FILE_SIZE bytes"
    fi
  fi
fi

# Step 4: Check required headers (for REST API calls)
echo ""
echo "Required headers for ARM API calls:"
echo "  1. Content-Type: application/json"
echo "  2. Authorization: Bearer <token>"
echo ""
echo "To get an access token:"
echo "  az account get-access-token --query accessToken -o tsv"

# Step 5: Validate ARM template (if using templates)
TEMPLATE_FILE="template.json"
PARAMS_FILE="params.json"
if [ -f "\$TEMPLATE_FILE" ]; then
  echo "Validating ARM template..."
  if command -v az &> /dev/null; then
    # Note: This requires a resource group - adjust as needed
    # az deployment group validate \\
    #   --resource-group my-rg \\
    #   --template-file \$TEMPLATE_FILE \\
    #   --parameters @\$PARAMS_FILE
    echo "Use 'az deployment group validate' to validate your template"
  fi
fi

# Step 6: Common JSON syntax errors to check
echo ""
echo "Common JSON syntax errors:"
echo "  1. Trailing commas: { 'key': 'value', }  (remove trailing comma)"
echo "  2. Unclosed brackets: { 'key': 'value'    (missing closing brace)"
echo "  3. Invalid escape sequences: 'path\\file'  (use 'path\\\\file')"
echo "  4. Single quotes instead of double quotes: { 'key': 'value' }  (use double quotes)"
echo "  5. Comments in JSON: { /* comment */ }  (JSON doesn't support comments)"`,
        },
      ],
      relatedCodes: ['InvalidRequestContent', 'ValidationError'],
      provider: 'azure',
    },
    'Forbidden': {
      code: 'Forbidden',
      name: 'Forbidden: RBAC Authorization Denied',
      description: `ARM denied the operation—your role assignments don't include the required action (e.g., Reader role only has read actions, so writes fail). This 403 client-side error means authentication succeeded but authorization failed. ARM evaluates permissions hierarchically (subscription → resource group → resource), so a role at resource group scope won't help with subscription-level operations. Deny assignments at parent scopes always override allow assignments at child scopes, even if you have the right role. Unlike AuthorizationFailed (which might have different nuances), Forbidden explicitly means your roles lack the required actions. Common in VM management, AKS cluster operations, Azure SQL database changes, and App Service deployments.`,
      metaDescription: 'Overcome Forbidden errors. Identify missing role actions, check scope hierarchy, and verify Deny assignments are not blocking your operations.',
      causes: [
        `Missing Required Actions: Your role assignment doesn't include the specific action needed for this operation. Each operation requires a particular action (e.g., Microsoft.Storage/storageAccounts/write for creating storage accounts). Reader role only includes read actions, so write operations fail.`,
        `Role Scope Mismatch: Your role is assigned at a narrower scope than the operation requires. Having Contributor at resource group scope but needing subscription-level permissions causes the operation to fail. ARM doesn't automatically elevate permissions from child to parent scope.`,
        `Deny Assignment Blocking: A deny assignment at a parent scope (subscription or resource group) explicitly blocks the action, even if you have an allow assignment at a child scope. Deny assignments take precedence over allow assignments.`,
      ],
      solutions: [
        `Step 1: Diagnose - Query your role assignments at the operation scope:\n   az role assignment list --assignee <your-principal-id> --scope <operation-scope> --all --output table`,
        `Step 2: Diagnose - Check for deny assignments blocking the operation:\n   az role assignment list --scope <scope> --include-denied --output table`,
        `Step 3: Diagnose - Verify your role includes the required action:\n   az role definition show --name <role-name> --query "permissions[0].actions" --output table`,
        `Step 4: Fix - Grant role at the correct scope:\n   az role assignment create --assignee <principal-id> --role <role-name> --scope <scope>`,
        `Step 5: Fix - Wait 5-10 minutes for role assignment propagation (not guaranteed to be immediate).`,
        `Step 6: Verify - Re-run the role assignment list command—you should see the new role. Then retry your operation.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'RBAC Permission Diagnosis',
          code: `# This script helps diagnose Forbidden errors by checking RBAC permissions

# Step 1: Get your current principal ID
echo "Getting current principal information..."
CURRENT_USER=\$(az account show --query user.name -o tsv)
echo "Current user: \$CURRENT_USER"

# Step 2: Get subscription ID
SUBSCRIPTION_ID=\$(az account show --query id -o tsv)
echo "Subscription ID: \$SUBSCRIPTION_ID"

# Step 3: Example operation scope (replace with your actual scope)
OPERATION_SCOPE="/subscriptions/\$SUBSCRIPTION_ID/resourceGroups/my-rg"
echo "Checking permissions at scope: \$OPERATION_SCOPE"

# Step 4: Query role assignments at operation scope
echo "Checking role assignments at operation scope..."
az role assignment list \\
  --assignee \$CURRENT_USER \\
  --scope \$OPERATION_SCOPE \\
  --all \\
  --query "[].{role:roleDefinitionName, scope:scope}" \\
  --output table

# Step 5: Check for deny assignments
echo "Checking for deny assignments..."
az role assignment list \\
  --scope \$OPERATION_SCOPE \\
  --include-denied \\
  --query "[?principalType=='ServicePrincipal' || principalType=='User'].{principal:principalName, role:roleDefinitionName, type:principalType, denied:denied}" \\
  --output table

# Step 6: Check role definition for a specific role (example: Contributor)
echo "Checking Contributor role permissions..."
az role definition show \\
  --name "Contributor" \\
  --query "permissions[0].actions" \\
  --output table

# Step 7: Check role assignments at subscription scope
echo "Checking role assignments at subscription scope..."
az role assignment list \\
  --assignee \$CURRENT_USER \\
  --scope /subscriptions/\$SUBSCRIPTION_ID \\
  --all \\
  --query "[].{role:roleDefinitionName, scope:scope}" \\
  --output table

# Step 8: Test permission by attempting a read operation
echo "Testing read permission..."
if az group show --name my-rg --output table 2>&1; then
  echo "Read permission: OK"
else
  echo "Read permission: FAILED"
fi

# Step 9: Instructions for granting roles
echo ""
echo "To grant a role at the correct scope:"
echo "  az role assignment create \\"
echo "    --assignee \$CURRENT_USER \\"
echo "    --role 'Contributor' \\"
echo "    --scope \$OPERATION_SCOPE"`,
        },
      ],
      relatedCodes: ['AuthorizationFailed', 'AccessDenied'],
      provider: 'azure',
    },
    'NotFound': {
      code: 'NotFound',
      name: 'Not Found: API Endpoint or Provider Missing',
      description: `The API endpoint, resource provider, or API version doesn't exist—unlike ResourceNotFound (missing resource), this indicates infrastructure-level issues. This 404 client-side error means the endpoint/provider/version itself isn't available. The resource provider might not be registered in your subscription (registrationState ≠ "Registered"), the API version doesn't exist for that resource type, or the endpoint path format is wrong. Provider registration is required before creating resources of that type. Common in VM deployments, AKS cluster API calls, Azure SQL database operations, and App Service deployments when using unregistered providers or unsupported API versions.`,
      metaDescription: 'Fix NotFound endpoint errors. Register resource providers, verify API version support, and validate endpoint path formats.',
      causes: [
        `API Version Not Supported: The API version you're requesting doesn't exist for this resource type. API versions are resource-type-specific, and not all versions are available for all types.`,
        `Resource Provider Not Registered: The provider namespace isn't registered in your subscription (registrationState !== "Registered"). Providers must be registered before you can create resources of that type.`,
        `Invalid Endpoint Path: The REST API endpoint path format is incorrect (missing segments, typos in resource path, or malformed URL structure). The path doesn't follow the correct ARM structure.`,
      ],
      solutions: [
        `Step 1: Diagnose - Query supported API versions:\n   az provider show --namespace <provider-namespace> --query "resourceTypes[?resourceType=='<type>'].apiVersions" --output table`,
        `Step 2: Diagnose - Check provider registration state:\n   az provider show --namespace <provider-namespace> --query "registrationState" --output table`,
        `Step 3: Diagnose - Verify endpoint path format follows the correct ARM structure: /subscriptions/{sub-id}/resourceGroups/{rg}/providers/{namespace}/{type}/{name}?api-version={version}`,
        `Step 4: Fix - Register the provider if not registered:\n   az provider register --namespace <provider-namespace>`,
        `Step 5: Fix - Wait for registration to complete:\n   az provider wait --namespace <provider-namespace> --registered`,
        `Step 6: Fix - Use a supported API version from the list returned by the provider show command.`,
        `Step 7: Verify - Retry your operation. It should succeed instead of returning NotFound.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Provider and API Version Diagnosis',
          code: `# This script helps diagnose NotFound errors by checking provider registration and API versions

# Step 1: Example provider namespace (replace with your actual provider)
PROVIDER_NAMESPACE="Microsoft.Compute"
RESOURCE_TYPE="virtualMachines"
echo "Checking provider: \$PROVIDER_NAMESPACE"

# Step 2: Check provider registration state
echo "Checking provider registration state..."
REGISTRATION_STATE=\$(az provider show --namespace \$PROVIDER_NAMESPACE --query "registrationState" -o tsv)
echo "Registration state: \$REGISTRATION_STATE"

if [ "\$REGISTRATION_STATE" != "Registered" ]; then
  echo "WARNING: Provider is not registered. Registering..."
  az provider register --namespace \$PROVIDER_NAMESPACE
  echo "Waiting for registration to complete..."
  az provider wait --namespace \$PROVIDER_NAMESPACE --registered
  echo "Provider registered"
else
  echo "Provider is registered"
fi

# Step 3: Query supported API versions for the resource type
echo "Checking supported API versions for \$RESOURCE_TYPE..."
az provider show \\
  --namespace \$PROVIDER_NAMESPACE \\
  --query "resourceTypes[?resourceType=='\$RESOURCE_TYPE'].apiVersions" \\
  --output table

# Step 4: List all resource types for the provider
echo "Listing all resource types for \$PROVIDER_NAMESPACE..."
az provider show \\
  --namespace \$PROVIDER_NAMESPACE \\
  --query "resourceTypes[].resourceType" \\
  --output table

# Step 5: Check other common providers
echo "Checking registration state for common providers..."
COMMON_PROVIDERS=("Microsoft.Storage" "Microsoft.Network" "Microsoft.ContainerService" "Microsoft.Sql")
for provider in "\${COMMON_PROVIDERS[@]}"; do
  STATE=\$(az provider show --namespace \$provider --query "registrationState" -o tsv 2>/dev/null)
  if [ ! -z "\$STATE" ]; then
    echo "  \$provider: \$STATE"
  fi
done

# Step 6: Verify endpoint path format
echo ""
echo "ARM endpoint path format:"
echo "  /subscriptions/{sub-id}/resourceGroups/{rg}/providers/{namespace}/{type}/{name}?api-version={version}"
echo ""
echo "Example:"
SUBSCRIPTION_ID=\$(az account show --query id -o tsv)
echo "  /subscriptions/\$SUBSCRIPTION_ID/resourceGroups/my-rg/providers/Microsoft.Compute/virtualMachines/my-vm?api-version=2023-01-01"

# Step 7: Instructions for fixing common issues
echo ""
echo "Common fixes for NotFound:"
echo "  1. Register unregistered providers: az provider register --namespace <namespace>"
echo "  2. Use supported API versions from provider show command"
echo "  3. Verify endpoint path matches ARM structure exactly"
echo "  4. Check for typos in provider namespace or resource type"`,
        },
      ],
      relatedCodes: ['ResourceNotFound', 'ResourceGroupNotFound'],
      provider: 'azure',
    },
    'ValidationError': {
      code: 'ValidationError',
      name: 'Validation Error: Business Rule Violation',
      description: `Your request violates resource-specific business rules—the JSON structure is valid (unlike BadRequest), but values break constraints like uniqueness, dependency validation, or property compatibility rules. This 400 client-side error occurs after ARM validates schema and finds business rule violations. Examples include name uniqueness constraints (globally unique vs scoped), dependency resources missing or in invalid state, or incompatible property combinations (certain SKUs might not be allowed together). ARM validates constraints after schema validation passes. Common in VM creation, AKS cluster configuration, Azure SQL database setup, and App Service deployments.`,
      metaDescription: 'Resolve ValidationError constraints. Check name uniqueness rules, verify dependency states, and fix property compatibility issues.',
      causes: [
        `Uniqueness Constraint Violation: The resource name violates a uniqueness rule. Uniqueness scope varies by resource type—some resources require globally unique names (e.g., storage accounts), while others only need uniqueness within a resource group or subscription.`,
        `Business Rule Violation: A resource property violates a business rule. Property compatibility rules vary by resource type. Certain SKU combinations might not be allowed, or property values might conflict with each other.`,
        `Dependency Validation Failure: A referenced resource (dependency) doesn't exist or is in an invalid state. ARM validates that all referenced resources exist and are in a valid state before allowing the operation.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check resource name uniqueness:\n   az resource list --query "[?name=='<resource-name>'].{id:id, name:name, type:type}" --output table`,
        `Step 2: Diagnose - Verify resource dependencies exist and are valid:\n   az resource show --ids <dependency-resource-id> --query "{name:name, provisioningState:properties.provisioningState}" --output table`,
        `Step 3: Diagnose - Validate ARM template to catch constraint violations:\n   az deployment group validate --resource-group <rg> --template-file template.json --parameters @params.json`,
        `Step 4: Fix - Use a unique name if name conflict exists. For globally unique resources, check across all subscriptions.`,
        `Step 5: Fix - Fix dependency issues. Ensure all dependencies exist and have provisioningState: "Succeeded".`,
        `Step 6: Fix - Fix business rule violations based on the error message details. Use compatible properties or valid values.`,
        `Step 7: Verify - Retry your resource creation operation. It should succeed with HTTP 201 instead of 400 ValidationError.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Resource Validation and Dependency Check',
          code: `# This script helps diagnose ValidationError by checking uniqueness and dependencies

# Step 1: Example resource name (replace with your actual resource name)
RESOURCE_NAME="my-resource"
RESOURCE_TYPE="Microsoft.Compute/virtualMachines"
echo "Checking resource name uniqueness: \$RESOURCE_NAME"

# Step 2: Check if resource with same name exists
echo "Checking for existing resources with name \$RESOURCE_NAME..."
az resource list \\
  --query "[?name=='\$RESOURCE_NAME'].{id:id, name:name, type:type, location:location}" \\
  --output table

# Step 3: Check storage account name availability (globally unique)
STORAGE_NAME="mystorageaccount"
echo "Checking storage account name availability: \$STORAGE_NAME"
az storage account check-name --name \$STORAGE_NAME --output table

# Step 4: Example dependency resource ID (replace with your actual dependency)
DEPENDENCY_ID="/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/my-rg/providers/Microsoft.Network/virtualNetworks/my-vnet"
echo "Checking dependency: \$DEPENDENCY_ID"

# Step 5: Verify dependency exists and is valid
echo "Checking dependency status..."
DEPENDENCY_STATE=\$(az resource show --ids \$DEPENDENCY_ID --query "properties.provisioningState" -o tsv 2>/dev/null)
if [ ! -z "\$DEPENDENCY_STATE" ]; then
  echo "Dependency provisioning state: \$DEPENDENCY_STATE"
  if [ "\$DEPENDENCY_STATE" == "Succeeded" ]; then
    echo "Dependency is in valid state"
  else
    echo "WARNING: Dependency is not in Succeeded state"
  fi
else
  echo "ERROR: Dependency not found"
fi

# Step 6: Validate ARM template (if using templates)
TEMPLATE_FILE="template.json"
PARAMS_FILE="params.json"
RESOURCE_GROUP="my-resource-group"
if [ -f "\$TEMPLATE_FILE" ] && [ -f "\$PARAMS_FILE" ]; then
  echo "Validating ARM template..."
  az deployment group validate \\
    --resource-group \$RESOURCE_GROUP \\
    --template-file \$TEMPLATE_FILE \\
    --parameters @\$PARAMS_FILE \\
    --output table
else
  echo "Template files not found. Skipping template validation."
fi

# Step 7: Check for common business rule violations
echo ""
echo "Common business rule violations to check:"
echo "  1. Resource name uniqueness (globally or within scope)"
echo "  2. SKU compatibility (certain SKUs may not be available together)"
echo "  3. Property value conflicts (e.g., conflicting network settings)"
echo "  4. Dependency state (dependencies must be in 'Succeeded' state)"
echo "  5. Region availability for resource type"
echo "  6. Subscription limits or constraints"`,
        },
      ],
      relatedCodes: ['InvalidRequestContent', 'BadRequest'],
      provider: 'azure',
    },
    'Unauthorized': {
      code: 'Unauthorized',
      name: 'Unauthorized: Missing or Invalid Authentication',
      description: `Your request lacks authentication or uses an unsupported method—ARM requires OAuth 2.0 Bearer token authentication, and the Authorization header is missing or invalid. This 401 client-side error occurs before token validation; ARM checks for authentication presence first, so this fails earlier than AuthenticationFailed (which means invalid token). Unlike InvalidAuthenticationInfo (wrong header format), Unauthorized means authentication is missing entirely or uses unsupported schemes (ARM doesn't support basic auth or API keys). Common in VM operations, AKS cluster API calls, Azure SQL database connections, and App Service deployments when authentication isn't configured properly.`,
      metaDescription: 'Authenticate requests properly. Add Authorization headers, use OAuth 2.0 Bearer tokens, and configure credential libraries correctly.',
      causes: [
        `Missing Authentication Header: The request lacks an Authorization header or uses an invalid authentication method. ARM requires valid authentication credentials before processing any resource operations. This is persistent—retrying without adding authentication always fails.`,
        `Expired Token: The access token has passed its expiration timestamp. Tokens typically expire after 1 hour, but duration isn't guaranteed and varies by token type. This is transient—refreshing the token and retrying helps.`,
        `Invalid Authentication Method: The request uses an unsupported authentication scheme. ARM requires OAuth 2.0 Bearer token authentication. Other methods (basic auth, API keys) are not supported and cause Unauthorized errors. This is persistent—you must use the correct authentication method.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check if Authorization header is present in your request. Verify the header format is "Authorization: Bearer <token>".`,
        `Step 2: Diagnose - Check if token is expired by decoding it (jwt.io) and checking the exp claim against current Unix timestamp.`,
        `Step 3: Diagnose - Verify authentication method is OAuth 2.0 Bearer token. ARM doesn't support basic auth or API keys.`,
        `Step 4: Fix - Add valid credentials to your request. Use @azure/identity credential classes which handle authentication automatically.`,
        `Step 5: Fix - Refresh expired tokens using your credential library's getToken() method. @azure/identity credential classes handle token refresh automatically.`,
        `Step 6: Fix - Use OAuth 2.0 Bearer token authentication. Ensure your request includes "Authorization: Bearer <token>" header with a valid token.`,
        `Step 7: Verify - Retry your operation. It should succeed with HTTP 200/201 instead of 401 Unauthorized.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Authentication Verification',
          code: `# This script helps diagnose Unauthorized errors by checking authentication

# Step 1: Check if Azure CLI is authenticated
echo "Checking Azure CLI authentication..."
if az account show --output table 2>&1; then
  echo "Azure CLI is authenticated"
else
  echo "ERROR: Azure CLI is not authenticated"
  echo "Run: az login"
  exit 1
fi

# Step 2: Get current account information
echo "Getting current account information..."
az account show --query "{subscriptionId:id, name:name, tenantId:tenantId, user:user.name}" --output table

# Step 3: Get access token
echo "Getting access token..."
TOKEN=\$(az account get-access-token --query accessToken -o tsv 2>/dev/null)
if [ ! -z "\$TOKEN" ]; then
  echo "Access token obtained successfully"
  echo "Token preview (first 50 chars): \${TOKEN:0:50}..."
  
  # Step 4: Check token expiration (requires jq or manual decoding)
  echo "To check token expiration, decode at https://jwt.io"
  echo "Or use: echo \$TOKEN | cut -d'.' -f2 | base64 -d | jq .exp"
else
  echo "ERROR: Failed to obtain access token"
  echo "Run: az login"
  exit 1
fi

# Step 5: Test authentication by making a simple API call
echo "Testing authentication with a simple API call..."
if az group list --output table 2>&1; then
  echo "Authentication test: SUCCESS"
else
  echo "Authentication test: FAILED"
  echo "Check the error message above"
fi

# Step 6: Check for service principal authentication
echo "Checking for service principal authentication..."
SP_INFO=\$(az account show --query "{type:user.type, name:user.name}" -o tsv 2>/dev/null)
if [ ! -z "\$SP_INFO" ]; then
  echo "Authentication type: \$SP_INFO"
fi

# Step 7: Instructions for fixing authentication issues
echo ""
echo "Common fixes for Unauthorized:"
echo "  1. Run 'az login' to authenticate with Azure CLI"
echo "  2. For service principals, use 'az login --service-principal -u <app-id> -p <password> --tenant <tenant-id>'"
echo "  3. For managed identities, ensure the identity has proper permissions"
echo "  4. Refresh expired tokens using credential library's getToken() method"
echo "  5. Ensure Authorization header format is: 'Authorization: Bearer <token>'"`,
        },
      ],
      relatedCodes: ['AuthenticationFailed', 'InvalidAuthenticationInfo'],
      provider: 'azure',
    },
    'InvalidResource': {
      code: 'InvalidResource',
      name: 'Invalid Resource: Schema or Structure Violation',
      description: `The resource definition breaks ARM's structure requirements—required top-level properties (type, apiVersion, properties) might be missing, the resource type doesn't exist or isn't registered, or properties violate the schema for your API version. This 400 client-side error occurs when ARM validates the resource definition against the resource type's schema before processing operations. The resource type must be registered with its provider namespace first. Schema requirements vary by API version, so what's valid in one version might be invalid in another. Applies to VM definitions, AKS cluster configurations, Azure SQL database definitions, and App Service definitions.`,
      metaDescription: 'Correct InvalidResource structure. Verify required properties, register resource providers, and validate schemas match your API version.',
      causes: [
        `Resource Structure Violation: The resource definition doesn't match ARM's expected structure. Required top-level properties (type, apiVersion, properties) may be missing or incorrectly formatted. ARM validates structure before processing resource operations.`,
        `Resource Type Mismatch: The specified resource type doesn't exist or isn't registered in your subscription. Resource types must be registered with their provider namespace before you can create resources of that type.`,
        `Resource Schema Violation: Properties don't match the resource type's schema for your API version. Schema requirements vary by API version—properties that are valid in one version may be invalid in another.`,
      ],
      solutions: [
        `Step 1: Diagnose - Validate the resource definition matches ARM's expected format. Ensure required properties (type, apiVersion, properties) are present and correctly formatted.`,
        `Step 2: Diagnose - Verify the resource type exists and is registered:\n   az provider show --namespace <provider-namespace> --query "resourceTypes[?resourceType=='<type>']" --output table`,
        `Step 3: Diagnose - Check the ARM REST API reference for your resource type and API version to see required properties and allowed values.`,
        `Step 4: Fix - Register the provider if not registered:\n   az provider register --namespace <provider-namespace>`,
        `Step 5: Fix - Fix resource structure violations. Ensure type, apiVersion, and properties are correctly formatted.`,
        `Step 6: Fix - Fix schema violations to match the resource type's schema for your API version.`,
        `Step 7: Verify - Use 'az deployment group validate' to catch structure violations before deployment:\n   az deployment group validate --resource-group <rg> --template-file template.json`,
        `Step 8: Verify - Retry your operation. It should succeed instead of returning InvalidResource.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Resource Structure Validation',
          code: `# This script helps diagnose InvalidResource errors by validating resource structure

# Step 1: Example provider namespace and resource type
PROVIDER_NAMESPACE="Microsoft.Compute"
RESOURCE_TYPE="virtualMachines"
echo "Checking resource type: \$PROVIDER_NAMESPACE/\$RESOURCE_TYPE"

# Step 2: Check if provider is registered
echo "Checking provider registration..."
REGISTRATION_STATE=\$(az provider show --namespace \$PROVIDER_NAMESPACE --query "registrationState" -o tsv)
echo "Registration state: \$REGISTRATION_STATE"

if [ "\$REGISTRATION_STATE" != "Registered" ]; then
  echo "Provider not registered. Registering..."
  az provider register --namespace \$PROVIDER_NAMESPACE
  az provider wait --namespace \$PROVIDER_NAMESPACE --registered
fi

# Step 3: Check if resource type exists
echo "Checking if resource type exists..."
RESOURCE_TYPE_EXISTS=\$(az provider show \\
  --namespace \$PROVIDER_NAMESPACE \\
  --query "resourceTypes[?resourceType=='\$RESOURCE_TYPE']" \\
  --output tsv)

if [ ! -z "\$RESOURCE_TYPE_EXISTS" ]; then
  echo "Resource type exists"
else
  echo "ERROR: Resource type \$RESOURCE_TYPE not found for provider \$PROVIDER_NAMESPACE"
  echo "Available resource types:"
  az provider show --namespace \$PROVIDER_NAMESPACE --query "resourceTypes[].resourceType" --output table
  exit 1
fi

# Step 4: Get available API versions for the resource type
echo "Getting available API versions..."
az provider show \\
  --namespace \$PROVIDER_NAMESPACE \\
  --query "resourceTypes[?resourceType=='\$RESOURCE_TYPE'].apiVersions" \\
  --output table

# Step 5: Validate ARM template structure (if using templates)
TEMPLATE_FILE="template.json"
if [ -f "\$TEMPLATE_FILE" ]; then
  echo "Validating ARM template structure..."
  
  # Check for required top-level properties using jq (if available)
  if command -v jq &> /dev/null; then
    echo "Checking template structure..."
    if jq -e '.resources[0].type' \$TEMPLATE_FILE > /dev/null 2>&1; then
      echo "Template has 'type' property"
    else
      echo "ERROR: Template missing 'type' property"
    fi
    
    if jq -e '.resources[0].apiVersion' \$TEMPLATE_FILE > /dev/null 2>&1; then
      echo "Template has 'apiVersion' property"
    else
      echo "ERROR: Template missing 'apiVersion' property"
    fi
    
    if jq -e '.resources[0].properties' \$TEMPLATE_FILE > /dev/null 2>&1; then
      echo "Template has 'properties' property"
    else
      echo "WARNING: Template missing 'properties' property (may be optional for some types)"
    fi
  else
    echo "jq not available. Use 'az deployment group validate' to validate template"
  fi
fi

# Step 6: Required resource structure
echo ""
echo "Required ARM resource structure:"
echo "  {"
echo "    \"type\": \"<provider-namespace>/<resource-type>\","
echo "    \"apiVersion\": \"<api-version>\","
echo "    \"properties\": {"
echo "      // resource-specific properties"
echo "    }"
echo "  }"
echo ""
echo "Example for Virtual Machine:"
echo "  {"
echo "    \"type\": \"Microsoft.Compute/virtualMachines\","
echo "    \"apiVersion\": \"2023-01-01\","
echo "    \"properties\": {"
echo "      \"hardwareProfile\": { ... },"
echo "      \"storageProfile\": { ... }"
echo "    }"
echo "  }"`,
        },
      ],
      relatedCodes: ['InvalidRequestContent', 'ValidationError'],
      provider: 'azure',
    },
    'ResourceModified': {
      code: 'ResourceModified',
      name: 'Resource Modified: Concurrent Modification Detected',
      description: `The resource changed between your read and write operations—your ETag is stale because another process modified it concurrently. This 409 client-side error means ARM's optimistic concurrency control rejected the update to prevent lost updates. ARM compares your request's ETag against the current resource ETag; mismatches indicate concurrent modifications. ETags update immediately when resources change, so parallel operations cause conflicts. This is transient—refreshing the ETag and retrying usually works. Common in VM updates, AKS cluster modifications, Azure SQL database changes, and App Service configuration updates when multiple processes modify resources simultaneously.`,
      metaDescription: 'Handle ResourceModified conflicts. Implement read-modify-write patterns, refresh ETags before updates, and add retry logic for concurrent modifications.',
      causes: [
        `Concurrent Modification: Another process updates the resource between your read and write operations. ARM updates ETags immediately when resources change, so concurrent modifications cause ETag mismatches. This is transient—getting a fresh ETag and retrying helps.`,
        `ETag Mismatch: Your If-Match header value doesn't match the current resource.etag. The resource was modified after you retrieved it, indicating another operation changed it concurrently. This is transient—retrying with a fresh ETag helps.`,
        `Version Conflict: Optimistic concurrency control failure. ARM validates ETags to prevent lost updates—if your ETag is stale, ARM rejects the operation. This is transient when caused by concurrent modifications—retrying with a fresh ETag helps.`,
      ],
      solutions: [
        `Step 1: Diagnose - Get fresh ETag from the current resource state. GET the resource and extract the ETag from response headers.`,
        `Step 2: Diagnose - Compare the ETag in your failed request to the current resource ETag. They should differ if the resource was modified.`,
        `Step 3: Fix - Use the read-modify-write pattern: GET the resource, modify it, then PUT with the fresh ETag.`,
        `Step 4: Fix - Implement retry logic that catches ResourceModified and refreshes the ETag before retrying.`,
        `Step 5: Fix - Always GET the resource before updating to ensure you have the latest ETag.`,
        `Step 6: Verify - Retry your operation with the fresh ETag. It should succeed with HTTP 200/201 instead of ResourceModified.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'ETag Management for Concurrent Updates',
          code: `# This script demonstrates handling ResourceModified errors with ETag management

# Step 1: Example resource ID (replace with your actual resource ID)
RESOURCE_ID="/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/my-rg/providers/Microsoft.Compute/virtualMachines/my-vm"
echo "Managing ETags for resource: \$RESOURCE_ID"

# Step 2: Function to get current ETag (for Storage blobs example)
get_blob_etag() {
  local storage_account=\$1
  local container=\$2
  local blob=\$3
  local account_key=\$4
  
  az storage blob show \\
    --account-name \$storage_account \\
    --container-name \$container \\
    --name \$blob \\
    --account-key \$account_key \\
    --query "properties.etag" \\
    --output tsv
}

# Step 3: Retry function with ETag refresh pattern
retry_with_etag_refresh() {
  local max_attempts=\$1
  local attempt=1
  shift 1
  
  while [ \$attempt -le \$max_attempts ]; do
    echo "Attempt \$attempt of \$max_attempts..."
    
    # Get fresh ETag before each attempt
    # Note: This is a demonstration - actual implementation depends on resource type
    echo "Getting fresh ETag..."
    
    # Perform operation with fresh ETag
    # If operation fails with ResourceModified, retry with fresh ETag
    if [ \$attempt -lt \$max_attempts ]; then
      echo "Waiting before retry..."
      sleep 1
      attempt=\$((attempt + 1))
    else
      echo "Max attempts reached"
      break
    fi
  done
}

# Step 4: Instructions for read-modify-write pattern
echo ""
echo "Read-Modify-Write Pattern:"
echo "  1. GET the resource to obtain current ETag"
echo "  2. Modify the resource locally"
echo "  3. PUT the resource with If-Match header containing the ETag"
echo "  4. If you get ResourceModified, repeat from step 1"
echo ""
echo "Example REST API flow:"
echo "  GET /subscriptions/{sub-id}/resourceGroups/{rg}/providers/..."
echo "  Response: { ..., \"etag\": \"\\\"0x8D...\\\"\" }"
echo ""
echo "  PUT /subscriptions/{sub-id}/resourceGroups/{rg}/providers/..."
echo "  Headers:"
echo "    If-Match: \"0x8D...\""
echo "    Authorization: Bearer <token>"
echo ""
echo "  If 409 ResourceModified:"
echo "    GET again for fresh ETag"
echo "    Retry PUT with fresh ETag"`,
        },
      ],
      relatedCodes: ['ConflictError', 'PreconditionFailed'],
      provider: 'azure',
    },
    'VMProvisioningStateFailed': {
      code: 'VMProvisioningStateFailed',
      name: 'VM Provisioning State Failed: VM Creation or Configuration Error',
      description: `VM provisioning failed before completion—Azure couldn't create, start, or configure the VM, leaving it in "Failed" provisioningState. This is a server-side error caused by issues like quota exhaustion, image deployment failures, network misconfiguration, or extension installation problems. The VM remains in Failed state and blocks most operations until you delete and recreate it. Common causes include insufficient compute quota (regional or subscription-level vCPU limits), unavailable VM images in the region, network security group rules blocking required traffic, or custom script extensions failing due to script errors or permission issues. Similar provisioning failures can occur in AKS node provisioning, Azure SQL database provisioning, and App Service plan provisioning.`,
      metaDescription: 'Diagnose VMProvisioningStateFailed. Check quota limits, verify image availability, review network configuration, and inspect extension logs for failures.',
      causes: [
        `Insufficient Compute Quota: You've hit regional or subscription-level quota limits. VM cores have regional quotas that vary by subscription tier. This is persistent—you must free quota or request an increase before retrying VM creation.`,
        `Image Deployment Failure: The VM image can't be deployed to the target storage account or location. The image may be unavailable in that region, or storage account connectivity issues prevent image deployment. This is persistent—you must use an available image or fix connectivity.`,
        `Network Configuration Error: Network resources (virtual network, subnet, network security group) are misconfigured or unavailable. Network security group rules may be blocking required traffic, or the subnet may not have available IP addresses. This is persistent—you must fix network configuration before retrying.`,
        `Extension Installation Failure: VM extensions can't install or execute. Custom script extensions may fail due to script errors, permission issues, or network connectivity problems preventing extension downloads. This is persistent—you must fix the extension issue before retrying.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check VM provisioning state:\n   az vm show --resource-group <rg> --name <vm> --query "provisioningState" --output table`,
        `Step 2: Diagnose - Check VM status and error details:\n   az vm get-instance-view --resource-group <rg> --name <vm> --query "instanceView.statuses" --output table`,
        `Step 3: Diagnose - Check compute quota usage:\n   az vm list-usage --location <region> --query "[?name.value=='cores'].{Name:name.localizedValue,Current:currentValue,Limit:limit}" --output table`,
        `Step 4: Diagnose - Verify image availability:\n   az vm image show --urn <image-urn> --output table`,
        `Step 5: Diagnose - Review VM extension logs:\n   az vm extension list --resource-group <rg> --vm-name <vm> --query "[].{Name:name,ProvisioningState:provisioningState}" --output table`,
        `Step 6: Fix - Free quota by deleting unused VMs or request a quota increase.`,
        `Step 7: Fix - Use an available image or fix storage account connectivity.`,
        `Step 8: Fix - Review network security group rules and subnet configuration. Ensure NSG rules aren't blocking required traffic.`,
        `Step 9: Fix - Review extension logs and fix underlying issues (script errors, permissions, network).`,
        `Step 10: Verify - Delete the failed VM and retry creation. The new VM should have provisioningState: "Succeeded".`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'VM Provisioning Failure Diagnosis',
          code: `# This script helps diagnose VMProvisioningStateFailed errors

# Step 1: Set VM details (replace with your actual values)
RESOURCE_GROUP="my-resource-group"
VM_NAME="my-vm"
REGION="eastus"
echo "Diagnosing VM: \$VM_NAME in resource group: \$RESOURCE_GROUP"

# Step 2: Check VM provisioning state
echo "Checking VM provisioning state..."
PROVISIONING_STATE=\$(az vm show \\
  --resource-group \$RESOURCE_GROUP \\
  --name \$VM_NAME \\
  --query "provisioningState" \\
  --output tsv 2>/dev/null)

if [ ! -z "\$PROVISIONING_STATE" ]; then
  echo "Provisioning state: \$PROVISIONING_STATE"
  if [ "\$PROVISIONING_STATE" == "Failed" ]; then
    echo "WARNING: VM provisioning failed"
  fi
else
  echo "VM not found or inaccessible"
fi

# Step 3: Check VM status and error details
echo "Checking VM status and error details..."
az vm get-instance-view \\
  --resource-group \$RESOURCE_GROUP \\
  --name \$VM_NAME \\
  --query "instanceView.statuses[?code=='ProvisioningState/']" \\
  --output table

# Step 4: Check compute quota usage
echo "Checking compute quota usage in region \$REGION..."
az vm list-usage \\
  --location \$REGION \\
  --query "[?name.value=='cores'].{Name:name.localizedValue,Current:currentValue,Limit:limit}" \\
  --output table

# Step 5: Check for quota exhaustion
CURRENT=\$(az vm list-usage --location \$REGION --query "[?name.value=='cores'].currentValue" -o tsv)
LIMIT=\$(az vm list-usage --location \$REGION --query "[?name.value=='cores'].limit" -o tsv)
if [ ! -z "\$CURRENT" ] && [ ! -z "\$LIMIT" ]; then
  if [ \$CURRENT -ge \$LIMIT ]; then
    echo "WARNING: Quota limit reached or exceeded"
    echo "Current: \$CURRENT, Limit: \$LIMIT"
  fi
fi

# Step 6: Review VM extension status
echo "Reviewing VM extension status..."
az vm extension list \\
  --resource-group \$RESOURCE_GROUP \\
  --vm-name \$VM_NAME \\
  --query "[].{Name:name, ProvisioningState:provisioningState, Type:type}" \\
  --output table

# Step 7: Check extension instance view for errors
echo "Checking extension instance views for errors..."
EXTENSIONS=\$(az vm extension list --resource-group \$RESOURCE_GROUP --vm-name \$VM_NAME --query "[].name" -o tsv)
for ext in \$EXTENSIONS; do
  echo "Extension: \$ext"
  az vm extension show \\
    --resource-group \$RESOURCE_GROUP \\
    --vm-name \$VM_NAME \\
    --name \$ext \\
    --instance-view \\
    --query "{status:statuses[0].code, message:statuses[0].message}" \\
    --output table
done

# Step 8: Check network configuration
echo "Checking network configuration..."
NIC_ID=\$(az vm show --resource-group \$RESOURCE_GROUP --name \$VM_NAME --query "networkProfile.networkInterfaces[0].id" -o tsv)
if [ ! -z "\$NIC_ID" ]; then
  echo "Network interface: \$NIC_ID"
  az network nic show --ids \$NIC_ID --query "{subnet:ipConfigurations[0].subnet.id, privateIp:ipConfigurations[0].privateIpAddress}" --output table
fi

# Step 9: Instructions for fixing failed VMs
echo ""
echo "To fix a failed VM:"
echo "  1. Delete the failed VM: az vm delete --resource-group \$RESOURCE_GROUP --name \$VM_NAME --yes"
echo "  2. Fix the underlying issue (quota, image, network, extension)"
echo "  3. Retry VM creation with corrected configuration"`,
        },
      ],
      relatedCodes: ['QuotaExceeded', 'ResourceNotFound'],
      provider: 'azure',
    },
    'VMAllocationFailed': {
      code: 'VMAllocationFailed',
      name: 'VM Allocation Failed: Capacity Constraints',
      description: `Azure couldn't allocate the VM resources—the selected region or availability zone doesn't have available capacity for your requested VM size. This is a server-side error caused by Azure's temporary capacity constraints (platform-enforced, not user-induced). Capacity varies by region, zone, and VM size, and changes over time due to demand or maintenance. Different zones within a region have independent capacity, so one zone might be full while another has space. Some VM sizes have limited availability. This is transient—retrying later, trying different zones, or using alternative VM sizes often succeeds. Similar allocation failures occur in AKS node allocation and App Service plan allocation.`,
      metaDescription: 'Overcome VMAllocationFailed. Try different availability zones, switch VM sizes, wait and retry, or use availability sets for better allocation success.',
      causes: [
        `Regional Capacity Constraint: The selected region doesn't have available capacity for the requested VM size. High demand or maintenance can temporarily exhaust capacity in specific regions. Capacity availability changes over time. This is transient—retrying later or using different zones/sizes may succeed.`,
        `Availability Zone Capacity Exhaustion: The specific availability zone you selected doesn't have available capacity. Different zones within a region may have different capacity levels. This is transient—trying other zones in the same region may succeed.`,
        `VM Size Unavailability: The requested VM size isn't available in the selected region or zone. Some VM sizes have limited availability or may be temporarily unavailable due to high demand. This is transient—trying a different VM size or region may succeed.`,
      ],
      solutions: [
        `Step 1: Diagnose - Try different availability zones within the same region. Availability zones have independent capacity, so one zone may have capacity while another doesn't.`,
        `Step 2: Diagnose - List available VM sizes in the region:\n   az vm list-sizes --location <region> --output table`,
        `Step 3: Diagnose - Check if the VM size is available:\n   az vm list-sizes --location <region> --query "[?name=='<size>']" --output table`,
        `Step 4: Fix - Try zones 1, 2, or 3 if allocation fails in one zone.`,
        `Step 5: Fix - Try a different VM size that's available in your region.`,
        `Step 6: Fix - Wait 15-30 minutes and retry, or try a different region with better capacity.`,
        `Step 7: Fix - Use an availability set for better allocation success rates.`,
        `Step 8: Verify - Retry VM creation. It should succeed instead of returning VMAllocationFailed.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'VM Allocation Retry with Zone and Size Alternatives',
          code: `# This script helps handle VMAllocationFailed errors by trying different zones and sizes

# Step 1: Set VM creation parameters
RESOURCE_GROUP="my-resource-group"
VM_NAME="my-vm"
REGION="eastus"
IMAGE="UbuntuLTS"
DESIRED_SIZE="Standard_D2s_v3"
echo "Attempting to create VM: \$VM_NAME"

# Step 2: List available VM sizes in region
echo "Listing available VM sizes in region \$REGION..."
az vm list-sizes --location \$REGION --query "[].{name:name, numberOfCores:numberOfCores, memoryInMb:memoryInMb}" --output table

# Step 3: Check if desired size is available
echo "Checking if desired size \$DESIRED_SIZE is available..."
SIZE_AVAILABLE=\$(az vm list-sizes --location \$REGION --query "[?name=='\$DESIRED_SIZE'].name" -o tsv)
if [ ! -z "\$SIZE_AVAILABLE" ]; then
  echo "Size \$DESIRED_SIZE is available"
else
  echo "WARNING: Size \$DESIRED_SIZE may not be available"
  echo "Alternative sizes:"
  az vm list-sizes --location \$REGION --query "[?contains(name, 'Standard_D')].name" --output table
fi

# Step 4: Try different availability zones
AVAILABILITY_ZONES=("1" "2" "3")
echo "Trying different availability zones..."

for zone in "\${AVAILABILITY_ZONES[@]}"; do
  echo "Attempting to create VM in zone \$zone..."
  
  if az vm create \\
    --resource-group \$RESOURCE_GROUP \\
    --name "\${VM_NAME}-zone\${zone}" \\
    --image \$IMAGE \\
    --size \$DESIRED_SIZE \\
    --zone \$zone \\
    --generate-ssh-keys \\
    --no-wait 2>&1; then
    echo "VM creation initiated in zone \$zone"
    break
  else
    echo "Failed in zone \$zone, trying next..."
  fi
done

# Step 5: If all zones fail, try alternative VM sizes
ALTERNATIVE_SIZES=("Standard_B2s" "Standard_D2s_v2" "Standard_DS2_v2")
echo "Trying alternative VM sizes..."

for size in "\${ALTERNATIVE_SIZES[@]}"; do
  echo "Attempting to create VM with size \$size..."
  
  if az vm create \\
    --resource-group \$RESOURCE_GROUP \\
    --name "\${VM_NAME}-\${size}" \\
    --image \$IMAGE \\
    --size \$size \\
    --generate-ssh-keys \\
    --no-wait 2>&1; then
    echo "VM creation initiated with size \$size"
    break
  else
    echo "Failed with size \$size, trying next..."
  fi
done

# Step 6: Create availability set for better allocation
echo "Creating availability set for better allocation..."
az vm availability-set create \\
  --resource-group \$RESOURCE_GROUP \\
  --name "myAvailabilitySet" \\
  --platform-fault-domain-count 2 \\
  --platform-update-domain-count 2 \\
  --output table

# Step 7: Instructions for retry strategy
echo ""
echo "Allocation retry strategy:"
echo "  1. Try different availability zones (1, 2, 3)"
echo "  2. Try alternative VM sizes"
echo "  3. Wait 15-30 minutes and retry"
echo "  4. Try a different region"
echo "  5. Use availability sets for better allocation success"`,
        },
      ],
      relatedCodes: ['InsufficientCapacityException', 'QuotaExceeded'],
      provider: 'azure',
    },
    'VMImageNotFound': {
      code: 'VMImageNotFound',
      name: 'VM Image Not Found: Image Unavailable or Invalid',
      description: `The VM image doesn't exist or isn't available—the image URN format might be wrong (must be Publisher:Offer:SKU:Version), the image isn't published to your region, or shared image gallery images require explicit sharing permissions. This 404 client-side error occurs when ARM validates image availability before VM creation. Publisher/offer/SKU values are case-sensitive and must match exactly. Images may be region-specific or require explicit sharing from shared image galleries. The image might exist but not in your subscription or region. Similar image availability issues occur in AKS node images and App Service container images.`,
      metaDescription: 'Locate VM images. Verify URN format, list available images by region, check publisher/offer/SKU combinations, and request shared image gallery permissions.',
      causes: [
        `Invalid Image URN Format: The image URN structure is incorrect or contains typos. The URN format must be: Publisher:Offer:SKU:Version. This is persistent—you must fix the URN format before retrying.`,
        `Regional Image Unavailability: The image isn't available in your selected region. Images may be region-specific or may not be published to all regions. This is persistent—you must use an available image or region.`,
        `Image Sharing Restriction: The image isn't shared with your subscription. Shared image gallery images require explicit sharing permissions. This is persistent—you must get sharing permissions or use a different image.`,
        `Publisher/Offer/SKU Mismatch: The specified values don't match available images. These values are case-sensitive and must match exactly. This is persistent—you must use the correct publisher/offer/SKU combination.`,
      ],
      solutions: [
        `Step 1: Diagnose - Verify image URN format matches Publisher:Offer:SKU:Version:\n   az vm image show --urn <image-urn> --output table`,
        `Step 2: Diagnose - List available images in your region:\n   az vm image list --location <region> --publisher <publisher> --offer <offer> --sku <sku> --output table`,
        `Step 3: Diagnose - List publishers in your region:\n   az vm image list-publishers --location <region> --output table`,
        `Step 4: Diagnose - List offers from publisher:\n   az vm image list-offers --location <region> --publisher <publisher> --output table`,
        `Step 5: Diagnose - List SKUs for offer:\n   az vm image list-skus --location <region> --publisher <publisher> --offer <offer> --output table`,
        `Step 6: Fix - Use correct image URN format. Verify the URN structure matches Publisher:Offer:SKU:Version.`,
        `Step 7: Fix - Use an available image in your region, or use a different region where the image is available.`,
        `Step 8: Fix - Request sharing permissions for shared image gallery images, or use a different image.`,
        `Step 9: Verify - Retry VM creation with the verified image. It should succeed instead of returning VMImageNotFound.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'VM Image Lookup and Verification',
          code: `# This script helps diagnose VMImageNotFound errors by verifying image availability

# Step 1: Set your region
REGION="eastus"
echo "Checking image availability in region: \$REGION"

# Step 2: Example image URN (replace with your actual image URN)
IMAGE_URN="Canonical:0001-com-ubuntu-server-focal:20_04-lts:latest"
echo "Verifying image URN: \$IMAGE_URN"

# Step 3: Verify image URN format (Publisher:Offer:SKU:Version)
IFS=':' read -ra URN_PARTS <<< "\$IMAGE_URN"
if [ \${#URN_PARTS[@]} -ne 4 ]; then
  echo "ERROR: Invalid image URN format"
  echo "Required format: Publisher:Offer:SKU:Version"
  echo "Example: Canonical:0001-com-ubuntu-server-focal:20_04-lts:latest"
  exit 1
fi

PUBLISHER=\${URN_PARTS[0]}
OFFER=\${URN_PARTS[1]}
SKU=\${URN_PARTS[2]}
VERSION=\${URN_PARTS[3]}

echo "Publisher: \$PUBLISHER"
echo "Offer: \$OFFER"
echo "SKU: \$SKU"
echo "Version: \$VERSION"

# Step 4: Check if image exists
echo "Checking if image exists..."
if az vm image show --urn \$IMAGE_URN --output table 2>&1; then
  echo "Image found"
else
  echo "Image not found. Continuing diagnosis..."
fi

# Step 5: List available images by publisher
echo "Listing available images from publisher \$PUBLISHER..."
az vm image list \\
  --publisher \$PUBLISHER \\
  --offer \$OFFER \\
  --sku \$SKU \\
  --all \\
  --query "[].{urn:urn, location:location}" \\
  --output table

# Step 6: List publishers in region
echo "Listing publishers in region \$REGION..."
az vm image list-publishers \\
  --location \$REGION \\
  --query "[?name=='\$PUBLISHER']" \\
  --output table

# Step 7: List offers from publisher
echo "Listing offers from publisher \$PUBLISHER..."
az vm image list-offers \\
  --location \$REGION \\
  --publisher \$PUBLISHER \\
  --query "[?name=='\$OFFER']" \\
  --output table

# Step 8: List SKUs for offer
echo "Listing SKUs for offer \$OFFER..."
az vm image list-skus \\
  --location \$REGION \\
  --publisher \$PUBLISHER \\
  --offer \$OFFER \\
  --query "[?name=='\$SKU']" \\
  --output table

# Step 9: List versions for SKU
echo "Listing versions for SKU \$SKU..."
az vm image list \\
  --location \$REGION \\
  --publisher \$PUBLISHER \\
  --offer \$OFFER \\
  --sku \$SKU \\
  --all \\
  --query "[].{version:version, location:location}" \\
  --output table

# Step 10: Check if image is available in your region
echo "Checking if image is available in region \$REGION..."
REGION_IMAGE=\$(az vm image list \\
  --location \$REGION \\
  --publisher \$PUBLISHER \\
  --offer \$OFFER \\
  --sku \$SKU \\
  --query "[?version=='\$VERSION'].urn" \\
  --output tsv)

if [ ! -z "\$REGION_IMAGE" ]; then
  echo "Image is available in region \$REGION: \$REGION_IMAGE"
else
  echo "WARNING: Image may not be available in region \$REGION"
  echo "Try a different region or use a different image version"`,
        },
      ],
      relatedCodes: ['ResourceNotFound', 'InvalidParameterValue'],
      provider: 'azure',
    },
    'StorageAccountNameAlreadyTaken': {
      code: 'StorageAccountNameAlreadyTaken',
      name: 'Storage Account Name Already Taken: Global Uniqueness Violation',
      description: `Hitting StorageAccountNameAlreadyTaken means someone else already claimed that storage account name—names are globally unique across all Azure subscriptions, not just yours. ARM returns this 409 client-side error when name validation finds a collision before provisioning starts. The name might be in use by another subscription, reserved by a soft-deleted account during retention, or blocked by Azure for system use. While you'll see this most often creating storage for VM disk backups, it also pops up in AKS container registries, Azure SQL backup storage, and App Service application files. Names must be 3-24 lowercase alphanumeric characters.`,
      metaDescription: 'Struggling with StorageAccountNameAlreadyTaken? Check global name availability, recover soft-deleted accounts, and generate unique names automatically.',
      causes: [
        `Global Name Collision: A storage account with that exact name already exists in another Azure subscription. Storage account names are globally unique across all subscriptions, so if any subscription has that name, you can't use it. This is persistent—you must choose a different name.`,
        `Soft-Deleted Account Reservation: The storage account was recently deleted but still exists in soft-delete state, reserving the name during the retention period. Soft-deleted accounts maintain name reservations until permanent deletion completes. This can be transient—waiting for deletion to complete may free the name, but timing isn't guaranteed.`,
        `System Name Reservation: The name is reserved by Azure for system use or by another subscription's internal processes. Some names may be blocked even if no visible account exists. This is persistent—you must use a different name.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check name availability before creation:\n   az storage account check-name --name <account-name> --output table\n   Verify the "nameAvailable" field is true before proceeding.`,
        `Step 2: Diagnose - Check for soft-deleted accounts reserving the name:\n   az storage account list-deleted --query "[?name=='<account-name>']" --output table\n   If found, the name is reserved during retention.`,
        `Step 3: Fix - Generate a unique name using timestamps, UUIDs, or random suffixes. Use the code example below to create a unique name generator.`,
        `Step 4: Fix - If a soft-deleted account exists, wait for permanent deletion or permanently delete it (if you have permissions).`,
        `Step 5: Verify - After selecting an available name, retry storage account creation. It should succeed with HTTP 201 instead of 409.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Storage Account Name Availability Check',
          code: `# This script helps diagnose StorageAccountNameAlreadyTaken by checking name availability

# Step 1: Set desired storage account name (replace with your name)
DESIRED_NAME="mystorageaccount"
echo "Checking availability for name: \${DESIRED_NAME}"

# Step 2: Check name availability
echo "Checking name availability..."
az storage account check-name \\
  --name \${DESIRED_NAME} \\
  --output table

# Step 3: Check if name is available (parse JSON response)
NAME_AVAILABLE=\$(az storage account check-name \\
  --name \${DESIRED_NAME} \\
  --query "nameAvailable" \\
  --output tsv)

if [ "\$NAME_AVAILABLE" == "true" ]; then
  echo "Name \${DESIRED_NAME} is available"
else
  echo "Name \${DESIRED_NAME} is not available"
  echo "Reason: \$(az storage account check-name --name \${DESIRED_NAME} --query "reason" -o tsv)"
fi

# Step 4: Check for soft-deleted accounts with the same name
echo "Checking for soft-deleted accounts..."
az storage account list-deleted \\
  --query "[?name=='\${DESIRED_NAME}']" \\
  --output table

# Step 5: Generate unique name using timestamp and random suffix
UNIQUE_NAME="mystorage\$(date +%s | sha256sum | head -c 8)"
echo "Generated unique name: \${UNIQUE_NAME}"

# Step 6: Verify generated name is available
az storage account check-name \\
  --name \${UNIQUE_NAME} \\
  --output table

# Step 7: Function to check and create storage account with unique name
check_and_create_storage() {
  local base_name=\$1
  local resource_group=\$2
  local location=\$3
  
  # Try base name first
  if az storage account check-name --name \$base_name --query "nameAvailable" -o tsv | grep -q "true"; then
    echo "Creating storage account with name: \$base_name"
    az storage account create \\
      --resource-group \$resource_group \\
      --name \$base_name \\
      --location \$location \\
      --sku Standard_LRS
  else
    # Generate unique name
    local unique_name="\${base_name}\$(date +%s | sha256sum | head -c 8)"
    echo "Base name unavailable, using: \$unique_name"
    az storage account create \\
      --resource-group \$resource_group \\
      --name \$unique_name \\
      --location \$location \\
      --sku Standard_LRS
  fi
}

# Example usage:
# check_and_create_storage "mystorage" "myResourceGroup" "eastus"`,
        },
      ],
      relatedCodes: ['ConflictError', 'EntityAlreadyExists'],
      provider: 'azure',
    },
    'StorageAccountQuotaExceeded': {
      code: 'StorageAccountQuotaExceeded',
      name: 'Storage Account Quota Exceeded: Subscription Limit Reached',
      description: `StorageAccountQuotaExceeded hits when you've maxed out storage accounts in your subscription per region—default is 250, but Pay-As-You-Go vs Enterprise Agreement subscriptions have different caps. ARM throws this 403 client-side error after counting your existing accounts and blocking creation. The limit applies per region, so you might have headroom elsewhere. Most common when spinning up storage for VM disk backups, but also surfaces in AKS container registries, Azure SQL backup storage, and App Service application files.`,
      metaDescription: 'Debug StorageAccountQuotaExceeded. Count accounts per region, identify unused ones to delete, and request quota increases via Azure Support.',
      causes: [
        `Regional Quota Limit: You've created the maximum number of storage accounts allowed in the specified region (default 250 per subscription per region). The limit varies by subscription type (Pay-As-You-Go, Enterprise Agreement, etc.). This is persistent—you must delete accounts or request a quota increase.`,
        `Subscription-Level Quota: The total count of storage accounts across all regions has reached your subscription's limit. Some subscription types have different overall limits in addition to regional limits. This is persistent—you must delete accounts or request a quota increase.`,
        `Account Type Restrictions: Certain storage account types (e.g., premium storage) may have lower quotas than standard accounts. The quota limit depends on the SKU you're trying to create. This is persistent—you must use a different SKU or request a quota increase.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check current storage account count in the target region:\n   az storage account list --query "[?location=='<region>'].{Name:name,ResourceGroup:resourceGroup}" --output table\n   Count the results to see how close you are to the limit.`,
        `Step 2: Diagnose - List all storage accounts across all regions:\n   az storage account list --query "[].{Name:name,ResourceGroup:resourceGroup,Location:location}" --output table\n   Identify unused accounts that can be deleted.`,
        `Step 3: Fix - Delete unused storage accounts to free quota. Use the code example below to identify candidates for deletion.`,
        `Step 4: Fix - Request quota increase through Azure Portal: Subscription > Usage + quotas, find "Storage accounts" quota, click "Request increase", and submit a support request. Approval typically takes 1-2 business days (not guaranteed).`,
        `Step 5: Fix - Consider consolidating storage accounts by using multiple containers within fewer accounts instead of creating many accounts.`,
        `Step 6: Verify - After deleting accounts or getting quota approval, retry storage account creation. It should succeed with HTTP 201 instead of 403.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Storage Account Quota Usage Diagnosis',
          code: `# This script helps diagnose StorageAccountQuotaExceeded by checking quota usage

# Step 1: Set target region (replace with your region)
TARGET_REGION="eastus"
echo "Checking storage account quota for region: \${TARGET_REGION}"

# Step 2: Count storage accounts in the target region
STORAGE_COUNT=\$(az storage account list \\
  --query "length([?location=='\${TARGET_REGION}'])" \\
  --output tsv)
echo "Storage accounts in \${TARGET_REGION}: \${STORAGE_COUNT}"

# Step 3: Default limit (may vary by subscription type)
DEFAULT_LIMIT=250
echo "Default limit per region: \${DEFAULT_LIMIT}"

# Step 4: Check if approaching or at limit
if [ \${STORAGE_COUNT} -ge \${DEFAULT_LIMIT} ]; then
  echo "WARNING: At or exceeding storage account limit"
  echo "Current: \${STORAGE_COUNT}, Limit: \${DEFAULT_LIMIT}"
else
  REMAINING=\$((DEFAULT_LIMIT - STORAGE_COUNT))
  echo "Remaining quota: \${REMAINING} storage accounts"
fi

# Step 5: List all storage accounts in the region
echo "Listing all storage accounts in \${TARGET_REGION}..."
az storage account list \\
  --query "[?location=='\${TARGET_REGION}'].{Name:name,ResourceGroup:resourceGroup,Location:location,SKU:sku.name}" \\
  --output table

# Step 6: Find potentially unused storage accounts (no recent activity indicators)
echo "Finding potentially unused storage accounts..."
az storage account list \\
  --query "[?location=='\${TARGET_REGION}'].{Name:name,ResourceGroup:resourceGroup,LastModified:properties.lastGeoFailoverTime}" \\
  --output table

# Step 7: Count storage accounts across all regions
TOTAL_COUNT=\$(az storage account list --query "length(@)" --output tsv)
echo "Total storage accounts across all regions: \${TOTAL_COUNT}"

# Step 8: List storage accounts by SKU type
echo "Storage accounts by SKU type:"
az storage account list \\
  --query "[?location=='\${TARGET_REGION}'].sku.name" \\
  --output tsv | sort | uniq -c

# Step 9: Instructions for quota increase
echo ""
echo "To request quota increase:"
echo "  1. Go to Azure Portal > Subscription > Usage + quotas"
echo "  2. Find 'Storage accounts' quota"
echo "  3. Click 'Request increase'"
echo "  4. Fill out the support request"
echo "  5. Approval typically takes 1-2 business days"`,
        },
      ],
      relatedCodes: ['QuotaExceeded', 'LimitExceededException'],
      provider: 'azure',
    },
    'BlobServiceUnavailable': {
      code: 'BlobServiceUnavailable',
      name: 'Blob Service Unavailable: Temporary Service Outage',
      description: `When BlobServiceUnavailable appears, Azure's blob storage is down in your region—could be planned maintenance, an unplanned outage, or throttling from peak load. This 503 server-side error means Azure's platform is the problem, not your request. The service returns 503 during these windows. You'll see this most when accessing blob storage for VM disk backups, but it also happens with AKS container images, Azure SQL database backups, and App Service application files. Usually transient—exponential backoff retries or waiting for service restoration typically fixes it.`,
      metaDescription: 'Unblock BlobServiceUnavailable. Check Azure Service Health status, add exponential backoff retry logic, and failover to alternate regions.',
      causes: [
        `Planned Maintenance Windows: Azure performs scheduled maintenance on storage infrastructure, causing temporary unavailability. Maintenance is typically announced in advance via Azure Service Health. This is transient—waiting for maintenance to complete and retrying helps.`,
        `Regional Service Outages: The storage service in a specific region experiences an unplanned outage affecting all storage accounts in that region. Outages may be partial or complete. This is transient—waiting for service restoration or using a different region may work.`,
        `High Service Load Throttling: Request rates exceed service capacity, causing the service to throttle and return 503 errors during peak load periods. This is transient—retrying with exponential backoff helps distribute load over time.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check Azure Service Health status for maintenance schedules and outages:\n   Visit https://status.azure.com/ or use Azure Portal > Service Health\n   Look for storage service incidents in your region.`,
        `Step 2: Diagnose - Test connectivity to the storage account:\n   az storage account show --name <account-name> --resource-group <rg> --query "{provisioningState:provisioningState,statusOfPrimary:statusOfPrimary}" --output table`,
        `Step 3: Fix - Implement retry logic with exponential backoff in your application. Use the code example below to handle 503 errors gracefully.`,
        `Step 4: Fix - If regional outage persists, consider using a different storage account in another region or enabling geo-redundant storage (GRS) for automatic failover.`,
        `Step 5: Fix - For high load scenarios, reduce request rates, implement client-side throttling, or batch operations to reduce concurrent requests.`,
        `Step 6: Verify - After implementing retry logic or waiting for service restoration, retry your operation. It should eventually succeed instead of returning 503.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Blob Service Availability Check and Retry Logic',
          code: `# This script helps diagnose BlobServiceUnavailable by checking service health and implementing retry logic

# Step 1: Set storage account details (replace with your values)
STORAGE_ACCOUNT="mystorageaccount"
RESOURCE_GROUP="my-resource-group"
CONTAINER_NAME="mycontainer"
BLOB_NAME="myblob.txt"
# Note: For production, use managed identity or SAS tokens instead of account key
ACCOUNT_KEY="your-storage-account-key"

# Step 2: Check storage account status
echo "Checking storage account status..."
az storage account show \\
  --name \${STORAGE_ACCOUNT} \\
  --resource-group \${RESOURCE_GROUP} \\
  --query "{provisioningState:provisioningState,statusOfPrimary:statusOfPrimary,primaryLocation:primaryLocation}" \\
  --output table

# Step 3: Test blob service connectivity
echo "Testing blob service connectivity..."
if az storage blob list \\
  --account-name \${STORAGE_ACCOUNT} \\
  --account-key \${ACCOUNT_KEY} \\
  --container-name \${CONTAINER_NAME} \\
  --output table 2>&1; then
  echo "Blob service is accessible"
else
  ERROR_CODE=\$?
  echo "Blob service unavailable (exit code: \${ERROR_CODE})"
  echo "This may indicate:"
  echo "  1. Service maintenance in progress"
  echo "  2. Regional outage"
  echo "  3. High service load causing throttling"
fi

# Step 4: Retry function with exponential backoff
retry_blob_operation() {
  local max_attempts=\${1:-5}
  local base_delay=\${2:-2}
  local max_delay=\${3:-60}
  local attempt=1
  shift 3
  local command="\$@"
  
  while [ \${attempt} -le \${max_attempts} ]; do
    echo "Attempt \${attempt} of \${max_attempts}..."
    
    if eval "\$command" 2>&1; then
      echo "Operation succeeded on attempt \${attempt}"
      return 0
    else
      ERROR_OUTPUT=\$(eval "\$command" 2>&1 >/dev/null)
      
      # Check if error is 503 Service Unavailable
      if echo "\$ERROR_OUTPUT" | grep -q "503\|ServiceUnavailable\|BlobServiceUnavailable"; then
        if [ \${attempt} -lt \${max_attempts} ]; then
          # Calculate delay with exponential backoff
          DELAY=\$((base_delay * (2 ** (attempt - 1))))
          if [ \${DELAY} -gt \${max_delay} ]; then
            DELAY=\${max_delay}
          fi
          
          echo "Service unavailable (503). Waiting \${DELAY} seconds before retry..."
          sleep \${DELAY}
          attempt=\$((attempt + 1))
        else
          echo "Failed after \${max_attempts} attempts due to service unavailability"
          return 1
        fi
      else
        echo "Operation failed with unexpected error:"
        echo "\$ERROR_OUTPUT"
        return 1
      fi
    fi
  done
  
  return 1
}

# Step 5: Example usage - List blobs with retry
echo "Listing blobs with retry logic..."
retry_blob_operation 5 2 60 "az storage blob list \\
  --account-name \${STORAGE_ACCOUNT} \\
  --account-key \${ACCOUNT_KEY} \\
  --container-name \${CONTAINER_NAME} \\
  --output table"

# Step 6: Check Azure Service Health (requires manual check)
echo ""
echo "To check Azure Service Health:"
echo "  1. Visit: https://status.azure.com/"
echo "  2. Or use Azure Portal > Service Health"
echo "  3. Look for 'Storage' service incidents in your region"
echo ""
echo "Retry best practices:"
echo "  - Start with 2 second delay, double each retry"
echo "  - Maximum delay: 60 seconds"
echo "  - Maximum attempts: 5"
echo "  - Respect Retry-After headers if provided"`,
        },
      ],
      relatedCodes: ['ServiceUnavailable', 'Unavailable'],
      provider: 'azure',
    },
    'AADInvalidClientSecret': {
      code: 'AADInvalidClientSecret',
      name: 'AAD Invalid Client Secret: Secret Expired or Revoked',
      description: `AADInvalidClientSecret means Azure AD (Entra ID) bounced your client secret—it's expired past its endDate, manually revoked, rotated without updating your config, or has typos/encoding issues. This 401 client-side error happens when Azure AD validates secrets before issuing OAuth tokens. Most common in service principal auth for VM deployments, but also shows up in AKS cluster authentication, Azure SQL database connections, and App Service deployment operations. The secret must match exactly what's stored in Azure AD.`,
      metaDescription: 'Solve AADInvalidClientSecret. Verify secret expiration dates, generate fresh secrets, and update environment variables or Key Vault references.',
      causes: [
        `Secret Expiration: The client secret has passed its endDate. Client secrets have expiration dates set when created (default varies, but typically 1-2 years). Azure AD rejects expired secrets before token issuance. This is persistent—you must generate a new secret and update your application configuration.`,
        `Secret Revocation: The secret was manually revoked or deleted in Azure AD. Revoked secrets can't be used for authentication even if they haven't expired. This is persistent—you must generate a new secret and update your application configuration.`,
        `Secret Rotation Mismatch: The secret was rotated in Azure AD, but your application still uses the old secret. After rotation, the old secret becomes invalid immediately. This is persistent—you must update your application configuration (environment variables, Key Vault references, config files) with the new secret.`,
        `Secret Format Error: The secret value is incorrect due to typos, copy errors, or encoding issues (e.g., extra spaces, line breaks, or character encoding problems). The secret must match exactly what's stored in Azure AD. This is persistent—you must verify and correct the secret value.`,
      ],
      solutions: [
        `Step 1: Diagnose - List all client secrets for the application to check expiration dates:\n   az ad app credential list --id <app-id> --query "[].{KeyId:keyId,StartDate:startDate,EndDate:endDate}" --output table`,
        `Step 2: Diagnose - Check for expired secrets:\n   az ad app credential list --id <app-id> --query "[?endDate<'\$(date -u +%Y-%m-%dT%H:%M:%SZ)']" --output table`,
        `Step 3: Fix - Generate a new client secret:\n   az ad app credential reset --id <app-id> --append --query "password" --output tsv\n   Save the output immediately—it's only shown once.`,
        `Step 4: Fix - Update your application configuration with the new secret. Check environment variables, Azure Key Vault references, config files, or wherever the secret is stored. Restart your application after updating.`,
        `Step 5: Fix - Delete expired secrets to clean up:\n   az ad app credential delete --id <app-id> --key-id <key-id>`,
        `Step 6: Verify - Test authentication with the new secret:\n   az login --service-principal --username <app-id> --password <new-secret> --tenant <tenant-id>`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Azure AD Client Secret Diagnosis and Management',
          code: `# This script helps diagnose AADInvalidClientSecret by checking secret status

# Step 1: Set application details (replace with your values)
APP_ID="your-app-id"
TENANT_ID="your-tenant-id"
echo "Checking client secrets for application: \${APP_ID}"

# Step 2: List all client secrets for the application
echo "Listing all client secrets..."
az ad app credential list \\
  --id \${APP_ID} \\
  --query "[].{KeyId:keyId,StartDate:startDate,EndDate:endDate}" \\
  --output table

# Step 3: Check current date for expiration comparison
CURRENT_DATE=\$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo "Current date (UTC): \${CURRENT_DATE}"

# Step 4: Check for expired secrets
echo "Checking for expired secrets..."
EXPIRED_SECRETS=\$(az ad app credential list \\
  --id \${APP_ID} \\
  --query "[?endDate<'\${CURRENT_DATE}'].{KeyId:keyId,EndDate:endDate}" \\
  --output table)

if [ ! -z "\$EXPIRED_SECRETS" ]; then
  echo "WARNING: Found expired secrets:"
  echo "\$EXPIRED_SECRETS"
else
  echo "No expired secrets found"
fi

# Step 5: Check for secrets expiring soon (within 30 days)
echo "Checking for secrets expiring soon (within 30 days)..."
FUTURE_DATE=\$(date -u -d '+30 days' +%Y-%m-%dT%H:%M:%SZ)
EXPIRING_SOON=\$(az ad app credential list \\
  --id \${APP_ID} \\
  --query "[?endDate>'\${CURRENT_DATE}' && endDate<'\${FUTURE_DATE}'].{KeyId:keyId,EndDate:endDate}" \\
  --output table)

if [ ! -z "\$EXPIRING_SOON" ]; then
  echo "WARNING: Secrets expiring soon:"
  echo "\$EXPIRING_SOON"
fi

# Step 6: Generate a new client secret
echo "Generating new client secret..."
NEW_SECRET=\$(az ad app credential reset \\
  --id \${APP_ID} \\
  --append \\
  --query "password" \\
  --output tsv)

if [ ! -z "\${NEW_SECRET}" ]; then
  echo "New client secret generated successfully"
  echo "IMPORTANT: Save this secret immediately - it's only shown once!"
  echo "New secret: \${NEW_SECRET}"
  echo ""
  echo "Update your application configuration:"
  echo "  - Environment variable: CLIENT_SECRET=\${NEW_SECRET}"
  echo "  - Azure Key Vault: Update the secret value"
  echo "  - Config files: Update CLIENT_SECRET value"
  echo "  - Restart your application after updating"
else
  echo "ERROR: Failed to generate new secret"
fi

# Step 7: Test authentication with new secret (if generated)
if [ ! -z "\${NEW_SECRET}" ]; then
  echo "Testing authentication with new secret..."
  if az login --service-principal \\
    --username \${APP_ID} \\
    --password \${NEW_SECRET} \\
    --tenant \${TENANT_ID} 2>&1; then
    echo "Authentication successful with new secret"
  else
    echo "Authentication failed - check the error message above"
  fi
fi

# Step 8: Delete expired secrets (optional cleanup)
echo "Listing expired secret key IDs for deletion..."
EXPIRED_KEY_IDS=\$(az ad app credential list \\
  --id \${APP_ID} \\
  --query "[?endDate<'\${CURRENT_DATE}'].keyId" \\
  --output tsv)

if [ ! -z "\${EXPIRED_KEY_IDS}" ]; then
  echo "Expired secret key IDs:"
  echo "\${EXPIRED_KEY_IDS}"
  echo ""
  echo "To delete expired secrets, run:"
  for key_id in \${EXPIRED_KEY_IDS}; do
    echo "  az ad app credential delete --id \${APP_ID} --key-id \${key_id}"
  done
fi`,
        },
      ],
      relatedCodes: ['AuthenticationFailed', 'InvalidAuthenticationInfo'],
      provider: 'azure',
    },
    'AADInvalidTenantId': {
      code: 'AADInvalidTenantId',
      name: 'AAD Invalid Tenant ID: Tenant Does Not Exist',
      description: `AADInvalidTenantId surfaces when Azure AD (Entra ID) can't validate your tenant ID—wrong GUID format, tenant doesn't exist, or you lack access to it. This 401 client-side error occurs when Azure AD checks tenant IDs before processing auth requests. Tenant IDs must be valid GUIDs (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx) pointing to real Azure AD tenants. Cross-tenant access needs B2B federation or guest user invites. Most common in service principal auth for VM deployments, but also appears in AKS cluster authentication, Azure SQL database connections, and App Service deployments.`,
      metaDescription: 'Troubleshoot AADInvalidTenantId. Validate GUID format, verify tenant exists, and set up B2B federation for cross-tenant access.',
      causes: [
        `Invalid Tenant ID Format: The tenant ID doesn't match the GUID format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx). Tenant IDs must be valid UUIDs. Common mistakes include missing segments, wrong length, or typos. This is persistent—you must use the correct format.`,
        `Non-Existent Tenant: The tenant ID references a tenant that doesn't exist or has been deleted. Tenant IDs must reference valid Azure AD tenants. This is persistent—you must use a valid tenant ID.`,
        `Tenant Access Restriction: You don't have access to the specified tenant. Cross-tenant access requires B2B federation configuration or guest user invitation. Simply having a tenant ID doesn't grant access. This is persistent—you must get access or use a different tenant.`,
      ],
      solutions: [
        `Step 1: Diagnose - Get your current tenant ID to see the correct format:\n   az account show --query "{tenantId:tenantId, subscriptionId:id}" --output table`,
        `Step 2: Diagnose - List all accessible tenants:\n   az account tenant list --query "[].{TenantId:tenantId,DisplayName:displayName}" --output table\n   If your tenant isn't listed, you may not have access.`,
        `Step 3: Diagnose - Verify tenant ID format matches GUID pattern. Use the code example below to validate the format.`,
        `Step 4: Fix - If format is wrong, use the correct GUID format. Get tenant ID from your subscription or domain.`,
        `Step 5: Fix - If tenant doesn't exist, verify the tenant ID is correct. You can get tenant ID from domain: use the code example to resolve tenant ID from domain name.`,
        `Step 6: Fix - For cross-tenant access, ensure B2B federation is configured or request guest user invitation from the tenant administrator.`,
        `Step 7: Verify - After fixing the tenant ID or getting access, retry authentication. It should succeed instead of returning AADInvalidTenantId.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Azure AD Tenant ID Verification',
          code: `# This script helps diagnose AADInvalidTenantId by verifying tenant ID format and access

# Step 1: Get current tenant ID
echo "Getting current tenant ID..."
CURRENT_TENANT=\$(az account show --query "tenantId" --output tsv)
echo "Current tenant ID: \${CURRENT_TENANT}"

# Step 2: List all accessible tenants
echo "Listing all accessible tenants..."
az account tenant list \\
  --query "[].{TenantId:tenantId,CountryCode:countryCode,DisplayName:displayName}" \\
  --output table

# Step 3: Example tenant ID to verify (replace with your tenant ID)
TENANT_ID="12345678-1234-1234-1234-123456789012"
echo "Verifying tenant ID format: \${TENANT_ID}"

# Step 4: Verify tenant ID format (should be GUID)
if [[ ! \${TENANT_ID} =~ ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\$ ]]; then
  echo "ERROR: Invalid tenant ID format"
  echo "Required format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (GUID)"
  exit 1
else
  echo "Tenant ID format is valid"
fi

# Step 5: Test tenant access
echo "Testing tenant access..."
if az login --tenant \${TENANT_ID} 2>&1; then
  echo "Tenant access successful"
else
  echo "WARNING: Tenant access failed - tenant may not exist or you lack access"
fi

# Step 6: Get tenant details using Microsoft Graph API
echo "Getting tenant details from Microsoft Graph..."
az rest \\
  --method GET \\
  --url "https://graph.microsoft.com/v1.0/tenantRelationships/findTenantInformationByTenantId(tenantId='\${TENANT_ID}')" \\
  --headers "Content-Type=application/json" \\
  --output table 2>&1 || echo "Could not retrieve tenant information"

# Step 7: Get tenant ID from domain name
DOMAIN="yourdomain.onmicrosoft.com"
echo "Resolving tenant ID from domain: \${DOMAIN}..."
TENANT_ID_FROM_DOMAIN=\$(az rest \\
  --method GET \\
  --url "https://login.microsoftonline.com/\${DOMAIN}/.well-known/openid-configuration" \\
  --query "issuer" \\
  --output tsv 2>/dev/null | sed 's|https://login.microsoftonline.com/||' | sed 's|/v2.0||')

if [ ! -z "\${TENANT_ID_FROM_DOMAIN}" ]; then
  echo "Tenant ID from domain: \${TENANT_ID_FROM_DOMAIN}"
else
  echo "Could not resolve tenant ID from domain"
fi

# Step 8: Instructions for cross-tenant access
echo ""
echo "For cross-tenant access:"
echo "  1. Ensure B2B federation is configured between tenants"
echo "  2. Request guest user invitation from the target tenant administrator"
echo "  3. Accept the invitation and authenticate with the target tenant"`,
        },
      ],
      relatedCodes: ['AuthenticationFailed', 'InvalidAuthenticationInfo'],
      provider: 'azure',
    },
    'AADUserNotFound': {
      code: 'AADUserNotFound',
      name: 'AAD User Not Found: User Does Not Exist',
      description: `Seeing AADUserNotFound tells you Azure AD (Entra ID) couldn't locate the user—UPN format is wrong (must be user@domain), user was deleted, or they're in another tenant you can't access. This 404 client-side error happens when Azure AD validates user identifiers before operations. Most common in RBAC role assignments for VM access, but also surfaces in AKS cluster RBAC, Azure SQL database user management, and App Service deployment permissions. Cross-tenant access requires B2B federation or guest user invitations. Soft-deleted users may be recoverable within the 30-day retention window.`,
      metaDescription: 'Find missing Azure AD users. Search by UPN, display name, or email address, and restore soft-deleted users within retention period.',
      causes: [
        `Invalid UPN Format: The user principal name structure is incorrect or contains typos. UPNs must follow the format user@domain (e.g., john.doe@contoso.com). Common mistakes include missing @ symbol, wrong domain, or typos. This is persistent—you must use the correct UPN.`,
        `Deleted User: The user has been soft-deleted or permanently deleted from Azure AD. Deleted users aren't accessible via standard queries. Soft-deleted users may be recoverable within the retention period (typically 30 days). This is persistent—you must use a different user or restore the deleted user if possible.`,
        `Cross-Tenant Access: The user exists in a different tenant, and you don't have access. Cross-tenant access requires B2B federation configuration or guest user invitation. Simply knowing the UPN doesn't grant access. This is persistent—you must get access or use a user in your tenant.`,
      ],
      solutions: [
        `Step 1: Diagnose - List all users to see valid UPNs:\n   az ad user list --query "[].{DisplayName:displayName,UserPrincipalName:userPrincipalName,ObjectId:id}" --output table`,
        `Step 2: Diagnose - Search for user by display name:\n   az ad user list --filter "displayName eq '<name>'" --query "[].{DisplayName:displayName,UserPrincipalName:userPrincipalName}" --output table`,
        `Step 3: Diagnose - Search for user by email address:\n   az ad user list --filter "mail eq '<email>' or otherMails/any(x:x eq '<email>')" --output table`,
        `Step 4: Fix - If UPN format is wrong, use the correct format from the user list. Verify the domain matches your tenant.`,
        `Step 5: Fix - If user was deleted, check if soft-deleted and restore within retention period. Use Azure Portal > Azure AD > Users > Deleted users to restore.`,
        `Step 6: Fix - For cross-tenant access, ensure B2B federation is configured or request guest user invitation from the target tenant administrator.`,
        `Step 7: Verify - After finding the correct user or restoring, retry your operation. It should succeed instead of returning AADUserNotFound.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Azure AD User Lookup and Verification',
          code: `# This script helps diagnose AADUserNotFound by searching for users

# Step 1: Example user principal name to search (replace with your UPN)
UPN="user@yourdomain.onmicrosoft.com"
echo "Searching for user: \${UPN}"

# Step 2: Try to show user by UPN
echo "Attempting to find user by UPN..."
if az ad user show \\
  --id \${UPN} \\
  --query "{DisplayName:displayName,UserPrincipalName:userPrincipalName,ObjectId:id}" \\
  --output table 2>&1; then
  echo "User found by UPN"
else
  echo "User not found by UPN. Continuing search..."
fi

# Step 3: List all users to see available UPNs
echo "Listing all users in tenant..."
az ad user list \\
  --query "[].{DisplayName:displayName,UserPrincipalName:userPrincipalName,ObjectId:id}" \\
  --output table

# Step 4: Search users by display name
DISPLAY_NAME="John Doe"
echo "Searching for user by display name: \${DISPLAY_NAME}..."
az ad user list \\
  --filter "displayName eq '\${DISPLAY_NAME}'" \\
  --query "[].{DisplayName:displayName,UserPrincipalName:userPrincipalName,ObjectId:id}" \\
  --output table

# Step 5: Search users by email address
EMAIL="user@example.com"
echo "Searching for user by email: \${EMAIL}..."
az ad user list \\
  --filter "mail eq '\${EMAIL}' or otherMails/any(x:x eq '\${EMAIL}')" \\
  --query "[].{DisplayName:displayName,UserPrincipalName:userPrincipalName}" \\
  --output table

# Step 6: Get user by object ID (if you have it)
OBJECT_ID="12345678-1234-1234-1234-123456789012"
echo "Searching for user by object ID: \${OBJECT_ID}..."
if az ad user show \\
  --id \${OBJECT_ID} \\
  --query "{DisplayName:displayName,UserPrincipalName:userPrincipalName}" \\
  --output table 2>&1; then
  echo "User found by object ID"
else
  echo "User not found by object ID"
fi

# Step 7: Verify UPN format
echo "Verifying UPN format..."
if [[ \${UPN} =~ ^[^@]+@[^@]+\$ ]]; then
  echo "UPN format is valid: \${UPN}"
else
  echo "ERROR: Invalid UPN format"
  echo "Required format: user@domain"
  echo "Example: john.doe@contoso.com"
fi

# Step 8: Instructions for checking deleted users
echo ""
echo "To check for deleted users:"
echo "  1. Go to Azure Portal > Azure AD > Users > Deleted users"
echo "  2. Search for the user by name or UPN"
echo "  3. If found, click 'Restore user' to recover within retention period"`,
        },
      ],
      relatedCodes: ['ResourceNotFound', 'NotFound'],
      provider: 'azure',
    },
    'AADGroupNotFound': {
      code: 'AADGroupNotFound',
      name: 'AAD Group Not Found: Group Does Not Exist',
      description: `AADGroupNotFound shows up when Azure AD (Entra ID) couldn't resolve the group—display name typo, wrong object ID, deleted group, or it's in another tenant you can't access. This 404 client-side error occurs when Azure AD validates group identifiers before operations. Most common in RBAC role assignments for VM access, but also appears in AKS cluster RBAC, Azure SQL database user management, and App Service deployment permissions. Cross-tenant access needs B2B federation or guest user invites. Group identifiers are case-sensitive for display names.`,
      metaDescription: 'Locate missing Azure AD groups. Search by display name (case-sensitive), object ID, or mail nickname, and restore soft-deleted groups.',
      causes: [
        `Invalid Group Identifier: The group display name, object ID, or mail nickname is incorrect or contains typos. Group identifiers must match exactly what's stored in Azure AD (case-sensitive for display names). This is persistent—you must use the correct identifier.`,
        `Deleted Group: The group has been soft-deleted or permanently deleted from Azure AD. Deleted groups aren't accessible via standard queries. Soft-deleted groups may be recoverable within the retention period (typically 30 days). This is persistent—you must use a different group or restore the deleted group if possible.`,
        `Cross-Tenant Access: The group exists in a different tenant, and you don't have access. Cross-tenant access requires B2B federation configuration or guest user invitation. This is persistent—you must get access or use a group in your tenant.`,
      ],
      solutions: [
        `Step 1: Diagnose - List all groups to see available identifiers:\n   az ad group list --query "[].{DisplayName:displayName,ObjectId:id,Mail:mail}" --output table`,
        `Step 2: Diagnose - Search for group by display name:\n   az ad group list --filter "displayName eq '<name>'" --query "[].{DisplayName:displayName,ObjectId:id,Mail:mail}" --output table`,
        `Step 3: Diagnose - Search for group by mail nickname:\n   az ad group list --filter "mailNickname eq '<nickname>'" --query "[].{DisplayName:displayName,Mail:mail}" --output table`,
        `Step 4: Fix - If identifier is wrong, use the correct identifier from the group list. Verify case sensitivity for display names.`,
        `Step 5: Fix - If group was deleted, check if soft-deleted and restore within retention period. Use Azure Portal > Azure AD > Groups > Deleted groups to restore.`,
        `Step 6: Fix - For cross-tenant access, ensure B2B federation is configured or request guest user invitation from the target tenant administrator.`,
        `Step 7: Verify - After finding the correct group or restoring, retry your operation. It should succeed instead of returning AADGroupNotFound.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Azure AD Group Lookup and Verification',
          code: `# This script helps diagnose AADGroupNotFound by searching for groups

# Step 1: Example group display name to search (replace with your group name)
GROUP_NAME="My Security Group"
echo "Searching for group: \${GROUP_NAME}"

# Step 2: Search for group by display name
echo "Searching by display name..."
az ad group list \\
  --filter "displayName eq '\${GROUP_NAME}'" \\
  --query "[].{DisplayName:displayName,ObjectId:id,Mail:mail}" \\
  --output table

# Step 3: List all groups to see available groups
echo "Listing all groups in tenant..."
az ad group list \\
  --query "[].{DisplayName:displayName,ObjectId:id,Mail:mail}" \\
  --output table

# Step 4: Get group by object ID (if you have it)
OBJECT_ID="12345678-1234-1234-1234-123456789012"
echo "Searching for group by object ID: \${OBJECT_ID}..."
if az ad group show \\
  --group \${OBJECT_ID} \\
  --query "{DisplayName:displayName,ObjectId:id,Mail:mail}" \\
  --output table 2>&1; then
  echo "Group found by object ID"
else
  echo "Group not found by object ID"
fi

# Step 5: Search groups by mail nickname
MAIL_NICKNAME="mygroup"
echo "Searching for group by mail nickname: \${MAIL_NICKNAME}..."
az ad group list \\
  --filter "mailNickname eq '\${MAIL_NICKNAME}'" \\
  --query "[].{DisplayName:displayName,Mail:mail,ObjectId:id}" \\
  --output table

# Step 6: Get group members (if group is found)
if [ ! -z "\${OBJECT_ID}" ]; then
  echo "Listing members of group: \${OBJECT_ID}..."
  az ad group member list \\
    --group \${OBJECT_ID} \\
    --query "[].{DisplayName:displayName,UserPrincipalName:userPrincipalName,ObjectType:objectType}" \\
    --output table
fi

# Step 7: Instructions for checking deleted groups
echo ""
echo "To check for deleted groups:"
echo "  1. Go to Azure Portal > Azure AD > Groups > Deleted groups"
echo "  2. Search for the group by name"
echo "  3. If found, click 'Restore group' to recover within retention period"`,
        },
      ],
      relatedCodes: ['ResourceNotFound', 'NotFound'],
      provider: 'azure',
    },
    'VMNetworkInterfaceNotFound': {
      code: 'VMNetworkInterfaceNotFound',
      name: 'VM Network Interface Not Found: Interface Missing or Detached',
      description: `VMNetworkInterfaceNotFound means ARM couldn't locate the network interface—wrong name/ID, interface was deleted, or it's detached from the VM. This 404 client-side error happens when ARM validates network interface references before VM operations. VMs need at least one network interface attached for connectivity. While specific to Virtual Machines, similar NIC lookup issues occur in AKS node network interfaces and App Service networking. The interface must exist and be attached for operations to work.`,
      metaDescription: 'Fix VMNetworkInterfaceNotFound. List attached NICs, verify interface exists in resource group, and attach detached interfaces to VMs.',
      causes: [
        `Invalid Network Interface Identifier: The network interface name or ID is incorrect or contains typos. Network interface identifiers must match exactly what's stored in Azure (case-sensitive). This is persistent—you must use the correct identifier.`,
        `Detached Network Interface: The network interface exists but isn't attached to the VM. VMs require at least one network interface to be attached for network connectivity and most operations. This is persistent—you must attach the network interface to the VM.`,
        `Deleted Network Interface: The network interface has been deleted or doesn't exist. Deleted interfaces can't be attached to VMs. This is persistent—you must create a new network interface or use an existing one.`,
      ],
      solutions: [
        `Step 1: Diagnose - List network interfaces attached to the VM:\n   az vm show --resource-group <rg> --name <vm> --query "networkProfile.networkInterfaces[].id" --output table`,
        `Step 2: Diagnose - Get network interface details if you have the ID:\n   az network nic show --ids <nic-id> --query "{Name:name,ProvisioningState:provisioningState,IPConfigurations:ipConfigurations[].name}" --output table`,
        `Step 3: Diagnose - List all network interfaces in the resource group:\n   az network nic list --resource-group <rg> --query "[].{Name:name,ProvisioningState:provisioningState,VM:virtualMachine.id}" --output table`,
        `Step 4: Fix - If interface is detached, attach it to the VM:\n   az vm nic add --resource-group <rg> --vm-name <vm> --nics <nic-name>`,
        `Step 5: Fix - If interface doesn't exist, create a new network interface:\n   az network nic create --resource-group <rg> --name <nic> --vnet-name <vnet> --subnet <subnet> --network-security-group <nsg>\n   Then attach it to the VM using Step 4.`,
        `Step 6: Verify - After attaching or creating the interface, retry your VM operation. It should succeed instead of returning VMNetworkInterfaceNotFound.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'VM Network Interface Diagnosis and Management',
          code: `# This script helps diagnose VMNetworkInterfaceNotFound by checking network interfaces

# Step 1: Set VM details (replace with your values)
RESOURCE_GROUP="my-resource-group"
VM_NAME="my-vm"
echo "Checking network interfaces for VM: \${VM_NAME}"

# Step 2: List network interfaces attached to the VM
echo "Listing network interfaces attached to VM..."
az vm show \\
  --resource-group \${RESOURCE_GROUP} \\
  --name \${VM_NAME} \\
  --query "networkProfile.networkInterfaces[].id" \\
  --output table

# Step 3: Get detailed network interface information
NIC_IDS=\$(az vm show \\
  --resource-group \${RESOURCE_GROUP} \\
  --name \${VM_NAME} \\
  --query "networkProfile.networkInterfaces[].id" \\
  --output tsv)

if [ ! -z "\${NIC_IDS}" ]; then
  echo "Found network interfaces attached to VM:"
  for nic_id in \${NIC_IDS}; do
    echo "Getting details for: \${nic_id}"
    az network nic show \\
      --ids \${nic_id} \\
      --query "{Name:name,ProvisioningState:provisioningState,IPConfigurations:ipConfigurations[].name,VM:virtualMachine.id}" \\
      --output table
  done
else
  echo "WARNING: No network interfaces found attached to VM"
fi

# Step 4: List all network interfaces in resource group
echo "Listing all network interfaces in resource group..."
az network nic list \\
  --resource-group \${RESOURCE_GROUP} \\
  --query "[].{Name:name,ProvisioningState:provisioningState,VM:virtualMachine.id,Location:location}" \\
  --output table

# Step 5: Check for detached network interfaces (interfaces without VM reference)
echo "Checking for detached network interfaces..."
DETACHED_NICS=\$(az network nic list \\
  --resource-group \${RESOURCE_GROUP} \\
  --query "[?virtualMachine.id==null].{Name:name,ProvisioningState:provisioningState}" \\
  --output table)

if [ ! -z "\${DETACHED_NICS}" ]; then
  echo "Found detached network interfaces:"
  echo "\${DETACHED_NICS}"
  echo "These can be attached to the VM"
fi

# Step 6: Create network interface if needed (example)
NIC_NAME="my-nic"
VNET_NAME="my-vnet"
SUBNET_NAME="my-subnet"
NSG_NAME="my-nsg"

echo "To create a new network interface, run:"
echo "  az network nic create \\"
echo "    --resource-group \${RESOURCE_GROUP} \\"
echo "    --name \${NIC_NAME} \\"
echo "    --vnet-name \${VNET_NAME} \\"
echo "    --subnet \${SUBNET_NAME} \\"
echo "    --network-security-group \${NSG_NAME}"

# Step 7: Attach network interface to VM (if needed)
echo "To attach a network interface to VM, run:"
echo "  az vm nic add \\"
echo "    --resource-group \${RESOURCE_GROUP} \\"
echo "    --vm-name \${VM_NAME} \\"
echo "    --nics \${NIC_NAME}"`,
        },
      ],
      relatedCodes: ['ResourceNotFound', 'NotFound'],
      provider: 'azure',
    },
    'VMDeploymentFailed': {
      code: 'VMDeploymentFailed',
      name: 'VM Deployment Failed: Template or Extension Error',
      description: `VMDeploymentFailed signals your ARM template deployment crashed before the VM finished provisioning—template syntax errors, extension install failures, or missing/invalid dependencies (networks, storage, images). ARM throws this 400/409 client-side error after validating templates and dependencies. Failures can hit during VM creation, configuration, or extension installation. While specific to Virtual Machines, similar deployment failures happen in AKS cluster deployments and App Service app deployments. The deployment's provisioningState shows "Failed" with detailed errors in deployment operations.`,
      metaDescription: 'Unblock VMDeploymentFailed. Validate ARM template syntax, inspect extension error logs, and verify all resource dependencies exist.',
      causes: [
        `ARM Template Errors: The template has syntax errors, invalid parameters, or resource definition issues. ARM validates templates before deployment, rejecting malformed JSON, invalid parameter types, or resource schema violations. This is persistent—you must fix the template before retrying.`,
        `Extension Installation Failure: VM extensions can't install or execute properly. Custom script extensions may fail due to script errors, permission issues, network connectivity problems preventing extension downloads, or invalid extension settings. This is persistent—you must fix the extension issue before retrying.`,
        `Resource Dependency Failure: Referenced resources (virtual networks, subnets, storage accounts, VM images) don't exist or are in invalid states (not "Succeeded"). ARM validates dependencies before deployment. This is persistent—you must fix dependencies before retrying.`,
      ],
      solutions: [
        `Step 1: Diagnose - Get deployment details and provisioning state:\n   az deployment group show --resource-group <rg> --name <deployment-name> --query "properties.provisioningState" --output table`,
        `Step 2: Diagnose - List failed deployment operations with error messages:\n   az deployment operation group list --resource-group <rg> --name <deployment-name> --query "[?properties.provisioningState=='Failed'].{Operation:operationId,Status:properties.provisioningState,Message:properties.statusMessage.message}" --output table`,
        `Step 3: Diagnose - Validate ARM template before deployment:\n   az deployment group validate --resource-group <rg> --template-file template.json --parameters @parameters.json\n   Fix any validation errors reported.`,
        `Step 4: Diagnose - Check VM extension status and logs:\n   az vm extension list --resource-group <rg> --vm-name <vm> --query "[].{Name:name,ProvisioningState:provisioningState,Type:type}" --output table\n   Get detailed extension logs: az vm extension show --resource-group <rg> --vm-name <vm> --name <extension> --instance-view`,
        `Step 5: Fix - Fix template syntax errors, invalid parameters, or resource schema violations based on validation output.`,
        `Step 6: Fix - Fix extension issues: correct script errors, fix permissions, ensure network connectivity, or update extension settings.`,
        `Step 7: Fix - Verify all dependencies exist and have provisioningState: "Succeeded". Create missing resources or wait for dependencies to complete.`,
        `Step 8: Verify - After fixing issues, retry deployment. The deployment should succeed with provisioningState: "Succeeded".`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'VM Deployment Failure Diagnosis',
          code: `# This script helps diagnose VMDeploymentFailed by checking deployment status and errors

# Step 1: Set deployment details (replace with your values)
RESOURCE_GROUP="my-resource-group"
DEPLOYMENT_NAME="myDeployment"
VM_NAME="my-vm"
echo "Diagnosing deployment: \${DEPLOYMENT_NAME}"

# Step 2: Get deployment provisioning state
echo "Checking deployment provisioning state..."
PROVISIONING_STATE=\$(az deployment group show \\
  --resource-group \${RESOURCE_GROUP} \\
  --name \${DEPLOYMENT_NAME} \\
  --query "properties.provisioningState" \\
  --output tsv 2>/dev/null)

if [ ! -z "\${PROVISIONING_STATE}" ]; then
  echo "Deployment provisioning state: \${PROVISIONING_STATE}"
  if [ "\${PROVISIONING_STATE}" == "Failed" ]; then
    echo "WARNING: Deployment failed"
  fi
else
  echo "Deployment not found or inaccessible"
fi

# Step 3: List failed deployment operations with error messages
echo "Listing failed deployment operations..."
az deployment operation group list \\
  --resource-group \${RESOURCE_GROUP} \\
  --name \${DEPLOYMENT_NAME} \\
  --query "[?properties.provisioningState=='Failed'].{Operation:operationId,Status:properties.provisioningState,Message:properties.statusMessage.message,Resource:properties.targetResource.id}" \\
  --output table

# Step 4: Validate ARM template (if using templates)
TEMPLATE_FILE="template.json"
PARAMS_FILE="parameters.json"
if [ -f "\${TEMPLATE_FILE}" ] && [ -f "\${PARAMS_FILE}" ]; then
  echo "Validating ARM template..."
  az deployment group validate \\
    --resource-group \${RESOURCE_GROUP} \\
    --template-file \${TEMPLATE_FILE} \\
    --parameters @\${PARAMS_FILE} \\
    --output table
else
  echo "Template files not found. Skipping template validation."
fi

# Step 5: Check VM extension status
echo "Checking VM extension status..."
az vm extension list \\
  --resource-group \${RESOURCE_GROUP} \\
  --vm-name \${VM_NAME} \\
  --query "[].{Name:name,ProvisioningState:provisioningState,Type:type}" \\
  --output table

# Step 6: Get extension instance view for detailed logs
echo "Getting extension instance views..."
EXTENSIONS=\$(az vm extension list --resource-group \${RESOURCE_GROUP} --vm-name \${VM_NAME} --query "[].name" -o tsv)
for ext in \${EXTENSIONS}; do
  echo "Extension: \${ext}"
  az vm extension show \\
    --resource-group \${RESOURCE_GROUP} \\
    --vm-name \${VM_NAME} \\
    --name \${ext} \\
    --instance-view \\
    --query "instanceView.statuses" \\
    --output table
done

# Step 7: Check VM boot diagnostics (if enabled)
echo "Checking VM boot diagnostics..."
if az vm boot-diagnostics get-boot-log \\
  --resource-group \${RESOURCE_GROUP} \\
  --name \${VM_NAME} \\
  --output tsv > boot-log.txt 2>&1; then
  echo "Boot log saved to boot-log.txt"
else
  echo "Boot diagnostics not available or not enabled"
fi

# Step 8: Check resource dependencies
echo "Checking resource dependencies..."
# Example: Check if virtual network exists
VNET_NAME="my-vnet"
if az network vnet show --resource-group \${RESOURCE_GROUP} --name \${VNET_NAME} --query "provisioningState" -o tsv 2>&1 | grep -q "Succeeded"; then
  echo "Virtual network \${VNET_NAME} exists and is ready"
else
  echo "WARNING: Virtual network \${VNET_NAME} may not exist or is not ready"
fi`,
        },
      ],
      relatedCodes: ['VMProvisioningStateFailed', 'OperationNotAllowed'],
      provider: 'azure',
    },
    'StorageContainerQuotaExceeded': {
      code: 'StorageContainerQuotaExceeded',
      name: 'Storage Container Quota Exceeded: Container Limit Reached',
      description: `StorageContainerQuotaExceeded triggers when you've maxed out containers in the storage account—default is unlimited, but custom quotas or service-level limits can cap container count. ARM returns this 403 client-side error after checking container count against configured limits. Quotas vary by storage account type (Standard vs Premium) and can be set at the account level. Most common when creating containers for VM disk backups, but also appears in AKS container image storage, Azure SQL backup storage, and App Service application file storage.`,
      metaDescription: 'Solve StorageContainerQuotaExceeded. Count existing containers, find unused ones to delete, and request quota increases if needed.',
      causes: [
        `Custom Quota Limit: A custom quota has been configured that limits container count in the storage account. Quotas may be set at the account level by administrators. This is persistent—you must delete containers or request a quota increase.`,
        `Service-Level Limits: Certain storage account types or configurations have service-level limits on container count. Premium storage accounts or specific SKUs may have different limits than standard accounts. This is persistent—you must delete containers or use a different storage account type.`,
        `Account Configuration Restrictions: The storage account has configuration restrictions that limit container creation. Some account settings or policies may restrict container count. This is persistent—you must adjust account configuration or delete containers.`,
      ],
      solutions: [
        `Step 1: Diagnose - Count current containers in the storage account:\n   az storage container list --account-name <account> --account-key <key> --query "length(@)" --output tsv`,
        `Step 2: Diagnose - List all containers to identify candidates for deletion:\n   az storage container list --account-name <account> --account-key <key> --query "[].{Name:name,LastModified:properties.lastModified}" --output table`,
        `Step 3: Diagnose - Find empty or unused containers:\n   az storage container list --account-name <account> --account-key <key> --query "[?properties.lastModified<'\$(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%SZ)'].name" --output table`,
        `Step 4: Fix - Delete unused containers to free quota:\n   az storage container delete --account-name <account> --account-key <key> --name <container-name> --yes`,
        `Step 5: Fix - Request quota increase through Azure Support if custom quotas are configured. Check storage account properties for quota settings.`,
        `Step 6: Fix - Consider consolidating containers by using blob naming conventions (virtual directories) to organize content within fewer containers.`,
        `Step 7: Verify - After deleting containers or getting quota approval, retry container creation. It should succeed instead of returning StorageContainerQuotaExceeded.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Storage Container Quota Usage Diagnosis',
          code: `# This script helps diagnose StorageContainerQuotaExceeded by checking container count

# Step 1: Set storage account details (replace with your values)
STORAGE_ACCOUNT="mystorageaccount"
# Note: For production, use managed identity or SAS tokens instead of account key
STORAGE_KEY="your-storage-account-key"
echo "Checking container quota for storage account: \${STORAGE_ACCOUNT}"

# Step 2: List all containers
echo "Listing all containers..."
az storage container list \\
  --account-name \${STORAGE_ACCOUNT} \\
  --account-key \${STORAGE_KEY} \\
  --query "[].{Name:name,LastModified:properties.lastModified,PublicAccess:properties.publicAccess}" \\
  --output table

# Step 3: Count containers
CONTAINER_COUNT=\$(az storage container list \\
  --account-name \${STORAGE_ACCOUNT} \\
  --account-key \${STORAGE_KEY} \\
  --query "length(@)" \\
  --output tsv)
echo "Current container count: \${CONTAINER_COUNT}"

# Step 4: Check storage account properties for quota settings
echo "Checking storage account properties..."
az storage account show \\
  --name \${STORAGE_ACCOUNT} \\
  --resource-group myResourceGroup \\
  --query "{Kind:kind,Sku:sku.name,Tier:sku.tier,ProvisioningState:provisioningState}" \\
  --output table

# Step 5: Find containers not modified in the last 30 days (potentially unused)
echo "Finding potentially unused containers (not modified in 30 days)..."
THIRTY_DAYS_AGO=\$(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%SZ)
UNUSED_CONTAINERS=\$(az storage container list \\
  --account-name \${STORAGE_ACCOUNT} \\
  --account-key \${STORAGE_KEY} \\
  --query "[?properties.lastModified<'\${THIRTY_DAYS_AGO}'].{Name:name,LastModified:properties.lastModified}" \\
  --output table)

if [ ! -z "\${UNUSED_CONTAINERS}" ]; then
  echo "Potentially unused containers:"
  echo "\${UNUSED_CONTAINERS}"
else
  echo "No unused containers found (all modified within 30 days)"
fi

# Step 6: Check container sizes to identify large containers
echo "Checking container sizes (this may take time for many containers)..."
CONTAINER_NAMES=\$(az storage container list \\
  --account-name \${STORAGE_ACCOUNT} \\
  --account-key \${STORAGE_KEY} \\
  --query "[].name" \\
  --output tsv)

for container in \${CONTAINER_NAMES}; do
  BLOB_COUNT=\$(az storage blob list \\
    --account-name \${STORAGE_ACCOUNT} \\
    --account-key \${STORAGE_KEY} \\
    --container-name \${container} \\
    --query "length(@)" \\
    --output tsv 2>/dev/null || echo "0")
  echo "Container \${container}: \${BLOB_COUNT} blobs"
done

# Step 7: Instructions for deleting containers
echo ""
echo "To delete unused containers, run:"
echo "  az storage container delete \\"
echo "    --account-name \${STORAGE_ACCOUNT} \\"
echo "    --account-key \${STORAGE_KEY} \\"
echo "    --name <container-name> \\"
echo "    --yes"`,
        },
      ],
      relatedCodes: ['QuotaExceeded', 'StorageAccountQuotaExceeded'],
      provider: 'azure',
    },
    'BlobLeaseIdMissing': {
      code: 'BlobLeaseIdMissing',
      name: 'Blob Lease ID Missing: Lease Required for Operation',
      description: `Getting BlobLeaseIdMissing means your blob operation needs a lease ID in the x-ms-lease-id header, but you didn't provide one. Some operations (delete, update, metadata changes) require active leases to prevent concurrent modifications. Azure Storage returns this 409 client-side error when lease validation fails. Leases expire after their duration (typically 15-60 seconds, configurable). Most common when managing blobs for VM disk backups, but also surfaces in AKS container image updates, Azure SQL backup blob operations, and App Service application file updates.`,
      metaDescription: 'Fix BlobLeaseIdMissing. Acquire blob leases via REST API or SDK, check lease state, and include lease IDs in operation headers.',
      causes: [
        `Missing Lease ID Header: The request doesn't include the x-ms-lease-id header required for leased blob operations. Leased blob operations must include the lease ID in headers. This is persistent—you must acquire a lease and include the ID in the request.`,
        `Expired Lease: The lease has passed its duration and is no longer active. Leases expire after their configured duration (typically 15-60 seconds). This is transient—acquiring a new lease and retrying helps.`,
        `Lease Not Acquired: The operation requires a lease but none was acquired before the operation. Some operations (delete, update, metadata changes) require leases for leased blobs. This is persistent—you must acquire a lease before the operation.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check if the blob has an active lease. Azure CLI doesn't directly show lease status, but you can try operations to see if they fail with BlobLeaseIdMissing.`,
        `Step 2: Fix - Acquire a blob lease before the operation. Use Azure Storage SDK (e.g., @azure/storage-blob) or REST API to acquire a lease. The lease ID must be included in subsequent request headers as x-ms-lease-id.`,
        `Step 3: Fix - If lease expired, acquire a new lease. Leases expire after their duration, so you may need to renew or acquire a new lease before operations.`,
        `Step 4: Fix - For operations on leased blobs, include the lease ID in request headers: x-ms-lease-id: <lease-id>. This applies to delete, update, and metadata change operations.`,
        `Step 5: Fix - If you need to break an existing lease (force release), use the break lease operation. This is useful when the lease owner is unavailable.`,
        `Step 6: Verify - After acquiring a lease and including the lease ID in headers, retry your operation. It should succeed instead of returning BlobLeaseIdMissing.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Blob Lease Status Check and Management',
          code: `# This script helps diagnose BlobLeaseIdMissing by checking blob lease status
# Note: Azure CLI has limited lease support. Lease operations typically require REST API or SDKs.

# Step 1: Set storage account details (replace with your values)
STORAGE_ACCOUNT="mystorageaccount"
CONTAINER_NAME="mycontainer"
BLOB_NAME="myblob.txt"
# Note: For production, use managed identity or SAS tokens instead of account key
ACCOUNT_KEY="your-storage-account-key"

# Step 2: Check blob properties (lease status may be visible in properties)
echo "Checking blob properties for lease information..."
az storage blob show \\
  --account-name \${STORAGE_ACCOUNT} \\
  --account-key \${ACCOUNT_KEY} \\
  --container-name \${CONTAINER_NAME} \\
  --name \${BLOB_NAME} \\
  --query "{Name:name,LeaseState:properties.leaseState,LeaseStatus:properties.leaseStatus,LeaseDuration:properties.leaseDuration}" \\
  --output table

# Step 3: Try to get blob properties - if it fails with lease error, blob is leased
echo "Testing blob access..."
if az storage blob show \\
  --account-name \${STORAGE_ACCOUNT} \\
  --account-key \${ACCOUNT_KEY} \\
  --container-name \${CONTAINER_NAME} \\
  --name \${BLOB_NAME} \\
  --output table 2>&1; then
  echo "Blob is accessible"
else
  ERROR_OUTPUT=\$(az storage blob show \\
    --account-name \${STORAGE_ACCOUNT} \\
    --account-key \${ACCOUNT_KEY} \\
    --container-name \${CONTAINER_NAME} \\
    --name \${BLOB_NAME} \\
    --output table 2>&1)
  
  if echo "\${ERROR_OUTPUT}" | grep -q "lease\|LeaseIdMissing"; then
    echo "WARNING: Blob appears to be leased or requires lease ID"
  fi
fi

# Step 4: Instructions for acquiring lease using REST API
echo ""
echo "To acquire a blob lease, use Azure Storage REST API or SDK:"
echo ""
echo "REST API Example (PUT request):"
echo "  PUT https://\${STORAGE_ACCOUNT}.blob.core.windows.net/\${CONTAINER_NAME}/\${BLOB_NAME}?comp=lease"
echo "  Headers:"
echo "    x-ms-lease-action: acquire"
echo "    x-ms-lease-duration: 60"
echo "    x-ms-version: 2021-04-10"
echo "    Authorization: SharedKey ..."
echo ""
echo "The response will include x-ms-lease-id header with the lease ID."

# Step 5: Instructions for using lease ID in operations
echo ""
echo "To use lease ID in blob operations:"
echo "  Include header: x-ms-lease-id: <lease-id>"
echo ""
echo "Example operations requiring lease ID:"
echo "  - Delete blob"
echo "  - Update blob metadata"
echo "  - Update blob properties"
echo "  - Snapshot blob (if leased)"

# Step 6: Instructions for breaking lease
echo ""
echo "To break an existing lease (force release):"
echo "  PUT https://\${STORAGE_ACCOUNT}.blob.core.windows.net/\${CONTAINER_NAME}/\${BLOB_NAME}?comp=lease"
echo "  Headers:"
echo "    x-ms-lease-action: break"
echo "    x-ms-version: 2021-04-10"
echo "    Authorization: SharedKey ..."

# Step 7: Note about Azure Storage SDK
echo ""
echo "For easier lease management, use Azure Storage SDK:"
echo "  - JavaScript/TypeScript: @azure/storage-blob"
echo "  - Python: azure-storage-blob"
echo "  - .NET: Azure.Storage.Blobs"
echo "  - Java: azure-storage-blob"`,
        },
      ],
      relatedCodes: ['PreconditionFailed', 'ConflictError'],
      provider: 'azure',
    },
    'VMSSInstanceNotFound': {
      code: 'VMSSInstanceNotFound',
      name: 'VMSS Instance Not Found: Instance Does Not Exist',
      description: `Hitting VMSSInstanceNotFound means ARM couldn't locate the scale set instance—wrong instance ID (usually numeric like 0, 1, 2), instance was deleted, or it's deallocated (stopped and deallocated). This 404 client-side error occurs when ARM validates instance IDs before operations. While specific to Virtual Machine Scale Sets, similar instance lookup failures happen in AKS node instances and App Service app service instances. Deallocated instances need to be started before most operations work. Scale sets may auto-create instances based on capacity settings.`,
      metaDescription: 'Find missing VMSS instances. List all instances by ID, check power state, and start deallocated instances to restore access.',
      causes: [
        `Invalid Instance ID Format: The instance ID is incorrect or doesn't match the expected format. Instance IDs are typically numeric (0, 1, 2, etc.) or follow a specific naming pattern depending on the scale set configuration. This is persistent—you must use the correct instance ID.`,
        `Deleted Instance: The instance has been deleted from the scale set. Deleted instances aren't accessible via standard queries. Scale sets may automatically create new instances based on capacity settings (min/max count). This is persistent—you must use a different instance or wait for the scale set to create new instances.`,
        `Deallocated Instance: Instances have been deallocated (stopped and deallocated) and may not be immediately accessible for operations. Deallocated instances need to be started before most operations. This can be transient—starting the instance and retrying may help.`,
      ],
      solutions: [
        `Step 1: Diagnose - List all instances in the scale set to see available instance IDs:\n   az vmss list-instances --resource-group <rg> --name <vmss> --query "[].{InstanceId:instanceId,Name:name,ProvisioningState:provisioningState}" --output table`,
        `Step 2: Diagnose - Get specific instance details if you have the instance ID:\n   az vmss get-instance-view --resource-group <rg> --name <vmss> --instance-id <id> --query "{InstanceId:instanceId,ProvisioningState:provisioningState,PowerState:statuses[?code=='PowerState/'].displayStatus}" --output table`,
        `Step 3: Diagnose - Check instance status and power state:\n   az vmss get-instance-view --resource-group <rg> --name <vmss> --instance-id <id> --query "statuses[].{Code:code,DisplayStatus:displayStatus}" --output table`,
        `Step 4: Fix - If instance ID is wrong, use the correct instance ID from the list. Verify the instance ID format matches the scale set's naming pattern.`,
        `Step 5: Fix - If instance was deleted, wait for the scale set to create new instances based on capacity settings, or manually scale up:\n   az vmss scale --resource-group <rg> --name <vmss> --new-capacity <count>`,
        `Step 6: Fix - If instance is deallocated, start it:\n   az vmss start --resource-group <rg> --name <vmss> --instance-ids <id>`,
        `Step 7: Verify - After finding the correct instance or starting a deallocated one, retry your operation. It should succeed instead of returning VMSSInstanceNotFound.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'VM Scale Set Instance Lookup and Management',
          code: `# This script helps diagnose VMSSInstanceNotFound by finding and managing scale set instances

# Step 1: Set scale set details (replace with your values)
RESOURCE_GROUP="my-resource-group"
VMSS_NAME="myVMSS"
echo "Checking instances for VM scale set: \${VMSS_NAME}"

# Step 2: List all instances in the scale set
echo "Listing all instances in scale set..."
az vmss list-instances \\
  --resource-group \${RESOURCE_GROUP} \\
  --name \${VMSS_NAME} \\
  --query "[].{InstanceId:instanceId,Name:name,ProvisioningState:provisioningState,ComputerName:osProfile.computerName}" \\
  --output table

# Step 3: Get instance IDs
INSTANCE_IDS=\$(az vmss list-instances \\
  --resource-group \${RESOURCE_GROUP} \\
  --name \${VMSS_NAME} \\
  --query "[].instanceId" \\
  --output tsv)

if [ ! -z "\${INSTANCE_IDS}" ]; then
  echo "Available instance IDs: \${INSTANCE_IDS}"
else
  echo "WARNING: No instances found in scale set"
fi

# Step 4: Example instance ID to check (replace with your instance ID)
INSTANCE_ID="0"
echo "Checking instance: \${INSTANCE_ID}"

# Step 5: Get specific instance details
echo "Getting instance details..."
az vmss get-instance-view \\
  --resource-group \${RESOURCE_GROUP} \\
  --name \${VMSS_NAME} \\
  --instance-id \${INSTANCE_ID} \\
  --query "{InstanceId:instanceId,ProvisioningState:provisioningState,PowerState:statuses[?code=='PowerState/'].displayStatus,VMHealth:statuses[?code=='HealthState/'].displayStatus}" \\
  --output table

# Step 6: Check instance status codes
echo "Checking instance status codes..."
az vmss get-instance-view \\
  --resource-group \${RESOURCE_GROUP} \\
  --name \${VMSS_NAME} \\
  --instance-id \${INSTANCE_ID} \\
  --query "statuses[].{Code:code,DisplayStatus:displayStatus,Time:time}" \\
  --output table

# Step 7: Check scale set capacity settings
echo "Checking scale set capacity settings..."
az vmss show \\
  --resource-group \${RESOURCE_GROUP} \\
  --name \${VMSS_NAME} \\
  --query "{Capacity:sku.capacity,MinCapacity:sku.capacity,MaxCapacity:sku.capacity}" \\
  --output table

# Step 8: Check if instance is deallocated and start if needed
POWER_STATE=\$(az vmss get-instance-view \\
  --resource-group \${RESOURCE_GROUP} \\
  --name \${VMSS_NAME} \\
  --instance-id \${INSTANCE_ID} \\
  --query "statuses[?code=='PowerState/'].displayStatus" \\
  --output tsv 2>/dev/null)

if [ ! -z "\${POWER_STATE}" ]; then
  echo "Instance power state: \${POWER_STATE}"
  if echo "\${POWER_STATE}" | grep -qi "deallocated\|stopped"; then
    echo "Instance is deallocated or stopped. Starting instance..."
    az vmss start \\
      --resource-group \${RESOURCE_GROUP} \\
      --name \${VMSS_NAME} \\
      --instance-ids \${INSTANCE_ID}
  fi
fi

# Step 9: Scale up if needed (to create new instances)
echo "To scale up the scale set (create more instances), run:"
echo "  az vmss scale \\"
echo "    --resource-group \${RESOURCE_GROUP} \\"
echo "    --name \${VMSS_NAME} \\"
echo "    --new-capacity <desired-count>"`,
        },
      ],
      relatedCodes: ['ResourceNotFound', 'NotFound'],
      provider: 'azure',
    },
    'AADApplicationNotFound': {
      code: 'AADApplicationNotFound',
      name: 'AAD Application Not Found: Application Does Not Exist',
      description: `AADApplicationNotFound appears when Azure AD (Entra ID) couldn't resolve the application registration—wrong application ID (client ID) or object ID, app was deleted, or it's in another tenant you can't access. This 404 client-side error happens when Azure AD validates application identifiers before operations. Application IDs must be valid GUIDs. Most common in service principal authentication for VM deployments, but also appears in AKS cluster authentication, Azure SQL database connections, and App Service deployment operations. Cross-tenant access requires B2B federation or guest user invitations.`,
      metaDescription: 'Locate missing Azure AD applications. Search by display name or application ID, verify GUID format, and restore soft-deleted apps.',
      causes: [
        `Invalid Application Identifier: The application ID (client ID) or object ID is incorrect or contains typos. Application IDs must be valid GUIDs (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx). Common mistakes include missing segments, wrong length, or typos. This is persistent—you must use the correct identifier.`,
        `Deleted Application: The application has been soft-deleted or permanently deleted from Azure AD. Deleted applications aren't accessible via standard queries. Soft-deleted applications may be recoverable within the retention period (typically 30 days). This is persistent—you must use a different application or restore the deleted application if possible.`,
        `Cross-Tenant Access: The application exists in a different tenant, and you don't have access. Cross-tenant access requires B2B federation configuration or guest user invitation. This is persistent—you must get access or use an application in your tenant.`,
      ],
      solutions: [
        `Step 1: Diagnose - List all applications to see available application IDs:\n   az ad app list --query "[].{DisplayName:displayName,AppId:appId,ObjectId:id}" --output table`,
        `Step 2: Diagnose - Search for application by display name:\n   az ad app list --filter "displayName eq '<name>'" --query "[].{DisplayName:displayName,AppId:appId}" --output table`,
        `Step 3: Diagnose - Verify application ID format matches GUID pattern. Use the code example below to validate the format.`,
        `Step 4: Fix - If application ID is wrong, use the correct identifier from the application list. Verify the GUID format matches exactly.`,
        `Step 5: Fix - If application was deleted, check if soft-deleted and restore within retention period. Use Azure Portal > Azure AD > App registrations > Deleted applications to restore.`,
        `Step 6: Fix - For cross-tenant access, ensure B2B federation is configured or request guest user invitation from the target tenant administrator.`,
        `Step 7: Verify - After finding the correct application or restoring, retry your operation. It should succeed instead of returning AADApplicationNotFound.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Azure AD Application Lookup and Verification',
          code: `# This script helps diagnose AADApplicationNotFound by searching for applications

# Step 1: Example application ID to search (replace with your application ID)
APP_ID="12345678-1234-1234-1234-123456789012"
echo "Searching for application: \${APP_ID}"

# Step 2: Verify application ID format (should be GUID)
if [[ ! \${APP_ID} =~ ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\$ ]]; then
  echo "ERROR: Invalid application ID format"
  echo "Required format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (GUID)"
  exit 1
else
  echo "Application ID format is valid"
fi

# Step 3: Try to show application by application ID (client ID)
echo "Attempting to find application by application ID..."
if az ad app show \\
  --id \${APP_ID} \\
  --query "{DisplayName:displayName,AppId:appId,ObjectId:id}" \\
  --output table 2>&1; then
  echo "Application found by application ID"
else
  echo "Application not found by application ID. Continuing search..."
fi

# Step 4: List all applications to see available applications
echo "Listing all applications in tenant..."
az ad app list \\
  --query "[].{DisplayName:displayName,AppId:appId,ObjectId:id}" \\
  --output table

# Step 5: Search applications by display name
DISPLAY_NAME="My Application"
echo "Searching for application by display name: \${DISPLAY_NAME}..."
az ad app list \\
  --filter "displayName eq '\${DISPLAY_NAME}'" \\
  --query "[].{DisplayName:displayName,AppId:appId,ObjectId:id}" \\
  --output table

# Step 6: Get application by object ID (if you have it)
OBJECT_ID="12345678-1234-1234-1234-123456789012"
echo "Searching for application by object ID: \${OBJECT_ID}..."
if az ad app show \\
  --id \${OBJECT_ID} \\
  --query "{DisplayName:displayName,AppId:appId,ObjectId:id}" \\
  --output table 2>&1; then
  echo "Application found by object ID"
else
  echo "Application not found by object ID"
fi

# Step 7: Get application service principal (if application exists)
if az ad app show --id \${APP_ID} &>/dev/null; then
  echo "Getting service principal for application..."
  az ad sp show \\
    --id \${APP_ID} \\
    --query "{DisplayName:displayName,AppId:appId,ObjectId:id}" \\
    --output table
fi

# Step 8: List application owners
if az ad app show --id \${APP_ID} &>/dev/null; then
  echo "Listing application owners..."
  az ad app owner list \\
    --id \${APP_ID} \\
    --query "[].{DisplayName:displayName,UserPrincipalName:userPrincipalName,ObjectType:objectType}" \\
    --output table
fi

# Step 9: Instructions for checking deleted applications
echo ""
echo "To check for deleted applications:"
echo "  1. Go to Azure Portal > Azure AD > App registrations > Deleted applications"
echo "  2. Search for the application by name or application ID"
echo "  3. If found, click 'Restore application' to recover within retention period"`,
        },
      ],
      relatedCodes: ['ResourceNotFound', 'NotFound'],
      provider: 'azure',
    },
    'VMOSDiskNotFound': {
      code: 'VMOSDiskNotFound',
      name: 'VM OS Disk Not Found: Disk Missing or Detached',
      description: `Hitting VMOSDiskNotFound during a VM operation means ARM lost track of the OS disk—either the disk name/ID in your VM's storage profile is wrong, the disk got deleted, or it's sitting detached in your resource group. This 404 client-side error hits when ARM validates disk references before VM operations. VMs need an OS disk attached for boot and most operations. While specific to Virtual Machines, similar disk lookup failures happen in AKS node OS disks and App Service storage. The disk must exist in the same resource group or subscription and be properly referenced in the VM's storageProfile.osDisk.`,
      metaDescription: 'Struggling with VMOSDiskNotFound? Check OS disk attachment status, verify disk exists, and reconnect detached disks to get your VM running.',
      causes: [
        `Invalid OS Disk Identifier: The disk name or ID is incorrect or contains typos. Disk identifiers must match exactly what's stored in Azure (case-sensitive). The disk reference in the VM's storageProfile.osDisk may point to a non-existent disk. This is persistent—you must use the correct identifier.`,
        `Deleted OS Disk: The OS disk has been deleted or doesn't exist. Deleted disks can't be attached to VMs. Disks may be deleted accidentally or during resource cleanup. This is persistent—you must create a new OS disk or use an existing one.`,
        `Detached OS Disk: The disk exists but isn't attached to the VM. VMs require an OS disk to be attached in the storageProfile.osDisk configuration. The disk may have been detached during VM operations or configuration changes. This is persistent—you must attach the disk to the VM.`,
      ],
      solutions: [
        `Step 1: Diagnose - Get the OS disk name from the VM's storage profile:\n   az vm show --resource-group <rg> --name <vm> --query "storageProfile.osDisk.name" --output tsv`,
        `Step 2: Diagnose - Check if the disk exists:\n   az disk show --resource-group <rg> --name <disk-name> --query "{Name:name,SizeGB:diskSizeGb,State:diskState,SKU:sku.name}" --output table`,
        `Step 3: Diagnose - List all disks in the resource group to find available disks:\n   az disk list --resource-group <rg> --query "[].{Name:name,SizeGB:diskSizeGb,State:diskState}" --output table`,
        `Step 4: Fix - If disk identifier is wrong, use the correct disk name/ID from the disk list. Update the VM's storage profile if needed.`,
        `Step 5: Fix - If disk was deleted, create a new OS disk:\n   az disk create --resource-group <rg> --name <disk> --size-gb <size> --sku <sku> --os-type Linux\n   Then attach it to the VM or recreate the VM with the new disk.`,
        `Step 6: Fix - If disk is detached, ensure the VM's storageProfile.osDisk references the disk correctly. You may need to recreate the VM or update the disk attachment.`,
        `Step 7: Verify - After fixing the disk reference or attaching the disk, retry your VM operation. It should succeed instead of returning VMOSDiskNotFound.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'VM OS Disk Diagnosis and Management',
          code: `# This script helps diagnose VMOSDiskNotFound by checking OS disk status

# Step 1: Set VM details (replace with your values)
RESOURCE_GROUP="my-resource-group"
VM_NAME="my-vm"
echo "Checking OS disk for VM: \${VM_NAME}"

# Step 2: Get VM OS disk details from storage profile
echo "Getting OS disk details from VM storage profile..."
az vm show \\
  --resource-group \${RESOURCE_GROUP} \\
  --name \${VM_NAME} \\
  --query "storageProfile.osDisk" \\
  --output table

# Step 3: Get OS disk name
echo "Extracting OS disk name..."
OS_DISK_NAME=\$(az vm show \\
  --resource-group \${RESOURCE_GROUP} \\
  --name \${VM_NAME} \\
  --query "storageProfile.osDisk.name" \\
  --output tsv)

if [ ! -z "\${OS_DISK_NAME}" ]; then
  echo "OS Disk name: \${OS_DISK_NAME}"
else
  echo "WARNING: No OS disk name found in VM storage profile"
fi

# Step 4: Check if disk exists
if [ ! -z "\${OS_DISK_NAME}" ]; then
  echo "Checking if disk exists..."
  if az disk show \\
    --resource-group \${RESOURCE_GROUP} \\
    --name \${OS_DISK_NAME} \\
    --query "{Name:name,SizeGB:diskSizeGb,State:diskState,SKU:sku.name,ProvisioningState:provisioningState}" \\
    --output table 2>&1; then
    echo "OS disk exists and is accessible"
  else
    echo "ERROR: OS disk \${OS_DISK_NAME} not found"
    echo "The disk may have been deleted or doesn't exist"
  fi
fi

# Step 5: List all disks in resource group
echo "Listing all disks in resource group..."
az disk list \\
  --resource-group \${RESOURCE_GROUP} \\
  --query "[].{Name:name,SizeGB:diskSizeGb,State:diskState,SKU:sku.name}" \\
  --output table

# Step 6: Get disk by ID if you have the full resource ID
if [ ! -z "\${OS_DISK_NAME}" ]; then
  DISK_ID="/subscriptions/\$(az account show --query id -o tsv)/resourceGroups/\${RESOURCE_GROUP}/providers/Microsoft.Compute/disks/\${OS_DISK_NAME}"
  echo "Checking disk by full resource ID: \${DISK_ID}"
  az disk show \\
    --ids \${DISK_ID} \\
    --query "{Name:name,SizeGB:diskSizeGb,State:diskState}" \\
    --output table 2>&1 || echo "Disk not found by ID"
fi

# Step 7: Instructions for creating new OS disk if needed
echo ""
echo "If OS disk is missing, create a new one:"
echo "  az disk create \\"
echo "    --resource-group \${RESOURCE_GROUP} \\"
echo "    --name <new-disk-name> \\"
echo "    --size-gb <size> \\"
echo "    --sku <sku> \\"
echo "    --os-type Linux"
echo ""
echo "Note: You may need to recreate the VM or update the storage profile to attach the new disk"`,
        },
      ],
      relatedCodes: ['ResourceNotFound', 'NotFound'],
      provider: 'azure',
    },
    'StorageTableNotFound': {
      code: 'StorageTableNotFound',
      name: 'Storage Table Not Found: Table Does Not Exist',
      description: `Seeing StorageTableNotFound means Azure Table Storage couldn't resolve your table—name format violates DNS rules, the table never got created, or it was deleted (and unlike blobs, there's no soft-delete recovery). This 404 client-side error happens when Azure Storage validates table names before operations. Table names must be DNS-compliant (3-63 characters, alphanumeric plus hyphens, no consecutive hyphens, start/end with alphanumeric). Most common when accessing Table Storage for application data, but also surfaces in AKS application state storage, Azure SQL metadata tables, and App Service configuration storage. Once deleted, tables are permanently gone—no recovery window.`,
      metaDescription: 'Debug StorageTableNotFound. Validate DNS-compliant table names, list existing tables, and create missing ones before operations fail.',
      causes: [
        `Invalid Table Name Format: The table name doesn't match DNS-compliant naming rules (3-63 characters, alphanumeric plus hyphens, no consecutive hyphens, must start/end with alphanumeric). Table names are case-sensitive. This is persistent—you must use the correct table name format.`,
        `Non-Existent Table: The table hasn't been created in the storage account. Tables must be explicitly created before use—they don't auto-create on first access like some storage services. This is persistent—you must create the table before operations.`,
        `Deleted Table: The table was deleted from the storage account. Unlike blobs and containers, Table Storage doesn't support soft-delete—deleted tables are permanently removed with no recovery period. This is persistent—you must create a new table with the same or different name.`,
      ],
      solutions: [
        `Step 1: Diagnose - List all tables in the storage account to see available table names:\n   az storage table list --account-name <account> --account-key <key> --query "[].name" --output table`,
        `Step 2: Diagnose - Check if a specific table exists:\n   az storage table exists --account-name <account> --account-key <key> --name <table> --query "exists" --output tsv`,
        `Step 3: Diagnose - Verify table name format matches DNS-compliant rules (3-63 characters, alphanumeric plus hyphens, no consecutive hyphens).`,
        `Step 4: Fix - If table name format is wrong, use the correct format. Ensure the name starts and ends with alphanumeric characters.`,
        `Step 5: Fix - If table doesn't exist, create it:\n   az storage table create --account-name <account> --account-key <key> --name <table>`,
        `Step 6: Fix - If table was deleted, create a new table. Deleted tables can't be restored, so use the same name or a different one.`,
        `Step 7: Verify - After creating the table, retry your operation. It should succeed instead of returning StorageTableNotFound.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Storage Table Verification and Creation',
          code: `# This script helps diagnose StorageTableNotFound by checking table existence

# Step 1: Set storage account details (replace with your values)
STORAGE_ACCOUNT="mystorageaccount"
# Note: For production, use managed identity or SAS tokens instead of account key
STORAGE_KEY="your-storage-account-key"
TABLE_NAME="mytable"
echo "Checking table: \${TABLE_NAME} in storage account: \${STORAGE_ACCOUNT}"

# Step 2: List all tables in the storage account
echo "Listing all tables in storage account..."
az storage table list \\
  --account-name \${STORAGE_ACCOUNT} \\
  --account-key \${STORAGE_KEY} \\
  --query "[].name" \\
  --output table

# Step 3: Check if specific table exists
echo "Checking if table '\${TABLE_NAME}' exists..."
TABLE_EXISTS=\$(az storage table exists \\
  --account-name \${STORAGE_ACCOUNT} \\
  --account-key \${STORAGE_KEY} \\
  --name \${TABLE_NAME} \\
  --query "exists" \\
  --output tsv)

if [ "\${TABLE_EXISTS}" == "true" ]; then
  echo "Table '\${TABLE_NAME}' exists"
else
  echo "Table '\${TABLE_NAME}' does not exist"
fi

# Step 4: Verify table name format (DNS-compliant)
echo "Verifying table name format..."
if [[ ! \${TABLE_NAME} =~ ^[a-z0-9][a-z0-9-]*[a-z0-9]\$ ]] || [ \${#TABLE_NAME} -lt 3 ] || [ \${#TABLE_NAME} -gt 63 ]; then
  echo "ERROR: Invalid table name format"
  echo "Requirements:"
  echo "  - 3-63 characters"
  echo "  - Alphanumeric plus hyphens"
  echo "  - No consecutive hyphens"
  echo "  - Must start and end with alphanumeric"
else
  echo "Table name format is valid"
fi

# Step 5: Create table if it doesn't exist
if [ "\${TABLE_EXISTS}" != "true" ]; then
  echo "Creating table '\${TABLE_NAME}'..."
  if az storage table create \\
    --account-name \${STORAGE_ACCOUNT} \\
    --account-key \${STORAGE_KEY} \\
    --name \${TABLE_NAME} 2>&1; then
    echo "Table created successfully"
  else
    echo "ERROR: Failed to create table"
    echo "Check table name format and storage account permissions"
  fi
fi

# Step 6: Get table properties (if table exists)
if [ "\${TABLE_EXISTS}" == "true" ] || az storage table exists --account-name \${STORAGE_ACCOUNT} --account-key \${STORAGE_KEY} --name \${TABLE_NAME} --query "exists" -o tsv | grep -q "true"; then
  echo "Getting table properties..."
  az storage table show \\
    --account-name \${STORAGE_ACCOUNT} \\
    --account-key \${STORAGE_KEY} \\
    --name \${TABLE_NAME} \\
    --query "{Name:name}" \\
    --output table
fi

# Step 7: Note about table deletion
echo ""
echo "Important: Table Storage doesn't support soft-delete."
echo "Deleted tables are permanently removed and cannot be recovered."`,
        },
      ],
      relatedCodes: ['ResourceNotFound', 'ContainerNotFound'],
      provider: 'azure',
    },
    'VMExtensionNotFound': {
      code: 'VMExtensionNotFound',
      name: 'VM Extension Not Found: Extension Not Installed',
      description: `Getting VMExtensionNotFound tells you ARM can't locate the VM extension—name typo, extension never got installed, or someone removed it. This 404 client-side error occurs when ARM validates extension references before VM operations. Extensions don't auto-install on VM creation—you must explicitly install them. While specific to Virtual Machines, similar extension lookup failures happen in AKS node extensions and App Service site extensions. Extension names must match exactly what's installed (case-sensitive), including the publisher and version you specified during installation.`,
      metaDescription: 'Unblock VMExtensionNotFound. List installed extensions, verify exact names match, and install missing extensions with correct publisher/version.',
      causes: [
        `Invalid Extension Name: The extension name is incorrect or doesn't match the installed extension. Extension names must match exactly what's installed on the VM (case-sensitive). The extension name format is typically "ExtensionName" (e.g., "CustomScriptExtension"). This is persistent—you must use the correct extension name.`,
        `Uninstalled Extension: The extension hasn't been installed on the VM. Extensions must be explicitly installed before use—they don't auto-install on VM creation. This is persistent—you must install the extension before operations.`,
        `Removed Extension: The extension was removed from the VM. Removed extensions aren't accessible via standard queries. Extensions may be removed during VM configuration changes or manual removal. This is persistent—you must reinstall the extension or use a different one.`,
      ],
      solutions: [
        `Step 1: Diagnose - List all installed extensions on the VM:\n   az vm extension list --resource-group <rg> --vm-name <vm> --query "[].{Name:name,Type:type,ProvisioningState:provisioningState}" --output table`,
        `Step 2: Diagnose - Get extension details if you know the extension name:\n   az vm extension show --resource-group <rg> --vm-name <vm> --name <extension> --query "{Name:name,Type:type,ProvisioningState:provisioningState}" --output table`,
        `Step 3: Diagnose - Check extension instance view for detailed status:\n   az vm extension show --resource-group <rg> --vm-name <vm> --name <extension> --instance-view --query "instanceView.statuses" --output table`,
        `Step 4: Fix - If extension name is wrong, use the correct name from the extension list. Verify case sensitivity.`,
        `Step 5: Fix - If extension isn't installed, install it:\n   az vm extension set --resource-group <rg> --vm-name <vm> --name <extension> --publisher <publisher> --version <version> --settings <settings-json>`,
        `Step 6: Fix - If extension was removed, reinstall it with the correct publisher and version. Check extension documentation for required settings.`,
        `Step 7: Verify - After installing or reinstalling the extension, retry your operation. It should succeed instead of returning VMExtensionNotFound.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'VM Extension Diagnosis and Installation',
          code: `# This script helps diagnose VMExtensionNotFound by checking extension status

# Step 1: Set VM details (replace with your values)
RESOURCE_GROUP="my-resource-group"
VM_NAME="my-vm"
EXTENSION_NAME="CustomScriptExtension"
echo "Checking extension '\${EXTENSION_NAME}' on VM: \${VM_NAME}"

# Step 2: List all extensions installed on the VM
echo "Listing all extensions on VM..."
az vm extension list \\
  --resource-group \${RESOURCE_GROUP} \\
  --vm-name \${VM_NAME} \\
  --query "[].{Name:name,Type:type,ProvisioningState:provisioningState,Publisher:publisher}" \\
  --output table

# Step 3: Check if specific extension exists
echo "Checking if extension '\${EXTENSION_NAME}' exists..."
if az vm extension show \\
  --resource-group \${RESOURCE_GROUP} \\
  --vm-name \${VM_NAME} \\
  --name \${EXTENSION_NAME} \\
  --query "{Name:name,Type:type,ProvisioningState:provisioningState}" \\
  --output table 2>&1; then
  echo "Extension '\${EXTENSION_NAME}' exists"
else
  echo "Extension '\${EXTENSION_NAME}' not found"
fi

# Step 4: Get extension instance view for detailed status
if az vm extension show --resource-group \${RESOURCE_GROUP} --vm-name \${VM_NAME} --name \${EXTENSION_NAME} &>/dev/null; then
  echo "Getting extension instance view..."
  az vm extension show \\
    --resource-group \${RESOURCE_GROUP} \\
    --vm-name \${VM_NAME} \\
    --name \${EXTENSION_NAME} \\
    --instance-view \\
    --query "instanceView.statuses[].{Code:code,DisplayStatus:displayStatus,Message:message}" \\
    --output table
fi

# Step 5: Install extension if it doesn't exist
if ! az vm extension show --resource-group \${RESOURCE_GROUP} --vm-name \${VM_NAME} --name \${EXTENSION_NAME} &>/dev/null; then
  echo "Installing extension '\${EXTENSION_NAME}'..."
  echo "Example installation command:"
  echo "  az vm extension set \\"
  echo "    --resource-group \${RESOURCE_GROUP} \\"
  echo "    --vm-name \${VM_NAME} \\"
  echo "    --name CustomScriptExtension \\"
  echo "    --publisher Microsoft.Azure.Extensions \\"
  echo "    --version 2.1 \\"
  echo "    --settings '{\"commandToExecute\":\"echo hello\"}'"
  
  # Uncomment to actually install (replace with your extension details)
  # az vm extension set \\
  #   --resource-group \${RESOURCE_GROUP} \\
  #   --vm-name \${VM_NAME} \\
  #   --name \${EXTENSION_NAME} \\
  #   --publisher <publisher> \\
  #   --version <version> \\
  #   --settings <settings-json>
fi

# Step 6: List available extension publishers and types
echo "Listing available extension publishers..."
az vm extension image list-publishers \\
  --location eastus \\
  --query "[].name" \\
  --output table | head -10

# Step 7: Instructions for finding extension details
echo ""
echo "To find extension publisher and version:"
echo "  1. List extension types: az vm extension image list-types --location <location> --publisher <publisher>"
echo "  2. List extension versions: az vm extension image list-versions --location <location> --publisher <publisher> --type <type>"`,
        },
      ],
      relatedCodes: ['ResourceNotFound', 'NotFound'],
      provider: 'azure',
    },
    'AADServicePrincipalNotFound': {
      code: 'AADServicePrincipalNotFound',
      name: 'AAD Service Principal Not Found: Principal Does Not Exist',
      description: `AADServicePrincipalNotFound surfaces when Azure AD (Entra ID) can't find the service principal—wrong object ID or application ID, the principal never got created from your app registration, or it was deleted. This 404 client-side error happens when Azure AD validates service principal identifiers before operations. Service principals don't auto-create when you register an app—you must explicitly create them using 'az ad sp create'. Most common in service principal authentication for VM deployments, but also appears in AKS cluster authentication, Azure SQL database connections, and App Service deployment operations. Service principal IDs must be valid GUIDs.`,
      metaDescription: 'Troubleshoot AADServicePrincipalNotFound. Find service principals by application ID, verify they exist, and create missing ones from app registrations.',
      causes: [
        `Invalid Service Principal Identifier: The service principal ID (object ID) or application ID is incorrect or contains typos. Service principal IDs must be valid GUIDs. The identifier may reference a non-existent principal or have formatting errors. This is persistent—you must use the correct identifier.`,
        `Non-Existent Service Principal: The service principal hasn't been created from the application registration. Service principals must be explicitly created from applications using 'az ad sp create --id <app-id>'. Application registrations don't automatically create service principals. This is persistent—you must create the service principal before operations.`,
        `Deleted Service Principal: The service principal has been deleted from Azure AD. Deleted service principals aren't accessible via standard queries. Service principals may be deleted during cleanup or configuration changes. This is persistent—you must create a new service principal from the application or restore the deleted one if possible.`,
      ],
      solutions: [
        `Step 1: Diagnose - List all service principals to see available identifiers:\n   az ad sp list --query "[].{DisplayName:displayName,AppId:appId,ObjectId:id}" --output table`,
        `Step 2: Diagnose - Search for service principal by application ID:\n   az ad sp show --id <app-id> --query "{DisplayName:displayName,AppId:appId,ObjectId:id}" --output table`,
        `Step 3: Diagnose - Search for service principal by display name:\n   az ad sp list --filter "displayName eq '<name>'" --query "[].{DisplayName:displayName,AppId:appId}" --output table`,
        `Step 4: Fix - If identifier is wrong, use the correct service principal ID or application ID from the list. Verify GUID format.`,
        `Step 5: Fix - If service principal doesn't exist, create it from the application registration:\n   az ad sp create --id <app-id>`,
        `Step 6: Fix - If service principal was deleted, create a new one from the application. Deleted service principals can't be restored directly—you must recreate them.`,
        `Step 7: Verify - After creating the service principal, retry your operation. It should succeed instead of returning AADServicePrincipalNotFound.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Azure AD Service Principal Lookup and Creation',
          code: `# This script helps diagnose AADServicePrincipalNotFound by finding and creating service principals

# Step 1: Set application ID (replace with your application ID)
APP_ID="12345678-1234-1234-1234-123456789012"
echo "Checking service principal for application: \${APP_ID}"

# Step 2: Try to get service principal by application ID
echo "Searching for service principal by application ID..."
if az ad sp show \\
  --id \${APP_ID} \\
  --query "{DisplayName:displayName,AppId:appId,ObjectId:id}" \\
  --output table 2>&1; then
  echo "Service principal found by application ID"
else
  echo "Service principal not found by application ID"
  echo "The service principal may not have been created from the application"
fi

# Step 3: List all service principals to see available principals
echo "Listing all service principals in tenant..."
az ad sp list \\
  --query "[].{DisplayName:displayName,AppId:appId,ObjectId:id}" \\
  --output table | head -20

# Step 4: Search service principal by display name
DISPLAY_NAME="My Service Principal"
echo "Searching for service principal by display name: \${DISPLAY_NAME}..."
az ad sp list \\
  --filter "displayName eq '\${DISPLAY_NAME}'" \\
  --query "[].{DisplayName:displayName,AppId:appId,ObjectId:id}" \\
  --output table

# Step 5: Get service principal by object ID (if you have it)
OBJECT_ID="12345678-1234-1234-1234-123456789012"
echo "Searching for service principal by object ID: \${OBJECT_ID}..."
if az ad sp show \\
  --id \${OBJECT_ID} \\
  --query "{DisplayName:displayName,AppId:appId,ObjectId:id}" \\
  --output table 2>&1; then
  echo "Service principal found by object ID"
else
  echo "Service principal not found by object ID"
fi

# Step 6: Check if application exists (service principal is created from application)
echo "Checking if application exists..."
if az ad app show --id \${APP_ID} &>/dev/null; then
  echo "Application exists"
  echo "Creating service principal from application..."
  
  # Create service principal from application
  if az ad sp create --id \${APP_ID} 2>&1; then
    echo "Service principal created successfully"
    
    # Get the newly created service principal
    az ad sp show \\
      --id \${APP_ID} \\
      --query "{DisplayName:displayName,AppId:appId,ObjectId:id}" \\
      --output table
  else
    echo "ERROR: Failed to create service principal"
    echo "The service principal may already exist or there was an error"
  fi
else
  echo "WARNING: Application not found"
  echo "You must create the application registration first before creating a service principal"
fi

# Step 7: Verify service principal exists
if az ad sp show --id \${APP_ID} &>/dev/null; then
  echo "Service principal exists and is accessible"
  
  # Get service principal role assignments
  echo "Getting service principal role assignments..."
  az role assignment list \\
    --assignee \${APP_ID} \\
    --query "[].{Role:roleDefinitionName,Scope:scope}" \\
    --output table
else
  echo "Service principal still not found"
  echo "You may need to create it manually or check application registration"`,
        },
      ],
      relatedCodes: ['ResourceNotFound', 'AADApplicationNotFound'],
      provider: 'azure',
    },
};