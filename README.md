# 🛠️ KaamKaro — Serverless Todo API on AWS


A lightweight, fully serverless **Todo / Task Management REST API** built with **Node.js**, deployed on **AWS Lambda + API Gateway (HTTP API)**, backed by **DynamoDB**, and provisioned entirely through the **Serverless Framework**.

The project uses playful Hindi/Hinglish naming for its functions — `kaam` means **"work" / "task"** — making the codebase both functional and fun to read:

| Function | Meaning | What it does |
|---|---|---|
| `kaamBharo` | *"Fill in the work"* | Create a new task |
| `kaamDikhao` | *"Show the work"* | List all tasks |
| `kaamKhatamKaro` | *"Finish the work"* | Mark a task as completed |
| `kaamBarbad` | *"Destroy the work"* | Delete a task |

---

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [AWS & Serverless Setup](#-aws--serverless-setup)
- [Installation](#-installation)
- [Deployment](#-deployment)
- [API Reference](#-api-reference)
- [DynamoDB Table Schema](#-dynamodb-table-schema)
- [Local Development & Testing](#-local-development--testing)
- [Removing the Stack](#-removing-the-stack)
- [Security Notes](#-security-notes)
- [Troubleshooting](#-troubleshooting)


---

## 🏗 Architecture

```
                        ┌────────────────────┐
                        │   Client / curl     │
                        └─────────┬───────────┘
                                  │  HTTPS
                                  ▼
                     ┌────────────────────────┐
                     │  API Gateway (HTTP API) │
                     └────────────┬────────────┘
                                  │
        ┌───────────────┬────────┴────────┬───────────────┐
        ▼               ▼                 ▼               ▼
 ┌─────────────┐ ┌──────────────┐ ┌────────────────┐ ┌────────────┐
 │  hello.js   │ │ kaamBharo.js │ │ kaamDikhao.js   │ │kaamKhatam  │
 │  GET /      │ │ POST /kaam   │ │ GET /kaam       │ │Karo.js     │
 └─────────────┘ └──────┬───────┘ └────────┬────────┘ │PUT /kaam/  │
                         │                  │          │{id}       │
                         │                  │          └─────┬──────┘
                         │                  │                │
                         │          ┌───────▼────────────────▼─────┐
                         └─────────►│   DynamoDB Table: KaamKaro    │
                                    │   (Pay-per-request billing)   │
                         ┌─────────►└───────────────▲───────────────┘
                         │                           │
                 ┌───────┴────────┐                  │
                 │ kaamBarbad.js  │──────────────────┘
                 │ DELETE /kaam/  │
                 │ {id}           │
                 └────────────────┘
```

Every function is an **independent AWS Lambda**, wired to its own route via **API Gateway HTTP API**, and shares a single **DynamoDB table** (`KaamKaro`) for persistence. There is no server to manage — everything scales automatically and you pay only for what you use (DynamoDB is configured with `PAY_PER_REQUEST` billing).

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Compute | AWS Lambda (Node.js 22.x runtime) |
| API Layer | Amazon API Gateway (HTTP API) |
| Database | Amazon DynamoDB (on-demand / pay-per-request) |
| IaC / Deployment | [Serverless Framework](https://www.serverless.com/) v4 |
| Language | Node.js (CommonJS) |
| Key Libraries | `aws-sdk`, `uuid` |
| Cloud Provider | AWS (`your_region` region) |

---

## 📁 Project Structure

```
aws-node-http-api-project/
├── src/
│   ├── hello.js              # Simple health-check / demo endpoint
│   ├── kaamBharo.js          # POST   /kaam        -> Create a task
│   ├── kaamDikhao.js         # GET    /kaam        -> List all tasks
│   ├── kaamKhatamKaro.js     # PUT    /kaam/{id}   -> Mark task completed
│   └── kaamBarbad.js         # DELETE /kaam/{id}   -> Delete a task
├── serverless.yml            # Infrastructure-as-code (Lambdas, routes, DynamoDB)
├── package.json               # Node dependencies & metadata
├── package-lock.json
├── notes.txt                  # Personal cheat-sheet of CLI commands
├── .gitignore
└── README.md                  # You are here 📍
```

---

## ✅ Prerequisites

Before you deploy, make sure you have:

- **Node.js** ≥ 18.x installed ([nodejs 22.x runtime is used on Lambda](https://nodejs.org/))
- An **AWS account** with programmatic (IAM) access
- **Serverless Framework CLI** installed globally:
  ```bash
  npm install -g serverless
  ```
- A [Serverless Dashboard](https://app.serverless.com/) account (used for `org`/`app` in `serverless.yml`) — or remove those two lines if you don't want to use the dashboard.

---

## 🔐 AWS & Serverless Setup

These are the exact steps used to set up and authenticate this project (see `notes.txt`):

1. **Log in to Serverless Framework**
   ```bash
   serverless login
   ```
   This links your CLI session to the Serverless Dashboard.

2. **(If needed) Clear local Serverless caches** — useful when switching AWS accounts/profiles or fixing stale auth:
   ```bash
   rm -rf ~/.serverless ~/.serverlessrc
   ```

3. **Export your AWS IAM credentials** as environment variables:
   ```bash
   export AWS_ACCESS_KEY_ID="Your_Access_Key_Id"
   export AWS_SECRET_ACCESS_KEY="Your_Secret_Access_Key"
   export AWS_DEFAULT_REGION="ap-south-1"
   ```

4. **Verify your credentials are working:**
   ```bash
   aws sts get-caller-identity
   ```
   This should return your AWS Account ID, User ARN, and User ID.

> ⚠️ **Never commit AWS credentials to version control.** Use environment variables, AWS CLI profiles, or a secrets manager instead.

---

## 📦 Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/LondheShubham153/aws-node-http-api-project.git
cd aws-node-http-api-project
npm install
```

This installs the two runtime dependencies used by the Lambda functions:

- **`aws-sdk`** – to talk to DynamoDB
- **`uuid`** – to generate unique IDs (`v4`) for each task

---

## 🚀 Deployment

Before deploying, update the placeholder values in `serverless.yml`:

- `org: yourorgname` → your Serverless Dashboard org name
- `Resource: arn:aws:dynamodb:your_region:[youtawsuserid]:table/KaamKaro` → replace `[youtawsuserid]` with your actual **12-digit AWS Account ID**

Then deploy the entire stack (Lambdas + API Gateway routes + DynamoDB table) with a single command:

```bash
serverless deploy
```

Expected output:

```bash
Deploying aws-node-http-api-project to stage dev (aws-region)

✔ Service deployed to stack aws-node-http-api-project-dev (95s)

endpoints:
  GET    - https://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com/
  POST   - https://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com/kaam
  GET    - https://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com/kaam
  PUT    - https://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com/kaam/{id}
  DELETE - https://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com/kaam/{id}
functions:
  hello: aws-node-http-api-project-dev-hello
  kaamBharo: aws-node-http-api-project-dev-kaamBharo
  kaamDikhao: aws-node-http-api-project-dev-kaamDikhao
  kaamKhatamKaro: aws-node-http-api-project-dev-kaamKhatamKaro
  kaamBarbad: aws-node-http-api-project-dev-kaamBarbad
```

Copy the base URL from the output — you'll use it for all API calls below.

---

## 📡 API Reference

Base URL (replace with your own after deployment):
```
https://xxxxxxxxxx.execute-api.your_region.amazonaws.com
```

### 1. Health Check

**`GET /`**

```bash
curl https://<base-url>/
```

Response:
```json
{
  "message": "Hello From TWS Batch 9 - You all are awesome!"
}
```

---

### 2. Create a Task — `kaamBharo`

**`POST /kaam`**

```bash
curl -X POST https://<base-url>/kaam \
  -H "Content-Type: application/json" \
  -d '{"kaam": "Learn Serverless Framework"}'
```

Response:
```json
{
  "id": "b3f1c2d4-56e7-4a89-9f01-234567890abc",
  "kaam": "Learn Serverless Framework",
  "createdAt": "2026-07-08T10:15:30.000Z",
  "completed": false
}
```

---

### 3. List All Tasks — `kaamDikhao`

**`GET /kaam`**

```bash
curl https://<base-url>/kaam
```

Response:
```json
[
  {
    "id": "b3f1c2d4-56e7-4a89-9f01-234567890abc",
    "kaam": "Learn Serverless Framework",
    "createdAt": "2026-07-08T10:15:30.000Z",
    "completed": false
  }
]
```

---

### 4. Mark a Task as Completed — `kaamKhatamKaro`

**`PUT /kaam/{id}`**

```bash
curl -X PUT https://<base-url>/kaam/b3f1c2d4-56e7-4a89-9f01-234567890abc \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

Response:
```json
{
  "msg": "Kaam Khatam Kar Diya"
}
```

---

### 5. Delete a Task — `kaamBarbad`

**`DELETE /kaam/{id}`**

```bash
curl -X DELETE https://<base-url>/kaam/b3f1c2d4-56e7-4a89-9f01-234567890abc
```

Response:
```json
{
  "status": "success",
  "message": "Kaam with ID b3f1c2d4-56e7-4a89-9f01-234567890abc has been completely barbad (deleted)!"
}
```

---

## 🗄 DynamoDB Table Schema

**Table name:** `KaamKaro`
**Billing mode:** `PAY_PER_REQUEST` (on-demand, no capacity planning needed)

| Attribute | Type | Description |
|---|---|---|
| `id` (Partition Key) | `String` | Unique UUID (v4) generated per task |
| `kaam` | `String` | The task description |
| `createdAt` | `String` (ISO 8601) | Timestamp of task creation |
| `completed` | `Boolean` | Whether the task is done |

The table is provisioned automatically via the `resources` block in `serverless.yml` — no manual AWS Console setup required.

---

## 💻 Local Development & Testing

Invoke a function locally without deploying:

```bash
serverless invoke local --function hello
```

Expected output:
```json
{
  "statusCode": 200,
  "body": "{\n  \"message\": \"Hello From TWS Batch 9 - You all are awesome!\"\n}"
}
```

> Note: Functions that talk to DynamoDB (`kaamBharo`, `kaamDikhao`, etc.) will still hit the **live/deployed** DynamoDB table when invoked locally, since local invocation doesn't mock AWS services by default.

For a fuller local emulation of API Gateway + Lambda, install the `serverless-offline` plugin:

```bash
serverless plugin install -n serverless-offline
```

Then run:
```bash
serverless offline
```

This spins up a local server that mimics API Gateway routing, letting you hit `http://localhost:3000/kaam` etc. during development.

---

## 🧹 Removing the Stack

To tear down **all** AWS resources created by this project (Lambdas, API Gateway, DynamoDB table) while keeping your local code intact:

```bash
serverless remove
```

> ⚠️ This is destructive — your DynamoDB table and all stored tasks will be permanently deleted.

---

## 🔒 Security Notes

- The API is currently **public** — anyone with the endpoint URL can create, read, update, or delete tasks. For production use, add an [authorizer](https://www.serverless.com/framework/docs/providers/aws/events/apigateway/) (JWT, IAM, or a Lambda authorizer).
- The IAM role attached to the Lambdas currently grants `dynamodb:*` (full access) scoped to the `KaamKaro` table. Consider narrowing this to only the specific actions each function needs (`PutItem`, `Scan`, `UpdateItem`, `DeleteItem`) for least-privilege access.
- Never hardcode or commit AWS credentials — always use environment variables, IAM roles, or a secrets manager.

---

## 🐞 Troubleshooting

| Issue | Likely Cause / Fix |
|---|---|
| `AccessDeniedException` on deploy | Your IAM user lacks permissions for Lambda/API Gateway/DynamoDB/CloudFormation. Attach appropriate policies. |
| `ResourceNotFoundException` on `/kaam` calls | The DynamoDB table hasn't been created yet — re-run `serverless deploy`. |
| Stale credentials / login issues | Run `rm -rf ~/.serverless ~/.serverlessrc` and re-authenticate with `serverless login`. |
| Wrong AWS account being deployed to | Run `aws sts get-caller-identity` to confirm which account/credentials are active. |
| `[youtawsuserid]` deploy error in `serverless.yml` | Replace the placeholder with your actual AWS Account ID in the `iamRoleStatements` resource ARN. |

---
### 🙌 Credits

Built as part of hands-on **DevOps / Serverless learning** — demonstrating AWS Lambda, API Gateway, DynamoDB, and Infrastructure as Code with the Serverless Framework.


