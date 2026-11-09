# CollabBoard

A real-time collaborative whiteboard application built using Java, Spring Boot, WebSockets, PostgreSQL, HTML, CSS and Vanilla JavaScript.

## Overview

CollabBoard allows multiple users to collaborate on a shared digital whiteboard in real time. Users can draw, create shapes, share boards and see other participants' changes without refreshing the page.

## Tech Stack

### Backend

- Java 21
- Spring Boot
- Spring WebSocket and STOMP
- Spring Data JPA
- Spring Security and JWT
- PostgreSQL

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- HTML5 Canvas API

### Tools

- Git and GitHub
- IntelliJ IDEA
- Visual Studio Code
- Maven
- Postman
- Docker

## Planned Features

- Interactive drawing canvas
- Freehand drawing
- Rectangle, circle and arrow tools
- Eraser and color selection
- Undo and redo
- User registration and login
- Create and manage boards
- Real-time drawing synchronization
- Live user cursors
- Board sharing and permissions
- Persistent drawing data
- Docker deployment

## Architecture

The application uses a Spring Boot backend with REST APIs and WebSocket communication. PostgreSQL stores persistent application data.

The initial deployment uses Spring's built-in Simple Broker without Redis.

## Project Status

Currently in development.

## License

MIT
