# RISE:Resilient Income Shield Protocol

A production-grade microservices platform providing automatic insurance payouts for food delivery workers (Swiggy/Zomato persona) based on weather disruptions and fraud analysis.

## Core Logic
1.  **Detection**: System identifies heavy rainfall or extreme heat in a specific geo-zone.
2.  **Claim**: Worker clicks "Request Payout" when they cannot work.
3.  **Fraud Check**: FastAPI engine analyzes GPS speed, IP address, and actual order activity.
4.  **Payout**: If fraud score < 30, the payout service queues a mock bank transfer instantly.

## Tech Stack
-   **Frontend**: React 18, Vite, TailwindCSS, Framer Motion
-   **Backend**: Node.js (Gateway, User, Policy, Claims, Payout Services)
-   **AI/Fraud**: FastAPI (Python)
-   **Database**: MongoDB
-   **Messaging**: Redis (Payout Task Queue)
-   **Infrastructure**: Docker, Nginx (Reverse Proxy)

## Prerequisites
-   Docker and Docker Compose installed
-   At least 4GB of RAM available for the container stack

## Installation and Running

1.  **Clone the project** and navigate to the root directory.
2.  **Start the platform**:
    `docker-compose up --build`

3.  **Access the application**:
    -   Frontend: `http://localhost`
    -   API Gateway: `http://localhost/api` (proxied)
    -   Fraud Service (Direct): `http://localhost:8000/docs`

## Test Credentials
1.  **Worker Account**:
    -   Email: `worker@gig.com`
    -   Password: `password123`
2.  **Admin Setup**:
    -   Register via UI, then manually update the MongoDB `users` collection to set `role: "admin"` for your user to access the Admin Dashboard at `http://localhost/admin`.

## Workflow Simulation
1.  **Register/Login** as a worker.
2.  Click **Request Payout**.
3.  The system calls the **Fraud Service**:
    -   If `orders` = 0 and `gps` is active -> **Status: APPROVED** -> Payout Triggered.
    -   If `orders` > 2 during claim -> **Status: REJECTED** (Fraud score will be high).
4.  View **Payout Logs** in the dashboard to see the mock transaction hash.

## Troubleshooting
-   **Mongo Connection**: Ensure port 27017 is not used by a local MongoDB instance.
-   **Port Conflicts**: If port 80 is occupied, change the Nginx mapping in `docker-compose.yml`.
