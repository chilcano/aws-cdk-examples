# AWS CDK Samples

A set of samples I used to experiment with AWS CDK.

## Samples

1. [Simple PHP Application](simple-php-ts-ecs/)
   * 1 container for PHP Webapp exposed through AWS ALB.
   * CDK TypeScript.
   * Fargate ECS cluster.
2. [Simple Frontend-Backend App using Flask and Redis](simple-frontend-backend-ecs/)
   * 2 containers, a frontend Flask app with a template talking to a backend Redis service to persist timestamps.
   * CDK TypeScript.
   * Fargate ECS cluster, 1 VPC, (CloudMap) DNS resolution.