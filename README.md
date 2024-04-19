# RabbitMQ Microservices

This project serves as an example of a microservices architecture where services communicate with each other through RabbitMQ, utilizing Redis as the primary database. All services are implemented in Node.js.

## Services

### 1. Web Service

The Web Service acts as the entry point for client requests. It handles incoming HTTP requests, processes them, and delegates tasks to other services if necessary.

### 2. API Service

The API Service exposes various endpoints for client applications to interact with the system. It communicates with other services to fulfill these requests and manages the overall business logic of the application.

### 3. API Worker Service

The API Worker Service performs background tasks related to API requests. It offloads long-running or resource-intensive tasks from the API Service, ensuring the responsiveness of the system to incoming requests.

### 4. Special Worker Service

The Special Worker Service handles specialized tasks within the system that require dedicated processing. It communicates with other services via RabbitMQ to perform its duties efficiently.

## Technologies Used

- **Node.js**: All services are implemented using Node.js, a popular runtime for building scalable and high-performance applications.
- **RabbitMQ**: RabbitMQ is utilized as the message broker to enable communication between microservices in a decoupled and asynchronous manner.
- **Redis**: Redis serves as the primary database for storing and managing data across services. It provides fast in-memory data storage and retrieval, ideal for microservices architectures.

## Setup Instructions

1. **Clone the Repository**: Clone the rabbitmq-microservices repository to your local machine.

    ```
    git clone https://github.com/glenndehaan/rabbitmq-microservices.git
    ```

2. **Install Dependencies**: Navigate to each service's directory (web, api, api-worker, special-worker) and install dependencies using npm.

    ```
    cd web
    npm install
    ```

   Repeat this step for each service.

3. **Start Docker Containers**: Start the RabbitMQ and Redis services using Docker Compose.

    ```
    docker-compose up -d
    ```

   This command will start the RabbitMQ and Redis containers in the background.

4. **Start Services**: Start each service by running the following command in each service directory:

    ```
    npm start
    ```

5. **Test the Application**: Test the functionality of the microservices by opening the Web Service page and verifying that the expected behavior is observed across the system.

## RabbitMQ Management Interface

The RabbitMQ management interface provides a web-based tool for monitoring and managing RabbitMQ, including queues, exchanges, and connections. Here's how to access it:

1. **Access the Interface**: Open a web browser and navigate to [http://localhost:15672](http://localhost:15672).

2. **Log In**: Use the following default credentials to log in:
    - Username: guest
    - Password: guest

## License

MIT
