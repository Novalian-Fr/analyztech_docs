export const awsInfrastructureChart = `
    graph TB
        subgraph GitHubActions[GitHub Actions CI/CD]
            GHA_Front[GitHub Actions<br/>Deploy Client Prod]
            GHA_Back[GitHub Actions<br/>Deploy Core API Prod]
        end

        subgraph AWSServices[AWS Services]
            ECR[AWS ECR<br/>Container Registry<br/>eu-west-3]
            SSM[AWS Systems Manager<br/>SSM Agent]
            RDS[(AWS RDS PostgreSQL<br/>core-db-instance<br/>eu-north-1)]
            R53[Route 53<br/>DNS Management<br/>analyztech.com]
            S3[AWS S3<br/>File Storage]
        end

        subgraph EC2Instances[EC2 Instances]
            EC2_Front[EC2 Frontend<br/>i-08f2379b303e0d7ce<br/>eu-west-3]
            EC2_Back[EC2 Backend<br/>i-09479e83cf68b2de3<br/>eu-west-3]
        end

        GHA_Front -->|1. Build & Push Image| ECR
        GHA_Back -->|1. Build & Push Image| ECR

        GHA_Front -->|2. Deploy via SSM| SSM
        GHA_Back -->|2. Deploy via SSM| SSM

        SSM -->|Execute Commands| EC2_Front
        SSM -->|Execute Commands| EC2_Back

        EC2_Front -->|Pull Image| ECR
        EC2_Back -->|Pull Image| ECR

        EC2_Back --> RDS
        EC2_Back --> S3

        R53 -->|DNS| EC2_Front
        R53 -->|DNS| EC2_Back

        style ECR fill:#FF9900
        style RDS fill:#527FFF
        style S3 fill:#569A31
        style R53 fill:#8C4FFF
        style SSM fill:#FF9900
        style EC2_Front fill:#FF9900
        style EC2_Back fill:#FF9900
        style GHA_Front fill:#2088FF
        style GHA_Back fill:#2088FF
`;

export const cicdPipelineChart = `
    sequenceDiagram
        participant Dev as Developer
        participant GH as GitHub (prod branch)
        participant GHA as GitHub Actions
        participant ECR as AWS ECR
        participant SSM as AWS SSM
        participant EC2 as EC2 Instance

        Dev->>GH: git push origin prod
        GH->>GHA: Trigger Workflow

        GHA->>GHA: Checkout Code
        GHA->>ECR: Login (AWS Credentials)
        GHA->>GHA: docker build
        GHA->>ECR: docker push (latest tag)

        GHA->>SSM: send-command (deploy)
        SSM->>EC2: Execute Shell Script

        EC2->>ECR: docker login
        EC2->>ECR: docker compose pull
        EC2->>EC2: docker compose up -d
        EC2->>EC2: docker image prune -af

        EC2-->>SSM: Command Status (Success)
        SSM-->>GHA: Deployment Complete
        GHA-->>Dev: [OK] Deployment Success
`;

export const ec2ArchitectureChart = `
    graph TD
        Internet((Internet)) --> R53[Route 53 DNS]

        R53 -->|analyztech.com| LB_Front[Frontend EC2<br/>i-08f2379b303e0d7ce]
        R53 -->|api.analyztech.com| LB_Back[Backend EC2<br/>i-09479e83cf68b2de3]

        subgraph FrontendEC2[Frontend EC2 eu-west-3]
            Docker_Front[Docker Engine]
            Next[Next.js App<br/>Container]

            Docker_Front --> Next
        end

        subgraph BackendEC2[Backend EC2 eu-west-3]
            Docker_Back[Docker Engine]
            NestJS[NestJS API<br/>Container]

            Docker_Back --> NestJS
        end

        LB_Front --> Docker_Front
        LB_Back --> Docker_Back

        NestJS --> RDS[(PostgreSQL RDS<br/>eu-north-1)]
        NestJS --> S3[S3 Buckets<br/>File Storage]

        style LB_Front fill:#FF9900
        style LB_Back fill:#FF9900
        style RDS fill:#527FFF
        style S3 fill:#569A31
`;

export const awsServicesChart = `
    graph LR
        subgraph Compute
            EC2[EC2 Instances<br/>2x eu-west-3]
        end

        subgraph Storage
            S3[S3 Buckets<br/>File Storage]
            ECR[ECR Registry<br/>Docker Images]
        end

        subgraph Database
            RDS[(RDS PostgreSQL<br/>eu-north-1)]
        end

        subgraph Networking
            R53[Route 53<br/>DNS]
            VPC[VPC<br/>Network Isolation]
        end

        subgraph Management
            SSM[Systems Manager<br/>Remote Execution]
            IAM[IAM<br/>Access Control]
        end

        EC2 --> VPC
        EC2 --> RDS
        EC2 --> S3
        EC2 --> ECR
        SSM --> EC2
        IAM --> EC2
        R53 --> EC2

        style EC2 fill:#FF9900
        style S3 fill:#569A31
        style ECR fill:#FF9900
        style RDS fill:#527FFF
        style R53 fill:#8C4FFF
        style VPC fill:#FF9900
        style SSM fill:#FF9900
        style IAM fill:#DD344C
`;

export const deploymentFlowChart = `
    flowchart TD
        Start([git push prod]) --> Checkout[Checkout Code]
        Checkout --> AWSCreds[Configure AWS Credentials]
        AWSCreds --> ECRLogin[Login to ECR]

        ECRLogin --> Build[docker build -t IMAGE .]
        Build --> Push[docker push IMAGE]

        Push --> GenToken[Generate ECR Token]
        GenToken --> SSMCommand[Send SSM Command]

        SSMCommand --> Poll{Polling Status<br/>Max 40min}

        Poll -->|InProgress| Wait[Wait 10s]
        Wait --> Poll

        Poll -->|Success| GetLogs[Get Command Output]
        Poll -->|Failed| Error[FAIL - Deployment Failed]
        Poll -->|Timeout| Timeout[WARN - Timeout Reached]

        GetLogs --> Success[OK - Deployment Complete]

        subgraph EC2Execution[EC2 Execution via SSM]
            SSMExec[cd /home/ubuntu]
            SSMExec --> ECRLoginEC2[docker login ECR]
            ECRLoginEC2 --> PullImages[docker compose pull]
            PullImages --> UpServices[docker compose up -d]
            UpServices --> Prune[docker image prune -af]
            Prune --> ShowPS[docker compose ps]
        end

        SSMCommand -.->|Async| SSMExec

        style Success fill:#4CAF50
        style Error fill:#F44336
        style Timeout fill:#FF9800
`;
