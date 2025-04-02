# Support Chatbot

A secure chatbot application with anonymization capabilities, built with Spring Boot, Flask, and React.

## Prerequisites

- Java 17 or higher
- Python 3.x
- Node.js and npm
- Maven

## Project Structure

```
Support-Chatbot/
├── src/                    # Spring Boot backend
├── frontend/              # React frontend
└── run_flask.sh          # Flask anonymization service script
```

## Running the Application

### 1. Flask Anonymization Service

First, make the Flask script executable:

```bash
chmod +x run_flask.sh
```

Run the Flask service from the root directory:

```bash
./run_flask.sh
```

This will:

- Install required Python packages
- Download the spaCy model
- Start the Flask service on port 5001

### 2. Spring Boot Backend

Make the Maven wrapper executable:

```bash
chmod +x mvnw
```

Run the Spring Boot application from the root directory:

```bash
./mvnw spring-boot:run
```

The Spring backend will start on port 8081.

### 3. React Frontend

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at http://localhost:5173

## Important Notes

- Make sure to run the Flask service first, as the Spring backend depends on it for anonymization
- The Spring backend must be running before starting the frontend
- Keep all three terminal windows open to maintain the services
- The application uses the following ports:
  - Flask: 5001
  - Spring Boot: 8081
  - React: 5173

## Changing Ports

If you need to change any of the ports, you'll need to update them in multiple places:

### Flask Service (Port 5001)

Edit `src/main/java/com/openaiChatbot/Secure_Chatbot/anonymization_api.py`:

```python
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)  # Change 5001 to your desired port
```

### Spring Boot (Port 8081)

Edit `src/main/resources/application.properties`:

```properties
server.port=8081  # Change 8081 to your desired port
flask.api.url = http://localhost:5001/anonymize  # Update if you changed Flask port
```

### React Frontend (Port 5173)

Edit `chat-frontend/vite.config.js`:

```javascript
export default defineConfig({
  server: {
    port: 5173, // Change 5173 to your desired port
  },
});
```

Edit `chat-frontend/.env`:

```env
VITE_BACKEND_URL = http://localhost:8081  # Update if you changed Spring Boot port
```

After changing any ports:

1. Stop all running services
2. Restart the services in order: Flask → Spring Boot → Frontend
3. Make sure to update any port references in your code if you're using them directly

## Environment Variables

The application uses the following environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key
- `OPENAI_API_ASSISTANT_ID`: Your OpenAI Assistant ID

These are configured in `src/main/resources/application.properties`
