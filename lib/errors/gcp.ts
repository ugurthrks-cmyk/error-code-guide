import type { ErrorCode } from './types';

export const gcpErrors: Record<string, ErrorCode> = {
    'PERMISSION_DENIED': {
      code: 'PERMISSION_DENIED',
      name: 'Permission Denied: IAM Authorization Failure',
      description: `Hitting PERMISSION_DENIED means your authenticated identity got past login but lacks the IAM role or permission GCP requires for this operation. This server-side authorization failure happens in GCP's control plane—your credentials are valid, but GCP evaluated your request and blocked it. You'll see this most often in Compute Engine VM operations, but it also surfaces in Cloud SQL database management, GKE cluster operations, and BigQuery dataset access. IAM role assignments can take 30-60 seconds to propagate, so recent grants might not be active yet.`,
      metaDescription: 'Struggling with PERMISSION_DENIED? Diagnose missing IAM roles, check resource-level permissions, and grant the right roles at project or resource scope.',
      causes: [
        `Missing IAM Role: Your identity doesn't have a required IAM role at the project, folder, or organization level. IAM role assignments can take 30-60 seconds to propagate across GCP's systems.`,
        `Resource-Level Permission Missing: Some operations require permissions at the resource level (e.g., specific Compute Engine instance, Cloud SQL database, GKE cluster) in addition to project-level roles. Resource-level bindings take precedence over project-level bindings.`,
        `Service Account Lacks Role: The service account your application uses doesn't have the IAM role needed for the operation. Service accounts need explicit role assignments—they don't inherit permissions from the user who created them.`,
        `Organization Policy Denial: Organization policies can explicitly deny operations even if IAM permissions allow them. Policies are evaluated after IAM but can override permissions.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check your IAM role assignments at the project level:\n   gcloud projects get-iam-policy PROJECT_ID --flatten="bindings[].members" --filter="bindings.members:YOUR_IDENTITY" --format="table(bindings.role)"`,
        `Step 2: Diagnose - If the operation requires resource-level permissions (e.g., Compute Engine instance, Cloud SQL database), check resource-level IAM:\n   gcloud compute instances get-iam-policy INSTANCE_NAME --zone ZONE --project PROJECT_ID\n   Or for Cloud SQL: gcloud sql instances get-iam-policy INSTANCE_NAME --project PROJECT_ID`,
        `Step 3: Fix - Grant the missing IAM role at the appropriate level:\n   gcloud projects add-iam-policy-binding PROJECT_ID --member="user:EMAIL" --role="roles/ROLE_NAME"\n   For service accounts: gcloud projects add-iam-policy-binding PROJECT_ID --member="serviceAccount:SERVICE_ACCOUNT@PROJECT_ID.iam.gserviceaccount.com" --role="roles/ROLE_NAME"`,
        `Step 4: Verify - Wait 30-60 seconds for IAM propagation, then retry your operation. If it still fails, check organization policies: gcloud resource-manager org-policies list --project PROJECT_ID`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'IAM Permission Diagnosis and Fix',
          code: `# This script helps diagnose and fix PERMISSION_DENIED errors

# Step 1: Check your current IAM roles at project level
# Replace PROJECT_ID with your GCP project ID
PROJECT_ID="my-project"
IDENTITY="user:example@example.com"

echo "Checking project-level IAM roles..."
gcloud projects get-iam-policy \$PROJECT_ID \\
  --flatten="bindings[].members" \\
  --filter="bindings.members:\$IDENTITY" \\
  --format="table(bindings.role)"

# Step 2: Check resource-level permissions (example: Compute Engine instance)
INSTANCE_NAME="my-instance"
ZONE="us-central1-a"
echo "Checking instance-level IAM policies..."
gcloud compute instances get-iam-policy \$INSTANCE_NAME \\
  --zone \$ZONE \\
  --project \$PROJECT_ID

# Step 3: Grant missing role (example: Compute Instance Admin)
# Replace ROLE_NAME with the required role (e.g., roles/compute.instanceAdmin)
ROLE_NAME="roles/compute.instanceAdmin"
echo "Granting role \$ROLE_NAME..."
gcloud projects add-iam-policy-binding \$PROJECT_ID \\
  --member="\$IDENTITY" \\
  --role="\$ROLE_NAME"

# Step 4: Wait for IAM propagation (30-60 seconds)
echo "Waiting 60 seconds for IAM propagation..."
sleep 60

# Step 5: Verify access
echo "Verifying access..."
gcloud compute instances list --project \$PROJECT_ID`,
        },
      ],
      relatedCodes: ['UNAUTHENTICATED', 'RESOURCE_EXHAUSTED'],
      provider: 'gcp',
    },
    'UNAUTHENTICATED': {
      code: 'UNAUTHENTICATED',
      name: 'Unauthenticated: Missing or Invalid Credentials',
      description: `UNAUTHENTICATED means GCP can't validate your credentials—either your request has no auth credentials, your service account key is expired or revoked, or the GOOGLE_APPLICATION_CREDENTIALS environment variable isn't set. This client-side error happens before GCP even checks permissions. Most common in Compute Engine API calls, but also appears in Cloud SQL database connections, GKE cluster API access, and BigQuery query execution. OAuth tokens expire after about an hour, while service account keys don't expire by default unless revoked.`,
      metaDescription: 'Debug UNAUTHENTICATED errors. Verify GOOGLE_APPLICATION_CREDENTIALS, check token expiration, and regenerate service account keys if revoked.',
      causes: [
        `Missing Credentials: No authentication credentials are provided in the request. Your application isn't configured with credentials, or the GOOGLE_APPLICATION_CREDENTIALS environment variable isn't set.`,
        `Expired OAuth Token: OAuth tokens expire after a set duration (typically 1 hour). Service account keys don't expire by default, but OAuth tokens from user authentication do. This is transient—refreshing credentials fixes it.`,
        `Invalid Service Account Key: The service account key file is corrupted, malformed, or doesn't match the service account. Key files must be valid JSON with correct structure.`,
        `Project ID Mismatch: The project ID in your request doesn't match the project associated with your credentials. Credentials are project-specific, and using the wrong project ID causes authentication to fail.`,
        `Revoked Service Account Key: The service account key was revoked in GCP (via Console or gcloud), but your application still uses the old key file.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check if credentials are configured:\n   gcloud auth list`,
        `Step 2: Diagnose - Check the GOOGLE_APPLICATION_CREDENTIALS environment variable:\n   echo \$GOOGLE_APPLICATION_CREDENTIALS`,
        `Step 3: Fix - Set up authentication. For user credentials:\n   gcloud auth application-default login\n   For service account key:\n   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"`,
        `Step 4: Fix - If the key is invalid or revoked, regenerate it:\n   gcloud iam service-accounts keys create KEY_FILE.json --iam-account=SERVICE_ACCOUNT@PROJECT_ID.iam.gserviceaccount.com`,
        `Step 5: Verify - Test authentication works:\n   gcloud projects list`,
        `Step 6: Fix - If project ID is wrong, set the correct project:\n   gcloud config set project PROJECT_ID`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Authentication Setup and Verification',
          code: `# This script helps diagnose and fix UNAUTHENTICATED errors

# Step 1: Check current active credentials
echo "Checking active credentials..."
gcloud auth list

# Step 2: Check GOOGLE_APPLICATION_CREDENTIALS environment variable
echo "Checking GOOGLE_APPLICATION_CREDENTIALS..."
echo "Current value: \$GOOGLE_APPLICATION_CREDENTIALS"

# Step 3: Set up application default credentials (for user authentication)
# This prompts you to authenticate via browser
echo "Setting up application default credentials..."
gcloud auth application-default login

# Alternative: Use service account key file
# Replace /path/to/key.json with your service account key file path
# export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"

# Step 4: Verify authentication works by listing projects
echo "Verifying authentication..."
gcloud projects list

# Step 5: Check current project configuration
echo "Current project:"
gcloud config get-value project

# Step 6: If using service account and key is invalid, regenerate it
# Replace SERVICE_ACCOUNT@PROJECT_ID.iam.gserviceaccount.com with your service account email
# SERVICE_ACCOUNT="my-sa@my-project.iam.gserviceaccount.com"
# gcloud iam service-accounts keys create new-key.json --iam-account=\$SERVICE_ACCOUNT`,
        },
      ],
      relatedCodes: ['PERMISSION_DENIED', 'INVALID_ARGUMENT'],
      provider: 'gcp',
    },
    'NOT_FOUND': {
      code: 'NOT_FOUND',
      name: 'Not Found: Resource Does Not Exist',
      description: `Seeing NOT_FOUND tells you GCP couldn't locate the resource—wrong resource name, ID, or path; the resource was deleted; or you're querying the wrong project, region, or zone. This client-side error happens during resource lookup in the control plane. Resource identifiers are case-sensitive and must match exactly. Most common in Compute Engine when referencing VMs, disks, or networks, but also surfaces in Cloud SQL database instances, GKE clusters and node pools, and BigQuery datasets and tables. Some services support soft-delete with recovery windows, but timing varies.`,
      metaDescription: 'Locate missing GCP resources. Verify resource names are exact, check project/region/zone context, and search across zones to find moved or renamed resources.',
      causes: [
        `Incorrect Resource Identifier: The resource name, ID, or path contains typos or doesn't match what's stored in GCP. Resource identifiers must match exactly—case-sensitive and including special characters.`,
        `Resource Deleted: The resource was deleted from GCP. Deleted resources aren't accessible via standard queries. Some resources (like Cloud SQL databases) support soft-delete with recovery windows, but timing varies by service.`,
        `Wrong Project Context: The resource exists in a different project than the one you're querying. GCP queries resources within the specified project context, and cross-project access requires explicit configuration.`,
        `Wrong Region or Zone: Some resources are region or zone-specific. Querying a Compute Engine instance in the wrong zone, or a Cloud SQL instance in the wrong region, returns NOT_FOUND even if the resource exists elsewhere.`,
      ],
      solutions: [
        `Step 1: Diagnose - List resources to find the correct identifier:\n   gcloud compute instances list --project PROJECT_ID\n   Or for Cloud SQL: gcloud sql instances list --project PROJECT_ID`,
        `Step 2: Diagnose - Verify your project context:\n   gcloud config get-value project`,
        `Step 3: Diagnose - Check if the resource exists in a different project:\n   gcloud projects list\n   Then query each project with: gcloud compute instances list --project OTHER_PROJECT_ID`,
        `Step 4: Diagnose - For Compute Engine, check if the resource exists in a different zone:\n   gcloud compute instances list --project PROJECT_ID --zones=ZONE1,ZONE2`,
        `Step 5: Fix - Use the correct resource identifier, project ID, or region/zone. For deleted resources, restore from snapshot if available:\n   gcloud compute disks create restored-disk --source-snapshot SNAPSHOT_NAME --zone ZONE`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Resource Lookup and Verification',
          code: `# This script helps diagnose NOT_FOUND errors by finding the correct resource

PROJECT_ID="my-project"

# Step 1: List all resources of the type you're looking for
# Example: List Compute Engine instances
echo "Listing Compute Engine instances..."
gcloud compute instances list --project \$PROJECT_ID

# Example: List Cloud SQL instances
# echo "Listing Cloud SQL instances..."
# gcloud sql instances list --project \$PROJECT_ID

# Step 2: Check current project context
echo "Current project:"
gcloud config get-value project

# Step 3: Describe a specific resource to verify it exists
# Replace INSTANCE_NAME and ZONE with your values
INSTANCE_NAME="my-instance"
ZONE="us-central1-a"
echo "Describing instance \$INSTANCE_NAME in zone \$ZONE..."
gcloud compute instances describe \$INSTANCE_NAME \\
  --zone \$ZONE \\
  --project \$PROJECT_ID

# Step 4: If resource not found, check other zones
echo "Checking other zones..."
gcloud compute instances list --project \$PROJECT_ID --zones=us-central1-a,us-central1-b,us-east1-a

# Step 5: Check if resource exists in different projects
echo "Listing all projects..."
gcloud projects list
# Then check each project:
# gcloud compute instances list --project OTHER_PROJECT_ID`,
        },
      ],
      relatedCodes: ['INVALID_ARGUMENT', 'PERMISSION_DENIED'],
      provider: 'gcp',
    },
    'ALREADY_EXISTS': {
      code: 'ALREADY_EXISTS',
      name: 'Already Exists: Resource Name Conflict',
      description: `ALREADY_EXISTS hits when you're trying to create a resource with a name that's already taken in the same project and region/zone scope. This client-side error means GCP enforces name uniqueness—your chosen name conflicts with an existing resource. Most common in Compute Engine when creating VMs, disks, or networks, but also appears in Cloud SQL database instances, GKE cluster names, and BigQuery dataset names. Resource names are scoped per zone for Compute Engine, per region for Cloud SQL, and per project for GKE clusters. Recently deleted resources may still reserve names during deletion grace periods.`,
      metaDescription: 'Resolve ALREADY_EXISTS conflicts. Check if the resource exists, wait for deletion to complete, or generate unique names with timestamps or UUIDs.',
      causes: [
        `Resource Name Collision: A resource with that exact name already exists in the same project and region/zone. Resource names must be unique within their scope—Compute Engine instances are scoped per zone, Cloud SQL instances per region, GKE clusters per project.`,
        `Incomplete Deletion: A resource was recently deleted but hasn't been fully removed from GCP's namespace. Some resources (like Cloud SQL databases) have deletion grace periods. The name remains reserved until deletion completes.`,
        `Duplicate Creation Attempt: Multiple operations try to create the same resource simultaneously. GCP processes one creation successfully, and subsequent attempts fail with ALREADY_EXISTS.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check if the resource exists:\n   gcloud compute instances describe INSTANCE_NAME --zone ZONE --project PROJECT_ID\n   Or for Cloud SQL: gcloud sql instances describe INSTANCE_NAME --project PROJECT_ID`,
        `Step 2: Diagnose - Check for recent deletion operations:\n   gcloud compute operations list --filter="operationType:delete AND status:RUNNING" --project PROJECT_ID`,
        `Step 3: Fix - If the resource exists and you want to replace it, delete it first:\n   gcloud compute instances delete INSTANCE_NAME --zone ZONE --project PROJECT_ID`,
        `Step 4: Fix - Use a unique resource name. Generate unique names with timestamps:\n   INSTANCE_NAME="my-instance-\$(date +%s)"`,
        `Step 5: Verify - Wait for deletion to complete (if applicable), then retry creation with the unique name.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Duplicate Resource Handling',
          code: `# This script helps handle ALREADY_EXISTS errors by checking and deleting existing resources

PROJECT_ID="my-project"
INSTANCE_NAME="my-instance"
ZONE="us-central1-a"

# Step 1: Check if resource exists
echo "Checking if instance exists..."
if gcloud compute instances describe \$INSTANCE_NAME --zone \$ZONE --project \$PROJECT_ID &>/dev/null; then
  echo "Instance \$INSTANCE_NAME exists in zone \$ZONE"
  
  # Step 2: Delete the existing instance if you want to replace it
  echo "Deleting existing instance..."
  gcloud compute instances delete \$INSTANCE_NAME --zone \$ZONE --project \$PROJECT_ID --quiet
  
  # Step 3: Wait for deletion to complete
  echo "Waiting for deletion to complete..."
  # Get the latest delete operation
  OPERATION_ID=\$(gcloud compute operations list \\
    --filter="operationType:delete AND targetLink:*instances/\$INSTANCE_NAME" \\
    --format="value(name)" \\
    --limit=1 \\
    --project \$PROJECT_ID)
  
  if [ ! -z "\$OPERATION_ID" ]; then
    gcloud compute operations wait \$OPERATION_ID --zone \$ZONE --project \$PROJECT_ID
  fi
else
  echo "Instance does not exist"
fi

# Step 4: Create with unique name (using timestamp)
UNIQUE_NAME="\$INSTANCE_NAME-\$(date +%s)"
echo "Creating instance with unique name: \$UNIQUE_NAME"
gcloud compute instances create \$UNIQUE_NAME \\
  --zone \$ZONE \\
  --machine-type n1-standard-1 \\
  --project \$PROJECT_ID`,
        },
      ],
      relatedCodes: ['INVALID_ARGUMENT', 'FAILED_PRECONDITION'],
      provider: 'gcp',
    },
    'INVALID_ARGUMENT': {
      code: 'INVALID_ARGUMENT',
      name: 'Invalid Argument: Parameter Validation Failure',
      description: `INVALID_ARGUMENT means your request parameters failed GCP's validation—missing required fields, wrong data types (string instead of integer), or values that break constraints. This client-side error happens in the control plane before operations start. Most common in Compute Engine when using invalid zones, unsupported machine types, or disk size violations, but also surfaces in Cloud SQL with invalid database versions or regions, GKE with malformed node pool configs, and BigQuery with SQL syntax errors or schema mismatches. GCP validates parameter types strictly—passing "123" as a string when an integer is required will fail.`,
      metaDescription: 'Correct INVALID_ARGUMENT errors. Validate required parameters, check data types match API expectations, and verify zones, machine types, and database versions exist.',
      causes: [
        `Missing Required Parameter: A required parameter is not provided in the request. API operations require specific parameters (e.g., zone for Compute Engine, region for Cloud SQL, cluster name for GKE).`,
        `Parameter Type Mismatch: A parameter has the wrong data type (e.g., string instead of integer, array instead of object). GCP validates parameter types strictly—passing "123" as a string when an integer is required will fail.`,
        `Value Constraint Violation: A parameter value violates allowed constraints (e.g., invalid enum value like machine type, invalid region/zone, invalid database version). Constraints vary by parameter and service.`,
        `Invalid Format: Some services require specific parameter formats (e.g., date formats, GUID formats, resource paths). Format requirements vary by service—Cloud SQL uses different date formats than Compute Engine.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check the error message for the specific parameter that failed validation. GCP error messages typically identify the problematic parameter and expected format.`,
        `Step 2: Diagnose - Review API documentation for required parameters and their types. For Compute Engine, check available zones and machine types:\n   gcloud compute zones list\n   gcloud compute machine-types list --zones=ZONE`,
        `Step 3: Fix - Include all required parameters. Check the API reference for the operation you're performing.`,
        `Step 4: Fix - Ensure parameter types match API expectations (integers vs strings, arrays vs objects). Convert types if necessary.`,
        `Step 5: Fix - Use valid values within allowed constraints. For example, validate zones and machine types before API calls.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Parameter Validation Before API Call',
          code: `# This script validates parameters before making API calls to avoid INVALID_ARGUMENT errors

PROJECT_ID="my-project"
ZONE="us-central1-a"
MACHINE_TYPE="n1-standard-1"

# Step 1: Validate zone exists
echo "Validating zone: \$ZONE"
if ! gcloud compute zones list --filter="name=\$ZONE" --format="value(name)" | grep -q "\$ZONE"; then
  echo "ERROR: Invalid zone: \$ZONE"
  echo "Available zones:"
  gcloud compute zones list --format="table(name)"
  exit 1
fi
echo "Zone \$ZONE is valid"

# Step 2: Validate machine type exists in the zone
echo "Validating machine type: \$MACHINE_TYPE"
if ! gcloud compute machine-types list --filter="name=\$MACHINE_TYPE AND zone:\$ZONE" --format="value(name)" | grep -q "\$MACHINE_TYPE"; then
  echo "ERROR: Invalid machine type: \$MACHINE_TYPE for zone \$ZONE"
  echo "Available machine types in \$ZONE:"
  gcloud compute machine-types list --filter="zone:\$ZONE" --format="table(name)"
  exit 1
fi
echo "Machine type \$MACHINE_TYPE is valid for zone \$ZONE"

# Step 3: Create instance with validated parameters
echo "Creating instance with validated parameters..."
gcloud compute instances create my-instance \\
  --zone \$ZONE \\
  --machine-type \$MACHINE_TYPE \\
  --project \$PROJECT_ID

# Example for Cloud SQL: Validate database version
# DB_VERSION="POSTGRES_14"
# echo "Validating database version: \$DB_VERSION"
# if ! gcloud sql versions list --format="value(NAME)" | grep -q "\$DB_VERSION"; then
#   echo "ERROR: Invalid database version: \$DB_VERSION"
#   gcloud sql versions list
#   exit 1
# fi`,
        },
      ],
      relatedCodes: ['FAILED_PRECONDITION', 'OUT_OF_RANGE'],
      provider: 'gcp',
    },
    'FAILED_PRECONDITION': {
      code: 'FAILED_PRECONDITION',
      name: 'Failed Precondition: System State Mismatch',
      description: `FAILED_PRECONDITION means the system state blocks your operation—trying to stop an already-stopped VM, modifying a Cloud SQL database during backup, scaling a GKE cluster mid-upgrade, or querying a BigQuery table being deleted. This can be client-side (wrong resource state, missing prerequisites) or transient server-side (dependency not ready, resource locked by another operation). Most common in Compute Engine when operating on resources in wrong states, but also appears in Cloud SQL during maintenance windows, GKE during cluster operations, and BigQuery during table mutations. GCP locks resources during operations to prevent concurrent modifications.`,
      metaDescription: 'Unblock FAILED_PRECONDITION. Check resource state, wait for in-progress operations to complete, ensure prerequisites are met, and verify APIs are enabled.',
      causes: [
        `Resource State Mismatch: The resource is in a state that doesn't allow the operation. For example, stopping a VM that's already stopped, updating a Cloud SQL database that's being deleted, or modifying a GKE cluster that's upgrading.`,
        `Dependency Not Ready: Required dependencies aren't ready. For example, creating a VM when the network isn't ready, attaching a disk that's still being created, or creating a GKE node pool when the cluster is provisioning.`,
        `Prerequisite Not Met: Required prerequisites aren't met. For example, the required API isn't enabled, or required configuration (like VPC peering for Cloud SQL) isn't set up.`,
        `Resource Locked: The resource is locked by another operation. GCP locks resources during operations to prevent concurrent modifications. For example, a VM is locked during snapshot creation, or a Cloud SQL instance is locked during backup.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check the resource's current state:\n   gcloud compute instances describe INSTANCE_NAME --zone ZONE --format="get(status)"\n   Or for Cloud SQL: gcloud sql instances describe INSTANCE_NAME --format="get(state)"`,
        `Step 2: Diagnose - Check for in-progress operations that might be locking the resource:\n   gcloud compute operations list --filter="status:RUNNING AND targetLink:*instances/INSTANCE_NAME"`,
        `Step 3: Fix - Change resource state if needed. For example, start a stopped VM:\n   gcloud compute instances start INSTANCE_NAME --zone ZONE`,
        `Step 4: Fix - Wait for dependencies or in-progress operations to complete:\n   gcloud compute operations wait OPERATION_ID --zone ZONE`,
        `Step 5: Fix - Meet prerequisites. Enable required APIs:\n   gcloud services enable SERVICE_NAME`,
        `Step 6: Verify - Retry the operation after state/dependencies are ready.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Precondition Checking and State Management',
          code: `# This script checks resource state and dependencies before operations to avoid FAILED_PRECONDITION

PROJECT_ID="my-project"
INSTANCE_NAME="my-instance"
ZONE="us-central1-a"

# Step 1: Check resource current state
echo "Checking instance state..."
STATE=\$(gcloud compute instances describe \$INSTANCE_NAME \\
  --zone \$ZONE \\
  --project \$PROJECT_ID \\
  --format="value(status)")

echo "Current state: \$STATE"

# Step 2: Check for in-progress operations
echo "Checking for in-progress operations..."
OPERATIONS=\$(gcloud compute operations list \\
  --filter="status:RUNNING AND targetLink:*instances/\$INSTANCE_NAME" \\
  --format="value(name)" \\
  --project \$PROJECT_ID)

if [ ! -z "\$OPERATIONS" ]; then
  echo "Found in-progress operations. Waiting for them to complete..."
  for OP in \$OPERATIONS; do
    gcloud compute operations wait \$OP --zone \$ZONE --project \$PROJECT_ID
  done
fi

# Step 3: If state doesn't allow operation, change it
# Example: Start instance if it's stopped and we need it running
if [ "\$STATE" != "RUNNING" ]; then
  echo "Instance is \$STATE, starting..."
  gcloud compute instances start \$INSTANCE_NAME --zone \$ZONE --project \$PROJECT_ID
  echo "Waiting for instance to be RUNNING..."
  gcloud compute instances wait-until-running \$INSTANCE_NAME --zone \$ZONE --project \$PROJECT_ID
fi

# Step 4: Verify prerequisites (example: check if API is enabled)
API_NAME="compute.googleapis.com"
echo "Checking if API \$API_NAME is enabled..."
if ! gcloud services list --enabled --filter="name:\$API_NAME" --format="value(name)" | grep -q "\$API_NAME"; then
  echo "API not enabled. Enabling..."
  gcloud services enable \$API_NAME --project \$PROJECT_ID
fi

# Step 5: Now perform your operation
echo "Preconditions met. Proceeding with operation..."`,
        },
      ],
      relatedCodes: ['INVALID_ARGUMENT', 'ABORTED'],
      provider: 'gcp',
    },
    'RESOURCE_EXHAUSTED': {
      code: 'RESOURCE_EXHAUSTED',
      name: 'Resource Exhausted: Quota or Capacity Limit Reached',
      description: `RESOURCE_EXHAUSTED hits when you've maxed out quotas (project or regional limits), hit a temporary capacity stockout in that zone, or exhausted disk space. This can be client-side (you've used all your quota) or server-side (GCP temporarily lacks capacity). Most common in Compute Engine when you've hit VM instance quotas, disk quotas, or regional capacity limits, but also appears in Cloud SQL instance and storage quotas, GKE cluster and node quotas, and BigQuery query and storage quotas. Regional stockouts are transient—try different zones or retry later. Quota exhaustion is persistent until you free resources or request increases.`,
      metaDescription: 'Overcome RESOURCE_EXHAUSTED. Check quota usage, delete unused resources to free quota, try different zones for stockouts, or request quota increases via Cloud Console.',
      causes: [
        `Project Quota Reached: You've exceeded the maximum allowed quota for a resource type (e.g., VM instances, disks, Cloud SQL instances, GKE clusters). Quotas are enforced per project and per region. This is persistent—you must free quota or request an increase.`,
        `Regional Capacity Unavailable (Stockout): GCP doesn't have physical resources available in that zone or region temporarily. This is transient—try a different zone or region, or retry later.`,
        `Disk Space Exhausted: The storage system is out of space. For Compute Engine, this affects disk creation and snapshots. For Cloud SQL, this affects database storage. This is persistent—you must free up space or increase capacity.`,
        `API Rate Limit Exceeded: You've exceeded the rate limit or quota for API requests. Rate limits are enforced per API and per project. This is transient—wait and retry with rate limiting.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check quota usage to see which quota is exhausted:\n   gcloud compute project-info describe --project PROJECT_ID --format="table(quotas.metric,quotas.limit,quotas.usage)"`,
        `Step 2: Diagnose - Check specific quota (e.g., VM instances):\n   gcloud compute project-info describe --project PROJECT_ID --format="get(quotas[metric=INSTANCES].limit,quotas[metric=INSTANCES].usage)"`,
        `Step 3: Fix - Free quota by deleting unused resources:\n   gcloud compute instances list --filter="status:TERMINATED" --format="value(name,zone)" | while read name zone; do gcloud compute instances delete $name --zone $zone --quiet; done`,
        `Step 4: Fix - If quota is fine, try a different zone or region (for stockout issues):\n   gcloud compute zones list\n   Then retry creation in a different zone.`,
        `Step 5: Fix - For disk space exhaustion, delete unused disks or snapshots:\n   gcloud compute disks list --filter="status:UNATTACHED"`,
        `Step 6: Fix - Request quota increase via Cloud Console: IAM & Admin > Quotas (note: requires approval, not immediate).`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Quota Diagnosis and Resource Cleanup',
          code: `# This script helps diagnose and fix RESOURCE_EXHAUSTED errors

PROJECT_ID="my-project"

# Step 1: Check all quota usage
echo "Checking quota usage..."
gcloud compute project-info describe \\
  --project \$PROJECT_ID \\
  --format="table(quotas.metric,quotas.limit,quotas.usage)"

# Step 2: Check specific quota (example: VM instances)
echo "Checking VM instances quota..."
gcloud compute project-info describe \\
  --project \$PROJECT_ID \\
  --format="get(quotas[metric=INSTANCES].limit,quotas[metric=INSTANCES].usage)" | \\
  jq -r '.quotas[] | select(.metric == "INSTANCES") | "Limit: \\(.limit), Usage: \\(.usage)"'

# Step 3: List and delete unused resources to free quota
echo "Checking for terminated instances..."
TERMINATED_INSTANCES=\$(gcloud compute instances list \\
  --filter="status:TERMINATED" \\
  --format="value(name,zone)" \\
  --project \$PROJECT_ID)

if [ ! -z "\$TERMINATED_INSTANCES" ]; then
  echo "Found terminated instances. Deleting to free quota..."
  echo "\$TERMINATED_INSTANCES" | while read name zone; do
    echo "Deleting instance \$name in zone \$zone..."
    gcloud compute instances delete \$name --zone \$zone --quiet --project \$PROJECT_ID
  done
else
  echo "No terminated instances found"
fi

# Step 4: Check disk usage
echo "Checking disk usage..."
gcloud compute disks list \\
  --format="table(name,sizeGb,status)" \\
  --project \$PROJECT_ID

# Step 5: List unattached disks (can be deleted to free quota)
echo "Checking for unattached disks..."
UNATTACHED_DISKS=\$(gcloud compute disks list \\
  --filter="status:UNATTACHED" \\
  --format="value(name,zone)" \\
  --project \$PROJECT_ID)

if [ ! -z "\$UNATTACHED_DISKS" ]; then
  echo "Found unattached disks:"
  echo "\$UNATTACHED_DISKS"
  # Uncomment to delete unattached disks:
  # echo "\$UNATTACHED_DISKS" | while read name zone; do
  #   gcloud compute disks delete \$name --zone \$zone --quiet --project \$PROJECT_ID
  # done
fi

# Step 6: If quota is fine, try different zones (for stockout)
echo "Listing available zones..."
gcloud compute zones list --format="table(name,status)"`,
        },
      ],
      relatedCodes: ['QUOTA_EXCEEDED', 'OUT_OF_RANGE'],
      provider: 'gcp',
    },
    'OUT_OF_RANGE': {
      code: 'OUT_OF_RANGE',
      name: 'Out of Range: Parameter Value Violation',
      description: `OUT_OF_RANGE means your parameter value breaches GCP's allowed bounds—disk size exceeds maximum (64 TB) or is below minimum (10 GB), port numbers outside 1-65535, or array indices beyond valid bounds. This client-side error happens during parameter validation in the control plane. Most common in Compute Engine with disk sizes and port numbers, but also surfaces in Cloud SQL with storage size limits and backup retention days, GKE with node pool and cluster size constraints, and BigQuery with query size limits. Range limits vary by service and resource type—standard disks have different limits than SSDs, and Cloud SQL tier limits differ by instance size.`,
      metaDescription: 'Fix OUT_OF_RANGE violations. Validate parameter values against service limits, check disk type ranges, verify port numbers are 1-65535, and ensure array indices are valid.',
      causes: [
        `Value Range Violation: A parameter value exceeds the maximum or is below the minimum allowed value. For example, disk sizes have minimum (10 GB) and maximum (64 TB) limits that vary by disk type and zone. Cloud SQL storage sizes have different limits by instance tier.`,
        `Index Out of Bounds: Array or list indices are outside valid bounds. For example, accessing a list item that doesn't exist, or using an index greater than the array size.`,
        `Invalid Range Specification: A range parameter (e.g., port ranges, IP ranges, CIDR blocks) is malformed or outside allowed values. For example, port numbers must be 1-65535, and CIDR blocks must be valid network ranges.`,
        `Service-Specific Limits: Range limits vary by service and resource type. Disk size limits vary by disk type (standard, SSD, local SSD) and zone. Cloud SQL storage limits vary by instance tier (db-f1-micro has different limits than db-n1-standard).`,
      ],
      solutions: [
        `Step 1: Diagnose - Check the error message for the specific parameter and value that's out of range. GCP error messages typically identify the parameter and the valid range.`,
        `Step 2: Diagnose - Query valid ranges for the parameter. For disk sizes:\n   gcloud compute disk-types list --filter="zone:ZONE" --format="table(name,validDiskSize)"`,
        `Step 3: Fix - Use a value within the allowed range. Check API documentation for minimum and maximum limits.`,
        `Step 4: Fix - For disk sizes, use a valid size within the disk type's range. For Cloud SQL, check storage size limits for your instance tier.`,
        `Step 5: Verify - Retry the operation with a value within the valid range.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Range Validation',
          code: `# This script validates parameter values are within allowed ranges to avoid OUT_OF_RANGE errors

ZONE="us-central1-a"
PROJECT_ID="my-project"

# Step 1: Define your desired disk size (example)
DESIRED_DISK_SIZE=5  # GB

# Step 2: Check valid disk size ranges for the zone
echo "Checking valid disk size ranges for zone \$ZONE..."
DISK_TYPES=\$(gcloud compute disk-types list \\
  --filter="zone:\$ZONE" \\
  --format="table(name,validDiskSize.minRangeGb,validDiskSize.maxRangeGb)" \\
  --project \$PROJECT_ID)

echo "\$DISK_TYPES"

# Step 3: Validate disk size against minimum (example: 10 GB minimum for most disk types)
MIN_DISK_SIZE=10
MAX_DISK_SIZE=65536  # 64 TB in GB

if [ \$DESIRED_DISK_SIZE -lt \$MIN_DISK_SIZE ]; then
  echo "ERROR: Disk size \$DESIRED_DISK_SIZE GB is below minimum \$MIN_DISK_SIZE GB"
  exit 1
fi

if [ \$DESIRED_DISK_SIZE -gt \$MAX_DISK_SIZE ]; then
  echo "ERROR: Disk size \$DESIRED_DISK_SIZE GB exceeds maximum \$MAX_DISK_SIZE GB"
  exit 1
fi

echo "Disk size \$DESIRED_DISK_SIZE GB is within valid range"

# Step 4: Example for port validation (must be 1-65535)
PORT=8080
if [ \$PORT -lt 1 ] || [ \$PORT -gt 65535 ]; then
  echo "ERROR: Port \$PORT is out of range (1-65535)"
  exit 1
fi

# Step 5: Create resource with validated parameter
echo "Creating disk with validated size..."
gcloud compute disks create my-disk \\
  --size \$DESIRED_DISK_SIZE \\
  --zone \$ZONE \\
  --project \$PROJECT_ID`,
        },
      ],
      relatedCodes: ['INVALID_ARGUMENT', 'FAILED_PRECONDITION'],
      provider: 'gcp',
    },
    'UNIMPLEMENTED': {
      code: 'UNIMPLEMENTED',
      name: 'Unimplemented: Operation Not Supported',
      description: `UNIMPLEMENTED surfaces when the operation you're calling doesn't exist, isn't enabled for your project, or isn't available in your API version, region, or service tier. This client-side error happens during operation validation in the control plane. Most common in Compute Engine when using alpha/beta features without the right API version, or when machine types aren't available in that zone. Also appears in Cloud SQL with unsupported database engine versions or regional features, GKE with unavailable Kubernetes versions or regional capabilities, and BigQuery with SQL functions not supported in your region. Alpha and beta features require gcloud alpha or gcloud beta commands, not the stable API.`,
      metaDescription: 'Resolve UNIMPLEMENTED errors. Verify the API is enabled, check if the operation exists in your API version, use alpha/beta commands for experimental features, and confirm regional/tier support.',
      causes: [
        `Operation Not Supported: The requested operation doesn't exist for the service. Some operations are service-specific (e.g., Compute Engine operations don't exist in Cloud SQL), or the operation hasn't been implemented yet.`,
        `Feature Not Enabled: The feature exists but isn't enabled for your project. Some features require explicit enablement via API enablement (e.g., enabling the Compute Engine API) or feature flags.`,
        `API Version Mismatch: The operation isn't available in the API version you're using. Different API versions (v1, beta, alpha) support different operations. Alpha and beta features may not be available in the stable API.`,
        `Regional or Tier Limitation: Some features are available only in specific regions or for specific service tiers. For example, certain machine types are available only in specific zones, or Cloud SQL features vary by instance tier.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check if the API is enabled for your project:\n   gcloud services list --enabled --filter="name:SERVICE_NAME"`,
        `Step 2: Diagnose - Review API documentation to confirm the operation exists and is available for your service/region/tier.`,
        `Step 3: Fix - Enable the required API if it's not enabled:\n   gcloud services enable SERVICE_NAME`,
        `Step 4: Fix - Use the correct API version. For alpha/beta features, use gcloud alpha or gcloud beta commands instead of gcloud.`,
        `Step 5: Fix - Use a supported region/tier. Check service documentation for feature availability by region and tier.`,
        `Step 6: Verify - Retry the operation with the correct API version or in a supported region/tier.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Feature Availability Check',
          code: `# This script helps diagnose UNIMPLEMENTED errors by checking API and feature availability

PROJECT_ID="my-project"
SERVICE_NAME="compute.googleapis.com"

# Step 1: Check if the API is enabled
echo "Checking if API \$SERVICE_NAME is enabled..."
ENABLED=\$(gcloud services list \\
  --enabled \\
  --filter="name:\$SERVICE_NAME" \\
  --format="value(name)" \\
  --project \$PROJECT_ID)

if [ -z "\$ENABLED" ]; then
  echo "API \$SERVICE_NAME is not enabled"
  echo "Enabling API..."
  gcloud services enable \$SERVICE_NAME --project \$PROJECT_ID
  echo "API enabled. Please wait a few moments for it to be fully active."
else
  echo "API \$SERVICE_NAME is enabled"
fi

# Step 2: Check available API versions
echo "Checking API capabilities..."
gcloud compute instances --help | head -20

# Step 3: Check for alpha/beta features (if operation is in alpha/beta)
echo "Checking alpha features..."
gcloud alpha compute instances --help | head -20

echo "Checking beta features..."
gcloud beta compute instances --help | head -20

# Step 4: List available regions/zones (for regional feature checks)
echo "Listing available regions..."
gcloud compute regions list --format="table(name,status)"

# Step 5: Example: Check if a specific machine type is available in a zone
ZONE="us-central1-a"
MACHINE_TYPE="n1-standard-1"
echo "Checking if machine type \$MACHINE_TYPE is available in zone \$ZONE..."
AVAILABLE=\$(gcloud compute machine-types list \\
  --filter="name=\$MACHINE_TYPE AND zone:\$ZONE" \\
  --format="value(name)" \\
  --project \$PROJECT_ID)

if [ -z "\$AVAILABLE" ]; then
  echo "Machine type \$MACHINE_TYPE is not available in zone \$ZONE"
  echo "Available machine types in \$ZONE:"
  gcloud compute machine-types list --filter="zone:\$ZONE" --format="table(name)"
else
  echo "Machine type \$MACHINE_TYPE is available in zone \$ZONE"
fi`,
        },
      ],
      relatedCodes: ['INVALID_ARGUMENT', 'PERMISSION_DENIED'],
      provider: 'gcp',
    },
    'INTERNAL': {
      code: 'INTERNAL',
      name: 'Internal Error: System Failure',
      description: `INTERNAL means GCP's backend systems hit an unexpected failure—system invariants broke, indicating a platform bug or infrastructure issue, not your request. This server-side error happens in GCP's control plane or backend services. Most common in Compute Engine during VM provisioning or disk operations, but also surfaces in Cloud SQL database operations, GKE cluster management, and BigQuery query execution. Usually transient—exponential backoff retries often succeed once GCP recovers, but persistent cases require waiting for Google to fix the underlying issue.`,
      metaDescription: 'Handle INTERNAL errors. Check GCP status page, implement exponential backoff retries, and try different zones if the issue is region-specific.',
      causes: [
        `Internal System Failure: GCP's infrastructure experiences an unexpected error. System invariants are broken, causing operations to fail. This is typically transient—the system may recover automatically.`,
        `Service Bug: A bug in GCP's service code triggers an internal error. The service may be in an unexpected state. This is typically transient—retrying may work, or you may need to wait for GCP to fix the issue.`,
        `Unexpected System State: The service enters a state that wasn't anticipated by the system design. This is typically transient—retrying may succeed once the system recovers or the state is corrected.`,
        `Regional Infrastructure Issue: The error may be specific to a region or zone. Infrastructure problems in one region don't necessarily affect others.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check GCP status page for known issues:\n   Visit https://status.cloud.google.com/ and check for service outages or known issues affecting your service/region.`,
        `Step 2: Diagnose - Check if the error is consistent by retrying the operation multiple times. If it consistently fails, it may be a persistent issue.`,
        `Step 3: Fix - Implement retry logic with exponential backoff. Retry the operation with increasing delays (e.g., 1s, 2s, 4s, 8s).`,
        `Step 4: Fix - Try a different region or zone. If the error is region-specific, operations in other regions may succeed.`,
        `Step 5: Verify - If retries succeed, the issue was transient. If retries consistently fail, check the GCP status page and consider contacting GCP support.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Internal Error Retry Logic',
          code: `# This script implements retry logic with exponential backoff for INTERNAL errors

PROJECT_ID="my-project"
INSTANCE_NAME="my-instance"
ZONE="us-central1-a"
MACHINE_TYPE="n1-standard-1"

MAX_RETRIES=5
RETRY_DELAY=1

echo "Attempting to create instance with retry logic..."

for i in \$(seq 1 \$MAX_RETRIES); do
  echo "Attempt \$i of \$MAX_RETRIES..."
  
  # Attempt the operation
  if gcloud compute instances create \$INSTANCE_NAME \\
    --zone \$ZONE \\
    --machine-type \$MACHINE_TYPE \\
    --project \$PROJECT_ID 2>&1; then
    echo "Success! Instance created on attempt \$i"
    exit 0
  else
    ERROR_CODE=\$?
    
    # Check if we have retries remaining
    if [ \$i -lt \$MAX_RETRIES ]; then
      echo "Operation failed. Waiting \$RETRY_DELAY seconds before retry..."
      sleep \$RETRY_DELAY
      RETRY_DELAY=\$((RETRY_DELAY * 2))  # Exponential backoff
    else
      echo "Failed after \$MAX_RETRIES attempts"
      echo "Please check:"
      echo "  1. GCP Status page: https://status.cloud.google.com/"
      echo "  2. Try a different zone: gcloud compute zones list"
      echo "  3. Contact GCP support if the issue persists"
      exit 1
    fi
  fi
done

# Alternative: Try different zone if original zone fails
if [ \$? -ne 0 ]; then
  echo "Trying alternative zone..."
  ALTERNATIVE_ZONE="us-central1-b"
  gcloud compute instances create \$INSTANCE_NAME \\
    --zone \$ALTERNATIVE_ZONE \\
    --machine-type \$MACHINE_TYPE \\
    --project \$PROJECT_ID
fi`,
        },
      ],
      relatedCodes: ['UNAVAILABLE', 'DEADLINE_EXCEEDED'],
      provider: 'gcp',
    },
    'UNAVAILABLE': {
      code: 'UNAVAILABLE',
      name: 'Unavailable: Service Temporarily Down',
      description: `UNAVAILABLE hits when GCP's service is temporarily down—planned maintenance, traffic overload, or unplanned regional outages prevent the backend from processing requests. This server-side error means GCP's infrastructure is the problem, not your request. Most common in Compute Engine when APIs go down or regions experience outages, but also appears in Cloud SQL during connection failures, GKE when cluster APIs are unavailable, and BigQuery when query services are overloaded. Usually transient—exponential backoff retries typically succeed once service recovers, but regional outages may require switching zones.`,
      metaDescription: 'Recover from UNAVAILABLE. Check GCP status page for outages, implement exponential backoff retries, and failover to alternate zones if regional.',
      causes: [
        `Service Maintenance: GCP performs planned maintenance on service infrastructure. Maintenance is typically scheduled and announced. This is transient—waiting for maintenance to complete and retrying helps.`,
        `Service Overload: The service is experiencing high load and can't process requests. The service may throttle or temporarily reject requests. This is transient—retrying with exponential backoff helps.`,
        `Regional Outage: The service in a specific region experiences an unplanned outage. Outages may affect all resources in that region. This is transient—waiting for service restoration and retrying helps, or using a different region may work.`,
        `Service-Specific Behavior: Availability behavior varies by service. Some services recover quickly, others may take longer. Timing isn't guaranteed.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check GCP status page for known issues:\n   Visit https://status.cloud.google.com/ and check for service outages or maintenance affecting your service/region.`,
        `Step 2: Diagnose - Check if the error is consistent by retrying the operation multiple times:\n   gcloud compute instances list --project PROJECT_ID\n   If it consistently fails, it may be a persistent issue.`,
        `Step 3: Diagnose - Check if the error is region-specific by trying operations in a different region:\n   gcloud compute zones list --format="table(name,status)"\n   Then retry your operation in a different zone/region.`,
        `Step 4: Fix - Implement retry logic with exponential backoff. Retry the operation with increasing delays (e.g., 1s, 2s, 4s, 8s).`,
        `Step 5: Fix - For regional outages, try operations in a different region if possible:\n   gcloud compute instances create INSTANCE_NAME --zone DIFFERENT_ZONE --project PROJECT_ID`,
        `Step 6: Verify - If retries succeed, the issue was transient. If retries consistently fail, check the GCP status page and consider contacting GCP support.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Unavailable Service Retry Logic',
          code: `# This script implements retry logic with exponential backoff for UNAVAILABLE errors

PROJECT_ID="my-project"
MAX_RETRIES=5
RETRY_DELAY=1

# Retry function with exponential backoff
retry_with_backoff() {
  local max_attempts=\$1
  local delay=\$2
  local attempt=1
  shift 2
  local command="\$@"
  
  while [ \$attempt -le \$max_attempts ]; do
    echo "Attempt \$attempt of \$max_attempts..."
    
    if eval "\$command"; then
      echo "Success! Operation completed on attempt \$attempt"
      return 0
    fi
    
    if [ \$attempt -lt \$max_attempts ]; then
      echo "Operation failed. Waiting \$delay seconds before retry..."
      sleep \$delay
      delay=\$((delay * 2))  # Exponential backoff
      attempt=\$((attempt + 1))
    else
      echo "Failed after \$max_attempts attempts"
      echo "Please check:"
      echo "  1. GCP Status page: https://status.cloud.google.com/"
      echo "  2. Try a different zone: gcloud compute zones list"
      echo "  3. Contact GCP support if the issue persists"
      return 1
    fi
  done
}

# Usage: Retry a gcloud command
retry_with_backoff \$MAX_RETRIES \$RETRY_DELAY gcloud compute instances list --project \$PROJECT_ID`,
        },
      ],
      relatedCodes: ['INTERNAL', 'DEADLINE_EXCEEDED'],
      provider: 'gcp',
    },
    'DEADLINE_EXCEEDED': {
      code: 'DEADLINE_EXCEEDED',
      name: 'Deadline Exceeded: Operation Timeout',
      description: `DEADLINE_EXCEEDED means your operation exceeded its timeout—either your client timeout is too short for large VM creation or disk operations, or GCP's backend is slow. This can be client-side (timeout too aggressive) or server-side (backend processing delays). Most common in Compute Engine when creating large VMs or performing disk snapshots, but also surfaces in Cloud SQL during long database migrations, GKE during cluster provisioning, and BigQuery with complex long-running queries. GCP enforces timeouts to prevent indefinite hangs—operations that take longer than the allowed duration get cancelled.`,
      metaDescription: 'Resolve DEADLINE_EXCEEDED. Increase client timeouts, use async operations for long-running tasks, and check if backend slowness is causing delays.',
      causes: [
        `Client-Side Timeout Too Short: The operation timeout is set too low for the operation's expected duration. Some operations (e.g., large VM creation, disk operations, Cloud SQL backups) take longer than default timeouts. This is persistent—you must increase the timeout.`,
        `Backend Slow Operation: The operation itself is slow due to resource size, complexity, or system load. Large operations may exceed default timeouts. This is persistent—you must optimize the operation or increase timeout.`,
        `Network Latency: Network delays prevent the operation from completing within the timeout. High latency or network issues can cause operations to time out. This can be transient—retrying with longer timeout may help.`,
        `Service-Specific Timeout Limits: Timeout behavior varies by service and operation type. Some operations have longer default timeouts than others.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check current timeout settings:\n   gcloud config get-value compute/timeout`,
        `Step 2: Diagnose - Check if timeout is client-side or backend by reviewing error context and timeout settings.`,
        `Step 3: Diagnose - Review how long similar operations typically take to determine if timeout is reasonable.`,
        `Step 4: Fix - Increase timeout for compute operations:\n   gcloud config set compute/timeout 600\n   For API calls, increase the timeout parameter in your client code.`,
        `Step 5: Fix - Use async operations for long-running tasks:\n   gcloud compute instances create INSTANCE_NAME --zone ZONE --machine-type MACHINE_TYPE --async --project PROJECT_ID\n   Then check operation status separately:\n   gcloud compute operations wait OPERATION_ID --zone ZONE --project PROJECT_ID`,
        `Step 6: Verify - Retry the operation with increased timeout or async mode. If it succeeds, the timeout was too short.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Timeout Management with Async Operations',
          code: `# This script demonstrates timeout management and async operations for DEADLINE_EXCEEDED errors

PROJECT_ID="my-project"
INSTANCE_NAME="my-instance"
ZONE="us-central1-a"
MACHINE_TYPE="n1-standard-1"

# Step 1: Check current timeout setting
echo "Current timeout setting:"
gcloud config get-value compute/timeout

# Step 2: Increase timeout for compute operations (600 seconds = 10 minutes)
echo "Setting timeout to 600 seconds..."
gcloud config set compute/timeout 600

# Step 3: Use async operations for long-running tasks
echo "Creating instance with async operation..."
OPERATION=\$(gcloud compute instances create \$INSTANCE_NAME \\
  --zone \$ZONE \\
  --machine-type \$MACHINE_TYPE \\
  --async \\
  --project \$PROJECT_ID)

# Step 4: Extract operation ID from the operation response
OPERATION_ID=\$(echo "\$OPERATION" | grep -oP 'operations/[^/]+' | head -1)
echo "Operation ID: \$OPERATION_ID"

# Step 5: Wait for the operation to complete
if [ ! -z "\$OPERATION_ID" ]; then
  echo "Waiting for operation to complete..."
  gcloud compute operations wait \$OPERATION_ID --zone \$ZONE --project \$PROJECT_ID
  echo "Operation completed"
else
  echo "Could not extract operation ID. Check operation status manually:"
  gcloud compute operations list --filter="status:RUNNING" --zone \$ZONE --project \$PROJECT_ID
fi`,
        },
      ],
      relatedCodes: ['UNAVAILABLE', 'INTERNAL'],
      provider: 'gcp',
    },
    'ABORTED': {
      code: 'ABORTED',
      name: 'Aborted: Concurrency Conflict',
      description: `ABORTED surfaces when GCP aborts your operation due to a concurrency conflict—another operation modified the resource between your read and write, triggering optimistic concurrency control. This server-side error happens when GCP detects state changes during concurrency validation in the control plane or backend. Most common in Compute Engine when multiple processes update VMs simultaneously, but also appears in Cloud SQL during concurrent database modifications, GKE during parallel cluster updates, and BigQuery when multiple clients modify tables at once. Usually transient—reading fresh resource state and retrying with exponential backoff typically resolves conflicts.`,
      metaDescription: 'Fix ABORTED conflicts. Read fresh resource state before modifications, implement exponential backoff retries, and serialize concurrent operations.',
      causes: [
        `Concurrent Modification: Another operation modifies the resource between your read and write operations. GCP detects the conflict and aborts your operation. This is transient—retrying with fresh state helps.`,
        `Transaction Conflict: Multiple transactions try to modify the same resource simultaneously. GCP aborts conflicting transactions. This is transient—retrying the transaction may succeed.`,
        `Optimistic Locking Failure: The resource state changed since you last read it. GCP validates state consistency and aborts operations with stale state. This is transient—reading fresh state and retrying helps.`,
        `Service-Specific Concurrency: Concurrency behavior varies by service. Some services have stronger concurrency guarantees than others.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check for concurrent operations that might be conflicting:\n   gcloud compute operations list --filter="status:RUNNING" --project PROJECT_ID`,
        `Step 2: Diagnose - Read current resource state before modifying to ensure you have fresh state:\n   gcloud compute instances describe INSTANCE_NAME --zone ZONE --project PROJECT_ID`,
        `Step 3: Diagnose - Check operation logs for concurrent modifications:\n   gcloud compute operations list --filter="targetLink:*instances/INSTANCE_NAME" --project PROJECT_ID`,
        `Step 4: Fix - Retry the operation after getting fresh resource state. Read the current resource state, then retry your modification.`,
        `Step 5: Fix - Implement retry logic that handles ABORTED errors with exponential backoff. Use exponential backoff between retries to reduce conflict probability.`,
        `Step 6: Verify - Retry the operation with fresh state and exponential backoff. If it succeeds, the conflict was resolved.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Aborted Operation Retry with Fresh State',
          code: `# This script demonstrates retry logic with fresh state for ABORTED errors

PROJECT_ID="my-project"
INSTANCE_NAME="my-instance"
ZONE="us-central1-a"
MAX_RETRIES=3
RETRY_DELAY=1

echo "Attempting to update instance with retry logic..."

for i in \$(seq 1 \$MAX_RETRIES); do
  echo "Attempt \$i of \$MAX_RETRIES..."
  
  # Step 1: Get fresh state before modifying
  echo "Reading current resource state..."
  CURRENT_STATE=\$(gcloud compute instances describe \$INSTANCE_NAME \\
    --zone \$ZONE \\
    --project \$PROJECT_ID \\
    --format="get(metadata.items[key=my-key].value)" 2>/dev/null)
  
  echo "Current state: \$CURRENT_STATE"
  
  # Step 2: Attempt the update operation
  if gcloud compute instances update \$INSTANCE_NAME \\
    --zone \$ZONE \\
    --project \$PROJECT_ID \\
    --metadata my-key=new-value 2>&1; then
    echo "Update successful on attempt \$i"
    exit 0
  else
    ERROR_CODE=\$?
    
    # Step 3: Check if we have retries remaining
    if [ \$i -lt \$MAX_RETRIES ]; then
      echo "Operation aborted. Waiting \$RETRY_DELAY seconds before retry..."
      sleep \$RETRY_DELAY
      RETRY_DELAY=\$((RETRY_DELAY * 2))  # Exponential backoff
    else
      echo "Failed after \$MAX_RETRIES attempts"
      echo "Consider:"
      echo "  1. Check for concurrent operations: gcloud compute operations list --filter='status:RUNNING'"
      echo "  2. Serialize operations or reduce concurrency"
      exit 1
    fi
  fi
done`,
        },
      ],
      relatedCodes: ['FAILED_PRECONDITION', 'INTERNAL'],
      provider: 'gcp',
    },
    'QUOTA_EXCEEDED': {
      code: 'QUOTA_EXCEEDED',
      name: 'Quota Exceeded: Resource Limit Reached',
      description: `QUOTA_EXCEEDED hits when you've maxed out your project or regional quota for a resource type—GCP's control plane enforces hard limits per project and per region. This server-side error means you've hit the ceiling for VM instances, disks, Cloud SQL instances, GKE clusters, or BigQuery query quotas. Most common in Compute Engine when you've created the maximum allowed VMs or disks, but also appears in Cloud SQL instance quotas, GKE cluster and node quotas, and BigQuery query and storage quotas. Quota exhaustion is persistent until you delete unused resources or request increases via Cloud Console—unlike RESOURCE_EXHAUSTED, this specifically indicates quota limits, not capacity stockouts.`,
      metaDescription: 'Overcome QUOTA_EXCEEDED. Check quota usage per region, delete terminated instances and unattached disks, and request quota increases via Cloud Console.',
      causes: [
        `Resource Quota Exhaustion: You've created the maximum number of resources allowed by your quota. Quotas vary by resource type and subscription tier. This is persistent—you must free quota or request an increase.`,
        `API Quota/Rate Limit Exhaustion: You've exceeded the rate limit or quota for API requests. Rate limits are enforced per API and per project. This is transient—waiting and retrying with rate limiting helps.`,
        `Regional Quota Limit: You've hit the quota limit in a specific region. Quotas are enforced per region, so you may have capacity in other regions. This is persistent—you must free quota in that region or request an increase.`,
        `Service-Specific Quota Limits: Quota limits vary by service and resource type. Some quotas reset daily, others are permanent until you request an increase.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check quota usage to see which quota is exhausted:\n   gcloud compute project-info describe --project PROJECT_ID --format="table(quotas.metric,quotas.limit,quotas.usage)"`,
        `Step 2: Diagnose - Check specific quota (e.g., VM instances):\n   gcloud compute project-info describe --project PROJECT_ID --format="get(quotas[metric=INSTANCES].limit,quotas[metric=INSTANCES].usage)"`,
        `Step 3: Diagnose - Check if quota is regional by reviewing quota details for region-specific limits.`,
        `Step 4: Fix - Free quota by deleting unused resources:\n   gcloud compute instances list --filter="status:TERMINATED" --format="value(name,zone)" --project PROJECT_ID\n   Then delete them to free quota.`,
        `Step 5: Fix - For API rate limits, implement rate limiting and exponential backoff in your client code.`,
        `Step 6: Fix - Request quota increase via Cloud Console: IAM & Admin > Quotas (note: requires approval, not immediate).`,
        `Step 7: Fix - Use a different region if regional quota is exhausted:\n   gcloud compute zones list\n   Then create resources in a region where you haven't hit the quota.`,
        `Step 8: Verify - Retry the operation after freeing quota or requesting an increase.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Quota Management and Cleanup',
          code: `# This script helps diagnose and fix QUOTA_EXCEEDED errors

PROJECT_ID="my-project"

# Step 1: Check all quota usage
echo "Checking quota usage..."
gcloud compute project-info describe \\
  --project \$PROJECT_ID \\
  --format="table(quotas.metric,quotas.limit,quotas.usage)"

# Step 2: Check specific quota (example: VM instances)
echo "Checking VM instances quota..."
gcloud compute project-info describe \\
  --project \$PROJECT_ID \\
  --format="get(quotas[metric=INSTANCES].limit,quotas[metric=INSTANCES].usage)"

# Step 3: List terminated instances that can be deleted to free quota
echo "Checking for terminated instances..."
TERMINATED_INSTANCES=\$(gcloud compute instances list \\
  --filter="status:TERMINATED" \\
  --format="value(name,zone)" \\
  --project \$PROJECT_ID)

if [ ! -z "\$TERMINATED_INSTANCES" ]; then
  echo "Found terminated instances. Deleting to free quota..."
  echo "\$TERMINATED_INSTANCES" | while read name zone; do
    echo "Deleting instance \$name in zone \$zone..."
    gcloud compute instances delete \$name --zone \$zone --quiet --project \$PROJECT_ID
  done
else
  echo "No terminated instances found"
fi

# Step 4: List unattached disks (can be deleted to free quota)
echo "Checking for unattached disks..."
UNATTACHED_DISKS=\$(gcloud compute disks list \\
  --filter="status:UNATTACHED" \\
  --format="value(name,zone)" \\
  --project \$PROJECT_ID)

if [ ! -z "\$UNATTACHED_DISKS" ]; then
  echo "Found unattached disks:"
  echo "\$UNATTACHED_DISKS"
  # Uncomment to delete unattached disks:
  # echo "\$UNATTACHED_DISKS" | while read name zone; do
  #   gcloud compute disks delete \$name --zone \$zone --quiet --project \$PROJECT_ID
  # done
fi

# Step 5: Request quota increase via Console
echo "To request quota increase:"
echo "  1. Go to Cloud Console > IAM & Admin > Quotas"
echo "  2. Select the quota you want to increase"
echo "  3. Click 'Edit Quotas' and request an increase"`,
        },
      ],
      relatedCodes: ['RESOURCE_EXHAUSTED', 'PERMISSION_DENIED'],
      provider: 'gcp',
    },
    'INVALID_STATE': {
      code: 'INVALID_STATE',
      name: 'Invalid State: Resource State Mismatch',
      description: `INVALID_STATE means the resource is in a state that blocks your operation—trying to stop an already-stopped VM, delete a resource mid-creation, or modify a Cloud SQL database during backup. This can be client-side (wrong resource state) or server-side (resource locked by another operation). Most common in Compute Engine when operating on VMs in wrong states, but also appears in Cloud SQL during maintenance windows, GKE during cluster upgrades (RECONCILING state), and BigQuery when querying tables being deleted. GCP validates resource states before operations—state machines vary by service, and some transitions require intermediate steps.`,
      metaDescription: 'Resolve INVALID_STATE errors. Check current resource state, wait for in-progress operations to complete, and follow valid state transitions per service.',
      causes: [
        `Resource State Mismatch: The resource is in a state that doesn't allow the operation. For example, stopping a VM that's already stopped, or deleting a resource that's being created. This can be persistent if the state won't change, or transient if the state will change.`,
        `Invalid State Transition: The requested state transition isn't allowed. For example, transitioning directly from TERMINATED to RUNNING without starting first. This is persistent—you must follow valid state transitions.`,
        `Resource Locked: The resource is locked by another operation. Locks prevent concurrent modifications. This is transient—waiting for the lock to release and retrying helps.`,
        `Service-Specific State Behavior: State behavior varies by service. Some services have more complex state machines than others (e.g., GKE has RECONCILING state, Cloud SQL has MAINTENANCE state).`,
      ],
      solutions: [
        `Step 1: Diagnose - Check the resource's current state:\n   gcloud compute instances describe INSTANCE_NAME --zone ZONE --format="get(status)" --project PROJECT_ID\n   Or for Cloud SQL: gcloud sql instances describe INSTANCE_NAME --format="get(state)" --project PROJECT_ID`,
        `Step 2: Diagnose - Check for in-progress operations that might be locking the resource:\n   gcloud compute operations list --filter="status:RUNNING AND targetLink:*instances/INSTANCE_NAME" --project PROJECT_ID`,
        `Step 3: Diagnose - Review API documentation for valid state transitions for your service.`,
        `Step 4: Fix - Change resource state if needed. For example, start a stopped VM:\n   gcloud compute instances start INSTANCE_NAME --zone ZONE --project PROJECT_ID`,
        `Step 5: Fix - Wait for dependencies or in-progress operations to complete:\n   gcloud compute operations wait OPERATION_ID --zone ZONE --project PROJECT_ID`,
        `Step 6: Fix - Follow valid state transitions. Check API documentation and perform intermediate state changes if needed.`,
        `Step 7: Verify - Retry the operation after state/dependencies are ready.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'State Management and Verification',
          code: `# This script checks resource state and dependencies before operations to avoid INVALID_STATE errors

PROJECT_ID="my-project"
INSTANCE_NAME="my-instance"
ZONE="us-central1-a"

# Step 1: Check resource current state
echo "Checking instance state..."
STATE=\$(gcloud compute instances describe \$INSTANCE_NAME \\
  --zone \$ZONE \\
  --project \$PROJECT_ID \\
  --format="value(status)")

echo "Current state: \$STATE"

# Step 2: Check for in-progress operations
echo "Checking for in-progress operations..."
OPERATIONS=\$(gcloud compute operations list \\
  --filter="status:RUNNING AND targetLink:*instances/\$INSTANCE_NAME" \\
  --format="value(name)" \\
  --project \$PROJECT_ID)

if [ ! -z "\$OPERATIONS" ]; then
  echo "Found in-progress operations. Waiting for them to complete..."
  for OP in \$OPERATIONS; do
    echo "Waiting for operation \$OP..."
    gcloud compute operations wait \$OP --zone \$ZONE --project \$PROJECT_ID
  done
fi

# Step 3: If state doesn't allow operation, change it
# Example: Start instance if it's stopped and we need it running
if [ "\$STATE" != "RUNNING" ]; then
  echo "Instance is \$STATE, starting..."
  gcloud compute instances start \$INSTANCE_NAME --zone \$ZONE --project \$PROJECT_ID
  echo "Waiting for instance to be RUNNING..."
  gcloud compute instances wait-until-running \$INSTANCE_NAME --zone \$ZONE --project \$PROJECT_ID
  echo "Instance is now RUNNING"
fi

# Step 4: Now perform your operation
echo "Preconditions met. Proceeding with operation..."`,
        },
      ],
      relatedCodes: ['FAILED_PRECONDITION', 'ABORTED'],
      provider: 'gcp',
    },
    'CANCELLED': {
      code: 'CANCELLED',
      name: 'Cancelled: Operation Terminated',
      description: `CANCELLED means the operation was terminated before completion—either you explicitly cancelled it, a client timeout killed it, or GCP's system cancelled it due to resource constraints. This can be client-side (user cancellation, timeout) or server-side (system cancellation). Most common in Compute Engine when VM operations get cancelled, but also appears in Cloud SQL during cancelled database operations, GKE during cancelled cluster operations, and BigQuery when queries are cancelled. Unlike ABORTED (which indicates concurrency conflicts), CANCELLED means intentional or automatic termination—operations that exceed timeouts or get manually stopped return this error.`,
      metaDescription: 'Handle CANCELLED operations. Check operation status for cancellation reason, increase timeouts for long-running tasks, and retry if the operation is still needed.',
      causes: [
        `Explicit Cancellation: The operation is cancelled by the caller (e.g., user cancellation, client timeout). The operation is intentionally terminated. This is transient—retrying the operation may succeed if it's still needed.`,
        `Timeout Cancellation: The operation exceeds a client-side timeout and is automatically cancelled. Client-side timeouts can cancel operations. This is transient—retrying with longer timeout may help.`,
        `System Cancellation: GCP's system cancels the operation due to system conditions (e.g., resource constraints, service issues). This is transient—retrying later may succeed.`,
        `Service-Specific Cancellation: Cancellation behavior varies by service. Some operations can be cancelled mid-execution, others cannot.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check operation status to see why it was cancelled:\n   gcloud compute operations describe OPERATION_ID --zone ZONE --format="get(status,error)" --project PROJECT_ID`,
        `Step 2: Diagnose - Review operation logs for cancellation reason:\n   gcloud compute operations list --filter="name:OPERATION_ID" --project PROJECT_ID`,
        `Step 3: Diagnose - Check if timeout was the cause by reviewing timeout settings and operation duration.`,
        `Step 4: Diagnose - Check system conditions by reviewing GCP status page for known issues:\n   Visit https://status.cloud.google.com/`,
        `Step 5: Fix - If operation is still needed, retry the operation. Check why it was cancelled and address the cause.`,
        `Step 6: Fix - For timeout cancellation, increase timeout:\n   gcloud config set compute/timeout 600\n   Or use async operations for long-running tasks.`,
        `Step 7: Fix - For system cancellation, retry after a delay.`,
        `Step 8: Verify - Retry the operation. If it succeeds, the cancellation was transient.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Cancellation Handling and Retry',
          code: `# This script handles CANCELLED errors by checking operation status and retrying

PROJECT_ID="my-project"
OPERATION_ID="operation-123"
ZONE="us-central1-a"

# Step 1: Check operation status
echo "Checking operation status..."
STATUS=\$(gcloud compute operations describe \$OPERATION_ID \\
  --zone \$ZONE \\
  --project \$PROJECT_ID \\
  --format="value(status)")

echo "Operation status: \$STATUS"

# Step 2: If operation is done, check for cancellation error
if [ "\$STATUS" == "DONE" ]; then
  ERROR=\$(gcloud compute operations describe \$OPERATION_ID \\
    --zone \$ZONE \\
    --project \$PROJECT_ID \\
    --format="value(error.code)" 2>/dev/null)
  
  if [ "\$ERROR" == "CANCELLED" ]; then
    echo "Operation was cancelled. Checking cancellation reason..."
    
    # Get error details
    ERROR_MESSAGE=\$(gcloud compute operations describe \$OPERATION_ID \\
      --zone \$ZONE \\
      --project \$PROJECT_ID \\
      --format="value(error.message)" 2>/dev/null)
    
    echo "Cancellation reason: \$ERROR_MESSAGE"
    
    # Step 3: Retry operation if still needed
    echo "Retrying operation..."
    INSTANCE_NAME="my-instance"
    MACHINE_TYPE="n1-standard-1"
    
    # Increase timeout before retry
    gcloud config set compute/timeout 600
    
    # Retry with async operation
    NEW_OPERATION=\$(gcloud compute instances create \$INSTANCE_NAME \\
      --zone \$ZONE \\
      --machine-type \$MACHINE_TYPE \\
      --async \\
      --project \$PROJECT_ID)
    
    echo "New operation started: \$NEW_OPERATION"
  else
    echo "Operation completed with status: \$STATUS"
  fi
else
  echo "Operation is still in progress: \$STATUS"
fi`,
        },
      ],
      relatedCodes: ['DEADLINE_EXCEEDED', 'ABORTED'],
      provider: 'gcp',
    },
    'DATA_LOSS': {
      code: 'DATA_LOSS',
      name: 'Data Loss: Unrecoverable Data Corruption',
      description: `DATA_LOSS indicates unrecoverable data corruption or permanent loss—GCP's backend storage systems detected integrity failures that can't be fixed automatically. This critical server-side error means data is corrupted, lost, or damaged beyond recovery. Most common in Compute Engine when disks suffer storage failures or corruption, but also appears in Cloud SQL with database corruption, GKE with persistent volume corruption, and BigQuery with table data corruption. This is a permanent issue—you must restore from backups or snapshots if available, or contact GCP support for recovery assistance.`,
      metaDescription: 'Recover from DATA_LOSS. Check disk status, list available snapshots for restoration, and restore from backups immediately to minimize data loss.',
      causes: [
        `Data Corruption: Data integrity is compromised due to storage failures, system errors, or hardware issues. Corrupted data can't be used for operations. This is persistent—you must restore from backup.`,
        `Unrecoverable Data Loss: Data has been permanently lost and can't be recovered. This may occur due to storage failures, accidental deletion, or system errors. This is persistent—you must restore from backup if available.`,
        `Storage Failure: The underlying storage system has failed and data is inaccessible or corrupted. Storage health issues prevent data operations. This is persistent—you must restore from backup or contact GCP support.`,
        `Service-Specific Data Loss: Data loss behavior varies by service. Some services have better recovery mechanisms than others.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check disk status to see if the disk is accessible:\n   gcloud compute disks describe DISK_NAME --zone ZONE --format="get(status)" --project PROJECT_ID`,
        `Step 2: Diagnose - Check for available snapshots that can be used for recovery:\n   gcloud compute snapshots list --filter="sourceDisk:projects/PROJECT_ID/zones/ZONE/disks/DISK_NAME" --project PROJECT_ID`,
        `Step 3: Diagnose - Review error message for specific data issues and corruption details.`,
        `Step 4: Diagnose - Check storage health by reviewing storage system status in Cloud Console.`,
        `Step 5: Fix - Restore from backup if available:\n   gcloud compute disks create restored-disk --source-snapshot SNAPSHOT_NAME --zone ZONE --project PROJECT_ID`,
        `Step 6: Fix - Check for available backups:\n   gcloud compute snapshots list --filter="sourceDisk:projects/PROJECT_ID/zones/ZONE/disks/DISK_NAME" --project PROJECT_ID`,
        `Step 7: Fix - Contact GCP support if no backups exist or storage is unhealthy. GCP support can provide recovery assistance.`,
        `Step 8: Verify - After restoring from backup, verify data integrity by checking the restored resource.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Data Loss Recovery from Snapshots',
          code: `# This script helps recover from DATA_LOSS errors by restoring from snapshots

PROJECT_ID="my-project"
DISK_NAME="my-disk"
ZONE="us-central1-a"

# Step 1: Check disk status
echo "Checking disk status..."
DISK_STATUS=\$(gcloud compute disks describe \$DISK_NAME \\
  --zone \$ZONE \\
  --project \$PROJECT_ID \\
  --format="value(status)" 2>/dev/null)

if [ -z "\$DISK_STATUS" ]; then
  echo "ERROR: Disk \$DISK_NAME not found in zone \$ZONE"
  exit 1
fi

echo "Disk status: \$DISK_STATUS"

# Step 2: Check for available snapshots
echo "Checking for available snapshots..."
SNAPSHOTS=\$(gcloud compute snapshots list \\
  --filter="sourceDisk:projects/\$PROJECT_ID/zones/\$ZONE/disks/\$DISK_NAME" \\
  --format="table(name,creationTimestamp,diskSizeGb)" \\
  --project \$PROJECT_ID)

if [ -z "\$SNAPSHOTS" ] || [ "\$SNAPSHOTS" == "NAME" ]; then
  echo "WARNING: No snapshots found for disk \$DISK_NAME"
  echo "You may need to contact GCP support for recovery assistance"
  exit 1
fi

echo "Available snapshots:"
echo "\$SNAPSHOTS"

# Step 3: Get the most recent snapshot
LATEST_SNAPSHOT=\$(gcloud compute snapshots list \\
  --filter="sourceDisk:projects/\$PROJECT_ID/zones/\$ZONE/disks/\$DISK_NAME" \\
  --sort-by=~creationTimestamp \\
  --format="value(name)" \\
  --limit=1 \\
  --project \$PROJECT_ID)

if [ -z "\$LATEST_SNAPSHOT" ]; then
  echo "ERROR: Could not find latest snapshot"
  exit 1
fi

echo "Latest snapshot: \$LATEST_SNAPSHOT"

# Step 4: Restore from snapshot
RESTORED_DISK_NAME="\$DISK_NAME-restored-\$(date +%s)"
echo "Creating restored disk \$RESTORED_DISK_NAME from snapshot \$LATEST_SNAPSHOT..."
gcloud compute disks create \$RESTORED_DISK_NAME \\
  --source-snapshot \$LATEST_SNAPSHOT \\
  --zone \$ZONE \\
  --project \$PROJECT_ID

echo "Restored disk created: \$RESTORED_DISK_NAME"
echo "You can now attach this disk to a VM or use it to replace the corrupted disk"`,
        },
      ],
      relatedCodes: ['INTERNAL', 'UNAVAILABLE'],
      provider: 'gcp',
    },
    'INVALID_REQUEST': {
      code: 'INVALID_REQUEST',
      name: 'Invalid Request: Malformed Request Format',
      description: `INVALID_REQUEST means your request format is broken—malformed JSON, unclosed brackets, missing required fields, or parameters in wrong formats. This client-side error happens during request parsing in the control plane before GCP validates parameter values. Most common in Compute Engine with malformed API requests, but also appears in Cloud SQL with invalid database configuration structures, GKE with malformed cluster configs, and BigQuery with invalid query syntax. Unlike INVALID_ARGUMENT (which indicates wrong parameter values), INVALID_REQUEST means the request structure itself is invalid—GCP can't parse it.`,
      metaDescription: 'Correct INVALID_REQUEST errors. Validate JSON syntax, check request structure matches API requirements, and ensure all required parameters are included.',
      causes: [
        `Malformed Request Structure: The request JSON or structure is invalid (e.g., unclosed brackets, invalid syntax, wrong format). GCP can't parse the request. This is persistent—you must fix the request format.`,
        `Missing Required Parameters: Required parameters are not included in the request. API operations require specific parameters to be present. This is persistent—you must include all required parameters.`,
        `Invalid Parameter Format: Parameters don't match the expected format (e.g., date format, GUID format, structure mismatch). GCP validates parameter formats strictly. This is persistent—you must use the correct format.`,
        `Service-Specific Format Requirements: Request format requirements vary by service. Some services have stricter format requirements than others.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check request JSON syntax by validating JSON syntax and structure. Use a JSON validator to identify syntax errors.`,
        `Step 2: Diagnose - Review API documentation for required parameters. Ensure all required parameters are included in your request.`,
        `Step 3: Diagnose - Review API documentation for parameter format requirements (e.g., date formats, GUID formats, structure requirements).`,
        `Step 4: Diagnose - Validate request structure by reviewing API documentation for request structure requirements.`,
        `Step 5: Fix - Fix request format by checking JSON syntax, structure, and format. Ensure all brackets are closed and syntax is valid.`,
        `Step 6: Fix - Include all required parameters. Check API documentation for required parameters and ensure they're all present.`,
        `Step 7: Fix - Use correct parameter formats. Check API documentation for parameter format requirements and ensure your parameters match.`,
        `Step 8: Verify - Retry the operation with the corrected request format. If it succeeds, the format issue was resolved.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Request Validation Before API Call',
          code: `# This script validates request parameters before making API calls to avoid INVALID_REQUEST errors

PROJECT_ID="my-project"
ZONE="us-central1-a"
INSTANCE_NAME="my-instance"
MACHINE_TYPE="n1-standard-1"

# Step 1: Validate project ID
echo "Validating project ID: \$PROJECT_ID"
if ! gcloud projects describe \$PROJECT_ID &>/dev/null; then
  echo "ERROR: Invalid project ID: \$PROJECT_ID"
  echo "Available projects:"
  gcloud projects list --format="table(projectId,name)"
  exit 1
fi
echo "Project ID is valid"

# Step 2: Validate zone
echo "Validating zone: \$ZONE"
if ! gcloud compute zones list --filter="name=\$ZONE" --format="value(name)" | grep -q "\$ZONE"; then
  echo "ERROR: Invalid zone: \$ZONE"
  echo "Available zones:"
  gcloud compute zones list --format="table(name,status)"
  exit 1
fi
echo "Zone is valid"

# Step 3: Validate machine type exists in the zone
echo "Validating machine type: \$MACHINE_TYPE"
if ! gcloud compute machine-types list --filter="name=\$MACHINE_TYPE AND zone:\$ZONE" --format="value(name)" | grep -q "\$MACHINE_TYPE"; then
  echo "ERROR: Invalid machine type: \$MACHINE_TYPE for zone \$ZONE"
  echo "Available machine types in \$ZONE:"
  gcloud compute machine-types list --filter="zone:\$ZONE" --format="table(name)"
  exit 1
fi
echo "Machine type is valid"

# Step 4: Validate instance name format (alphanumeric and hyphens only)
if ! echo "\$INSTANCE_NAME" | grep -qE '^[a-z]([-a-z0-9]*[a-z0-9])?$'; then
  echo "ERROR: Invalid instance name format: \$INSTANCE_NAME"
  echo "Instance name must:"
  echo "  - Start with a lowercase letter"
  echo "  - Contain only lowercase letters, numbers, and hyphens"
  echo "  - End with a letter or number"
  exit 1
fi
echo "Instance name format is valid"

# Step 5: Make request with validated parameters
echo "All parameters validated. Creating instance..."
gcloud compute instances create \$INSTANCE_NAME \\
  --project \$PROJECT_ID \\
  --zone \$ZONE \\
  --machine-type \$MACHINE_TYPE

echo "Instance creation request sent successfully"`,
        },
      ],
      relatedCodes: ['INVALID_ARGUMENT', 'FAILED_PRECONDITION'],
      provider: 'gcp',
    },
};
