# Project C - AI Consulting Slide Generator

Project C is a consulting-native GenAI platform designed to help consultants structure, design, and deliver work more efficiently. It combines workflow automation, reasoning engines, and structured processing to replicate how consultants work, while automating the mechanical steps that slow projects down.

## 💼 Business Context: "Consulting-Native" Automation

Consultants spend a disproportionate amount of time on mechanical tasks—formatting slides, structuring arguments, and refining layouts—rather than analytical thinking. Project C exists to flip this dynamic.

The platform is built on the philosophy of **"Consulting-Native Workflows"**: tools that reflect how real strategy teams operate. By automating the operational overhead, Project C allows consultants to work faster, smarter, and deliver higher-quality outputs without getting bogged down in execution details.

### Why Custom Code? (Beyond n8n)

While visual workflow tools like **n8n** or **Langflow** are excellent for prototyping, Project C takes a distinct "Code-Native" approach to handle the complexity of recursive agentic reasoning.

1.  **Serverless Workflow Engine**: Instead of linear visual nodes, our backend acts as a stateful, typed workflow engine. The **"Architect -> Designer -> Corrector"** chain is implemented as a robust code pipeline.
2.  **Complex Reasoning**: Managing multi-turn logic, retry mechanisms, and structured JSON validation is significantly more maintainable in typed Java (Quarkus) than in visual "spaghetti" graphs.
3.  **Production Ready**: This approach treats "Prompt Engineering" as "Software Engineering"—version controlled, unit-tested, and deployable via standard CI/CD (Docker), offering superior latency and stability compared to low-code alternatives.

## 🚀 Features

- **Natural Language to Slide**: Converts raw text or topic ideas into professional slide layouts.
- **Agentic Workflow Engine**:
  - **Architect Agent 🧠**: Analyzes the raw input (bullets/paragraphs), identifies the core message, and structures the slide narrative (Header, Title, Layout Strategy).
  - **Designer Agent 🎨**: Takes the structured blueprint and writes semantic, accessible HTML/CSS. It understands design principles like whitespace, hierarchy, and color theory.
  - **Corrector Agent ⚖️**: Serves as a quality assurance layer, fixing syntax errors, ensuring responsiveness, and validating that the output matches the request.
- **Interactive Chat Interface**: A React-based conversational UI that mimics a reliable pair-programmer. It persists sessions effectively, allowing you to iterate on a slide design ("Make it blue", "Add a chart").
- **Live Preview System**:
  - **Thumbnail Mode**: Instant view in the chat stream.
  - **Presentation Mode**: Full-screen immersive view for reviewing the final output.
- **Enterprise-Grade Persistence**: MongoDB ensures that every thought, every prompt, and every generated artifact is saved.

## 🛠️ Technology Stack

### Backend

- **Java 17+**
- **Quarkus**: "Supersonic Subatomic Java" framework for high-performance REST APIs.
- **MongoDB (Panache)**: For persisting chat sessions and slide generation history.
- **Anthropic Claude API**: The intelligence engine behind the content generation.

### Frontend

- **React (Vite)**: Fast, modern frontend tooling.
- **Tailwind CSS**: Utility-first CSS for sleek, responsive designs.
- **Lucide React**: Beautiful icons.
- **React Router**: For seamless navigation.

## ⚙️ Configuration & Setup

### 1. Prerequisites

- Docker Desktop (Running)
- Anthropic API Key (Configure in `server/src/main/resources/application.properties` or as env variable)

### 2. Run with Docker (Required)

Run the entire application (Backend + Frontend + Database) with a single command:

1.  Make sure you have Docker Desktop installed and running.
2.  Navigate to project root.
3.  Run:
    ```bash
    docker compose up --build
    ```
4.  Access the application:
    - Frontend: **http://localhost:3000**
    - Backend Swagger: **http://localhost:8080/q/swagger-ui**

## 📖 How to Use

1.  Open your browser to `http://localhost:3000`.
2.  **Login/Register**: Create a local account (stored in your Mongo Container).
3.  **New Chat**: Click "New Chat" in the sidebar.
4.  **Generate a Slide**:
    - Type a request like: _"Create a slide showing the market growth of EV cars in Europe vs US"_
    - The AI will think (Architect -> Designer -> Corrector) and render the slide directly in the chat.
5.  **Expand**: Click the slide preview to view it in full-screen mode.
6.  **History**: Your chats are saved automatically. You can access them anytime from the sidebar.

## 📂 Project Structure

```
projectc/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # UI Components (ChatInterface, SlidePreview)
│   │   ├── context/        # State Management (Auth, Chat)
│   │   └── services/       # API integration
├── server/                 # Quarkus Backend
│   ├── src/main/java/com/projectc/
│   │   ├── resource/       # REST Endpoints (SlideResource, AuthResource)
│   │   ├── service/        # Business Logic (SlideService, ChatService)
│   │   └── model/          # MongoDB Entities
│   └── src/main/resources/ # Prompt Templates (*.md) & Config
└── README.md
```

## 🤝 Troubleshooting

- **"CORS Error"**: Ensure the backend `application.properties` has `quarkus.http.cors=true`.
- **"MongoDB Connection Refused"**: Check if your local MongoDB service is running (`User `services.msc`on Windows or`systemctl status mongod` on Linux).
- **"API Key Missing"**: Double-check your `anthropic.api.key`.
- **"error during connect ... dockerDesktopLinuxEngine"**: This means Docker Desktop is not running. Please start Docker Desktop and wait for the engine to initialize.

## 🧭 Extension Guide (Roadmap)

Since this is an MVP/Case Study, here is how the solution can be extended into a full enterprise platform:

1.  **RAG Integration**: Connect the "Architect" agent to a vector database (Pinecone/Weaviate) containing the firm's past high-performing slides. This allows the tool to mimic the firm's specific voice and style.
2.  **Multimodal Inputs**: consistency allows users to upload images (charts on a napkin) which the AI converts into digital slides.
3.  **Team Collaboration**: Add WebSocket support for real-time multiplayer editing of the chat stream.

---

_Generated by Karim Doueik_
