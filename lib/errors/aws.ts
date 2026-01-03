import type { ErrorCode } from './types';

export const awsErrors: Record<string, ErrorCode> = {
    'AccessDenied': {
      code: 'AccessDenied',
      name: 'Access Denied',
      description: `Getting hit with an **AccessDenied** error usually means your IAM User or Role lacks the specific JSON policy required to perform the action—the policy might be missing the exact Action, Resource ARN, or Condition needed. This client-side error (4xx) happens when AWS evaluates your IAM policies and denies access. Most common when IAM policies don't grant the specific permission, but also appears when Service Control Policies (SCPs) block actions, resource-based policies deny access, Security Groups block network access, or VPC endpoints aren't configured correctly.`,
      metaDescription: 'Fix AccessDenied errors by reviewing IAM policies, checking SCPs, verifying Security Groups, and diagnosing VPC endpoint configurations with our AWS troubleshooting guide.',
      causes: [
        `Identity: IAM policy missing required Action (e.g., s3:GetObject). Policy Resource ARN doesn't match target resource. Service Control Policy (SCP) blocks action at organization level. IAM role trust policy incorrect. Policy Condition not met (IP, time, MFA).`,
        `Network: Security Group inbound/outbound rules block traffic. Network ACL (NACL) denies connection. VPC endpoint policy restricts access. Route table misconfiguration prevents access.`,
        `Limits: Service Quota exceeded (soft limit reached). Account-level restrictions active. Region-specific access denied.`,
      ],
      solutions: [
        `Step 1: Diagnose - Run AWS CLI to check your current identity: aws sts get-caller-identity. Verify which IAM User/Role is making the request. Check if credentials are correct.`,
        `Step 2: Diagnose - Review IAM policies attached to your identity: aws iam list-attached-user-policies --user-name YOUR_USER. Check inline policies: aws iam list-user-policies --user-name YOUR_USER.`,
        `Step 3: Diagnose - Check Service Control Policies (if in AWS Organizations): aws organizations list-policies-for-target --target-id ACCOUNT_ID. Review SCPs that might deny actions.`,
        `Step 4: Fix - Update IAM policy to include required Action and Resource. Use AWS Policy Simulator: aws iam simulate-principal-policy --policy-source-arn arn:aws:iam::ACCOUNT:user/USER --action-names s3:GetObject --resource-arns arn:aws:s3:::bucket/*.`,
        `Step 5: Fix - Check Security Groups if network-related: aws ec2 describe-security-groups --group-ids sg-xxxxx. Verify inbound/outbound rules allow traffic. Check VPC endpoints: aws ec2 describe-vpc-endpoints.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Diagnose AccessDenied: Check Identity and Policies',
          code: `#!/bin/bash
# Step 1: Check your current AWS identity
echo "=== Current Identity ==="
aws sts get-caller-identity

# Step 2: List IAM policies attached to your user
USER_NAME=\$(aws sts get-caller-identity --query User.UserName --output text)
echo "\\n=== Attached Policies for \${USER_NAME} ==="
aws iam list-attached-user-policies --user-name \${USER_NAME}

# Step 3: List inline policies
echo "\\n=== Inline Policies ==="
aws iam list-user-policies --user-name \${USER_NAME}

# Step 4: Get policy document for a specific policy
POLICY_ARN="arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"
echo "\\n=== Policy Document ==="
aws iam get-policy --policy-arn \${POLICY_ARN}
VERSION_ID=\$(aws iam get-policy --policy-arn \${POLICY_ARN} --query Policy.DefaultVersionId --output text)
aws iam get-policy-version --policy-arn \${POLICY_ARN} --version-id \${VERSION_ID}

# Step 5: Simulate policy to see if action is allowed
echo "\\n=== Policy Simulation ==="
aws iam simulate-principal-policy \\
  --policy-source-arn \$(aws sts get-caller-identity --query Arn --output text) \\
  --action-names s3:GetObject \\
  --resource-arns "arn:aws:s3:::my-bucket/*"`,
        },
        {
          language: 'bash',
          title: 'Check Service Control Policies (SCPs)',
          code: `#!/bin/bash
# Check if you're in an AWS Organization
ACCOUNT_ID=\$(aws sts get-caller-identity --query Account --output text)
echo "Account ID: \${ACCOUNT_ID}"

# List SCPs attached to account (requires organizations:ListPoliciesForTarget)
echo "\\n=== Service Control Policies ==="
aws organizations list-policies-for-target \\
  --target-id \${ACCOUNT_ID} \\
  --filter SERVICE_CONTROL_POLICY 2>/dev/null || echo "Not in AWS Organizations or no permission"

# Get SCP document
SCP_ID="p-xxxxx"  # Replace with actual SCP ID
aws organizations describe-policy --policy-id \${SCP_ID}`,
        },
        {
          language: 'bash',
          title: 'Check Security Groups and VPC Endpoints',
          code: `#!/bin/bash
# Check Security Groups for EC2 instances
INSTANCE_ID="i-xxxxx"  # Replace with your instance ID
echo "=== Security Groups for Instance ==="
aws ec2 describe-instances \\
  --instance-ids \${INSTANCE_ID} \\
  --query 'Reservations[0].Instances[0].SecurityGroups[*].[GroupId,GroupName]' \\
  --output table

# Describe Security Group rules
SG_ID="sg-xxxxx"  # Replace with Security Group ID
echo "\\n=== Security Group Rules ==="
aws ec2 describe-security-groups --group-ids \${SG_ID}

# Check VPC Endpoints
echo "\\n=== VPC Endpoints ==="
aws ec2 describe-vpc-endpoints

# Check VPC Endpoint policies
VPC_ENDPOINT_ID="vpce-xxxxx"  # Replace with VPC Endpoint ID
aws ec2 describe-vpc-endpoint-policy --vpc-endpoint-id \${VPC_ENDPOINT_ID}`,
        },
      ],
      relatedCodes: ['UnauthorizedOperation', 'InvalidUserID.NotFound'],
      provider: 'aws',
    },
    'InvalidParameterValue': {
      code: 'InvalidParameterValue',
      name: 'Invalid Parameter Value',
      description: `Hitting an **InvalidParameterValue** error means one of your API parameters has the wrong format, is out of range, or violates AWS service constraints—EC2 instance types must be valid, S3 bucket names must follow naming rules, or IAM role names must match patterns. This client-side error (4xx) happens when AWS validates your request parameters before processing. Most common when EC2 instance types are invalid, S3 bucket names violate rules, or IAM resource names don't match patterns, but also appears when parameter values exceed limits, unsupported combinations are used, or data types don't match expected formats.`,
      metaDescription: 'Debug InvalidParameterValue errors by validating EC2 instance types, checking S3 bucket naming rules, and verifying IAM resource name patterns with our AWS troubleshooting guide.',
      causes: [
        `Identity: IAM role/user name doesn't match naming pattern (1-64 chars, alphanumeric). Policy document JSON syntax error. Resource ARN format incorrect. Tag key/value format invalid.`,
        `Network: Security Group ID format wrong (sg-xxxxx). VPC ID format invalid (vpc-xxxxx). Subnet ID format incorrect (subnet-xxxxx). Availability Zone name invalid.`,
        `Limits: EC2 instance type doesn't exist (e.g., t2.invalid). S3 bucket name violates global naming rules. Parameter value exceeds service limit. Unsupported region/zone combination.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check the exact error message from AWS CLI—it usually specifies which parameter is invalid. Review the parameter name and value in your request.`,
        `Step 2: Diagnose - Validate EC2 instance types: aws ec2 describe-instance-types --query 'InstanceTypes[*].InstanceType' --output table. Check if your instance type exists.`,
        `Step 3: Diagnose - Verify S3 bucket naming: Bucket names must be 3-63 chars, lowercase, alphanumeric/hyphens only, globally unique. Check: aws s3api head-bucket --bucket BUCKET_NAME.`,
        `Step 4: Fix - Validate IAM resource names: aws iam get-role --role-name ROLE_NAME. Names must be 1-64 chars, alphanumeric plus: +=,.@-_. Check ARN format: arn:aws:service:region:account:resource.`,
        `Step 5: Fix - Check parameter value ranges: Review AWS API documentation for valid ranges. Use AWS CLI help: aws ec2 run-instances help. Validate before sending request.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Validate EC2 Instance Types',
          code: `#!/bin/bash
# List all valid EC2 instance types
echo "=== Valid EC2 Instance Types ==="
aws ec2 describe-instance-types \\
  --query 'InstanceTypes[*].InstanceType' \\
  --output table

# Check specific instance type
INSTANCE_TYPE="t2.micro"
echo "\\n=== Checking Instance Type: \${INSTANCE_TYPE} ==="
aws ec2 describe-instance-types \\
  --instance-types \${INSTANCE_TYPE} \\
  --query 'InstanceTypes[0].[InstanceType,ProcessorInfo.SupportedArchitectures[0]]' \\
  --output table

# Validate before launching
AMI_ID="ami-xxxxx"  # Replace with valid AMI ID
INSTANCE_TYPE="t2.micro"
echo "\\n=== Validating Launch Parameters ==="
aws ec2 run-instances \\
  --image-id \${AMI_ID} \\
  --instance-type \${INSTANCE_TYPE} \\
  --count 1 \\
  --dry-run 2>&1 | grep -q "DryRunOperation" && echo "Parameters valid" || echo "Invalid parameters"`,
        },
        {
          language: 'bash',
          title: 'Validate S3 Bucket Naming',
          code: `#!/bin/bash
# S3 bucket naming rules validation
BUCKET_NAME="my-bucket-name"

# Check bucket name length (3-63 chars)
if [ \${#BUCKET_NAME} -lt 3 ] || [ \${#BUCKET_NAME} -gt 63 ]; then
  echo "ERROR: Bucket name must be 3-63 characters"
  exit 1
fi

# Check for valid characters (lowercase, alphanumeric, hyphens)
if [[ ! \${BUCKET_NAME} =~ ^[a-z0-9][a-z0-9-]*[a-z0-9]\$ ]] && [[ ! \${BUCKET_NAME} =~ ^[a-z0-9]\$ ]]; then
  echo "ERROR: Bucket name must be lowercase, alphanumeric, with hyphens"
  exit 1
fi

# Check if bucket name is globally unique
echo "=== Checking Bucket Availability ==="
aws s3api head-bucket --bucket \${BUCKET_NAME} 2>&1
if [ \$? -eq 0 ]; then
  echo "Bucket exists"
else
  echo "Bucket name available or access denied"
fi`,
        },
        {
          language: 'bash',
          title: 'Validate IAM Resource Names and ARNs',
          code: `#!/bin/bash
# Validate IAM role name (1-64 chars, alphanumeric plus: +=,.@-_)
ROLE_NAME="MyRole-123"

# Check length
if [ \${#ROLE_NAME} -lt 1 ] || [ \${#ROLE_NAME} -gt 64 ]; then
  echo "ERROR: Role name must be 1-64 characters"
  exit 1
fi

# Validate ARN format
ARN="arn:aws:iam::123456789012:role/MyRole"
echo "=== Validating ARN Format ==="
if [[ \${ARN} =~ ^arn:aws:[a-z0-9-]+:[a-z0-9-]*:[0-9]{12}:[a-z0-9-]+/.+\$ ]]; then
  echo "ARN format valid"
else
  echo "ERROR: Invalid ARN format"
fi

# Check if role exists
echo "\\n=== Checking Role Exists ==="
aws iam get-role --role-name \${ROLE_NAME} 2>&1 || echo "Role not found or invalid name"`,
        },
      ],
      relatedCodes: ['InvalidParameter', 'MissingParameter'],
      provider: 'aws',
    },
    'BucketAlreadyExists': {
      code: 'BucketAlreadyExists',
      name: 'Bucket Already Exists',
      description: `Hitting a **BucketAlreadyExists** error means your S3 bucket name is already taken globally—S3 bucket names are unique across all AWS accounts worldwide, so someone else already claimed that name. This client-side error (4xx) happens when AWS validates bucket name uniqueness. Most common when bucket names are too generic, but also appears when recently deleted buckets are still in the 90-day deletion grace period, bucket names violate S3 naming rules, or you're trying to create a bucket that already exists in your account.`,
      metaDescription: 'Solve BucketAlreadyExists by generating unique S3 bucket names, checking naming rules, and handling recently deleted bucket reservations with our AWS troubleshooting guide.',
      causes: [
        `Identity: Bucket name already exists in your account. IAM permissions allow listing but not creating buckets.`,
        `Network: VPC endpoint policy restricts bucket creation. Cross-account bucket access issues.`,
        `Limits: Bucket name globally taken by another AWS account. Recently deleted bucket (90-day reservation period). Bucket name violates S3 naming rules (must be 3-63 chars, lowercase, globally unique).`,
      ],
      solutions: [
        `Step 1: Diagnose - Check if bucket exists in your account: aws s3api head-bucket --bucket BUCKET_NAME. List your buckets: aws s3 ls. Verify bucket name spelling.`,
        `Step 2: Diagnose - Check if bucket was recently deleted: aws s3api list-buckets. Recently deleted buckets are reserved for 90 days. Wait or use different name.`,
        `Step 3: Diagnose - Validate bucket naming rules: Name must be 3-63 chars, lowercase, alphanumeric/hyphens only, globally unique. Check: echo BUCKET_NAME | grep -E '^[a-z0-9][a-z0-9-]*[a-z0-9]\$'.`,
        `Step 4: Fix - Generate unique bucket name with random suffix: BUCKET_NAME="my-app-\$(date +%s)-\$(openssl rand -hex 4)". Ensure it follows naming rules.`,
        `Step 5: Fix - Create bucket with unique name: aws s3api create-bucket --bucket \${BUCKET_NAME} --region us-east-1. For other regions, add --create-bucket-configuration LocationConstraint=REGION.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Generate Unique S3 Bucket Name',
          code: `#!/bin/bash
# Generate unique bucket name with timestamp and random suffix
BASE_NAME="my-app"
TIMESTAMP=\$(date +%s)
RANDOM_SUFFIX=\$(openssl rand -hex 4 | tr '[:upper:]' '[:lower:]')
BUCKET_NAME="\${BASE_NAME}-\${TIMESTAMP}-\${RANDOM_SUFFIX}"

# Ensure it follows S3 naming rules (3-63 chars, lowercase)
BUCKET_NAME=\$(echo \${BUCKET_NAME} | tr '[:upper:]' '[:lower:]')

echo "Generated bucket name: \${BUCKET_NAME}"

# Validate name length
if [ \${#BUCKET_NAME} -lt 3 ] || [ \${#BUCKET_NAME} -gt 63 ]; then
  echo "ERROR: Bucket name must be 3-63 characters"
  exit 1
fi

# Check if bucket already exists
echo "=== Checking Bucket Availability ==="
aws s3api head-bucket --bucket \${BUCKET_NAME} 2>/dev/null
if [ \$? -eq 0 ]; then
  echo "Bucket already exists, generating new name..."
  BUCKET_NAME="\${BASE_NAME}-\$(date +%s)-\$(openssl rand -hex 4 | tr '[:upper:]' '[:lower:]')"
fi

# Create bucket
echo "\\n=== Creating Bucket: \${BUCKET_NAME} ==="
aws s3api create-bucket \\
  --bucket \${BUCKET_NAME} \\
  --region us-east-1

# For other regions, use:
# aws s3api create-bucket \\
#   --bucket \${BUCKET_NAME} \\
#   --region us-west-2 \\
#   --create-bucket-configuration LocationConstraint=us-west-2`,
        },
        {
          language: 'bash',
          title: 'Check Existing Buckets and Naming Rules',
          code: `#!/bin/bash
# List all buckets in your account
echo "=== Your Existing Buckets ==="
aws s3 ls

# Check if specific bucket exists
BUCKET_NAME="my-bucket-name"
echo "\\n=== Checking Bucket: \${BUCKET_NAME} ==="
aws s3api head-bucket --bucket \${BUCKET_NAME} 2>&1
if [ \$? -eq 0 ]; then
  echo "Bucket exists in your account"
else
  echo "Bucket doesn't exist in your account (may be taken globally)"
fi

# Validate bucket naming rules
echo "\\n=== Validating Naming Rules ==="
BUCKET_NAME="test-bucket-123"
if [[ \${BUCKET_NAME} =~ ^[a-z0-9][a-z0-9-]*[a-z0-9]\$ ]] || [[ \${BUCKET_NAME} =~ ^[a-z0-9]\$ ]]; then
  echo "✓ Name format valid"
else
  echo "✗ Name format invalid (must be lowercase, alphanumeric, hyphens)"
fi

# Check length
if [ \${#BUCKET_NAME} -ge 3 ] && [ \${#BUCKET_NAME} -le 63 ]; then
  echo "✓ Length valid (3-63 characters)"
else
  echo "✗ Length invalid"
fi`,
        },
      ],
      relatedCodes: ['InvalidBucketName', 'BucketAlreadyOwnedByYou'],
      provider: 'aws',
    },
    'NoSuchBucket': {
      code: 'NoSuchBucket',
      name: 'No Such Bucket',
      description: `Getting a **NoSuchBucket** error means the S3 bucket you're trying to access doesn't exist in your AWS account, or you don't have permission to see it—the bucket might have been deleted, the name is misspelled, or it's in a different region. This client-side error (4xx) happens when AWS can't find the bucket. Most common when bucket names have typos, but also appears when buckets were deleted, buckets are in different regions, IAM policies don't grant ListBucket permission, or you're accessing a bucket from another account without proper permissions.`,
      metaDescription: 'Fix NoSuchBucket errors by verifying bucket names, checking regions, listing accessible buckets, and reviewing IAM permissions with our AWS troubleshooting guide.',
      causes: [
        `Identity: IAM policy missing s3:ListBucket permission. Bucket policy denies access. Cross-account access not configured. IAM user/role can't see bucket.`,
        `Network: Bucket in different region than expected. VPC endpoint doesn't route to correct region. Cross-region access issues.`,
        `Limits: Bucket was deleted. Bucket name typo. Bucket doesn't exist in your account. Bucket in different AWS account.`,
      ],
      solutions: [
        `Step 1: Diagnose - List all buckets in your account: aws s3 ls. Check if bucket name appears in the list. Verify spelling of bucket name.`,
        `Step 2: Diagnose - Check bucket in specific region: aws s3api head-bucket --bucket BUCKET_NAME --region REGION. Try different regions if bucket not found.`,
        `Step 3: Diagnose - Verify IAM permissions: aws iam simulate-principal-policy --policy-source-arn YOUR_ARN --action-names s3:ListBucket --resource-arns arn:aws:s3:::BUCKET_NAME. Check if s3:ListBucket is allowed.`,
        `Step 4: Fix - Check bucket region: aws s3api get-bucket-location --bucket BUCKET_NAME. Use correct region in requests: aws s3 ls s3://BUCKET_NAME --region REGION.`,
        `Step 5: Fix - Verify bucket exists: aws s3api head-bucket --bucket BUCKET_NAME. If access denied, check IAM policies. If 404, bucket doesn't exist or wrong account.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'List Buckets and Check Existence',
          code: `#!/bin/bash
# List all buckets in your account
echo "=== Your Buckets ==="
aws s3 ls

# Check if specific bucket exists
BUCKET_NAME="my-bucket-name"
echo "\\n=== Checking Bucket: \${BUCKET_NAME} ==="
aws s3api head-bucket --bucket \${BUCKET_NAME} 2>&1
if [ \$? -eq 0 ]; then
  echo "✓ Bucket exists"
else
  echo "✗ Bucket not found or access denied"
  echo "Error details:"
  aws s3api head-bucket --bucket \${BUCKET_NAME} 2>&1
fi

# Get bucket location (region)
echo "\\n=== Bucket Region ==="
aws s3api get-bucket-location --bucket \${BUCKET_NAME} 2>&1 || echo "Cannot determine region (bucket may not exist)"

# List bucket contents (requires s3:ListBucket permission)
echo "\\n=== Bucket Contents ==="
aws s3 ls s3://\${BUCKET_NAME}/ 2>&1 || echo "Cannot list contents (check permissions or bucket existence)"`,
        },
        {
          language: 'bash',
          title: 'Check IAM Permissions for S3 Bucket',
          code: `#!/bin/bash
# Check your current identity
echo "=== Current Identity ==="
IDENTITY_ARN=\$(aws sts get-caller-identity --query Arn --output text)
echo "Identity: \${IDENTITY_ARN}"

# Simulate s3:ListBucket permission
BUCKET_NAME="my-bucket-name"
echo "\\n=== Simulating s3:ListBucket Permission ==="
aws iam simulate-principal-policy \\
  --policy-source-arn \${IDENTITY_ARN} \\
  --action-names s3:ListBucket \\
  --resource-arns "arn:aws:s3:::\${BUCKET_NAME}" \\
  --query 'EvaluationResults[0].[EvalDecision,EvalResourceName]' \\
  --output table

# Check bucket policy
echo "\\n=== Bucket Policy ==="
aws s3api get-bucket-policy --bucket \${BUCKET_NAME} 2>&1 || echo "No bucket policy or access denied"

# Check bucket ACL
echo "\\n=== Bucket ACL ==="
aws s3api get-bucket-acl --bucket \${BUCKET_NAME} 2>&1 || echo "Cannot read ACL (check permissions)"`,
        },
        {
          language: 'bash',
          title: 'Check Bucket in Different Regions',
          code: `#!/bin/bash
BUCKET_NAME="my-bucket-name"

# Common AWS regions
REGIONS=("us-east-1" "us-west-2" "eu-west-1" "ap-southeast-1")

echo "=== Checking Bucket in Different Regions ==="
for REGION in "\${REGIONS[@]}"; do
  echo "\\nChecking region: \${REGION}"
  aws s3api head-bucket \\
    --bucket \${BUCKET_NAME} \\
    --region \${REGION} 2>&1 | head -1
done

# If bucket found, use correct region in operations
echo "\\n=== Using Correct Region ==="
CORRECT_REGION="us-east-1"  # Replace with actual region
aws s3 ls s3://\${BUCKET_NAME}/ --region \${CORRECT_REGION}`,
        },
      ],
      relatedCodes: ['AccessDenied', 'NoSuchKey'],
      provider: 'aws',
    },
    'NoSuchKey': {
      code: 'NoSuchKey',
      name: 'No Such Key',
      description: `Hitting a **NoSuchKey** error means the S3 object (file) you're trying to access doesn't exist at that key path in the bucket—the object might have been deleted, the key path is misspelled, or it's in a different folder. This client-side error (4xx) happens when AWS can't find the object at the specified key. Most common when object keys have typos, but also appears when objects were deleted, keys have incorrect paths, case sensitivity doesn't match, or objects are in different prefixes/folders.`,
      metaDescription: 'Debug NoSuchKey errors by listing S3 objects, verifying key paths, checking case sensitivity, and reviewing object permissions with our AWS troubleshooting guide.',
      causes: [
        `Identity: IAM policy missing s3:GetObject permission. Bucket policy denies object access. Object encryption requires specific KMS key access.`,
        `Network: Object in different region. VPC endpoint routing issues. Cross-region replication not complete.`,
        `Limits: Object key path incorrect. Object was deleted. Case sensitivity mismatch (S3 keys are case-sensitive). Object in different prefix/folder.`,
      ],
      solutions: [
        `Step 1: Diagnose - List objects in bucket to find correct key: aws s3 ls s3://BUCKET_NAME/ --recursive. Search for similar keys: aws s3 ls s3://BUCKET_NAME/ | grep PATTERN.`,
        `Step 2: Diagnose - Check if object exists: aws s3api head-object --bucket BUCKET_NAME --key OBJECT_KEY. If 404, object doesn't exist. If 403, check permissions.`,
        `Step 3: Diagnose - Verify key path: S3 keys are case-sensitive. Check exact spelling: aws s3api list-objects-v2 --bucket BUCKET_NAME --prefix PREFIX. Compare with your key.`,
        `Step 4: Fix - Check object versioning: aws s3api list-object-versions --bucket BUCKET_NAME --prefix OBJECT_KEY. Object might be deleted but version exists. Restore: aws s3api restore-object --bucket BUCKET_NAME --key OBJECT_KEY.`,
        `Step 5: Fix - Verify IAM permissions: aws iam simulate-principal-policy --policy-source-arn YOUR_ARN --action-names s3:GetObject --resource-arns arn:aws:s3:::BUCKET_NAME/OBJECT_KEY. Ensure s3:GetObject is allowed.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'List S3 Objects and Find Correct Key',
          code: `#!/bin/bash
BUCKET_NAME="my-bucket"
OBJECT_KEY="path/to/file.txt"

# List all objects in bucket (recursive)
echo "=== All Objects in Bucket ==="
aws s3 ls s3://\${BUCKET_NAME}/ --recursive

# List objects with specific prefix
PREFIX="path/to/"
echo "\\n=== Objects with Prefix: \${PREFIX} ==="
aws s3 ls s3://\${BUCKET_NAME}/\${PREFIX} --recursive

# Search for similar keys
SEARCH_PATTERN="file"
echo "\\n=== Searching for: \${SEARCH_PATTERN} ==="
aws s3 ls s3://\${BUCKET_NAME}/ --recursive | grep \${SEARCH_PATTERN}

# Check if specific object exists
echo "\\n=== Checking Object: \${OBJECT_KEY} ==="
aws s3api head-object --bucket \${BUCKET_NAME} --key \${OBJECT_KEY} 2>&1
if [ \$? -eq 0 ]; then
  echo "✓ Object exists"
  aws s3api head-object --bucket \${BUCKET_NAME} --key \${OBJECT_KEY} \\
    --query '[LastModified,ContentLength,ContentType]' \\
    --output table
else
  echo "✗ Object not found"
  echo "Listing similar objects..."
  aws s3api list-objects-v2 --bucket \${BUCKET_NAME} --prefix \$(dirname \${OBJECT_KEY})/ \\
    --query 'Contents[*].Key' --output table
fi`,
        },
        {
          language: 'bash',
          title: 'Check Object Versions and Restore Deleted Objects',
          code: `#!/bin/bash
BUCKET_NAME="my-bucket"
OBJECT_KEY="path/to/file.txt"

# List object versions (if versioning enabled)
echo "=== Object Versions ==="
aws s3api list-object-versions \\
  --bucket \${BUCKET_NAME} \\
  --prefix \${OBJECT_KEY} \\
  --query 'Versions[*].[VersionId,IsLatest,LastModified]' \\
  --output table

# Check for delete markers
echo "\\n=== Delete Markers ==="
aws s3api list-object-versions \\
  --bucket \${BUCKET_NAME} \\
  --prefix \${OBJECT_KEY} \\
  --query 'DeleteMarkers[*].[VersionId,IsLatest,LastModified]' \\
  --output table

# Restore deleted object (remove delete marker)
DELETE_MARKER_VERSION_ID="xxxxx"  # Replace with actual version ID
echo "\\n=== Restoring Object ==="
aws s3api delete-object \\
  --bucket \${BUCKET_NAME} \\
  --key \${OBJECT_KEY} \\
  --version-id \${DELETE_MARKER_VERSION_ID}

# Or restore from Glacier/Deep Archive
echo "\\n=== Restoring from Glacier ==="
aws s3api restore-object \\
  --bucket \${BUCKET_NAME} \\
  --key \${OBJECT_KEY} \\
  --restore-request '{"Days":7,"GlacierJobParameters":{"Tier":"Expedited"}}'`,
        },
        {
          language: 'bash',
          title: 'Verify IAM Permissions for S3 Object',
          code: `#!/bin/bash
# Check your identity
IDENTITY_ARN=\$(aws sts get-caller-identity --query Arn --output text)
BUCKET_NAME="my-bucket"
OBJECT_KEY="path/to/file.txt"

# Simulate s3:GetObject permission
echo "=== Simulating s3:GetObject Permission ==="
aws iam simulate-principal-policy \\
  --policy-source-arn \${IDENTITY_ARN} \\
  --action-names s3:GetObject \\
  --resource-arns "arn:aws:s3:::\${BUCKET_NAME}/\${OBJECT_KEY}" \\
  --query 'EvaluationResults[0].[EvalDecision,EvalResourceName,MatchedStatements[0].SourcePolicyId]' \\
  --output table

# Check bucket policy
echo "\\n=== Bucket Policy ==="
aws s3api get-bucket-policy --bucket \${BUCKET_NAME} 2>&1 | jq '.' || echo "No bucket policy"

# Note: S3 keys are case-sensitive
echo "\\n=== Case Sensitivity Check ==="
echo "Original key: \${OBJECT_KEY}"
echo "Trying lowercase: \$(echo \${OBJECT_KEY} | tr '[:upper:]' '[:lower:]')"
aws s3api head-object --bucket \${BUCKET_NAME} --key \$(echo \${OBJECT_KEY} | tr '[:upper:]' '[:lower:]') 2>&1 | head -1`,
        },
      ],
      relatedCodes: ['NoSuchBucket', 'AccessDenied'],
      provider: 'aws',
    },
    'InvalidAccessKeyId': {
      code: 'InvalidAccessKeyId',
      name: 'Invalid Access Key ID',
      description: `Getting an **InvalidAccessKeyId** error means your AWS Access Key ID doesn't exist in AWS—the key might have been deleted, it's misspelled, or it belongs to a different AWS account. This client-side error (4xx) happens when AWS can't find the access key in its records. Most common when access keys are deleted or rotated, but also appears when credentials are misconfigured, access keys are deactivated, or there's a typo in the key ID.`,
      metaDescription: 'Fix InvalidAccessKeyId by verifying credentials, checking IAM user access keys, regenerating keys if needed, and validating credentials file format with our AWS guide.',
      causes: [
        `Identity: Access key ID doesn't exist in AWS. Access key was deleted from IAM user. Access key belongs to different AWS account. Access key deactivated.`,
        `Network: Credentials file corrupted. Environment variables not set correctly. AWS CLI configuration file has wrong key.`,
        `Limits: Typo in access key ID. Key format invalid (should be 20 chars, alphanumeric). Key rotated but old key still in use.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check your current credentials: aws sts get-caller-identity. If InvalidAccessKeyId, credentials are wrong. Verify which credentials are being used: aws configure list.`,
        `Step 2: Diagnose - List IAM user access keys: aws iam list-access-keys --user-name USER_NAME. Check if key exists and is active. Verify key ID matches your credentials.`,
        `Step 3: Diagnose - Check credentials file: cat ~/.aws/credentials. Verify [default] or [profile] section has correct AccessKeyId. Check environment variables: echo \$AWS_ACCESS_KEY_ID.`,
        `Step 4: Fix - Regenerate access key if deleted: aws iam create-access-key --user-name USER_NAME. Update credentials: aws configure set aws_access_key_id NEW_KEY_ID.`,
        `Step 5: Fix - Verify credentials work: aws sts get-caller-identity. Should return account ID, user ARN, and user ID. If still fails, check IAM user exists: aws iam get-user --user-name USER_NAME.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Diagnose InvalidAccessKeyId: Check Credentials',
          code: `#!/bin/bash
# Check current credentials being used
echo "=== Current AWS Configuration ==="
aws configure list

# Check environment variables
echo "\\n=== Environment Variables ==="
echo "AWS_ACCESS_KEY_ID: \${AWS_ACCESS_KEY_ID:-(not set)}"
echo "AWS_SECRET_ACCESS_KEY: \${AWS_SECRET_ACCESS_KEY:+(set)} \${AWS_SECRET_ACCESS_KEY:+[hidden]}"
echo "AWS_PROFILE: \${AWS_PROFILE:-(not set)}"

# Test credentials
echo "\\n=== Testing Credentials ==="
aws sts get-caller-identity 2>&1
if [ \$? -eq 0 ]; then
  echo "✓ Credentials valid"
  aws sts get-caller-identity --output table
else
  echo "✗ Invalid credentials (InvalidAccessKeyId)"
  echo "Check your credentials file: ~/.aws/credentials"
fi

# Check credentials file
echo "\\n=== Credentials File ==="
if [ -f ~/.aws/credentials ]; then
  echo "Credentials file exists"
  grep -A 2 "\[default\]" ~/.aws/credentials 2>/dev/null || echo "No [default] profile"
else
  echo "Credentials file not found at ~/.aws/credentials"
fi`,
        },
        {
          language: 'bash',
          title: 'List and Verify IAM User Access Keys',
          code: `#!/bin/bash
# Get current user name
USER_NAME=\$(aws sts get-caller-identity --query Arn --output text | cut -d'/' -f2)
echo "Current user: \${USER_NAME}"

# List access keys for user
echo "\\n=== Access Keys for User ==="
aws iam list-access-keys --user-name \${USER_NAME} \\
  --query 'AccessKeyMetadata[*].[AccessKeyId,Status,CreateDate]' \\
  --output table

# Check if specific access key exists
ACCESS_KEY_ID="AKIAXXXXX"  # Replace with your key ID
echo "\\n=== Checking Access Key: \${ACCESS_KEY_ID} ==="
aws iam list-access-keys --user-name \${USER_NAME} \\
  --query "AccessKeyMetadata[?AccessKeyId=='\${ACCESS_KEY_ID}']" \\
  --output table

# Create new access key if needed
echo "\\n=== Creating New Access Key ==="
echo "WARNING: This will create a new access key. Save the secret key immediately!"
read -p "Create new access key? (y/N): " -n 1 -r
echo
if [[ \$REPLY =~ ^[Yy]\$ ]]; then
  aws iam create-access-key --user-name \${USER_NAME} \\
    --query 'AccessKey.[AccessKeyId,SecretAccessKey]' \\
    --output table
  echo "\\nIMPORTANT: Save the SecretAccessKey - it won't be shown again!"
fi`,
        },
        {
          language: 'bash',
          title: 'Fix InvalidAccessKeyId: Update Credentials',
          code: `#!/bin/bash
# Method 1: Update credentials using AWS CLI
echo "=== Updating AWS Credentials ==="
NEW_ACCESS_KEY_ID="AKIAXXXXX"  # Replace with your new key
NEW_SECRET_ACCESS_KEY="xxxxx"  # Replace with your new secret

aws configure set aws_access_key_id \${NEW_ACCESS_KEY_ID}
aws configure set aws_secret_access_key \${NEW_SECRET_ACCESS_KEY}
aws configure set region us-east-1  # Set your preferred region

# Verify new credentials
echo "\\n=== Verifying New Credentials ==="
aws sts get-caller-identity --output table

# Method 2: Update credentials file directly
echo "\\n=== Manual Credentials File Update ==="
echo "Edit ~/.aws/credentials and update:"
echo "[default]"
echo "aws_access_key_id = \${NEW_ACCESS_KEY_ID}"
echo "aws_secret_access_key = \${NEW_SECRET_ACCESS_KEY}"
echo ""
echo "Or use environment variables:"
echo "export AWS_ACCESS_KEY_ID=\${NEW_ACCESS_KEY_ID}"
echo "export AWS_SECRET_ACCESS_KEY=\${NEW_SECRET_ACCESS_KEY}"
echo "export AWS_DEFAULT_REGION=us-east-1"`,
        },
      ],
      relatedCodes: ['SignatureDoesNotMatch', 'InvalidClientTokenId'],
      provider: 'aws',
    },
    'SignatureDoesNotMatch': {
      code: 'SignatureDoesNotMatch',
      name: 'Signature Does Not Match',
      description: `Getting a **SignatureDoesNotMatch** error means AWS calculated a different request signature than what you sent—your Secret Access Key is wrong, system clock is skewed, or the request was modified after signing. This client-side error (4xx) happens when AWS validates request signatures using Signature Version 4. Most common when Secret Access Keys are incorrect, but also appears when system clocks are out of sync (more than 15 minutes), requests are modified after signing, regions don't match, or signing algorithms are wrong.`,
      metaDescription: 'Fix SignatureDoesNotMatch by verifying Secret Access Keys, synchronizing system clocks, checking region settings, and validating request signing with our AWS troubleshooting guide.',
      causes: [
        `Identity: Secret Access Key is incorrect. Access key was rotated but old secret still in use. Credentials file has wrong secret. Environment variable has typo.`,
        `Network: System clock skewed (more than 15 minutes difference). NTP not synchronized. Timezone misconfiguration. Request timestamp invalid.`,
        `Limits: Region mismatch (request signed for different region). Request modified after signing (proxy/load balancer). Wrong signing algorithm used.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check system time: date. Compare with AWS time: aws sts get-caller-identity (if this works, time is OK). Verify NTP sync: ntpq -p (Linux) or sntp -sS time.google.com (macOS).`,
        `Step 2: Diagnose - Verify Secret Access Key: aws configure list. Check credentials file: cat ~/.aws/credentials | grep aws_secret_access_key. Compare with IAM: aws iam list-access-keys --user-name USER_NAME.`,
        `Step 3: Diagnose - Check region configuration: aws configure get region. Verify region matches request: aws s3 ls --region us-east-1. Region must match in all requests.`,
        `Step 4: Fix - Synchronize system clock: sudo ntpdate -s time.nist.gov (Linux) or sudo sntp -sS time.google.com (macOS). For Windows: w32tm /resync. Restart AWS CLI after sync.`,
        `Step 5: Fix - Update Secret Access Key: aws configure set aws_secret_access_key NEW_SECRET. Or regenerate keys: aws iam create-access-key --user-name USER_NAME. Verify: aws sts get-caller-identity.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Diagnose SignatureDoesNotMatch: Check System Time',
          code: `#!/bin/bash
# Check system time
echo "=== System Time ==="
date
date -u  # UTC time

# Check time synchronization
echo "\\n=== NTP Status (Linux) ==="
if command -v ntpq &> /dev/null; then
  ntpq -p
elif command -v timedatectl &> /dev/null; then
  timedatectl status
fi

# Sync system time (Linux)
echo "\\n=== Synchronizing Time (requires sudo) ==="
echo "Linux: sudo ntpdate -s time.nist.gov"
echo "macOS: sudo sntp -sS time.google.com"
echo "Windows: w32tm /resync"

# Check time difference with AWS
echo "\\n=== Testing AWS Time Sync ==="
aws sts get-caller-identity 2>&1
if [ \$? -ne 0 ]; then
  echo "Cannot verify time with AWS (credentials may be wrong)"
else
  echo "Time appears synchronized (AWS request succeeded)"
fi`,
        },
        {
          language: 'bash',
          title: 'Verify Secret Access Key and Region',
          code: `#!/bin/bash
# Check current AWS configuration
echo "=== AWS Configuration ==="
aws configure list

# Check credentials file
echo "\\n=== Credentials File ==="
if [ -f ~/.aws/credentials ]; then
  echo "Secret Access Key (first 4 chars):"
  grep aws_secret_access_key ~/.aws/credentials | head -1 | cut -c1-30
  echo "..."
fi

# Verify region
echo "\\n=== Region Configuration ==="
REGION=\$(aws configure get region)
echo "Configured region: \${REGION}"

# Test with specific region
echo "\\n=== Testing Region Match ==="
aws s3 ls --region \${REGION} 2>&1 | head -1

# List access keys to verify secret matches
echo "\\n=== Access Keys ==="
USER_NAME=\$(aws sts get-caller-identity --query Arn --output text 2>/dev/null | cut -d'/' -f2)
if [ ! -z "\${USER_NAME}" ]; then
  aws iam list-access-keys --user-name \${USER_NAME} \\
    --query 'AccessKeyMetadata[*].[AccessKeyId,Status]' \\
    --output table
  echo "Compare AccessKeyId above with your credentials file"
fi`,
        },
        {
          language: 'bash',
          title: 'Fix SignatureDoesNotMatch: Update Credentials',
          code: `#!/bin/bash
# Method 1: Update Secret Access Key via AWS CLI
echo "=== Updating Secret Access Key ==="
NEW_SECRET_KEY="xxxxx"  # Replace with correct secret

aws configure set aws_secret_access_key \${NEW_SECRET_KEY}

# Verify new credentials
echo "\\n=== Verifying Credentials ==="
aws sts get-caller-identity --output table

# Method 2: Regenerate access keys
echo "\\n=== Regenerating Access Keys ==="
USER_NAME=\$(aws sts get-caller-identity --query Arn --output text | cut -d'/' -f2)
echo "Current user: \${USER_NAME}"
echo "WARNING: This will create new keys. Old keys will need to be deleted."
read -p "Regenerate keys? (y/N): " -n 1 -r
echo
if [[ \$REPLY =~ ^[Yy]\$ ]]; then
  # Create new key
  NEW_KEY=\$(aws iam create-access-key --user-name \${USER_NAME} \\
    --query 'AccessKey.[AccessKeyId,SecretAccessKey]' \\
    --output text)
  
  NEW_ACCESS_KEY_ID=\$(echo \${NEW_KEY} | cut -f1)
  NEW_SECRET_ACCESS_KEY=\$(echo \${NEW_KEY} | cut -f2)
  
  echo "New Access Key ID: \${NEW_ACCESS_KEY_ID}"
  echo "New Secret Access Key: \${NEW_SECRET_ACCESS_KEY}"
  echo "\\nIMPORTANT: Save the Secret Access Key - it won't be shown again!"
  
  # Update configuration
  aws configure set aws_access_key_id \${NEW_ACCESS_KEY_ID}
  aws configure set aws_secret_access_key \${NEW_SECRET_ACCESS_KEY}
  
  # Verify
  aws sts get-caller-identity --output table
fi`,
        },
      ],
      relatedCodes: ['InvalidAccessKeyId', 'RequestExpired'],
      provider: 'aws',
    },
    'Throttling': {
      code: 'Throttling',
      name: 'Throttling Exception',
      description: `Hitting a **Throttling** error means AWS is rate-limiting your requests—you're making too many API calls too quickly, exceeding service quotas, or exhausting burst capacity. This client-side error (4xx) happens when AWS enforces rate limits to protect service stability. Most common when DynamoDB, S3, or EC2 APIs are called too rapidly, but also appears when Service Quotas are exceeded, burst capacity is exhausted, or account-level throttling is active.`,
      metaDescription: 'Solve Throttling errors by implementing exponential backoff, reducing request rates, checking Service Quotas, and using request queuing with our AWS troubleshooting guide.',
      causes: [
        `Identity: IAM user/role making too many requests. Service Control Policy (SCP) enforces rate limits. Account-level throttling active.`,
        `Network: VPC endpoint throttling. Cross-region request limits. API Gateway rate limits.`,
        `Limits: DynamoDB read/write capacity exceeded. S3 request rate limit (3500 PUT/COPY/POST/DELETE per prefix per second). EC2 API rate limits. Service Quota (soft limit) exceeded. Burst capacity exhausted.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check which service is throttling: Review error message for service name. Check CloudWatch metrics: aws cloudwatch get-metric-statistics --namespace AWS/DynamoDB --metric-name ThrottledRequests.`,
        `Step 2: Diagnose - Check Service Quotas: aws service-quotas get-service-quota --service-code dynamodb --quota-code L-xxxxx. List quotas: aws service-quotas list-service-quotas --service-code SERVICE_CODE.`,
        `Step 3: Diagnose - Review request patterns: Check CloudWatch Logs for request frequency. Monitor API call rates. Identify burst patterns.`,
        `Step 4: Fix - Implement exponential backoff with jitter: Retry with delays: 1s, 2s, 4s, 8s, 16s. Use AWS SDK automatic retries. Add jitter to prevent thundering herd.`,
        `Step 5: Fix - Reduce request rate: Batch operations. Use pagination. Distribute requests over time. Request quota increase: aws service-quotas request-service-quota-increase --service-code SERVICE --quota-code QUOTA_CODE --desired-value NEW_VALUE.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check Service Quotas and Throttling Metrics',
          code: `#!/bin/bash
# Check DynamoDB throttling metrics
echo "=== DynamoDB Throttling Metrics ==="
aws cloudwatch get-metric-statistics \\
  --namespace AWS/DynamoDB \\
  --metric-name ThrottledRequests \\
  --dimensions Name=TableName,Value=MyTable \\
  --start-time \$(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \\
  --end-time \$(date -u +%Y-%m-%dT%H:%M:%S) \\
  --period 300 \\
  --statistics Sum \\
  --output table

# Check Service Quotas for DynamoDB
echo "\\n=== DynamoDB Service Quotas ==="
aws service-quotas list-service-quotas \\
  --service-code dynamodb \\
  --query 'Quotas[?QuotaName==\`Provisioned read capacity units\`].[QuotaName,Value,Adjustable]' \\
  --output table

# Get specific quota
QUOTA_CODE="L-xxxxx"  # Replace with actual quota code
echo "\\n=== Specific Quota Details ==="
aws service-quotas get-service-quota \\
  --service-code dynamodb \\
  --quota-code \${QUOTA_CODE} \\
  --query '[QuotaName,Value,Adjustable]' \\
  --output table`,
        },
        {
          language: 'bash',
          title: 'Request Service Quota Increase',
          code: `#!/bin/bash
# Request quota increase for DynamoDB
SERVICE_CODE="dynamodb"
QUOTA_CODE="L-xxxxx"  # Replace with actual quota code
CURRENT_VALUE=1000
DESIRED_VALUE=5000

echo "=== Requesting Quota Increase ==="
echo "Service: \${SERVICE_CODE}"
echo "Quota Code: \${QUOTA_CODE}"
echo "Current Value: \${CURRENT_VALUE}"
echo "Desired Value: \${DESIRED_VALUE}"

aws service-quotas request-service-quota-increase \\
  --service-code \${SERVICE_CODE} \\
  --quota-code \${QUOTA_CODE} \\
  --desired-value \${DESIRED_VALUE}

# Check request status
echo "\\n=== Quota Increase Requests ==="
aws service-quotas list-requested-service-quota-change-history \\
  --service-code \${SERVICE_CODE} \\
  --query 'RequestedQuotas[*].[QuotaName,DesiredValue,Status]' \\
  --output table`,
        },
        {
          language: 'bash',
          title: 'Implement Exponential Backoff with Retry',
          code: `#!/bin/bash
# Function to retry AWS CLI commands with exponential backoff
retry_aws_command() {
  local max_retries=5
  local attempt=0
  local delay=1
  
  while [ \$attempt -lt \${max_retries} ]; do
    if "\$@"; then
      return 0
    fi
    
    local exit_code=\$?
    if [ \$exit_code -ne 0 ]; then
      # Check if error is throttling
      if echo "\$*" | grep -q "Throttling\\|ThrottledException"; then
        attempt=\$((attempt + 1))
        if [ \$attempt -lt \${max_retries} ]; then
          # Exponential backoff with jitter
          delay=\$((2 ** attempt + RANDOM % 1000 / 1000))
          echo "Throttled, retrying in \${delay}s (attempt \${attempt}/\${max_retries})..."
          sleep \${delay}
          continue
        fi
      fi
      return \$exit_code
    fi
  done
  
  return 1
}

# Example usage
echo "=== Retrying DynamoDB GetItem with Backoff ==="
retry_aws_command aws dynamodb get-item \\
  --table-name MyTable \\
  --key '{"id":{"S":"123"}}' \\
  --output json`,
        },
      ],
      relatedCodes: ['ServiceUnavailable', 'TooManyRequestsException'],
      provider: 'aws',
    },
    'ResourceNotFoundException': {
      code: 'ResourceNotFoundException',
      name: 'Resource Not Found',
      description: `Getting a **ResourceNotFoundException** means the AWS resource you're trying to access doesn't exist—the resource ID is wrong, it was deleted, or it's in a different region/account. This client-side error (4xx) is common across DynamoDB, Lambda, EC2, and other AWS services. Most common when resource IDs have typos, but also appears when resources were deleted, resources are in different regions, resources belong to different accounts, or IAM policies don't grant List permissions to see the resource.`,
      metaDescription: 'Debug ResourceNotFoundException by listing resources, verifying resource IDs, checking regions, and reviewing IAM permissions with our AWS troubleshooting guide.',
      causes: [
        `Identity: IAM policy missing List/Describe permissions. Resource in different AWS account. Cross-account access not configured.`,
        `Network: Resource in different region. VPC endpoint routing to wrong region. Cross-region replication not complete.`,
        `Limits: Resource ID is incorrect. Resource was deleted. Typo in resource identifier. Resource doesn't exist.`,
      ],
      solutions: [
        `Step 1: Diagnose - List resources to find correct ID: DynamoDB: aws dynamodb list-tables. Lambda: aws lambda list-functions. EC2: aws ec2 describe-instances. S3: aws s3 ls.`,
        `Step 2: Diagnose - Check if resource exists: DynamoDB: aws dynamodb describe-table --table-name TABLE_NAME. Lambda: aws lambda get-function --function-name FUNCTION_NAME. EC2: aws ec2 describe-instances --instance-ids i-xxxxx.`,
        `Step 3: Diagnose - Verify region: Check current region: aws configure get region. List resources in different regions: aws ec2 describe-instances --region us-west-2. Resource might be in different region.`,
        `Step 4: Fix - Check resource in all regions: For EC2: Loop through regions and search. For DynamoDB: Check region where table was created. For Lambda: Verify function region matches request.`,
        `Step 5: Fix - Verify IAM permissions: aws iam simulate-principal-policy --policy-source-arn YOUR_ARN --action-names dynamodb:DescribeTable --resource-arns arn:aws:dynamodb:REGION:ACCOUNT:table/TABLE_NAME. Ensure List/Describe permissions exist.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'List Resources to Find Correct IDs',
          code: `#!/bin/bash
# List DynamoDB tables
echo "=== DynamoDB Tables ==="
aws dynamodb list-tables --output table

# List Lambda functions
echo "\\n=== Lambda Functions ==="
aws lambda list-functions --query 'Functions[*].[FunctionName,Runtime]' --output table

# List EC2 instances
echo "\\n=== EC2 Instances ==="
aws ec2 describe-instances \\
  --query 'Reservations[*].Instances[*].[InstanceId,InstanceType,State.Name]' \\
  --output table

# List S3 buckets
echo "\\n=== S3 Buckets ==="
aws s3 ls

# List IAM roles
echo "\\n=== IAM Roles ==="
aws iam list-roles --query 'Roles[*].[RoleName,Arn]' --output table | head -20`,
        },
        {
          language: 'bash',
          title: 'Check Resource in Different Regions',
          code: `#!/bin/bash
# Check DynamoDB table in different regions
TABLE_NAME="MyTable"
REGIONS=("us-east-1" "us-west-2" "eu-west-1")

echo "=== Checking Table in Different Regions ==="
for REGION in "\${REGIONS[@]}"; do
  echo "\\nChecking region: \${REGION}"
  aws dynamodb describe-table \\
    --table-name \${TABLE_NAME} \\
    --region \${REGION} 2>&1 | head -3
done

# Check Lambda function in different regions
FUNCTION_NAME="my-function"
echo "\\n=== Checking Lambda Function ==="
for REGION in "\${REGIONS[@]}"; do
  echo "\\nRegion: \${REGION}"
  aws lambda get-function \\
    --function-name \${FUNCTION_NAME} \\
    --region \${REGION} \\
    --query 'Configuration.[FunctionName,Runtime,LastModified]' \\
    --output table 2>&1 | head -5
done`,
        },
        {
          language: 'bash',
          title: 'Verify IAM Permissions for Resource Access',
          code: `#!/bin/bash
# Get your identity
IDENTITY_ARN=\$(aws sts get-caller-identity --query Arn --output text)
TABLE_NAME="MyTable"
REGION="us-east-1"
ACCOUNT_ID=\$(aws sts get-caller-identity --query Account --output text)

# Simulate DynamoDB permissions
echo "=== Simulating DynamoDB Permissions ==="
aws iam simulate-principal-policy \\
  --policy-source-arn \${IDENTITY_ARN} \\
  --action-names dynamodb:DescribeTable dynamodb:ListTables \\
  --resource-arns "arn:aws:dynamodb:\${REGION}:\${ACCOUNT_ID}:table/\${TABLE_NAME}" \\
  --query 'EvaluationResults[*].[EvalActionName,EvalDecision]' \\
  --output table

# Check if you can list resources
echo "\\n=== Testing List Permissions ==="
aws dynamodb list-tables 2>&1 | head -5
if [ \$? -eq 0 ]; then
  echo "✓ Can list tables"
else
  echo "✗ Cannot list tables (check IAM permissions)"
fi`,
        },
      ],
      relatedCodes: ['NoSuchBucket', 'NoSuchKey'],
      provider: 'aws',
    },
    'InvalidParameter': {
      code: 'InvalidParameter',
      name: 'Invalid Parameter',
      description: `Hitting an **InvalidParameter** error means one of your API parameters has the wrong name, type, or value—parameter names must match AWS API exactly, types must be correct (string vs number), and values must be valid. This client-side error (4xx) happens when AWS validates request parameters. Most common when parameter names are misspelled, but also appears when parameter types are wrong, required parameters are missing, parameter values are invalid, or unsupported parameter combinations are used.`,
      metaDescription: 'Fix InvalidParameter errors by validating parameter names, checking types, reviewing API documentation, and ensuring required parameters are included with our AWS guide.',
      causes: [
        `Identity: IAM policy parameter restrictions. Service Control Policy (SCP) blocks parameter values. Parameter conditions not met.`,
        `Network: VPC endpoint parameter restrictions. Cross-region parameter validation.`,
        `Limits: Parameter name incorrect (case-sensitive). Parameter type mismatch (string vs number). Invalid parameter value (out of range). Missing required parameter. Unsupported parameter combination.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check exact error message: AWS usually specifies which parameter is invalid. Review parameter name spelling (case-sensitive). Check parameter value format.`,
        `Step 2: Diagnose - Use AWS CLI help to see valid parameters: aws ec2 run-instances help. Review parameter names and types. Check required vs optional parameters.`,
        `Step 3: Diagnose - Validate parameter types: Numbers must be numbers, not strings. Booleans must be true/false. Arrays must be proper JSON arrays. Check: echo PARAM_VALUE | jq type.`,
        `Step 4: Fix - Review API documentation: Check AWS API Reference for exact parameter names. Verify parameter value ranges. Check for required parameters.`,
        `Step 5: Fix - Validate before sending: Use dry-run if available: aws ec2 run-instances --dry-run. Check parameter format: aws ec2 describe-instances help | grep PARAM_NAME. Test with minimal parameters first.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Use AWS CLI Help to Validate Parameters',
          code: `#!/bin/bash
# Get help for EC2 run-instances to see valid parameters
echo "=== EC2 Run Instances Parameters ==="
aws ec2 run-instances help | grep -A 5 "SYNOPSIS"

# Check specific parameter
echo "\\n=== InstanceType Parameter ==="
aws ec2 run-instances help | grep -A 10 "InstanceType"

# List valid instance types
echo "\\n=== Valid Instance Types ==="
aws ec2 describe-instance-types \\
  --query 'InstanceTypes[*].InstanceType' \\
  --output table | head -20

# Use dry-run to validate parameters
echo "\\n=== Dry-Run Parameter Validation ==="
AMI_ID="ami-xxxxx"  # Replace with valid AMI
INSTANCE_TYPE="t2.micro"

aws ec2 run-instances \\
  --image-id \${AMI_ID} \\
  --instance-type \${INSTANCE_TYPE} \\
  --count 1 \\
  --dry-run 2>&1

if [ \$? -eq 0 ]; then
  echo "✓ Parameters valid (dry-run succeeded)"
else
  echo "✗ Invalid parameters (check error message above)"
fi`,
        },
        {
          language: 'bash',
          title: 'Validate Parameter Types and Values',
          code: `#!/bin/bash
# Validate AMI ID format
AMI_ID="ami-12345678"
echo "=== Validating AMI ID ==="
if [[ \${AMI_ID} =~ ^ami-[0-9a-f]{8,17}\$ ]]; then
  echo "✓ AMI ID format valid"
else
  echo "✗ Invalid AMI ID format (should be ami-xxxxxxxx)"
fi

# Validate instance type
INSTANCE_TYPE="t2.micro"
echo "\\n=== Validating Instance Type ==="
VALID_TYPES=("t2.micro" "t2.small" "t2.medium" "t3.micro" "t3.small")
if [[ " \${VALID_TYPES[@]} " =~ " \${INSTANCE_TYPE} " ]]; then
  echo "✓ Instance type valid"
else
  echo "✗ Invalid instance type"
  echo "Valid types: \${VALID_TYPES[*]}"
fi

# Validate count (must be number, 1-10)
MIN_COUNT="1"
echo "\\n=== Validating Count ==="
if [[ \${MIN_COUNT} =~ ^[0-9]+\$ ]] && [ \${MIN_COUNT} -ge 1 ] && [ \${MIN_COUNT} -le 10 ]; then
  echo "✓ Count valid (1-10)"
else
  echo "✗ Invalid count (must be number between 1-10)"
fi

# Check parameter types with jq (if available)
echo "\\n=== Parameter Type Validation ==="
if command -v jq &> /dev/null; then
  echo '{"count": 1, "enabled": true}' | jq 'type'  # Should be "object"
  echo '"string"' | jq 'type'  # Should be "string"
  echo '123' | jq 'type'  # Should be "number"
fi`,
        },
        {
          language: 'bash',
          title: 'Test Parameters with Minimal Request',
          code: `#!/bin/bash
# Start with minimal parameters and add more
echo "=== Testing with Minimal Parameters ==="

# Step 1: Test with just required parameters
AMI_ID="ami-xxxxx"  # Replace with valid AMI
echo "Testing: ImageId only"
aws ec2 run-instances \\
  --image-id \${AMI_ID} \\
  --dry-run 2>&1 | head -3

# Step 2: Add instance type
INSTANCE_TYPE="t2.micro"
echo "\\nTesting: ImageId + InstanceType"
aws ec2 run-instances \\
  --image-id \${AMI_ID} \\
  --instance-type \${INSTANCE_TYPE} \\
  --dry-run 2>&1 | head -3

# Step 3: Add count
echo "\\nTesting: ImageId + InstanceType + Count"
aws ec2 run-instances \\
  --image-id \${AMI_ID} \\
  --instance-type \${INSTANCE_TYPE} \\
  --count 1 \\
  --dry-run 2>&1 | head -3

# If all succeed, parameters are valid
echo "\\n=== Parameter Validation Complete ==="
echo "If dry-run succeeds, parameters are valid"`,
        },
      ],
      relatedCodes: ['InvalidParameterValue', 'MissingParameter'],
      provider: 'aws',
    },
    'LimitExceededException': {
      code: 'LimitExceededException',
      name: 'Limit Exceeded',
      description: `Hitting a **LimitExceededException** means your request would exceed AWS Service Quotas—you've reached the maximum number of resources, operations, or concurrent actions allowed for your account. This client-side error (4xx) happens when AWS enforces account-level or service-level limits. Most common when creating too many EC2 instances, DynamoDB tables, or IAM roles, but also appears when Service Quotas (formerly soft limits) are exceeded, concurrent operation limits are hit, or account-level resource caps are reached.`,
      metaDescription: 'Fix LimitExceededException by checking Service Quotas, deleting unused resources, requesting limit increases, and monitoring current usage with our AWS troubleshooting guide.',
      causes: [
        `Identity: IAM role/user limit exceeded. Service Control Policy (SCP) enforces lower limits. Account-level restrictions active.`,
        `Network: VPC endpoint limits. Security Group rules limit (50 rules per group). NACL rules limit (20 rules per direction).`,
        `Limits: EC2 instance limit (default 20 per region). DynamoDB table limit (256 per region). IAM role limit (5000 per account). Service Quota exceeded. Concurrent operation limit hit.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check current resource counts: EC2: aws ec2 describe-instances --query 'length(Reservations[*].Instances[*])'. DynamoDB: aws dynamodb list-tables --query 'length(TableNames)'. IAM: aws iam list-roles --query 'length(Roles)'.`,
        `Step 2: Diagnose - Check Service Quotas: aws service-quotas list-service-quotas --service-code ec2 --query 'Quotas[?QuotaName==\`Running On-Demand EC2 instances\`].[QuotaName,Value,UsageMetric]' --output table. Compare current usage vs limit.`,
        `Step 3: Diagnose - Identify which limit is exceeded: Review error message for specific service/resource. Check CloudWatch metrics for usage. Review Service Quotas dashboard.`,
        `Step 4: Fix - Delete unused resources: EC2: aws ec2 terminate-instances --instance-ids i-xxxxx. DynamoDB: aws dynamodb delete-table --table-name TABLE_NAME. IAM: aws iam delete-role --role-name ROLE_NAME.`,
        `Step 5: Fix - Request quota increase: aws service-quotas request-service-quota-increase --service-code SERVICE_CODE --quota-code QUOTA_CODE --desired-value NEW_VALUE. Check request status: aws service-quotas list-requested-service-quota-change-history --service-code SERVICE_CODE.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check Current Resource Counts and Limits',
          code: `#!/bin/bash
# Check EC2 instance count
echo "=== EC2 Instances ==="
INSTANCE_COUNT=\$(aws ec2 describe-instances \\
  --query 'length(Reservations[*].Instances[*])' \\
  --output text)
echo "Current instances: \${INSTANCE_COUNT}"

# Check DynamoDB table count
echo "\\n=== DynamoDB Tables ==="
TABLE_COUNT=\$(aws dynamodb list-tables \\
  --query 'length(TableNames)' \\
  --output text)
echo "Current tables: \${TABLE_COUNT}"

# Check IAM role count
echo "\\n=== IAM Roles ==="
ROLE_COUNT=\$(aws iam list-roles \\
  --query 'length(Roles)' \\
  --output text)
echo "Current roles: \${ROLE_COUNT}"

# Check Service Quotas
echo "\\n=== EC2 Service Quotas ==="
aws service-quotas list-service-quotas \\
  --service-code ec2 \\
  --query 'Quotas[?contains(QuotaName, '\''On-Demand'\'') || contains(QuotaName, '\''Instance'\'')].QuotaName' \\
  --output table`,
        },
        {
          language: 'bash',
          title: 'Request Service Quota Increase',
          code: `#!/bin/bash
# Request EC2 instance limit increase
SERVICE_CODE="ec2"
QUOTA_CODE="L-34B43A08"  # Running On-Demand EC2 instances
CURRENT_VALUE=20
DESIRED_VALUE=50

echo "=== Requesting Quota Increase ==="
echo "Service: \${SERVICE_CODE}"
echo "Quota: Running On-Demand EC2 instances"
echo "Current: \${CURRENT_VALUE}"
echo "Desired: \${DESIRED_VALUE}"

aws service-quotas request-service-quota-increase \\
  --service-code \${SERVICE_CODE} \\
  --quota-code \${QUOTA_CODE} \\
  --desired-value \${DESIRED_VALUE}

# Check request status
echo "\\n=== Quota Increase Requests ==="
aws service-quotas list-requested-service-quota-change-history \\
  --service-code \${SERVICE_CODE} \\
  --query 'RequestedQuotas[*].[QuotaName,DesiredValue,Status,Created]' \\
  --output table`,
        },
        {
          language: 'bash',
          title: 'Delete Unused Resources to Free Up Limits',
          code: `#!/bin/bash
# List stopped EC2 instances
echo "=== Stopped EC2 Instances ==="
aws ec2 describe-instances \\
  --filters "Name=instance-state-name,Values=stopped" \\
  --query 'Reservations[*].Instances[*].[InstanceId,InstanceType,LaunchTime]' \\
  --output table

# Delete specific instance (be careful!)
INSTANCE_ID="i-xxxxx"  # Replace with actual instance ID
echo "\\n=== Terminating Instance: \${INSTANCE_ID} ==="
read -p "Are you sure? (y/N): " -n 1 -r
echo
if [[ \$REPLY =~ ^[Yy]\$ ]]; then
  aws ec2 terminate-instances --instance-ids \${INSTANCE_ID}
fi

# List empty DynamoDB tables
echo "\\n=== DynamoDB Tables ==="
aws dynamodb list-tables --output table

# Delete unused IAM roles
echo "\\n=== Unused IAM Roles ==="
aws iam list-roles --query 'Roles[*].[RoleName,CreateDate]' --output table | head -20`,
        },
      ],
      relatedCodes: ['Throttling', 'ServiceQuotaExceededException'],
      provider: 'aws',
    },
    'InsufficientCapacityException': {
      code: 'InsufficientCapacityException',
      name: 'Insufficient Capacity',
      description: `Getting an **InsufficientCapacityException** means AWS doesn't have enough physical capacity in the requested Availability Zone to launch your EC2 instance—the specific instance type or zone is temporarily out of capacity. This client-side error (4xx) happens when AWS can't allocate hardware resources. Most common when launching EC2 instances in popular zones, but also appears when specific instance types are unavailable, regions have capacity constraints, Spot instances have no capacity, or temporary capacity issues occur.`,
      metaDescription: 'Resolve InsufficientCapacityException by trying different Availability Zones, switching instance types, retrying with delays, or using on-demand instead of Spot with our AWS guide.',
      causes: [
        `Identity: IAM permissions allow launch but capacity unavailable. Service Control Policy (SCP) restricts zones but capacity issue.`,
        `Network: VPC subnet in zone with no capacity. Security Group in unavailable zone.`,
        `Limits: No capacity in requested Availability Zone. Instance type not available in zone. Region capacity exhausted. Spot instance capacity unavailable. Temporary capacity issue (retry later).`,
      ],
      solutions: [
        `Step 1: Diagnose - Check which zone/instance type failed: Review error message for specific Availability Zone. Note the instance type that failed. Check if it's Spot or On-Demand.`,
        `Step 2: Diagnose - List available Availability Zones: aws ec2 describe-availability-zones --region REGION --query 'AvailabilityZones[*].[ZoneName,State]' --output table. Check zone state (available/unavailable).`,
        `Step 3: Diagnose - Check instance type availability: aws ec2 describe-instance-type-offerings --location-type availability-zone --filters Name=instance-type,Values=INSTANCE_TYPE --query 'InstanceTypeOfferings[*].Location' --output table. Find zones with capacity.`,
        `Step 4: Fix - Try different Availability Zone: aws ec2 run-instances --image-id ami-xxxxx --instance-type t2.micro --placement AvailabilityZone=us-east-1b. Loop through zones until one works.`,
        `Step 5: Fix - Try different instance type: aws ec2 run-instances --image-id ami-xxxxx --instance-type t3.micro --placement AvailabilityZone=us-east-1a. Use similar instance families (t2 → t3, m5 → m5a). Retry after delay if temporary.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'List Available Zones and Instance Types',
          code: `#!/bin/bash
REGION="us-east-1"

# List all Availability Zones
echo "=== Availability Zones in \${REGION} ==="
aws ec2 describe-availability-zones \\
  --region \${REGION} \\
  --query 'AvailabilityZones[*].[ZoneName,State]' \\
  --output table

# Check instance type availability in zones
INSTANCE_TYPE="t2.micro"
echo "\\n=== Checking \${INSTANCE_TYPE} Availability ==="
aws ec2 describe-instance-type-offerings \\
  --location-type availability-zone \\
  --filters Name=instance-type,Values=\${INSTANCE_TYPE} \\
  --region \${REGION} \\
  --query 'InstanceTypeOfferings[*].Location' \\
  --output table`,
        },
        {
          language: 'bash',
          title: 'Launch Instance with Zone Fallback',
          code: `#!/bin/bash
AMI_ID="ami-xxxxx"  # Replace with valid AMI
INSTANCE_TYPE="t2.micro"
REGION="us-east-1"

# Get available zones
ZONES=(\$(aws ec2 describe-availability-zones \\
  --region \${REGION} \\
  --query 'AvailabilityZones[*].ZoneName' \\
  --output text))

echo "=== Trying Zones: \${ZONES[*]} ==="

# Try each zone until one works
for ZONE in "\${ZONES[@]}"; do
  echo "\\nTrying zone: \${ZONE}"
  aws ec2 run-instances \\
    --image-id \${AMI_ID} \\
    --instance-type \${INSTANCE_TYPE} \\
    --placement AvailabilityZone=\${ZONE} \\
    --count 1 \\
    --region \${REGION} 2>&1
  
  if [ \$? -eq 0 ]; then
    echo "✓ Successfully launched in \${ZONE}"
    break
  else
    echo "✗ No capacity in \${ZONE}, trying next..."
  fi
done`,
        },
        {
          language: 'bash',
          title: 'Try Different Instance Types as Fallback',
          code: `#!/bin/bash
AMI_ID="ami-xxxxx"
ZONE="us-east-1a"

# Fallback instance types (similar families)
FALLBACK_TYPES=("t3.micro" "t2.micro" "t3.small" "t2.small")

echo "=== Trying Instance Types in \${ZONE} ==="
for INSTANCE_TYPE in "\${FALLBACK_TYPES[@]}"; do
  echo "\\nTrying: \${INSTANCE_TYPE}"
  aws ec2 run-instances \\
    --image-id \${AMI_ID} \\
    --instance-type \${INSTANCE_TYPE} \\
    --placement AvailabilityZone=\${ZONE} \\
    --count 1 2>&1
  
  if [ \$? -eq 0 ]; then
    echo "✓ Successfully launched \${INSTANCE_TYPE}"
    break
  else
    echo "✗ No capacity for \${INSTANCE_TYPE}"
  fi
done`,
        },
      ],
      relatedCodes: ['ServiceUnavailable', 'Unavailable'],
      provider: 'aws',
    },
    'InvalidUserID.NotFound': {
      code: 'InvalidUserID.NotFound',
      name: 'Invalid User ID Not Found',
      description: `Getting an **InvalidUserID.NotFound** error means the IAM User ID you're referencing doesn't exist in your AWS account—the user might have been deleted, the ID is misspelled, or it belongs to a different account. This client-side error (4xx) happens when AWS can't find the user by ID. Most common when IAM users are deleted, but also appears when user IDs are misspelled, users are in different accounts, user ID format is invalid, or IAM policies reference non-existent users.`,
      metaDescription: 'Fix InvalidUserID.NotFound by listing IAM users, verifying user IDs, checking if users were deleted, and using usernames instead of IDs with our AWS troubleshooting guide.',
      causes: [
        `Identity: IAM user ID doesn't exist. User was deleted from account. User ID belongs to different AWS account. User ID format invalid (should be AIDA...).`,
        `Network: Cross-account user reference. IAM user in different region (users are global).`,
        `Limits: Typo in user ID. User ID format incorrect. User never existed.`,
      ],
      solutions: [
        `Step 1: Diagnose - List all IAM users to find correct ID: aws iam list-users --query 'Users[*].[UserId,UserName,CreateDate]' --output table. Compare UserId with your reference.`,
        `Step 2: Diagnose - Get user by username instead of ID: aws iam get-user --user-name USER_NAME --query 'User.[UserId,UserName,Arn]' --output table. Usernames are more reliable than IDs.`,
        `Step 3: Diagnose - Check if user was deleted: Review IAM user deletion logs. Check CloudTrail: aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=DeleteUser --query 'Events[*].CloudTrailEvent' --output text | jq '.userIdentity.userName'.`,
        `Step 4: Fix - Use username instead of user ID: Replace UserId references with UserName in IAM policies. Update code to use usernames: aws iam get-user --user-name USER_NAME.`,
        `Step 5: Fix - Verify user exists before referencing: aws iam get-user --user-name USER_NAME. If user doesn't exist, create it: aws iam create-user --user-name USER_NAME. Or update references to use existing users.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'List IAM Users and Find Correct User ID',
          code: `#!/bin/bash
# List all IAM users with their IDs
echo "=== All IAM Users ==="
aws iam list-users \\
  --query 'Users[*].[UserId,UserName,CreateDate]' \\
  --output table

# Search for specific user
SEARCH_NAME="john"
echo "\\n=== Searching for User: \${SEARCH_NAME} ==="
aws iam list-users \\
  --query "Users[?contains(UserName, '\${SEARCH_NAME}')].[UserId,UserName]" \\
  --output table

# Get user by username (more reliable than ID)
USER_NAME="myuser"
echo "\\n=== Getting User by Name: \${USER_NAME} ==="
aws iam get-user --user-name \${USER_NAME} \\
  --query 'User.[UserId,UserName,Arn,CreateDate]' \\
  --output table 2>&1

if [ \$? -ne 0 ]; then
  echo "User not found. Listing all users:"
  aws iam list-users --query 'Users[*].UserName' --output table
fi`,
        },
        {
          language: 'bash',
          title: 'Check CloudTrail for User Deletion',
          code: `#!/bin/bash
# Check CloudTrail for user deletion events
USER_NAME="myuser"
echo "=== Checking CloudTrail for User: \${USER_NAME} ==="

aws cloudtrail lookup-events \\
  --lookup-attributes AttributeKey=EventName,AttributeValue=DeleteUser \\
  --max-results 10 \\
  --query 'Events[*].[EventTime,CloudTrailEvent]' \\
  --output text | while read time event; do
    echo "Time: \${time}"
    echo "\${event}" | jq -r '.userIdentity.userName' 2>/dev/null || echo "Could not parse"
    echo "---"
  done

# Check if user exists now
echo "\\n=== Checking Current User Status ==="
aws iam get-user --user-name \${USER_NAME} 2>&1 || echo "User does not exist"`,
        },
        {
          language: 'bash',
          title: 'Use Username Instead of User ID',
          code: `#!/bin/bash
# Instead of using User ID, use Username
USER_NAME="myuser"

# Get user details by username
echo "=== Getting User by Username ==="
USER_INFO=\$(aws iam get-user --user-name \${USER_NAME} \\
  --query 'User.[UserId,UserName,Arn]' \\
  --output text 2>&1)

if [ \$? -eq 0 ]; then
  USER_ID=\$(echo \${USER_INFO} | cut -f1)
  USER_NAME=\$(echo \${USER_INFO} | cut -f2)
  USER_ARN=\$(echo \${USER_INFO} | cut -f3)
  
  echo "User ID: \${USER_ID}"
  echo "User Name: \${USER_NAME}"
  echo "User ARN: \${USER_ARN}"
  
  # Use username in IAM policy references
  echo "\\n=== Example: Using Username in Policy ==="
  echo "Instead of: arn:aws:iam::ACCOUNT:user/\${USER_ID}"
  echo "Use: arn:aws:iam::ACCOUNT:user/\${USER_NAME}"
else
  echo "User not found. Create user:"
  echo "aws iam create-user --user-name \${USER_NAME}"
fi`,
        },
      ],
      relatedCodes: ['AccessDenied', 'NoSuchEntity'],
      provider: 'aws',
    },
    'MalformedQueryString': {
      code: 'MalformedQueryString',
      name: 'Malformed Query String',
      description: `Hitting a **MalformedQueryString** error means your AWS API request has invalid query string syntax—special characters aren't URL-encoded, parameters are duplicated, or the query format violates AWS API requirements. This client-side error (4xx) happens when AWS parses query parameters. Most common when building S3 presigned URLs or API Gateway requests manually, but also appears when query parameters have unencoded special characters, duplicate parameter names exist, or query string syntax is invalid.`,
      metaDescription: 'Debug MalformedQueryString by URL-encoding parameters, checking for duplicate keys, validating query syntax, and using AWS SDK parameter objects with our AWS guide.',
      causes: [
        `Identity: IAM policy query string restrictions. Service Control Policy (SCP) blocks certain query parameters.`,
        `Network: VPC endpoint query string validation. API Gateway query parameter limits.`,
        `Limits: Query string too long. Invalid query format. Unencoded special characters (&, =, +, space). Duplicate parameter names. Missing required parameters.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check exact error message: AWS usually specifies which parameter is malformed. Review query string for special characters. Check for duplicate parameters.`,
        `Step 2: Diagnose - Validate query string format: Query should be key=value&key2=value2. No unencoded spaces, &, =, or +. Use URL encoding: space=%20, &=%26, ==%3D.`,
        `Step 3: Diagnose - Check parameter encoding: Use URL encoding for special chars. Spaces must be %20 or +. & must be %26. = must be %3D. Test with: echo "param=value with space" | sed 's/ /%20/g'.`,
        `Step 4: Fix - Use AWS SDK parameter objects: Instead of building query strings manually, use SDK: aws s3api list-objects-v2 --bucket BUCKET --prefix PREFIX. SDK handles encoding automatically.`,
        `Step 5: Fix - Encode query parameters properly: Use URL encoding: curl "https://s3.amazonaws.com/bucket?prefix=folder%2Fsubfolder&max-keys=100". Or use AWS CLI which handles encoding: aws s3api list-objects-v2 --bucket bucket --prefix "folder/subfolder" --max-keys 100.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Use AWS CLI to Avoid Query String Issues',
          code: `#!/bin/bash
# AWS CLI handles encoding automatically - use it instead of manual query strings
BUCKET_NAME="my-bucket"
PREFIX="folder/subfolder"

echo "=== Using AWS CLI (handles encoding) ==="
aws s3api list-objects-v2 \\
  --bucket \${BUCKET_NAME} \\
  --prefix "\${PREFIX}" \\
  --max-keys 100

# This is better than manually building:
# BAD: https://s3.amazonaws.com/bucket?prefix=folder/subfolder
# GOOD: Use AWS CLI or SDK which encodes automatically`,
        },
        {
          language: 'bash',
          title: 'URL Encode Query Parameters Manually',
          code: `#!/bin/bash
# Function to URL encode a string
urlencode() {
  local string="\${1}"
  local strlen=\${#string}
  local encoded=""
  
  for (( pos=0 ; pos<strlen ; pos++ )); do
    c=\${string:\$pos:1}
    case "\$c" in
      [-_.~a-zA-Z0-9] ) encoded+="\${c}" ;;
      " " ) encoded+="%20" ;;
      "&" ) encoded+="%26" ;;
      "=" ) encoded+="%3D" ;;
      "+" ) encoded+="%2B" ;;
      * ) printf -v encoded "%%%02x" "'\$c" ;;
    esac
  done
  echo "\${encoded}"
}

# Example: Encode a prefix with special characters
PREFIX="folder/subfolder with spaces"
ENCODED_PREFIX=\$(urlencode "\${PREFIX}")
echo "Original: \${PREFIX}"
echo "Encoded: \${ENCODED_PREFIX}"

# Build query string properly
BUCKET="my-bucket"
QUERY_STRING="prefix=\${ENCODED_PREFIX}&max-keys=100"
echo "\\nQuery string: \${QUERY_STRING}"`,
        },
        {
          language: 'bash',
          title: 'Validate Query String Format',
          code: `#!/bin/bash
# Check for common query string issues
QUERY_STRING="prefix=folder/sub&max-keys=100&duplicate=1&duplicate=2"

echo "=== Checking Query String: \${QUERY_STRING} ==="

# Check for unencoded special characters
if [[ \${QUERY_STRING} =~ [^a-zA-Z0-9%&=._-] ]]; then
  echo "✗ Contains unencoded special characters"
  echo "  Encode spaces, &, =, and other special chars"
else
  echo "✓ No obvious encoding issues"
fi

# Check for duplicate parameters
echo "\\n=== Checking for Duplicate Parameters ==="
PARAMS=\$(echo \${QUERY_STRING} | tr '&' '\\n' | cut -d'=' -f1)
DUPLICATES=\$(echo "\${PARAMS}" | sort | uniq -d)
if [ ! -z "\${DUPLICATES}" ]; then
  echo "✗ Duplicate parameters found: \${DUPLICATES}"
  echo "  Remove duplicates from query string"
else
  echo "✓ No duplicate parameters"
fi

# Best practice: Use AWS CLI instead
echo "\\n=== Best Practice: Use AWS CLI ==="
echo "Instead of building query strings manually, use:"
echo "aws s3api list-objects-v2 --bucket BUCKET --prefix PREFIX --max-keys 100"`,
        },
      ],
      relatedCodes: ['InvalidParameter', 'InvalidRequest'],
      provider: 'aws',
    },
    'RequestExpired': {
      code: 'RequestExpired',
      name: 'Request Expired',
      description: `Getting a **RequestExpired** error means your S3 presigned URL or AWS request has passed its expiration time—presigned URLs typically expire after 1 hour (default) or the time you specified, and AWS requests expire if the timestamp is more than 15 minutes old. This client-side error (4xx) happens when AWS validates request timestamps. Most common when S3 presigned URLs expire, but also appears when system clocks are skewed, request timestamps are too old, or expiration times are set too short.`,
      metaDescription: 'Fix RequestExpired by generating new presigned URLs, synchronizing system clocks, increasing expiration times, and validating timestamp validity with our AWS guide.',
      causes: [
        `Identity: IAM policy expiration restrictions. Service Control Policy (SCP) enforces shorter expiration times.`,
        `Network: VPC endpoint request timeout. Clock skew between client and AWS (more than 15 minutes).`,
        `Limits: Presigned URL expired (default 1 hour, max 7 days for S3). Request timestamp too old (AWS allows 15 minutes clock skew). Expiration time passed. Time-based token expired.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check presigned URL expiration: Review when URL was generated. Check expiration parameter: aws s3 presign s3://BUCKET/KEY --expires-in 3600. Default is 1 hour (3600 seconds).`,
        `Step 2: Diagnose - Check system clock: date. Compare with AWS time: aws sts get-caller-identity (if this works, clock is OK). Verify NTP sync: ntpq -p (Linux). Clock skew must be < 15 minutes.`,
        `Step 3: Diagnose - Check request timestamp: Review X-Amz-Date header in request. Timestamp must be within 15 minutes of AWS server time. Check if request was cached/delayed.`,
        `Step 4: Fix - Generate new presigned URL: aws s3 presign s3://BUCKET/KEY --expires-in 3600. Increase expiration if needed (max 7 days for S3): aws s3 presign s3://BUCKET/KEY --expires-in 604800.`,
        `Step 5: Fix - Synchronize system clock: Linux: sudo ntpdate -s time.nist.gov. macOS: sudo sntp -sS time.google.com. Windows: w32tm /resync. Restart AWS CLI after sync.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Generate Presigned URLs with Expiration',
          code: `#!/bin/bash
BUCKET_NAME="my-bucket"
OBJECT_KEY="path/to/file.txt"

# Generate presigned URL (default 1 hour = 3600 seconds)
echo "=== Generating Presigned URL (1 hour) ==="
PRESIGNED_URL=\$(aws s3 presign s3://\${BUCKET_NAME}/\${OBJECT_KEY} --expires-in 3600)
echo "URL: \${PRESIGNED_URL}"
echo "Expires in: 1 hour"

# Generate with longer expiration (max 7 days for S3 = 604800 seconds)
echo "\\n=== Generating Presigned URL (7 days) ==="
LONG_URL=\$(aws s3 presign s3://\${BUCKET_NAME}/\${OBJECT_KEY} --expires-in 604800)
echo "URL: \${LONG_URL}"
echo "Expires in: 7 days"

# Test URL before expiration
echo "\\n=== Testing URL ==="
curl -I "\${PRESIGNED_URL}" 2>&1 | head -5`,
        },
        {
          language: 'bash',
          title: 'Check System Clock and Synchronize',
          code: `#!/bin/bash
# Check system time
echo "=== System Time ==="
date
date -u  # UTC time

# Check NTP synchronization (Linux)
echo "\\n=== NTP Status ==="
if command -v ntpq &> /dev/null; then
  ntpq -p
elif command -v timedatectl &> /dev/null; then
  timedatectl status
fi

# Synchronize time (requires sudo)
echo "\\n=== Synchronizing Time ==="
echo "Linux: sudo ntpdate -s time.nist.gov"
echo "macOS: sudo sntp -sS time.google.com"
echo "Windows: w32tm /resync"

# Test AWS time sync
echo "\\n=== Testing AWS Time Sync ==="
aws sts get-caller-identity 2>&1
if [ \$? -eq 0 ]; then
  echo "✓ Time appears synchronized (AWS request succeeded)"
else
  echo "✗ Time may be skewed (check error above)"
fi`,
        },
        {
          language: 'bash',
          title: 'Regenerate Expired Presigned URLs',
          code: `#!/bin/bash
BUCKET_NAME="my-bucket"
OBJECT_KEY="path/to/file.txt"

# Function to check if URL is expired
check_url_expiry() {
  local url="\${1}"
  # Extract expiration from URL (X-Amz-Expires parameter)
  # Note: This is a simplified check
  if echo "\${url}" | grep -q "X-Amz-Expires"; then
    echo "URL has expiration parameter"
  else
    echo "Cannot determine expiration from URL"
  fi
}

# Generate new presigned URL
echo "=== Generating New Presigned URL ==="
NEW_URL=\$(aws s3 presign s3://\${BUCKET_NAME}/\${OBJECT_KEY} --expires-in 3600)
echo "New URL: \${NEW_URL}"

# Test the new URL
echo "\\n=== Testing New URL ==="
HTTP_CODE=\$(curl -s -o /dev/null -w "%{http_code}" "\${NEW_URL}")
if [ "\${HTTP_CODE}" = "200" ] || [ "\${HTTP_CODE}" = "403" ]; then
  echo "URL is valid (HTTP \${HTTP_CODE})"
  if [ "\${HTTP_CODE}" = "403" ]; then
    echo "Note: 403 may indicate expired URL or access denied"
  fi
else
  echo "URL test returned: HTTP \${HTTP_CODE}"
fi`,
        },
      ],
      relatedCodes: ['SignatureDoesNotMatch', 'AccessDenied'],
      provider: 'aws',
    },
    'ServiceUnavailable': {
      code: 'ServiceUnavailable',
      name: 'Service Unavailable',
      description: `Hitting a **ServiceUnavailable** error means the AWS service is temporarily down or overloaded—this is a server-side issue (5xx) that usually resolves with retries. This server-side error happens when AWS services are experiencing outages, maintenance, or capacity issues. Most common during AWS service outages, but also appears when services are in maintenance mode, regions are experiencing issues, services are overloaded, or temporary capacity constraints occur.`,
      metaDescription: 'Resolve ServiceUnavailable by implementing exponential backoff retries, checking AWS status pages, trying different regions, and monitoring service health with our AWS guide.',
      causes: [
        `Identity: IAM service temporarily unavailable. Service Control Policy (SCP) service down. Account-level service restrictions.`,
        `Network: VPC endpoint service unavailable. Regional service outage. Cross-region service issues.`,
        `Limits: Service temporarily down for maintenance. Service overloaded (too many requests). Regional capacity exhausted. Temporary outage (check AWS status).`,
      ],
      solutions: [
        `Step 1: Diagnose - Check AWS Service Health Dashboard: Visit https://status.aws.amazon.com/. Check specific service status. Review recent incidents. Check if issue is known.`,
        `Step 2: Diagnose - Check CloudWatch service metrics: aws cloudwatch get-metric-statistics --namespace AWS/SERVICE --metric-name ServiceErrors --start-time TIME --end-time TIME --period 300 --statistics Sum. Monitor service availability.`,
        `Step 3: Diagnose - Try different region: If service is regional, try another region: aws ec2 describe-instances --region us-west-2. Some regions may be unaffected.`,
        `Step 4: Fix - Implement exponential backoff: Retry with delays: 1s, 2s, 4s, 8s, 16s. Use AWS SDK automatic retries. Add jitter to prevent thundering herd. Max retries: 5-10 attempts.`,
        `Step 5: Fix - Wait and retry: If maintenance window, wait for completion. If overloaded, reduce request rate. If persistent, contact AWS Support. Monitor AWS status page for updates.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check AWS Service Health and Status',
          code: `#!/bin/bash
# Check AWS Service Health Dashboard
echo "=== AWS Service Health ==="
echo "Visit: https://status.aws.amazon.com/"
echo "Or check programmatically via AWS Support API"

# Check CloudWatch for service errors
SERVICE="dynamodb"  # Replace with your service
REGION="us-east-1"
echo "\\n=== Checking \${SERVICE} Service Errors ==="
aws cloudwatch get-metric-statistics \\
  --namespace AWS/\${SERVICE} \\
  --metric-name ServiceErrors \\
  --dimensions Name=ServiceName,Value=\${SERVICE} \\
  --start-time \$(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \\
  --end-time \$(date -u +%Y-%m-%dT%H:%M:%S) \\
  --period 300 \\
  --statistics Sum \\
  --region \${REGION} \\
  --output table`,
        },
        {
          language: 'bash',
          title: 'Retry with Exponential Backoff',
          code: `#!/bin/bash
# Function to retry AWS CLI commands with exponential backoff
retry_with_backoff() {
  local max_retries=5
  local attempt=0
  local delay=1
  
  while [ \$attempt -lt \${max_retries} ]; do
    if "\$@"; then
      return 0
    fi
    
    local exit_code=\$?
    # Check if error is ServiceUnavailable (503) or similar
    if [ \$exit_code -ne 0 ]; then
      attempt=\$((attempt + 1))
      if [ \$attempt -lt \${max_retries} ]; then
        # Exponential backoff with jitter
        delay=\$((2 ** attempt + RANDOM % 1000 / 1000))
        echo "Service unavailable, retrying in \${delay}s (attempt \${attempt}/\${max_retries})..."
        sleep \${delay}
        continue
      fi
    fi
    return \$exit_code
  done
  
  return 1
}

# Example usage
echo "=== Retrying DynamoDB PutItem ==="
retry_with_backoff aws dynamodb put-item \\
  --table-name MyTable \\
  --item '{"id":{"S":"123"},"data":{"S":"value"}}' \\
  --output json`,
        },
        {
          language: 'bash',
          title: 'Try Different Regions if Service Unavailable',
          code: `#!/bin/bash
# Try service in different regions
REGIONS=("us-east-1" "us-west-2" "eu-west-1")

echo "=== Trying Service in Different Regions ==="
for REGION in "\${REGIONS[@]}"; do
  echo "\\nTrying region: \${REGION}"
  
  # Example: Try DynamoDB in different region
  aws dynamodb list-tables --region \${REGION} 2>&1 | head -3
  
  if [ \$? -eq 0 ]; then
    echo "✓ Service available in \${REGION}"
    break
  else
    echo "✗ Service unavailable in \${REGION}"
  fi
done`,
        },
      ],
      relatedCodes: ['Throttling', 'InsufficientCapacityException'],
      provider: 'aws',
    },
    'ValidationException': {
      code: 'ValidationException',
      name: 'Validation Exception',
      description: `Getting a **ValidationException** means your input data failed AWS service validation—DynamoDB items violate schema constraints, Lambda function code has errors, or IAM policy documents have syntax issues. This client-side error (4xx) happens when AWS validates request data before processing. Most common when DynamoDB item attributes don't match table schema, but also appears when Lambda function code is invalid, IAM policy JSON is malformed, or input values violate service constraints.`,
      metaDescription: 'Fix ValidationException by reviewing error messages, checking DynamoDB schemas, validating IAM policy JSON, and ensuring Lambda code is correct with our AWS troubleshooting guide.',
      causes: [
        `Identity: IAM policy JSON syntax error. Policy document violates IAM constraints. Policy conditions invalid.`,
        `Network: VPC configuration validation fails. Security Group rule validation errors.`,
        `Limits: DynamoDB item violates table schema. Lambda function code invalid. Input value out of allowed range. Missing required fields. Invalid data format.`,
      ],
      solutions: [
        `Step 1: Diagnose - Review exact validation error: AWS usually specifies which field/constraint failed. Check error message for field names. Review validation constraints.`,
        `Step 2: Diagnose - Check DynamoDB table schema: aws dynamodb describe-table --table-name TABLE_NAME --query 'Table.[AttributeDefinitions,KeySchema]' --output json. Verify item attributes match schema.`,
        `Step 3: Diagnose - Validate IAM policy JSON: aws iam get-role-policy --role-name ROLE_NAME --policy-name POLICY_NAME --query 'PolicyDocument' | jq '.'. Check JSON syntax: echo POLICY_JSON | jq '.'.`,
        `Step 4: Fix - Validate input before sending: Check required fields. Verify data types match schema. Validate value ranges. Test with minimal input first.`,
        `Step 5: Fix - Fix validation errors: Update DynamoDB items to match schema. Fix IAM policy JSON syntax. Correct Lambda function code. Ensure all required parameters are present.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check DynamoDB Table Schema',
          code: `#!/bin/bash
TABLE_NAME="MyTable"

# Get table schema
echo "=== DynamoDB Table Schema ==="
aws dynamodb describe-table \\
  --table-name \${TABLE_NAME} \\
  --query 'Table.[AttributeDefinitions,KeySchema,TableName]' \\
  --output json | jq '.'

# Check key schema (partition key and sort key)
echo "\\n=== Key Schema ==="
aws dynamodb describe-table \\
  --table-name \${TABLE_NAME} \\
  --query 'Table.KeySchema[*].[AttributeName,KeyType]' \\
  --output table

# Check attribute definitions (data types)
echo "\\n=== Attribute Definitions ==="
aws dynamodb describe-table \\
  --table-name \${TABLE_NAME} \\
  --query 'Table.AttributeDefinitions[*].[AttributeName,AttributeType]' \\
  --output table

# Example: Validate item matches schema
echo "\\n=== Validating Item ==="
echo "Item must have partition key and sort key (if defined)"
echo "Attribute types must match: S (string), N (number), B (binary)"`,
        },
        {
          language: 'bash',
          title: 'Validate IAM Policy JSON',
          code: `#!/bin/bash
# Get IAM policy and validate JSON
ROLE_NAME="MyRole"
POLICY_NAME="MyPolicy"

echo "=== Getting IAM Policy ==="
POLICY_JSON=\$(aws iam get-role-policy \\
  --role-name \${ROLE_NAME} \\
  --policy-name \${POLICY_NAME} \\
  --query 'PolicyDocument' \\
  --output json 2>&1)

if [ \$? -eq 0 ]; then
  echo "\\n=== Validating JSON Syntax ==="
  echo "\${POLICY_JSON}" | jq '.' > /dev/null 2>&1
  if [ \$? -eq 0 ]; then
    echo "✓ JSON syntax valid"
    echo "\${POLICY_JSON}" | jq '.'
  else
    echo "✗ Invalid JSON syntax"
    echo "\${POLICY_JSON}"
  fi
else
  echo "Error getting policy: \${POLICY_JSON}"
fi

# Validate policy structure
echo "\\n=== Validating Policy Structure ==="
if command -v jq &> /dev/null; then
  echo "\${POLICY_JSON}" | jq 'has("Version")' && echo "✓ Has Version"
  echo "\${POLICY_JSON}" | jq 'has("Statement")' && echo "✓ Has Statement"
fi`,
        },
        {
          language: 'bash',
          title: 'Validate DynamoDB Item Before Put',
          code: `#!/bin/bash
TABLE_NAME="MyTable"

# Get table schema first
echo "=== Getting Table Schema ==="
KEY_SCHEMA=\$(aws dynamodb describe-table \\
  --table-name \${TABLE_NAME} \\
  --query 'Table.KeySchema[*].AttributeName' \\
  --output text)

echo "Required keys: \${KEY_SCHEMA}"

# Validate item has required keys
ITEM='{"id":{"S":"123"},"name":{"S":"John"}}'
echo "\\n=== Validating Item ==="
echo "Item: \${ITEM}"

# Check if item has partition key
if echo "\${ITEM}" | jq -e '.id' > /dev/null 2>&1; then
  echo "✓ Has partition key: id"
else
  echo "✗ Missing partition key: id"
fi

# Validate with dry-run (if supported) or test put
echo "\\n=== Testing Item (dry-run not available, but validate structure) ==="
echo "\${ITEM}" | jq '.' > /dev/null 2>&1
if [ \$? -eq 0 ]; then
  echo "✓ Item JSON is valid"
else
  echo "✗ Invalid JSON format"`,
        },
      ],
      relatedCodes: ['InvalidParameter', 'InvalidParameterValue'],
      provider: 'aws',
    },
    'BucketAlreadyOwnedByYou': {
      code: 'BucketAlreadyOwnedByYou',
      name: 'Bucket Already Owned By You',
      description: `Getting a **BucketAlreadyOwnedByYou** error means the S3 bucket name you're trying to create already exists in your AWS account—you own this bucket, so you can't create another with the same name. This client-side error (4xx) happens when AWS checks bucket name uniqueness within your account. Most common when bucket names are reused, but also appears when buckets weren't fully deleted, bucket deletion is still in progress (90-day grace period), or you're trying to recreate a bucket you already own.`,
      metaDescription: 'Fix BucketAlreadyOwnedByYou by listing your existing buckets, using the existing bucket, or waiting for deletion to complete with our AWS troubleshooting guide.',
      causes: [
        `Identity: Bucket exists in your account. IAM permissions allow listing but bucket already owned.`,
        `Network: VPC endpoint routing to existing bucket. Cross-account bucket confusion.`,
        `Limits: Bucket name already used in your account. Bucket deletion in progress (90-day grace period). Bucket not fully deleted. Name collision in account.`,
      ],
      solutions: [
        `Step 1: Diagnose - List all your buckets: aws s3 ls. Check if bucket name appears in list. Verify bucket ownership: aws s3api get-bucket-location --bucket BUCKET_NAME.`,
        `Step 2: Diagnose - Check if bucket is being deleted: aws s3api head-bucket --bucket BUCKET_NAME. If 404, bucket is deleted. If 200, bucket exists. Check deletion status.`,
        `Step 3: Diagnose - Verify bucket region: aws s3api get-bucket-location --bucket BUCKET_NAME. Bucket might exist in different region. List buckets in all regions.`,
        `Step 4: Fix - Use existing bucket: If bucket exists and you own it, use it directly: aws s3 ls s3://BUCKET_NAME/. No need to create it again.`,
        `Step 5: Fix - Wait for deletion or use different name: If bucket was deleted, wait 90 days for name to be available. Or use different bucket name: BUCKET_NAME="my-app-\$(date +%s)". Create: aws s3api create-bucket --bucket \${BUCKET_NAME} --region REGION.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'List Your Buckets and Check Ownership',
          code: `#!/bin/bash
# List all buckets in your account
echo "=== Your Existing Buckets ==="
aws s3 ls

# Check if specific bucket exists
BUCKET_NAME="my-bucket-name"
echo "\\n=== Checking Bucket: \${BUCKET_NAME} ==="
aws s3api head-bucket --bucket \${BUCKET_NAME} 2>&1

if [ \$? -eq 0 ]; then
  echo "✓ Bucket exists and you own it"
  
  # Get bucket details
  echo "\\n=== Bucket Details ==="
  aws s3api get-bucket-location --bucket \${BUCKET_NAME}
  aws s3api get-bucket-versioning --bucket \${BUCKET_NAME} 2>&1 | head -3
  
  echo "\\nYou can use this bucket directly - no need to create it again"
else
  echo "✗ Bucket does not exist or access denied"
fi`,
        },
        {
          language: 'bash',
          title: 'Check Bucket Deletion Status',
          code: `#!/bin/bash
BUCKET_NAME="my-bucket-name"

# Check if bucket exists
echo "=== Checking Bucket Status ==="
aws s3api head-bucket --bucket \${BUCKET_NAME} 2>&1

# If bucket was deleted, it may still be in 90-day grace period
echo "\\n=== Note: Deleted Buckets ==="
echo "If you deleted this bucket recently, the name is reserved for 90 days"
echo "You must wait for the grace period to expire before reusing the name"

# List all buckets to see what's available
echo "\\n=== All Your Buckets ==="
aws s3 ls

# If you need a new bucket, generate unique name
echo "\\n=== Generate Unique Bucket Name ==="
NEW_BUCKET="my-app-\$(date +%s)-\$(openssl rand -hex 4 | tr '[:upper:]' '[:lower:]')"
echo "Suggested name: \${NEW_BUCKET}"`,
        },
        {
          language: 'bash',
          title: 'Use Existing Bucket or Create New One',
          code: `#!/bin/bash
BUCKET_NAME="my-bucket-name"

# Check if bucket exists
echo "=== Checking if Bucket Exists ==="
if aws s3api head-bucket --bucket \${BUCKET_NAME} 2>/dev/null; then
  echo "✓ Bucket exists - use it directly"
  echo "\\n=== Using Existing Bucket ==="
  aws s3 ls s3://\${BUCKET_NAME}/
  
  echo "\\nNo need to create - bucket is already yours"
else
  echo "✗ Bucket does not exist"
  echo "\\n=== Creating New Bucket ==="
  
  # Generate unique name if original is taken
  UNIQUE_NAME="\${BUCKET_NAME}-\$(date +%s)"
  echo "Creating: \${UNIQUE_NAME}"
  
  aws s3api create-bucket \\
    --bucket \${UNIQUE_NAME} \\
    --region us-east-1 2>&1
  
  if [ \$? -eq 0 ]; then
    echo "✓ Bucket created: \${UNIQUE_NAME}"
  else
    echo "✗ Failed to create bucket"
  fi
fi`,
        },
      ],
      relatedCodes: ['BucketAlreadyExists', 'NoSuchBucket'],
      provider: 'aws',
    },
    'InvalidBucketName': {
      code: 'InvalidBucketName',
      name: 'Invalid Bucket Name',
      description: `Hitting an **InvalidBucketName** error means your S3 bucket name violates AWS naming rules—bucket names must be 3-63 characters, lowercase, alphanumeric with hyphens, and globally unique. This client-side error (4xx) happens when AWS validates bucket name format. Most common when bucket names have uppercase letters or invalid characters, but also appears when names are too short/long, names look like IP addresses, names have consecutive dots, or reserved names are used.`,
      metaDescription: 'Fix InvalidBucketName by following S3 naming rules: 3-63 chars, lowercase, alphanumeric/hyphens only, globally unique. Validate names before creating with our AWS guide.',
      causes: [
        `Identity: IAM policy bucket name restrictions. Service Control Policy (SCP) blocks certain bucket name patterns.`,
        `Network: VPC endpoint bucket name validation. Cross-account bucket naming conflicts.`,
        `Limits: Bucket name too short (< 3 chars) or too long (> 63 chars). Invalid characters (uppercase, underscores, special chars). Name looks like IP address (e.g., 192.168.1.1). Consecutive dots (..). Starts/ends with dot or hyphen. Reserved AWS names.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check exact error message: AWS specifies which naming rule was violated. Review bucket name for invalid characters. Check length.`,
        `Step 2: Diagnose - Validate bucket name format: Name must be 3-63 chars, lowercase, alphanumeric/hyphens only. Check: echo BUCKET_NAME | grep -E '^[a-z0-9][a-z0-9-]*[a-z0-9]\$'.`,
        `Step 3: Diagnose - Check for common issues: No uppercase letters. No underscores. No consecutive dots. Doesn't start/end with dot or hyphen. Not an IP address format.`,
        `Step 4: Fix - Generate valid bucket name: BUCKET_NAME="my-app-\$(date +%s)". Ensure lowercase: BUCKET_NAME=\$(echo \${BUCKET_NAME} | tr '[:upper:]' '[:lower:]'). Validate length: [ \${#BUCKET_NAME} -ge 3 ] && [ \${#BUCKET_NAME} -le 63 ].`,
        `Step 5: Fix - Create bucket with valid name: aws s3api create-bucket --bucket \${BUCKET_NAME} --region us-east-1. For other regions: aws s3api create-bucket --bucket \${BUCKET_NAME} --region REGION --create-bucket-configuration LocationConstraint=REGION.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Validate S3 Bucket Name Format',
          code: `#!/bin/bash
BUCKET_NAME="my-bucket-name"

echo "=== Validating Bucket Name: \${BUCKET_NAME} ==="

# Check length (3-63 characters)
if [ \${#BUCKET_NAME} -lt 3 ] || [ \${#BUCKET_NAME} -gt 63 ]; then
  echo "✗ Invalid length: must be 3-63 characters (current: \${#BUCKET_NAME})"
  exit 1
else
  echo "✓ Length valid: \${#BUCKET_NAME} characters"
fi

# Check for lowercase and valid characters
if [[ \${BUCKET_NAME} =~ ^[a-z0-9][a-z0-9.-]*[a-z0-9]\$ ]] || [[ \${BUCKET_NAME} =~ ^[a-z0-9]\$ ]]; then
  echo "✓ Format valid (lowercase, alphanumeric, hyphens, dots)"
else
  echo "✗ Invalid format: must be lowercase, alphanumeric, hyphens, dots only"
  echo "  No uppercase, underscores, or special characters"
  exit 1
fi

# Check for consecutive dots
if [[ \${BUCKET_NAME} == *".."* ]]; then
  echo "✗ Cannot contain consecutive dots (..)"
  exit 1
else
  echo "✓ No consecutive dots"
fi

# Check if looks like IP address
if [[ \${BUCKET_NAME} =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\$ ]]; then
  echo "✗ Cannot be an IP address format"
  exit 1
else
  echo "✓ Not an IP address"
fi

echo "\\n✓ Bucket name is valid"`,
        },
        {
          language: 'bash',
          title: 'Generate Valid Bucket Name',
          code: `#!/bin/bash
# Generate valid bucket name
BASE_NAME="my-app"
TIMESTAMP=\$(date +%s)
RANDOM_SUFFIX=\$(openssl rand -hex 4 | tr '[:upper:]' '[:lower:]')

# Combine and ensure lowercase
BUCKET_NAME="\${BASE_NAME}-\${TIMESTAMP}-\${RANDOM_SUFFIX}"
BUCKET_NAME=\$(echo \${BUCKET_NAME} | tr '[:upper:]' '[:lower:]')

# Validate length
if [ \${#BUCKET_NAME} -gt 63 ]; then
  # Truncate if too long
  BUCKET_NAME=\${BUCKET_NAME:0:63}
fi

# Ensure it doesn't end with hyphen or dot
BUCKET_NAME=\${BUCKET_NAME%%[-.]}

echo "Generated bucket name: \${BUCKET_NAME}"
echo "Length: \${#BUCKET_NAME} characters"

# Validate before creating
if [[ \${BUCKET_NAME} =~ ^[a-z0-9][a-z0-9.-]*[a-z0-9]\$ ]] && [ \${#BUCKET_NAME} -ge 3 ] && [ \${#BUCKET_NAME} -le 63 ]; then
  echo "✓ Name is valid"
  echo "\\nCreating bucket..."
  aws s3api create-bucket \\
    --bucket \${BUCKET_NAME} \\
    --region us-east-1
else
  echo "✗ Generated name is invalid"
fi`,
        },
        {
          language: 'bash',
          title: 'Fix Common Bucket Name Issues',
          code: `#!/bin/bash
# Common bucket name issues and fixes
BAD_NAME="My-Bucket_Name"  # Has uppercase and underscore
GOOD_NAME=\$(echo "\${BAD_NAME}" | tr '[:upper:]' '[:lower:]' | tr '_' '-')

echo "=== Fixing Bucket Name ==="
echo "Bad: \${BAD_NAME}"
echo "Good: \${GOOD_NAME}"

# Remove invalid characters
CLEAN_NAME=\$(echo "\${BAD_NAME}" | tr '[:upper:]' '[:lower:]' | sed 's/_/-/g' | sed 's/[^a-z0-9.-]//g')

# Ensure doesn't start/end with dot or hyphen
CLEAN_NAME=\$(echo "\${CLEAN_NAME}" | sed 's/^[.-]//' | sed 's/[.-]\$//')

# Remove consecutive dots
CLEAN_NAME=\$(echo "\${CLEAN_NAME}" | sed 's/\.\././g')

echo "\\nCleaned name: \${CLEAN_NAME}"

# Validate final name
if [ \${#CLEAN_NAME} -ge 3 ] && [ \${#CLEAN_NAME} -le 63 ]; then
  if [[ \${CLEAN_NAME} =~ ^[a-z0-9][a-z0-9.-]*[a-z0-9]\$ ]]; then
    echo "✓ Valid bucket name: \${CLEAN_NAME}"
  else
    echo "✗ Still invalid format"
  fi
else
  echo "✗ Invalid length"
fi`,
        },
      ],
      relatedCodes: ['BucketAlreadyExists', 'InvalidParameter'],
      provider: 'aws',
    },
    'NoSuchEntity': {
      code: 'NoSuchEntity',
      name: 'No Such Entity',
      description: `Getting a **NoSuchEntity** error means the IAM entity (user, role, policy, or group) you're referencing doesn't exist in your AWS account—the entity might have been deleted, the name is misspelled, or it belongs to a different account. This client-side error (4xx) is common in IAM operations. Most common when IAM users or roles are deleted, but also appears when entity names are misspelled, entities are in different accounts, entity IDs are wrong, or IAM policies reference non-existent entities.`,
      metaDescription: 'Fix NoSuchEntity by listing IAM entities, verifying entity names, checking if entities were deleted, and using correct entity identifiers with our AWS troubleshooting guide.',
      causes: [
        `Identity: IAM entity doesn't exist. Entity was deleted from account. Entity belongs to different AWS account. Entity ID/name is incorrect.`,
        `Network: Cross-account entity reference. IAM entities are global (not regional).`,
        `Limits: Typo in entity name. Entity never existed. Entity ID format invalid.`,
      ],
      solutions: [
        `Step 1: Diagnose - List IAM users: aws iam list-users --query 'Users[*].[UserName,UserId]' --output table. List IAM roles: aws iam list-roles --query 'Roles[*].[RoleName,RoleId]' --output table. Compare with your reference.`,
        `Step 2: Diagnose - Get entity by name: aws iam get-user --user-name USER_NAME. Or aws iam get-role --role-name ROLE_NAME. Check if entity exists.`,
        `Step 3: Diagnose - Check CloudTrail for deletion: aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=DeleteUser --query 'Events[*].CloudTrailEvent' | jq '.[] | .userIdentity.userName'. Verify if deleted.`,
        `Step 4: Fix - Use correct entity name: Replace entity ID with username/rolename in references. Update IAM policies to use correct names. Verify entity exists before referencing.`,
        `Step 5: Fix - Create entity if needed: aws iam create-user --user-name USER_NAME. Or aws iam create-role --role-name ROLE_NAME --assume-role-policy-document file://trust-policy.json. Or update references to use existing entities.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'List IAM Entities to Find Correct Names',
          code: `#!/bin/bash
# List all IAM users
echo "=== IAM Users ==="
aws iam list-users \\
  --query 'Users[*].[UserName,UserId,CreateDate]' \\
  --output table

# List all IAM roles
echo "\\n=== IAM Roles ==="
aws iam list-roles \\
  --query 'Roles[*].[RoleName,RoleId,CreateDate]' \\
  --output table | head -20

# List all IAM groups
echo "\\n=== IAM Groups ==="
aws iam list-groups \\
  --query 'Groups[*].[GroupName,GroupId]' \\
  --output table

# List all IAM policies
echo "\\n=== IAM Policies ==="
aws iam list-policies --scope Local \\
  --query 'Policies[*].[PolicyName,PolicyId]' \\
  --output table | head -20`,
        },
        {
          language: 'bash',
          title: 'Check if IAM Entity Exists',
          code: `#!/bin/bash
# Check if IAM user exists
USER_NAME="myuser"
echo "=== Checking IAM User: \${USER_NAME} ==="
aws iam get-user --user-name \${USER_NAME} \\
  --query 'User.[UserName,UserId,Arn]' \\
  --output table 2>&1

if [ \$? -eq 0 ]; then
  echo "✓ User exists"
else
  echo "✗ User not found (NoSuchEntity)"
  echo "\\nListing available users:"
  aws iam list-users --query 'Users[*].UserName' --output table
fi

# Check if IAM role exists
ROLE_NAME="MyRole"
echo "\\n=== Checking IAM Role: \${ROLE_NAME} ==="
aws iam get-role --role-name \${ROLE_NAME} \\
  --query 'Role.[RoleName,RoleId,Arn]' \\
  --output table 2>&1

if [ \$? -eq 0 ]; then
  echo "✓ Role exists"
else
  echo "✗ Role not found (NoSuchEntity)"
  echo "\\nListing available roles:"
  aws iam list-roles --query 'Roles[*].RoleName' --output table | head -10
fi`,
        },
        {
          language: 'bash',
          title: 'Check CloudTrail for Entity Deletion',
          code: `#!/bin/bash
# Check CloudTrail for IAM user deletion
USER_NAME="myuser"
echo "=== Checking CloudTrail for User Deletion ==="

aws cloudtrail lookup-events \\
  --lookup-attributes AttributeKey=EventName,AttributeValue=DeleteUser \\
  --max-results 10 \\
  --query 'Events[*].[EventTime,CloudTrailEvent]' \\
  --output text | while read time event; do
    echo "Time: \${time}"
    DELETED_USER=\$(echo "\${event}" | jq -r '.userIdentity.userName' 2>/dev/null)
    if [ "\${DELETED_USER}" = "\${USER_NAME}" ]; then
      echo "Found deletion event for \${USER_NAME} at \${time}"
    fi
  done

# Check for role deletion
ROLE_NAME="MyRole"
echo "\\n=== Checking for Role Deletion ==="
aws cloudtrail lookup-events \\
  --lookup-attributes AttributeKey=EventName,AttributeValue=DeleteRole \\
  --max-results 10 \\
  --query 'Events[*].[EventTime,CloudTrailEvent]' \\
  --output text | head -5`,
        },
      ],
      relatedCodes: ['ResourceNotFoundException', 'InvalidUserID.NotFound'],
      provider: 'aws',
    },
    'InvalidClientTokenId': {
      code: 'InvalidClientTokenId',
      name: 'Invalid Client Token ID',
      description: `Getting an **InvalidClientTokenId** error means your AWS security token (Access Key ID) is invalid or doesn't exist—the token might have been deleted, rotated, or belongs to a different AWS account. This client-side error (4xx) happens when AWS validates request tokens. Most common when IAM access keys are deleted or rotated, but also appears when credentials are misconfigured, tokens are expired, credentials files are corrupted, or you're using credentials from the wrong AWS account.`,
      metaDescription: 'Fix InvalidClientTokenId by verifying access key IDs, checking credentials configuration, regenerating keys if needed, and validating credentials file format with our AWS guide.',
      causes: [
        `Identity: Access Key ID doesn't exist in AWS. Access key was deleted from IAM user. Access key belongs to different AWS account. Token expired or deactivated.`,
        `Network: Credentials file corrupted. Environment variables not set correctly. AWS CLI configuration file has wrong token.`,
        `Limits: Typo in access key ID. Token format invalid (should be 20 chars, alphanumeric). Token rotated but old token still in use.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check your current credentials: aws sts get-caller-identity. If InvalidClientTokenId, credentials are wrong. Verify which credentials are being used: aws configure list.`,
        `Step 2: Diagnose - List IAM user access keys: aws iam list-access-keys --user-name USER_NAME. Check if key exists and is active. Verify key ID matches your credentials.`,
        `Step 3: Diagnose - Check credentials file: cat ~/.aws/credentials. Verify [default] or [profile] section has correct AccessKeyId. Check environment variables: echo \$AWS_ACCESS_KEY_ID.`,
        `Step 4: Fix - Regenerate access key if deleted: aws iam create-access-key --user-name USER_NAME. Update credentials: aws configure set aws_access_key_id NEW_KEY_ID.`,
        `Step 5: Fix - Verify credentials work: aws sts get-caller-identity. Should return account ID, user ARN, and user ID. If still fails, check IAM user exists: aws iam get-user --user-name USER_NAME.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Diagnose InvalidClientTokenId: Check Credentials',
          code: `#!/bin/bash
# Check current credentials being used
echo "=== Current AWS Configuration ==="
aws configure list

# Check environment variables
echo "\\n=== Environment Variables ==="
echo "AWS_ACCESS_KEY_ID: \${AWS_ACCESS_KEY_ID:-(not set)}"
echo "AWS_SECRET_ACCESS_KEY: \${AWS_SECRET_ACCESS_KEY:+(set)} \${AWS_SECRET_ACCESS_KEY:+[hidden]}"
echo "AWS_PROFILE: \${AWS_PROFILE:-(not set)}"

# Test credentials
echo "\\n=== Testing Credentials ==="
aws sts get-caller-identity 2>&1
if [ \$? -eq 0 ]; then
  echo "✓ Credentials valid"
  aws sts get-caller-identity --output table
else
  echo "✗ Invalid credentials (InvalidClientTokenId)"
  echo "Check your credentials file: ~/.aws/credentials"
fi

# Check credentials file
echo "\\n=== Credentials File ==="
if [ -f ~/.aws/credentials ]; then
  echo "Credentials file exists"
  grep -A 2 "\[default\]" ~/.aws/credentials 2>/dev/null || echo "No [default] profile"
else
  echo "Credentials file not found at ~/.aws/credentials"
fi`,
        },
        {
          language: 'bash',
          title: 'List and Verify IAM User Access Keys',
          code: `#!/bin/bash
# Get current user name
USER_NAME=\$(aws sts get-caller-identity --query Arn --output text 2>/dev/null | cut -d'/' -f2)
if [ -z "\${USER_NAME}" ]; then
  echo "Cannot determine user name (credentials invalid)"
  echo "Please provide user name manually:"
  read -p "User name: " USER_NAME
fi

echo "Current user: \${USER_NAME}"

# List access keys for user
echo "\\n=== Access Keys for User ==="
aws iam list-access-keys --user-name \${USER_NAME} \\
  --query 'AccessKeyMetadata[*].[AccessKeyId,Status,CreateDate]' \\
  --output table 2>&1

# Check if specific access key exists
ACCESS_KEY_ID="AKIAXXXXX"  # Replace with your key ID
echo "\\n=== Checking Access Key: \${ACCESS_KEY_ID} ==="
aws iam list-access-keys --user-name \${USER_NAME} \\
  --query "AccessKeyMetadata[?AccessKeyId=='\${ACCESS_KEY_ID}']" \\
  --output table 2>&1`,
        },
        {
          language: 'bash',
          title: 'Fix InvalidClientTokenId: Update Credentials',
          code: `#!/bin/bash
# Method 1: Update credentials using AWS CLI
echo "=== Updating AWS Credentials ==="
NEW_ACCESS_KEY_ID="AKIAXXXXX"  # Replace with your new key
NEW_SECRET_ACCESS_KEY="xxxxx"  # Replace with your new secret

aws configure set aws_access_key_id \${NEW_ACCESS_KEY_ID}
aws configure set aws_secret_access_key \${NEW_SECRET_ACCESS_KEY}
aws configure set region us-east-1  # Set your preferred region

# Verify new credentials
echo "\\n=== Verifying New Credentials ==="
aws sts get-caller-identity --output table

# Method 2: Update credentials file directly
echo "\\n=== Manual Credentials File Update ==="
echo "Edit ~/.aws/credentials and update:"
echo "[default]"
echo "aws_access_key_id = \${NEW_ACCESS_KEY_ID}"
echo "aws_secret_access_key = \${NEW_SECRET_ACCESS_KEY}"
echo ""
echo "Or use environment variables:"
echo "export AWS_ACCESS_KEY_ID=\${NEW_ACCESS_KEY_ID}"
echo "export AWS_SECRET_ACCESS_KEY=\${NEW_SECRET_ACCESS_KEY}"
echo "export AWS_DEFAULT_REGION=us-east-1"`,
        },
      ],
      relatedCodes: ['InvalidAccessKeyId', 'SignatureDoesNotMatch'],
      provider: 'aws',
    },
    'MissingParameter': {
      code: 'MissingParameter',
      name: 'Missing Parameter',
      description: `Hitting a **MissingParameter** error means your AWS API request is missing a required parameter—AWS usually specifies which parameter is missing in the error message. This client-side error (4xx) happens when AWS validates request parameters. Most common when EC2 run-instances is missing ImageId or InstanceType, but also appears when parameter names are misspelled, nested parameters are missing, conditional parameters are required but not provided, or parameters are in the wrong location in the request.`,
      metaDescription: 'Fix MissingParameter by reviewing AWS error messages, checking API documentation for required parameters, verifying parameter names, and including all required fields with our AWS guide.',
      causes: [
        `Identity: IAM policy parameter restrictions. Service Control Policy (SCP) requires specific parameters.`,
        `Network: VPC endpoint parameter requirements. API Gateway parameter validation.`,
        `Limits: Required parameter not provided. Parameter name misspelled (case-sensitive). Nested parameter missing (e.g., Placement.AvailabilityZone). Conditional parameter required (e.g., if using Spot, need SpotPrice). Parameter in wrong location.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check exact error message: AWS usually specifies which parameter is missing. Review error message for parameter name. Check if parameter name is misspelled.`,
        `Step 2: Diagnose - Use AWS CLI help to see required parameters: aws ec2 run-instances help. Review required vs optional parameters. Check parameter names (case-sensitive).`,
        `Step 3: Diagnose - Validate request structure: Check if nested parameters are correct (e.g., Placement.AvailabilityZone). Verify conditional parameters (e.g., Spot instances require SpotPrice). Check parameter location in request.`,
        `Step 4: Fix - Review API documentation: Check AWS API Reference for exact parameter names. Verify required parameters for your operation. Check for conditional requirements.`,
        `Step 5: Fix - Include all required parameters: Add missing parameter to request. Verify parameter name spelling. Check nested parameter structure. Test with minimal required parameters first.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Use AWS CLI Help to Find Required Parameters',
          code: `#!/bin/bash
# Get help for EC2 run-instances to see required parameters
echo "=== EC2 Run Instances Required Parameters ==="
aws ec2 run-instances help | grep -A 20 "SYNOPSIS"

# Check specific required parameters
echo "\\n=== Required Parameters ==="
aws ec2 run-instances help | grep -i "required" | head -10

# Example: Check what's required for run-instances
echo "\\n=== Testing with Minimal Required Parameters ==="
AMI_ID="ami-xxxxx"  # Replace with valid AMI
INSTANCE_TYPE="t2.micro"

# Minimal required parameters
aws ec2 run-instances \\
  --image-id \${AMI_ID} \\
  --instance-type \${INSTANCE_TYPE} \\
  --count 1 \\
  --dry-run 2>&1 | head -5

# If error says missing parameter, check help
echo "\\nIf MissingParameter error, check:"
echo "aws ec2 run-instances help | grep -A 5 PARAMETER_NAME"`,
        },
        {
          language: 'bash',
          title: 'Validate Required Parameters Before Request',
          code: `#!/bin/bash
# Function to check required parameters
check_required_params() {
  local params="\$@"
  local missing=()
  
  # Required for EC2 run-instances
  if [[ ! "\${params}" =~ ImageId ]]; then
    missing+=("ImageId")
  fi
  if [[ ! "\${params}" =~ InstanceType ]]; then
    missing+=("InstanceType")
  fi
  
  if [ \${#missing[@]} -gt 0 ]; then
    echo "✗ Missing required parameters: \${missing[*]}"
    return 1
  else
    echo "✓ All required parameters present"
    return 0
  fi
}

# Example usage
echo "=== Validating Parameters ==="
PARAMS="--image-id ami-xxxxx --instance-type t2.micro"
check_required_params "\${PARAMS}"

# Test actual command
if check_required_params "\${PARAMS}"; then
  echo "\\n=== Running Command ==="
  aws ec2 run-instances \${PARAMS} --count 1 --dry-run 2>&1 | head -3
fi`,
        },
        {
          language: 'bash',
          title: 'Check Nested and Conditional Parameters',
          code: `#!/bin/bash
# Example: EC2 run-instances with nested parameters
AMI_ID="ami-xxxxx"
INSTANCE_TYPE="t2.micro"

echo "=== Testing with Nested Parameters ==="
# Placement is a nested parameter (Placement.AvailabilityZone)
AVAILABILITY_ZONE="us-east-1a"

aws ec2 run-instances \\
  --image-id \${AMI_ID} \\
  --instance-type \${INSTANCE_TYPE} \\
  --placement AvailabilityZone=\${AVAILABILITY_ZONE} \\
  --count 1 \\
  --dry-run 2>&1 | head -5

# Example: Conditional parameters (Spot instances require SpotPrice)
echo "\\n=== Conditional Parameters (Spot Instances) ==="
echo "If using Spot instances, SpotPrice is required:"
echo "aws ec2 run-instances \\"
echo "  --image-id \${AMI_ID} \\"
echo "  --instance-type \${INSTANCE_TYPE} \\"
echo "  --instance-market-options '{\"MarketType\":\"spot\",\"SpotOptions\":{\"SpotInstanceType\":\"one-time\",\"MaxPrice\":\"0.05\"}}' \\"
echo "  --count 1"`,
        },
      ],
      relatedCodes: ['InvalidParameter', 'InvalidParameterValue'],
      provider: 'aws',
    },
    'ServiceQuotaExceededException': {
      code: 'ServiceQuotaExceededException',
      name: 'Service Quota Exceeded',
      description: `Hitting a **ServiceQuotaExceededException** means your request would exceed an AWS Service Quota (formerly soft limits)—you've reached the maximum allowed for a specific service quota like EC2 instances, DynamoDB tables, or IAM roles. This client-side error (4xx) happens when AWS enforces service quotas. Most common when creating too many EC2 instances or DynamoDB tables, but also appears when regional quotas are exceeded, account-level quotas are hit, or quotas haven't been increased from defaults.`,
      metaDescription: 'Resolve ServiceQuotaExceededException by checking current quota usage, requesting quota increases, deleting unused resources, or using different regions with our AWS troubleshooting guide.',
      causes: [
        `Identity: IAM role/user quota exceeded. Service Control Policy (SCP) enforces lower quotas. Account-level restrictions active.`,
        `Network: VPC endpoint quotas. Security Group quotas (50 rules per group). NACL quotas (20 rules per direction).`,
        `Limits: EC2 instance quota (default 20 per region). DynamoDB table quota (256 per region). IAM role quota (5000 per account). Regional quota limit reached. Account-level quota exceeded.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check current quota usage: aws service-quotas get-service-quota --service-code SERVICE_CODE --quota-code QUOTA_CODE --query '[QuotaName,Value,UsageMetric]' --output table. Compare usage vs limit.`,
        `Step 2: Diagnose - List all service quotas: aws service-quotas list-service-quotas --service-code ec2 --query 'Quotas[*].[QuotaName,Value,Adjustable]' --output table. Find which quota is exceeded.`,
        `Step 3: Diagnose - Check quota increase requests: aws service-quotas list-requested-service-quota-change-history --service-code SERVICE_CODE --query 'RequestedQuotas[*].[QuotaName,DesiredValue,Status]' --output table. See if increase is pending.`,
        `Step 4: Fix - Request quota increase: aws service-quotas request-service-quota-increase --service-code SERVICE_CODE --quota-code QUOTA_CODE --desired-value NEW_VALUE. Check request status.`,
        `Step 5: Fix - Delete unused resources or use different region: Delete unused EC2 instances: aws ec2 terminate-instances --instance-ids i-xxxxx. Or use different region with available quota. Wait for quota increase approval if requested.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check Current Service Quota Usage',
          code: `#!/bin/bash
SERVICE_CODE="ec2"
QUOTA_CODE="L-34B43A08"  # Running On-Demand EC2 instances

# Get specific quota
echo "=== Service Quota Details ==="
aws service-quotas get-service-quota \\
  --service-code \${SERVICE_CODE} \\
  --quota-code \${QUOTA_CODE} \\
  --query '[QuotaName,Value,UsageMetric]' \\
  --output table

# List all quotas for service
echo "\\n=== All EC2 Service Quotas ==="
aws service-quotas list-service-quotas \\
  --service-code \${SERVICE_CODE} \\
  --query 'Quotas[*].[QuotaName,Value,Adjustable]' \\
  --output table | head -20

# Check current usage (if UsageMetric available)
echo "\\n=== Current Usage ==="
CURRENT_USAGE=\$(aws ec2 describe-instances \\
  --query 'length(Reservations[*].Instances[*])' \\
  --output text)
echo "Current EC2 instances: \${CURRENT_USAGE}"`,
        },
        {
          language: 'bash',
          title: 'Request Service Quota Increase',
          code: `#!/bin/bash
SERVICE_CODE="ec2"
QUOTA_CODE="L-34B43A08"  # Running On-Demand EC2 instances
CURRENT_VALUE=20
DESIRED_VALUE=50

echo "=== Requesting Quota Increase ==="
echo "Service: \${SERVICE_CODE}"
echo "Quota Code: \${QUOTA_CODE}"
echo "Current Value: \${CURRENT_VALUE}"
echo "Desired Value: \${DESIRED_VALUE}"

# Request increase
aws service-quotas request-service-quota-increase \\
  --service-code \${SERVICE_CODE} \\
  --quota-code \${QUOTA_CODE} \\
  --desired-value \${DESIRED_VALUE}

# Check request status
echo "\\n=== Quota Increase Request Status ==="
aws service-quotas list-requested-service-quota-change-history \\
  --service-code \${SERVICE_CODE} \\
  --query 'RequestedQuotas[*].[QuotaName,DesiredValue,Status,Created]' \\
  --output table`,
        },
        {
          language: 'bash',
          title: 'Delete Unused Resources to Free Up Quota',
          code: `#!/bin/bash
# List stopped EC2 instances
echo "=== Stopped EC2 Instances ==="
aws ec2 describe-instances \\
  --filters "Name=instance-state-name,Values=stopped" \\
  --query 'Reservations[*].Instances[*].[InstanceId,InstanceType,LaunchTime]' \\
  --output table

# List empty DynamoDB tables
echo "\\n=== DynamoDB Tables ==="
aws dynamodb list-tables --output table

# Count current resources vs quota
echo "\\n=== Resource Count vs Quota ==="
INSTANCE_COUNT=\$(aws ec2 describe-instances \\
  --query 'length(Reservations[*].Instances[*])' \\
  --output text)
echo "Current instances: \${INSTANCE_COUNT}"

# Get quota limit
QUOTA_LIMIT=\$(aws service-quotas get-service-quota \\
  --service-code ec2 \\
  --quota-code L-34B43A08 \\
  --query 'Quota.Value' \\
  --output text)
echo "Quota limit: \${QUOTA_LIMIT}"

if [ \${INSTANCE_COUNT} -ge \${QUOTA_LIMIT} ]; then
  echo "✗ Quota exceeded! Delete unused instances or request increase"
else
  echo "✓ Within quota (\${INSTANCE_COUNT}/\${QUOTA_LIMIT})"
fi`,
        },
      ],
      relatedCodes: ['LimitExceededException', 'Throttling'],
      provider: 'aws',
    },
    'Unavailable': {
      code: 'Unavailable',
      name: 'Service Unavailable',
      description: `Getting an **Unavailable** error means the AWS service is temporarily down or overloaded—this is a server-side issue (5xx) that usually resolves with retries. This server-side error happens when AWS services are experiencing outages, maintenance, or capacity issues. Most common during AWS service outages, but also appears when services are in maintenance mode, regions are experiencing issues, services are overloaded, or temporary capacity constraints occur.`,
      metaDescription: 'Resolve Unavailable errors by implementing exponential backoff retries, checking AWS status pages, trying different regions, and monitoring service health with our AWS guide.',
      causes: [
        `Identity: IAM service temporarily unavailable. Service Control Policy (SCP) service down. Account-level service restrictions.`,
        `Network: VPC endpoint service unavailable. Regional service outage. Cross-region service issues.`,
        `Limits: Service temporarily down for maintenance. Service overloaded (too many requests). Regional capacity exhausted. Temporary outage (check AWS status).`,
      ],
      solutions: [
        `Step 1: Diagnose - Check AWS Service Health Dashboard: Visit https://status.aws.amazon.com/. Check specific service status. Review recent incidents. Check if issue is known.`,
        `Step 2: Diagnose - Check CloudWatch service metrics: aws cloudwatch get-metric-statistics --namespace AWS/SERVICE --metric-name ServiceErrors --start-time TIME --end-time TIME --period 300 --statistics Sum. Monitor service availability.`,
        `Step 3: Diagnose - Try different region: If service is regional, try another region: aws ec2 describe-instances --region us-west-2. Some regions may be unaffected.`,
        `Step 4: Fix - Implement exponential backoff: Retry with delays: 1s, 2s, 4s, 8s, 16s. Use AWS SDK automatic retries. Add jitter to prevent thundering herd. Max retries: 5-10 attempts.`,
        `Step 5: Fix - Wait and retry: If maintenance window, wait for completion. If overloaded, reduce request rate. If persistent, contact AWS Support. Monitor AWS status page for updates.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check AWS Service Health and Status',
          code: `#!/bin/bash
# Check AWS Service Health Dashboard
echo "=== AWS Service Health ==="
echo "Visit: https://status.aws.amazon.com/"
echo "Or check programmatically via AWS Support API"

# Check CloudWatch for service errors
SERVICE="dynamodb"  # Replace with your service
REGION="us-east-1"
echo "\\n=== Checking \${SERVICE} Service Errors ==="
aws cloudwatch get-metric-statistics \\
  --namespace AWS/\${SERVICE} \\
  --metric-name ServiceErrors \\
  --dimensions Name=ServiceName,Value=\${SERVICE} \\
  --start-time \$(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \\
  --end-time \$(date -u +%Y-%m-%dT%H:%M:%S) \\
  --period 300 \\
  --statistics Sum \\
  --region \${REGION} \\
  --output table 2>&1 | head -10`,
        },
        {
          language: 'bash',
          title: 'Retry with Exponential Backoff',
          code: `#!/bin/bash
# Function to retry AWS CLI commands with exponential backoff
retry_with_backoff() {
  local max_retries=5
  local attempt=0
  local delay=1
  
  while [ \$attempt -lt \${max_retries} ]; do
    if "\$@"; then
      return 0
    fi
    
    local exit_code=\$?
    # Check if error is Unavailable (503) or similar
    if [ \$exit_code -ne 0 ]; then
      attempt=\$((attempt + 1))
      if [ \$attempt -lt \${max_retries} ]; then
        # Exponential backoff with jitter
        delay=\$((2 ** attempt + RANDOM % 1000 / 1000))
        echo "Service unavailable, retrying in \${delay}s (attempt \${attempt}/\${max_retries})..."
        sleep \${delay}
        continue
      fi
    fi
    return \$exit_code
  done
  
  return 1
}

# Example usage
echo "=== Retrying DynamoDB PutItem ==="
retry_with_backoff aws dynamodb put-item \\
  --table-name MyTable \\
  --item '{"id":{"S":"123"},"data":{"S":"value"}}' \\
  --output json`,
        },
        {
          language: 'bash',
          title: 'Try Different Regions if Service Unavailable',
          code: `#!/bin/bash
# Try service in different regions
REGIONS=("us-east-1" "us-west-2" "eu-west-1")

echo "=== Trying Service in Different Regions ==="
for REGION in "\${REGIONS[@]}"; do
  echo "\\nTrying region: \${REGION}"
  
  # Example: Try DynamoDB in different region
  aws dynamodb list-tables --region \${REGION} 2>&1 | head -3
  
  if [ \$? -eq 0 ]; then
    echo "✓ Service available in \${REGION}"
    break
  else
    echo "✗ Service unavailable in \${REGION}"
  fi
done`,
        },
      ],
      relatedCodes: ['ServiceUnavailable', 'Throttling'],
      provider: 'aws',
    },
    'InvalidAction': {
      code: 'InvalidAction',
      name: 'Invalid Action',
      description: `Hitting an **InvalidAction** error means the AWS API action you're trying to call doesn't exist or isn't supported by that service—the action name might be misspelled, it's not available for that service, or there's an API version mismatch. This client-side error (4xx) happens when AWS validates action names. Most common when action names are misspelled, but also appears when actions aren't supported by the service, actions are called on wrong services, API versions don't match, or service endpoints are incorrect.`,
      metaDescription: 'Fix InvalidAction by verifying action names, checking service support, reviewing API documentation, and ensuring correct API versions with our AWS troubleshooting guide.',
      causes: [
        `Identity: IAM policy action restrictions. Service Control Policy (SCP) blocks specific actions.`,
        `Network: VPC endpoint action restrictions. API Gateway action validation.`,
        `Limits: Action name incorrect (case-sensitive). Action not supported by service. Typo in action name. Action in wrong service. API version mismatch.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check exact error message: AWS usually specifies which action is invalid. Review action name spelling (case-sensitive). Verify action exists for service.`,
        `Step 2: Diagnose - Use AWS CLI help to see valid actions: aws ec2 help | grep "AVAILABLE COMMANDS". List all available actions for service. Check action name format.`,
        `Step 3: Diagnose - Verify service supports action: Check AWS API Reference for service. Verify action is available for your API version. Check if action requires specific permissions.`,
        `Step 4: Fix - Use correct action name: Verify spelling (case-sensitive). Check AWS CLI command format: aws SERVICE ACTION. Use correct service endpoint.`,
        `Step 5: Fix - Check API version: Some actions require specific API versions. Verify API version in request. Update to supported API version if needed.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'List Valid Actions for AWS Service',
          code: `#!/bin/bash
# List all available commands/actions for EC2
echo "=== EC2 Available Commands ==="
aws ec2 help | grep -A 50 "AVAILABLE COMMANDS" | head -30

# Check specific action exists
ACTION="run-instances"
echo "\\n=== Checking Action: \${ACTION} ==="
aws ec2 \${ACTION} help 2>&1 | head -5

if [ \$? -eq 0 ]; then
  echo "✓ Action exists"
else
  echo "✗ Invalid action"
  echo "\\nListing valid actions:"
  aws ec2 help | grep -E "^  [a-z-]+" | head -20
fi

# Example: Common EC2 actions
echo "\\n=== Common EC2 Actions ==="
echo "run-instances"
echo "describe-instances"
echo "terminate-instances"
echo "start-instances"
echo "stop-instances"`,
        },
        {
          language: 'bash',
          title: 'Verify Action Name and Service',
          code: `#!/bin/bash
# Check if action is valid for service
SERVICE="ec2"
ACTION="run-instances"

echo "=== Validating Action: \${ACTION} for \${SERVICE} ==="

# Try to get help for the action
aws \${SERVICE} \${ACTION} help 2>&1 | head -3

if [ \$? -eq 0 ]; then
  echo "✓ Action is valid for \${SERVICE}"
else
  echo "✗ Invalid action for \${SERVICE}"
  echo "\\nChecking if action exists in different service..."
  
  # Check other services
  for svc in s3 dynamodb lambda; do
    if aws \${svc} \${ACTION} help 2>/dev/null | head -1 > /dev/null; then
      echo "Action exists in \${svc} service"
    fi
  done
fi`,
        },
        {
          language: 'bash',
          title: 'Check API Version and Service Endpoint',
          code: `#!/bin/bash
# Check service endpoint configuration
echo "=== Service Endpoint Configuration ==="
aws configure get region

# Check API version (if applicable)
echo "\\n=== API Version Info ==="
echo "Most AWS CLI commands use latest API version automatically"
echo "For specific API versions, check service documentation"

# Example: EC2 uses API version in some operations
echo "\\n=== Testing Action with Correct Format ==="
SERVICE="ec2"
ACTION="describe-instances"

# Correct format: aws SERVICE ACTION [OPTIONS]
aws \${SERVICE} \${ACTION} --max-items 1 --output json 2>&1 | head -5

if [ \$? -eq 0 ]; then
  echo "✓ Action executed successfully"
else
  echo "✗ Action failed - check error message above"
fi`,
        },
      ],
      relatedCodes: ['InvalidParameter', 'InvalidRequest'],
      provider: 'aws',
    },
    'InvalidRequest': {
      code: 'InvalidRequest',
      name: 'Invalid Request',
      description: `Getting an **InvalidRequest** error means your AWS API request has invalid structure or format—the request might be malformed, missing required elements, or have syntax errors. This client-side error (4xx) happens when AWS validates request structure. Most common when JSON request bodies are malformed, but also appears when request structure is invalid, required elements are missing, request format doesn't match API requirements, or request validation fails.`,
      metaDescription: 'Fix InvalidRequest by validating request format, checking request structure, including required elements, and verifying request syntax with our AWS troubleshooting guide.',
      causes: [
        `Identity: IAM policy request restrictions. Service Control Policy (SCP) blocks request format.`,
        `Network: VPC endpoint request validation. API Gateway request format restrictions.`,
        `Limits: Malformed JSON request body. Invalid request structure. Missing required elements. Invalid request format. Request validation failed.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check exact error message: AWS usually specifies which part of request is invalid. Review request format. Check JSON syntax if using JSON.`,
        `Step 2: Diagnose - Validate JSON syntax: echo REQUEST_JSON | jq '.'. Check for syntax errors. Verify request structure matches API requirements.`,
        `Step 3: Diagnose - Check request structure: Verify all required elements are present. Check nested parameter structure. Validate parameter types.`,
        `Step 4: Fix - Validate request format: Use AWS CLI which handles formatting automatically: aws ec2 run-instances --image-id ami-xxxxx --instance-type t2.micro. Or fix JSON syntax manually.`,
        `Step 5: Fix - Review API documentation: Check AWS API Reference for exact request format. Verify request structure. Test with minimal valid request first.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Validate JSON Request Syntax',
          code: `#!/bin/bash
# Validate JSON request body
REQUEST_JSON='{"ImageId":"ami-xxxxx","InstanceType":"t2.micro","MinCount":1,"MaxCount":1}'

echo "=== Validating JSON Request ==="
echo "\${REQUEST_JSON}"

# Check JSON syntax
if command -v jq &> /dev/null; then
  echo "\${REQUEST_JSON}" | jq '.' > /dev/null 2>&1
  if [ \$? -eq 0 ]; then
    echo "✓ JSON syntax valid"
    echo "\${REQUEST_JSON}" | jq '.'
  else
    echo "✗ Invalid JSON syntax"
    echo "Fix JSON errors before sending request"
  fi
else
  echo "jq not installed - cannot validate JSON"
  echo "Install: sudo apt-get install jq (Linux) or brew install jq (macOS)"
fi

# Better: Use AWS CLI which handles formatting
echo "\\n=== Better Approach: Use AWS CLI ==="
echo "AWS CLI handles request formatting automatically:"
echo "aws ec2 run-instances --image-id ami-xxxxx --instance-type t2.micro --count 1"`,
        },
        {
          language: 'bash',
          title: 'Check Request Structure and Required Elements',
          code: `#!/bin/bash
# Validate request has required elements
echo "=== Checking Request Structure ==="

# Example: EC2 run-instances requires ImageId and InstanceType
REQUIRED_PARAMS=("ImageId" "InstanceType")

# Check if using AWS CLI (recommended)
echo "Using AWS CLI ensures correct request structure:"
echo "aws ec2 run-instances \\"
echo "  --image-id ami-xxxxx \\"
echo "  --instance-type t2.micro \\"
echo "  --count 1"

# If using JSON directly, validate structure
echo "\\n=== If Using JSON Directly ==="
echo "Ensure request has:"
for param in "\${REQUIRED_PARAMS[@]}"; do
  echo "  - \${param}"
done

# Test with minimal valid request
echo "\\n=== Testing Minimal Valid Request ==="
aws ec2 run-instances \\
  --image-id ami-xxxxx \\
  --instance-type t2.micro \\
  --count 1 \\
  --dry-run 2>&1 | head -3`,
        },
        {
          language: 'bash',
          title: 'Fix Invalid Request Format',
          code: `#!/bin/bash
# Common request format issues and fixes

# Issue 1: Malformed JSON
BAD_JSON='{"ImageId":"ami-xxxxx" "InstanceType":"t2.micro"}'  # Missing comma
echo "=== Fixing Malformed JSON ==="
echo "Bad: \${BAD_JSON}"
GOOD_JSON='{"ImageId":"ami-xxxxx","InstanceType":"t2.micro"}'
echo "Good: \${GOOD_JSON}"

# Issue 2: Missing required elements
echo "\\n=== Adding Missing Required Elements ==="
INCOMPLETE='{"ImageId":"ami-xxxxx"}'  # Missing InstanceType
echo "Incomplete: \${INCOMPLETE}"
COMPLETE='{"ImageId":"ami-xxxxx","InstanceType":"t2.micro","MinCount":1,"MaxCount":1}'
echo "Complete: \${COMPLETE}"

# Best practice: Use AWS CLI
echo "\\n=== Best Practice: Use AWS CLI ==="
echo "Instead of building JSON manually, use:"
echo "aws ec2 run-instances \\"
echo "  --image-id ami-xxxxx \\"
echo "  --instance-type t2.micro \\"
echo "  --count 1"`,
        },
      ],
      relatedCodes: ['InvalidParameter', 'MalformedQueryString'],
      provider: 'aws',
    },
    'OptInRequired': {
      code: 'OptInRequired',
      name: 'Opt In Required',
      description: `Getting an **OptInRequired** error means you need to opt in to an AWS service or feature before using it—some AWS services require explicit opt-in, especially new regions, Local Zones, Wavelength Zones, or certain features. This client-side error (4xx) happens when AWS requires explicit acceptance. Most common when using new AWS regions, but also appears when Local Zones require opt-in, Wavelength Zones need activation, certain features require acceptance, or service agreements haven't been completed.`,
      metaDescription: 'Fix OptInRequired by completing service opt-in, enabling features, accepting terms of service, and opting in to regions with our AWS troubleshooting guide.',
      causes: [
        `Identity: IAM permissions allow but opt-in not completed. Service Control Policy (SCP) requires opt-in. Account-level opt-in restrictions.`,
        `Network: New region opt-in required. Local Zone opt-in required. Wavelength Zone opt-in required.`,
        `Limits: Service opt-in not completed. Feature not enabled. Service agreement not accepted. Terms of service not agreed.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check which service/region requires opt-in: Review error message for specific service or region. Check if it's a new region, Local Zone, or Wavelength Zone.`,
        `Step 2: Diagnose - Check opt-in status: For EC2 Local Zones: aws ec2 describe-availability-zones --filters "Name=opt-in-status,Values=opted-in" --query 'AvailabilityZones[*].ZoneName' --output table. Check which zones require opt-in.`,
        `Step 3: Diagnose - Verify account status: aws sts get-caller-identity. Check if account can opt in. Verify billing/payment method is active.`,
        `Step 4: Fix - Opt in to Local Zone: aws ec2 modify-availability-zone-group --group-name ZONE_GROUP_NAME --opt-in-status opted-in. Verify: aws ec2 describe-availability-zones --zone-names ZONE_NAME.`,
        `Step 5: Fix - Opt in to new region: Visit AWS Console > Account Settings > Regions. Enable the region. Or use AWS CLI if supported. Accept terms of service if prompted.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check Opt-In Status for Availability Zones',
          code: `#!/bin/bash
# Check which zones require opt-in
echo "=== Availability Zones Requiring Opt-In ==="
aws ec2 describe-availability-zones \\
  --filters "Name=opt-in-status,Values=not-opted-in" \\
  --query 'AvailabilityZones[*].[ZoneName,ZoneId,OptInStatus]' \\
  --output table

# Check opted-in zones
echo "\\n=== Already Opted-In Zones ==="
aws ec2 describe-availability-zones \\
  --filters "Name=opt-in-status,Values=opted-in" \\
  --query 'AvailabilityZones[*].[ZoneName,ZoneId]' \\
  --output table

# List all zones with opt-in status
echo "\\n=== All Zones with Opt-In Status ==="
aws ec2 describe-availability-zones \\
  --query 'AvailabilityZones[*].[ZoneName,OptInStatus,RegionName]' \\
  --output table`,
        },
        {
          language: 'bash',
          title: 'Opt In to Local Zone or Wavelength Zone',
          code: `#!/bin/bash
# Opt in to Local Zone
ZONE_GROUP_NAME="us-east-1-wl1-nyc-wlz-1"  # Replace with your zone group

echo "=== Opting In to Zone Group: \${ZONE_GROUP_NAME} ==="
aws ec2 modify-availability-zone-group \\
  --group-name \${ZONE_GROUP_NAME} \\
  --opt-in-status opted-in

# Verify opt-in status
echo "\\n=== Verifying Opt-In Status ==="
aws ec2 describe-availability-zones \\
  --zone-names \${ZONE_GROUP_NAME} \\
  --query 'AvailabilityZones[*].[ZoneName,OptInStatus]' \\
  --output table

# Note: Some zones may require console opt-in
echo "\\n=== Note ==="
echo "Some zones require opt-in via AWS Console:"
echo "1. Go to EC2 Console > Settings > Zones"
echo "2. Enable the zone"
echo "3. Accept terms of service"`,
        },
        {
          language: 'bash',
          title: 'Check Account Status and Opt-In Eligibility',
          code: `#!/bin/bash
# Check account identity
echo "=== Account Identity ==="
aws sts get-caller-identity --output table

# Check if account can opt in (requires valid payment method)
echo "\\n=== Account Status ==="
echo "Opt-in requires:"
echo "1. Valid payment method on file"
echo "2. Account in good standing"
echo "3. Terms of service accepted"

# Check for account issues
echo "\\n=== Checking for Account Issues ==="
aws support describe-cases \\
  --include-resolved-cases \\
  --max-results 5 \\
  --query 'cases[*].[caseId,status,subject]' \\
  --output table 2>&1 | head -5 || echo "No support cases or access denied"

# Note: Some opt-ins require console
echo "\\n=== Opt-In Methods ==="
echo "1. AWS CLI (for Local Zones/Wavelength Zones)"
echo "2. AWS Console (for new regions and some features)"
echo "3. Contact AWS Support (for special cases)"`,
        },
      ],
      relatedCodes: ['AccessDenied', 'InvalidParameter'],
      provider: 'aws',
    },
    'AccountProblem': {
      code: 'AccountProblem',
      name: 'Account Problem',
      description: `Getting an **AccountProblem** error means there's an issue with your AWS account that's blocking operations—your account might be suspended, payment method declined, or verification incomplete. This client-side error (4xx) happens when AWS validates account status. Most common when payment methods are declined, but also appears when accounts are suspended, account verification is incomplete, billing problems prevent operations, or account service limits are reached.`,
      metaDescription: 'Fix AccountProblem by checking account status, verifying payment methods, completing account verification, and reviewing billing settings with our AWS troubleshooting guide.',
      causes: [
        `Identity: Account suspended or disabled. Account verification incomplete. Account in bad standing.`,
        `Network: Account-level service restrictions. Regional account limitations.`,
        `Limits: Payment method issue or declined. Billing problem preventing operations. Account service limit reached. Outstanding payment due.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check account identity: aws sts get-caller-identity. Verify account is active. Check if account can make requests.`,
        `Step 2: Diagnose - Check account status in console: Visit AWS Console > Account Settings. Review account status. Check for suspension notices. Verify payment method status.`,
        `Step 3: Diagnose - Check billing and payment: Review AWS Console > Billing Dashboard. Check for outstanding payments. Verify payment method is valid and active. Check payment method expiration.`,
        `Step 4: Fix - Update payment method: Go to AWS Console > Payment Methods. Add or update payment method. Verify payment method is active. Wait for payment processing.`,
        `Step 5: Fix - Complete account verification: If verification required, complete process in AWS Console. Contact AWS Support if account is suspended: aws support create-case --subject "Account Problem" --service-code account-management --severity-code urgent.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check Account Identity and Status',
          code: `#!/bin/bash
# Check account identity
echo "=== Account Identity ==="
aws sts get-caller-identity --output table

# Check if account can make requests
echo "\\n=== Testing Account Access ==="
aws s3 ls 2>&1 | head -3

if [ \$? -eq 0 ]; then
  echo "✓ Account appears active"
else
  echo "✗ Account may have issues - check error above"
fi

# Check for organization (if applicable)
echo "\\n=== Organization Status ==="
aws organizations describe-organization 2>/dev/null || echo "No organization or access denied"

# Check account contact information
echo "\\n=== Account Contact Information ==="
aws account get-contact-information 2>&1 | head -5 || echo "Cannot retrieve contact info (may require permissions)"`,
        },
        {
          language: 'bash',
          title: 'Check Support Cases and Account Issues',
          code: `#!/bin/bash
# Check for open support cases
echo "=== Support Cases ==="
aws support describe-cases \\
  --include-resolved-cases false \\
  --max-results 10 \\
  --query 'cases[*].[caseId,status,subject,createdTime]' \\
  --output table 2>&1 | head -10 || echo "No support access or no cases"

# Check for account-related cases
echo "\\n=== Account-Related Cases ==="
aws support describe-cases \\
  --include-resolved-cases \\
  --max-results 10 \\
  --query "cases[?contains(subject, 'account') || contains(subject, 'billing')].[caseId,status,subject]" \\
  --output table 2>&1 | head -10 || echo "No account-related cases"

# Note: Account status details require console
echo "\\n=== Account Status Check ==="
echo "For detailed account status, check AWS Console:"
echo "1. Go to AWS Console > Account Settings"
echo "2. Review account status"
echo "3. Check billing and payment methods"
echo "4. Verify account verification status"`,
        },
        {
          language: 'bash',
          title: 'Create Support Case for Account Problem',
          code: `#!/bin/bash
# Create support case for account issues
echo "=== Creating Support Case ==="
echo "Subject: Account Problem - Unable to perform operations"
echo "Service: Account Management"
echo "Severity: Urgent"

# Create case (if support access available)
aws support create-case \\
  --subject "Account Problem - Unable to perform operations" \\
  --service-code account-management \\
  --severity-code urgent \\
  --category-code account-management \\
  --communication-body "Account experiencing issues preventing operations. Please investigate account status." \\
  --output json 2>&1 | head -10 || echo "Support API access may be limited - use AWS Console instead"

echo "\\n=== Alternative: Use AWS Console ==="
echo "1. Go to AWS Support Center"
echo "2. Create case > Account and billing support"
echo "3. Select 'Account' as issue type"
echo "4. Describe the problem"`,
        },
      ],
      relatedCodes: ['AccessDenied', 'InvalidUserID.NotFound'],
      provider: 'aws',
    },
    'AmbiguousGrantByEmailAddress': {
      code: 'AmbiguousGrantByEmailAddress',
      name: 'Ambiguous Grant By Email Address',
      description: `Getting an **AmbiguousGrantByEmailAddress** error means the email address you're using in an IAM policy grant is associated with multiple AWS accounts—AWS can't determine which account you mean, so you must specify the account ID explicitly. This client-side error (4xx) happens when AWS evaluates IAM policy grants. Most common when S3 bucket policies grant access by email, but also appears when IAM policies reference users by email across multiple accounts, cross-account grants use email addresses, or account identifiers are missing from grants.`,
      metaDescription: 'Fix AmbiguousGrantByEmailAddress by specifying AWS account IDs explicitly, using full ARNs instead of emails, and providing unique account identifiers with our AWS troubleshooting guide.',
      causes: [
        `Identity: Email address used by multiple AWS accounts. Account ID not specified in IAM policy grant. Cross-account grant ambiguity.`,
        `Network: S3 bucket policy grants by email across accounts. IAM policy grants by email without account ID.`,
        `Limits: Multiple accounts share same email. Account identifier missing from request. Ambiguous user identification.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check which account you're targeting: aws sts get-caller-identity --query Account --output text. Note your account ID. Verify target account ID.`,
        `Step 2: Diagnose - Review IAM policy or bucket policy: Check policy document for email-based grants. Identify which grant is ambiguous. Check if account ID is specified.`,
        `Step 3: Diagnose - Verify email is associated with multiple accounts: If possible, check if email exists in multiple accounts. Verify account ID for target account.`,
        `Step 4: Fix - Specify account ID in grant: Use full ARN: arn:aws:iam::ACCOUNT_ID:user/EMAIL. Or add account ID parameter if supported. Replace email with IAM user ARN.`,
        `Step 5: Fix - Use IAM user ARN instead of email: Get user ARN: aws iam get-user --user-name USER_NAME --query 'User.Arn' --output text. Use ARN in policy: arn:aws:iam::ACCOUNT_ID:user/USER_NAME.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Get Account ID and User ARN',
          code: `#!/bin/bash
# Get your account ID
echo "=== Your Account ID ==="
ACCOUNT_ID=\$(aws sts get-caller-identity --query Account --output text)
echo "Account ID: \${ACCOUNT_ID}"

# Get IAM user ARN (if using IAM user)
echo "\\n=== IAM User ARN ==="
USER_ARN=\$(aws sts get-caller-identity --query Arn --output text)
echo "User ARN: \${USER_ARN}"

# Extract user name from ARN
USER_NAME=\$(echo \${USER_ARN} | cut -d'/' -f2)
echo "User Name: \${USER_NAME}"

# Get full user details
echo "\\n=== Full User Details ==="
aws iam get-user --user-name \${USER_NAME} \\
  --query 'User.[UserId,Arn,UserName]' \\
  --output table`,
        },
        {
          language: 'bash',
          title: 'Fix S3 Bucket Policy with Account ID',
          code: `#!/bin/bash
# Example: Fix ambiguous email in S3 bucket policy
BUCKET_NAME="my-bucket"
ACCOUNT_ID="123456789012"  # Replace with target account ID
EMAIL="user@example.com"

echo "=== Fixing Ambiguous Email in Bucket Policy ==="

# Bad: Ambiguous email (no account ID)
BAD_POLICY="{
  \"Version\": \"2012-10-17\",
  \"Statement\": [{
    \"Effect\": \"Allow\",
    \"Principal\": {\"AWS\": \"arn:aws:iam::\${EMAIL}\"},
    \"Action\": \"s3:GetObject\",
    \"Resource\": \"arn:aws:s3:::\${BUCKET_NAME}/*\"
  }]
}"

# Good: Specify account ID
GOOD_POLICY="{
  \"Version\": \"2012-10-17\",
  \"Statement\": [{
    \"Effect\": \"Allow\",
    \"Principal\": {\"AWS\": \"arn:aws:iam::\${ACCOUNT_ID}:user/\${EMAIL}\"},
    \"Action\": \"s3:GetObject\",
    \"Resource\": \"arn:aws:s3:::\${BUCKET_NAME}/*\"
  }]
}"

echo "Bad (ambiguous): \${BAD_POLICY}"
echo "\\nGood (with account ID): \${GOOD_POLICY}"

# Apply fixed policy
echo "\\n=== Applying Fixed Policy ==="
echo "\${GOOD_POLICY}" > /tmp/bucket-policy.json
aws s3api put-bucket-policy \\
  --bucket \${BUCKET_NAME} \\
  --policy file:///tmp/bucket-policy.json`,
        },
        {
          language: 'bash',
          title: 'Use IAM User ARN Instead of Email',
          code: `#!/bin/bash
# Get IAM user ARN for unambiguous identification
USER_NAME="myuser"
ACCOUNT_ID=\$(aws sts get-caller-identity --query Account --output text)

echo "=== Getting IAM User ARN ==="
USER_ARN=\$(aws iam get-user --user-name \${USER_NAME} \\
  --query 'User.Arn' \\
  --output text)

echo "User ARN: \${USER_ARN}"

# Use ARN in policy instead of email
echo "\\n=== Using ARN in Policy ==="
echo "Instead of: arn:aws:iam::\${ACCOUNT_ID}:user/user@example.com"
echo "Use: \${USER_ARN}"

# Example: S3 bucket policy with ARN
BUCKET_NAME="my-bucket"
POLICY="{
  \"Version\": \"2012-10-17\",
  \"Statement\": [{
    \"Effect\": \"Allow\",
    \"Principal\": {\"AWS\": \"\${USER_ARN}\"},
    \"Action\": \"s3:GetObject\",
    \"Resource\": \"arn:aws:s3:::\${BUCKET_NAME}/*\"
  }]
}"

echo "\\nPolicy with ARN:"
echo "\${POLICY}" | jq '.'`,
        },
      ],
      relatedCodes: ['InvalidUserID.NotFound', 'NoSuchEntity'],
      provider: 'aws',
    },
    'BadDigest': {
      code: 'BadDigest',
      name: 'Bad Digest',
      description: `Getting a **BadDigest** error means the Content-MD5 hash you sent doesn't match what AWS calculated from the uploaded data—the file was corrupted during transmission, the MD5 hash was calculated incorrectly, or the file was modified after hashing. This client-side error (4xx) happens when AWS validates data integrity using MD5 checksums. Most common when uploading S3 objects with Content-MD5 headers, but also appears when data corruption occurs during upload, MD5 hashes are calculated incorrectly, network transmission errors corrupt data, or files are modified after hashing.`,
      metaDescription: 'Fix BadDigest by recalculating Content-MD5 hashes, verifying data integrity, checking network stability, and using multipart uploads for large files with our AWS guide.',
      causes: [
        `Identity: IAM policy allows upload but hash validation fails. Service Control Policy (SCP) enforces hash validation.`,
        `Network: Data corruption during network transmission. Network errors corrupting upload. VPC endpoint transmission issues.`,
        `Limits: Content-MD5 hash mismatch. Incorrect MD5 hash calculation. Data corruption during upload. Object modified during upload process.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check if Content-MD5 was provided: Review request headers. Verify Content-MD5 header is present. Check if hash was calculated correctly.`,
        `Step 2: Diagnose - Recalculate MD5 hash: Calculate hash of file: md5sum FILE (Linux) or md5 FILE (macOS). Compare with hash sent to AWS. Verify hash is base64-encoded.`,
        `Step 3: Diagnose - Check for data corruption: Verify file hasn't changed since hash calculation. Check network connection stability. Verify file wasn't modified during upload.`,
        `Step 4: Fix - Recalculate and re-upload: Calculate correct MD5: MD5_HASH=\$(md5sum FILE | cut -d' ' -f1 | xxd -r -p | base64). Upload with correct hash: aws s3api put-object --bucket BUCKET --key KEY --body FILE --content-md5 \${MD5_HASH}.`,
        `Step 5: Fix - Use multipart upload for large files: For files > 5GB, use multipart upload: aws s3 cp FILE s3://BUCKET/KEY --multipart-chunk-size 64MB. Multipart upload handles integrity automatically. Or let AWS CLI handle MD5 automatically (don't specify Content-MD5).`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Calculate Content-MD5 Hash for S3 Upload',
          code: `#!/bin/bash
FILE_PATH="path/to/file.txt"

echo "=== Calculating MD5 Hash ==="

# Method 1: Using md5sum (Linux) or md5 (macOS)
if command -v md5sum &> /dev/null; then
  # Linux: Get hex MD5, convert to binary, then base64
  HEX_HASH=\$(md5sum \${FILE_PATH} | cut -d' ' -f1)
  echo "Hex MD5: \${HEX_HASH}"
  
  # Convert hex to binary, then base64
  BASE64_HASH=\$(echo \${HEX_HASH} | xxd -r -p | base64)
  echo "Base64 MD5: \${BASE64_HASH}"
elif command -v md5 &> /dev/null; then
  # macOS: md5 outputs hex
  HEX_HASH=\$(md5 -q \${FILE_PATH})
  echo "Hex MD5: \${HEX_HASH}"
  BASE64_HASH=\$(echo \${HEX_HASH} | xxd -r -p | base64)
  echo "Base64 MD5: \${BASE64_HASH}"
else
  echo "md5sum or md5 not found"
  exit 1
fi

# Upload with Content-MD5
echo "\\n=== Uploading with Content-MD5 ==="
BUCKET_NAME="my-bucket"
OBJECT_KEY="file.txt"

aws s3api put-object \\
  --bucket \${BUCKET_NAME} \\
  --key \${OBJECT_KEY} \\
  --body \${FILE_PATH} \\
  --content-md5 \${BASE64_HASH} 2>&1

if [ \$? -eq 0 ]; then
  echo "✓ Upload successful with MD5 verification"
else
  echo "✗ Upload failed - check if BadDigest error"
fi`,
        },
        {
          language: 'bash',
          title: 'Verify File Integrity Before Upload',
          code: `#!/bin/bash
FILE_PATH="path/to/file.txt"

echo "=== Verifying File Integrity ==="

# Calculate hash before upload
echo "Calculating initial MD5..."
INITIAL_HASH=\$(md5sum \${FILE_PATH} 2>/dev/null | cut -d' ' -f1 || md5 -q \${FILE_PATH})
echo "Initial hash: \${INITIAL_HASH}"

# Wait a moment and recalculate
echo "\\nRecalculating after delay..."
sleep 2
FINAL_HASH=\$(md5sum \${FILE_PATH} 2>/dev/null | cut -d' ' -f1 || md5 -q \${FILE_PATH})
echo "Final hash: \${FINAL_HASH}"

if [ "\${INITIAL_HASH}" = "\${FINAL_HASH}" ]; then
  echo "✓ File integrity verified (hashes match)"
else
  echo "✗ File may have been modified (hashes don't match)"
  echo "Do not upload - file may be corrupted or being modified"
  exit 1
fi

# Check file size
FILE_SIZE=\$(stat -f%z "\${FILE_PATH}" 2>/dev/null || stat -c%s "\${FILE_PATH}" 2>/dev/null)
echo "\\nFile size: \${FILE_SIZE} bytes"`,
        },
        {
          language: 'bash',
          title: 'Use Multipart Upload for Large Files',
          code: `#!/bin/bash
# For large files, use multipart upload (handles integrity automatically)
FILE_PATH="large-file.zip"
BUCKET_NAME="my-bucket"
OBJECT_KEY="large-file.zip"

echo "=== Using Multipart Upload (Recommended for Large Files) ==="

# AWS CLI handles multipart upload automatically for files > 64MB
# It also handles MD5 verification automatically
aws s3 cp \${FILE_PATH} s3://\${BUCKET_NAME}/\${OBJECT_KEY} 2>&1

if [ \$? -eq 0 ]; then
  echo "✓ Upload successful"
  echo "Multipart upload handles integrity verification automatically"
else
  echo "✗ Upload failed"
fi

# Alternative: Explicit multipart upload with chunk size
echo "\\n=== Explicit Multipart Upload ==="
echo "For very large files, specify chunk size:"
echo "aws s3 cp \${FILE_PATH} s3://\${BUCKET_NAME}/\${OBJECT_KEY} \\"
echo "  --expected-size \$(stat -f%z \${FILE_PATH} 2>/dev/null || stat -c%s \${FILE_PATH})"

# Note: Best practice is to let AWS CLI handle MD5 automatically
echo "\\n=== Best Practice ==="
echo "Don't specify Content-MD5 - let AWS CLI calculate it automatically"
echo "This avoids BadDigest errors from incorrect hash calculation"`,
        },
      ],
      relatedCodes: ['InvalidDigest', 'RequestTimeout'],
      provider: 'aws',
    },
    'CredentialsNotSupported': {
      code: 'CredentialsNotSupported',
      name: 'Credentials Not Supported',
      description: `Getting a **CredentialsNotSupported** error means the AWS service doesn't accept the credential type you're using—some operations require specific authentication methods like IAM roles, while others accept access keys. This client-side error (4xx) happens when AWS validates credential types. Most common when using access keys for operations that require IAM roles, but also appears when credential formats are incorrect, services have specific authentication requirements, authentication methods don't match service expectations, or temporary credentials aren't supported for the operation.`,
      metaDescription: 'Fix CredentialsNotSupported by using IAM roles for EC2/Lambda, checking service-specific authentication requirements, and verifying credential formats with our AWS troubleshooting guide.',
      causes: [
        `Identity: Credential type not supported by operation. IAM role required but access keys used. Service Control Policy (SCP) restricts credential types.`,
        `Network: VPC endpoint credential restrictions. API Gateway authentication method mismatch.`,
        `Limits: Wrong authentication method used. Service doesn't accept these credentials. Credential format incorrect for service. Temporary credentials not supported.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check which credentials are being used: aws configure list. Verify credential source (access keys, IAM role, etc.). Check if operation requires specific credential type.`,
        `Step 2: Diagnose - Review service authentication requirements: Check AWS service documentation. Verify if IAM role is required. Check if access keys are supported.`,
        `Step 3: Diagnose - Check if running on EC2/Lambda: If on EC2, use instance profile: aws sts get-caller-identity. If on Lambda, use execution role. Verify IAM role is attached.`,
        `Step 4: Fix - Use IAM role for EC2/Lambda: Attach IAM role to EC2 instance. Or use Lambda execution role. Verify role has required permissions: aws iam get-role --role-name ROLE_NAME.`,
        `Step 5: Fix - Switch credential type: For EC2 operations, use instance profile. For Lambda, use execution role. For CLI, use access keys: aws configure set aws_access_key_id KEY_ID.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check Current Credentials and Source',
          code: `#!/bin/bash
# Check which credentials are being used
echo "=== Current Credentials Configuration ==="
aws configure list

# Check credential source
echo "\\n=== Credential Source ==="
echo "Checking if using IAM role (EC2 instance profile)..."
aws sts get-caller-identity --query '[Account,Arn,UserId]' --output table

# Extract role name from ARN
ROLE_ARN=\$(aws sts get-caller-identity --query Arn --output text 2>/dev/null)
if [[ \${ROLE_ARN} == *"assumed-role"* ]]; then
  ROLE_NAME=\$(echo \${ROLE_ARN} | cut -d'/' -f2)
  echo "Using IAM role: \${ROLE_NAME}"
elif [[ \${ROLE_ARN} == *"user"* ]]; then
  echo "Using IAM user credentials"
else
  echo "Using access keys or other credentials"
fi

# Check environment variables
echo "\\n=== Environment Variables ==="
echo "AWS_ACCESS_KEY_ID: \${AWS_ACCESS_KEY_ID:-(not set)}"
echo "AWS_SESSION_TOKEN: \${AWS_SESSION_TOKEN:+(set)}"`,
        },
        {
          language: 'bash',
          title: 'Verify IAM Role for EC2 Instance',
          code: `#!/bin/bash
# Check if running on EC2 and using instance profile
echo "=== Checking EC2 Instance Profile ==="

# Get instance metadata
INSTANCE_ID=\$(curl -s http://169.254.169.254/latest/meta-data/instance-id 2>/dev/null)
if [ ! -z "\${INSTANCE_ID}" ]; then
  echo "Running on EC2 instance: \${INSTANCE_ID}"
  
  # Get IAM role name
  ROLE_NAME=\$(curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/ 2>/dev/null | head -1)
  if [ ! -z "\${ROLE_NAME}" ]; then
    echo "Instance profile role: \${ROLE_NAME}"
    
    # Get role details
    echo "\\n=== IAM Role Details ==="
    aws iam get-role --role-name \${ROLE_NAME} \\
      --query 'Role.[RoleName,Arn,CreateDate]' \\
      --output table 2>&1
  else
    echo "✗ No IAM role attached to instance"
    echo "Attach IAM role via EC2 Console or:"
    echo "aws ec2 associate-iam-instance-profile --instance-id \${INSTANCE_ID} --iam-instance-profile Name=PROFILE_NAME"
  fi
else
  echo "Not running on EC2 - using configured credentials"
fi`,
        },
        {
          language: 'bash',
          title: 'Switch to Appropriate Credential Type',
          code: `#!/bin/bash
# For EC2 operations, ensure using instance profile
echo "=== For EC2 Operations ==="
echo "If on EC2, use instance profile (automatic):"
echo "aws ec2 describe-instances"

# For Lambda, use execution role
echo "\\n=== For Lambda Functions ==="
echo "Lambda automatically uses execution role"
echo "Verify role is attached: aws lambda get-function --function-name FUNCTION_NAME --query 'Configuration.Role'"

# For CLI operations, can use access keys
echo "\\n=== For CLI Operations ==="
echo "Can use access keys:"
echo "aws configure set aws_access_key_id KEY_ID"
echo "aws configure set aws_secret_access_key SECRET_KEY"

# Test credentials
echo "\\n=== Testing Credentials ==="
aws sts get-caller-identity --output table

# If CredentialsNotSupported, try different method
echo "\\n=== If CredentialsNotSupported Error ==="
echo "1. For EC2: Ensure instance has IAM role attached"
echo "2. For Lambda: Verify execution role is configured"
echo "3. For CLI: Use access keys or assume role"
echo "4. Check service documentation for required credential type"`,
        },
      ],
      relatedCodes: ['InvalidAccessKeyId', 'InvalidClientTokenId'],
      provider: 'aws',
    },
    'CrossLocationLoggingProhibited': {
      code: 'CrossLocationLoggingProhibited',
      name: 'Cross Location Logging Prohibited',
      description: `Hitting a **CrossLocationLoggingProhibited** error means you're trying to configure S3 bucket logging where the source bucket and logging bucket are in different AWS regions—S3 requires both buckets to be in the same region for logging. This client-side error (4xx) happens when AWS validates S3 logging configuration. Most common when source and logging buckets are in different regions, but also appears when cross-region logging is attempted, geographic location mismatch occurs, or logging configuration violates S3 region rules.`,
      metaDescription: 'Fix CrossLocationLoggingProhibited by ensuring source and logging buckets are in the same region, creating logging buckets in the correct region, and updating logging configuration with our AWS guide.',
      causes: [
        `Identity: IAM policy allows logging but region mismatch. Service Control Policy (SCP) enforces same-region logging.`,
        `Network: Logging bucket in different AWS region. Cross-region logging attempted. VPC endpoint routing to different regions.`,
        `Limits: Source bucket and logging bucket in different regions. Geographic location mismatch. Logging configuration violates S3 region rules.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check source bucket region: aws s3api get-bucket-location --bucket SOURCE_BUCKET. Note the region. Verify bucket exists in that region.`,
        `Step 2: Diagnose - Check logging bucket region: aws s3api get-bucket-location --bucket LOGGING_BUCKET. Compare with source bucket region. Verify if regions match.`,
        `Step 3: Diagnose - Review current logging configuration: aws s3api get-bucket-logging --bucket SOURCE_BUCKET. Check which bucket is configured for logging. Verify region mismatch.`,
        `Step 4: Fix - Create logging bucket in same region: aws s3api mb s3://LOGGING_BUCKET --region SOURCE_REGION. Or use existing bucket in same region. Verify regions match: aws s3api get-bucket-location --bucket BUCKET_NAME.`,
        `Step 5: Fix - Configure logging with same-region bucket: aws s3api put-bucket-logging --bucket SOURCE_BUCKET --bucket-logging-status file://logging.json. Ensure logging.json specifies bucket in same region.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check Bucket Regions for Logging Configuration',
          code: `#!/bin/bash
SOURCE_BUCKET="my-source-bucket"
LOGGING_BUCKET="my-logging-bucket"

echo "=== Checking Source Bucket Region ==="
SOURCE_REGION=\$(aws s3api get-bucket-location --bucket \${SOURCE_BUCKET} --query LocationConstraint --output text 2>/dev/null)
# us-east-1 returns null, handle it
if [ "\${SOURCE_REGION}" = "None" ] || [ -z "\${SOURCE_REGION}" ]; then
  SOURCE_REGION="us-east-1"
fi
echo "Source bucket region: \${SOURCE_REGION}"

echo "\\n=== Checking Logging Bucket Region ==="
LOGGING_REGION=\$(aws s3api get-bucket-location --bucket \${LOGGING_BUCKET} --query LocationConstraint --output text 2>/dev/null)
if [ "\${LOGGING_REGION}" = "None" ] || [ -z "\${LOGGING_REGION}" ]; then
  LOGGING_REGION="us-east-1"
fi
echo "Logging bucket region: \${LOGGING_REGION}"

# Compare regions
echo "\\n=== Region Comparison ==="
if [ "\${SOURCE_REGION}" = "\${LOGGING_REGION}" ]; then
  echo "✓ Regions match - logging configuration should work"
else
  echo "✗ Regions don't match - this will cause CrossLocationLoggingProhibited"
  echo "Source: \${SOURCE_REGION}, Logging: \${LOGGING_REGION}"
  echo "\\nFix: Create logging bucket in \${SOURCE_REGION} or use existing bucket in same region"
fi`,
        },
        {
          language: 'bash',
          title: 'Create Logging Bucket in Same Region',
          code: `#!/bin/bash
SOURCE_BUCKET="my-source-bucket"
LOGGING_BUCKET="my-logging-bucket-same-region"

# Get source bucket region
SOURCE_REGION=\$(aws s3api get-bucket-location --bucket \${SOURCE_BUCKET} --query LocationConstraint --output text 2>/dev/null)
if [ "\${SOURCE_REGION}" = "None" ] || [ -z "\${SOURCE_REGION}" ]; then
  SOURCE_REGION="us-east-1"
fi

echo "=== Creating Logging Bucket in Same Region ==="
echo "Source bucket region: \${SOURCE_REGION}"
echo "Creating logging bucket: \${LOGGING_BUCKET}"

# Create bucket in same region
if [ "\${SOURCE_REGION}" = "us-east-1" ]; then
  # us-east-1 doesn't need LocationConstraint
  aws s3api create-bucket --bucket \${LOGGING_BUCKET} --region \${SOURCE_REGION}
else
  aws s3api create-bucket \\
    --bucket \${LOGGING_BUCKET} \\
    --region \${SOURCE_REGION} \\
    --create-bucket-configuration LocationConstraint=\${SOURCE_REGION}
fi

# Verify bucket created in correct region
echo "\\n=== Verifying Logging Bucket Region ==="
aws s3api get-bucket-location --bucket \${LOGGING_BUCKET} --query LocationConstraint --output text`,
        },
        {
          language: 'bash',
          title: 'Configure S3 Logging with Same-Region Bucket',
          code: `#!/bin/bash
SOURCE_BUCKET="my-source-bucket"
LOGGING_BUCKET="my-logging-bucket"

# Verify regions match first
SOURCE_REGION=\$(aws s3api get-bucket-location --bucket \${SOURCE_BUCKET} --query LocationConstraint --output text 2>/dev/null)
LOGGING_REGION=\$(aws s3api get-bucket-location --bucket \${LOGGING_BUCKET} --query LocationConstraint --output text 2>/dev/null)

if [ "\${SOURCE_REGION}" = "None" ] || [ -z "\${SOURCE_REGION}" ]; then
  SOURCE_REGION="us-east-1"
fi
if [ "\${LOGGING_REGION}" = "None" ] || [ -z "\${LOGGING_REGION}" ]; then
  LOGGING_REGION="us-east-1"
fi

if [ "\${SOURCE_REGION}" != "\${LOGGING_REGION}" ]; then
  echo "✗ Regions don't match - cannot configure logging"
  exit 1
fi

echo "=== Configuring S3 Logging ==="
echo "Source bucket: \${SOURCE_BUCKET} (region: \${SOURCE_REGION})"
echo "Logging bucket: \${LOGGING_BUCKET} (region: \${LOGGING_REGION})"

# Create logging configuration JSON
cat > /tmp/logging.json <<EOF
{
  "LoggingEnabled": {
    "TargetBucket": "\${LOGGING_BUCKET}",
    "TargetPrefix": "logs/"
  }
}
EOF

# Apply logging configuration
aws s3api put-bucket-logging \\
  --bucket \${SOURCE_BUCKET} \\
  --bucket-logging-status file:///tmp/logging.json

# Verify logging configuration
echo "\\n=== Verifying Logging Configuration ==="
aws s3api get-bucket-logging --bucket \${SOURCE_BUCKET} --output json`,
        },
      ],
      relatedCodes: ['InvalidBucketName', 'IllegalLocationConstraintException'],
      provider: 'aws',
    },
    'EntityTooLarge': {
      code: 'EntityTooLarge',
      name: 'Entity Too Large',
      description: `Hitting an **EntityTooLarge** error means your S3 upload exceeds the 5TB maximum object size limit—S3 allows single objects up to 5TB, but for files larger than 5GB, you should use multipart upload. This client-side error (4xx) happens when AWS validates upload size. Most common when uploading very large files as single objects, but also appears when object size exceeds 5TB limit, files are too large for single upload, or upload size violates S3 limits.`,
      metaDescription: 'Fix EntityTooLarge by using multipart upload for files >5GB, splitting large files, or using AWS Transfer Family/Snowball for petabyte-scale transfers with our AWS guide.',
      causes: [
        `Identity: IAM policy allows upload but size limit exceeded. Service Control Policy (SCP) enforces size limits.`,
        `Network: VPC endpoint size restrictions. API Gateway payload size limits.`,
        `Limits: Object size exceeds 5TB limit. File too large for single upload (>5GB should use multipart). Maximum object size exceeded. Upload size limit violation.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check file size: ls -lh FILE or stat -f%z FILE (macOS). Compare with 5TB limit. Check if file is >5GB (should use multipart).`,
        `Step 2: Diagnose - Verify S3 object size limits: S3 single object limit is 5TB. Files >5GB should use multipart upload. Check if using single upload for large file.`,
        `Step 3: Diagnose - Check current upload method: Review if using put-object (single) vs multipart. Verify if multipart is configured. Check upload chunk size.`,
        `Step 4: Fix - Use multipart upload for large files: aws s3 cp FILE s3://BUCKET/KEY (automatically uses multipart for >5GB). Or use s3api create-multipart-upload for manual control.`,
        `Step 5: Fix - For extremely large files: Use AWS Transfer Family for large file transfers. Or use AWS Snowball for petabyte-scale data migration. Or split files into smaller objects.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check File Size and Use Multipart Upload',
          code: `#!/bin/bash
FILE_PATH="large-file.zip"
BUCKET_NAME="my-bucket"
OBJECT_KEY="large-file.zip"

# Check file size
echo "=== Checking File Size ==="
FILE_SIZE=\$(stat -f%z "\${FILE_PATH}" 2>/dev/null || stat -c%s "\${FILE_PATH}" 2>/dev/null)
FILE_SIZE_MB=\$((FILE_SIZE / 1024 / 1024))
FILE_SIZE_GB=\$((FILE_SIZE / 1024 / 1024 / 1024))

echo "File size: \${FILE_SIZE} bytes (\${FILE_SIZE_MB} MB, \${FILE_SIZE_GB} GB)"

# S3 limits: 5TB max, but use multipart for >5GB
MAX_SINGLE_UPLOAD=5368709120  # 5GB in bytes
MAX_OBJECT_SIZE=5497558138880  # 5TB in bytes

if [ \${FILE_SIZE} -gt \${MAX_OBJECT_SIZE} ]; then
  echo "✗ File exceeds 5TB limit - cannot upload"
  echo "Consider using AWS Snowball or splitting file"
  exit 1
elif [ \${FILE_SIZE} -gt \${MAX_SINGLE_UPLOAD} ]; then
  echo "✓ File >5GB - AWS CLI will automatically use multipart upload"
  echo "\\n=== Uploading with Multipart (Automatic) ==="
  aws s3 cp \${FILE_PATH} s3://\${BUCKET_NAME}/\${OBJECT_KEY}
else
  echo "✓ File <5GB - can use single upload"
  echo "\\n=== Uploading (Single or Multipart) ==="
  aws s3 cp \${FILE_PATH} s3://\${BUCKET_NAME}/\${OBJECT_KEY}
fi`,
        },
        {
          language: 'bash',
          title: 'Use AWS CLI for Automatic Multipart Upload',
          code: `#!/bin/bash
# AWS CLI automatically uses multipart upload for files >5GB
FILE_PATH="very-large-file.zip"
BUCKET_NAME="my-bucket"
OBJECT_KEY="very-large-file.zip"

echo "=== AWS CLI Automatic Multipart Upload ==="
echo "AWS CLI handles multipart upload automatically for files >5GB"
echo "No manual configuration needed"

# Simple upload - CLI handles everything
aws s3 cp \${FILE_PATH} s3://\${BUCKET_NAME}/\${OBJECT_KEY}

# For more control, you can specify multipart settings
echo "\\n=== With Multipart Settings ==="
aws s3 cp \${FILE_PATH} s3://\${BUCKET_NAME}/\${OBJECT_KEY} \\
  --expected-size \$(stat -f%z "\${FILE_PATH}" 2>/dev/null || stat -c%s "\${FILE_PATH}")

# Check upload status
echo "\\n=== Verifying Upload ==="
aws s3 ls s3://\${BUCKET_NAME}/\${OBJECT_KEY} --human-readable`,
        },
      ],
      relatedCodes: ['InvalidRequest', 'RequestEntityTooLarge'],
      provider: 'aws',
    },
    'EntityTooSmall': {
      code: 'EntityTooSmall',
      name: 'Entity Too Small',
      description: `Getting an **EntityTooSmall** error means a multipart upload part is smaller than the 5MB minimum—S3 requires each part (except the last) to be at least 5MB. This client-side error (4xx) happens when AWS validates multipart upload part sizes. Most common when multipart chunk size is set too small, but also appears when part sizes are less than 5MB (except last part), minimum part size is violated, or incorrect multipart chunk size is configured.`,
      metaDescription: 'Fix EntityTooSmall by ensuring multipart upload parts are at least 5MB (except last), adjusting chunk sizes, or using single upload for small files with our AWS guide.',
      causes: [
        `Identity: IAM policy allows upload but part size invalid. Service Control Policy (SCP) enforces part size limits.`,
        `Network: VPC endpoint part size restrictions. API Gateway multipart size limits.`,
        `Limits: Multipart upload part too small (<5MB, except last). Part size less than 5MB minimum. Incorrect multipart chunk size. Part size below 5MB threshold.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check part sizes in multipart upload: Review multipart upload configuration. Check chunk size setting. Verify if parts are <5MB (except last).`,
        `Step 2: Diagnose - Verify multipart upload requirements: S3 requires 5MB minimum per part (except last). Check if using multipart for small file (should use single upload).`,
        `Step 3: Diagnose - Review upload code/configuration: Check chunk size setting. Verify multipart part size calculation. Check if last part is handled correctly.`,
        `Step 4: Fix - Adjust chunk size to 5MB minimum: Set chunk size to at least 5MB: aws s3 cp FILE s3://BUCKET/KEY --expected-size SIZE (AWS CLI handles automatically). Or manually set part size in multipart upload.`,
        `Step 5: Fix - Use single upload for small files: If file <5GB, use single upload: aws s3 cp FILE s3://BUCKET/KEY. Or combine small parts if using multipart. Ensure last part can be <5MB.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check Part Sizes and Use Single Upload for Small Files',
          code: `#!/bin/bash
FILE_PATH="small-file.txt"
BUCKET_NAME="my-bucket"
OBJECT_KEY="small-file.txt"

# Check file size
FILE_SIZE=\$(stat -f%z "\${FILE_PATH}" 2>/dev/null || stat -c%s "\${FILE_PATH}" 2>/dev/null)
MIN_PART_SIZE=5242880  # 5MB in bytes

echo "=== File Size Check ==="
echo "File size: \${FILE_SIZE} bytes"

if [ \${FILE_SIZE} -lt \${MIN_PART_SIZE} ]; then
  echo "✓ File <5MB - use single upload (not multipart)"
  echo "\\n=== Single Upload ==="
  aws s3 cp \${FILE_PATH} s3://\${BUCKET_NAME}/\${OBJECT_KEY}
else
  echo "✓ File >=5MB - AWS CLI will handle multipart correctly"
  echo "\\n=== Multipart Upload (Automatic) ==="
  aws s3 cp \${FILE_PATH} s3://\${BUCKET_NAME}/\${OBJECT_KEY}
fi

# Note: AWS CLI automatically ensures parts are >=5MB (except last)
echo "\\n=== Note ==="
echo "AWS CLI automatically ensures:"
echo "- Each part (except last) is >=5MB"
echo "- Last part can be <5MB"
echo "- No manual part size management needed"`,
        },
        {
          language: 'bash',
          title: 'Verify Multipart Upload Part Sizes',
          code: `#!/bin/bash
# If using manual multipart upload, verify part sizes
BUCKET_NAME="my-bucket"
OBJECT_KEY="file.zip"
UPLOAD_ID="xxxxx"  # From create-multipart-upload

echo "=== Checking Multipart Upload Parts ==="
MIN_PART_SIZE=5242880  # 5MB

# List parts
aws s3api list-parts \\
  --bucket \${BUCKET_NAME} \\
  --key \${OBJECT_KEY} \\
  --upload-id \${UPLOAD_ID} \\
  --query 'Parts[*].[PartNumber,Size]' \\
  --output table

# Check if any part (except last) is <5MB
echo "\\n=== Validating Part Sizes ==="
PARTS=\$(aws s3api list-parts \\
  --bucket \${BUCKET_NAME} \\
  --key \${OBJECT_KEY} \\
  --upload-id \${UPLOAD_ID} \\
  --query 'Parts' \\
  --output json)

TOTAL_PARTS=\$(echo "\${PARTS}" | jq 'length')
LAST_PART_NUM=\$(echo "\${PARTS}" | jq '.[-1].PartNumber')

echo "Total parts: \${TOTAL_PARTS}"
echo "Last part number: \${LAST_PART_NUM}"

# Check each part size
echo "\${PARTS}" | jq -r '.[] | "Part \\(.PartNumber): \\(.Size) bytes"' | while read line; do
  PART_NUM=\$(echo "\${line}" | cut -d' ' -f2 | cut -d':' -f1)
  PART_SIZE=\$(echo "\${line}" | cut -d' ' -f3)
  
  if [ \${PART_NUM} -ne \${LAST_PART_NUM} ] && [ \${PART_SIZE} -lt \${MIN_PART_SIZE} ]; then
    echo "✗ Part \${PART_NUM} is <5MB (except last part)"
  else
    echo "✓ Part \${PART_NUM} size OK"
  fi
done`,
        },
      ],
      relatedCodes: ['InvalidRequest', 'EntityTooLarge'],
      provider: 'aws',
    },
    'ExpiredToken': {
      code: 'ExpiredToken',
      name: 'Expired Token',
      description: `Getting an **ExpiredToken** error means your temporary AWS credentials (session token) have expired—temporary credentials from STS, IAM roles, or assume role operations expire after a set time period (typically 1 hour, max 12 hours). This client-side error (4xx) happens when AWS validates credential expiration. Most common when temporary credentials expire after 1 hour, but also appears when session tokens expire, STS token expiration time passes, IAM role sessions expire, or token expiration time is reached.`,
      metaDescription: 'Fix ExpiredToken by refreshing temporary credentials from STS, obtaining new session tokens, renewing IAM role sessions, or implementing automatic token refresh with our AWS guide.',
      causes: [
        `Identity: Temporary credentials expired. IAM role session expired. STS assume role session expired.`,
        `Network: Session token expired. VPC endpoint token expired.`,
        `Limits: STS token expiration time passed. Token expiration time reached. Default expiration is 1 hour (max 12 hours).`,
      ],
      solutions: [
        `Step 1: Diagnose - Check token expiration: aws sts get-caller-identity. If ExpiredToken, credentials expired. Check when credentials were obtained. Verify expiration time.`,
        `Step 2: Diagnose - Check credential type: aws configure list. Verify if using temporary credentials (session token). Check if using IAM role (auto-refreshes on EC2).`,
        `Step 3: Diagnose - Review credential source: If from STS assume-role, check expiration. If from EC2 instance profile, should auto-refresh. If from Lambda, uses execution role.`,
        `Step 4: Fix - Refresh temporary credentials: For STS: aws sts assume-role --role-arn ROLE_ARN --role-session-name SESSION_NAME. Update credentials: aws configure set aws_session_token NEW_TOKEN.`,
        `Step 5: Fix - Implement automatic token refresh: On EC2, instance profile auto-refreshes. For Lambda, execution role auto-refreshes. For CLI, refresh manually or use assume-role with longer duration (up to 12 hours).`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check Token Expiration and Refresh Credentials',
          code: `#!/bin/bash
# Check current credentials
echo "=== Checking Current Credentials ==="
aws sts get-caller-identity 2>&1

if [ \$? -ne 0 ]; then
  echo "✗ Credentials expired or invalid (ExpiredToken)"
  echo "\\n=== Refreshing Credentials ==="
  
  # Refresh using assume role
  ROLE_ARN="arn:aws:iam::123456789012:role/MyRole"  # Replace with your role
  SESSION_NAME="session-\$(date +%s)"
  
  CREDS=\$(aws sts assume-role \\
    --role-arn \${ROLE_ARN} \\
    --role-session-name \${SESSION_NAME} \\
    --duration-seconds 3600 \\
    --query 'Credentials' \\
    --output json)
  
  # Update credentials
  export AWS_ACCESS_KEY_ID=\$(echo "\${CREDS}" | jq -r '.AccessKeyId')
  export AWS_SECRET_ACCESS_KEY=\$(echo "\${CREDS}" | jq -r '.SecretAccessKey')
  export AWS_SESSION_TOKEN=\$(echo "\${CREDS}" | jq -r '.SessionToken')
  EXPIRATION=\$(echo "\${CREDS}" | jq -r '.Expiration')
  
  echo "✓ Credentials refreshed"
  echo "Expires at: \${EXPIRATION}"
  
  # Verify new credentials
  echo "\\n=== Verifying New Credentials ==="
  aws sts get-caller-identity
else
  echo "✓ Credentials are valid"
fi`,
        },
        {
          language: 'bash',
          title: 'Refresh IAM Role Session (EC2/Lambda)',
          code: `#!/bin/bash
# On EC2, instance profile auto-refreshes
echo "=== Checking if on EC2 ==="
INSTANCE_ID=\$(curl -s http://169.254.169.254/latest/meta-data/instance-id 2>/dev/null)

if [ ! -z "\${INSTANCE_ID}" ]; then
  echo "Running on EC2 instance: \${INSTANCE_ID}"
  echo "Instance profile credentials auto-refresh"
  
  # Get current credentials
  echo "\\n=== Current Credentials ==="
  aws sts get-caller-identity --output table
  
  # Credentials automatically refresh via instance metadata
  echo "\\n=== Note ==="
  echo "EC2 instance profile credentials refresh automatically"
  echo "No manual refresh needed"
else
  echo "Not on EC2 - using configured credentials"
  echo "For Lambda, execution role credentials auto-refresh"
  echo "For CLI, refresh manually using assume-role"
fi`,
        },
      ],
      relatedCodes: ['InvalidToken', 'TokenRefreshRequired'],
      provider: 'aws',
    },
    'IllegalVersioningConfigurationException': {
      code: 'IllegalVersioningConfigurationException',
      name: 'Illegal Versioning Configuration',
      description: `Hitting an **IllegalVersioningConfigurationException** means your S3 bucket versioning configuration is invalid—the versioning settings might conflict, MFA delete configuration is incorrect, or versioning state transition is invalid. This client-side error (4xx) happens when AWS validates S3 versioning configuration. Most common when MFA delete configuration is incorrect, but also appears when versioning configuration parameters are invalid, conflicting versioning settings exist, versioning state conflicts occur, or invalid versioning transitions are attempted.`,
      metaDescription: 'Fix IllegalVersioningConfigurationException by reviewing versioning parameters, checking MFA delete configuration, and ensuring valid versioning state transitions with our AWS guide.',
      causes: [
        `Identity: IAM policy allows versioning but configuration invalid. Service Control Policy (SCP) restricts versioning settings.`,
        `Network: VPC endpoint versioning restrictions. API Gateway versioning configuration limits.`,
        `Limits: Invalid versioning configuration parameters. Conflicting versioning settings. MFA delete configuration error. Invalid versioning transition.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check current versioning configuration: aws s3api get-bucket-versioning --bucket BUCKET_NAME. Review versioning status (Enabled/Suspended/None). Check MFA delete status.`,
        `Step 2: Diagnose - Review versioning configuration parameters: Check if Status is valid (Enabled/Suspended). Verify MFA delete format if enabled. Check for conflicting settings.`,
        `Step 3: Diagnose - Verify MFA delete configuration: If MFA delete enabled, verify MFA device ARN format: arn:aws:iam::ACCOUNT_ID:mfa/DEVICE_NAME. Check MFA code format.`,
        `Step 4: Fix - Enable versioning correctly: aws s3api put-bucket-versioning --bucket BUCKET_NAME --versioning-configuration Status=Enabled. Or suspend: Status=Suspended.`,
        `Step 5: Fix - Configure MFA delete correctly: aws s3api put-bucket-versioning --bucket BUCKET_NAME --versioning-configuration Status=Enabled,MFADelete=Enabled --mfa "arn:aws:iam::ACCOUNT_ID:mfa/DEVICE_NAME CODE". Verify: aws s3api get-bucket-versioning --bucket BUCKET_NAME.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          code: `# Check current versioning configuration
aws s3api get-bucket-versioning --bucket my-bucket

# Enable versioning correctly
aws s3api put-bucket-versioning \\
  --bucket my-bucket \\
  --versioning-configuration Status=Enabled

# Enable versioning with MFA delete (requires MFA)
aws s3api put-bucket-versioning \\
  --bucket my-bucket \\
  --versioning-configuration Status=Enabled,MFADelete=Enabled \\
  --mfa "arn:aws:iam::123456789012:mfa/root-account-mfa-device 123456"

# Suspend versioning
aws s3api put-bucket-versioning \\
  --bucket my-bucket \\
  --versioning-configuration Status=Suspended

# Verify configuration
aws s3api get-bucket-versioning --bucket my-bucket

# Check versioning status
aws s3api list-object-versions \\
  --bucket my-bucket \\
  --prefix my-prefix/`,
          title: 'Versioning Configuration Management',
        },
      ],
      relatedCodes: ['InvalidArgument', 'BucketVersioningNotSupported'],
      provider: 'aws',
    },
    'IncompleteBody': {
      code: 'IncompleteBody',
      name: 'Incomplete Body',
      description: `Getting an **IncompleteBody** error means the Content-Length HTTP header doesn't match the actual request body size—the body is incomplete, truncated, or the header value is wrong. This client-side error (4xx) happens when AWS validates request body completeness. Most common when Content-Length header is incorrect, but also appears when request body is incomplete or truncated, network interruptions occur during upload, body size mismatches the header, or uploads terminate early.`,
      metaDescription: 'Fix IncompleteBody by verifying Content-Length matches body size exactly, ensuring complete request body is sent, and checking for network interruptions with our AWS guide.',
      causes: [
        `Identity: IAM policy allows upload but body incomplete. Service Control Policy (SCP) enforces body validation.`,
        `Network: Network interruption during upload. VPC endpoint body size restrictions. Request body truncated.`,
        `Limits: Content-Length header doesn't match actual body size. Request body incomplete or truncated. Body size mismatch with header. Upload terminated early.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check Content-Length header: Review request headers. Verify Content-Length value. Compare with actual body size. Check if header is set correctly.`,
        `Step 2: Diagnose - Verify actual body size: Calculate actual body size. Compare with Content-Length header. Check if body is complete. Verify no truncation occurred.`,
        `Step 3: Diagnose - Check for network issues: Review network logs. Check for connection drops. Verify upload completed fully. Check for timeout errors.`,
        `Step 4: Fix - Set correct Content-Length: Calculate actual body size. Set Content-Length header to match: Content-Length: ACTUAL_SIZE. Or let AWS SDK/CLI set it automatically.`,
        `Step 5: Fix - Retry with complete body: Ensure complete request body is sent. Use AWS CLI which handles Content-Length automatically: aws s3 cp FILE s3://BUCKET/KEY. Or use streaming upload for large bodies.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Verify Content-Length Matches Body Size',
          code: `#!/bin/bash
FILE_PATH="file.txt"
BUCKET_NAME="my-bucket"
OBJECT_KEY="file.txt"

# Calculate actual file size
ACTUAL_SIZE=\$(stat -f%z "\${FILE_PATH}" 2>/dev/null || stat -c%s "\${FILE_PATH}" 2>/dev/null)

echo "=== File Size Check ==="
echo "Actual file size: \${ACTUAL_SIZE} bytes"

# AWS CLI automatically sets Content-Length correctly
echo "\\n=== Uploading with AWS CLI (Auto Content-Length) ==="
aws s3 cp \${FILE_PATH} s3://\${BUCKET_NAME}/\${OBJECT_KEY}

if [ \$? -eq 0 ]; then
  echo "✓ Upload successful - Content-Length handled automatically"
else
  echo "✗ Upload failed - check error message"
  echo "If IncompleteBody error, verify file wasn't modified during upload"
fi

# Verify uploaded object size
echo "\\n=== Verifying Uploaded Object ==="
UPLOADED_SIZE=\$(aws s3api head-object \\
  --bucket \${BUCKET_NAME} \\
  --key \${OBJECT_KEY} \\
  --query 'ContentLength' \\
  --output text)

if [ "\${UPLOADED_SIZE}" = "\${ACTUAL_SIZE}" ]; then
  echo "✓ Uploaded size matches: \${UPLOADED_SIZE} bytes"
else
  echo "✗ Size mismatch: Expected \${ACTUAL_SIZE}, Got \${UPLOADED_SIZE}"
fi`,
        },
        {
          language: 'bash',
          title: 'Check for Network Interruptions During Upload',
          code: `#!/bin/bash
# Check network connectivity before upload
echo "=== Checking Network Connectivity ==="
ping -c 3 s3.amazonaws.com 2>&1 | head -5

# Upload with retry on failure
FILE_PATH="large-file.zip"
BUCKET_NAME="my-bucket"
OBJECT_KEY="large-file.zip"

echo "\\n=== Uploading with Retry Logic ==="
MAX_RETRIES=3
RETRY_COUNT=0

while [ \${RETRY_COUNT} -lt \${MAX_RETRIES} ]; do
  echo "Attempt \$(expr \${RETRY_COUNT} + 1) of \${MAX_RETRIES}"
  
  aws s3 cp \${FILE_PATH} s3://\${BUCKET_NAME}/\${OBJECT_KEY} 2>&1
  
  if [ \$? -eq 0 ]; then
    echo "✓ Upload successful"
    break
  else
    RETRY_COUNT=\$(expr \${RETRY_COUNT} + 1)
    if [ \${RETRY_COUNT} -lt \${MAX_RETRIES} ]; then
      echo "✗ Upload failed - retrying in 5 seconds..."
      sleep 5
    else
      echo "✗ Upload failed after \${MAX_RETRIES} attempts"
      echo "Check network connection and file integrity"
    fi
  fi
done`,
        },
      ],
      relatedCodes: ['RequestTimeout', 'BadDigest'],
      provider: 'aws',
    },
    'IncorrectNumberOfFilesInPostRequest': {
      code: 'IncorrectNumberOfFilesInPostRequest',
      name: 'Incorrect Number of Files in POST Request',
      description: `Hitting an **IncorrectNumberOfFilesInPostRequest** error means your POST request has zero files or more than one file—S3 presigned POST requires exactly one file per request. This client-side error (4xx) happens when AWS validates POST request file count. Most common when no file is provided, but also appears when multiple files are included in a single POST, file field is missing from form data, form data structure is incorrect, or POST request format is invalid.`,
      metaDescription: 'Fix IncorrectNumberOfFilesInPostRequest by including exactly one file in POST requests, using multipart/form-data with a single file field, and verifying form data structure with our AWS guide.',
      causes: [
        `Identity: IAM policy allows POST but file count invalid. Service Control Policy (SCP) enforces file count limits.`,
        `Network: VPC endpoint POST restrictions. API Gateway file upload limits.`,
        `Limits: No file provided in POST request. Multiple files included in single POST. File field missing from form data. Incorrect form data structure. POST request format invalid.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check file count in POST request: Review POST request body. Count number of files. Verify if zero or multiple files. Check form data structure.`,
        `Step 2: Diagnose - Verify file field in form data: Check if file field exists. Verify file field name matches presigned POST policy. Check if field contains exactly one file.`,
        `Step 3: Diagnose - Review form data structure: Verify multipart/form-data format. Check Content-Type header. Verify file field is correctly formatted.`,
        `Step 4: Fix - Include exactly one file: Ensure POST request has exactly one file. Use correct file field name from presigned POST policy. Verify file is attached to form data.`,
        `Step 5: Fix - Use correct POST format: Use multipart/form-data with single file field. Match field names from presigned POST policy. Ensure file is included in form data.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Generate S3 Presigned POST URL (Single File)',
          code: `#!/bin/bash
BUCKET_NAME="my-bucket"
OBJECT_KEY="uploaded-file.txt"
EXPIRES_IN=3600  # 1 hour

echo "=== Generating S3 Presigned POST URL ==="
echo "Bucket: \${BUCKET_NAME}"
echo "Key: \${OBJECT_KEY}"

# Generate presigned POST URL
aws s3 presign s3://\${BUCKET_NAME}/\${OBJECT_KEY} \\
  --expires-in \${EXPIRES_IN} \\
  --method POST

echo "\\n=== Note ==="
echo "S3 presigned POST requires exactly one file"
echo "Use multipart/form-data with single file field"
echo "Field name must match presigned POST policy"`,
        },
        {
          language: 'bash',
          title: 'Validate POST Request Has Exactly One File',
          code: `#!/bin/bash
# When using presigned POST, ensure exactly one file
echo "=== S3 Presigned POST Requirements ==="
echo "1. Exactly one file per POST request"
echo "2. Use multipart/form-data"
echo "3. File field name must match policy"
echo "4. All policy conditions must be met"

echo "\\n=== Common Mistakes ==="
echo "✗ Zero files in POST request"
echo "✗ Multiple files in single POST"
echo "✗ Missing file field in form data"
echo "✗ Incorrect form data structure"

echo "\\n=== Correct Format ==="
echo "✓ Single file in POST request"
echo "✓ multipart/form-data Content-Type"
echo "✓ File field matches presigned POST policy"
echo "✓ All required fields from policy included"`,
        },
      ],
      relatedCodes: ['InvalidRequest', 'MissingRequestBodyError'],
      provider: 'aws',
    },
    'InlineDataTooLarge': {
      code: 'InlineDataTooLarge',
      name: 'Inline Data Too Large',
      description: `Getting an **InlineDataTooLarge** error means you're trying to embed file data directly in the request body, but it exceeds the inline data size limit—for large files, you should use multipart upload or presigned URLs instead of inline embedding. This client-side error (4xx) happens when AWS validates inline data size. Most common when large files are embedded in request bodies, but also appears when inline data exceeds size limits, request body is too large for inline upload, or large files are included directly in requests.`,
      metaDescription: 'Fix InlineDataTooLarge by using multipart upload for large files, using presigned URLs for direct S3 uploads, or splitting files into chunks with our AWS guide.',
      causes: [
        `Identity: IAM policy allows upload but inline size exceeded. Service Control Policy (SCP) enforces inline size limits.`,
        `Network: VPC endpoint inline size restrictions. API Gateway payload size limits. Request body too large.`,
        `Limits: Inline data exceeds size limit. Request body too large for inline upload. File embedded directly in request. Large file included in request body.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check inline data size: Review request body size. Compare with inline size limits. Check if file is embedded in request. Verify data size.`,
        `Step 2: Diagnose - Verify upload method: Check if using inline embedding vs multipart. Review if presigned URL should be used. Check upload code/configuration.`,
        `Step 3: Diagnose - Review size limits: S3 inline data has size limits. Check if file exceeds limit. Verify if multipart should be used instead.`,
        `Step 4: Fix - Use multipart upload: For large files, use multipart upload: aws s3 cp FILE s3://BUCKET/KEY (automatically uses multipart). Or use s3api create-multipart-upload for manual control.`,
        `Step 5: Fix - Use presigned URLs: Generate presigned URL: aws s3 presign s3://BUCKET/KEY --expires-in 3600. Upload directly to S3 using presigned URL. Or split large files into smaller chunks.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Use Multipart Upload Instead of Inline',
          code: `#!/bin/bash
FILE_PATH="large-file.zip"
BUCKET_NAME="my-bucket"
OBJECT_KEY="large-file.zip"

echo "=== Avoid Inline Data for Large Files ==="
echo "For large files, use multipart upload or presigned URLs"
echo "Do NOT embed file data directly in request body"

# AWS CLI automatically uses multipart for large files
echo "\\n=== Using AWS CLI (Automatic Multipart) ==="
aws s3 cp \${FILE_PATH} s3://\${BUCKET_NAME}/\${OBJECT_KEY}

echo "\\n=== Alternative: Generate Presigned URL ==="
PRESIGNED_URL=\$(aws s3 presign s3://\${BUCKET_NAME}/\${OBJECT_KEY} --expires-in 3600)
echo "Presigned URL: \${PRESIGNED_URL}"
echo "Upload directly to S3 using this URL (avoids inline data)"`,
        },
        {
          language: 'bash',
          title: 'Generate Presigned URL for Direct S3 Upload',
          code: `#!/bin/bash
BUCKET_NAME="my-bucket"
OBJECT_KEY="uploaded-file.zip"
EXPIRES_IN=3600  # 1 hour

echo "=== Generating Presigned URL ==="
echo "This allows direct upload to S3 without inline data"

# Generate presigned PUT URL
PRESIGNED_URL=\$(aws s3 presign s3://\${BUCKET_NAME}/\${OBJECT_KEY} \\
  --expires-in \${EXPIRES_IN} \\
  --method PUT)

echo "Presigned URL: \${PRESIGNED_URL}"
echo "\\n=== Upload Using Presigned URL ==="
echo "curl -X PUT -T file.zip '\${PRESIGNED_URL}'"
echo ""
echo "This avoids InlineDataTooLarge by uploading directly to S3"
echo "No inline data in your application request"`,
        },
      ],
      relatedCodes: ['EntityTooLarge', 'RequestEntityTooLarge'],
      provider: 'aws',
    },
    'InternalError': {
      code: 'InternalError',
      name: 'Internal Error',
      description: `Getting an **InternalError** means AWS encountered an internal service error—this is a server-side issue (5xx) that's usually temporary and resolves with retries. This server-side error happens when AWS services experience internal failures. Most common during temporary service issues, but also appears when backend processing errors occur, services are temporarily unavailable, internal system failures happen, or AWS infrastructure experiences problems.`,
      metaDescription: 'Resolve InternalError by implementing exponential backoff retries, checking AWS Service Health Dashboard, and contacting AWS Support if errors persist with our AWS guide.',
      causes: [
        `Identity: IAM service internal error. Service Control Policy (SCP) service failure. Account-level service issues.`,
        `Network: VPC endpoint service internal error. Regional service failures. Cross-region service issues.`,
        `Limits: AWS service internal error. Temporary service issue. Backend processing error. Service temporarily unavailable. Internal system failure.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check AWS Service Health Dashboard: Visit https://status.aws.amazon.com/. Check specific service status. Review recent incidents. Check if issue is known.`,
        `Step 2: Diagnose - Verify error is InternalError: Check error code is InternalError (5xx). Verify it's not a client error (4xx). Check if error is consistent or intermittent.`,
        `Step 3: Diagnose - Check CloudWatch service metrics: aws cloudwatch get-metric-statistics --namespace AWS/SERVICE --metric-name ServiceErrors --start-time TIME --end-time TIME --period 300 --statistics Sum. Monitor service errors.`,
        `Step 4: Fix - Implement exponential backoff: Retry with delays: 1s, 2s, 4s, 8s, 16s. Use AWS SDK automatic retries. Add jitter to prevent thundering herd. Max retries: 5-10 attempts.`,
        `Step 5: Fix - Wait and retry or contact support: If temporary, wait a few minutes and retry. If persistent, contact AWS Support: aws support create-case --subject "InternalError" --service-code SERVICE_CODE --severity-code normal.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Retry with Exponential Backoff for InternalError',
          code: `#!/bin/bash
# Function to retry AWS CLI commands with exponential backoff
retry_with_backoff() {
  local max_retries=5
  local attempt=0
  local delay=1
  
  while [ \$attempt -lt \${max_retries} ]; do
    if "\$@"; then
      return 0
    fi
    
    local exit_code=\$?
    # Check if error is InternalError (5xx) or similar
    if [ \$exit_code -ne 0 ]; then
      attempt=\$((attempt + 1))
      if [ \$attempt -lt \${max_retries} ]; then
        # Exponential backoff with jitter: 1s, 2s, 4s, 8s, 16s
        delay=\$((2 ** attempt + RANDOM % 1000 / 1000))
        echo "Internal error, retrying in \${delay}s (attempt \${attempt}/\${max_retries})..."
        sleep \${delay}
        continue
      fi
    fi
    return \$exit_code
  done
  
  return 1
}

# Example usage
echo "=== Retrying DynamoDB GetItem ==="
retry_with_backoff aws dynamodb get-item \\
  --table-name MyTable \\
  --key '{"id":{"S":"123"}}' \\
  --output json`,
        },
        {
          language: 'bash',
          title: 'Check AWS Service Health Dashboard',
          code: `#!/bin/bash
echo "=== AWS Service Health Dashboard ==="
echo "Visit: https://status.aws.amazon.com/"
echo "Or check programmatically via AWS Support API"

# Check CloudWatch for service errors
SERVICE="dynamodb"  # Replace with your service
REGION="us-east-1"
echo "\\n=== Checking \${SERVICE} Service Errors ==="
aws cloudwatch get-metric-statistics \\
  --namespace AWS/\${SERVICE} \\
  --metric-name ServiceErrors \\
  --dimensions Name=ServiceName,Value=\${SERVICE} \\
  --start-time \$(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \\
  --end-time \$(date -u +%Y-%m-%dT%H:%M:%S) \\
  --period 300 \\
  --statistics Sum \\
  --region \${REGION} \\
  --output table 2>&1 | head -10`,
        },
        {
          language: 'bash',
          title: 'Create AWS Support Case for Persistent InternalError',
          code: `#!/bin/bash
# Create support case if InternalError persists
echo "=== Creating AWS Support Case ==="
echo "Subject: InternalError - Service experiencing internal errors"
echo "Service: DynamoDB"  # Replace with your service
echo "Severity: Normal"

SERVICE_CODE="amazon-dynamodb"  # Replace with your service code

aws support create-case \\
  --subject "InternalError - Service experiencing internal errors" \\
  --service-code \${SERVICE_CODE} \\
  --severity-code normal \\
  --category-code service-limit-increase \\
  --communication-body "Experiencing persistent InternalError (5xx) from service. Have retried with exponential backoff. Please investigate." \\
  --output json 2>&1 | head -10 || echo "Support API access may be limited - use AWS Console instead"

echo "\\n=== Alternative: Use AWS Console ==="
echo "1. Go to AWS Support Center"
echo "2. Create case > Technical support"
echo "3. Select service and describe InternalError issue"`,
        },
      ],
      relatedCodes: ['ServiceUnavailable', 'Throttling'],
      provider: 'aws',
    },
    'InvalidAddressingHeader': {
      code: 'InvalidAddressingHeader',
      name: 'Invalid Addressing Header',
      description: `Getting an **InvalidAddressingHeader** error means the HTTP addressing headers in your AWS API request are invalid or malformed—headers like Host, X-Amz-Date, or X-Amz-Target don't match AWS requirements. This client-side error (4xx) happens when AWS validates request headers. Most common when making direct HTTP requests to AWS APIs, but also appears when addressing header format is invalid, required headers are missing, header values are incorrect or malformed, or headers don't match service requirements.`,
      metaDescription: 'Fix InvalidAddressingHeader by verifying header formats match AWS specs, checking required headers are present, and using AWS SDK/CLI which handles headers automatically with our AWS guide.',
      causes: [
        `Identity: IAM policy allows request but header invalid. Service Control Policy (SCP) enforces header validation.`,
        `Network: VPC endpoint header restrictions. API Gateway header validation. Invalid header format.`,
        `Limits: Invalid addressing header format. Missing required addressing header (Host, X-Amz-Date, X-Amz-Target). Header value incorrect or malformed. Header structure invalid.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check request headers: Review HTTP request headers. Verify Host header format: SERVICE.REGION.amazonaws.com. Check X-Amz-Date format (ISO8601). Verify X-Amz-Target format.`,
        `Step 2: Diagnose - Verify required headers are present: Check Host header exists. Verify X-Amz-Date header exists. Check X-Amz-Target header (for JSON APIs). Verify Content-Type header.`,
        `Step 3: Diagnose - Validate header values: Check Host matches service endpoint. Verify X-Amz-Date is valid ISO8601. Check X-Amz-Target matches service operation.`,
        `Step 4: Fix - Use AWS SDK or CLI: AWS SDK automatically sets correct headers. AWS CLI handles headers automatically. Avoid manual HTTP requests if possible.`,
        `Step 5: Fix - Fix header format manually: Set Host: SERVICE.REGION.amazonaws.com. Set X-Amz-Date: ISO8601 timestamp. Set X-Amz-Target: SERVICE.Operation. Verify header syntax matches AWS requirements.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Use AWS CLI (Handles Headers Automatically)',
          code: `#!/bin/bash
# AWS CLI automatically sets correct addressing headers
echo "=== Using AWS CLI (Recommended) ==="
echo "AWS CLI handles all addressing headers automatically"
echo "No manual header configuration needed"

# Example: S3 operation
aws s3 ls

# Example: DynamoDB operation
aws dynamodb list-tables

# Example: Lambda operation
aws lambda list-functions

echo "\\n=== Note ==="
echo "If you must make direct HTTP requests, ensure headers:"
echo "- Host: SERVICE.REGION.amazonaws.com"
echo "- X-Amz-Date: ISO8601 timestamp"
echo "- X-Amz-Target: SERVICE.Operation (for JSON APIs)"
echo "- Content-Type: application/x-amz-json-1.0 (for JSON APIs)"
echo "- Authorization: AWS4-HMAC-SHA256 signature"`,
        },
        {
          language: 'bash',
          title: 'Verify AWS CLI Configuration',
          code: `#!/bin/bash
# Check AWS CLI configuration
echo "=== AWS CLI Configuration ==="
aws configure list

# Check region
echo "\\n=== Current Region ==="
aws configure get region

# Test request (CLI handles headers)
echo "\\n=== Testing Request (Headers Auto-Configured) ==="
aws sts get-caller-identity

if [ \$? -eq 0 ]; then
  echo "✓ Request successful - headers configured correctly"
else
  echo "✗ Request failed - check credentials and configuration"
  echo "AWS CLI should handle headers automatically"
fi`,
        },
        {
          language: 'bash',
          title: 'Check Service Endpoints',
          code: `#!/bin/bash
# Verify service endpoints (for manual HTTP requests)
SERVICE="dynamodb"
REGION="us-east-1"

echo "=== Service Endpoint Format ==="
ENDPOINT="\${SERVICE}.\${REGION}.amazonaws.com"
echo "Host header should be: \${ENDPOINT}"

# Check if endpoint is reachable
echo "\\n=== Testing Endpoint ==="
ping -c 1 \${ENDPOINT} 2>&1 | head -2

echo "\\n=== For Manual HTTP Requests ==="
echo "Required headers:"
echo "Host: \${ENDPOINT}"
echo "X-Amz-Date: \$(date -u +%Y%m%dT%H%M%SZ)"
echo "X-Amz-Target: DynamoDB_20120810.ListTables"
echo "Content-Type: application/x-amz-json-1.0"
echo ""
echo "Better: Use AWS CLI or SDK which handles this automatically"`,
        },
      ],
      relatedCodes: ['InvalidParameter', 'MalformedQueryString'],
      provider: 'aws',
    },
    'InvalidArgument': {
      code: 'InvalidArgument',
      name: 'Invalid Argument',
      description: `Hitting an **InvalidArgument** error means one or more parameters in your AWS API request have invalid values, types, or formats—the argument might be out of range, wrong type, or unsupported. This client-side error (4xx) happens when AWS validates request parameters. Most common when parameter values are invalid, but also appears when parameter types don't match requirements, arguments are out of valid range, parameter formats are incorrect, or unsupported argument values are used.`,
      metaDescription: 'Fix InvalidArgument by verifying parameter values, checking parameter types match requirements, reviewing valid ranges, and validating argument formats with our AWS guide.',
      causes: [
        `Identity: IAM policy allows request but argument invalid. Service Control Policy (SCP) enforces argument validation.`,
        `Network: VPC endpoint argument restrictions. API Gateway parameter validation.`,
        `Limits: Invalid parameter value. Parameter type mismatch. Argument out of valid range. Invalid parameter format. Unsupported argument value.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check exact error message: AWS usually specifies which argument is invalid. Review error message for parameter name. Check parameter value.`,
        `Step 2: Diagnose - Verify parameter types: Check if parameter type matches requirement (string, number, boolean). Verify array/object structure if applicable. Check enum values if restricted.`,
        `Step 3: Diagnose - Review valid ranges: Check parameter value is within valid range. Verify minimum/maximum values. Check if value is in allowed list.`,
        `Step 4: Fix - Use AWS CLI help: aws SERVICE OPERATION help. Review parameter requirements. Check valid values. Verify parameter format.`,
        `Step 5: Fix - Correct invalid arguments: Update parameter value to valid range. Fix parameter type if wrong. Use correct format. Replace unsupported values with supported ones.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Use AWS CLI Help to Check Valid Arguments',
          code: `#!/bin/bash
# Get help for EC2 run-instances to see valid arguments
echo "=== EC2 Run Instances Help ==="
aws ec2 run-instances help | grep -A 30 "SYNOPSIS"

# Check specific parameter requirements
echo "\\n=== Parameter Requirements ==="
aws ec2 run-instances help | grep -i "image-id\|instance-type\|count" | head -10

# Example: Validate arguments before running
AMI_ID="ami-xxxxx"  # Replace with valid AMI
INSTANCE_TYPE="t2.micro"

echo "\\n=== Validating Arguments ==="
# Check AMI ID format
if [[ ! "\${AMI_ID}" =~ ^ami-[0-9a-f]{8,17}\$ ]]; then
  echo "✗ Invalid AMI ID format: \${AMI_ID}"
  echo "Must be: ami-xxxxxxxx"
  exit 1
fi

# Check instance type
VALID_TYPES=("t2.micro" "t2.small" "t3.micro" "m5.large" "c5.xlarge")
if [[ ! " \${VALID_TYPES[@]} " =~ " \${INSTANCE_TYPE} " ]]; then
  echo "✗ Invalid instance type: \${INSTANCE_TYPE}"
  echo "Valid types: \${VALID_TYPES[*]}"
  exit 1
fi

echo "✓ Arguments validated"
echo "\\n=== Running with Valid Arguments ==="
aws ec2 run-instances \\
  --image-id \${AMI_ID} \\
  --instance-type \${INSTANCE_TYPE} \\
  --count 1 \\
  --dry-run 2>&1 | head -5`,
        },
        {
          language: 'bash',
          title: 'Check Parameter Ranges and Types',
          code: `#!/bin/bash
# Example: Validate EC2 parameters
MIN_COUNT=1
MAX_COUNT=1

echo "=== Validating Parameter Ranges ==="

# Check MinCount range (1-20)
if [ \${MIN_COUNT} -lt 1 ] || [ \${MIN_COUNT} -gt 20 ]; then
  echo "✗ Invalid MinCount: \${MIN_COUNT} (must be 1-20)"
  exit 1
fi

# Check MaxCount range (1-20)
if [ \${MAX_COUNT} -lt 1 ] || [ \${MAX_COUNT} -gt 20 ]; then
  echo "✗ Invalid MaxCount: \${MAX_COUNT} (must be 1-20)"
  exit 1
fi

# Check MinCount <= MaxCount
if [ \${MIN_COUNT} -gt \${MAX_COUNT} ]; then
  echo "✗ MinCount (\${MIN_COUNT}) cannot be greater than MaxCount (\${MAX_COUNT})"
  exit 1
fi

echo "✓ Parameter ranges valid"
echo "MinCount: \${MIN_COUNT}, MaxCount: \${MAX_COUNT}"`,
        },
      ],
      relatedCodes: ['InvalidParameter', 'InvalidParameterValue'],
      provider: 'aws',
    },
    'S3InvalidObjectState': {
      code: 'S3InvalidObjectState',
      name: 'S3 Invalid Object State',
      description: `Hitting an **S3InvalidObjectState** error means you're trying to access an S3 object that's archived in Glacier or Deep Archive storage class without restoring it first—archived objects must be restored before they can be accessed. This client-side error (4xx) happens when AWS validates object accessibility. Most common when accessing Glacier objects without restore, but also appears when objects are in Deep Archive, restoration hasn't completed, objects are archived and not restored, or accessing archived objects directly.`,
      metaDescription: 'Fix S3InvalidObjectState by restoring objects from Glacier/Deep Archive, waiting for restoration to complete, or using appropriate storage classes with our AWS guide.',
      causes: [
        `Identity: IAM policy allows access but object archived. Service Control Policy (SCP) enforces storage class restrictions.`,
        `Network: VPC endpoint storage class restrictions. Object in archived state.`,
        `Limits: Object in Glacier storage class. Object in Deep Archive storage class. Object restoration not completed. Object archived and not restored.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check object storage class: aws s3api head-object --bucket BUCKET_NAME --key OBJECT_KEY --query 'StorageClass' --output text. Verify if object is in Glacier or Deep Archive.`,
        `Step 2: Diagnose - Check restoration status: aws s3api head-object --bucket BUCKET_NAME --key OBJECT_KEY --query 'Restore' --output text. Check if restoration is in progress or completed.`,
        `Step 3: Diagnose - Review object metadata: aws s3api head-object --bucket BUCKET_NAME --key OBJECT_KEY. Check StorageClass, Restore status, and ArchiveStatus.`,
        `Step 4: Fix - Initiate restore request: For Glacier: aws s3api restore-object --bucket BUCKET_NAME --key OBJECT_KEY --restore-request '{"Days":7,"GlacierJobParameters":{"Tier":"Expedited"}}'. For Deep Archive, use appropriate tier.`,
        `Step 5: Fix - Wait for restoration: Check restoration status periodically. Expedited: 1-5 minutes. Standard: 3-5 hours. Bulk: 5-12 hours. Once restored, object is accessible for specified days.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check Object Storage Class and Restoration Status',
          code: `#!/bin/bash
BUCKET_NAME="my-bucket"
OBJECT_KEY="archived-file.zip"

echo "=== Checking Object Storage Class ==="
STORAGE_CLASS=\$(aws s3api head-object \\
  --bucket \${BUCKET_NAME} \\
  --key \${OBJECT_KEY} \\
  --query 'StorageClass' \\
  --output text 2>/dev/null)

if [ "\${STORAGE_CLASS}" = "GLACIER" ] || [ "\${STORAGE_CLASS}" = "DEEP_ARCHIVE" ]; then
  echo "✗ Object is archived: \${STORAGE_CLASS}"
  echo "Object must be restored before access"
else
  echo "✓ Object storage class: \${STORAGE_CLASS}"
  echo "Object is accessible"
fi

echo "\\n=== Checking Restoration Status ==="
RESTORE_STATUS=\$(aws s3api head-object \\
  --bucket \${BUCKET_NAME} \\
  --key \${OBJECT_KEY} \\
  --query 'Restore' \\
  --output text 2>/dev/null)

if [ "\${RESTORE_STATUS}" = "None" ] || [ -z "\${RESTORE_STATUS}" ]; then
  echo "✗ Object not restored"
  echo "Initiate restore request"
elif [[ "\${RESTORE_STATUS}" == *"ongoing-request"* ]]; then
  echo "⏳ Restoration in progress"
elif [[ "\${RESTORE_STATUS}" == *"expiry-date"* ]]; then
  echo "✓ Object restored and accessible"
  echo "Restore status: \${RESTORE_STATUS}"
fi`,
        },
        {
          language: 'bash',
          title: 'Initiate S3 Object Restoration from Glacier',
          code: `#!/bin/bash
BUCKET_NAME="my-bucket"
OBJECT_KEY="archived-file.zip"

echo "=== Initiating Glacier Restoration ==="

# Expedited restoration (1-5 minutes, most expensive)
echo "Option 1: Expedited (1-5 minutes)"
aws s3api restore-object \\
  --bucket \${BUCKET_NAME} \\
  --key \${OBJECT_KEY} \\
  --restore-request '{"Days":7,"GlacierJobParameters":{"Tier":"Expedited"}}' 2>&1

# Standard restoration (3-5 hours)
echo "\\nOption 2: Standard (3-5 hours)"
# aws s3api restore-object \\
#   --bucket \${BUCKET_NAME} \\
#   --key \${OBJECT_KEY} \\
#   --restore-request '{"Days":7,"GlacierJobParameters":{"Tier":"Standard"}}'

# Bulk restoration (5-12 hours, cheapest)
echo "\\nOption 3: Bulk (5-12 hours)"
# aws s3api restore-object \\
#   --bucket \${BUCKET_NAME} \\
#   --key \${OBJECT_KEY} \\
#   --restore-request '{"Days":7,"GlacierJobParameters":{"Tier":"Bulk"}}'

echo "\\n=== Checking Restoration Status ==="
sleep 10  # Wait a moment
aws s3api head-object \\
  --bucket \${BUCKET_NAME} \\
  --key \${OBJECT_KEY} \\
  --query 'Restore' \\
  --output text`,
        },
        {
          language: 'bash',
          title: 'Restore Deep Archive Objects',
          code: `#!/bin/bash
BUCKET_NAME="my-bucket"
OBJECT_KEY="deep-archive-file.zip"

echo "=== Restoring Deep Archive Object ==="

# Deep Archive restoration (12 hours)
aws s3api restore-object \\
  --bucket \${BUCKET_NAME} \\
  --key \${OBJECT_KEY} \\
  --restore-request '{"Days":7,"GlacierJobParameters":{"Tier":"Standard"}}'

echo "\\n=== Deep Archive Restoration Times ==="
echo "Standard: 12 hours"
echo "Bulk: 48 hours"
echo "Expedited: Not available for Deep Archive"

echo "\\n=== Monitor Restoration ==="
echo "Check status with:"
echo "aws s3api head-object --bucket \${BUCKET_NAME} --key \${OBJECT_KEY} --query 'Restore'"

echo "\\n=== Once Restored ==="
echo "Object will be accessible for the specified number of days"
echo "After expiry, object returns to archived state"`,
        },
      ],
      relatedCodes: ['NoSuchKey', 'InvalidObjectState'],
      provider: 'aws',
    },
    'LambdaInvalidParameterValueException': {
      code: 'LambdaInvalidParameterValueException',
      name: 'Lambda Invalid Parameter Value',
      description: `Getting a **LambdaInvalidParameterValueException** means one or more Lambda function parameters have invalid values—function name format, runtime, memory size, timeout, or environment variables don't meet Lambda requirements. This client-side error (4xx) happens when AWS validates Lambda parameters. Most common when memory size is invalid, but also appears when function name format is wrong, runtime specification is invalid, timeout is out of range, or environment variable format is incorrect.`,
      metaDescription: 'Fix LambdaInvalidParameterValueException by verifying function names, checking runtime support, ensuring memory (128-10240 MB) and timeout (1-900s) are valid, and validating environment variables with our AWS guide.',
      causes: [
        `Identity: IAM policy allows Lambda creation but parameter invalid. Service Control Policy (SCP) enforces parameter restrictions.`,
        `Network: VPC endpoint Lambda parameter restrictions. API Gateway Lambda integration limits.`,
        `Limits: Invalid function name format. Invalid runtime specification. Invalid memory size value (must be 128-10240 MB, multiple of 64). Invalid timeout value (must be 1-900 seconds). Invalid environment variable format.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check exact error message: AWS usually specifies which parameter is invalid. Review error message for parameter name. Check parameter value.`,
        `Step 2: Diagnose - Verify function name format: Function name must be 1-64 characters. Alphanumeric, hyphens, underscores allowed. Cannot start with number. Check naming conventions.`,
        `Step 3: Diagnose - Validate memory and timeout: Check memory size is 128-10240 MB and multiple of 64. Verify timeout is 1-900 seconds. Check runtime is supported.`,
        `Step 4: Fix - Use valid parameter values: Set memory to valid value: aws lambda update-function-configuration --function-name FUNCTION_NAME --memory-size 512. Set timeout: --timeout 30. Verify runtime: --runtime python3.11.`,
        `Step 5: Fix - Validate environment variables: Check environment variable names (no spaces, valid characters). Verify values are valid JSON if using JSON format. Check variable count limits (4KB total).`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Validate Lambda Function Parameters',
          code: `#!/bin/bash
FUNCTION_NAME="my-function"
RUNTIME="python3.11"
MEMORY_SIZE=512
TIMEOUT=30

echo "=== Validating Lambda Parameters ==="

# Validate function name (1-64 characters, alphanumeric, hyphens, underscores)
if [ \${#FUNCTION_NAME} -lt 1 ] || [ \${#FUNCTION_NAME} -gt 64 ]; then
  echo "✗ Invalid function name length: \${#FUNCTION_NAME} (must be 1-64)"
  exit 1
fi

if [[ ! "\${FUNCTION_NAME}" =~ ^[a-zA-Z0-9_-]+\$ ]]; then
  echo "✗ Invalid function name format: \${FUNCTION_NAME}"
  echo "Must be alphanumeric, hyphens, underscores only"
  exit 1
fi

# Validate memory size (128-10240 MB, multiple of 64)
if [ \${MEMORY_SIZE} -lt 128 ] || [ \${MEMORY_SIZE} -gt 10240 ]; then
  echo "✗ Invalid memory size: \${MEMORY_SIZE} (must be 128-10240 MB)"
  exit 1
fi

if [ \$((\${MEMORY_SIZE} % 64)) -ne 0 ]; then
  echo "✗ Invalid memory size: \${MEMORY_SIZE} (must be multiple of 64)"
  exit 1
fi

# Validate timeout (1-900 seconds)
if [ \${TIMEOUT} -lt 1 ] || [ \${TIMEOUT} -gt 900 ]; then
  echo "✗ Invalid timeout: \${TIMEOUT} (must be 1-900 seconds)"
  exit 1
fi

# Check runtime is supported
SUPPORTED_RUNTIMES=("python3.11" "python3.12" "nodejs20.x" "java21" "go1.x")
if [[ ! " \${SUPPORTED_RUNTIMES[@]} " =~ " \${RUNTIME} " ]]; then
  echo "⚠ Runtime \${RUNTIME} may not be supported"
  echo "Check: aws lambda list-runtimes"
fi

echo "✓ All parameters valid"
echo "Function name: \${FUNCTION_NAME}"
echo "Runtime: \${RUNTIME}"
echo "Memory: \${MEMORY_SIZE} MB"
echo "Timeout: \${TIMEOUT} seconds"`,
        },
        {
          language: 'bash',
          title: 'Update Lambda Function with Valid Parameters',
          code: `#!/bin/bash
FUNCTION_NAME="my-function"

echo "=== Updating Lambda Function Configuration ==="

# Update memory size (must be multiple of 64)
MEMORY_SIZE=512
if [ \$((\${MEMORY_SIZE} % 64)) -ne 0 ]; then
  echo "✗ Memory size must be multiple of 64"
  MEMORY_SIZE=512  # Round to nearest multiple
fi

aws lambda update-function-configuration \\
  --function-name \${FUNCTION_NAME} \\
  --memory-size \${MEMORY_SIZE} 2>&1

# Update timeout (1-900 seconds)
TIMEOUT=30
if [ \${TIMEOUT} -lt 1 ] || [ \${TIMEOUT} -gt 900 ]; then
  echo "✗ Timeout must be 1-900 seconds"
  exit 1
fi

aws lambda update-function-configuration \\
  --function-name \${FUNCTION_NAME} \\
  --timeout \${TIMEOUT} 2>&1

# Verify configuration
echo "\\n=== Current Configuration ==="
aws lambda get-function-configuration \\
  --function-name \${FUNCTION_NAME} \\
  --query '[FunctionName,MemorySize,Timeout,Runtime]' \\
  --output table`,
        },
        {
          language: 'bash',
          title: 'List Supported Lambda Runtimes',
          code: `#!/bin/bash
echo "=== Supported Lambda Runtimes ==="
echo "Check current supported runtimes:"
echo "aws lambda list-runtimes"

# Common runtimes
echo "\\n=== Common Lambda Runtimes ==="
echo "Python: python3.11, python3.12"
echo "Node.js: nodejs20.x, nodejs18.x"
echo "Java: java21, java17"
echo "Go: go1.x"
echo ".NET: dotnet8, dotnet6"
echo "Ruby: ruby3.3"

# Validate runtime before use
RUNTIME="python3.11"
echo "\\n=== Validating Runtime: \${RUNTIME} ==="
echo "Use: aws lambda create-function --runtime \${RUNTIME} ..."`,
        },
      ],
      relatedCodes: ['InvalidParameterValue', 'ResourceNotFoundException'],
      provider: 'aws',
    },
    'DynamoDBProvisionedThroughputExceededException': {
      code: 'DynamoDBProvisionedThroughputExceededException',
      name: 'DynamoDB Provisioned Throughput Exceeded',
      description: `Getting a **DynamoDBProvisionedThroughputExceededException** means your DynamoDB table's provisioned throughput capacity is exceeded—your request rate is higher than the read or write capacity units allocated to the table. This client-side error (4xx) happens when AWS throttles requests due to capacity limits. Most common when read/write capacity is exceeded, but also appears when hot partitions cause throttling, provisioned capacity is insufficient, sudden traffic spikes occur, or load isn't distributed across partition keys.`,
      metaDescription: 'Fix DynamoDBProvisionedThroughputExceededException by increasing provisioned capacity, enabling auto-scaling, implementing exponential backoff, or switching to on-demand billing with our AWS guide.',
      causes: [
        `Identity: IAM policy allows DynamoDB access but capacity exceeded. Service Control Policy (SCP) enforces capacity limits.`,
        `Network: VPC endpoint DynamoDB throttling. Regional capacity constraints.`,
        `Limits: Read capacity units exceeded. Write capacity units exceeded. Hot partition causing throttling. Insufficient provisioned capacity. Sudden traffic spike.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check current table capacity: aws dynamodb describe-table --table-name TABLE_NAME --query 'Table.ProvisionedThroughput' --output table. Review ReadCapacityUnits and WriteCapacityUnits. Compare with current usage.`,
        `Step 2: Diagnose - Check CloudWatch metrics: aws cloudwatch get-metric-statistics --namespace AWS/DynamoDB --metric-name ConsumedReadCapacityUnits --dimensions Name=TableName,Value=TABLE_NAME --start-time TIME --end-time TIME --period 300 --statistics Sum. Monitor consumed capacity.`,
        `Step 3: Diagnose - Identify hot partitions: Review partition key distribution. Check if single partition key receives most traffic. Verify if load is evenly distributed.`,
        `Step 4: Fix - Increase provisioned capacity: aws dynamodb update-table --table-name TABLE_NAME --provisioned-throughput ReadCapacityUnits=100,WriteCapacityUnits=100. Or enable auto-scaling: aws application-autoscaling register-scalable-target.`,
        `Step 5: Fix - Switch to on-demand billing: For variable workloads: aws dynamodb update-table --table-name TABLE_NAME --billing-mode PAY_PER_REQUEST. Or implement exponential backoff retry logic. Distribute load across partition keys.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check DynamoDB Table Capacity and Usage',
          code: `#!/bin/bash
TABLE_NAME="my-table"

echo "=== Current Table Capacity ==="
aws dynamodb describe-table --table-name \${TABLE_NAME} \\
  --query 'Table.[ProvisionedThroughput.ReadCapacityUnits,ProvisionedThroughput.WriteCapacityUnits,BillingModeSummary.BillingMode]' \\
  --output table

# Check consumed capacity (if provisioned)
echo "\\n=== Checking Consumed Capacity ==="
START_TIME=\$(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S)
END_TIME=\$(date -u +%Y-%m-%dT%H:%M:%S)

aws cloudwatch get-metric-statistics \\
  --namespace AWS/DynamoDB \\
  --metric-name ConsumedReadCapacityUnits \\
  --dimensions Name=TableName,Value=\${TABLE_NAME} \\
  --start-time \${START_TIME} \\
  --end-time \${END_TIME} \\
  --period 300 \\
  --statistics Sum \\
  --output table 2>&1 | head -10

aws cloudwatch get-metric-statistics \\
  --namespace AWS/DynamoDB \\
  --metric-name ConsumedWriteCapacityUnits \\
  --dimensions Name=TableName,Value=\${TABLE_NAME} \\
  --start-time \${START_TIME} \\
  --end-time \${END_TIME} \\
  --period 300 \\
  --statistics Sum \\
  --output table 2>&1 | head -10`,
        },
        {
          language: 'bash',
          title: 'Increase DynamoDB Provisioned Capacity',
          code: `#!/bin/bash
TABLE_NAME="my-table"
NEW_READ_CAPACITY=100
NEW_WRITE_CAPACITY=100

echo "=== Updating Provisioned Capacity ==="
echo "Table: \${TABLE_NAME}"
echo "New Read Capacity: \${NEW_READ_CAPACITY}"
echo "New Write Capacity: \${NEW_WRITE_CAPACITY}"

aws dynamodb update-table \\
  --table-name \${TABLE_NAME} \\
  --provisioned-throughput ReadCapacityUnits=\${NEW_READ_CAPACITY},WriteCapacityUnits=\${NEW_WRITE_CAPACITY} \\
  --query 'TableDescription.[TableName,ProvisionedThroughput]' \\
  --output table

echo "\\n=== Waiting for Update to Complete ==="
aws dynamodb wait table-exists --table-name \${TABLE_NAME}

echo "\\n=== Verifying New Capacity ==="
aws dynamodb describe-table --table-name \${TABLE_NAME} \\
  --query 'Table.ProvisionedThroughput' \\
  --output table`,
        },
        {
          language: 'bash',
          title: 'Switch DynamoDB to On-Demand Billing Mode',
          code: `#!/bin/bash
TABLE_NAME="my-table"

echo "=== Switching to On-Demand Billing Mode ==="
echo "On-demand mode automatically scales capacity"
echo "No need to provision read/write capacity units"

aws dynamodb update-table \\
  --table-name \${TABLE_NAME} \\
  --billing-mode PAY_PER_REQUEST \\
  --query 'TableDescription.[TableName,BillingModeSummary]' \\
  --output table

echo "\\n=== Waiting for Update to Complete ==="
aws dynamodb wait table-exists --table-name \${TABLE_NAME}

echo "\\n=== Verifying Billing Mode ==="
aws dynamodb describe-table --table-name \${TABLE_NAME} \\
  --query 'Table.BillingModeSummary.BillingMode' \\
  --output text

echo "\\n=== Note ==="
echo "On-demand mode:"
echo "- Automatically scales to handle traffic"
echo "- Pay only for what you use"
echo "- No capacity planning needed"
echo "- Best for unpredictable workloads"`,
        },
      ],
      relatedCodes: ['Throttling', 'ServiceUnavailable'],
      provider: 'aws',
    },
    'S3BucketAlreadyOwnedByYou': {
      code: 'S3BucketAlreadyOwnedByYou',
      name: 'S3 Bucket Already Owned By You',
      description: `Hitting an **S3BucketAlreadyOwnedByYou** error means the S3 bucket name you're trying to create already exists in your AWS account—S3 bucket names must be globally unique across all AWS accounts, so if you own a bucket with that name, you can't create another. This client-side error (4xx) happens when AWS validates bucket name uniqueness. Most common when bucket name already exists in your account, but also appears when attempting to create a duplicate bucket, bucket name collision occurs, previous bucket creation succeeded, or bucket exists in a different region.`,
      metaDescription: 'Fix S3BucketAlreadyOwnedByYou by using a different bucket name, checking if bucket exists before creating, or deleting the existing bucket if no longer needed with our AWS guide.',
      causes: [
        `Identity: IAM policy allows bucket creation but name exists. Service Control Policy (SCP) enforces bucket naming.`,
        `Network: VPC endpoint bucket restrictions. Bucket name collision.`,
        `Limits: Bucket name already exists in your account. Attempting to create duplicate bucket. Bucket name must be globally unique. Bucket exists in different region.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check if bucket exists: aws s3 ls | grep BUCKET_NAME. Or aws s3api head-bucket --bucket BUCKET_NAME. Verify bucket exists in your account.`,
        `Step 2: Diagnose - List all your buckets: aws s3 ls. Check if bucket name is in the list. Verify bucket ownership. Check bucket region.`,
        `Step 3: Diagnose - Check bucket region: aws s3api get-bucket-location --bucket BUCKET_NAME. Verify if bucket exists in different region. Check if you need bucket in specific region.`,
        `Step 4: Fix - Use different bucket name: Generate unique name: BUCKET_NAME="my-bucket-\$(date +%s)". Or add random suffix. Verify name is globally unique.`,
        `Step 5: Fix - Delete existing bucket if not needed: aws s3 rb s3://BUCKET_NAME --force (empties and deletes). Or use existing bucket. Verify bucket is empty before deletion.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check if S3 Bucket Already Exists',
          code: `#!/bin/bash
BUCKET_NAME="my-bucket-name"

echo "=== Checking if Bucket Exists ==="
aws s3api head-bucket --bucket \${BUCKET_NAME} 2>&1

if [ \$? -eq 0 ]; then
  echo "✓ Bucket \${BUCKET_NAME} already exists"
  
  # Get bucket details
  echo "\\n=== Bucket Details ==="
  aws s3api get-bucket-location --bucket \${BUCKET_NAME} --query LocationConstraint --output text
  aws s3api get-bucket-versioning --bucket \${BUCKET_NAME}
  
  echo "\\n=== Options ==="
  echo "1. Use existing bucket"
  echo "2. Delete bucket if not needed: aws s3 rb s3://\${BUCKET_NAME} --force"
  echo "3. Use different bucket name"
else
  echo "✗ Bucket \${BUCKET_NAME} does not exist"
  echo "You can create it"
fi

# List all your buckets
echo "\\n=== All Your Buckets ==="
aws s3 ls`,
        },
        {
          language: 'bash',
          title: 'Generate Unique Bucket Name',
          code: `#!/bin/bash
# Generate unique bucket name to avoid collision
BASE_NAME="my-app"
TIMESTAMP=\$(date +%s)
RANDOM_SUFFIX=\$(openssl rand -hex 4 | tr '[:upper:]' '[:lower:]')

# Combine to create unique name
UNIQUE_BUCKET="\${BASE_NAME}-\${TIMESTAMP}-\${RANDOM_SUFFIX}"

# Ensure lowercase and valid format
UNIQUE_BUCKET=\$(echo \${UNIQUE_BUCKET} | tr '[:upper:]' '[:lower:]')

# Validate length (3-63 characters)
if [ \${#UNIQUE_BUCKET} -gt 63 ]; then
  UNIQUE_BUCKET=\${UNIQUE_BUCKET:0:63}
fi

echo "=== Generated Unique Bucket Name ==="
echo "Bucket name: \${UNIQUE_BUCKET}"
echo "Length: \${#UNIQUE_BUCKET} characters"

# Check if it exists (should not)
if aws s3api head-bucket --bucket \${UNIQUE_BUCKET} 2>/dev/null; then
  echo "✗ Bucket name collision (unlikely)"
  echo "Generate new name"
else
  echo "✓ Bucket name is available"
  echo "\\n=== Creating Bucket ==="
  REGION="us-east-1"
  if [ "\${REGION}" = "us-east-1" ]; then
    aws s3api create-bucket --bucket \${UNIQUE_BUCKET} --region \${REGION}
  else
    aws s3api create-bucket \\
      --bucket \${UNIQUE_BUCKET} \\
      --region \${REGION} \\
      --create-bucket-configuration LocationConstraint=\${REGION}
  fi
fi`,
        },
        {
          language: 'bash',
          title: 'Delete Existing Bucket if Not Needed',
          code: `#!/bin/bash
BUCKET_NAME="my-bucket-name"

echo "=== Checking Bucket Contents ==="
OBJECT_COUNT=\$(aws s3 ls s3://\${BUCKET_NAME} --recursive 2>/dev/null | wc -l)
echo "Objects in bucket: \${OBJECT_COUNT}"

if [ \${OBJECT_COUNT} -gt 0 ]; then
  echo "\\n=== Bucket is not empty ==="
  echo "List objects:"
  aws s3 ls s3://\${BUCKET_NAME} --recursive | head -10
  
  echo "\\n=== Delete Bucket (Empty First) ==="
  echo "Empty bucket: aws s3 rm s3://\${BUCKET_NAME} --recursive"
  echo "Delete bucket: aws s3 rb s3://\${BUCKET_NAME}"
  echo ""
  echo "Or use --force to empty and delete:"
  echo "aws s3 rb s3://\${BUCKET_NAME} --force"
else
  echo "\\n=== Bucket is empty ==="
  echo "Delete bucket:"
  aws s3 rb s3://\${BUCKET_NAME}
  
  if [ \$? -eq 0 ]; then
    echo "✓ Bucket deleted successfully"
  else
    echo "✗ Failed to delete bucket"
    echo "Check bucket versioning, MFA delete, or other restrictions"
  fi
fi`,
        },
      ],
      relatedCodes: ['BucketAlreadyExists', 'BucketAlreadyOwnedByYou'],
      provider: 'aws',
    },
    'LambdaResourceNotFoundException': {
      code: 'LambdaResourceNotFoundException',
      name: 'Lambda Resource Not Found',
      description: `Getting a **LambdaResourceNotFoundException** means the Lambda function, layer, or event source mapping you're referencing doesn't exist—the resource might have been deleted, the name is misspelled, or it's in a different region. This client-side error (4xx) happens when AWS validates Lambda resource existence. Most common when function names are misspelled, but also appears when functions are deleted, incorrect regions are specified, functions don't exist, or layers/event sources are not found.`,
      metaDescription: 'Fix LambdaResourceNotFoundException by verifying function names, checking correct regions, listing all functions to find correct names, and verifying resources exist with our AWS guide.',
      causes: [
        `Identity: IAM policy allows Lambda access but resource doesn't exist. Service Control Policy (SCP) restricts resource access.`,
        `Network: VPC endpoint Lambda resource restrictions. Cross-region resource access.`,
        `Limits: Function name misspelled. Function deleted. Incorrect region specified. Function does not exist. Layer or event source not found.`,
      ],
      solutions: [
        `Step 1: Diagnose - List all Lambda functions: aws lambda list-functions --query 'Functions[*].[FunctionName,Runtime,LastModified]' --output table. Check if function exists. Verify function name spelling.`,
        `Step 2: Diagnose - Check function in specific region: aws lambda get-function --function-name FUNCTION_NAME --region REGION. Verify region is correct. Check if function exists in that region.`,
        `Step 3: Diagnose - Search for similar function names: aws lambda list-functions --query "Functions[?contains(FunctionName, 'PARTIAL_NAME')].FunctionName" --output table. Find correct function name.`,
        `Step 4: Fix - Use correct function name: Verify function name from list. Check for typos. Use exact function name (case-sensitive). Verify function ARN if using ARN.`,
        `Step 5: Fix - Check if function was deleted: Review CloudTrail logs: aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=DeleteFunction. Or recreate function if deleted.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'List All Lambda Functions to Find Correct Name',
          code: `#!/bin/bash
echo "=== All Lambda Functions ==="
aws lambda list-functions \\
  --query 'Functions[*].[FunctionName,Runtime,LastModified]' \\
  --output table

# Search for specific function
FUNCTION_NAME="my-function"
echo "\\n=== Searching for Function: \${FUNCTION_NAME} ==="
aws lambda list-functions \\
  --query "Functions[?contains(FunctionName, 'my')].[FunctionName,Runtime]" \\
  --output table

# Check if exact function exists
echo "\\n=== Checking Exact Function ==="
if aws lambda get-function --function-name \${FUNCTION_NAME} &>/dev/null; then
  echo "✓ Function \${FUNCTION_NAME} exists"
  aws lambda get-function --function-name \${FUNCTION_NAME} \\
    --query 'Configuration.[FunctionName,Runtime,LastModified,FunctionArn]' \\
    --output table
else
  echo "✗ Function \${FUNCTION_NAME} not found"
  echo "\\nSimilar function names:"
  aws lambda list-functions \\
    --query "Functions[?contains(FunctionName, 'my')].FunctionName" \\
    --output table
fi`,
        },
        {
          language: 'bash',
          title: 'Check Lambda Function Across Regions',
          code: `#!/bin/bash
FUNCTION_NAME="my-function"

echo "=== Checking Function Across Regions ==="
REGIONS=("us-east-1" "us-west-2" "eu-west-1" "ap-southeast-1")

for REGION in "\${REGIONS[@]}"; do
  echo "\\nChecking region: \${REGION}"
  RESULT=\$(aws lambda list-functions \\
    --region \${REGION} \\
    --query "Functions[?FunctionName=='\${FUNCTION_NAME}'].FunctionName" \\
    --output text 2>/dev/null)
  
  if [ ! -z "\${RESULT}" ]; then
    echo "✓ Function found in \${REGION}: \${RESULT}"
    
    # Get function details
    aws lambda get-function \\
      --function-name \${FUNCTION_NAME} \\
      --region \${REGION} \\
      --query 'Configuration.[FunctionName,Runtime,FunctionArn]' \\
      --output table
    break
  else
    echo "✗ Function not found in \${REGION}"
  fi
done`,
        },
        {
          language: 'bash',
          title: 'Check CloudTrail for Function Deletion',
          code: `#!/bin/bash
FUNCTION_NAME="my-function"

echo "=== Checking CloudTrail for Function Deletion ==="
aws cloudtrail lookup-events \\
  --lookup-attributes AttributeKey=EventName,AttributeValue=DeleteFunction \\
  --max-results 10 \\
  --query 'Events[*].[EventTime,CloudTrailEvent]' \\
  --output text | while read time event; do
    DELETED_FUNCTION=\$(echo "\${event}" | jq -r '.requestParameters.functionName' 2>/dev/null)
    if [ "\${DELETED_FUNCTION}" = "\${FUNCTION_NAME}" ]; then
      echo "Found deletion event for \${FUNCTION_NAME} at \${time}"
    fi
  done

echo "\\n=== Alternative: List Recent Lambda Events ==="
echo "Check AWS Console > Lambda > Functions > \${FUNCTION_NAME} > Monitoring"
echo "Or use CloudWatch Logs to see function activity"`,
        },
      ],
      relatedCodes: ['ResourceNotFoundException', 'NoSuchEntity'],
      provider: 'aws',
    },
    'DynamoDBResourceNotFoundException': {
      code: 'DynamoDBResourceNotFoundException',
      name: 'DynamoDB Resource Not Found',
      description: `Getting a **DynamoDBResourceNotFoundException** means the DynamoDB table, index, or stream you're referencing doesn't exist—the resource might have been deleted, the name is misspelled, or it's in a different region. This client-side error (4xx) happens when AWS validates DynamoDB resource existence. Most common when table names are misspelled, but also appears when tables don't exist, tables are deleted, incorrect regions are specified, or indexes/streams are not found.`,
      metaDescription: 'Fix DynamoDBResourceNotFoundException by verifying table names, listing all tables to find correct names, checking correct regions, and verifying resources exist with our AWS guide.',
      causes: [
        `Identity: IAM policy allows DynamoDB access but resource doesn't exist. Service Control Policy (SCP) restricts resource access.`,
        `Network: VPC endpoint DynamoDB resource restrictions. Cross-region resource access.`,
        `Limits: Table name misspelled. Table does not exist. Table deleted. Incorrect region specified. Index or stream not found.`,
      ],
      solutions: [
        `Step 1: Diagnose - List all DynamoDB tables: aws dynamodb list-tables --output table. Check if table exists. Verify table name spelling.`,
        `Step 2: Diagnose - Check table in specific region: aws dynamodb describe-table --table-name TABLE_NAME --region REGION. Verify region is correct. Check if table exists in that region.`,
        `Step 3: Diagnose - Search for similar table names: aws dynamodb list-tables --query "TableNames[?contains(@, 'PARTIAL_NAME')]" --output table. Find correct table name.`,
        `Step 4: Fix - Use correct table name: Verify table name from list. Check for typos. Use exact table name (case-sensitive). Verify table ARN if using ARN.`,
        `Step 5: Fix - Check if table was deleted: Review CloudTrail logs: aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=DeleteTable. Or check table status: aws dynamodb describe-table --table-name TABLE_NAME.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'List All DynamoDB Tables to Find Correct Name',
          code: `#!/bin/bash
echo "=== All DynamoDB Tables ==="
aws dynamodb list-tables --output table

# Search for specific table
TABLE_NAME="my-table"
echo "\\n=== Searching for Table: \${TABLE_NAME} ==="
aws dynamodb list-tables \\
  --query "TableNames[?contains(@, 'my')]" \\
  --output table

# Check if exact table exists
echo "\\n=== Checking Exact Table ==="
if aws dynamodb describe-table --table-name \${TABLE_NAME} &>/dev/null; then
  echo "✓ Table \${TABLE_NAME} exists"
  aws dynamodb describe-table --table-name \${TABLE_NAME} \\
    --query 'Table.[TableName,TableStatus,ItemCount,TableSizeBytes]' \\
    --output table
else
  echo "✗ Table \${TABLE_NAME} not found"
  echo "\\nSimilar table names:"
  aws dynamodb list-tables \\
    --query "TableNames[?contains(@, 'my')]" \\
    --output table
fi`,
        },
        {
          language: 'bash',
          title: 'Check DynamoDB Table Across Regions',
          code: `#!/bin/bash
TABLE_NAME="my-table"

echo "=== Checking Table Across Regions ==="
REGIONS=("us-east-1" "us-west-2" "eu-west-1" "ap-southeast-1")

for REGION in "\${REGIONS[@]}"; do
  echo "\\nChecking region: \${REGION}"
  RESULT=\$(aws dynamodb list-tables \\
    --region \${REGION} \\
    --query "TableNames[?@=='\${TABLE_NAME}']" \\
    --output text 2>/dev/null)
  
  if [ ! -z "\${RESULT}" ]; then
    echo "✓ Table found in \${REGION}: \${RESULT}"
    
    # Get table details
    aws dynamodb describe-table \\
      --table-name \${TABLE_NAME} \\
      --region \${REGION} \\
      --query 'Table.[TableName,TableStatus,ItemCount]' \\
      --output table
    break
  else
    echo "✗ Table not found in \${REGION}"
  fi
done`,
        },
        {
          language: 'bash',
          title: 'Check Table Status and Wait for Active',
          code: `#!/bin/bash
TABLE_NAME="my-table"

echo "=== Checking Table Status ==="
TABLE_STATUS=\$(aws dynamodb describe-table \\
  --table-name \${TABLE_NAME} \\
  --query 'Table.TableStatus' \\
  --output text 2>&1)

if [ \$? -eq 0 ]; then
  echo "Table status: \${TABLE_STATUS}"
  
  if [ "\${TABLE_STATUS}" = "ACTIVE" ]; then
    echo "✓ Table is active and ready"
  elif [ "\${TABLE_STATUS}" = "CREATING" ]; then
    echo "⏳ Table is being created"
    echo "Waiting for table to be active..."
    aws dynamodb wait table-exists --table-name \${TABLE_NAME}
    echo "✓ Table is now active"
  elif [ "\${TABLE_STATUS}" = "DELETING" ]; then
    echo "✗ Table is being deleted"
  else
    echo "Table status: \${TABLE_STATUS}"
  fi
else
  echo "✗ Table \${TABLE_NAME} not found"
  echo "Error: \${TABLE_STATUS}"
fi`,
        },
      ],
      relatedCodes: ['ResourceNotFoundException', 'TableNotFoundException'],
      provider: 'aws',
    },
    'S3InvalidBucketName': {
      code: 'S3InvalidBucketName',
      name: 'S3 Invalid Bucket Name',
      description: `Hitting an **S3InvalidBucketName** error means your S3 bucket name doesn't follow AWS naming rules—bucket names must be 3-63 characters, lowercase, alphanumeric with hyphens/periods, and globally unique. This client-side error (4xx) happens when AWS validates bucket name format. Most common when bucket names are too short/long, but also appears when invalid characters are used, names start/end with period or hyphen, uppercase letters are included, or consecutive periods exist.`,
      metaDescription: 'Fix S3InvalidBucketName by ensuring bucket names are 3-63 characters, lowercase, alphanumeric with hyphens/periods, and follow DNS naming conventions with our AWS guide.',
      causes: [
        `Identity: IAM policy allows bucket creation but name invalid. Service Control Policy (SCP) enforces naming rules.`,
        `Network: VPC endpoint bucket naming restrictions. Bucket name format invalid.`,
        `Limits: Bucket name too short (<3 characters) or too long (>63 characters). Invalid characters in name. Name starts/ends with period or hyphen. Name contains uppercase letters. Consecutive periods.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check bucket name length: echo BUCKET_NAME | wc -c. Verify length is 3-63 characters. Check if too short or too long.`,
        `Step 2: Diagnose - Check for invalid characters: Verify only lowercase letters, numbers, periods, hyphens. Check for uppercase letters. Verify no special characters.`,
        `Step 3: Diagnose - Check name format: Verify doesn't start/end with period or hyphen. Check for consecutive periods. Verify follows DNS naming conventions.`,
        `Step 4: Fix - Generate valid bucket name: BUCKET_NAME="my-app-\$(date +%s)". Ensure lowercase: BUCKET_NAME=\$(echo \${BUCKET_NAME} | tr '[:upper:]' '[:lower:]'). Validate length: [ \${#BUCKET_NAME} -ge 3 ] && [ \${#BUCKET_NAME} -le 63 ].`,
        `Step 5: Fix - Create bucket with valid name: aws s3api create-bucket --bucket \${BUCKET_NAME} --region us-east-1. For other regions: aws s3api create-bucket --bucket \${BUCKET_NAME} --region REGION --create-bucket-configuration LocationConstraint=REGION.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          code: `# Validate bucket name
validate_bucket_name() {
  local name=$1
  
  # Check length (3-63 characters)
  if [ \${#name} -lt 3 ] || [ \${#name} -gt 63 ]; then
    echo "Error: Bucket name must be 3-63 characters"
    return 1
  fi
  
  # Check for uppercase letters
  if [[ $name =~ [A-Z] ]]; then
    echo "Error: Bucket name must be lowercase"
    return 1
  fi
  
  # Check for invalid characters (only lowercase, numbers, periods, hyphens allowed)
  if [[ ! $name =~ ^[a-z0-9.-]+$ ]]; then
    echo "Error: Bucket name contains invalid characters"
    return 1
  fi
  
  # Check for consecutive periods
  if [[ $name =~ \\.\\. ]]; then
    echo "Error: Bucket name cannot contain consecutive periods"
    return 1
  fi
  
  # Check if starts/ends with period or hyphen
  if [[ $name =~ ^[\\.-] ]] || [[ $name =~ [\\.-]$ ]]; then
    echo "Error: Bucket name cannot start or end with period or hyphen"
    return 1
  fi
  
  echo "Bucket name is valid: $name"
  return 0
}

# Test validation
validate_bucket_name "my-bucket-123"  # Valid
validate_bucket_name "My-Bucket"      # Invalid (uppercase)
validate_bucket_name "my..bucket"     # Invalid (consecutive periods)
validate_bucket_name "-my-bucket"     # Invalid (starts with hyphen)`,
          title: 'S3 Bucket Name Validation',
        },
      ],
      relatedCodes: ['InvalidBucketName', 'InvalidParameterValue'],
      provider: 'aws',
    },
    'LambdaServiceException': {
      code: 'LambdaServiceException',
      name: 'Lambda Service Exception',
      description: `Getting a **LambdaServiceException** means AWS Lambda encountered an internal service error—this is a server-side issue (5xx) that's usually temporary and resolves with retries. This server-side error happens when Lambda services experience internal failures. Most common during temporary service issues, but also appears when services are temporarily unavailable, Lambda is overloaded, regional service issues occur, or transient infrastructure problems happen.`,
      metaDescription: 'Resolve LambdaServiceException by implementing exponential backoff retries, checking AWS Service Health Dashboard, trying different regions, or contacting AWS Support with our AWS guide.',
      causes: [
        `Identity: IAM service internal error. Service Control Policy (SCP) service failure. Account-level Lambda service issues.`,
        `Network: VPC endpoint Lambda service internal error. Regional Lambda service failures. Cross-region service issues.`,
        `Limits: Internal Lambda service error. Temporary service unavailability. Service overload. Regional service issue. Transient infrastructure problem.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check AWS Service Health Dashboard: Visit https://status.aws.amazon.com/. Check Lambda service status. Review recent incidents. Check if issue is known.`,
        `Step 2: Diagnose - Verify error is LambdaServiceException: Check error code is LambdaServiceException (5xx). Verify it's not a client error (4xx). Check if error is consistent or intermittent.`,
        `Step 3: Diagnose - Check Lambda service metrics: aws cloudwatch get-metric-statistics --namespace AWS/Lambda --metric-name Errors --dimensions Name=FunctionName,Value=FUNCTION_NAME --start-time TIME --end-time TIME --period 300 --statistics Sum. Monitor Lambda errors.`,
        `Step 4: Fix - Implement exponential backoff: Retry with delays: 1s, 2s, 4s, 8s, 16s. Use AWS SDK automatic retries. Add jitter to prevent thundering herd. Max retries: 5-10 attempts.`,
        `Step 5: Fix - Wait and retry or try different region: If temporary, wait a few minutes and retry. Try different region: aws lambda list-functions --region us-west-2. If persistent, contact AWS Support: aws support create-case --subject "LambdaServiceException" --service-code lambda --severity-code normal.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Retry Lambda Operation with Exponential Backoff',
          code: `#!/bin/bash
# Function to retry Lambda operations with exponential backoff
retry_lambda_operation() {
  local max_attempts=5
  local delay=1
  local attempt=1
  local function_name=\$1
  local payload=\$2
  
  while [ \${attempt} -le \${max_attempts} ]; do
    echo "Attempt \${attempt} of \${max_attempts}"
    
    if aws lambda invoke \\
      --function-name \${function_name} \\
      --payload "\${payload}" \\
      response.json 2>&1; then
      echo "✓ Operation succeeded on attempt \${attempt}"
      return 0
    else
      if [ \${attempt} -lt \${max_attempts} ]; then
        echo "✗ Attempt \${attempt} failed, retrying in \${delay}s..."
        sleep \${delay}
        delay=\$((delay * 2))
        attempt=\$((attempt + 1))
      else
        echo "✗ Operation failed after \${max_attempts} attempts"
        return 1
      fi
    fi
  done
}

# Example usage
FUNCTION_NAME="my-function"
PAYLOAD='{"key":"value"}'
retry_lambda_operation \${FUNCTION_NAME} "\${PAYLOAD}"`,
        },
        {
          language: 'bash',
          title: 'Check Lambda Service Status and Health',
          code: `#!/bin/bash
echo "=== Lambda Account Settings ==="
aws lambda get-account-settings \\
  --query '[AccountLimit,AccountUsage]' \\
  --output table

# Check Lambda service in different regions
echo "\\n=== Checking Lambda Service Across Regions ==="
REGIONS=("us-east-1" "us-west-2" "eu-west-1")

for REGION in "\${REGIONS[@]}"; do
  echo "\\nRegion: \${REGION}"
  aws lambda list-functions --region \${REGION} \\
    --max-items 1 \\
    --query 'Functions[0].FunctionName' \\
    --output text 2>&1 | head -1
  
  if [ \$? -eq 0 ]; then
    echo "✓ Lambda service available in \${REGION}"
  else
    echo "✗ Lambda service issue in \${REGION}"
  fi
done`,
        },
        {
          language: 'bash',
          title: 'Check AWS Service Health Dashboard for Lambda',
          code: `#!/bin/bash
echo "=== AWS Service Health Dashboard ==="
echo "Visit: https://status.aws.amazon.com/"
echo "Check Lambda service status"

# Check CloudWatch for Lambda service errors
FUNCTION_NAME="my-function"
START_TIME=\$(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S)
END_TIME=\$(date -u +%Y-%m-%dT%H:%M:%S)

echo "\\n=== Checking Lambda Service Errors ==="
aws cloudwatch get-metric-statistics \\
  --namespace AWS/Lambda \\
  --metric-name Errors \\
  --dimensions Name=FunctionName,Value=\${FUNCTION_NAME} \\
  --start-time \${START_TIME} \\
  --end-time \${END_TIME} \\
  --period 300 \\
  --statistics Sum \\
  --output table 2>&1 | head -10 || echo "No metrics or function not found"`,
        },
      ],
      relatedCodes: ['ServiceUnavailable', 'InternalError'],
      provider: 'aws',
    },
    'DynamoDBConditionalCheckFailedException': {
      code: 'DynamoDBConditionalCheckFailedException',
      name: 'DynamoDB Conditional Check Failed',
      description: `Getting a **DynamoDBConditionalCheckFailedException** means your conditional write operation (PutItem, UpdateItem, DeleteItem) failed because the condition expression evaluated to false—the item doesn't match your expected state, doesn't exist when expected, or was modified by another operation. This client-side error (4xx) happens when AWS validates conditional expressions. Most common when item attribute values don't match expectations, but also appears when items don't exist when expected, version checks fail, optimistic locking conflicts occur, or condition expressions are incorrect.`,
      metaDescription: 'Fix DynamoDBConditionalCheckFailedException by verifying condition expressions, checking item state, implementing retry logic for optimistic locking, or using transaction writes with our AWS guide.',
      causes: [
        `Identity: IAM policy allows DynamoDB write but condition fails. Service Control Policy (SCP) enforces conditional checks.`,
        `Network: VPC endpoint DynamoDB conditional restrictions. Concurrent modification conflicts.`,
        `Limits: Condition expression evaluated to false. Item does not exist when expected. Item attribute value mismatch. Version check failed. Optimistic locking conflict.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check exact error message: AWS usually specifies which condition failed. Review condition expression. Check if item exists. Verify attribute values.`,
        `Step 2: Diagnose - Get current item state: aws dynamodb get-item --table-name TABLE_NAME --key '{"id":{"S":"123"}}' --output json. Compare with expected state. Check attribute values.`,
        `Step 3: Diagnose - Review condition expression: Verify condition expression syntax. Check if using ExpressionAttributeNames for reserved words. Verify ExpressionAttributeValues are correct.`,
        `Step 4: Fix - Correct condition expression: Update condition to match actual item state. Use ExpressionAttributeNames for reserved words: #status instead of status. Verify attribute values match.`,
        `Step 5: Fix - Implement retry logic: Retry with exponential backoff. Get current item state before retry. Update condition based on current state. Or use DynamoDB transactions for atomic operations.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check Current Item State Before Conditional Update',
          code: `#!/bin/bash
TABLE_NAME="my-table"
ITEM_KEY='{"id":{"S":"123"}}'

echo "=== Getting Current Item State ==="
aws dynamodb get-item \\
  --table-name \${TABLE_NAME} \\
  --key \${ITEM_KEY} \\
  --output json | jq '.'

# Check specific attribute value
echo "\\n=== Checking Attribute Value ==="
CURRENT_STATUS=\$(aws dynamodb get-item \\
  --table-name \${TABLE_NAME} \\
  --key \${ITEM_KEY} \\
  --query 'Item.status.S' \\
  --output text)

echo "Current status: \${CURRENT_STATUS}"

# Verify condition will pass
EXPECTED_STATUS="pending"
if [ "\${CURRENT_STATUS}" = "\${EXPECTED_STATUS}" ]; then
  echo "✓ Condition will pass (status is \${EXPECTED_STATUS})"
else
  echo "✗ Condition will fail (status is \${CURRENT_STATUS}, expected \${EXPECTED_STATUS})"
  echo "Update condition expression to match current state"
fi`,
        },
        {
          language: 'bash',
          title: 'Use ExpressionAttributeNames for Reserved Words',
          code: `#!/bin/bash
TABLE_NAME="my-table"
ITEM_KEY='{"id":{"S":"123"}}'

echo "=== Conditional Update with ExpressionAttributeNames ==="
echo "Using #status instead of 'status' (reserved word)"

# Update with condition using ExpressionAttributeNames
aws dynamodb update-item \\
  --table-name \${TABLE_NAME} \\
  --key \${ITEM_KEY} \\
  --update-expression "SET #status = :new_status" \\
  --condition-expression "#status = :old_status" \\
  --expression-attribute-names '{"#status":"status"}' \\
  --expression-attribute-values '{
    ":new_status":{"S":"completed"},
    ":old_status":{"S":"pending"}
  }' \\
  --return-values ALL_NEW 2>&1

if [ \$? -eq 0 ]; then
  echo "✓ Conditional update successful"
else
  echo "✗ Conditional check failed"
  echo "Get current item state and adjust condition"
fi`,
        },
        {
          language: 'bash',
          title: 'Retry Conditional Update with Exponential Backoff',
          code: `#!/bin/bash
TABLE_NAME="my-table"
ITEM_KEY='{"id":{"S":"123"}}'
MAX_RETRIES=3

echo "=== Conditional Update with Retry Logic ==="

for ATTEMPT in \$(seq 1 \${MAX_RETRIES}); do
  echo "\\nAttempt \${ATTEMPT} of \${MAX_RETRIES}"
  
  # Get current state first
  CURRENT_STATUS=\$(aws dynamodb get-item \\
    --table-name \${TABLE_NAME} \\
    --key \${ITEM_KEY} \\
    --query 'Item.status.S' \\
    --output text)
  
  echo "Current status: \${CURRENT_STATUS}"
  
  # Try conditional update
  aws dynamodb update-item \\
    --table-name \${TABLE_NAME} \\
    --key \${ITEM_KEY} \\
    --update-expression "SET #status = :new_status" \\
    --condition-expression "#status = :old_status" \\
    --expression-attribute-names '{"#status":"status"}' \\
    --expression-attribute-values "{
      \":new_status\":{\"S\":\"completed\"},
      \":old_status\":{\"S\":\"\${CURRENT_STATUS}\"}
    }" \\
    --return-values ALL_NEW 2>&1
  
  if [ \$? -eq 0 ]; then
    echo "✓ Update successful"
    break
  else
    if [ \${ATTEMPT} -lt \${MAX_RETRIES} ]; then
      DELAY=\$((2 ** ATTEMPT))
      echo "✗ Update failed, retrying in \${DELAY}s..."
      sleep \${DELAY}
    else
      echo "✗ Update failed after \${MAX_RETRIES} attempts"
    fi
  fi
done`,
        },
      ],
      relatedCodes: ['InvalidParameterValue', 'ValidationException'],
      provider: 'aws',
    },
    'S3InvalidAccessKeyId': {
      code: 'S3InvalidAccessKeyId',
      name: 'S3 Invalid Access Key ID',
      description: `Hitting an **S3InvalidAccessKeyId** error means your AWS access key ID doesn't exist or is invalid—the access key might have been deleted, rotated, or belongs to a different AWS account. This client-side error (4xx) happens when AWS validates S3 request credentials. Most common when access keys are deleted or rotated, but also appears when access key IDs are incorrect, credentials files are misconfigured, wrong AWS account credentials are used, or old keys are still in use after rotation.`,
      metaDescription: 'Fix S3InvalidAccessKeyId by verifying access key IDs, checking credentials files, regenerating keys if needed, and updating credentials after rotation with our AWS guide.',
      causes: [
        `Identity: Access key ID doesn't exist in AWS. Access key was deleted from IAM user. Access key belongs to different AWS account.`,
        `Network: Credentials file misconfigured. Environment variables not set correctly. AWS CLI configuration has wrong key.`,
        `Limits: Access key ID is incorrect. Access key rotated but old key still in use. Typo in access key ID. Wrong AWS account credentials.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check current credentials: aws sts get-caller-identity. If S3InvalidAccessKeyId, credentials are wrong. Verify which credentials are being used: aws configure list.`,
        `Step 2: Diagnose - List IAM user access keys: aws iam list-access-keys --user-name USER_NAME. Check if key exists and is active. Verify key ID matches your credentials.`,
        `Step 3: Diagnose - Check credentials file: cat ~/.aws/credentials. Verify [default] or [profile] section has correct AccessKeyId. Check environment variables: echo \$AWS_ACCESS_KEY_ID.`,
        `Step 4: Fix - Regenerate access key if deleted: aws iam create-access-key --user-name USER_NAME. Update credentials: aws configure set aws_access_key_id NEW_KEY_ID.`,
        `Step 5: Fix - Verify credentials work: aws s3 ls. Should list your buckets. If still fails, check IAM user exists: aws iam get-user --user-name USER_NAME.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check Current S3 Credentials and Access Keys',
          code: `#!/bin/bash
echo "=== Checking Current Credentials ==="
aws sts get-caller-identity 2>&1

if [ \$? -ne 0 ]; then
  echo "✗ Invalid credentials (S3InvalidAccessKeyId)"
  echo "\\n=== Checking Credentials Configuration ==="
  aws configure list
else
  echo "✓ Credentials valid"
  echo "\\n=== Testing S3 Access ==="
  aws s3 ls 2>&1 | head -5
fi

# List access keys for current user
echo "\\n=== Listing Access Keys ==="
USER_NAME=\$(aws sts get-caller-identity --query Arn --output text 2>/dev/null | cut -d'/' -f2)
if [ ! -z "\${USER_NAME}" ]; then
  aws iam list-access-keys --user-name \${USER_NAME} \\
    --query 'AccessKeyMetadata[*].[AccessKeyId,Status,CreateDate]' \\
    --output table
else
  echo "Cannot determine user name (credentials invalid)"
fi`,
        },
        {
          language: 'bash',
          title: 'Regenerate Access Key and Update Credentials',
          code: `#!/bin/bash
USER_NAME="my-user"  # Replace with your IAM user name

echo "=== Creating New Access Key ==="
NEW_KEY=\$(aws iam create-access-key --user-name \${USER_NAME} \\
  --query 'AccessKey.[AccessKeyId,SecretAccessKey]' \\
  --output text 2>/dev/null)

if [ \$? -eq 0 ]; then
  NEW_ACCESS_KEY_ID=\$(echo \${NEW_KEY} | cut -f1)
  NEW_SECRET_ACCESS_KEY=\$(echo \${NEW_KEY} | cut -f2)
  
  echo "✓ New access key created"
  echo "Access Key ID: \${NEW_ACCESS_KEY_ID}"
  
  # Update credentials
  echo "\\n=== Updating Credentials ==="
  aws configure set aws_access_key_id \${NEW_ACCESS_KEY_ID}
  aws configure set aws_secret_access_key \${NEW_SECRET_ACCESS_KEY}
  
  # Verify new credentials
  echo "\\n=== Verifying New Credentials ==="
  aws s3 ls 2>&1 | head -3
  
  if [ \$? -eq 0 ]; then
    echo "✓ New credentials work"
    echo "\\n=== Delete Old Access Key ==="
    echo "List old keys: aws iam list-access-keys --user-name \${USER_NAME}"
    echo "Delete old key: aws iam delete-access-key --user-name \${USER_NAME} --access-key-id OLD_KEY_ID"
  else
    echo "✗ New credentials still invalid"
  fi
else
  echo "✗ Failed to create access key"
  echo "Check IAM permissions and user name"
fi`,
        },
        {
          language: 'bash',
          title: 'Check Credentials File and Environment Variables',
          code: `#!/bin/bash
echo "=== Checking Credentials File ==="
if [ -f ~/.aws/credentials ]; then
  echo "Credentials file exists"
  echo "\\n=== Default Profile ==="
  grep -A 2 "\[default\]" ~/.aws/credentials 2>/dev/null || echo "No [default] profile"
  
  echo "\\n=== All Profiles ==="
  grep "\[" ~/.aws/credentials | head -5
else
  echo "✗ Credentials file not found at ~/.aws/credentials"
fi

echo "\\n=== Environment Variables ==="
echo "AWS_ACCESS_KEY_ID: \${AWS_ACCESS_KEY_ID:-(not set)}"
echo "AWS_SECRET_ACCESS_KEY: \${AWS_SECRET_ACCESS_KEY:+(set)} \${AWS_SECRET_ACCESS_KEY:+[hidden]}"
echo "AWS_PROFILE: \${AWS_PROFILE:-(not set)}"

echo "\\n=== Current Configuration ==="
aws configure list`,
        },
      ],
      relatedCodes: ['InvalidAccessKeyId', 'InvalidClientTokenId'],
      provider: 'aws',
    },
    'LambdaInvalidRequestContentException': {
      code: 'LambdaInvalidRequestContentException',
      name: 'Lambda Invalid Request Content',
      description: `Getting a **LambdaInvalidRequestContentException** means your Lambda function invocation payload is invalid—the JSON is malformed, exceeds the 6MB limit, or has encoding issues. This client-side error (4xx) happens when AWS validates Lambda invocation payloads. Most common when JSON format is invalid, but also appears when request payloads exceed 6MB limit, JSON structure is malformed, encoding issues occur, or unsupported content types are used.`,
      metaDescription: 'Fix LambdaInvalidRequestContentException by validating JSON format, ensuring payloads are under 6MB, checking JSON syntax, and using proper UTF-8 encoding with our AWS guide.',
      causes: [
        `Identity: IAM policy allows Lambda invocation but payload invalid. Service Control Policy (SCP) enforces payload validation.`,
        `Network: VPC endpoint payload size restrictions. API Gateway payload limits.`,
        `Limits: Invalid JSON format in request. Request payload too large (max 6MB). Malformed JSON structure. Encoding issues in payload. Unsupported content type.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check JSON syntax: echo PAYLOAD_JSON | jq '.'. Verify JSON is valid. Check for syntax errors. Verify JSON structure.`,
        `Step 2: Diagnose - Check payload size: stat -f%z PAYLOAD_FILE or stat -c%s PAYLOAD_FILE. Compare with 6MB limit (6291456 bytes). Verify if payload is too large.`,
        `Step 3: Diagnose - Validate JSON format: Use jq to validate: echo PAYLOAD_JSON | jq '.'. Check for encoding issues. Verify UTF-8 encoding.`,
        `Step 4: Fix - Validate JSON before invocation: echo PAYLOAD_JSON | jq '.' > /dev/null. Fix JSON syntax errors. Ensure proper UTF-8 encoding.`,
        `Step 5: Fix - Reduce payload size if needed: Compress payload if possible. Split large payloads. Use S3 for large data: upload to S3, pass S3 key to Lambda. Or use Lambda event source mappings.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Validate JSON Format and Size Before Lambda Invocation',
          code: `#!/bin/bash
PAYLOAD_FILE="payload.json"
FUNCTION_NAME="my-function"

echo "=== Validating Lambda Payload ==="

# Check if file exists
if [ ! -f \${PAYLOAD_FILE} ]; then
  echo "✗ Payload file not found: \${PAYLOAD_FILE}"
  exit 1
fi

# Validate JSON syntax
echo "\\n=== Validating JSON Syntax ==="
if command -v jq &> /dev/null; then
  jq '.' \${PAYLOAD_FILE} > /dev/null 2>&1
  if [ \$? -eq 0 ]; then
    echo "✓ JSON syntax valid"
  else
    echo "✗ Invalid JSON syntax"
    echo "Fix JSON errors:"
    jq '.' \${PAYLOAD_FILE} 2>&1 | head -5
    exit 1
  fi
else
  echo "jq not installed - cannot validate JSON"
  echo "Install: sudo apt-get install jq (Linux) or brew install jq (macOS)"
fi

# Check payload size (6MB limit)
echo "\\n=== Checking Payload Size ==="
PAYLOAD_SIZE=\$(stat -f%z "\${PAYLOAD_FILE}" 2>/dev/null || stat -c%s "\${PAYLOAD_FILE}" 2>/dev/null)
MAX_SIZE=6291456  # 6MB in bytes
PAYLOAD_SIZE_MB=\$((PAYLOAD_SIZE / 1024 / 1024))

echo "Payload size: \${PAYLOAD_SIZE} bytes (\${PAYLOAD_SIZE_MB} MB)"
echo "Max size: \${MAX_SIZE} bytes (6 MB)"

if [ \${PAYLOAD_SIZE} -gt \${MAX_SIZE} ]; then
  echo "✗ Payload exceeds 6MB limit"
  echo "Reduce payload size or use S3 for large data"
  exit 1
else
  echo "✓ Payload size within limit"
fi

# Invoke Lambda
echo "\\n=== Invoking Lambda Function ==="
aws lambda invoke \\
  --function-name \${FUNCTION_NAME} \\
  --payload file://\${PAYLOAD_FILE} \\
  response.json 2>&1

if [ \$? -eq 0 ]; then
  echo "✓ Lambda invocation successful"
else
  echo "✗ Lambda invocation failed"
  echo "Check error in response.json"
fi`,
        },
        {
          language: 'bash',
          title: 'Use S3 for Large Lambda Payloads',
          code: `#!/bin/bash
# For payloads >6MB, upload to S3 and pass S3 key to Lambda
LARGE_FILE="large-data.json"
BUCKET_NAME="my-lambda-payloads"
FUNCTION_NAME="my-function"

echo "=== Handling Large Payload (>6MB) ==="

# Check file size
FILE_SIZE=\$(stat -f%z "\${LARGE_FILE}" 2>/dev/null || stat -c%s "\${LARGE_FILE}" 2>/dev/null)
MAX_SIZE=6291456  # 6MB

if [ \${FILE_SIZE} -gt \${MAX_SIZE} ]; then
  echo "File size: \${FILE_SIZE} bytes (exceeds 6MB limit)"
  echo "\\n=== Uploading to S3 ==="
  
  # Upload to S3
  S3_KEY="payloads/\$(date +%s)-\$(basename \${LARGE_FILE})"
  aws s3 cp \${LARGE_FILE} s3://\${BUCKET_NAME}/\${S3_KEY}
  
  # Create small payload with S3 reference
  cat > small-payload.json <<EOF
{
  "s3Bucket": "\${BUCKET_NAME}",
  "s3Key": "\${S3_KEY}"
}
EOF
  
  echo "\\n=== Invoking Lambda with S3 Reference ==="
  aws lambda invoke \\
    --function-name \${FUNCTION_NAME} \\
    --payload file://small-payload.json \\
    response.json
  
  echo "Lambda function should read from S3: s3://\${BUCKET_NAME}/\${S3_KEY}"
else
  echo "File size: \${FILE_SIZE} bytes (within 6MB limit)"
  echo "Can invoke Lambda directly with file"
fi`,
        },
        {
          language: 'bash',
          title: 'Fix JSON Syntax Errors',
          code: `#!/bin/bash
PAYLOAD_FILE="payload.json"

echo "=== Validating and Fixing JSON ==="

# Check JSON with jq
if command -v jq &> /dev/null; then
  echo "Validating JSON..."
  jq '.' \${PAYLOAD_FILE} > /dev/null 2>&1
  
  if [ \$? -ne 0 ]; then
    echo "✗ Invalid JSON - showing errors:"
    jq '.' \${PAYLOAD_FILE} 2>&1 | head -10
    
    echo "\\n=== Common JSON Errors ==="
    echo "1. Missing commas between items"
    echo "2. Trailing commas"
    echo "3. Unquoted keys"
    echo "4. Invalid escape sequences"
    echo "5. Mismatched brackets/braces"
    
    echo "\\n=== Example Valid JSON ==="
    cat <<'EOF'
{
  "key1": "value1",
  "key2": "value2",
  "number": 123,
  "array": [1, 2, 3],
  "object": {
    "nested": "value"
  }
}
EOF
  else
    echo "✓ JSON is valid"
  fi
else
  echo "jq not installed - install to validate JSON"
fi`,
        },
      ],
      relatedCodes: ['InvalidParameterValue', 'RequestEntityTooLarge'],
      provider: 'aws',
    },
    'DynamoDBItemCollectionSizeLimitExceededException': {
      code: 'DynamoDBItemCollectionSizeLimitExceededException',
      name: 'DynamoDB Item Collection Size Limit Exceeded',
      description: `Hitting a **DynamoDBItemCollectionSizeLimitExceededException** means a single item collection (all items sharing the same partition key) exceeds the 10GB limit—this typically happens with Local Secondary Indexes (LSI) or Global Secondary Indexes (GSI) when too many items share the same partition key. This client-side error (4xx) happens when AWS enforces DynamoDB collection size limits. Most common when hot partitions have excessive data, but also appears when LSI/GSI exceeds 10GB, too many items share the same partition key, or index size limits are reached.`,
      metaDescription: 'Fix DynamoDBItemCollectionSizeLimitExceededException by redesigning partition keys, splitting collections across partitions, archiving old data, or removing unused indexes with our AWS guide.',
      causes: [
        `Identity: IAM policy allows DynamoDB operations but collection size exceeded. Service Control Policy (SCP) enforces collection limits.`,
        `Network: VPC endpoint DynamoDB collection restrictions. Regional collection size limits.`,
        `Limits: Local Secondary Index exceeds 10GB. Global Secondary Index exceeds 10GB. Too many items with same partition key. Hot partition with excessive data. Index size limit reached.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check table and index sizes: aws dynamodb describe-table --table-name TABLE_NAME --query 'Table.[TableSizeBytes,ItemCount]' --output table. Check GSI sizes: aws dynamodb describe-table --table-name TABLE_NAME --query 'Table.GlobalSecondaryIndexes[*].[IndexName,IndexSizeBytes,ItemCount]' --output table.`,
        `Step 2: Diagnose - Identify hot partitions: Review partition key distribution. Check if single partition key has too many items. Verify if collection size approaches 10GB.`,
        `Step 3: Diagnose - Check index sizes: List all GSI/LSI indexes. Check index sizes. Verify if any index exceeds 10GB.`,
        `Step 4: Fix - Redesign partition key: Use composite partition key: partition_key = "user123#shard001" instead of "user123". Distribute items across multiple partition keys. Use hash suffix to spread load.`,
        `Step 5: Fix - Archive old data or remove indexes: Archive old data to reduce collection size. Remove unused indexes: aws dynamodb update-table --table-name TABLE_NAME --global-secondary-index-updates. Or use sparse indexes to reduce size.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check DynamoDB Table and Index Sizes',
          code: `#!/bin/bash
TABLE_NAME="my-table"

echo "=== Table Size and Item Count ==="
aws dynamodb describe-table --table-name \${TABLE_NAME} \\
  --query 'Table.[TableName,TableSizeBytes,ItemCount]' \\
  --output table

# Check Global Secondary Indexes
echo "\\n=== Global Secondary Indexes (GSI) ==="
aws dynamodb describe-table --table-name \${TABLE_NAME} \\
  --query 'Table.GlobalSecondaryIndexes[*].[IndexName,IndexSizeBytes,ItemCount]' \\
  --output table

# Check Local Secondary Indexes
echo "\\n=== Local Secondary Indexes (LSI) ==="
aws dynamodb describe-table --table-name \${TABLE_NAME} \\
  --query 'Table.LocalSecondaryIndexes[*].[IndexName,IndexSizeBytes,ItemCount]' \\
  --output table

# Check for collections approaching 10GB limit
echo "\\n=== Collection Size Limits ==="
echo "Single item collection (same partition key) limit: 10GB"
echo "If any GSI/LSI exceeds 10GB, you'll get this error"`,
        },
        {
          language: 'bash',
          title: 'Identify Hot Partitions',
          code: `#!/bin/bash
TABLE_NAME="my-table"

echo "=== Identifying Hot Partitions ==="
echo "Hot partitions have too many items with same partition key"
echo "This can cause ItemCollectionSizeLimitExceededException"

# Note: DynamoDB doesn't provide direct partition key distribution
# You need to analyze your data or use CloudWatch metrics

echo "\\n=== Check CloudWatch Metrics ==="
echo "Monitor ConsumedReadCapacityUnits and ConsumedWriteCapacityUnits"
echo "High values for specific partition keys indicate hot partitions"

# Example: Query to check item distribution
echo "\\n=== Analyzing Partition Key Distribution ==="
echo "Use DynamoDB Streams or scan with ProjectionExpression"
echo "Count items per partition key to identify hot partitions"

echo "\\n=== Solution: Composite Partition Key ==="
echo "Instead of: partition_key = 'user123'"
echo "Use: partition_key = 'user123#shard001'"
echo "This distributes items across multiple partition keys"`,
        },
        {
          language: 'bash',
          title: 'Redesign Table with Composite Partition Key',
          code: `#!/bin/bash
echo "=== Redesigning Partition Key to Avoid Hot Partitions ==="
echo "\\nProblem: Single partition key has too many items (>10GB)"
echo "Solution: Use composite partition key with hash suffix"

echo "\\n=== Example Partition Key Redesign ==="
echo "Old: partition_key = 'user123'"
echo "New: partition_key = 'user123#shard001'"

# Generate hash suffix for distribution
USER_ID="user123"
SHARD_COUNT=10
SHARD_NUM=\$((RANDOM % SHARD_COUNT))
NEW_PARTITION_KEY="\${USER_ID}#shard\$(printf '%03d' \${SHARD_NUM})"

echo "\\n=== New Partition Key Format ==="
echo "User ID: \${USER_ID}"
echo "New partition key: \${NEW_PARTITION_KEY}"

echo "\\n=== Benefits ==="
echo "1. Distributes items across multiple partition keys"
echo "2. Prevents single collection from exceeding 10GB"
echo "3. Improves performance by reducing hot partitions"
echo "4. Allows better parallelization"

echo "\\n=== Migration Strategy ==="
echo "1. Create new table with composite partition key"
echo "2. Migrate data with new partition key format"
echo "3. Update application to use new partition key"
echo "4. Archive or delete old table"`,
        },
      ],
      relatedCodes: ['LimitExceededException', 'ValidationException'],
      provider: 'aws',
    },
    'S3NoSuchBucket': {
      code: 'S3NoSuchBucket',
      name: 'S3 No Such Bucket',
      description: `Getting an **S3NoSuchBucket** error means the S3 bucket you're trying to access doesn't exist—the bucket might have been deleted, the name is misspelled, or it's in a different region or AWS account. This client-side error (4xx) happens when AWS validates bucket existence. Most common when bucket names are misspelled, but also appears when buckets don't exist, buckets are deleted, incorrect regions are specified, or buckets are in different AWS accounts.`,
      metaDescription: 'Fix S3NoSuchBucket by verifying bucket names, listing all buckets to find correct names, checking correct regions, and confirming bucket ownership with our AWS guide.',
      causes: [
        `Identity: IAM policy allows S3 access but bucket doesn't exist. Service Control Policy (SCP) restricts bucket access.`,
        `Network: VPC endpoint bucket restrictions. Cross-region bucket access.`,
        `Limits: Bucket name misspelled. Bucket does not exist. Bucket deleted. Incorrect region specified. Bucket in different AWS account.`,
      ],
      solutions: [
        `Step 1: Diagnose - List all S3 buckets: aws s3 ls. Check if bucket name is in the list. Verify bucket ownership. Check bucket region.`,
        `Step 2: Diagnose - Check bucket in specific region: aws s3api head-bucket --bucket BUCKET_NAME --region REGION. Verify region is correct. Check if bucket exists in that region.`,
        `Step 3: Diagnose - Search for similar bucket names: aws s3 ls | grep PARTIAL_NAME. Find correct bucket name. Check for typos.`,
        `Step 4: Fix - Use correct bucket name: Verify bucket name from list. Check for typos. Use exact bucket name (case-sensitive). Verify bucket ARN if using ARN.`,
        `Step 5: Fix - Check if bucket was deleted: Review CloudTrail logs: aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=DeleteBucket. Or create bucket if needed: aws s3api create-bucket --bucket BUCKET_NAME --region REGION.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'List All S3 Buckets to Find Correct Name',
          code: `#!/bin/bash
echo "=== All S3 Buckets ==="
aws s3 ls --output table

# Search for specific bucket
BUCKET_NAME="my-bucket"
echo "\\n=== Searching for Bucket: \${BUCKET_NAME} ==="
aws s3 ls | grep -i "\${BUCKET_NAME}" || echo "Bucket not found in list"

# Check if exact bucket exists
echo "\\n=== Checking Exact Bucket ==="
if aws s3api head-bucket --bucket \${BUCKET_NAME} 2>/dev/null; then
  echo "✓ Bucket \${BUCKET_NAME} exists"
  
  # Get bucket details
  echo "\\n=== Bucket Details ==="
  aws s3api get-bucket-location --bucket \${BUCKET_NAME} --query LocationConstraint --output text
  aws s3api get-bucket-versioning --bucket \${BUCKET_NAME} --query StatusMap --output table
else
  echo "✗ Bucket \${BUCKET_NAME} not found (S3NoSuchBucket)"
  echo "\\nSimilar bucket names:"
  aws s3 ls | grep -i "\${BUCKET_NAME:0:5}" | head -5
fi`,
        },
        {
          language: 'bash',
          title: 'Check S3 Bucket Across Regions',
          code: `#!/bin/bash
BUCKET_NAME="my-bucket"

echo "=== Checking Bucket Across Regions ==="
REGIONS=("us-east-1" "us-west-2" "eu-west-1" "ap-southeast-1")

for REGION in "\${REGIONS[@]}"; do
  echo "\\nChecking region: \${REGION}"
  
  # Try to head bucket in this region
  aws s3api head-bucket \\
    --bucket \${BUCKET_NAME} \\
    --region \${REGION} 2>&1 | head -1
  
  if [ \$? -eq 0 ]; then
    echo "✓ Bucket found in \${REGION}"
    
    # Get bucket location
    LOCATION=\$(aws s3api get-bucket-location \\
      --bucket \${BUCKET_NAME} \\
      --region \${REGION} \\
      --query LocationConstraint \\
      --output text)
    echo "Bucket location: \${LOCATION}"
    break
  else
    echo "✗ Bucket not found in \${REGION}"
  fi
done`,
        },
        {
          language: 'bash',
          title: 'Create S3 Bucket if It Does Not Exist',
          code: `#!/bin/bash
BUCKET_NAME="my-bucket"
REGION="us-east-1"

echo "=== Checking if Bucket Exists ==="
if aws s3api head-bucket --bucket \${BUCKET_NAME} 2>/dev/null; then
  echo "✓ Bucket \${BUCKET_NAME} already exists"
else
  echo "✗ Bucket \${BUCKET_NAME} does not exist"
  echo "\\n=== Creating Bucket ==="
  
  if [ "\${REGION}" = "us-east-1" ]; then
    # us-east-1 doesn't need LocationConstraint
    aws s3api create-bucket \\
      --bucket \${BUCKET_NAME} \\
      --region \${REGION}
  else
    aws s3api create-bucket \\
      --bucket \${BUCKET_NAME} \\
      --region \${REGION} \\
      --create-bucket-configuration LocationConstraint=\${REGION}
  fi
  
  if [ \$? -eq 0 ]; then
    echo "✓ Bucket created successfully"
    echo "\\n=== Verifying Bucket ==="
    aws s3api head-bucket --bucket \${BUCKET_NAME}
  else
    echo "✗ Failed to create bucket"
    echo "Check bucket name (must be globally unique)"
  fi
fi`,
        },
      ],
      relatedCodes: ['NoSuchBucket', 'ResourceNotFoundException'],
      provider: 'aws',
    },
    'LambdaEC2AccessDeniedException': {
      code: 'LambdaEC2AccessDeniedException',
      name: 'Lambda EC2 Access Denied',
      description: `Getting a **LambdaEC2AccessDeniedException** means your Lambda function can't access VPC or EC2 resources—the Lambda execution role lacks EC2 permissions to create/manage network interfaces, or security groups/NACLs are blocking access. This client-side error (4xx) happens when AWS validates Lambda VPC permissions. Most common when Lambda execution role lacks EC2 permissions, but also appears when security group rules are too restrictive, network ACLs block access, route tables are misconfigured, or ENI creation fails.`,
      metaDescription: 'Fix LambdaEC2AccessDeniedException by granting Lambda VPC execution role EC2 permissions, configuring security groups, reviewing NACLs, and verifying route tables with our AWS guide.',
      causes: [
        `Identity: Lambda execution role lacks EC2 permissions (ec2:CreateNetworkInterface, ec2:DescribeNetworkInterfaces, ec2:DeleteNetworkInterface). IAM policy doesn't allow VPC access. Service Control Policy (SCP) restricts EC2 access.`,
        `Network: Security group rules too restrictive. Network ACL blocking access. Route table misconfiguration. VPC endpoint restrictions.`,
        `Limits: Insufficient VPC permissions. ENI creation failure. ENI limit reached. Subnet IP address limit.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check Lambda VPC configuration: aws lambda get-function-configuration --function-name FUNCTION_NAME --query 'VpcConfig' --output json. Verify VPC, subnets, and security groups are configured.`,
        `Step 2: Diagnose - Check Lambda execution role permissions: aws iam get-role-policy --role-name ROLE_NAME --policy-name POLICY_NAME. Verify role has ec2:CreateNetworkInterface, ec2:DescribeNetworkInterfaces, ec2:DeleteNetworkInterface permissions.`,
        `Step 3: Diagnose - Check security group rules: aws ec2 describe-security-groups --group-ids sg-XXXXX --query 'SecurityGroups[0].IpPermissions' --output json. Verify rules allow necessary traffic.`,
        `Step 4: Fix - Attach VPC execution role policy: aws iam attach-role-policy --role-name ROLE_NAME --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole. Or create custom policy with EC2 permissions.`,
        `Step 5: Fix - Configure security groups and NACLs: Update security group rules to allow Lambda traffic. Review network ACL rules. Verify route tables allow necessary traffic. Check ENI limits: aws service-quotas get-service-quota --service-code ec2 --quota-code L-0263D0A3.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check Lambda VPC Configuration and Execution Role',
          code: `#!/bin/bash
FUNCTION_NAME="my-function"

echo "=== Lambda VPC Configuration ==="
aws lambda get-function-configuration \\
  --function-name \${FUNCTION_NAME} \\
  --query 'VpcConfig' \\
  --output json

# Get execution role
EXECUTION_ROLE=\$(aws lambda get-function-configuration \\
  --function-name \${FUNCTION_NAME} \\
  --query 'Role' \\
  --output text | cut -d'/' -f2)

echo "\\n=== Lambda Execution Role ==="
echo "Role: \${EXECUTION_ROLE}"

# Check if role has VPC permissions
echo "\\n=== Checking VPC Permissions ==="
aws iam list-attached-role-policies \\
  --role-name \${EXECUTION_ROLE} \\
  --query 'AttachedPolicies[?PolicyArn==\`arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole\`]' \\
  --output table

if [ \$? -eq 0 ]; then
  echo "✓ VPC execution role policy attached"
else
  echo "✗ VPC execution role policy NOT attached"
  echo "Attach: aws iam attach-role-policy --role-name \${EXECUTION_ROLE} --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
fi`,
        },
        {
          language: 'bash',
          title: 'Attach VPC Execution Role Policy to Lambda',
          code: `#!/bin/bash
FUNCTION_NAME="my-function"

# Get execution role
EXECUTION_ROLE=\$(aws lambda get-function-configuration \\
  --function-name \${FUNCTION_NAME} \\
  --query 'Role' \\
  --output text | cut -d'/' -f2)

echo "=== Attaching VPC Execution Role Policy ==="
echo "Role: \${EXECUTION_ROLE}"

# Attach AWS managed policy
aws iam attach-role-policy \\
  --role-name \${EXECUTION_ROLE} \\
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole

if [ \$? -eq 0 ]; then
  echo "✓ VPC execution role policy attached"
  
  echo "\\n=== Required Permissions ==="
  echo "ec2:CreateNetworkInterface"
  echo "ec2:DescribeNetworkInterfaces"
  echo "ec2:DeleteNetworkInterface"
  echo "ec2:AssignPrivateIpAddresses"
  echo "ec2:UnassignPrivateIpAddresses"
  
  echo "\\n=== Verify Policy ==="
  aws iam list-attached-role-policies \\
    --role-name \${EXECUTION_ROLE} \\
    --output table
else
  echo "✗ Failed to attach policy"
  echo "Check IAM permissions"
fi`,
        },
        {
          language: 'bash',
          title: 'Check Security Groups and Network ACLs',
          code: `#!/bin/bash
FUNCTION_NAME="my-function"

echo "=== Lambda VPC Configuration ==="
VPC_CONFIG=\$(aws lambda get-function-configuration \\
  --function-name \${FUNCTION_NAME} \\
  --query 'VpcConfig' \\
  --output json)

SECURITY_GROUPS=\$(echo \${VPC_CONFIG} | jq -r '.SecurityGroupIds[]' 2>/dev/null)
SUBNETS=\$(echo \${VPC_CONFIG} | jq -r '.SubnetIds[]' 2>/dev/null)

echo "Security Groups: \${SECURITY_GROUPS}"
echo "Subnets: \${SUBNETS}"

# Check security group rules
echo "\\n=== Security Group Rules ==="
for SG in \${SECURITY_GROUPS}; do
  echo "\\nSecurity Group: \${SG}"
  aws ec2 describe-security-groups \\
    --group-ids \${SG} \\
    --query 'SecurityGroups[0].[GroupName,IpPermissions]' \\
    --output json | jq '.'
done

# Check network ACLs
echo "\\n=== Network ACLs ==="
for SUBNET in \${SUBNETS}; do
  echo "\\nSubnet: \${SUBNET}"
  NETWORK_ACL=\$(aws ec2 describe-network-acls \\
    --filters "Name=association.subnet-id,Values=\${SUBNET}" \\
    --query 'NetworkAcls[0].NetworkAclId' \\
    --output text)
  
  if [ ! -z "\${NETWORK_ACL}" ]; then
    echo "Network ACL: \${NETWORK_ACL}"
    aws ec2 describe-network-acls \\
      --network-acl-ids \${NETWORK_ACL} \\
      --query 'NetworkAcls[0].Entries' \\
      --output table | head -10
  fi
done`,
        },
      ],
      relatedCodes: ['AccessDenied', 'InvalidParameterValue'],
      provider: 'aws',
    },
    'DynamoDBTransactionConflictException': {
      code: 'DynamoDBTransactionConflictException',
      name: 'DynamoDB Transaction Conflict',
      description: `Getting a **DynamoDBTransactionConflictException** means your DynamoDB transaction conflicted with another concurrent transaction on the same items—DynamoDB transactions are atomic and cannot be modified while in progress. This client-side error (4xx) happens when AWS detects transaction conflicts. Most common when concurrent transactions operate on the same items, but also appears when transactions are already in progress, optimistic locking fails, or transaction timeouts occur.`,
      metaDescription: 'Fix DynamoDBTransactionConflictException by implementing exponential backoff retries, reducing transaction scope, using conditional expressions, or checking for ongoing transactions with our AWS guide.',
      causes: [
        `Identity: IAM policy allows DynamoDB transactions but conflict occurs. Service Control Policy (SCP) enforces transaction limits.`,
        `Network: VPC endpoint DynamoDB transaction restrictions. Concurrent transaction conflicts.`,
        `Limits: Concurrent transaction on same items. Transaction already in progress. Transaction conflict with another operation. Optimistic locking failure. Transaction timeout.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check if transaction conflict is transient: Retry transaction after short delay. Verify if conflict is due to concurrent operations. Check transaction timeout settings.`,
        `Step 2: Diagnose - Review transaction scope: Check how many items are in transaction. Verify if transaction includes hot partitions. Review transaction complexity.`,
        `Step 3: Diagnose - Check for concurrent transactions: Review application logs for concurrent transaction attempts. Check if multiple processes are accessing same items.`,
        `Step 4: Fix - Implement exponential backoff: Retry with delays: 10ms, 20ms, 40ms, 80ms, 160ms. Add jitter to prevent thundering herd. Max retries: 5-10 attempts.`,
        `Step 5: Fix - Reduce transaction scope or use conditional expressions: Split large transactions into smaller ones. Use conditional expressions to prevent conflicts. Check for ongoing transactions before starting new ones.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Retry DynamoDB Transaction with Exponential Backoff',
          code: `#!/bin/bash
TABLE_NAME="my-table"
MAX_RETRIES=5

echo "=== DynamoDB Transaction with Retry Logic ==="

# Example transaction items (JSON format for AWS CLI)
TRANSACT_ITEMS='[
  {
    "Put": {
      "TableName": "'\${TABLE_NAME}'",
      "Item": {
        "id": {"S": "123"},
        "status": {"S": "active"}
      },
      "ConditionExpression": "attribute_not_exists(id)"
    }
  }
]'

for ATTEMPT in \$(seq 1 \${MAX_RETRIES}); do
  echo "\\nAttempt \${ATTEMPT} of \${MAX_RETRIES}"
  
  # Execute transaction
  aws dynamodb transact-write-items \\
    --transact-items "\${TRANSACT_ITEMS}" 2>&1
  
  if [ \$? -eq 0 ]; then
    echo "✓ Transaction successful"
    break
  else
    if [ \${ATTEMPT} -lt \${MAX_RETRIES} ]; then
      # Exponential backoff: 10ms, 20ms, 40ms, 80ms, 160ms
      DELAY_MS=\$((10 * (2 ** (ATTEMPT - 1))))
      DELAY_SEC=\$(echo "scale=3; \${DELAY_MS} / 1000" | bc)
      echo "✗ Transaction conflict, retrying in \${DELAY_SEC}s..."
      sleep \${DELAY_SEC}
    else
      echo "✗ Transaction failed after \${MAX_RETRIES} attempts"
    fi
  fi
done`,
        },
        {
          language: 'bash',
          title: 'Reduce Transaction Scope to Minimize Conflicts',
          code: `#!/bin/bash
echo "=== Reducing Transaction Scope ==="
echo "\\nProblem: Large transactions increase conflict probability"
echo "Solution: Split into smaller transactions"

echo "\\n=== Example: Split Large Transaction ==="
echo "Instead of one transaction with 10 items:"
echo "- Split into 2 transactions with 5 items each"
echo "- Or use individual operations with conditional expressions"

echo "\\n=== Benefits ==="
echo "1. Reduces conflict probability"
echo "2. Faster execution"
echo "3. Better error handling"
echo "4. More granular retry logic"

echo "\\n=== Use Conditional Expressions ==="
echo "Instead of transactions, use conditional expressions:"
echo "aws dynamodb update-item \\"
echo "  --table-name TABLE_NAME \\"
echo "  --key '{\"id\":{\"S\":\"123\"}}' \\"
echo "  --update-expression 'SET status = :status' \\"
echo "  --condition-expression 'attribute_exists(id)' \\"
echo "  --expression-attribute-values '{\":status\":{\"S\":\"active\"}}'"`,
        },
      ],
      relatedCodes: ['ConditionalCheckFailedException', 'ProvisionedThroughputExceededException'],
      provider: 'aws',
    },
    'LambdaENILimitReachedException': {
      code: 'LambdaENILimitReachedException',
      name: 'Lambda ENI Limit Reached',
      description: `Hitting a **LambdaENILimitReachedException** means your AWS account has reached the maximum number of Elastic Network Interfaces (ENIs) that can be created in the region—this happens when too many Lambda functions are configured to use VPCs, and each concurrent execution creates an ENI. This client-side error (4xx) happens when AWS enforces ENI limits. Most common when too many Lambda functions use VPCs, but also appears when concurrent executions create too many ENIs, ENIs aren't cleaned up properly, or account-level ENI limits are reached.`,
      metaDescription: 'Fix LambdaENILimitReachedException by reducing Lambda functions in VPC, requesting ENI limit increases, using VPC endpoints, or optimizing concurrency settings with our AWS guide.',
      causes: [
        `Identity: IAM policy allows Lambda VPC but ENI limit reached. Service Control Policy (SCP) enforces ENI limits.`,
        `Network: VPC endpoint ENI restrictions. Regional ENI capacity limits.`,
        `Limits: Too many Lambda functions in VPC. ENI limit per region exceeded (default: 250-350 per region). Concurrent executions creating too many ENIs. ENIs not being cleaned up properly. Account-level ENI limit reached.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check current ENI count: aws ec2 describe-network-interfaces --filters "Name=description,Values=*Lambda*" --query 'length(NetworkInterfaces)' --output text. Compare with account limit.`,
        `Step 2: Diagnose - List Lambda functions using VPC: aws lambda list-functions --query 'Functions[?VpcConfig.VpcId!=null].[FunctionName,VpcConfig.VpcId]' --output table. Count how many functions use VPC.`,
        `Step 3: Diagnose - Check ENI limits: aws service-quotas get-service-quota --service-code ec2 --quota-code L-0263D0A3 --query 'Quota.Value' --output text. Verify current limit.`,
        `Step 4: Fix - Request ENI limit increase: aws service-quotas request-service-quota-increase --service-code ec2 --quota-code L-0263D0A3 --desired-value 500. Or reduce Lambda functions in VPC.`,
        `Step 5: Fix - Optimize Lambda VPC usage: Remove VPC configuration from non-critical functions: aws lambda update-function-configuration --function-name FUNCTION_NAME --vpc-config SubnetIds=[],SecurityGroupIds=[]. Use VPC endpoints instead of NAT Gateway. Optimize Lambda concurrency settings.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check Current ENI Count and Lambda Functions in VPC',
          code: `#!/bin/bash
echo "=== Current ENI Count (Lambda) ==="
ENI_COUNT=\$(aws ec2 describe-network-interfaces \\
  --filters "Name=description,Values=*Lambda*" \\
  --query 'length(NetworkInterfaces)' \\
  --output text)

echo "Lambda ENIs: \${ENI_COUNT}"

# Check ENI limit
echo "\\n=== ENI Limit ==="
ENI_LIMIT=\$(aws service-quotas get-service-quota \\
  --service-code ec2 \\
  --quota-code L-0263D0A3 \\
  --query 'Quota.Value' \\
  --output text 2>/dev/null || echo "250")

echo "ENI limit: \${ENI_LIMIT}"
echo "Usage: \${ENI_COUNT} / \${ENI_LIMIT}"

if [ \${ENI_COUNT} -ge \${ENI_LIMIT} ]; then
  echo "✗ ENI limit reached (LambdaENILimitReachedException)"
else
  echo "✓ ENI usage within limit"
fi

# List Lambda functions using VPC
echo "\\n=== Lambda Functions Using VPC ==="
aws lambda list-functions \\
  --query 'Functions[?VpcConfig.VpcId!=null].[FunctionName,VpcConfig.VpcId]' \\
  --output table`,
        },
        {
          language: 'bash',
          title: 'Request ENI Limit Increase',
          code: `#!/bin/bash
echo "=== Requesting ENI Limit Increase ==="
DESIRED_VALUE=500

echo "Current limit: Check with aws service-quotas get-service-quota"
echo "Desired limit: \${DESIRED_VALUE}"

aws service-quotas request-service-quota-increase \\
  --service-code ec2 \\
  --quota-code L-0263D0A3 \\
  --desired-value \${DESIRED_VALUE} \\
  --output json

if [ \$? -eq 0 ]; then
  echo "\\n✓ Limit increase requested"
  echo "Check status: aws service-quotas get-requested-service-quota-change"
  echo "Note: AWS Support may need to approve the request"
else
  echo "\\n✗ Failed to request limit increase"
  echo "Check IAM permissions or contact AWS Support"
fi`,
        },
        {
          language: 'bash',
          title: 'Remove VPC Configuration from Non-Critical Lambda Functions',
          code: `#!/bin/bash
FUNCTION_NAME="my-function"

echo "=== Removing VPC Configuration ==="
echo "Function: \${FUNCTION_NAME}"

# Remove VPC configuration (empty subnets and security groups)
aws lambda update-function-configuration \\
  --function-name \${FUNCTION_NAME} \\
  --vpc-config SubnetIds=[],SecurityGroupIds=[] \\
  --output json

if [ \$? -eq 0 ]; then
  echo "\\n✓ VPC configuration removed"
  echo "Function will no longer create ENIs"
  echo "\\n=== Verify ==="
  aws lambda get-function-configuration \\
    --function-name \${FUNCTION_NAME} \\
    --query 'VpcConfig' \\
    --output json
else
  echo "\\n✗ Failed to remove VPC configuration"
  echo "Check function exists and IAM permissions"
fi`,
        },
      ],
      relatedCodes: ['ServiceQuotaExceededException', 'LimitExceededException'],
      provider: 'aws',
    },
    'DynamoDBValidationException': {
      code: 'DynamoDBValidationException',
      name: 'DynamoDB Validation Exception',
      description: `Getting a **DynamoDBValidationException** means your DynamoDB request input doesn't satisfy DynamoDB constraints—attribute names, types, or expression syntax are invalid. This client-side error (4xx) happens when AWS validates DynamoDB request parameters. Most common when invalid attribute names are used in expressions, but also appears when expression syntax is invalid, attribute types don't match schema, reserved words are used as attribute names, or key schemas are invalid.`,
      metaDescription: 'Fix DynamoDBValidationException by using ExpressionAttributeNames for reserved words, verifying expression syntax, checking attribute types match schema, and validating key schemas with our AWS guide.',
      causes: [
        `Identity: IAM policy allows DynamoDB operations but validation fails. Service Control Policy (SCP) enforces validation rules.`,
        `Network: VPC endpoint DynamoDB validation restrictions. Request format invalid.`,
        `Limits: Invalid attribute name in expression. Invalid expression syntax. Type mismatch in expression. Reserved word used as attribute name. Invalid key schema.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check exact error message: AWS usually specifies which validation failed. Review error message for attribute name or expression. Check expression syntax.`,
        `Step 2: Diagnose - Verify attribute names: Check if using reserved words (status, timestamp, etc.). Verify attribute names match table schema. Check if ExpressionAttributeNames is needed.`,
        `Step 3: Diagnose - Check expression syntax: Verify UpdateExpression syntax (SET, REMOVE, ADD, DELETE). Check ConditionExpression syntax. Verify FilterExpression syntax.`,
        `Step 4: Fix - Use ExpressionAttributeNames for reserved words: Use #status instead of status in expressions. Define in ExpressionAttributeNames: {"#status":"status"}. Use ExpressionAttributeValues for values: {":status":"active"}.`,
        `Step 5: Fix - Verify attribute types match schema: Check table schema: aws dynamodb describe-table --table-name TABLE_NAME --query 'Table.AttributeDefinitions' --output json. Ensure attribute types match (S, N, B, SS, NS, BS).`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Use ExpressionAttributeNames for Reserved Words',
          code: `#!/bin/bash
TABLE_NAME="my-table"
ITEM_KEY='{"id":{"S":"123"}}'

echo "=== DynamoDB Update with ExpressionAttributeNames ==="
echo "Using #status instead of 'status' (reserved word)"

# Update with ExpressionAttributeNames
aws dynamodb update-item \\
  --table-name \${TABLE_NAME} \\
  --key \${ITEM_KEY} \\
  --update-expression "SET #status = :status, #timestamp = :timestamp" \\
  --expression-attribute-names '{
    "#status": "status",
    "#timestamp": "timestamp"
  }' \\
  --expression-attribute-values '{
    ":status": {"S": "active"},
    ":timestamp": {"S": "2024-01-01T00:00:00Z"}
  }' \\
  --return-values ALL_NEW 2>&1

if [ \$? -eq 0 ]; then
  echo "✓ Update successful"
else
  echo "✗ Update failed (DynamoDBValidationException)"
  echo "Check expression syntax and attribute names"
fi`,
        },
        {
          language: 'bash',
          title: 'Check Table Schema for Attribute Types',
          code: `#!/bin/bash
TABLE_NAME="my-table"

echo "=== Table Schema ==="
aws dynamodb describe-table \\
  --table-name \${TABLE_NAME} \\
  --query 'Table.AttributeDefinitions' \\
  --output json

echo "\\n=== Key Schema ==="
aws dynamodb describe-table \\
  --table-name \${TABLE_NAME} \\
  --query 'Table.KeySchema' \\
  --output json

echo "\\n=== Valid Attribute Types ==="
echo "S: String"
echo "N: Number"
echo "B: Binary"
echo "SS: String Set"
echo "NS: Number Set"
echo "BS: Binary Set"

echo "\\n=== Verify Attribute Types Match ==="
echo "When updating items, ensure attribute types match schema"`,
        },
        {
          language: 'bash',
          title: 'Validate UpdateExpression Syntax',
          code: `#!/bin/bash
UPDATE_EXPRESSION="SET #status = :status"

echo "=== Validating UpdateExpression Syntax ==="
echo "Expression: \${UPDATE_EXPRESSION}"

# Check for valid actions: SET, REMOVE, ADD, DELETE
VALID_ACTIONS=("SET" "REMOVE" "ADD" "DELETE")
FIRST_WORD=\$(echo \${UPDATE_EXPRESSION} | cut -d' ' -f1)

if [[ " \${VALID_ACTIONS[@]} " =~ " \${FIRST_WORD} " ]]; then
  echo "✓ Valid action: \${FIRST_WORD}"
else
  echo "✗ Invalid action: \${FIRST_WORD}"
  echo "Valid actions: \${VALID_ACTIONS[*]}"
fi

echo "\\n=== Common Syntax Errors ==="
echo "1. Missing action keyword (SET, REMOVE, ADD, DELETE)"
echo "2. Missing ExpressionAttributeNames for reserved words"
echo "3. Missing ExpressionAttributeValues for placeholders"
echo "4. Invalid attribute type in ExpressionAttributeValues"`,
        },
      ],
      relatedCodes: ['InvalidParameterValue', 'InvalidRequest'],
      provider: 'aws',
    },
    'S3InvalidStorageClass': {
      code: 'S3InvalidStorageClass',
      name: 'S3 Invalid Storage Class',
      description: `Hitting an **S3InvalidStorageClass** error means the S3 storage class you specified is invalid or not supported for the operation—the storage class name might be misspelled, not available in your region, or not supported for the specific operation. This client-side error (4xx) happens when AWS validates S3 storage class names. Most common when storage class names are misspelled, but also appears when storage classes aren't supported in the region, storage class transitions aren't allowed, or unsupported storage classes are used for operations.`,
      metaDescription: 'Fix S3InvalidStorageClass by verifying storage class names, checking regional availability, using supported classes (STANDARD, GLACIER, DEEP_ARCHIVE), and reviewing transition rules with our AWS guide.',
      causes: [
        `Identity: IAM policy allows S3 operations but storage class invalid. Service Control Policy (SCP) enforces storage class restrictions.`,
        `Network: VPC endpoint S3 storage class restrictions. Regional storage class availability.`,
        `Limits: Invalid storage class name. Storage class not supported in region. Storage class typo. Unsupported storage class for operation. Storage class transition not allowed.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check exact error message: AWS usually specifies which storage class is invalid. Review error message for storage class name. Check for typos.`,
        `Step 2: Diagnose - List valid storage classes: Valid classes: STANDARD, STANDARD_IA, ONEZONE_IA, REDUCED_REDUNDANCY, GLACIER, DEEP_ARCHIVE, INTELLIGENT_TIERING. Verify storage class name matches exactly.`,
        `Step 3: Diagnose - Check regional availability: Some storage classes may not be available in all regions. Check AWS documentation for regional availability. Verify storage class is supported in your region.`,
        `Step 4: Fix - Use correct storage class name: Verify spelling: STANDARD (not STANDARD_STORAGE). Use exact name (case-sensitive). Check if storage class is supported for operation.`,
        `Step 5: Fix - Check transition rules: For lifecycle policies, verify transition rules allow storage class. Check if direct upload to storage class is supported. Use appropriate storage class for operation.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Validate S3 Storage Class Names',
          code: `#!/bin/bash
# Valid S3 storage classes
VALID_STORAGE_CLASSES="STANDARD STANDARD_IA ONEZONE_IA REDUCED_REDUNDANCY GLACIER DEEP_ARCHIVE INTELLIGENT_TIERING"

# Validate storage class
validate_storage_class() {
  local class=\$1
  if echo "\${VALID_STORAGE_CLASSES}" | grep -q "\\b\${class}\\b"; then
    echo "✓ Valid storage class: \${class}"
    return 0
  else
    echo "✗ Invalid storage class: \${class}"
    echo "Valid classes: \${VALID_STORAGE_CLASSES}"
    return 1
  fi
}

# Test validation
STORAGE_CLASS="STANDARD_IA"
if validate_storage_class "\${STORAGE_CLASS}"; then
  echo "\\n=== Uploading with Valid Storage Class ==="
  echo "aws s3 cp file.txt s3://my-bucket/file.txt --storage-class \${STORAGE_CLASS}"
else
  echo "\\nFix storage class name before uploading"
fi`,
        },
        {
          language: 'bash',
          title: 'Check Storage Class of Existing Object',
          code: `#!/bin/bash
BUCKET_NAME="my-bucket"
OBJECT_KEY="file.txt"

echo "=== Checking Object Storage Class ==="
STORAGE_CLASS=\$(aws s3api head-object \\
  --bucket \${BUCKET_NAME} \\
  --key \${OBJECT_KEY} \\
  --query 'StorageClass' \\
  --output text 2>/dev/null)

if [ ! -z "\${STORAGE_CLASS}" ]; then
  echo "Storage class: \${STORAGE_CLASS}"
  
  # Check if valid
  VALID_CLASSES=("STANDARD" "STANDARD_IA" "ONEZONE_IA" "REDUCED_REDUNDANCY" "GLACIER" "DEEP_ARCHIVE" "INTELLIGENT_TIERING")
  if [[ " \${VALID_CLASSES[@]} " =~ " \${STORAGE_CLASS} " ]]; then
    echo "✓ Valid storage class"
  else
    echo "✗ Invalid storage class (S3InvalidStorageClass)"
  fi
else
  echo "✗ Object not found or storage class not set"
fi`,
        },
        {
          language: 'bash',
          title: 'List Objects by Storage Class',
          code: `#!/bin/bash
BUCKET_NAME="my-bucket"
STORAGE_CLASS="GLACIER"

echo "=== Listing Objects by Storage Class ==="
echo "Storage class: \${STORAGE_CLASS}"

aws s3api list-objects-v2 \\
  --bucket \${BUCKET_NAME} \\
  --query "Contents[?StorageClass=='\${STORAGE_CLASS}'].[Key,Size,StorageClass]" \\
  --output table

echo "\\n=== All Storage Classes in Bucket ==="
aws s3api list-objects-v2 \\
  --bucket \${BUCKET_NAME} \\
  --query 'Contents[*].StorageClass' \\
  --output text | sort | uniq -c`,
        },
      ],
      relatedCodes: ['InvalidParameterValue', 'InvalidStorageClass'],
      provider: 'aws',
    },
    'LambdaSubnetIPAddressLimitReachedException': {
      code: 'LambdaSubnetIPAddressLimitReachedException',
      name: 'Lambda Subnet IP Address Limit Reached',
      description: `Hitting a **LambdaSubnetIPAddressLimitReachedException** means your Lambda functions have exhausted the available IP addresses in the VPC subnet—each concurrent Lambda execution in a VPC requires an IP address, and the subnet's CIDR block doesn't have enough available. This client-side error (4xx) happens when AWS enforces subnet IP address limits. Most common when subnet CIDR blocks are too small, but also appears when too many concurrent Lambda executions occur, IP addresses aren't released properly, subnets are near capacity, or multiple Lambda functions share the same subnet.`,
      metaDescription: 'Fix LambdaSubnetIPAddressLimitReachedException by increasing subnet CIDR blocks, adding additional subnets, reducing Lambda concurrency, or distributing functions across subnets with our AWS guide.',
      causes: [
        `Identity: IAM policy allows Lambda VPC but subnet IP limit reached. Service Control Policy (SCP) enforces subnet limits.`,
        `Network: Subnet CIDR block too small. VPC subnet capacity exhausted. Regional subnet IP limits.`,
        `Limits: Subnet CIDR block too small. Too many concurrent Lambda executions. IP addresses not released properly. Subnet near capacity. Multiple Lambda functions sharing subnet.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check subnet available IP addresses: aws ec2 describe-subnets --subnet-ids subnet-XXXXX --query 'Subnets[0].[AvailableIpAddressCount,CidrBlock]' --output table. Compare available IPs with Lambda concurrency.`,
        `Step 2: Diagnose - Check Lambda functions using subnet: aws lambda list-functions --query 'Functions[?VpcConfig.SubnetIds!=null].[FunctionName,VpcConfig.SubnetIds]' --output table. Count how many functions use the subnet.`,
        `Step 3: Diagnose - Check subnet utilization: aws ec2 describe-network-interfaces --filters "Name=subnet-id,Values=subnet-XXXXX" --query 'length(NetworkInterfaces)' --output text. Monitor ENI count.`,
        `Step 4: Fix - Add additional subnets to Lambda: aws lambda update-function-configuration --function-name FUNCTION_NAME --vpc-config SubnetIds=subnet-1,subnet-2,SecurityGroupIds=sg-XXXXX. Distribute Lambda functions across multiple subnets.`,
        `Step 5: Fix - Increase subnet CIDR block or reduce concurrency: Create new subnet with larger CIDR: aws ec2 create-subnet --vpc-id vpc-XXXXX --cidr-block 10.0.2.0/24. Or reduce Lambda concurrency limits. Use larger subnet CIDR blocks (/24 or /23).`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check Subnet Available IP Addresses',
          code: `#!/bin/bash
SUBNET_ID="subnet-12345678"

echo "=== Subnet IP Address Information ==="
aws ec2 describe-subnets \\
  --subnet-ids \${SUBNET_ID} \\
  --query 'Subnets[0].[SubnetId,AvailableIpAddressCount,CidrBlock]' \\
  --output table

# Calculate total IPs in CIDR
CIDR=\$(aws ec2 describe-subnets \\
  --subnet-ids \${SUBNET_ID} \\
  --query 'Subnets[0].CidrBlock' \\
  --output text)

echo "\\n=== Subnet Capacity Analysis ==="
echo "CIDR Block: \${CIDR}"
echo "Available IPs: Check output above"

# Check ENI count (each Lambda execution uses one)
echo "\\n=== Network Interfaces in Subnet ==="
ENI_COUNT=\$(aws ec2 describe-network-interfaces \\
  --filters "Name=subnet-id,Values=\${SUBNET_ID}" \\
  --query 'length(NetworkInterfaces)' \\
  --output text)

echo "ENIs in subnet: \${ENI_COUNT}"
echo "Each Lambda execution requires one ENI/IP address"`,
        },
        {
          language: 'bash',
          title: 'Add Additional Subnets to Lambda Function',
          code: `#!/bin/bash
FUNCTION_NAME="my-function"
SUBNET_1="subnet-12345678"
SUBNET_2="subnet-87654321"
SECURITY_GROUP="sg-12345678"

echo "=== Adding Additional Subnets to Lambda ==="
echo "Function: \${FUNCTION_NAME}"
echo "Subnets: \${SUBNET_1}, \${SUBNET_2}"

aws lambda update-function-configuration \\
  --function-name \${FUNCTION_NAME} \\
  --vpc-config SubnetIds=\${SUBNET_1},\${SUBNET_2},SecurityGroupIds=\${SECURITY_GROUP} \\
  --output json

if [ \$? -eq 0 ]; then
  echo "\\n✓ VPC configuration updated"
  echo "Lambda can now use IPs from multiple subnets"
  
  echo "\\n=== Verify Configuration ==="
  aws lambda get-function-configuration \\
    --function-name \${FUNCTION_NAME} \\
    --query 'VpcConfig.SubnetIds' \\
    --output table
else
  echo "\\n✗ Failed to update VPC configuration"
  echo "Check subnet IDs and security group IDs"
fi`,
        },
        {
          language: 'bash',
          title: 'Create New Subnet with Larger CIDR Block',
          code: `#!/bin/bash
VPC_ID="vpc-12345678"
AZ="us-east-1a"
NEW_CIDR="10.0.2.0/24"  # Larger CIDR block

echo "=== Creating New Subnet with Larger CIDR ==="
echo "VPC: \${VPC_ID}"
echo "Availability Zone: \${AZ}"
echo "CIDR Block: \${NEW_CIDR}"

NEW_SUBNET=\$(aws ec2 create-subnet \\
  --vpc-id \${VPC_ID} \\
  --cidr-block \${NEW_CIDR} \\
  --availability-zone \${AZ} \\
  --query 'Subnet.SubnetId' \\
  --output text)

if [ ! -z "\${NEW_SUBNET}" ]; then
  echo "\\n✓ New subnet created: \${NEW_SUBNET}"
  
  echo "\\n=== Subnet Details ==="
  aws ec2 describe-subnets \\
    --subnet-ids \${NEW_SUBNET} \\
    --query 'Subnets[0].[SubnetId,CidrBlock,AvailableIpAddressCount]' \\
    --output table
  
  echo "\\n=== Next Steps ==="
  echo "Add this subnet to Lambda VPC configuration"
  echo "aws lambda update-function-configuration --function-name FUNCTION_NAME --vpc-config SubnetIds=\${NEW_SUBNET},..."
else
  echo "\\n✗ Failed to create subnet"
  echo "Check VPC ID, CIDR block, and availability zone"
fi`,
        },
      ],
      relatedCodes: ['InvalidParameterValue', 'ServiceQuotaExceededException'],
      provider: 'aws',
    },
    'DynamoDBLimitExceededException': {
      code: 'DynamoDBLimitExceededException',
      name: 'DynamoDB Limit Exceeded',
      description: `Getting a **DynamoDBLimitExceededException** means you've exceeded DynamoDB's account-level or operation-level limits—the number of concurrent table requests, tables per account, indexes per table, or concurrent modifications has reached the maximum allowed. This client-side error (4xx) happens when AWS enforces DynamoDB limits. Most common when too many concurrent table operations occur, but also appears when table limits per account are exceeded, index limits per table are reached, concurrent modification limits are hit, or account-level limits are exceeded.`,
      metaDescription: 'Fix DynamoDBLimitExceededException by reducing concurrent operations, requesting limit increases, using batch operations, implementing throttling, or optimizing table/index count with our AWS guide.',
      causes: [
        `Identity: IAM policy allows DynamoDB operations but limit exceeded. Service Control Policy (SCP) enforces DynamoDB limits.`,
        `Network: VPC endpoint DynamoDB operation restrictions. Regional DynamoDB limits.`,
        `Limits: Too many concurrent table operations. Table limit per account exceeded (default: 256 tables). Index limit per table exceeded (20 GSI, 5 LSI). Concurrent modification limit reached. Account-level limits exceeded.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check current table count: aws dynamodb list-tables --query 'length(TableNames)' --output text. Compare with account limit (default: 256 tables).`,
        `Step 2: Diagnose - Check account limits: aws service-quotas get-service-quota --service-code dynamodb --quota-code L-2485A583 --query 'Quota.Value' --output text. Verify table limit. Check index limits per table.`,
        `Step 3: Diagnose - Monitor concurrent operations: Review CloudWatch metrics for DynamoDB throttling. Check if concurrent operations are causing limits.`,
        `Step 4: Fix - Use batch operations: Use batch_writer for writes: aws dynamodb batch-write-item. Use batch_get_item for reads. Reduces concurrent request count.`,
        `Step 5: Fix - Request limit increase or optimize: Request limit increase: aws service-quotas request-service-quota-increase --service-code dynamodb --quota-code L-2485A583 --desired-value 500. Or reduce concurrent operations. Implement request throttling. Optimize table and index count.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check Current DynamoDB Table Count and Limits',
          code: `#!/bin/bash
echo "=== Current Table Count ==="
TABLE_COUNT=\$(aws dynamodb list-tables --query 'length(TableNames)' --output text)
echo "Tables: \${TABLE_COUNT}"

# Check account limit
echo "\\n=== Account Limits ==="
TABLE_LIMIT=\$(aws service-quotas get-service-quota \\
  --service-code dynamodb \\
  --quota-code L-2485A583 \\
  --query 'Quota.Value' \\
  --output text 2>/dev/null || echo "256")

echo "Table limit: \${TABLE_LIMIT}"
echo "Usage: \${TABLE_COUNT} / \${TABLE_LIMIT}"

if [ \${TABLE_COUNT} -ge \${TABLE_LIMIT} ]; then
  echo "✗ Table limit reached (DynamoDBLimitExceededException)"
else
  echo "✓ Table count within limit"
fi

# List all tables
echo "\\n=== All Tables ==="
aws dynamodb list-tables --output table`,
        },
        {
          language: 'bash',
          title: 'Request DynamoDB Limit Increase',
          code: `#!/bin/bash
echo "=== Requesting DynamoDB Limit Increase ==="
DESIRED_VALUE=500

echo "Current limit: Check with aws service-quotas get-service-quota"
echo "Desired limit: \${DESIRED_VALUE}"

# Request table limit increase
aws service-quotas request-service-quota-increase \\
  --service-code dynamodb \\
  --quota-code L-2485A583 \\
  --desired-value \${DESIRED_VALUE} \\
  --output json

if [ \$? -eq 0 ]; then
  echo "\\n✓ Limit increase requested"
  echo "Check status: aws service-quotas get-requested-service-quota-change"
  echo "Note: AWS Support may need to approve the request"
else
  echo "\\n✗ Failed to request limit increase"
  echo "Check IAM permissions or contact AWS Support"
fi`,
        },
        {
          language: 'bash',
          title: 'Use Batch Operations to Reduce Concurrent Requests',
          code: `#!/bin/bash
TABLE_NAME="my-table"

echo "=== Using Batch Operations ==="
echo "Batch operations reduce concurrent request count"
echo "Instead of individual puts/gets, use batch operations"

echo "\\n=== Batch Write Example ==="
echo "aws dynamodb batch-write-item \\"
echo "  --request-items '{"
echo "    \"\${TABLE_NAME}\": ["
echo "      {"
echo "        \"PutRequest\": {"
echo "          \"Item\": {\"id\": {\"S\": \"1\"}, \"value\": {\"S\": \"data1\"}}"
echo "        }"
echo "      },"
echo "      {"
echo "        \"PutRequest\": {"
echo "          \"Item\": {\"id\": {\"S\": \"2\"}, \"value\": {\"S\": \"data2\"}}"
echo "        }"
echo "      }"
echo "    ]"
echo "  }'"

echo "\\n=== Batch Get Example ==="
echo "aws dynamodb batch-get-item \\"
echo "  --request-items '{"
echo "    \"\${TABLE_NAME}\": {"
echo "      \"Keys\": ["
echo "        {\"id\": {\"S\": \"1\"}},"
echo "        {\"id\": {\"S\": \"2\"}}"
echo "      ]"
echo "    }"
echo "  }'"

echo "\\n=== Benefits ==="
echo "1. Reduces concurrent request count"
echo "2. More efficient than individual operations"
echo "3. Helps avoid DynamoDBLimitExceededException"`,
        },
      ],
      relatedCodes: ['LimitExceededException', 'ServiceQuotaExceededException'],
      provider: 'aws',
    },
    'EC2InstanceLimitExceeded': {
      code: 'EC2InstanceLimitExceeded',
      name: 'EC2 Instance Limit Exceeded',
      description: `Hitting an **EC2InstanceLimitExceeded** error means you've reached the maximum number of EC2 instances you can launch in the specified region—this limit applies to the total number of running instances across all instance types. This client-side error (4xx) happens when AWS enforces EC2 instance limits. Most common when account-level instance limits are reached, but also appears when region-specific limits are exceeded, too many instances are running, instance type limits are hit, or VPC instance limits are reached.`,
      metaDescription: 'Fix EC2InstanceLimitExceeded by requesting limit increases, terminating unused instances, using different regions, or optimizing instance usage with our AWS guide.',
      causes: [
        `Identity: IAM policy allows EC2 launch but instance limit reached. Service Control Policy (SCP) enforces instance limits.`,
        `Network: VPC endpoint EC2 instance restrictions. Regional instance capacity limits.`,
        `Limits: Account-level instance limit reached (default: 20 On-Demand instances per region). Region-specific instance limit exceeded. Too many running instances. Instance type limit exceeded. VPC instance limit reached.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check current instance count: aws ec2 describe-instances --filters "Name=instance-state-name,Values=running" --query 'length(Reservations[*].Instances[*])' --output text. Compare with account limit.`,
        `Step 2: Diagnose - Check account limits: aws service-quotas get-service-quota --service-code ec2 --quota-code L-34B43A08 --query 'Quota.Value' --output text. Verify On-Demand instance limit (default: 20 per region).`,
        `Step 3: Diagnose - List instances by type: aws ec2 describe-instances --filters "Name=instance-state-name,Values=running" --query 'Reservations[*].Instances[*].[InstanceType,InstanceId]' --output table. Identify unused instances.`,
        `Step 4: Fix - Request limit increase: aws service-quotas request-service-quota-increase --service-code ec2 --quota-code L-34B43A08 --desired-value 100. Or terminate unused instances: aws ec2 terminate-instances --instance-ids i-XXXXX.`,
        `Step 5: Fix - Use different region or optimize: Launch instances in different region: aws ec2 run-instances --image-id ami-XXXXX --instance-type t3.micro --region us-west-2. Or review and optimize instance usage. Use Spot Instances for flexible capacity.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check Current EC2 Instance Count and Limits',
          code: `#!/bin/bash
echo "=== Current Running Instance Count ==="
INSTANCE_COUNT=\$(aws ec2 describe-instances \\
  --filters "Name=instance-state-name,Values=running" \\
  --query 'length(Reservations[*].Instances[*])' \\
  --output text)

echo "Running instances: \${INSTANCE_COUNT}"

# Check account limit
echo "\\n=== Account Limits ==="
INSTANCE_LIMIT=\$(aws service-quotas get-service-quota \\
  --service-code ec2 \\
  --quota-code L-34B43A08 \\
  --query 'Quota.Value' \\
  --output text 2>/dev/null || echo "20")

echo "Instance limit: \${INSTANCE_LIMIT}"
echo "Usage: \${INSTANCE_COUNT} / \${INSTANCE_LIMIT}"

if [ \${INSTANCE_COUNT} -ge \${INSTANCE_LIMIT} ]; then
  echo "✗ Instance limit reached (EC2InstanceLimitExceeded)"
else
  echo "✓ Instance count within limit"
fi

# List instances by type
echo "\\n=== Instances by Type ==="
aws ec2 describe-instances \\
  --filters "Name=instance-state-name,Values=running" \\
  --query 'Reservations[*].Instances[*].[InstanceType,InstanceId]' \\
  --output table`,
        },
        {
          language: 'bash',
          title: 'Request EC2 Instance Limit Increase',
          code: `#!/bin/bash
echo "=== Requesting EC2 Instance Limit Increase ==="
DESIRED_VALUE=100

echo "Current limit: Check with aws service-quotas get-service-quota"
echo "Desired limit: \${DESIRED_VALUE}"

aws service-quotas request-service-quota-increase \\
  --service-code ec2 \\
  --quota-code L-34B43A08 \\
  --desired-value \${DESIRED_VALUE} \\
  --output json

if [ \$? -eq 0 ]; then
  echo "\\n✓ Limit increase requested"
  echo "Check status: aws service-quotas get-requested-service-quota-change"
  echo "Note: AWS Support may need to approve the request"
else
  echo "\\n✗ Failed to request limit increase"
  echo "Check IAM permissions or contact AWS Support"
fi`,
        },
        {
          language: 'bash',
          title: 'Terminate Unused EC2 Instances',
          code: `#!/bin/bash
echo "=== Finding Unused Instances ==="

# List all running instances
aws ec2 describe-instances \\
  --filters "Name=instance-state-name,Values=running" \\
  --query 'Reservations[*].Instances[*].[InstanceId,InstanceType,LaunchTime,Tags[?Key==\`Name\`].Value|[0]]' \\
  --output table

echo "\\n=== Terminate Instance ==="
echo "To terminate an instance:"
echo "aws ec2 terminate-instances --instance-ids i-1234567890abcdef0"

echo "\\n=== Warning ==="
echo "Terminating instances will:"
echo "1. Stop the instance immediately"
echo "2. Delete all data on instance store volumes"
echo "3. Release the instance"
echo "4. Free up instance quota"

echo "\\n=== Verify Before Terminating ==="
echo "Check instance details:"
echo "aws ec2 describe-instances --instance-ids i-XXXXX"`,
        },
      ],
      relatedCodes: ['LimitExceededException', 'ServiceQuotaExceededException'],
      provider: 'aws',
    },
    'EC2InsufficientInstanceCapacity': {
      code: 'EC2InsufficientInstanceCapacity',
      name: 'EC2 Insufficient Instance Capacity',
      description: `Getting an **EC2InsufficientInstanceCapacity** error means AWS doesn't have enough available capacity in the Availability Zone you requested to fulfill your instance launch—this is a temporary capacity issue, not a quota limit. This server-side error (5xx) happens when AWS validates instance capacity availability. Most common when Availability Zone capacity is exhausted, but also appears when requested instance types are unavailable, high demand occurs in the region, Spot instance capacity is insufficient, or dedicated host capacity is unavailable.`,
      metaDescription: 'Resolve EC2InsufficientInstanceCapacity by trying different Availability Zones, requesting different instance types, using Spot Instances, or waiting and retrying with our AWS guide.',
      causes: [
        `Identity: IAM service capacity issue. Service Control Policy (SCP) service capacity constraints. Account-level capacity restrictions.`,
        `Network: VPC endpoint EC2 capacity restrictions. Regional capacity constraints. Availability Zone capacity exhausted.`,
        `Limits: Availability Zone capacity exhausted. Requested instance type unavailable. High demand in the region. Spot instance capacity insufficient. Dedicated host capacity unavailable.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check which Availability Zone failed: Review error message for specific AZ. Verify if issue is AZ-specific or region-wide.`,
        `Step 2: Diagnose - Check available instance types in AZ: aws ec2 describe-instance-type-offerings --location-type availability-zone --filters "Name=location,Values=us-east-1a" --query 'InstanceTypeOfferings[*].InstanceType' --output table. Verify if instance type is available.`,
        `Step 3: Diagnose - Try different Availability Zone: Launch in different AZ: aws ec2 run-instances --image-id ami-XXXXX --instance-type t3.medium --placement AvailabilityZone=us-east-1b. Or try different instance type.`,
        `Step 4: Fix - Try different Availability Zones: Loop through AZs: for az in us-east-1a us-east-1b us-east-1c; do aws ec2 run-instances --availability-zone \$az ...; done. Or request different instance type.`,
        `Step 5: Fix - Use Spot Instances or wait: Use Spot Instances for flexible capacity: aws ec2 request-spot-instances --spot-price "0.05" --instance-count 1. Or wait and retry. Use On-Demand Capacity Reservations for guaranteed capacity.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Try Launching in Different Availability Zones',
          code: `#!/bin/bash
AMI_ID="ami-12345678"
INSTANCE_TYPE="t3.medium"
KEY_NAME="my-key-pair"

AVAILABILITY_ZONES=("us-east-1a" "us-east-1b" "us-east-1c" "us-east-1d")

echo "=== Trying Different Availability Zones ==="
for ZONE in "\${AVAILABILITY_ZONES[@]}"; do
  echo "\\nTrying Availability Zone: \${ZONE}"
  
  aws ec2 run-instances \\
    --image-id \${AMI_ID} \\
    --instance-type \${INSTANCE_TYPE} \\
    --placement AvailabilityZone=\${ZONE} \\
    --key-name \${KEY_NAME} \\
    --count 1 2>&1
  
  if [ \$? -eq 0 ]; then
    echo "✓ Successfully launched in \${ZONE}"
    break
  else
    echo "✗ Failed in \${ZONE} (EC2InsufficientInstanceCapacity)"
    echo "Trying next Availability Zone..."
  fi
done`,
        },
        {
          language: 'bash',
          title: 'Check Available Instance Types in Availability Zone',
          code: `#!/bin/bash
AZ="us-east-1a"

echo "=== Available Instance Types in \${AZ} ==="
aws ec2 describe-instance-type-offerings \\
  --location-type availability-zone \\
  --filters "Name=location,Values=\${AZ}" \\
  --query 'InstanceTypeOfferings[*].InstanceType' \\
  --output table

echo "\\n=== Check Specific Instance Type ==="
INSTANCE_TYPE="t3.medium"
OFFERING=\$(aws ec2 describe-instance-type-offerings \\
  --location-type availability-zone \\
  --filters "Name=location,Values=\${AZ}" "Name=instance-type,Values=\${INSTANCE_TYPE}" \\
  --query 'InstanceTypeOfferings[0].InstanceType' \\
  --output text)

if [ ! -z "\${OFFERING}" ]; then
  echo "✓ \${INSTANCE_TYPE} available in \${AZ}"
else
  echo "✗ \${INSTANCE_TYPE} not available in \${AZ}"
  echo "Try different instance type or Availability Zone"
fi`,
        },
        {
          language: 'bash',
          title: 'Use Spot Instances for Flexible Capacity',
          code: `#!/bin/bash
echo "=== Requesting Spot Instances ==="
echo "Spot Instances provide flexible capacity when On-Demand is unavailable"

# Create launch specification
cat > launch-spec.json <<EOF
{
  "ImageId": "ami-12345678",
  "InstanceType": "t3.medium",
  "KeyName": "my-key-pair",
  "SecurityGroupIds": ["sg-12345678"],
  "SubnetId": "subnet-12345678"
}
EOF

echo "\\n=== Request Spot Instance ==="
aws ec2 request-spot-instances \\
  --spot-price "0.05" \\
  --instance-count 1 \\
  --type "one-time" \\
  --launch-specification file://launch-spec.json \\
  --output json

echo "\\n=== Benefits of Spot Instances ==="
echo "1. Lower cost (up to 90% discount)"
echo "2. Flexible capacity when On-Demand unavailable"
echo "3. Good for fault-tolerant workloads"
echo "4. Can be interrupted with 2-minute notice"`,
        },
      ],
      relatedCodes: ['InsufficientCapacityException', 'ServiceUnavailable'],
      provider: 'aws',
    },
    'EC2InvalidAMIIDNotFound': {
      code: 'EC2InvalidAMIIDNotFound',
      name: 'EC2 Invalid AMI ID Not Found',
      description: `Getting an **EC2InvalidAMIIDNotFound** error means the AMI (Amazon Machine Image) ID you specified doesn't exist or isn't available in the current region—the AMI might have been deregistered, is in a different region, or isn't shared with your account. This client-side error (4xx) happens when AWS validates AMI existence. Most common when AMI IDs are incorrect, but also appears when AMIs are in different regions, AMIs have been deregistered, AMI ID formats are incorrect, or AMIs aren't shared with your account.`,
      metaDescription: 'Fix EC2InvalidAMIIDNotFound by verifying AMI IDs, checking regional availability, listing available AMIs, verifying sharing permissions, or using correct AMI formats with our AWS guide.',
      causes: [
        `Identity: IAM policy allows EC2 launch but AMI doesn't exist. Service Control Policy (SCP) restricts AMI access.`,
        `Network: VPC endpoint AMI restrictions. Cross-region AMI access.`,
        `Limits: AMI ID does not exist. AMI in different region. AMI has been deregistered. Incorrect AMI ID format. AMI not shared with your account.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check AMI exists in current region: aws ec2 describe-images --image-ids ami-XXXXX --region REGION --query 'Images[0].[ImageId,Name,State]' --output table. Verify AMI exists and is available.`,
        `Step 2: Diagnose - List available AMIs: aws ec2 describe-images --owners amazon --filters "Name=name,Values=*amazon-linux*" --query 'Images[*].[ImageId,Name,CreationDate]' --output table. Find correct AMI ID.`,
        `Step 3: Diagnose - Check AMI across regions: Loop through regions: for region in us-east-1 us-west-2; do aws ec2 describe-images --image-ids ami-XXXXX --region \$region; done. Verify if AMI exists in different region.`,
        `Step 4: Fix - Use correct AMI ID: Verify AMI ID from list. Check for typos. Use exact AMI ID (case-sensitive). Verify AMI format: ami-xxxxxxxxxxxxxxxxx.`,
        `Step 5: Fix - Copy AMI to current region or verify sharing: If AMI is in different region, copy it: aws ec2 copy-image --source-region SOURCE_REGION --source-image-id ami-XXXXX --name "copied-ami". Or verify AMI sharing permissions: aws ec2 describe-image-attribute --image-id ami-XXXXX --attribute launchPermission.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Verify AMI Exists in Current Region',
          code: `#!/bin/bash
AMI_ID="ami-12345678"
REGION="us-east-1"

echo "=== Checking AMI in Region: \${REGION} ==="
AMI_INFO=\$(aws ec2 describe-images \\
  --image-ids \${AMI_ID} \\
  --region \${REGION} \\
  --query 'Images[0].[ImageId,Name,State,Platform]' \\
  --output table 2>&1)

if [ \$? -eq 0 ]; then
  echo "✓ AMI exists in \${REGION}"
  echo "\${AMI_INFO}"
else
  echo "✗ AMI not found in \${REGION} (EC2InvalidAMIIDNotFound)"
  echo "Error: \${AMI_INFO}"
  
  echo "\\n=== Searching for Similar AMIs ==="
  aws ec2 describe-images \\
    --owners amazon \\
    --filters "Name=name,Values=*amazon-linux*" \\
    --region \${REGION} \\
    --query 'Images[*].[ImageId,Name,CreationDate]' \\
    --output table | head -10
fi`,
        },
        {
          language: 'bash',
          title: 'Check AMI Across Different Regions',
          code: `#!/bin/bash
AMI_ID="ami-12345678"
REGIONS=("us-east-1" "us-west-2" "eu-west-1" "ap-southeast-1")

echo "=== Checking AMI Across Regions ==="
for REGION in "\${REGIONS[@]}"; do
  echo "\\nChecking region: \${REGION}"
  
  RESULT=\$(aws ec2 describe-images \\
    --image-ids \${AMI_ID} \\
    --region \${REGION} \\
    --query 'Images[0].ImageId' \\
    --output text 2>/dev/null)
  
  if [ ! -z "\${RESULT}" ] && [ "\${RESULT}" != "None" ]; then
    echo "✓ AMI found in \${REGION}: \${RESULT}"
    
    # Get AMI details
    aws ec2 describe-images \\
      --image-ids \${AMI_ID} \\
      --region \${REGION} \\
      --query 'Images[0].[ImageId,Name,State]' \\
      --output table
    break
  else
    echo "✗ AMI not found in \${REGION}"
  fi
done`,
        },
        {
          language: 'bash',
          title: 'List Available AMIs and Copy AMI to Current Region',
          code: `#!/bin/bash
REGION="us-east-1"

echo "=== Available AMIs (Amazon Linux) ==="
aws ec2 describe-images \\
  --owners amazon \\
  --filters "Name=name,Values=amzn2-ami-hvm-*" "Name=architecture,Values=x86_64" \\
  --region \${REGION} \\
  --query 'Images | sort_by(@, &CreationDate) | [-1].[ImageId,Name,CreationDate]' \\
  --output table

echo "\\n=== Your Own AMIs ==="
aws ec2 describe-images \\
  --owners self \\
  --region \${REGION} \\
  --query 'Images[*].[ImageId,Name,State]' \\
  --output table

echo "\\n=== Copy AMI from Different Region ==="
SOURCE_REGION="us-west-2"
SOURCE_AMI="ami-12345678"
NEW_AMI_NAME="copied-ami-\$(date +%s)"

echo "Copying AMI from \${SOURCE_REGION}..."
aws ec2 copy-image \\
  --source-region \${SOURCE_REGION} \\
  --source-image-id \${SOURCE_AMI} \\
  --name \${NEW_AMI_NAME} \\
  --region \${REGION} \\
  --output json

if [ \$? -eq 0 ]; then
  echo "\\n✓ AMI copy initiated"
  echo "Check status: aws ec2 describe-images --image-ids NEW_AMI_ID --region \${REGION}"
else
  echo "\\n✗ Failed to copy AMI"
  echo "Check AMI sharing permissions and IAM permissions"
fi`,
        },
      ],
      relatedCodes: ['InvalidParameterValue', 'ResourceNotFoundException'],
      provider: 'aws',
    },
    'EC2InvalidInstanceIDNotFound': {
      code: 'EC2InvalidInstanceIDNotFound',
      name: 'EC2 Invalid Instance ID Not Found',
      description: `Getting an **EC2InvalidInstanceIDNotFound** error means the EC2 instance ID you specified doesn't exist or has been terminated—the instance might be in a different region, was deleted, or the ID is misspelled. This client-side error (4xx) happens when AWS validates EC2 instance existence. Most common when instance IDs are incorrect, but also appears when instances have been terminated, instances are in different regions, instance ID formats are incorrect, or instance ID typos occur.`,
      metaDescription: 'Fix EC2InvalidInstanceIDNotFound by verifying instance IDs, listing all instances to find correct IDs, checking correct regions, and verifying instances exist with our AWS guide.',
      causes: [
        `Identity: IAM policy allows EC2 access but instance doesn't exist. Service Control Policy (SCP) restricts instance access.`,
        `Network: VPC endpoint EC2 instance restrictions. Cross-region instance access.`,
        `Limits: Instance ID does not exist. Instance has been terminated. Instance in different region. Incorrect instance ID format. Instance ID typo.`,
      ],
      solutions: [
        `Step 1: Diagnose - List all EC2 instances: aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,State.Name,InstanceType]' --output table. Check if instance ID is in the list.`,
        `Step 2: Diagnose - Check instance in specific region: aws ec2 describe-instances --instance-ids i-XXXXX --region REGION --query 'Reservations[0].Instances[0].[InstanceId,State.Name]' --output table. Verify region is correct.`,
        `Step 3: Diagnose - Search for similar instance IDs: List instances and search: aws ec2 describe-instances --query 'Reservations[*].Instances[*].InstanceId' --output text | grep PARTIAL_ID. Find correct instance ID.`,
        `Step 4: Fix - Use correct instance ID: Verify instance ID from list. Check for typos. Use exact instance ID (case-sensitive). Verify instance ID format: i-xxxxxxxxxxxxxxxxx.`,
        `Step 5: Fix - Check if instance was terminated: Review instance state: aws ec2 describe-instances --instance-ids i-XXXXX --query 'Reservations[0].Instances[0].State.Name' --output text. If terminated, instance no longer exists. Check CloudTrail logs for termination events.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'List All EC2 Instances to Find Correct ID',
          code: `#!/bin/bash
echo "=== All EC2 Instances ==="
aws ec2 describe-instances \\
  --query 'Reservations[*].Instances[*].[InstanceId,State.Name,InstanceType,Tags[?Key==\`Name\`].Value|[0]]' \\
  --output table

# Search for specific instance
INSTANCE_ID="i-1234567890abcdef0"
echo "\\n=== Searching for Instance: \${INSTANCE_ID} ==="

if aws ec2 describe-instances --instance-ids \${INSTANCE_ID} &>/dev/null; then
  echo "✓ Instance exists"
  
  # Get instance details
  echo "\\n=== Instance Details ==="
  aws ec2 describe-instances \\
    --instance-ids \${INSTANCE_ID} \\
    --query 'Reservations[0].Instances[0].[InstanceId,State.Name,InstanceType,LaunchTime]' \\
    --output table
else
  echo "✗ Instance not found (EC2InvalidInstanceIDNotFound)"
  
  echo "\\n=== Similar Instance IDs ==="
  aws ec2 describe-instances \\
    --query "Reservations[*].Instances[?contains(InstanceId, 'i-123')].[InstanceId,State.Name]" \\
    --output table
fi`,
        },
        {
          language: 'bash',
          title: 'Check EC2 Instance Across Regions',
          code: `#!/bin/bash
INSTANCE_ID="i-1234567890abcdef0"
REGIONS=("us-east-1" "us-west-2" "eu-west-1" "ap-southeast-1")

echo "=== Checking Instance Across Regions ==="
for REGION in "\${REGIONS[@]}"; do
  echo "\\nChecking region: \${REGION}"
  
  RESULT=\$(aws ec2 describe-instances \\
    --instance-ids \${INSTANCE_ID} \\
    --region \${REGION} \\
    --query 'Reservations[0].Instances[0].InstanceId' \\
    --output text 2>/dev/null)
  
  if [ ! -z "\${RESULT}" ] && [ "\${RESULT}" != "None" ]; then
    echo "✓ Instance found in \${REGION}: \${RESULT}"
    
    # Get instance details
    aws ec2 describe-instances \\
      --instance-ids \${INSTANCE_ID} \\
      --region \${REGION} \\
      --query 'Reservations[0].Instances[0].[InstanceId,State.Name,InstanceType]' \\
      --output table
    break
  else
    echo "✗ Instance not found in \${REGION}"
  fi
done`,
        },
        {
          language: 'bash',
          title: 'Check Instance State and Termination Status',
          code: `#!/bin/bash
INSTANCE_ID="i-1234567890abcdef0"

echo "=== Checking Instance State ==="
INSTANCE_STATE=\$(aws ec2 describe-instances \\
  --instance-ids \${INSTANCE_ID} \\
  --query 'Reservations[0].Instances[0].State.Name' \\
  --output text 2>&1)

if [ \$? -eq 0 ] && [ ! -z "\${INSTANCE_STATE}" ]; then
  echo "Instance state: \${INSTANCE_STATE}"
  
  if [ "\${INSTANCE_STATE}" = "terminated" ]; then
    echo "✗ Instance has been terminated"
    echo "Terminated instances no longer exist (EC2InvalidInstanceIDNotFound)"
  elif [ "\${INSTANCE_STATE}" = "running" ] || [ "\${INSTANCE_STATE}" = "stopped" ]; then
    echo "✓ Instance exists and is \${INSTANCE_STATE}"
  else
    echo "Instance state: \${INSTANCE_STATE}"
  fi
else
  echo "✗ Instance not found (EC2InvalidInstanceIDNotFound)"
  echo "Error: \${INSTANCE_STATE}"
  
  echo "\\n=== Check CloudTrail for Termination Events ==="
  echo "aws cloudtrail lookup-events \\"
  echo "  --lookup-attributes AttributeKey=EventName,AttributeValue=TerminateInstances"
fi`,
        },
      ],
      relatedCodes: ['ResourceNotFoundException', 'InvalidParameterValue'],
      provider: 'aws',
    },
    'EC2UnsupportedOperation': {
      code: 'EC2UnsupportedOperation',
      name: 'EC2 Unsupported Operation',
      description: `Getting an **EC2UnsupportedOperation** error means the EC2 operation you're trying to perform isn't supported for the specified resource or instance type—the operation might not be available for the current instance configuration, instance state, or instance type. This client-side error (4xx) happens when AWS validates operation compatibility. Most common when operations aren't supported for instance types, but also appears when instance states don't allow operations, features aren't available for instances, instance configurations are incompatible, or operations require different instance types.`,
      metaDescription: 'Fix EC2UnsupportedOperation by checking instance type support, verifying instance state allows operations, reviewing capabilities, or using supported instance types with our AWS guide.',
      causes: [
        `Identity: IAM policy allows EC2 operation but operation unsupported. Service Control Policy (SCP) restricts operation types.`,
        `Network: VPC endpoint EC2 operation restrictions. Operation not available for instance configuration.`,
        `Limits: Operation not supported for instance type. Instance state does not allow operation. Feature not available for instance. Incompatible instance configuration. Operation requires different instance type.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check exact error message: AWS usually specifies which operation is unsupported. Review error message for operation name. Check instance type.`,
        `Step 2: Diagnose - Check instance type capabilities: aws ec2 describe-instance-types --instance-types INSTANCE_TYPE --query 'InstanceTypes[0].[InstanceType,SupportedVirtualizationTypes,SupportedRootDeviceTypes]' --output table. Verify if operation is supported.`,
        `Step 3: Diagnose - Check instance state: aws ec2 describe-instances --instance-ids i-XXXXX --query 'Reservations[0].Instances[0].State.Name' --output text. Verify instance state allows operation. Some operations require running state.`,
        `Step 4: Fix - Use supported instance type: Check instance type supports operation: aws ec2 describe-instance-attribute --instance-id i-XXXXX --attribute ebsOptimized. Or use different instance type that supports the operation.`,
        `Step 5: Fix - Verify operation compatibility: Review EC2 operation documentation. Check if operation requires specific instance state. Verify instance configuration is compatible. Use supported instance type for operation.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check Instance Type Capabilities',
          code: `#!/bin/bash
INSTANCE_TYPE="t3.micro"

echo "=== Instance Type Capabilities ==="
aws ec2 describe-instance-types \\
  --instance-types \${INSTANCE_TYPE} \\
  --query 'InstanceTypes[0].[InstanceType,SupportedVirtualizationTypes,SupportedRootDeviceTypes,EbsInfo.EbsOptimizedSupport]' \\
  --output table

echo "\\n=== Check EBS Optimization Support ==="
INSTANCE_ID="i-1234567890abcdef0"
EBS_OPT=\$(aws ec2 describe-instance-attribute \\
  --instance-id \${INSTANCE_ID} \\
  --attribute ebsOptimized \\
  --query 'EbsOptimized.Value' \\
  --output text 2>/dev/null)

if [ ! -z "\${EBS_OPT}" ]; then
  echo "EBS Optimization: \${EBS_OPT}"
  if [ "\${EBS_OPT}" = "false" ]; then
    echo "⚠ Instance does not support EBS optimization"
    echo "Some operations may not be supported"
  fi
else
  echo "✗ Cannot check EBS optimization (instance may not exist)"
fi`,
        },
        {
          language: 'bash',
          title: 'Check Instance State Before Operation',
          code: `#!/bin/bash
INSTANCE_ID="i-1234567890abcdef0"

echo "=== Checking Instance State ==="
INSTANCE_STATE=\$(aws ec2 describe-instances \\
  --instance-ids \${INSTANCE_ID} \\
  --query 'Reservations[0].Instances[0].State.Name' \\
  --output text 2>&1)

if [ \$? -eq 0 ] && [ ! -z "\${INSTANCE_STATE}" ]; then
  echo "Instance state: \${INSTANCE_STATE}"
  
  if [ "\${INSTANCE_STATE}" != "running" ]; then
    echo "✗ Instance is not running (current state: \${INSTANCE_STATE})"
    echo "Many operations require instance to be in 'running' state"
    echo "Operation may not be supported in this state (EC2UnsupportedOperation)"
  else
    echo "✓ Instance is running"
    echo "Most operations should be supported"
  fi
else
  echo "✗ Cannot check instance state"
  echo "Error: \${INSTANCE_STATE}"
fi`,
        },
        {
          language: 'bash',
          title: 'Verify Operation Compatibility with Instance Type',
          code: `#!/bin/bash
INSTANCE_TYPE="t3.micro"

echo "=== Checking Instance Type Support ==="
echo "Instance type: \${INSTANCE_TYPE}"

# Check if instance type is available
OFFERING=\$(aws ec2 describe-instance-type-offerings \\
  --location-type availability-zone \\
  --filters "Name=instance-type,Values=\${INSTANCE_TYPE}" \\
  --query 'InstanceTypeOfferings[0].InstanceType' \\
  --output text)

if [ ! -z "\${OFFERING}" ]; then
  echo "✓ Instance type \${INSTANCE_TYPE} is available"
  
  echo "\\n=== Instance Type Details ==="
  aws ec2 describe-instance-types \\
    --instance-types \${INSTANCE_TYPE} \\
    --query 'InstanceTypes[0].[InstanceType,ProcessorInfo.SupportedArchitectures,NetworkInfo.NetworkPerformance]' \\
    --output table
else
  echo "✗ Instance type \${INSTANCE_TYPE} may not be available"
  echo "Some operations may not be supported (EC2UnsupportedOperation)"
fi

echo "\\n=== Common Unsupported Operations ==="
echo "1. EBS optimization on non-supported instance types"
echo "2. Enhanced networking on older instance types"
echo "3. GPU operations on non-GPU instance types"
echo "4. Nitro operations on non-Nitro instances"`,
        },
      ],
      relatedCodes: ['InvalidParameterValue', 'InvalidRequest'],
      provider: 'aws',
    },
    'IAMEntityAlreadyExists': {
      code: 'IAMEntityAlreadyExists',
      name: 'IAM Entity Already Exists',
      description: `Hitting an **IAMEntityAlreadyExists** error means the IAM entity (user, group, role, or policy) you're trying to create already exists in your AWS account—IAM entity names must be unique within your account, so you can't create duplicates. This client-side error (4xx) happens when AWS validates IAM entity name uniqueness. Most common when user names already exist, but also appears when role names, group names, or policy names already exist, or duplicate entity creation attempts occur.`,
      metaDescription: 'Fix IAMEntityAlreadyExists by using different entity names, checking if entities exist, deleting unused entities, or using unique naming conventions with our AWS guide.',
      causes: [
        `Identity: IAM entity name already exists in account. Service Control Policy (SCP) enforces entity naming.`,
        `Network: VPC endpoint IAM entity restrictions. Entity name collision.`,
        `Limits: User name already exists. Role name already exists. Group name already exists. Policy name already exists. Duplicate entity creation attempt.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check if IAM user exists: aws iam get-user --user-name USER_NAME. If exists, user already created. Or list all users: aws iam list-users --query 'Users[*].UserName' --output table.`,
        `Step 2: Diagnose - Check if IAM role exists: aws iam get-role --role-name ROLE_NAME. If exists, role already created. Or list all roles: aws iam list-roles --query 'Roles[*].RoleName' --output table.`,
        `Step 3: Diagnose - Check if IAM policy exists: aws iam list-policies --scope Local --query "Policies[?PolicyName=='POLICY_NAME'].PolicyName" --output text. Verify if policy exists.`,
        `Step 4: Fix - Use different entity name: Generate unique name: ENTITY_NAME="my-entity-\$(date +%s)". Or add random suffix. Verify name is unique.`,
        `Step 5: Fix - Delete existing entity if not needed: Delete user: aws iam delete-user --user-name USER_NAME. Delete role: aws iam delete-role --role-name ROLE_NAME. Or use existing entity.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check if IAM User Exists Before Creating',
          code: `#!/bin/bash
USER_NAME="my-user"

echo "=== Checking if IAM User Exists ==="
if aws iam get-user --user-name \${USER_NAME} &>/dev/null; then
  echo "✗ User \${USER_NAME} already exists (IAMEntityAlreadyExists)"
  
  # Get user details
  echo "\\n=== User Details ==="
  aws iam get-user --user-name \${USER_NAME} \\
    --query 'User.[UserName,UserId,CreateDate]' \\
    --output table
else
  echo "✓ User \${USER_NAME} does not exist"
  echo "\\n=== Creating New User ==="
  aws iam create-user --user-name \${USER_NAME} \\
    --query 'User.[UserName,UserId]' \\
    --output table
fi

# List all IAM users
echo "\\n=== All IAM Users ==="
aws iam list-users --query 'Users[*].UserName' --output table`,
        },
        {
          language: 'bash',
          title: 'Check if IAM Role Exists and Create with Unique Name',
          code: `#!/bin/bash
ROLE_NAME="my-role"

echo "=== Checking if IAM Role Exists ==="
if aws iam get-role --role-name \${ROLE_NAME} &>/dev/null; then
  echo "✗ Role \${ROLE_NAME} already exists (IAMEntityAlreadyExists)"
  
  echo "\\n=== Role Details ==="
  aws iam get-role --role-name \${ROLE_NAME} \\
    --query 'Role.[RoleName,RoleId,CreateDate]' \\
    --output table
else
  echo "✓ Role \${ROLE_NAME} does not exist"
  
  echo "\\n=== Creating Role with Unique Name ==="
  TIMESTAMP=\$(date +%s)
  UNIQUE_ROLE="\${ROLE_NAME}-\${TIMESTAMP}"
  
  echo "Unique role name: \${UNIQUE_ROLE}"
  
  # Create role (assuming trust policy exists)
  echo "aws iam create-role \\"
  echo "  --role-name \${UNIQUE_ROLE} \\"
  echo "  --assume-role-policy-document file://trust-policy.json"
fi

# List all IAM roles
echo "\\n=== All IAM Roles ==="
aws iam list-roles --query 'Roles[*].RoleName' --output table | head -10`,
        },
        {
          language: 'bash',
          title: 'Check if IAM Policy Exists',
          code: `#!/bin/bash
POLICY_NAME="my-policy"

echo "=== Checking if IAM Policy Exists ==="
POLICY_EXISTS=\$(aws iam list-policies \\
  --scope Local \\
  --query "Policies[?PolicyName=='\${POLICY_NAME}'].PolicyName" \\
  --output text)

if [ ! -z "\${POLICY_EXISTS}" ]; then
  echo "✗ Policy \${POLICY_NAME} already exists (IAMEntityAlreadyExists)"
  
  echo "\\n=== Policy Details ==="
  aws iam list-policies \\
    --scope Local \\
    --query "Policies[?PolicyName=='\${POLICY_NAME}'].[PolicyName,PolicyId,CreateDate]" \\
    --output table
else
  echo "✓ Policy \${POLICY_NAME} does not exist"
  echo "You can create it"
fi

# List all IAM policies
echo "\\n=== All IAM Policies (Local) ==="
aws iam list-policies --scope Local \\
  --query 'Policies[*].PolicyName' \\
  --output table | head -10`,
        },
      ],
      relatedCodes: ['EntityAlreadyExists', 'Duplicate'],
      provider: 'aws',
    },
    'IAMInvalidUserIDNotFound': {
      code: 'IAMInvalidUserIDNotFound',
      name: 'IAM Invalid User ID Not Found',
      description: `Getting an **IAMInvalidUserIDNotFound** error means the IAM user you specified doesn't exist—the user might have been deleted, the name is misspelled, or it's in a different AWS account. This client-side error (4xx) happens when AWS validates IAM user existence. Most common when user names are misspelled, but also appears when users don't exist, users have been deleted, incorrect user name formats are used, or users are in different AWS accounts.`,
      metaDescription: 'Fix IAMInvalidUserIDNotFound by verifying user names, listing all users to find correct names, checking if users were deleted, or verifying user existence with our AWS guide.',
      causes: [
        `Identity: IAM user doesn't exist in account. Service Control Policy (SCP) restricts user access.`,
        `Network: VPC endpoint IAM user restrictions. Cross-account user access.`,
        `Limits: User name misspelled. User does not exist. User has been deleted. Incorrect user name format. User in different AWS account.`,
      ],
      solutions: [
        `Step 1: Diagnose - List all IAM users: aws iam list-users --query 'Users[*].[UserName,UserId]' --output table. Check if user name is in the list. Verify user name spelling.`,
        `Step 2: Diagnose - Search for similar user names: aws iam list-users --query "Users[?contains(UserName, 'PARTIAL_NAME')].UserName" --output table. Find correct user name.`,
        `Step 3: Diagnose - Check if user was deleted: Review CloudTrail logs: aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=DeleteUser. Or check user details: aws iam get-user --user-name USER_NAME.`,
        `Step 4: Fix - Use correct user name: Verify user name from list. Check for typos. Use exact user name (case-sensitive). Verify user name format.`,
        `Step 5: Fix - Create user if needed: If user doesn't exist, create it: aws iam create-user --user-name USER_NAME. Or verify user exists in your account: aws iam get-user --user-name USER_NAME.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'List All IAM Users to Find Correct Name',
          code: `#!/bin/bash
echo "=== All IAM Users ==="
aws iam list-users \\
  --query 'Users[*].[UserName,UserId,CreateDate]' \\
  --output table

# Search for specific user
USER_NAME="my-user"
echo "\\n=== Searching for User: \${USER_NAME} ==="

if aws iam get-user --user-name \${USER_NAME} &>/dev/null; then
  echo "✓ User \${USER_NAME} exists"
  
  # Get user details
  echo "\\n=== User Details ==="
  aws iam get-user --user-name \${USER_NAME} \\
    --query 'User.[UserName,UserId,CreateDate,Arn]' \\
    --output table
else
  echo "✗ User \${USER_NAME} not found (IAMInvalidUserIDNotFound)"
  
  echo "\\n=== Similar User Names ==="
  aws iam list-users \\
    --query "Users[?contains(UserName, 'my')].[UserName,UserId]" \\
    --output table
fi`,
        },
        {
          language: 'bash',
          title: 'Check User Access Keys and Groups',
          code: `#!/bin/bash
USER_NAME="my-user"

echo "=== Checking User Access Keys ==="
aws iam list-access-keys --user-name \${USER_NAME} \\
  --query 'AccessKeyMetadata[*].[AccessKeyId,Status,CreateDate]' \\
  --output table 2>&1

if [ \$? -ne 0 ]; then
  echo "✗ User \${USER_NAME} not found (IAMInvalidUserIDNotFound)"
else
  echo "\\n=== User Groups ==="
  aws iam get-groups-for-user --user-name \${USER_NAME} \\
    --query 'Groups[*].GroupName' \\
    --output table
  
  echo "\\n=== User Attached Policies ==="
  aws iam list-attached-user-policies --user-name \${USER_NAME} \\
    --query 'AttachedPolicies[*].PolicyName' \\
    --output table
fi`,
        },
        {
          language: 'bash',
          title: 'Check CloudTrail for User Deletion Events',
          code: `#!/bin/bash
USER_NAME="my-user"

echo "=== Checking CloudTrail for User Deletion ==="
aws cloudtrail lookup-events \\
  --lookup-attributes AttributeKey=EventName,AttributeValue=DeleteUser \\
  --max-results 10 \\
  --query 'Events[*].[EventTime,CloudTrailEvent]' \\
  --output text | while read time event; do
    DELETED_USER=\$(echo "\${event}" | jq -r '.requestParameters.userName' 2>/dev/null)
    if [ "\${DELETED_USER}" = "\${USER_NAME}" ]; then
      echo "Found deletion event for \${USER_NAME} at \${time}"
    fi
  done 2>/dev/null || echo "Cannot check CloudTrail (IAMInvalidUserIDNotFound - user may not exist)"

echo "\\n=== Alternative: Check User Directly ==="
aws iam get-user --user-name \${USER_NAME} 2>&1 | head -3`,
        },
      ],
      relatedCodes: ['NoSuchEntity', 'ResourceNotFoundException'],
      provider: 'aws',
    },
    'IAMMalformedPolicyDocument': {
      code: 'IAMMalformedPolicyDocument',
      name: 'IAM Malformed Policy Document',
      description: `Getting an **IAMMalformedPolicyDocument** error means your IAM policy document is malformed or invalid—the JSON syntax might be wrong, required policy elements are missing, or the policy statement structure doesn't follow IAM policy language syntax. This client-side error (4xx) happens when AWS validates IAM policy documents. Most common when JSON syntax is invalid, but also appears when required policy elements are missing, policy statement structures are invalid, action or resource values are malformed, or policy document encoding issues occur.`,
      metaDescription: 'Fix IAMMalformedPolicyDocument by validating JSON syntax, checking policy structure, verifying required fields, using IAM Policy Simulator, or reviewing policy syntax with our AWS guide.',
      causes: [
        `Identity: IAM policy document format invalid. Service Control Policy (SCP) enforces policy validation.`,
        `Network: VPC endpoint IAM policy restrictions. Policy document encoding issues.`,
        `Limits: Invalid JSON syntax. Missing required policy elements (Version, Statement). Invalid policy statement structure. Malformed action or resource values. Policy document encoding issues.`,
      ],
      solutions: [
        `Step 1: Diagnose - Validate JSON syntax: echo POLICY_JSON | jq '.'. Verify JSON is valid. Check for syntax errors. Verify JSON structure.`,
        `Step 2: Diagnose - Check required policy elements: Verify Version field exists: "Version": "2012-10-17". Check Statement field exists. Verify Statement is an array.`,
        `Step 3: Diagnose - Check policy statement structure: Verify each statement has Effect (Allow/Deny). Check Action field exists. Verify Resource field exists.`,
        `Step 4: Fix - Validate JSON before use: Use jq to validate: echo POLICY_JSON | jq '.' > /dev/null. Fix JSON syntax errors. Ensure proper UTF-8 encoding.`,
        `Step 5: Fix - Use IAM Policy Simulator: Test policy: aws iam simulate-principal-policy --policy-source-arn arn:aws:iam::ACCOUNT:user/USER --action-names s3:GetObject --resource-arns arn:aws:s3:::bucket/*. Or review IAM policy language syntax documentation.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Validate IAM Policy JSON Syntax',
          code: `#!/bin/bash
POLICY_FILE="policy.json"

echo "=== Validating IAM Policy JSON ==="

# Check if file exists
if [ ! -f \${POLICY_FILE} ]; then
  echo "✗ Policy file not found: \${POLICY_FILE}"
  exit 1
fi

# Validate JSON syntax with jq
if command -v jq &> /dev/null; then
  echo "\\n=== Validating JSON Syntax ==="
  jq '.' \${POLICY_FILE} > /dev/null 2>&1
  
  if [ \$? -eq 0 ]; then
    echo "✓ JSON syntax valid"
  else
    echo "✗ Invalid JSON syntax (IAMMalformedPolicyDocument)"
    echo "Errors:"
    jq '.' \${POLICY_FILE} 2>&1 | head -5
    exit 1
  fi
else
  echo "jq not installed - cannot validate JSON"
  echo "Install: sudo apt-get install jq (Linux) or brew install jq (macOS)"
fi

# Check required policy elements
echo "\\n=== Checking Required Policy Elements ==="
if grep -q '"Version"' \${POLICY_FILE}; then
  echo "✓ Version field present"
else
  echo "✗ Missing Version field"
  exit 1
fi

if grep -q '"Statement"' \${POLICY_FILE}; then
  echo "✓ Statement field present"
else
  echo "✗ Missing Statement field"
  exit 1
fi

echo "\\n✓ Policy structure valid"`,
        },
        {
          language: 'bash',
          title: 'Check Policy Statement Structure',
          code: `#!/bin/bash
POLICY_FILE="policy.json"

echo "=== Validating Policy Statement Structure ==="

# Use jq to check structure
if command -v jq &> /dev/null; then
  # Check Version
  VERSION=\$(jq -r '.Version' \${POLICY_FILE} 2>/dev/null)
  if [ "\${VERSION}" != "null" ] && [ ! -z "\${VERSION}" ]; then
    echo "✓ Version: \${VERSION}"
  else
    echo "✗ Missing or invalid Version field"
  fi
  
  # Check Statement array
  STATEMENT_COUNT=\$(jq '.Statement | length' \${POLICY_FILE} 2>/dev/null)
  if [ "\${STATEMENT_COUNT}" -gt 0 ] 2>/dev/null; then
    echo "✓ Statement count: \${STATEMENT_COUNT}"
    
    # Check each statement
    for i in \$(seq 0 \$((STATEMENT_COUNT - 1))); do
      echo "\\n=== Statement \${i} ==="
      EFFECT=\$(jq -r ".Statement[\${i}].Effect" \${POLICY_FILE} 2>/dev/null)
      ACTION=\$(jq -r ".Statement[\${i}].Action" \${POLICY_FILE} 2>/dev/null)
      RESOURCE=\$(jq -r ".Statement[\${i}].Resource" \${POLICY_FILE} 2>/dev/null)
      
      if [ "\${EFFECT}" != "null" ]; then
        echo "Effect: \${EFFECT}"
      else
        echo "✗ Missing Effect field"
      fi
      
      if [ "\${ACTION}" != "null" ]; then
        echo "Action: \${ACTION}"
      else
        echo "✗ Missing Action field"
      fi
      
      if [ "\${RESOURCE}" != "null" ]; then
        echo "Resource: \${RESOURCE}"
      else
        echo "⚠ Resource field may be optional (for some actions)"
      fi
    done
  else
    echo "✗ Missing or empty Statement array"
  fi
else
  echo "jq not installed - install to validate policy structure"
fi`,
        },
        {
          language: 'bash',
          title: 'Create Valid IAM Policy Document',
          code: `#!/bin/bash
POLICY_FILE="policy.json"

echo "=== Creating Valid IAM Policy Document ==="

# Create example valid policy
cat > \${POLICY_FILE} <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-bucket/*"
    }
  ]
}
EOF

echo "Policy document created: \${POLICY_FILE}"

# Validate the policy
if command -v jq &> /dev/null; then
  echo "\\n=== Validating Policy ==="
  jq '.' \${POLICY_FILE} > /dev/null 2>&1
  
  if [ \$? -eq 0 ]; then
    echo "✓ Policy JSON is valid"
    
    echo "\\n=== Policy Structure ==="
    jq '.' \${POLICY_FILE}
    
    echo "\\n=== Test Policy with IAM Policy Simulator ==="
    echo "aws iam simulate-principal-policy \\"
    echo "  --policy-source-arn arn:aws:iam::ACCOUNT:user/test-user \\"
    echo "  --action-names s3:GetObject \\"
    echo "  --resource-arns arn:aws:s3:::my-bucket/*"
    
    echo "\\n=== Create Policy ==="
    echo "aws iam create-policy \\"
    echo "  --policy-name my-policy \\"
    echo "  --policy-document file://\${POLICY_FILE}"
  else
    echo "✗ Policy validation failed"
  fi
else
  echo "jq not installed - cannot validate"
fi`,
        },
      ],
      relatedCodes: ['InvalidParameterValue', 'ValidationException'],
      provider: 'aws',
    },
    'IAMPolicyNotAttachable': {
      code: 'IAMPolicyNotAttachable',
      name: 'IAM Policy Not Attachable',
      description: `Hitting an **IAMPolicyNotAttachable** error means the IAM policy you're trying to attach cannot be attached to the entity—some AWS managed policies aren't attachable, or the policy type is incompatible with the entity type (user, role, or group). This client-side error (4xx) happens when AWS validates policy attachment compatibility. Most common when AWS managed policies aren't attachable, but also appears when policy types are incompatible with entities, policy attachment restrictions exist, service-linked policy limitations occur, or policies aren't designed for attachment.`,
      metaDescription: 'Fix IAMPolicyNotAttachable by using attachable policy versions, creating customer managed policies, checking attachment permissions, or verifying policy compatibility with our AWS guide.',
      causes: [
        `Identity: IAM policy attachment restrictions. Service Control Policy (SCP) enforces policy attachment rules.`,
        `Network: VPC endpoint IAM policy attachment restrictions. Policy type incompatible with entity.`,
        `Limits: AWS managed policy not attachable. Policy type incompatible with entity. Policy attachment restrictions. Service-linked policy limitations. Policy not designed for attachment.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check if policy is attachable: aws iam get-policy --policy-arn POLICY_ARN --query 'Policy.[PolicyName,IsAttachable,AttachmentCount]' --output table. Verify IsAttachable is true.`,
        `Step 2: Diagnose - List attachable managed policies: aws iam list-policies --scope AWS --query 'Policies[?IsAttachable==\`true\`].[PolicyName,Arn]' --output table. Find attachable alternatives.`,
        `Step 3: Diagnose - Check policy type: Verify if policy is AWS managed, customer managed, or service-linked. Service-linked policies have restrictions.`,
        `Step 4: Fix - Create customer managed policy: Customer managed policies are always attachable: aws iam create-policy --policy-name POLICY_NAME --policy-document file://policy.json. Then attach: aws iam attach-user-policy --user-name USER_NAME --policy-arn POLICY_ARN.`,
        `Step 5: Fix - Use attachable policy version: Check policy versions: aws iam list-policy-versions --policy-arn POLICY_ARN. Use attachable version. Or review policy attachment documentation for restrictions.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check if IAM Policy is Attachable',
          code: `#!/bin/bash
POLICY_ARN="arn:aws:iam::aws:policy/ReadOnlyAccess"

echo "=== Checking Policy Attachability ==="
POLICY_INFO=\$(aws iam get-policy \\
  --policy-arn \${POLICY_ARN} \\
  --query 'Policy.[PolicyName,IsAttachable,AttachmentCount]' \\
  --output table 2>&1)

if [ \$? -eq 0 ]; then
  echo "\${POLICY_INFO}"
  
  IS_ATTACHABLE=\$(aws iam get-policy \\
    --policy-arn \${POLICY_ARN} \\
    --query 'Policy.IsAttachable' \\
    --output text)
  
  if [ "\${IS_ATTACHABLE}" = "true" ]; then
    echo "\\n✓ Policy is attachable"
  else
    echo "\\n✗ Policy is not attachable (IAMPolicyNotAttachable)"
    echo "Create a customer managed policy instead"
  fi
else
  echo "✗ Policy not found or error: \${POLICY_INFO}"
fi`,
        },
        {
          language: 'bash',
          title: 'List Attachable AWS Managed Policies',
          code: `#!/bin/bash
echo "=== Attachable AWS Managed Policies ==="
aws iam list-policies \\
  --scope AWS \\
  --query 'Policies[?IsAttachable==\`true\`].[PolicyName,Arn]' \\
  --output table | head -20

echo "\\n=== Count of Attachable Policies ==="
ATTACHABLE_COUNT=\$(aws iam list-policies \\
  --scope AWS \\
  --query 'length(Policies[?IsAttachable==\`true\`])' \\
  --output text)

echo "Attachable policies: \${ATTACHABLE_COUNT}"

echo "\\n=== Non-Attachable Policies ==="
NON_ATTACHABLE_COUNT=\$(aws iam list-policies \\
  --scope AWS \\
  --query 'length(Policies[?IsAttachable==\`false\`])' \\
  --output text)

echo "Non-attachable policies: \${NON_ATTACHABLE_COUNT}"
echo "These cannot be attached (IAMPolicyNotAttachable)"`,
        },
        {
          language: 'bash',
          title: 'Create Customer Managed Policy (Always Attachable)',
          code: `#!/bin/bash
POLICY_NAME="my-custom-policy"
POLICY_FILE="custom-policy.json"

echo "=== Creating Customer Managed Policy ==="

# Create policy document
cat > \${POLICY_FILE} <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "*"
    }
  ]
}
EOF

echo "Policy document created: \${POLICY_FILE}"

# Create policy
POLICY_ARN=\$(aws iam create-policy \\
  --policy-name \${POLICY_NAME} \\
  --policy-document file://\${POLICY_FILE} \\
  --query 'Policy.Arn' \\
  --output text 2>&1)

if [ \$? -eq 0 ] && [ ! -z "\${POLICY_ARN}" ]; then
  echo "\\n✓ Policy created: \${POLICY_ARN}"
  echo "Customer managed policies are always attachable"
  
  echo "\\n=== Attach Policy to User ==="
  USER_NAME="my-user"
  echo "aws iam attach-user-policy \\"
  echo "  --user-name \${USER_NAME} \\"
  echo "  --policy-arn \${POLICY_ARN}"
else
  echo "\\n✗ Failed to create policy"
  echo "Error: \${POLICY_ARN}"
fi`,
        },
      ],
      relatedCodes: ['InvalidParameterValue', 'InvalidRequest'],
      provider: 'aws',
    },
    'IAMLimitExceeded': {
      code: 'IAMLimitExceeded',
      name: 'IAM Limit Exceeded',
      description: `Hitting an **IAMLimitExceeded** error means you've exceeded the maximum number of IAM entities allowed in your AWS account—IAM enforces limits on users (5000), groups (300), roles (5000), and customer managed policies (1500) per account. This client-side error (4xx) happens when AWS validates IAM entity limits. Most common when too many IAM users exist, but also appears when too many groups, roles, or policies are created, or account-level IAM limits are reached.`,
      metaDescription: 'Fix IAMLimitExceeded by deleting unused entities, requesting limit increases, consolidating users into groups, using roles instead of users, or optimizing IAM structure with our AWS guide.',
      causes: [
        `Identity: IAM account limits reached. Service Control Policy (SCP) enforces IAM limits.`,
        `Network: VPC endpoint IAM entity restrictions. Account-level IAM limits.`,
        `Limits: Too many IAM users (limit: 5000 per account). Too many IAM groups (limit: 300 per account). Too many IAM roles (limit: 5000 per account). Too many IAM policies (limit: 1500 customer managed per account). Account-level IAM limit reached.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check current IAM entity counts: aws iam list-users --query 'length(Users)' --output text. Check groups: aws iam list-groups --query 'length(Groups)' --output text. Check roles: aws iam list-roles --query 'length(Roles)' --output text. Check policies: aws iam list-policies --scope Local --query 'length(Policies)' --output text.`,
        `Step 2: Diagnose - Find unused IAM users: List users with no access keys: aws iam list-users --query 'Users[*].UserName' --output text | while read user; do aws iam list-access-keys --user-name \$user --query 'length(AccessKeyMetadata)' --output text; done. Identify users to delete.`,
        `Step 3: Diagnose - Check IAM limits: Default limits: Users (5000), Groups (300), Roles (5000), Policies (1500). Compare current counts with limits.`,
        `Step 4: Fix - Delete unused IAM entities: Delete user: aws iam delete-user --user-name USER_NAME. Or consolidate users into groups: aws iam add-user-to-group --user-name USER_NAME --group-name GROUP_NAME.`,
        `Step 5: Fix - Request limit increase or optimize: Contact AWS Support for limit increase. Or use roles instead of users where possible. Review and optimize IAM structure.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check Current IAM Entity Counts and Limits',
          code: `#!/bin/bash
echo "=== Current IAM Entity Counts ==="
USER_COUNT=\$(aws iam list-users --query 'length(Users)' --output text)
GROUP_COUNT=\$(aws iam list-groups --query 'length(Groups)' --output text)
ROLE_COUNT=\$(aws iam list-roles --query 'length(Roles)' --output text)
POLICY_COUNT=\$(aws iam list-policies --scope Local --query 'length(Policies)' --output text)

echo "Users: \${USER_COUNT} / 5000"
echo "Groups: \${GROUP_COUNT} / 300"
echo "Roles: \${ROLE_COUNT} / 5000"
echo "Policies: \${POLICY_COUNT} / 1500"

echo "\\n=== IAM Account Limits ==="
echo "Users: 5000 per account"
echo "Groups: 300 per account"
echo "Roles: 5000 per account"
echo "Policies: 1500 customer managed per account"

# Check if any limit is reached
if [ \${USER_COUNT} -ge 5000 ] || [ \${GROUP_COUNT} -ge 300 ] || [ \${ROLE_COUNT} -ge 5000 ] || [ \${POLICY_COUNT} -ge 1500 ]; then
  echo "\\n✗ IAM limit reached (IAMLimitExceeded)"
else
  echo "\\n✓ All counts within limits"
fi`,
        },
        {
          language: 'bash',
          title: 'Find Unused IAM Users',
          code: `#!/bin/bash
echo "=== Finding Unused IAM Users ==="
echo "Users with no access keys:"

aws iam list-users --query 'Users[*].UserName' --output text | while read USER; do
  KEY_COUNT=\$(aws iam list-access-keys \\
    --user-name \${USER} \\
    --query 'length(AccessKeyMetadata)' \\
    --output text 2>/dev/null || echo "0")
  
  if [ "\${KEY_COUNT}" = "0" ]; then
    echo "  ✗ \${USER} - No access keys"
    
    # Check if user has console login
    LOGIN_PROFILE=\$(aws iam get-login-profile --user-name \${USER} 2>/dev/null)
    if [ \$? -ne 0 ]; then
      echo "    No console login - candidate for deletion"
    fi
  fi
done

echo "\\n=== Delete Unused User ==="
echo "aws iam delete-user --user-name unused-user"`,
        },
        {
          language: 'bash',
          title: 'Consolidate Users into Groups',
          code: `#!/bin/bash
echo "=== Consolidating Users into Groups ==="
echo "This reduces the need for individual user policies"

USER_NAME="my-user"
GROUP_NAME="my-group"

# Check if group exists
if aws iam get-group --group-name \${GROUP_NAME} &>/dev/null; then
  echo "Group \${GROUP_NAME} exists"
else
  echo "Creating group: \${GROUP_NAME}"
  aws iam create-group --group-name \${GROUP_NAME}
fi

# Add user to group
echo "\\n=== Adding User to Group ==="
aws iam add-user-to-group \\
  --user-name \${USER_NAME} \\
  --group-name \${GROUP_NAME}

if [ \$? -eq 0 ]; then
  echo "✓ User \${USER_NAME} added to group \${GROUP_NAME}"
  echo "\\nBenefits:"
  echo "1. Reduces individual user management"
  echo "2. Policies attached to group apply to all members"
  echo "3. Helps avoid IAMLimitExceeded"
else
  echo "✗ Failed to add user to group"
fi`,
        },
      ],
      relatedCodes: ['LimitExceededException', 'ServiceQuotaExceededException'],
      provider: 'aws',
    },
    'CloudFrontInvalidArgument': {
      code: 'CloudFrontInvalidArgument',
      name: 'CloudFront Invalid Argument',
      description: `Getting a **CloudFrontInvalidArgument** error means one or more arguments in your CloudFront request are invalid—required parameters might be missing, values don't meet CloudFront requirements, or the distribution configuration is malformed. This client-side error (4xx) happens when AWS validates CloudFront request parameters. Most common when distribution configurations are invalid, but also appears when origin settings are wrong, cache behavior settings are invalid, certificate ARNs are malformed, or parameter formats are incorrect.`,
      metaDescription: 'Fix CloudFrontInvalidArgument by validating distribution configurations, checking origin domain names, verifying certificate ARN formats, reviewing cache behavior settings, or validating parameter values with our AWS guide.',
      causes: [
        `Identity: IAM policy allows CloudFront but invalid arguments. Service Control Policy (SCP) enforces CloudFront validation.`,
        `Network: VPC endpoint CloudFront restrictions. Invalid distribution configuration.`,
        `Limits: Invalid distribution configuration. Invalid origin settings. Invalid cache behavior settings. Invalid certificate ARN. Invalid parameter format.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check exact error message: AWS usually specifies which argument is invalid. Review error message for parameter name. Check for typos.`,
        `Step 2: Diagnose - Validate distribution configuration JSON: Use jq to validate: jq '.' dist-config.json. Check required fields: CallerReference, Origins, DefaultCacheBehavior.`,
        `Step 3: Diagnose - Check origin domain names: Verify domain format: echo DOMAIN | grep -E '^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\\.[a-zA-Z]{2,}$'. Test DNS resolution: nslookup DOMAIN.`,
        `Step 4: Fix - Validate certificate ARN format: Verify ARN format: arn:aws:acm:REGION:ACCOUNT:certificate/CERT_ID. Check certificate exists: aws acm describe-certificate --certificate-arn ARN.`,
        `Step 5: Fix - Review cache behavior settings: Verify AllowedMethods, ViewerProtocolPolicy, TargetOriginId. Check cache behavior structure matches CloudFront requirements. Validate all parameter values.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Validate CloudFront Distribution Configuration JSON',
          code: `#!/bin/bash
CONFIG_FILE="dist-config.json"

echo "=== Validating CloudFront Distribution Config ==="

# Check if file exists
if [ ! -f \${CONFIG_FILE} ]; then
  echo "✗ Config file not found: \${CONFIG_FILE}"
  exit 1
fi

# Validate JSON syntax
if command -v jq &> /dev/null; then
  echo "\\n=== Validating JSON Syntax ==="
  jq '.' \${CONFIG_FILE} > /dev/null 2>&1
  
  if [ \$? -eq 0 ]; then
    echo "✓ JSON syntax valid"
  else
    echo "✗ Invalid JSON syntax (CloudFrontInvalidArgument)"
    jq '.' \${CONFIG_FILE} 2>&1 | head -5
    exit 1
  fi
else
  echo "jq not installed - cannot validate JSON"
fi

# Check required fields
echo "\\n=== Checking Required Fields ==="
if grep -q '"CallerReference"' \${CONFIG_FILE}; then
  echo "✓ CallerReference present"
else
  echo "✗ Missing CallerReference"
fi

if grep -q '"Origins"' \${CONFIG_FILE}; then
  echo "✓ Origins present"
else
  echo "✗ Missing Origins"
fi

if grep -q '"DefaultCacheBehavior"' \${CONFIG_FILE}; then
  echo "✓ DefaultCacheBehavior present"
else
  echo "✗ Missing DefaultCacheBehavior"
fi

echo "\\n=== Valid Configuration ==="
echo "Ready to create distribution"`,
        },
        {
          language: 'bash',
          title: 'Validate Origin Domain Names',
          code: `#!/bin/bash
ORIGIN_DOMAIN="example.com"

echo "=== Validating Origin Domain ==="
echo "Domain: \${ORIGIN_DOMAIN}"

# Check domain format
if [[ ! \${ORIGIN_DOMAIN} =~ ^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\\.[a-zA-Z]{2,}\$ ]]; then
  echo "✗ Invalid domain format (CloudFrontInvalidArgument)"
  exit 1
else
  echo "✓ Domain format valid"
fi

# Check DNS resolution
echo "\\n=== Checking DNS Resolution ==="
if nslookup \${ORIGIN_DOMAIN} &>/dev/null; then
  echo "✓ Domain resolves"
else
  echo "✗ Domain does not resolve"
  echo "CloudFront requires accessible origins"
fi

# Test HTTPS connectivity
echo "\\n=== Testing Origin Connectivity ==="
if curl -I https://\${ORIGIN_DOMAIN} &>/dev/null 2>&1; then
  echo "✓ HTTPS accessible"
elif curl -I http://\${ORIGIN_DOMAIN} &>/dev/null 2>&1; then
  echo "⚠ HTTP accessible (HTTPS recommended)"
else
  echo "✗ Origin not accessible"
fi`,
        },
        {
          language: 'bash',
          title: 'Verify Certificate ARN Format',
          code: `#!/bin/bash
CERT_ARN="arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012"

echo "=== Validating Certificate ARN ==="
echo "ARN: \${CERT_ARN}"

# Check ARN format
if [[ \${CERT_ARN} =~ ^arn:aws:acm:[a-z0-9-]+:[0-9]+:certificate/[a-zA-Z0-9-]+\$ ]]; then
  echo "✓ ARN format valid"
  
  # Extract region and certificate ID
  REGION=\$(echo \${CERT_ARN} | cut -d: -f4)
  CERT_ID=\$(echo \${CERT_ARN} | cut -d/ -f2)
  
  echo "Region: \${REGION}"
  echo "Certificate ID: \${CERT_ID}"
  
  # Verify certificate exists
  echo "\\n=== Verifying Certificate Exists ==="
  CERT_INFO=\$(aws acm describe-certificate \\
    --certificate-arn \${CERT_ARN} \\
    --region \${REGION} \\
    --query 'Certificate.Status' \\
    --output text 2>&1)
  
  if [ \$? -eq 0 ]; then
    echo "✓ Certificate exists: \${CERT_INFO}"
  else
    echo "✗ Certificate not found (CloudFrontInvalidArgument)"
    echo "Error: \${CERT_INFO}"
  fi
else
  echo "✗ Invalid ARN format (CloudFrontInvalidArgument)"
  echo "Expected format: arn:aws:acm:REGION:ACCOUNT:certificate/CERT_ID"
fi`,
        },
      ],
      relatedCodes: ['InvalidParameterValue', 'ValidationException'],
      provider: 'aws',
    },
    'CloudFrontDistributionAlreadyExists': {
      code: 'CloudFrontDistributionAlreadyExists',
      name: 'CloudFront Distribution Already Exists',
      description: `Getting a **CloudFrontDistributionAlreadyExists** error means a CloudFront distribution with the specified caller reference already exists—each distribution must have a unique caller reference, so you can't reuse the same reference. This client-side error (4xx) happens when AWS validates caller reference uniqueness. Most common when duplicate caller references are used, but also appears when distributions were already created, previous creation succeeded, caller reference collisions occur, or distributions exist with the same reference.`,
      metaDescription: 'Fix CloudFrontDistributionAlreadyExists by using unique caller references, generating new references, checking existing distributions, using timestamp-based references, or verifying distribution status with our AWS guide.',
      causes: [
        `Identity: IAM policy allows CloudFront but duplicate caller reference. Service Control Policy (SCP) enforces caller reference uniqueness.`,
        `Network: VPC endpoint CloudFront restrictions. Caller reference collision.`,
        `Limits: Duplicate caller reference. Distribution already created. Previous creation succeeded. Caller reference collision. Distribution exists with same reference.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check existing distributions: aws cloudfront list-distributions --query 'DistributionList.Items[*].[Id,Status,Comment]' --output table. Verify if distribution with caller reference exists.`,
        `Step 2: Diagnose - Search for caller reference: aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='CALLER_REF'].Id" --output text. Check if reference is already used.`,
        `Step 3: Diagnose - Generate unique caller reference: Use timestamp and UUID: CALLER_REF="\$(date +%s)-\$(uuidgen | tr -d '-' | cut -c1-8)". Or use unique identifier.`,
        `Step 4: Fix - Use unique caller reference: Generate new caller reference. Verify it's not in use. Use timestamp-based reference for uniqueness.`,
        `Step 5: Fix - Check distribution status: If distribution exists, verify status: aws cloudfront get-distribution --id DIST_ID --query 'Distribution.Status' --output text. Or use existing distribution if appropriate.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Generate Unique Caller Reference',
          code: `#!/bin/bash
echo "=== Generating Unique Caller Reference ==="

# Generate timestamp-based caller reference
CALLER_REF="\$(date +%s)-\$(uuidgen | tr -d '-' | cut -c1-8)"
echo "Caller Reference: \${CALLER_REF}"

# Alternative: Use timestamp only
TIMESTAMP_REF="dist-\$(date +%s)"
echo "Timestamp Reference: \${TIMESTAMP_REF}"

echo "\\n=== Checking if Reference Already Exists ==="
EXISTING=\$(aws cloudfront list-distributions \\
  --query "DistributionList.Items[?Comment=='\${CALLER_REF}'].Id" \\
  --output text 2>/dev/null)

if [ ! -z "\${EXISTING}" ]; then
  echo "✗ Caller reference already exists (CloudFrontDistributionAlreadyExists)"
  echo "Distribution ID: \${EXISTING}"
  echo "Generate a new caller reference"
else
  echo "✓ Caller reference is unique"
  echo "Safe to use: \${CALLER_REF}"
fi`,
        },
        {
          language: 'bash',
          title: 'List All CloudFront Distributions',
          code: `#!/bin/bash
echo "=== All CloudFront Distributions ==="
aws cloudfront list-distributions \\
  --query 'DistributionList.Items[*].[Id,Status,DomainName,Comment]' \\
  --output table

echo "\\n=== Distribution Count ==="
DIST_COUNT=\$(aws cloudfront list-distributions \\
  --query 'DistributionList.Quantity' \\
  --output text)

echo "Total distributions: \${DIST_COUNT}"

echo "\\n=== Search for Specific Caller Reference ==="
CALLER_REF="your-caller-reference"
MATCHING=\$(aws cloudfront list-distributions \\
  --query "DistributionList.Items[?Comment=='\${CALLER_REF}'].[Id,Status]" \\
  --output table)

if [ ! -z "\${MATCHING}" ]; then
  echo "Found distribution with caller reference:"
  echo "\${MATCHING}"
  echo "\\n✗ Cannot create duplicate (CloudFrontDistributionAlreadyExists)"
else
  echo "No distribution found with caller reference: \${CALLER_REF}"
  echo "✓ Safe to create new distribution"
fi`,
        },
        {
          language: 'bash',
          title: 'Create Distribution with Unique Caller Reference',
          code: `#!/bin/bash
echo "=== Creating CloudFront Distribution ==="

# Generate unique caller reference
CALLER_REF="dist-\$(date +%s)-\$(uuidgen | tr -d '-' | cut -c1-8)"
echo "Using caller reference: \${CALLER_REF}"

# Create distribution config
cat > dist-config.json <<EOF
{
  "CallerReference": "\${CALLER_REF}",
  "Comment": "My distribution",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "origin1",
        "DomainName": "example.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "https-only"
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "origin1",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    }
  },
  "Enabled": true
}
EOF

echo "\\n=== Creating Distribution ==="
aws cloudfront create-distribution \\
  --distribution-config file://dist-config.json \\
  --output json

if [ \$? -eq 0 ]; then
  echo "\\n✓ Distribution created successfully"
  echo "Caller reference: \${CALLER_REF}"
else
  echo "\\n✗ Failed to create distribution"
  echo "Check if caller reference is unique"`,
        },
      ],
      relatedCodes: ['EntityAlreadyExists', 'Duplicate'],
      provider: 'aws',
    },
    'CloudFrontNoSuchDistribution': {
      code: 'CloudFrontNoSuchDistribution',
      name: 'CloudFront No Such Distribution',
      description: `Getting a **CloudFrontNoSuchDistribution** error means the CloudFront distribution ID you specified doesn't exist—the distribution might have been deleted, the ID is misspelled, or it's in a different AWS account. This client-side error (4xx) happens when AWS validates CloudFront distribution existence. Most common when distribution IDs are incorrect, but also appears when distributions have been deleted, incorrect distribution ID formats are used, distribution ID typos occur, or distributions are in different accounts.`,
      metaDescription: 'Fix CloudFrontNoSuchDistribution by verifying distribution IDs, listing all distributions to find correct IDs, checking if distributions were deleted, or verifying distribution existence with our AWS guide.',
      causes: [
        `Identity: IAM policy allows CloudFront but distribution doesn't exist. Service Control Policy (SCP) restricts distribution access.`,
        `Network: VPC endpoint CloudFront restrictions. Cross-account distribution access.`,
        `Limits: Distribution ID does not exist. Distribution has been deleted. Incorrect distribution ID format. Distribution ID typo. Distribution in different account.`,
      ],
      solutions: [
        `Step 1: Diagnose - List all CloudFront distributions: aws cloudfront list-distributions --query 'DistributionList.Items[*].[Id,Status,DomainName]' --output table. Check if distribution ID is in the list.`,
        `Step 2: Diagnose - Verify distribution ID format: CloudFront distribution IDs start with 'E' followed by alphanumeric characters (e.g., E1234567890ABC). Verify format matches.`,
        `Step 3: Diagnose - Check distribution status: aws cloudfront get-distribution --id DIST_ID --query 'Distribution.Status' --output text. If error, distribution doesn't exist.`,
        `Step 4: Fix - Use correct distribution ID: Verify distribution ID from list. Check for typos. Use exact distribution ID (case-sensitive). Verify distribution exists in your account.`,
        `Step 5: Fix - Check if distribution was deleted: Review CloudTrail logs: aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=DeleteDistribution. Or check distribution status in different regions.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'List All CloudFront Distributions to Find Correct ID',
          code: `#!/bin/bash
echo "=== All CloudFront Distributions ==="
aws cloudfront list-distributions \\
  --query 'DistributionList.Items[*].[Id,Status,DomainName]' \\
  --output table

# Search for specific distribution
DIST_ID="E1234567890ABC"
echo "\\n=== Searching for Distribution: \${DIST_ID} ==="

if aws cloudfront get-distribution --id \${DIST_ID} &>/dev/null; then
  echo "✓ Distribution exists"
  
  # Get distribution details
  echo "\\n=== Distribution Details ==="
  aws cloudfront get-distribution --id \${DIST_ID} \\
    --query 'Distribution.[Id,Status,DomainName]' \\
    --output table
else
  echo "✗ Distribution not found (CloudFrontNoSuchDistribution)"
  
  echo "\\n=== Similar Distribution IDs ==="
  aws cloudfront list-distributions \\
    --query "DistributionList.Items[?contains(Id, 'E123')].[Id,Status]" \\
    --output table
fi`,
        },
        {
          language: 'bash',
          title: 'Verify Distribution ID Format',
          code: `#!/bin/bash
DIST_ID="E1234567890ABC"

echo "=== Validating Distribution ID Format ==="
echo "Distribution ID: \${DIST_ID}"

# CloudFront distribution IDs start with 'E' followed by alphanumeric
if [[ \${DIST_ID} =~ ^E[A-Z0-9]+\$ ]]; then
  echo "✓ Distribution ID format valid"
  
  # Check if distribution exists
  echo "\\n=== Checking Distribution Exists ==="
  DIST_INFO=\$(aws cloudfront get-distribution \\
    --id \${DIST_ID} \\
    --query 'Distribution.[Id,Status]' \\
    --output table 2>&1)
  
  if [ \$? -eq 0 ]; then
    echo "\${DIST_INFO}"
  else
    echo "✗ Distribution not found (CloudFrontNoSuchDistribution)"
    echo "Error: \${DIST_INFO}"
  fi
else
  echo "✗ Invalid distribution ID format"
  echo "Expected format: E followed by alphanumeric characters"
  echo "Example: E1234567890ABC"
fi`,
        },
        {
          language: 'bash',
          title: 'Check CloudTrail for Distribution Deletion Events',
          code: `#!/bin/bash
DIST_ID="E1234567890ABC"

echo "=== Checking CloudTrail for Distribution Events ==="

# Check for deletion events
echo "Searching for DeleteDistribution events..."
aws cloudtrail lookup-events \\
  --lookup-attributes AttributeKey=EventName,AttributeValue=DeleteDistribution \\
  --max-results 10 \\
  --query 'Events[*].[EventTime,CloudTrailEvent]' \\
  --output text | while read time event; do
    DELETED_ID=\$(echo "\${event}" | jq -r '.requestParameters.id' 2>/dev/null)
    if [ "\${DELETED_ID}" = "\${DIST_ID}" ]; then
      echo "Found deletion event for \${DIST_ID} at \${time}"
    fi
  done 2>/dev/null || echo "Cannot check CloudTrail (distribution may not exist)"

echo "\\n=== Alternative: Check Distribution Directly ==="
aws cloudfront get-distribution --id \${DIST_ID} 2>&1 | head -3`,
        },
      ],
      relatedCodes: ['ResourceNotFoundException', 'NoSuchEntity'],
      provider: 'aws',
    },
    'CloudFrontInvalidOrigin': {
      code: 'CloudFrontInvalidOrigin',
      name: 'CloudFront Invalid Origin',
      description: `Getting a **CloudFrontInvalidOrigin** error means your CloudFront origin configuration is invalid—the origin domain name, protocol, or port configuration doesn't meet CloudFront requirements, or the origin isn't accessible. This client-side error (4xx) happens when AWS validates CloudFront origin configurations. Most common when origin domain names are invalid, but also appears when origin protocols are wrong, port configurations are invalid, origin domains don't resolve, or SSL certificate issues occur.`,
      metaDescription: 'Fix CloudFrontInvalidOrigin by verifying origin domain names, checking origin accessibility, validating SSL certificates, using correct protocols and ports, or testing origin connectivity with our AWS guide.',
      causes: [
        `Identity: IAM policy allows CloudFront but invalid origin. Service Control Policy (SCP) enforces origin validation.`,
        `Network: VPC endpoint CloudFront origin restrictions. Origin domain does not resolve. SSL certificate issues.`,
        `Limits: Invalid origin domain name. Invalid origin protocol. Invalid port configuration. Origin domain does not resolve. SSL certificate issues.`,
      ],
      solutions: [
        `Step 1: Diagnose - Validate origin domain name: Check domain format: echo DOMAIN | grep -E '^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\\.[a-zA-Z]{2,}$'. Test DNS resolution: nslookup DOMAIN.`,
        `Step 2: Diagnose - Test origin connectivity: Test HTTPS: curl -I https://DOMAIN. Test HTTP: curl -I http://DOMAIN. Verify origin is accessible.`,
        `Step 3: Diagnose - Check origin protocol and port: Verify protocol: https-only, http-only, or match-viewer. Check ports: HTTPPort (80) and HTTPSPort (443).`,
        `Step 4: Fix - Validate SSL certificate: Check certificate validity. Verify certificate matches domain. Test SSL: openssl s_client -connect DOMAIN:443.`,
        `Step 5: Fix - Use correct origin configuration: Verify origin domain name is valid. Use correct protocol and port. Ensure origin is accessible. Test origin connectivity before creating distribution.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Validate Origin Domain Name and DNS Resolution',
          code: `#!/bin/bash
ORIGIN_DOMAIN="example.com"

echo "=== Validating Origin Domain ==="
echo "Domain: \${ORIGIN_DOMAIN}"

# Check domain format
if [[ ! \${ORIGIN_DOMAIN} =~ ^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\\.[a-zA-Z]{2,}\$ ]]; then
  echo "✗ Invalid domain format (CloudFrontInvalidOrigin)"
  exit 1
else
  echo "✓ Domain format valid"
fi

# Check DNS resolution
echo "\\n=== Checking DNS Resolution ==="
if nslookup \${ORIGIN_DOMAIN} &>/dev/null; then
  echo "✓ Domain resolves"
else
  echo "✗ Domain does not resolve (CloudFrontInvalidOrigin)"
  exit 1
fi`,
        },
        {
          language: 'bash',
          title: 'Test Origin Connectivity and SSL',
          code: `#!/bin/bash
ORIGIN_DOMAIN="example.com"

echo "=== Testing Origin Connectivity ==="

# Test HTTPS
echo "Testing HTTPS..."
if curl -I https://\${ORIGIN_DOMAIN} &>/dev/null 2>&1; then
  echo "✓ HTTPS accessible"
  HTTPS_OK=true
else
  echo "✗ HTTPS not accessible"
  HTTPS_OK=false
fi

# Test HTTP
echo "\\nTesting HTTP..."
if curl -I http://\${ORIGIN_DOMAIN} &>/dev/null 2>&1; then
  echo "✓ HTTP accessible"
  HTTP_OK=true
else
  echo "✗ HTTP not accessible"
  HTTP_OK=false
fi

if [ "\${HTTPS_OK}" = "false" ] && [ "\${HTTP_OK}" = "false" ]; then
  echo "\\n✗ Origin not accessible (CloudFrontInvalidOrigin)"
  exit 1
fi

# Test SSL certificate
echo "\\n=== Testing SSL Certificate ==="
if command -v openssl &> /dev/null; then
  echo | openssl s_client -connect \${ORIGIN_DOMAIN}:443 -servername \${ORIGIN_DOMAIN} 2>&1 | grep -q "Verify return code: 0"
  if [ \$? -eq 0 ]; then
    echo "✓ SSL certificate valid"
  else
    echo "⚠ SSL certificate issues (CloudFrontInvalidOrigin)"
  fi
else
  echo "openssl not installed - cannot test SSL"
fi`,
        },
        {
          language: 'bash',
          title: 'Create Valid CloudFront Origin Configuration',
          code: `#!/bin/bash
ORIGIN_DOMAIN="example.com"
ORIGIN_CONFIG="origin-config.json"

echo "=== Creating CloudFront Origin Configuration ==="

# Validate domain first
if ! nslookup \${ORIGIN_DOMAIN} &>/dev/null; then
  echo "✗ Domain does not resolve (CloudFrontInvalidOrigin)"
  exit 1
fi

# Create origin config
cat > \${ORIGIN_CONFIG} <<EOF
{
  "Id": "origin1",
  "DomainName": "\${ORIGIN_DOMAIN}",
  "CustomOriginConfig": {
    "HTTPPort": 80,
    "HTTPSPort": 443,
    "OriginProtocolPolicy": "https-only",
    "OriginSslProtocols": {
      "Quantity": 1,
      "Items": ["TLSv1.2"]
    }
  }
}
EOF

echo "✓ Origin configuration created: \${ORIGIN_CONFIG}"
echo "\\n=== Configuration ==="
cat \${ORIGIN_CONFIG}

echo "\\n=== Test Origin Response ==="
curl -I https://\${ORIGIN_DOMAIN} \\
  -H "Host: \${ORIGIN_DOMAIN}" \\
  -H "User-Agent: Amazon CloudFront" 2>&1 | head -5`,
        },
      ],
      relatedCodes: ['InvalidParameterValue', 'ValidationException'],
      provider: 'aws',
    },
    'CloudFrontTooManyDistributions': {
      code: 'CloudFrontTooManyDistributions',
      name: 'CloudFront Too Many Distributions',
      description: `Hitting a **CloudFrontTooManyDistributions** error means you've reached the maximum number of CloudFront distributions allowed in your AWS account—the default limit is 200 distributions per account, and you can't create more until you delete some or request a limit increase. This client-side error (4xx) happens when AWS enforces CloudFront distribution limits. Most common when account distribution limits are reached, but also appears when too many active distributions exist, distribution limits are exceeded, account-level limits are reached, or maximum distributions are created.`,
      metaDescription: 'Fix CloudFrontTooManyDistributions by deleting unused distributions, requesting limit increases, disabling unused distributions, consolidating similar distributions, or optimizing usage with our AWS guide.',
      causes: [
        `Identity: IAM policy allows CloudFront but distribution limit reached. Service Control Policy (SCP) enforces distribution limits.`,
        `Network: VPC endpoint CloudFront distribution restrictions. Account-level distribution limits.`,
        `Limits: Account distribution limit reached (default: 200 per account). Too many active distributions. Distribution limit exceeded. Account-level limit reached. Maximum distributions created.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check current distribution count: aws cloudfront list-distributions --query 'DistributionList.Quantity' --output text. Compare with limit (default: 200).`,
        `Step 2: Diagnose - List all distributions: aws cloudfront list-distributions --query 'DistributionList.Items[*].[Id,Status,DomainName,Comment]' --output table. Identify unused distributions.`,
        `Step 3: Diagnose - Find disabled distributions: aws cloudfront list-distributions --query "DistributionList.Items[?Enabled==\`false\`].[Id,Status]" --output table. These can be deleted.`,
        `Step 4: Fix - Delete unused distributions: Disable distribution first: aws cloudfront update-distribution --id DIST_ID --distribution-config file://config.json --if-match ETAG. Then delete: aws cloudfront delete-distribution --id DIST_ID --if-match ETAG.`,
        `Step 5: Fix - Request limit increase or consolidate: Contact AWS Support for limit increase. Or consolidate similar distributions. Review and optimize distribution usage.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check Current CloudFront Distribution Count and Limits',
          code: `#!/bin/bash
echo "=== Current Distribution Count ==="
DIST_COUNT=\$(aws cloudfront list-distributions \\
  --query 'DistributionList.Quantity' \\
  --output text)

echo "Current distributions: \${DIST_COUNT}"

# Default limit: 200 distributions per account
LIMIT=200
echo "Limit: \${LIMIT}"
echo "Usage: \${DIST_COUNT} / \${LIMIT}"

if [ \${DIST_COUNT} -ge \${LIMIT} ]; then
  echo "\\n✗ Distribution limit reached (CloudFrontTooManyDistributions)"
else
  echo "\\n✓ Within distribution limit"
fi

# List all distributions
echo "\\n=== All Distributions ==="
aws cloudfront list-distributions \\
  --query 'DistributionList.Items[*].[Id,Status,DomainName,Comment]' \\
  --output table`,
        },
        {
          language: 'bash',
          title: 'Find Disabled Distributions for Deletion',
          code: `#!/bin/bash
echo "=== Disabled Distributions ==="
aws cloudfront list-distributions \\
  --query "DistributionList.Items[?Enabled==\`false\`].[Id,Status]" \\
  --output table

echo "\\n=== Disabled Distribution Count ==="
DISABLED_COUNT=\$(aws cloudfront list-distributions \\
  --query "length(DistributionList.Items[?Enabled==\`false\`])" \\
  --output text)

echo "Disabled distributions: \${DISABLED_COUNT}"

if [ \${DISABLED_COUNT} -gt 0 ]; then
  echo "\\n✓ These distributions can be deleted"
  echo "Note: Distributions must be disabled before deletion"
else
  echo "\\nNo disabled distributions found"
fi`,
        },
        {
          language: 'bash',
          title: 'Disable and Delete CloudFront Distribution',
          code: `#!/bin/bash
DIST_ID="E1234567890ABC"

echo "=== Disabling Distribution ==="
echo "Distribution ID: \${DIST_ID}"

# Get distribution config
echo "\\n=== Getting Distribution Config ==="
aws cloudfront get-distribution-config \\
  --id \${DIST_ID} > dist-config.json

# Extract ETag
ETAG=\$(jq -r '.ETag' dist-config.json 2>/dev/null)
echo "ETag: \${ETAG}"

# Update config to disable (set Enabled: false)
echo "\\n=== Updating Config to Disable ==="
jq '.DistributionConfig.Enabled = false' dist-config.json > dist-config-disabled.json

# Update distribution
aws cloudfront update-distribution \\
  --id \${DIST_ID} \\
  --distribution-config file://dist-config-disabled.json \\
  --if-match \${ETAG} \\
  --output json

if [ \$? -eq 0 ]; then
  echo "\\n✓ Distribution disabled"
  echo "Wait for deployment, then delete distribution"
  echo "\\n=== Delete Distribution ==="
  echo "aws cloudfront delete-distribution --id \${DIST_ID} --if-match NEW_ETAG"
else
  echo "\\n✗ Failed to disable distribution"
fi`,
        },
      ],
      relatedCodes: ['LimitExceededException', 'ServiceQuotaExceededException'],
      provider: 'aws',
    },
    'EC2InvalidParameterCombination': {
      code: 'EC2InvalidParameterCombination',
      name: 'EC2 Invalid Parameter Combination',
      description: `Getting an **EC2InvalidParameterCombination** error means the EC2 parameters you specified cannot be used together—some parameters are mutually exclusive, require specific combinations, or conflict with each other. This client-side error (4xx) happens when AWS validates EC2 parameter compatibility. Most common when mutually exclusive parameters are used together, but also appears when parameter combinations aren't supported, instance types are incompatible with parameters, network settings conflict, or storage configurations are invalid.`,
      metaDescription: 'Fix EC2InvalidParameterCombination by reviewing parameter compatibility, removing conflicting parameters, using supported combinations, checking instance type requirements, or verifying network configuration with our AWS guide.',
      causes: [
        `Identity: IAM policy allows EC2 launch but invalid parameter combination. Service Control Policy (SCP) enforces parameter validation.`,
        `Network: VPC endpoint EC2 parameter restrictions. Conflicting network settings.`,
        `Limits: Mutually exclusive parameters used together. Parameter combination not supported. Incompatible instance type and parameters. Conflicting network settings. Invalid storage configuration.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check exact error message: AWS usually specifies which parameters conflict. Review error message for parameter names. Identify conflicting parameters.`,
        `Step 2: Diagnose - Review parameter compatibility: Common conflicts: --security-groups and --security-group-ids (mutually exclusive). --subnet-id with --placement-group (may conflict). Check EC2 documentation.`,
        `Step 3: Diagnose - Check instance type requirements: Verify instance type supports parameters: aws ec2 describe-instance-types --instance-types INSTANCE_TYPE. Check EBS optimization compatibility.`,
        `Step 4: Fix - Remove conflicting parameters: Remove one of mutually exclusive parameters. Use --security-group-ids instead of --security-groups. Or use --security-groups instead of --security-group-ids.`,
        `Step 5: Fix - Use supported parameter combinations: Review EC2 parameter documentation. Check instance type requirements. Verify network configuration is compatible. Use supported parameter combinations.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Validate EC2 Parameter Combinations',
          code: `#!/bin/bash
echo "=== Validating EC2 Parameter Combinations ==="

# Check for mutually exclusive parameters
SECURITY_GROUPS=""
SECURITY_GROUP_IDS="sg-12345678"

if [ -n "\${SECURITY_GROUPS}" ] && [ -n "\${SECURITY_GROUP_IDS}" ]; then
  echo "✗ Cannot use both --security-groups and --security-group-ids (EC2InvalidParameterCombination)"
  echo "These parameters are mutually exclusive"
  exit 1
else
  echo "✓ Security group parameters OK"
fi

# Check subnet and placement group
SUBNET_ID="subnet-12345678"
PLACEMENT_GROUP=""

if [ -n "\${SUBNET_ID}" ] && [ -n "\${PLACEMENT_GROUP}" ]; then
  echo "⚠ Placement group may not work with specific subnet"
  echo "Consider removing one parameter"
fi

echo "\\n=== Parameter Validation Complete ==="`,
        },
        {
          language: 'bash',
          title: 'Check Instance Type and EBS Optimization Compatibility',
          code: `#!/bin/bash
INSTANCE_TYPE="t3.micro"
EBS_OPTIMIZED="true"

echo "=== Checking Instance Type Compatibility ==="
echo "Instance type: \${INSTANCE_TYPE}"
echo "EBS optimized: \${EBS_OPTIMIZED}"

# Check if instance type supports EBS optimization
if [ "\${EBS_OPTIMIZED}" = "true" ]; then
  # Some instance types don't support EBS optimization
  if [[ ! "\${INSTANCE_TYPE}" =~ ^(m5|c5|r5|m4|c4|r4|i3|x1) ]]; then
    echo "⚠ EBS optimization may not be available for \${INSTANCE_TYPE}"
    echo "This may cause EC2InvalidParameterCombination"
    echo "Consider removing --ebs-optimized or using a different instance type"
  else
    echo "✓ Instance type supports EBS optimization"
  fi
fi

# Check instance type capabilities
echo "\\n=== Instance Type Details ==="
aws ec2 describe-instance-types \\
  --instance-types \${INSTANCE_TYPE} \\
  --query 'InstanceTypes[0].[InstanceType,EbsInfo.EbsOptimizedSupport]' \\
  --output table`,
        },
        {
          language: 'bash',
          title: 'Launch Instance with Validated Parameters',
          code: `#!/bin/bash
echo "=== Launching EC2 Instance with Validated Parameters ==="

# Validate parameters first
SECURITY_GROUP_IDS="sg-12345678"
SUBNET_ID="subnet-12345678"
INSTANCE_TYPE="t3.medium"

# Check for conflicts
if [ -n "\${SECURITY_GROUP_IDS}" ]; then
  echo "Using --security-group-ids: \${SECURITY_GROUP_IDS}"
  echo "✓ Not using --security-groups (avoid conflict)"
fi

echo "\\n=== Launching Instance ==="
aws ec2 run-instances \\
  --image-id ami-12345678 \\
  --instance-type \${INSTANCE_TYPE} \\
  --subnet-id \${SUBNET_ID} \\
  --security-group-ids \${SECURITY_GROUP_IDS} \\
  --key-name my-key-pair \\
  --count 1 \\
  --output json

if [ \$? -eq 0 ]; then
  echo "\\n✓ Instance launched successfully"
else
  echo "\\n✗ Launch failed - check for EC2InvalidParameterCombination"
  echo "Review parameter combinations and try again"
fi`,
        },
      ],
      relatedCodes: ['InvalidParameterValue', 'ValidationException'],
      provider: 'aws',
    },
    'EC2InvalidSnapshotNotFound': {
      code: 'EC2InvalidSnapshotNotFound',
      name: 'EC2 Invalid Snapshot Not Found',
      description: `Getting an **EC2InvalidSnapshotNotFound** error means the EBS snapshot ID you specified doesn't exist or isn't available—the snapshot might have been deleted, is in a different region, or isn't shared with your account. This client-side error (4xx) happens when AWS validates EBS snapshot existence. Most common when snapshot IDs are incorrect, but also appears when snapshots have been deleted, snapshots are in different regions, incorrect snapshot ID formats are used, or snapshots aren't shared with your account.`,
      metaDescription: 'Fix EC2InvalidSnapshotNotFound by verifying snapshot IDs, listing all snapshots to find correct IDs, checking correct regions, verifying sharing permissions, or using correct snapshot formats with our AWS guide.',
      causes: [
        `Identity: IAM policy allows EC2 access but snapshot doesn't exist. Service Control Policy (SCP) restricts snapshot access.`,
        `Network: VPC endpoint EC2 snapshot restrictions. Cross-region snapshot access.`,
        `Limits: Snapshot ID does not exist. Snapshot has been deleted. Snapshot in different region. Incorrect snapshot ID format. Snapshot not shared with your account.`,
      ],
      solutions: [
        `Step 1: Diagnose - List all snapshots: aws ec2 describe-snapshots --owner-ids self --query 'Snapshots[*].[SnapshotId,State,VolumeSize,StartTime]' --output table. Check if snapshot ID is in the list.`,
        `Step 2: Diagnose - Check snapshot in specific region: aws ec2 describe-snapshots --snapshot-ids snap-XXXXX --region REGION --query 'Snapshots[0].[SnapshotId,State]' --output table. Verify region is correct.`,
        `Step 3: Diagnose - Search snapshots by volume ID: aws ec2 describe-snapshots --filters "Name=volume-id,Values=vol-XXXXX" --query 'Snapshots[*].[SnapshotId,State]' --output table. Find snapshots for specific volume.`,
        `Step 4: Fix - Use correct snapshot ID: Verify snapshot ID from list. Check for typos. Use exact snapshot ID (case-sensitive). Verify snapshot ID format: snap-xxxxxxxxxxxxxxxxx.`,
        `Step 5: Fix - Check snapshot sharing or copy to region: If snapshot is in different region, copy it: aws ec2 copy-snapshot --source-region SOURCE_REGION --source-snapshot-id snap-XXXXX --description "copied-snapshot". Or verify snapshot sharing permissions: aws ec2 describe-snapshot-attribute --snapshot-id snap-XXXXX --attribute createVolumePermission.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'List All EBS Snapshots to Find Correct ID',
          code: `#!/bin/bash
echo "=== All EBS Snapshots (Your Account) ==="
aws ec2 describe-snapshots \\
  --owner-ids self \\
  --query 'Snapshots[*].[SnapshotId,State,VolumeSize,StartTime]' \\
  --output table

# Search for specific snapshot
SNAPSHOT_ID="snap-1234567890abcdef0"
echo "\\n=== Searching for Snapshot: \${SNAPSHOT_ID} ==="

if aws ec2 describe-snapshots --snapshot-ids \${SNAPSHOT_ID} &>/dev/null; then
  echo "✓ Snapshot exists"
  
  # Get snapshot details
  echo "\\n=== Snapshot Details ==="
  aws ec2 describe-snapshots --snapshot-ids \${SNAPSHOT_ID} \\
    --query 'Snapshots[0].[SnapshotId,State,VolumeSize,StartTime]' \\
    --output table
else
  echo "✗ Snapshot not found (EC2InvalidSnapshotNotFound)"
  
  echo "\\n=== Search by Volume ID ==="
  VOLUME_ID="vol-1234567890abcdef0"
  aws ec2 describe-snapshots \\
    --filters "Name=volume-id,Values=\${VOLUME_ID}" \\
    --query 'Snapshots[*].[SnapshotId,State]' \\
    --output table
fi`,
        },
        {
          language: 'bash',
          title: 'Check Snapshot Across Regions',
          code: `#!/bin/bash
SNAPSHOT_ID="snap-1234567890abcdef0"
REGIONS=("us-east-1" "us-west-2" "eu-west-1" "ap-southeast-1")

echo "=== Checking Snapshot Across Regions ==="
for REGION in "\${REGIONS[@]}"; do
  echo "\\nChecking region: \${REGION}"
  
  RESULT=\$(aws ec2 describe-snapshots \\
    --snapshot-ids \${SNAPSHOT_ID} \\
    --region \${REGION} \\
    --query 'Snapshots[0].SnapshotId' \\
    --output text 2>/dev/null)
  
  if [ ! -z "\${RESULT}" ] && [ "\${RESULT}" != "None" ]; then
    echo "✓ Snapshot found in \${REGION}: \${RESULT}"
    
    # Get snapshot details
    aws ec2 describe-snapshots \\
      --snapshot-ids \${SNAPSHOT_ID} \\
      --region \${REGION} \\
      --query 'Snapshots[0].[SnapshotId,State,VolumeSize]' \\
      --output table
    break
  else
    echo "✗ Snapshot not found in \${REGION}"
  fi
done`,
        },
        {
          language: 'bash',
          title: 'Copy Snapshot to Current Region',
          code: `#!/bin/bash
SOURCE_REGION="us-west-2"
SOURCE_SNAPSHOT="snap-1234567890abcdef0"
DEST_REGION="us-east-1"

echo "=== Copying Snapshot to Current Region ==="
echo "Source region: \${SOURCE_REGION}"
echo "Source snapshot: \${SOURCE_SNAPSHOT}"
echo "Destination region: \${DEST_REGION}"

NEW_SNAPSHOT=\$(aws ec2 copy-snapshot \\
  --source-region \${SOURCE_REGION} \\
  --source-snapshot-id \${SOURCE_SNAPSHOT} \\
  --description "Copied snapshot from \${SOURCE_REGION}" \\
  --region \${DEST_REGION} \\
  --query 'SnapshotId' \\
  --output text 2>&1)

if [ \$? -eq 0 ] && [ ! -z "\${NEW_SNAPSHOT}" ]; then
  echo "\\n✓ Snapshot copy initiated: \${NEW_SNAPSHOT}"
  echo "Check status: aws ec2 describe-snapshots --snapshot-ids \${NEW_SNAPSHOT} --region \${DEST_REGION}"
else
  echo "\\n✗ Failed to copy snapshot"
  echo "Error: \${NEW_SNAPSHOT}"
  echo "Check snapshot sharing permissions or source snapshot existence"
fi`,
        },
      ],
      relatedCodes: ['ResourceNotFoundException', 'InvalidParameterValue'],
      provider: 'aws',
    },
    'EC2VolumeInUse': {
      code: 'EC2VolumeInUse',
      name: 'EC2 Volume In Use',
      description: `Getting an **EC2VolumeInUse** error means the EBS volume you're trying to delete or modify is currently attached to an EC2 instance—volumes must be detached before deletion or certain modifications. This client-side error (4xx) happens when AWS validates EBS volume attachment status. Most common when volumes are attached to running instances, but also appears when volumes are attached to stopped instances, volume deletion is attempted while attached, volume modification occurs while attached, or volumes are in use by another operation.`,
      metaDescription: 'Fix EC2VolumeInUse by detaching volumes from instances, stopping instances before detaching, waiting for operations to complete, checking attachment status, or verifying no operations are in progress with our AWS guide.',
      causes: [
        `Identity: IAM policy allows EC2 volume operations but volume is attached. Service Control Policy (SCP) enforces volume detachment rules.`,
        `Network: VPC endpoint EC2 volume restrictions. Volume attached to instance.`,
        `Limits: Volume attached to running instance. Volume attached to stopped instance. Volume deletion attempted while attached. Volume modification while attached. Volume in use by another operation.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check volume attachment status: aws ec2 describe-volumes --volume-ids vol-XXXXX --query 'Volumes[0].[VolumeId,State,Attachments[0].InstanceId,Attachments[0].Device]' --output table. Verify if volume is attached.`,
        `Step 2: Diagnose - Check instance state: Get instance ID from volume attachment: aws ec2 describe-volumes --volume-ids vol-XXXXX --query 'Volumes[0].Attachments[0].InstanceId' --output text. Check instance state: aws ec2 describe-instances --instance-ids i-XXXXX --query 'Reservations[0].Instances[0].State.Name' --output text.`,
        `Step 3: Diagnose - Wait for operations to complete: Check if volume is in use: aws ec2 describe-volumes --volume-ids vol-XXXXX --query 'Volumes[0].State' --output text. Wait if state is 'in-use' or 'modifying'.`,
        `Step 4: Fix - Detach volume from instance: Detach volume: aws ec2 detach-volume --volume-id vol-XXXXX --instance-id i-XXXXX. Wait for detachment: aws ec2 wait volume-available --volume-ids vol-XXXXX.`,
        `Step 5: Fix - Stop instance if needed or force detach: If instance is running, stop it first: aws ec2 stop-instances --instance-ids i-XXXXX. Or force detach: aws ec2 detach-volume --volume-id vol-XXXXX --instance-id i-XXXXX --force. Then delete volume: aws ec2 delete-volume --volume-id vol-XXXXX.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check EBS Volume Attachment Status',
          code: `#!/bin/bash
VOLUME_ID="vol-1234567890abcdef0"

echo "=== Checking Volume Attachment Status ==="
VOLUME_INFO=\$(aws ec2 describe-volumes \\
  --volume-ids \${VOLUME_ID} \\
  --query 'Volumes[0].[VolumeId,State,Attachments[0].InstanceId,Attachments[0].Device]' \\
  --output table 2>&1)

if [ \$? -eq 0 ]; then
  echo "\${VOLUME_INFO}"
  
  # Get attachment details
  INSTANCE_ID=\$(aws ec2 describe-volumes \\
    --volume-ids \${VOLUME_ID} \\
    --query 'Volumes[0].Attachments[0].InstanceId' \\
    --output text)
  
  if [ ! -z "\${INSTANCE_ID}" ] && [ "\${INSTANCE_ID}" != "None" ]; then
    echo "\\n✗ Volume is attached to instance: \${INSTANCE_ID} (EC2VolumeInUse)"
    echo "Detach volume before deletion or modification"
  else
    echo "\\n✓ Volume is not attached"
  fi
else
  echo "✗ Volume not found or error: \${VOLUME_INFO}"
fi`,
        },
        {
          language: 'bash',
          title: 'Detach EBS Volume from Instance',
          code: `#!/bin/bash
VOLUME_ID="vol-1234567890abcdef0"

echo "=== Detaching EBS Volume ==="

# Get instance ID
INSTANCE_ID=\$(aws ec2 describe-volumes \\
  --volume-ids \${VOLUME_ID} \\
  --query 'Volumes[0].Attachments[0].InstanceId' \\
  --output text)

if [ -z "\${INSTANCE_ID}" ] || [ "\${INSTANCE_ID}" = "None" ]; then
  echo "✗ Volume is not attached"
  exit 0
fi

echo "Volume ID: \${VOLUME_ID}"
echo "Instance ID: \${INSTANCE_ID}"

# Check instance state
INSTANCE_STATE=\$(aws ec2 describe-instances \\
  --instance-ids \${INSTANCE_ID} \\
  --query 'Reservations[0].Instances[0].State.Name' \\
  --output text)

echo "Instance state: \${INSTANCE_STATE}"

# Detach volume
echo "\\n=== Detaching Volume ==="
aws ec2 detach-volume \\
  --volume-id \${VOLUME_ID} \\
  --instance-id \${INSTANCE_ID} \\
  --output json

if [ \$? -eq 0 ]; then
  echo "\\n✓ Detachment initiated"
  
  # Wait for detachment
  echo "Waiting for volume to become available..."
  aws ec2 wait volume-available --volume-ids \${VOLUME_ID}
  
  if [ \$? -eq 0 ]; then
    echo "✓ Volume detached successfully"
    echo "Now safe to delete: aws ec2 delete-volume --volume-id \${VOLUME_ID}"
  else
    echo "✗ Timeout waiting for detachment"
  fi
else
  echo "\\n✗ Failed to detach volume"
fi`,
        },
        {
          language: 'bash',
          title: 'Force Detach and Delete EBS Volume',
          code: `#!/bin/bash
VOLUME_ID="vol-1234567890abcdef0"

echo "=== Force Detaching EBS Volume ==="
echo "Warning: Force detach may cause data loss if volume is in use"

# Get instance ID
INSTANCE_ID=\$(aws ec2 describe-volumes \\
  --volume-ids \${VOLUME_ID} \\
  --query 'Volumes[0].Attachments[0].InstanceId' \\
  --output text)

if [ -z "\${INSTANCE_ID}" ] || [ "\${INSTANCE_ID}" = "None" ]; then
  echo "Volume is not attached - safe to delete"
  aws ec2 delete-volume --volume-id \${VOLUME_ID}
  exit 0
fi

echo "Volume ID: \${VOLUME_ID}"
echo "Instance ID: \${INSTANCE_ID}"

# Force detach
echo "\\n=== Force Detaching ==="
aws ec2 detach-volume \\
  --volume-id \${VOLUME_ID} \\
  --instance-id \${INSTANCE_ID} \\
  --force \\
  --output json

if [ \$? -eq 0 ]; then
  echo "\\n✓ Force detachment initiated"
  
  # Wait for detachment
  echo "Waiting for volume to become available..."
  aws ec2 wait volume-available --volume-ids \${VOLUME_ID}
  
  if [ \$? -eq 0 ]; then
    echo "✓ Volume detached"
    
    # Delete volume
    echo "\\n=== Deleting Volume ==="
    aws ec2 delete-volume --volume-id \${VOLUME_ID}
    
    if [ \$? -eq 0 ]; then
      echo "✓ Volume deleted successfully"
    else
      echo "✗ Failed to delete volume"
    fi
  else
    echo "✗ Timeout waiting for detachment"
  fi
else
  echo "\\n✗ Failed to force detach volume"
fi`,
        },
      ],
      relatedCodes: ['InvalidParameterValue', 'InvalidState'],
      provider: 'aws',
    },
    'IAMDeleteConflict': {
      code: 'IAMDeleteConflict',
      name: 'IAM Delete Conflict',
      description: `Hitting an **IAMDeleteConflict** error means the IAM entity (user, role, or policy) you're trying to delete is still in use—it has attached policies, group memberships, access keys, or other dependencies that must be removed first. This client-side error (4xx) happens when AWS validates IAM entity dependencies before deletion. Most common when users have attached policies, but also appears when users are members of groups, users have access keys, roles have attached policies, or policies are attached to entities.`,
      metaDescription: 'Fix IAMDeleteConflict by detaching all policies from entities, removing users from groups, deleting access keys, removing relationships, or identifying dependencies with our AWS guide.',
      causes: [
        `Identity: IAM entity has dependencies. Service Control Policy (SCP) enforces dependency removal.`,
        `Network: VPC endpoint IAM entity restrictions. Entity still in use.`,
        `Limits: User has attached policies. User is member of groups. User has access keys. Role has attached policies. Policy attached to entities.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check user dependencies: List attached policies: aws iam list-attached-user-policies --user-name USER_NAME. List inline policies: aws iam list-user-policies --user-name USER_NAME. List group memberships: aws iam get-groups-for-user --user-name USER_NAME. List access keys: aws iam list-access-keys --user-name USER_NAME.`,
        `Step 2: Diagnose - Check role dependencies: List attached policies: aws iam list-attached-role-policies --role-name ROLE_NAME. List inline policies: aws iam list-role-policies --role-name ROLE_NAME. Check instance profiles: aws iam list-instance-profiles-for-role --role-name ROLE_NAME.`,
        `Step 3: Diagnose - Check policy dependencies: List entities with policy: aws iam list-entities-for-policy --policy-arn POLICY_ARN. Check attached to users, groups, or roles.`,
        `Step 4: Fix - Remove user dependencies: Detach managed policies: aws iam detach-user-policy --user-name USER_NAME --policy-arn POLICY_ARN. Delete inline policies: aws iam delete-user-policy --user-name USER_NAME --policy-name POLICY_NAME. Remove from groups: aws iam remove-user-from-group --user-name USER_NAME --group-name GROUP_NAME. Delete access keys: aws iam delete-access-key --user-name USER_NAME --access-key-id KEY_ID.`,
        `Step 5: Fix - Remove role or policy dependencies: For roles: Detach policies, remove from instance profiles. For policies: Detach from all entities. Then delete: aws iam delete-user --user-name USER_NAME.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check IAM User Dependencies',
          code: `#!/bin/bash
USER_NAME="my-user"

echo "=== Checking IAM User Dependencies ==="
echo "User: \${USER_NAME}"

# List attached policies
echo "\\n=== Attached Policies ==="
aws iam list-attached-user-policies --user-name \${USER_NAME} \\
  --query 'AttachedPolicies[*].PolicyArn' \\
  --output table

# List inline policies
echo "\\n=== Inline Policies ==="
aws iam list-user-policies --user-name \${USER_NAME} \\
  --query 'PolicyNames' \\
  --output table

# List group memberships
echo "\\n=== Group Memberships ==="
aws iam get-groups-for-user --user-name \${USER_NAME} \\
  --query 'Groups[*].GroupName' \\
  --output table

# List access keys
echo "\\n=== Access Keys ==="
aws iam list-access-keys --user-name \${USER_NAME} \\
  --query 'AccessKeyMetadata[*].[AccessKeyId,Status]' \\
  --output table

echo "\\n=== Summary ==="
echo "Remove all dependencies before deleting user (IAMDeleteConflict)"`,
        },
        {
          language: 'bash',
          title: 'Remove All User Dependencies Before Deletion',
          code: `#!/bin/bash
USER_NAME="my-user"

echo "=== Removing User Dependencies ==="

# Detach managed policies
echo "\\n=== Detaching Managed Policies ==="
aws iam list-attached-user-policies --user-name \${USER_NAME} \\
  --query 'AttachedPolicies[*].PolicyArn' \\
  --output text | while read POLICY_ARN; do
  if [ ! -z "\${POLICY_ARN}" ]; then
    echo "Detaching: \${POLICY_ARN}"
    aws iam detach-user-policy --user-name \${USER_NAME} --policy-arn \${POLICY_ARN}
  fi
done

# Delete inline policies
echo "\\n=== Deleting Inline Policies ==="
aws iam list-user-policies --user-name \${USER_NAME} \\
  --query 'PolicyNames' \\
  --output text | while read POLICY_NAME; do
  if [ ! -z "\${POLICY_NAME}" ]; then
    echo "Deleting: \${POLICY_NAME}"
    aws iam delete-user-policy --user-name \${USER_NAME} --policy-name \${POLICY_NAME}
  fi
done

# Remove from groups
echo "\\n=== Removing from Groups ==="
aws iam get-groups-for-user --user-name \${USER_NAME} \\
  --query 'Groups[*].GroupName' \\
  --output text | while read GROUP_NAME; do
  if [ ! -z "\${GROUP_NAME}" ]; then
    echo "Removing from: \${GROUP_NAME}"
    aws iam remove-user-from-group --user-name \${USER_NAME} --group-name \${GROUP_NAME}
  fi
done

# Delete access keys
echo "\\n=== Deleting Access Keys ==="
aws iam list-access-keys --user-name \${USER_NAME} \\
  --query 'AccessKeyMetadata[*].AccessKeyId' \\
  --output text | while read KEY_ID; do
  if [ ! -z "\${KEY_ID}" ]; then
    echo "Deleting key: \${KEY_ID}"
    aws iam delete-access-key --user-name \${USER_NAME} --access-key-id \${KEY_ID}
  fi
done

echo "\\n=== Ready to Delete User ==="
echo "aws iam delete-user --user-name \${USER_NAME}"`,
        },
        {
          language: 'bash',
          title: 'Check Policy Dependencies Before Deletion',
          code: `#!/bin/bash
POLICY_ARN="arn:aws:iam::123456789012:policy/my-policy"

echo "=== Checking Policy Dependencies ==="
echo "Policy: \${POLICY_ARN}"

# List entities with policy
echo "\\n=== Entities with Policy ==="
aws iam list-entities-for-policy --policy-arn \${POLICY_ARN} \\
  --query 'PolicyUsers[*].UserName' \\
  --output table

aws iam list-entities-for-policy --policy-arn \${POLICY_ARN} \\
  --query 'PolicyGroups[*].GroupName' \\
  --output table

aws iam list-entities-for-policy --policy-arn \${POLICY_ARN} \\
  --query 'PolicyRoles[*].RoleName' \\
  --output table

echo "\\n=== Detach Policy from All Entities ==="
echo "Detach from users, groups, and roles before deletion (IAMDeleteConflict)"`,
        },
      ],
      relatedCodes: ['DeleteConflict', 'InvalidParameterValue'],
      provider: 'aws',
    },
    'IAMPasswordPolicyViolation': {
      code: 'IAMPasswordPolicyViolation',
      name: 'IAM Password Policy Violation',
      description: `Getting an **IAMPasswordPolicyViolation** error means the password you're trying to set doesn't meet your AWS account's password policy requirements—the password might be too short, missing required character types, or violate complexity or history rules. This client-side error (4xx) happens when AWS validates passwords against the account password policy. Most common when passwords are too short, but also appears when required characters are missing, complexity requirements aren't met, passwords are in history (reuse prevention), or password policy rules are violated.`,
      metaDescription: 'Fix IAMPasswordPolicyViolation by checking account password policies, ensuring passwords meet all requirements, using password generators, verifying complexity rules, or checking history restrictions with our AWS guide.',
      causes: [
        `Identity: IAM password policy enforcement. Service Control Policy (SCP) enforces password rules.`,
        `Network: VPC endpoint IAM password restrictions. Password policy violation.`,
        `Limits: Password too short (below minimum length). Password missing required characters (uppercase, lowercase, numbers, symbols). Password does not meet complexity requirements. Password in history (reuse prevention). Password policy violation.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check account password policy: aws iam get-account-password-policy. Review minimum length, character requirements, complexity rules, and history restrictions.`,
        `Step 2: Diagnose - Validate password against policy: Check minimum length. Verify uppercase, lowercase, numbers, and symbols if required. Check password history.`,
        `Step 3: Diagnose - Review password policy requirements: Minimum length (default: 6-128 characters). Require uppercase characters. Require lowercase characters. Require numbers. Require symbols. Password reuse prevention (history).`,
        `Step 4: Fix - Ensure password meets all requirements: Use password generator. Include required character types. Meet minimum length. Avoid password history.`,
        `Step 5: Fix - Update password: Create new password meeting all policy requirements. Use AWS Console or CLI: aws iam update-login-profile --user-name USER_NAME --password PASSWORD --password-reset-required.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check Account Password Policy Requirements',
          code: `#!/bin/bash
echo "=== Account Password Policy ==="
POLICY=\$(aws iam get-account-password-policy 2>&1)

if [ \$? -eq 0 ]; then
  MIN_LENGTH=\$(echo \${POLICY} | jq -r '.PasswordPolicy.MinimumPasswordLength')
  REQUIRE_UPPERCASE=\$(echo \${POLICY} | jq -r '.PasswordPolicy.RequireUppercaseCharacters')
  REQUIRE_LOWERCASE=\$(echo \${POLICY} | jq -r '.PasswordPolicy.RequireLowercaseCharacters')
  REQUIRE_NUMBERS=\$(echo \${POLICY} | jq -r '.PasswordPolicy.RequireNumbers')
  REQUIRE_SYMBOLS=\$(echo \${POLICY} | jq -r '.PasswordPolicy.RequireSymbols')
  
  echo "Password requirements:"
  echo "  Minimum length: \${MIN_LENGTH}"
  echo "  Require uppercase: \${REQUIRE_UPPERCASE}"
  echo "  Require lowercase: \${REQUIRE_LOWERCASE}"
  echo "  Require numbers: \${REQUIRE_NUMBERS}"
  echo "  Require symbols: \${REQUIRE_SYMBOLS}"
else
  echo "No password policy configured"
  echo "Default requirements apply"
fi`,
        },
        {
          language: 'bash',
          title: 'Validate Password Against Policy',
          code: `#!/bin/bash
PASSWORD="MyP@ssw0rd123"

echo "=== Validating Password ==="

# Get policy requirements
POLICY=\$(aws iam get-account-password-policy 2>/dev/null)

if [ \$? -eq 0 ]; then
  MIN_LENGTH=\$(echo \${POLICY} | jq -r '.PasswordPolicy.MinimumPasswordLength')
  REQUIRE_UPPERCASE=\$(echo \${POLICY} | jq -r '.PasswordPolicy.RequireUppercaseCharacters')
  REQUIRE_LOWERCASE=\$(echo \${POLICY} | jq -r '.PasswordPolicy.RequireLowercaseCharacters')
  REQUIRE_NUMBERS=\$(echo \${POLICY} | jq -r '.PasswordPolicy.RequireNumbers')
  REQUIRE_SYMBOLS=\$(echo \${POLICY} | jq -r '.PasswordPolicy.RequireSymbols')
  
  ERRORS=()
  
  # Check minimum length
  if [ \${#PASSWORD} -lt \${MIN_LENGTH} ]; then
    ERRORS+=("Password too short (minimum \${MIN_LENGTH} characters)")
  fi
  
  # Check uppercase
  if [ "\${REQUIRE_UPPERCASE}" = "true" ] && [[ ! \${PASSWORD} =~ [A-Z] ]]; then
    ERRORS+=("Missing uppercase character")
  fi
  
  # Check lowercase
  if [ "\${REQUIRE_LOWERCASE}" = "true" ] && [[ ! \${PASSWORD} =~ [a-z] ]]; then
    ERRORS+=("Missing lowercase character")
  fi
  
  # Check numbers
  if [ "\${REQUIRE_NUMBERS}" = "true" ] && [[ ! \${PASSWORD} =~ [0-9] ]]; then
    ERRORS+=("Missing number")
  fi
  
  # Check symbols
  if [ "\${REQUIRE_SYMBOLS}" = "true" ] && [[ ! \${PASSWORD} =~ [^a-zA-Z0-9] ]]; then
    ERRORS+=("Missing symbol")
  fi
  
  if [ \${#ERRORS[@]} -eq 0 ]; then
    echo "✓ Password meets policy requirements"
  else
    echo "✗ Password violations (IAMPasswordPolicyViolation):"
    printf '  %s\\n' "\${ERRORS[@]}"
  fi
else
  echo "No password policy configured"
fi`,
        },
        {
          language: 'bash',
          title: 'Update User Password with Valid Password',
          code: `#!/bin/bash
USER_NAME="my-user"
NEW_PASSWORD="MyNewP@ssw0rd123"

echo "=== Updating User Password ==="
echo "User: \${USER_NAME}"

# Validate password first (use previous validation)
echo "Validating password against policy..."
# ... (password validation logic here)

# Update password
echo "\\n=== Updating Password ==="
aws iam update-login-profile \\
  --user-name \${USER_NAME} \\
  --password \${NEW_PASSWORD} \\
  --password-reset-required \\
  --output json

if [ \$? -eq 0 ]; then
  echo "\\n✓ Password updated successfully"
  echo "User will be required to reset password on next login"
else
  echo "\\n✗ Failed to update password"
  echo "Check for IAMPasswordPolicyViolation"
fi`,
        },
      ],
      relatedCodes: ['InvalidParameterValue', 'ValidationException'],
      provider: 'aws',
    },
    'CloudFrontInvalidViewerCertificate': {
      code: 'CloudFrontInvalidViewerCertificate',
      name: 'CloudFront Invalid Viewer Certificate',
      description: `Getting a **CloudFrontInvalidViewerCertificate** error means the SSL/TLS certificate you specified for CloudFront is invalid or not properly configured—CloudFront requires certificates to be in the us-east-1 region, valid and not expired, and issued by ACM. This client-side error (4xx) happens when AWS validates CloudFront certificate configuration. Most common when certificates aren't in us-east-1 region, but also appears when certificates are expired or invalid, certificate ARNs are incorrect, certificates aren't issued by ACM, or certificate domains don't match the distribution.`,
      metaDescription: 'Fix CloudFrontInvalidViewerCertificate by ensuring certificates are in us-east-1, verifying validity and expiration, using ACM certificate ARNs, checking domain matches, or requesting new certificates with our AWS guide.',
      causes: [
        `Identity: IAM policy allows CloudFront but invalid certificate. Service Control Policy (SCP) enforces certificate validation.`,
        `Network: VPC endpoint CloudFront certificate restrictions. Certificate not in us-east-1 region.`,
        `Limits: Certificate not in us-east-1 region (CloudFront requirement). Certificate expired or invalid. Certificate ARN incorrect. Certificate not issued by ACM. Certificate domain mismatch.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check certificate region: Verify certificate is in us-east-1: aws acm list-certificates --region us-east-1 --query 'CertificateSummaryList[*].[CertificateArn,DomainName,Status]' --output table. CloudFront requires certificates in us-east-1.`,
        `Step 2: Diagnose - Verify certificate validity: Check certificate status: aws acm describe-certificate --certificate-arn ARN --region us-east-1 --query 'Certificate.[DomainName,Status,NotAfter]' --output table. Verify status is 'ISSUED' and not expired.`,
        `Step 3: Diagnose - Verify certificate ARN format: Check ARN format: arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT_ID. Verify certificate exists: aws acm describe-certificate --certificate-arn ARN --region us-east-1.`,
        `Step 4: Fix - Request certificate in us-east-1: Request certificate: aws acm request-certificate --domain-name DOMAIN --validation-method DNS --region us-east-1. Validate certificate. Wait for status to be 'ISSUED'.`,
        `Step 5: Fix - Update CloudFront distribution: Get distribution config: aws cloudfront get-distribution-config --id DIST_ID > dist-config.json. Edit config to set ViewerCertificate with certificate ARN. Update distribution: aws cloudfront update-distribution --id DIST_ID --distribution-config file://dist-config.json --if-match ETAG.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'List ACM Certificates in us-east-1 Region',
          code: `#!/bin/bash
REGION="us-east-1"

echo "=== ACM Certificates in \${REGION} ==="
echo "CloudFront requires certificates in us-east-1"

aws acm list-certificates --region \${REGION} \\
  --query 'CertificateSummaryList[*].[CertificateArn,DomainName,Status]' \\
  --output table

echo "\\n=== Valid Certificates (Status: ISSUED) ==="
aws acm list-certificates --region \${REGION} \\
  --query "CertificateSummaryList[?Status=='ISSUED'].[CertificateArn,DomainName]" \\
  --output table`,
        },
        {
          language: 'bash',
          title: 'Verify Certificate Validity and Region',
          code: `#!/bin/bash
CERT_ARN="arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012"
REGION="us-east-1"

echo "=== Verifying Certificate ==="
echo "Certificate ARN: \${CERT_ARN}"

# Check certificate region
ARN_REGION=\$(echo \${CERT_ARN} | cut -d: -f4)
if [ "\${ARN_REGION}" != "us-east-1" ]; then
  echo "✗ Certificate is not in us-east-1 (CloudFrontInvalidViewerCertificate)"
  echo "Current region: \${ARN_REGION}"
  echo "CloudFront requires certificates in us-east-1"
  exit 1
else
  echo "✓ Certificate is in us-east-1"
fi

# Get certificate details
echo "\\n=== Certificate Details ==="
CERT_INFO=\$(aws acm describe-certificate \\
  --certificate-arn \${CERT_ARN} \\
  --region \${REGION} \\
  --query 'Certificate.[DomainName,Status,NotAfter]' \\
  --output table 2>&1)

if [ \$? -eq 0 ]; then
  echo "\${CERT_INFO}"
  
  STATUS=\$(aws acm describe-certificate \\
    --certificate-arn \${CERT_ARN} \\
    --region \${REGION} \\
    --query 'Certificate.Status' \\
    --output text)
  
  if [ "\${STATUS}" != "ISSUED" ]; then
    echo "\\n✗ Certificate status: \${STATUS} (must be ISSUED)"
    echo "Certificate not ready for CloudFront (CloudFrontInvalidViewerCertificate)"
  else
    echo "\\n✓ Certificate status: ISSUED"
  fi
else
  echo "✗ Certificate not found or error: \${CERT_INFO}"
fi`,
        },
        {
          language: 'bash',
          title: 'Request Certificate in us-east-1 for CloudFront',
          code: `#!/bin/bash
DOMAIN="example.com"
REGION="us-east-1"

echo "=== Requesting Certificate for CloudFront ==="
echo "Domain: \${DOMAIN}"
echo "Region: \${REGION} (required for CloudFront)"

CERT_ARN=\$(aws acm request-certificate \\
  --domain-name \${DOMAIN} \\
  --validation-method DNS \\
  --region \${REGION} \\
  --query 'CertificateArn' \\
  --output text 2>&1)

if [ \$? -eq 0 ] && [ ! -z "\${CERT_ARN}" ]; then
  echo "\\n✓ Certificate requested: \${CERT_ARN}"
  echo "\\n=== Next Steps ==="
  echo "1. Validate certificate (DNS or email)"
  echo "2. Wait for status to become 'ISSUED'"
  echo "3. Use certificate ARN in CloudFront distribution"
  echo "\\nCheck status:"
  echo "aws acm describe-certificate --certificate-arn \${CERT_ARN} --region \${REGION}"
else
  echo "\\n✗ Failed to request certificate"
  echo "Error: \${CERT_ARN}"
fi`,
        },
      ],
      relatedCodes: ['InvalidParameterValue', 'ValidationException'],
      provider: 'aws',
    },
    'CloudFrontDistributionNotDisabled': {
      code: 'CloudFrontDistributionNotDisabled',
      name: 'CloudFront Distribution Not Disabled',
      description: `Getting a **CloudFrontDistributionNotDisabled** error means you're trying to delete a CloudFront distribution that's still enabled—CloudFront requires distributions to be disabled and fully deployed before deletion. This client-side error (4xx) happens when AWS validates distribution state before deletion. Most common when distributions are still enabled, but also appears when deletion is attempted while enabled, distributions aren't fully disabled, deployment is still in progress, or distribution state isn't ready for deletion.`,
      metaDescription: 'Fix CloudFrontDistributionNotDisabled by disabling distributions, waiting for deployment to complete, verifying disabled status, checking distribution status, or retrying deletion after disabling with our AWS guide.',
      causes: [
        `Identity: IAM policy allows CloudFront but distribution not disabled. Service Control Policy (SCP) enforces distribution state.`,
        `Network: VPC endpoint CloudFront restrictions. Distribution still enabled.`,
        `Limits: Distribution still enabled. Distribution deletion attempted while enabled. Distribution not fully disabled. Deployment still in progress. Distribution state not ready for deletion.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check distribution status: aws cloudfront get-distribution --id DIST_ID --query 'Distribution.[Status,DistributionConfig.Enabled]' --output table. Verify if distribution is enabled.`,
        `Step 2: Diagnose - Get distribution config: aws cloudfront get-distribution-config --id DIST_ID > dist-config.json. Extract ETag. Check Enabled field.`,
        `Step 3: Diagnose - Disable distribution: Edit config: jq '.DistributionConfig.Enabled = false' dist-config.json > dist-config-disabled.json. Update distribution: aws cloudfront update-distribution --id DIST_ID --distribution-config file://dist-config-disabled.json --if-match ETAG.`,
        `Step 4: Fix - Wait for deployment: Monitor status: while true; do STATUS=\$(aws cloudfront get-distribution --id DIST_ID --query 'Distribution.Status' --output text); if [ "\$STATUS" = "Deployed" ]; then break; fi; sleep 30; done. Verify distribution is disabled and deployed.`,
        `Step 5: Fix - Delete distribution: Get new ETag: aws cloudfront get-distribution-config --id DIST_ID --query 'ETag' --output text. Delete distribution: aws cloudfront delete-distribution --id DIST_ID --if-match NEW_ETAG.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Disable CloudFront Distribution Before Deletion',
          code: `#!/bin/bash
DIST_ID="E1234567890ABC"

echo "=== Disabling CloudFront Distribution ==="
echo "Distribution ID: \${DIST_ID}"

# Get distribution config
echo "\\n=== Getting Distribution Config ==="
aws cloudfront get-distribution-config --id \${DIST_ID} > dist-config.json

# Get current ETag
ETAG=\$(aws cloudfront get-distribution-config --id \${DIST_ID} \\
  --query 'ETag' \\
  --output text)

echo "ETag: \${ETAG}"

# Disable distribution
echo "\\n=== Updating Config to Disable ==="
jq '.DistributionConfig.Enabled = false' dist-config.json > dist-config-disabled.json

# Update distribution
aws cloudfront update-distribution \\
  --id \${DIST_ID} \\
  --distribution-config file://dist-config-disabled.json \\
  --if-match \${ETAG} \\
  --output json

if [ \$? -eq 0 ]; then
  echo "\\n✓ Distribution update initiated"
  echo "Waiting for deployment to complete..."
else
  echo "\\n✗ Failed to update distribution"
  exit 1
fi`,
        },
        {
          language: 'bash',
          title: 'Wait for Distribution Deployment and Delete',
          code: `#!/bin/bash
DIST_ID="E1234567890ABC"

echo "=== Waiting for Distribution Deployment ==="
echo "Distribution ID: \${DIST_ID}"

# Wait for deployment to complete
MAX_WAIT=1800  # 30 minutes
WAITED=0

while [ \${WAITED} -lt \${MAX_WAIT} ]; do
  STATUS=\$(aws cloudfront get-distribution --id \${DIST_ID} \\
    --query 'Distribution.Status' \\
    --output text 2>/dev/null)
  
  if [ "\${STATUS}" = "Deployed" ]; then
    echo "\\n✓ Distribution is disabled and deployed"
    break
  fi
  
  echo "Status: \${STATUS}, waiting... (\${WAITED}s)"
  sleep 30
  WAITED=\$((WAITED + 30))
done

if [ "\${STATUS}" = "Deployed" ]; then
  echo "\\n=== Deleting Distribution ==="
  NEW_ETAG=\$(aws cloudfront get-distribution-config --id \${DIST_ID} \\
    --query 'ETag' \\
    --output text)
  
  aws cloudfront delete-distribution \\
    --id \${DIST_ID} \\
    --if-match \${NEW_ETAG} \\
    --output json
  
  if [ \$? -eq 0 ]; then
    echo "\\n✓ Distribution deletion initiated"
  else
    echo "\\n✗ Failed to delete distribution (CloudFrontDistributionNotDisabled)"
  fi
else
  echo "\\n✗ Timeout waiting for deployment"
fi`,
        },
      ],
      relatedCodes: ['InvalidState', 'InvalidRequest'],
      provider: 'aws',
    },
    'EC2InvalidKeyPairNotFound': {
      code: 'EC2InvalidKeyPairNotFound',
      name: 'EC2 Invalid Key Pair Not Found',
      description: `Getting an **EC2InvalidKeyPairNotFound** error means the EC2 key pair you specified doesn't exist in the current region—the key pair might be in a different region, was deleted, or the name is misspelled. This client-side error (4xx) happens when AWS validates EC2 key pair existence. Most common when key pair names don't exist, but also appears when key pairs are in different regions, key pairs have been deleted, incorrect key pair name formats are used, or key pair name typos occur.`,
      metaDescription: 'Fix EC2InvalidKeyPairNotFound by verifying key pair names, listing all key pairs to find correct names, checking correct regions, creating new key pairs if needed, or using correct name formats with our AWS guide.',
      causes: [
        `Identity: IAM policy allows EC2 launch but key pair doesn't exist. Service Control Policy (SCP) restricts key pair access.`,
        `Network: VPC endpoint EC2 key pair restrictions. Cross-region key pair access.`,
        `Limits: Key pair name does not exist. Key pair in different region. Key pair has been deleted. Incorrect key pair name format. Key pair name typo.`,
      ],
      solutions: [
        `Step 1: Diagnose - List all key pairs in region: aws ec2 describe-key-pairs --region REGION --query 'KeyPairs[*].[KeyName,KeyPairId]' --output table. Check if key pair name is in the list.`,
        `Step 2: Diagnose - Verify key pair in specific region: aws ec2 describe-key-pairs --key-names KEY_NAME --region REGION --query 'KeyPairs[0].[KeyName,KeyPairId]' --output table. Verify region is correct.`,
        `Step 3: Diagnose - Search key pairs across regions: Loop through regions: for region in us-east-1 us-west-2; do aws ec2 describe-key-pairs --key-names KEY_NAME --region \$region; done. Find which region has the key pair.`,
        `Step 4: Fix - Use correct key pair name: Verify key pair name from list. Check for typos. Use exact key pair name (case-sensitive). Verify key pair exists in current region.`,
        `Step 5: Fix - Create new key pair if needed: Create key pair: aws ec2 create-key-pair --key-name KEY_NAME --region REGION --query 'KeyMaterial' --output text > KEY_NAME.pem. Set permissions: chmod 400 KEY_NAME.pem. Or use existing key pair in correct region.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'List All EC2 Key Pairs to Find Correct Name',
          code: `#!/bin/bash
REGION="us-east-1"

echo "=== All Key Pairs in \${REGION} ==="
aws ec2 describe-key-pairs --region \${REGION} \\
  --query 'KeyPairs[*].[KeyName,KeyPairId]' \\
  --output table

# Search for specific key pair
KEY_NAME="my-key-pair"
echo "\\n=== Searching for Key Pair: \${KEY_NAME} ==="

if aws ec2 describe-key-pairs --key-names \${KEY_NAME} --region \${REGION} &>/dev/null; then
  echo "✓ Key pair exists in \${REGION}"
  
  # Get key pair details
  aws ec2 describe-key-pairs --key-names \${KEY_NAME} --region \${REGION} \\
    --query 'KeyPairs[0].[KeyName,KeyPairId]' \\
    --output table
else
  echo "✗ Key pair not found (EC2InvalidKeyPairNotFound)"
  
  echo "\\n=== Similar Key Pair Names ==="
  aws ec2 describe-key-pairs --region \${REGION} \\
    --query "KeyPairs[?contains(KeyName, 'my')].KeyName" \\
    --output table
fi`,
        },
        {
          language: 'bash',
          title: 'Check Key Pairs Across Regions',
          code: `#!/bin/bash
KEY_NAME="my-key-pair"
REGIONS=("us-east-1" "us-west-2" "eu-west-1" "ap-southeast-1")

echo "=== Checking Key Pairs Across Regions ==="
for REGION in "\${REGIONS[@]}"; do
  echo "\\nChecking region: \${REGION}"
  
  RESULT=\$(aws ec2 describe-key-pairs \\
    --key-names \${KEY_NAME} \\
    --region \${REGION} \\
    --query 'KeyPairs[0].KeyName' \\
    --output text 2>/dev/null)
  
  if [ ! -z "\${RESULT}" ] && [ "\${RESULT}" != "None" ]; then
    echo "✓ Key pair found in \${REGION}: \${RESULT}"
    break
  else
    echo "✗ Key pair not found in \${REGION}"
  fi
done`,
        },
        {
          language: 'bash',
          title: 'Create New EC2 Key Pair',
          code: `#!/bin/bash
KEY_NAME="my-key-pair"
REGION="us-east-1"

echo "=== Creating New Key Pair ==="
echo "Key name: \${KEY_NAME}"
echo "Region: \${REGION}"

KEY_MATERIAL=\$(aws ec2 create-key-pair \\
  --key-name \${KEY_NAME} \\
  --region \${REGION} \\
  --query 'KeyMaterial' \\
  --output text 2>&1)

if [ \$? -eq 0 ] && [ ! -z "\${KEY_MATERIAL}" ]; then
  echo "\\n✓ Key pair created successfully"
  
  # Save key material
  echo "\${KEY_MATERIAL}" > \${KEY_NAME}.pem
  chmod 400 \${KEY_NAME}.pem
  
  echo "\\nKey saved to: \${KEY_NAME}.pem"
  echo "Permissions set to 400 (read-only for owner)"
else
  echo "\\n✗ Failed to create key pair"
  echo "Error: \${KEY_MATERIAL}"
  echo "Key pair may already exist (EC2InvalidKeyPairNotFound if trying to use)"
fi`,
        },
      ],
      relatedCodes: ['ResourceNotFoundException', 'InvalidParameterValue'],
      provider: 'aws',
    },
    'EC2InvalidSecurityGroupNotFound': {
      code: 'EC2InvalidSecurityGroupNotFound',
      name: 'EC2 Invalid Security Group Not Found',
      description: `Getting an **EC2InvalidSecurityGroupNotFound** error means the EC2 security group you specified doesn't exist—the security group might be in a different VPC or region, was deleted, or the ID/name is misspelled. This client-side error (4xx) happens when AWS validates EC2 security group existence. Most common when security group IDs don't exist, but also appears when security group names don't exist, security groups are in different VPCs, security groups are in different regions, or security groups have been deleted.`,
      metaDescription: 'Fix EC2InvalidSecurityGroupNotFound by verifying security group IDs or names, listing all security groups to find correct ones, checking correct VPCs and regions, or creating new security groups with our AWS guide.',
      causes: [
        `Identity: IAM policy allows EC2 launch but security group doesn't exist. Service Control Policy (SCP) restricts security group access.`,
        `Network: VPC endpoint EC2 security group restrictions. Security group in different VPC. Security group in different region.`,
        `Limits: Security group ID does not exist. Security group name does not exist. Security group in different VPC. Security group in different region. Security group has been deleted.`,
      ],
      solutions: [
        `Step 1: Diagnose - List all security groups: aws ec2 describe-security-groups --query 'SecurityGroups[*].[GroupId,GroupName,VpcId]' --output table. Check if security group ID or name is in the list.`,
        `Step 2: Diagnose - List security groups in specific VPC: aws ec2 describe-security-groups --filters "Name=vpc-id,Values=VPC_ID" --query 'SecurityGroups[*].[GroupId,GroupName]' --output table. Verify security group exists in current VPC.`,
        `Step 3: Diagnose - Search security groups by name: aws ec2 describe-security-groups --filters "Name=group-name,Values=SG_NAME" --query 'SecurityGroups[*].[GroupId,VpcId]' --output table. Find security group in correct VPC.`,
        `Step 4: Fix - Use correct security group ID or name: Verify security group ID from list. Check for typos. Use exact security group ID (case-sensitive). Verify security group exists in current VPC and region.`,
        `Step 5: Fix - Create new security group if needed: Create security group: aws ec2 create-security-group --group-name SG_NAME --description "Description" --vpc-id VPC_ID. Or use existing security group in correct VPC.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'List All EC2 Security Groups to Find Correct ID',
          code: `#!/bin/bash
echo "=== All Security Groups ==="
aws ec2 describe-security-groups \\
  --query 'SecurityGroups[*].[GroupId,GroupName,VpcId]' \\
  --output table

# Search for specific security group
SG_ID="sg-1234567890abcdef0"
echo "\\n=== Searching for Security Group: \${SG_ID} ==="

if aws ec2 describe-security-groups --group-ids \${SG_ID} &>/dev/null; then
  echo "✓ Security group exists"
  
  # Get security group details
  aws ec2 describe-security-groups --group-ids \${SG_ID} \\
    --query 'SecurityGroups[0].[GroupId,GroupName,VpcId,Description]' \\
    --output table
else
  echo "✗ Security group not found (EC2InvalidSecurityGroupNotFound)"
fi`,
        },
        {
          language: 'bash',
          title: 'List Security Groups in Specific VPC',
          code: `#!/bin/bash
VPC_ID="vpc-1234567890abcdef0"

echo "=== Security Groups in VPC ==="
echo "VPC ID: \${VPC_ID}"

aws ec2 describe-security-groups \\
  --filters "Name=vpc-id,Values=\${VPC_ID}" \\
  --query 'SecurityGroups[*].[GroupId,GroupName,Description]' \\
  --output table

# Search by name
SG_NAME="my-security-group"
echo "\\n=== Security Groups with Name: \${SG_NAME} ==="
aws ec2 describe-security-groups \\
  --filters "Name=group-name,Values=\${SG_NAME}" \\
  --query 'SecurityGroups[*].[GroupId,VpcId]' \\
  --output table`,
        },
        {
          language: 'bash',
          title: 'Create New Security Group',
          code: `#!/bin/bash
SG_NAME="my-security-group"
VPC_ID="vpc-1234567890abcdef0"
DESCRIPTION="My security group"

echo "=== Creating New Security Group ==="
echo "Group name: \${SG_NAME}"
echo "VPC ID: \${VPC_ID}"

SG_ID=\$(aws ec2 create-security-group \\
  --group-name \${SG_NAME} \\
  --description "\${DESCRIPTION}" \\
  --vpc-id \${VPC_ID} \\
  --query 'GroupId' \\
  --output text 2>&1)

if [ \$? -eq 0 ] && [ ! -z "\${SG_ID}" ]; then
  echo "\\n✓ Security group created: \${SG_ID}"
  
  echo "\\n=== Security Group Details ==="
  aws ec2 describe-security-groups --group-ids \${SG_ID} \\
    --query 'SecurityGroups[0].[GroupId,GroupName,VpcId,Description]' \\
    --output table
else
  echo "\\n✗ Failed to create security group"
  echo "Error: \${SG_ID}"
  echo "Security group may already exist (EC2InvalidSecurityGroupNotFound if trying to use)"
fi`,
        },
      ],
      relatedCodes: ['ResourceNotFoundException', 'InvalidParameterValue'],
      provider: 'aws',
    },
    'IAMUnmodifiableEntity': {
      code: 'IAMUnmodifiableEntity',
      name: 'IAM Unmodifiable Entity',
      description: `Getting an **IAMUnmodifiableEntity** error means the IAM entity (user, role, or policy) you're trying to modify cannot be modified—AWS managed entities have restrictions on modifications, and you must create customer managed alternatives. This client-side error (4xx) happens when AWS validates IAM entity modification permissions. Most common when AWS managed policies cannot be modified, but also appears when service-linked roles have restrictions, AWS managed users have limitations, entities have modification restrictions, or entities are read-only.`,
      metaDescription: 'Fix IAMUnmodifiableEntity by creating customer managed policies instead, creating new entities with desired configurations, using attachable policy versions, checking modification permissions, or reviewing entity type restrictions with our AWS guide.',
      causes: [
        `Identity: IAM entity modification restrictions. Service Control Policy (SCP) enforces entity modification rules.`,
        `Network: VPC endpoint IAM entity modification restrictions. Entity has modification restrictions.`,
        `Limits: AWS managed policy cannot be modified. Service-linked role restrictions. AWS managed user limitations. Entity has modification restrictions. Read-only entity.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check if policy is AWS managed: Verify ARN: aws iam get-policy --policy-arn POLICY_ARN --query 'Policy.Arn' --output text. AWS managed policies have ARN format: arn:aws:iam::aws:policy/NAME.`,
        `Step 2: Diagnose - Check entity type: Verify if entity is AWS managed, customer managed, or service-linked. Service-linked roles and AWS managed entities have restrictions.`,
        `Step 3: Diagnose - Review modification restrictions: AWS managed policies cannot be modified. Service-linked roles have limited modification options. Check entity documentation.`,
        `Step 4: Fix - Create customer managed policy: Create new policy: aws iam create-policy --policy-name POLICY_NAME --policy-document file://policy.json. Customer managed policies can be modified.`,
        `Step 5: Fix - Use attachable policy versions or create new entity: For policies: Create customer managed version. For roles: Create new role with desired configuration. For users: Create new user with desired configuration.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check if IAM Policy is AWS Managed (Unmodifiable)',
          code: `#!/bin/bash
POLICY_ARN="arn:aws:iam::aws:policy/ReadOnlyAccess"

echo "=== Checking Policy Type ==="
echo "Policy ARN: \${POLICY_ARN}"

# Check if AWS managed
ARN_REGION=\$(echo \${POLICY_ARN} | cut -d: -f5)
if [ "\${ARN_REGION}" = "aws" ]; then
  echo "✗ Policy is AWS managed (IAMUnmodifiableEntity)"
  echo "AWS managed policies cannot be modified"
  POLICY_TYPE="AWS"
else
  echo "✓ Policy is customer managed"
  POLICY_TYPE="Customer"
fi

# Get policy details
echo "\\n=== Policy Details ==="
aws iam get-policy --policy-arn \${POLICY_ARN} \\
  --query 'Policy.[PolicyName,Arn,IsAttachable]' \\
  --output table

if [ "\${POLICY_TYPE}" = "AWS" ]; then
  echo "\\n=== Solution ==="
  echo "Create a customer managed policy instead"
fi`,
        },
        {
          language: 'bash',
          title: 'Create Customer Managed Policy (Modifiable)',
          code: `#!/bin/bash
POLICY_NAME="my-custom-policy"
POLICY_FILE="custom-policy.json"

echo "=== Creating Customer Managed Policy ==="

# Create policy document
cat > \${POLICY_FILE} <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "*"
    }
  ]
}
EOF

echo "Policy document created: \${POLICY_FILE}"

# Create customer managed policy (can be modified)
POLICY_ARN=\$(aws iam create-policy \\
  --policy-name \${POLICY_NAME} \\
  --policy-document file://\${POLICY_FILE} \\
  --query 'Policy.Arn' \\
  --output text 2>&1)

if [ \$? -eq 0 ] && [ ! -z "\${POLICY_ARN}" ]; then
  echo "\\n✓ Customer managed policy created: \${POLICY_ARN}"
  echo "This policy can be modified (unlike AWS managed policies)"
else
  echo "\\n✗ Failed to create policy"
  echo "Error: \${POLICY_ARN}"
fi`,
        },
        {
          language: 'bash',
          title: 'Modify Customer Managed Policy',
          code: `#!/bin/bash
POLICY_ARN="arn:aws:iam::123456789012:policy/my-custom-policy"
NEW_POLICY_FILE="new-policy.json"

echo "=== Modifying Customer Managed Policy ==="
echo "Policy ARN: \${POLICY_ARN}"

# Check if customer managed
ARN_REGION=\$(echo \${POLICY_ARN} | cut -d: -f5)
if [ "\${ARN_REGION}" = "aws" ]; then
  echo "✗ Cannot modify AWS managed policy (IAMUnmodifiableEntity)"
  exit 1
fi

# Create new policy version
echo "\\n=== Creating New Policy Version ==="
aws iam create-policy-version \\
  --policy-arn \${POLICY_ARN} \\
  --policy-document file://\${NEW_POLICY_FILE} \\
  --set-as-default \\
  --output json

if [ \$? -eq 0 ]; then
  echo "\\n✓ Policy version created and set as default"
else
  echo "\\n✗ Failed to create policy version"
fi`,
        },
      ],
      relatedCodes: ['InvalidParameterValue', 'InvalidRequest'],
      provider: 'aws',
    },
    'CloudFrontCNAMEAlreadyExists': {
      code: 'CloudFrontCNAMEAlreadyExists',
      name: 'CloudFront CNAME Already Exists',
      description: `Getting a **CloudFrontCNAMEAlreadyExists** error means the CNAME (alternate domain name) you're trying to use is already in use by another CloudFront distribution—each CNAME must be unique across all distributions, so you can't reuse the same domain name. This client-side error (4xx) happens when AWS validates CNAME uniqueness. Most common when CNAMEs are already used by other distributions, but also appears when domain names are already configured, duplicate CNAME assignments occur, previous distributions are using the CNAME, or CNAME conflicts exist with existing distributions.`,
      metaDescription: 'Fix CloudFrontCNAMEAlreadyExists by using different domain names, removing CNAMEs from other distributions, verifying CNAME availability, checking all distributions for usage, or using unique domain names with our AWS guide.',
      causes: [
        `Identity: IAM policy allows CloudFront but CNAME conflict. Service Control Policy (SCP) enforces CNAME uniqueness.`,
        `Network: VPC endpoint CloudFront CNAME restrictions. CNAME already used by another distribution.`,
        `Limits: CNAME already used by another distribution. Domain name already configured. Duplicate CNAME assignment. Previous distribution using CNAME. CNAME conflict with existing distribution.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check if CNAME is in use: List all distributions: aws cloudfront list-distributions --query 'DistributionList.Items[*].[Id,Aliases.Items]' --output json. Search for CNAME in Aliases.`,
        `Step 2: Diagnose - Find which distribution uses CNAME: aws cloudfront list-distributions --query "DistributionList.Items[?contains(Aliases.Items[0], 'CNAME')].[Id,Aliases.Items]" --output table. Identify conflicting distribution.`,
        `Step 3: Diagnose - Verify CNAME availability: Check if CNAME exists in any distribution. Verify no other distribution uses the CNAME.`,
        `Step 4: Fix - Remove CNAME from other distribution: Get distribution config: aws cloudfront get-distribution-config --id DIST_ID > dist-config.json. Edit config to remove CNAME from Aliases.Items. Update distribution: aws cloudfront update-distribution --id DIST_ID --distribution-config file://dist-config.json --if-match ETAG.`,
        `Step 5: Fix - Use different domain name: Choose unique CNAME. Verify it's not in use. Or wait for other distribution to release CNAME. Use unique domain name.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Check if CNAME is Already in Use',
          code: `#!/bin/bash
CNAME="cdn.example.com"

echo "=== Checking CNAME Availability ==="
echo "CNAME: \${CNAME}"

# List all distributions and their aliases
echo "\\n=== All Distributions and CNAMEs ==="
aws cloudfront list-distributions \\
  --query 'DistributionList.Items[*].[Id,Aliases.Items]' \\
  --output json > distributions.json

# Check for CNAME conflict
if grep -q "\${CNAME}" distributions.json; then
  echo "\\n✗ CNAME \${CNAME} is already in use (CloudFrontCNAMEAlreadyExists)"
  
  # Find which distribution uses it
  echo "\\n=== Distribution Using CNAME ==="
  aws cloudfront list-distributions \\
    --query "DistributionList.Items[?contains(Aliases.Items[0], '\${CNAME}')].[Id,Aliases.Items]" \\
    --output table
else
  echo "\\n✓ CNAME \${CNAME} is available"
fi`,
        },
        {
          language: 'bash',
          title: 'Add CNAME to CloudFront Distribution',
          code: `#!/bin/bash
DIST_ID="E1234567890ABC"
CNAME="cdn.example.com"

echo "=== Adding CNAME to Distribution ==="
echo "Distribution ID: \${DIST_ID}"
echo "CNAME: \${CNAME}"

# Check if CNAME is available first
echo "\\n=== Checking CNAME Availability ==="
# ... (use previous check logic)

# Get distribution config
echo "\\n=== Getting Distribution Config ==="
aws cloudfront get-distribution-config --id \${DIST_ID} > dist-config.json

# Get ETag
ETAG=\$(aws cloudfront get-distribution-config --id \${DIST_ID} \\
  --query 'ETag' \\
  --output text)

# Add CNAME to Aliases.Items
echo "\\n=== Adding CNAME to Config ==="
jq ".DistributionConfig.Aliases.Items += [\"\${CNAME}\"]" dist-config.json > dist-config-updated.json
jq '.DistributionConfig.Aliases.Quantity = (.DistributionConfig.Aliases.Items | length)' dist-config-updated.json > dist-config-final.json

# Update distribution
echo "\\n=== Updating Distribution ==="
aws cloudfront update-distribution \\
  --id \${DIST_ID} \\
  --distribution-config file://dist-config-final.json \\
  --if-match \${ETAG} \\
  --output json

if [ \$? -eq 0 ]; then
  echo "\\n✓ CNAME added successfully"
else
  echo "\\n✗ Failed to add CNAME (may be CloudFrontCNAMEAlreadyExists)"
fi`,
        },
      ],
      relatedCodes: ['EntityAlreadyExists', 'InvalidParameterValue'],
      provider: 'aws',
    },
    'EC2InvalidSubnetIDNotFound': {
      code: 'EC2InvalidSubnetIDNotFound',
      name: 'EC2 Invalid Subnet ID Not Found',
      description: `Getting an **EC2InvalidSubnetIDNotFound** error means the EC2 subnet ID you specified doesn't exist—the subnet might be in a different VPC or region, was deleted, or the ID is misspelled. This client-side error (4xx) happens when AWS validates EC2 subnet existence. Most common when subnet IDs don't exist, but also appears when subnets are in different VPCs, subnets are in different regions, subnets have been deleted, or incorrect subnet ID formats are used.`,
      metaDescription: 'Fix EC2InvalidSubnetIDNotFound by verifying subnet IDs, listing all subnets to find correct IDs, checking correct VPCs and regions, or using correct subnet ID formats with our AWS guide.',
      causes: [
        `Identity: IAM policy allows EC2 launch but subnet doesn't exist. Service Control Policy (SCP) restricts subnet access.`,
        `Network: VPC endpoint EC2 subnet restrictions. Subnet in different VPC. Subnet in different region.`,
        `Limits: Subnet ID does not exist. Subnet in different VPC. Subnet in different region. Subnet has been deleted. Incorrect subnet ID format.`,
      ],
      solutions: [
        `Step 1: Diagnose - List all subnets: aws ec2 describe-subnets --query 'Subnets[*].[SubnetId,VpcId,AvailabilityZone,CidrBlock]' --output table. Check if subnet ID is in the list.`,
        `Step 2: Diagnose - List subnets in specific VPC: aws ec2 describe-subnets --filters "Name=vpc-id,Values=VPC_ID" --query 'Subnets[*].[SubnetId,AvailabilityZone,CidrBlock]' --output table. Verify subnet exists in current VPC.`,
        `Step 3: Diagnose - List subnets by availability zone: aws ec2 describe-subnets --filters "Name=availability-zone,Values=AZ" --query 'Subnets[*].[SubnetId,VpcId]' --output table. Find subnet in correct AZ and VPC.`,
        `Step 4: Fix - Use correct subnet ID: Verify subnet ID from list. Check for typos. Use exact subnet ID (case-sensitive). Verify subnet exists in current VPC and region.`,
        `Step 5: Fix - Create new subnet if needed: Create subnet: aws ec2 create-subnet --vpc-id VPC_ID --cidr-block CIDR --availability-zone AZ. Or use existing subnet in correct VPC.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'List All EC2 Subnets to Find Correct ID',
          code: `#!/bin/bash
echo "=== All Subnets ==="
aws ec2 describe-subnets \\
  --query 'Subnets[*].[SubnetId,VpcId,AvailabilityZone,CidrBlock]' \\
  --output table

# Search for specific subnet
SUBNET_ID="subnet-1234567890abcdef0"
echo "\\n=== Searching for Subnet: \${SUBNET_ID} ==="

if aws ec2 describe-subnets --subnet-ids \${SUBNET_ID} &>/dev/null; then
  echo "✓ Subnet exists"
  
  # Get subnet details
  aws ec2 describe-subnets --subnet-ids \${SUBNET_ID} \\
    --query 'Subnets[0].[SubnetId,VpcId,AvailabilityZone,CidrBlock]' \\
    --output table
else
  echo "✗ Subnet not found (EC2InvalidSubnetIDNotFound)"
fi`,
        },
        {
          language: 'bash',
          title: 'List Subnets in Specific VPC',
          code: `#!/bin/bash
VPC_ID="vpc-1234567890abcdef0"

echo "=== Subnets in VPC ==="
echo "VPC ID: \${VPC_ID}"

aws ec2 describe-subnets \\
  --filters "Name=vpc-id,Values=\${VPC_ID}" \\
  --query 'Subnets[*].[SubnetId,AvailabilityZone,CidrBlock,AvailableIpAddressCount]' \\
  --output table

# List subnets by availability zone
AZ="us-east-1a"
echo "\\n=== Subnets in Availability Zone: \${AZ} ==="
aws ec2 describe-subnets \\
  --filters "Name=availability-zone,Values=\${AZ}" \\
  --query 'Subnets[*].[SubnetId,VpcId]' \\
  --output table`,
        },
        {
          language: 'bash',
          title: 'Create New EC2 Subnet',
          code: `#!/bin/bash
VPC_ID="vpc-1234567890abcdef0"
CIDR_BLOCK="10.0.1.0/24"
AZ="us-east-1a"

echo "=== Creating New Subnet ==="
echo "VPC ID: \${VPC_ID}"
echo "CIDR Block: \${CIDR_BLOCK}"
echo "Availability Zone: \${AZ}"

SUBNET_ID=\$(aws ec2 create-subnet \\
  --vpc-id \${VPC_ID} \\
  --cidr-block \${CIDR_BLOCK} \\
  --availability-zone \${AZ} \\
  --query 'Subnet.SubnetId' \\
  --output text 2>&1)

if [ \$? -eq 0 ] && [ ! -z "\${SUBNET_ID}" ]; then
  echo "\\n✓ Subnet created: \${SUBNET_ID}"
  
  echo "\\n=== Subnet Details ==="
  aws ec2 describe-subnets --subnet-ids \${SUBNET_ID} \\
    --query 'Subnets[0].[SubnetId,VpcId,AvailabilityZone,CidrBlock]' \\
    --output table
else
  echo "\\n✗ Failed to create subnet"
  echo "Error: \${SUBNET_ID}"
  echo "Check VPC ID, CIDR block, and availability zone"
fi`,
        },
      ],
      relatedCodes: ['ResourceNotFoundException', 'InvalidParameterValue'],
      provider: 'aws',
    },
    'IAMConcurrentModification': {
      code: 'IAMConcurrentModification',
      name: 'IAM Concurrent Modification',
      description: `Getting an **IAMConcurrentModification** error means multiple requests to modify the same IAM entity are being processed simultaneously, causing a conflict—you need to wait for the current operation to complete before retrying. This client-side error (4xx) happens when AWS detects concurrent modification attempts. Most common when simultaneous policy updates occur, but also appears when concurrent role modifications happen, multiple users update the same entity, race conditions occur in updates, or overlapping modification requests are made.`,
      metaDescription: 'Fix IAMConcurrentModification by waiting for operations to complete, retrying after delays, implementing retry logic with backoff, checking entity state before modifying, or using conditional updates with our AWS guide.',
      causes: [
        `Identity: IAM entity concurrent modification conflict. Service Control Policy (SCP) enforces modification ordering.`,
        `Network: VPC endpoint IAM modification restrictions. Simultaneous modification requests.`,
        `Limits: Simultaneous policy updates. Concurrent role modifications. Multiple users updating same entity. Race condition in updates. Overlapping modification requests.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check entity state: Verify entity exists: aws iam get-user --user-name USER_NAME. Check if entity is in use: aws iam list-attached-user-policies --user-name USER_NAME.`,
        `Step 2: Diagnose - Wait for current operation: Check if operation is in progress. Review CloudTrail logs for recent modifications. Wait 5-30 seconds before retry.`,
        `Step 3: Diagnose - Implement retry with backoff: Use exponential backoff: delay=1, then 2, 4, 8 seconds. Retry up to 5 times. Check error code is IAMConcurrentModification.`,
        `Step 4: Fix - Retry after delay: Wait 5-10 seconds. Retry the modification request. If still fails, wait longer and retry.`,
        `Step 5: Fix - Use conditional updates or implement retry logic: Check entity state before modifying. Use exponential backoff retry logic. Or use conditional updates if available. Avoid concurrent modifications.`,
      ],
      codeExamples: [
        {
          language: 'bash',
          title: 'Retry IAM Operation with Exponential Backoff',
          code: `#!/bin/bash
USER_NAME="my-user"
NEW_PATH="/updated/"

echo "=== Retrying IAM Operation with Exponential Backoff ==="

MAX_ATTEMPTS=5
DELAY=1
ATTEMPT=1

while [ \${ATTEMPT} -le \${MAX_ATTEMPTS} ]; do
  echo "\\nAttempt \${ATTEMPT} of \${MAX_ATTEMPTS}"
  
  RESULT=\$(aws iam update-user \\
    --user-name \${USER_NAME} \\
    --new-path \${NEW_PATH} 2>&1)
  
  if [ \$? -eq 0 ]; then
    echo "✓ Operation succeeded on attempt \${ATTEMPT}"
    exit 0
  else
    # Check if error is ConcurrentModification
    if echo "\${RESULT}" | grep -q "ConcurrentModification"; then
      if [ \${ATTEMPT} -lt \${MAX_ATTEMPTS} ]; then
        echo "✗ Concurrent modification detected (IAMConcurrentModification)"
        echo "Retrying in \${DELAY}s..."
        sleep \${DELAY}
        DELAY=\$((DELAY * 2))
        ATTEMPT=\$((ATTEMPT + 1))
      else
        echo "✗ Operation failed after \${MAX_ATTEMPTS} attempts"
        exit 1
      fi
    else
      echo "✗ Operation failed with different error"
      echo "\${RESULT}"
      exit 1
    fi
  fi
done`,
        },
        {
          language: 'bash',
          title: 'Check Entity State Before Modification',
          code: `#!/bin/bash
USER_NAME="my-user"

echo "=== Checking Entity State ==="
echo "User: \${USER_NAME}"

# Verify entity exists
USER_INFO=\$(aws iam get-user --user-name \${USER_NAME} 2>&1)

if [ \$? -eq 0 ]; then
  echo "✓ User exists"
  
  # Check if entity is in use
  echo "\\n=== Checking User Dependencies ==="
  POLICY_COUNT=\$(aws iam list-attached-user-policies --user-name \${USER_NAME} \\
    --query 'length(AttachedPolicies)' \\
    --output text)
  
  echo "Attached policies: \${POLICY_COUNT}"
  
  echo "\\n=== Safe to Modify ==="
  echo "Entity state checked, proceed with modification"
else
  echo "✗ User not found"
  echo "Error: \${USER_INFO}"
fi`,
        },
        {
          language: 'bash',
          title: 'Simple Retry After Delay',
          code: `#!/bin/bash
USER_NAME="my-user"
NEW_PATH="/updated/"

echo "=== Simple Retry After Delay ==="

# First attempt
echo "Attempting modification..."
RESULT=\$(aws iam update-user \\
  --user-name \${USER_NAME} \\
  --new-path \${NEW_PATH} 2>&1)

if [ \$? -ne 0 ]; then
  if echo "\${RESULT}" | grep -q "ConcurrentModification"; then
    echo "✗ Concurrent modification detected (IAMConcurrentModification)"
    echo "Waiting 10 seconds before retry..."
    
    sleep 10
    
    echo "\\nRetrying modification..."
    aws iam update-user \\
      --user-name \${USER_NAME} \\
      --new-path \${NEW_PATH}
    
    if [ \$? -eq 0 ]; then
      echo "\\n✓ Operation succeeded on retry"
    else
      echo "\\n✗ Operation failed on retry"
    fi
  else
    echo "✗ Different error occurred"
    echo "\${RESULT}"
  fi
else
  echo "✓ Operation succeeded on first attempt"
fi`,
        },
      ],
      relatedCodes: ['ConcurrentModification', 'ServiceUnavailable'],
      provider: 'aws',
  },
};