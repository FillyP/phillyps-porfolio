# ☁️ Serverless Cloud Architecture Portfolio

**Live Demonstration:** [phillyp.com](https://phillyp.com)

This repository contains the frontend and architectural code for my professional portfolio, which serves as a practical demonstration of my cloud engineering and systems architecture skills. 

Rather than utilizing a traditional monolithic web server, this project is built entirely on a **decoupled, event-driven, serverless AWS architecture** to ensure high availability, zero maintenance, and optimal cost-efficiency.

## 🛠️ The Tech Stack

### Frontend (Static Global Delivery)
* **Amazon S3:** Hosts the static website assets (HTML, CSS, JavaScript).
* **Amazon CloudFront:** A global Content Delivery Network (CDN) that caches the S3 bucket to provide millisecond latency to users worldwide and secures the site with HTTPS.
* **Amazon Route 53:** Manages DNS routing to the CloudFront distribution.

### Backend (ActiveSub: Trial & Subscription Saver)
The flagship project on this site is an interactive subscription tracker that automatically emails users 48 hours before a free trial or subscription renews.

* **Amazon API Gateway:** Exposes RESTful endpoints (`POST` and `GET`) to securely bridge the frontend JavaScript with the AWS backend.
* **AWS Lambda (Python):** Contains the core business logic. Handles incoming API payloads, processes database CRUD operations, and formats outbound emails.
* **Amazon DynamoDB:** A NoSQL database utilized for fast, scalable data persistence (storing user inputs, generated IDs, and timestamps).
* **Amazon EventBridge:** Functions as a serverless cron job, triggering daily Lambda executions to scan the database for impending subscription renewals.
* **Amazon Simple Email Service (SES):** Dispatches dynamically formatted HTML cancellation reminders directly to the user's inbox.

## 🚀 Key Engineering Highlights

1. **Live Database Read/Write:** The architecture doesn't just process backend data; it dynamically updates the frontend. When a user tests the application, Lambda writes their metadata to DynamoDB, and a secondary Lambda function fetches the latest 20 testers to populate a live, auto-scrolling UI feed.
2. **CORS & Security:** Configured strict Cross-Origin Resource Sharing (CORS) policies within API Gateway to ensure only authorized frontend domains can invoke the backend functions.
3. **Error Handling:** Implemented `try/except` blocks within the Lambda functions and asynchronous `try/catch` fetching on the frontend to gracefully handle AWS connection errors and display human-readable fallback UI states.

## 👨‍💻 About Me
I am a Systems Engineer who builds and scales resilient systems. From AWS cloud infrastructure to SQL migrations, I leverage automation to solve complex problems fast. I am actively seeking opportunities to bring value to an engineering team.
