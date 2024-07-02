# Vote Stream App

## Overview

Vote Stream App is a real-time voting application where users can join rooms based on topics, share comments, and see them displayed as a WordCloud format instantly. The app is built with Next.js for the frontend, Tailwind CSS for styling, Express.js for the backend, Redis for data storage, and Socket.io for real-time updates.

## Features

- **Real-time updates**: Instant display of comments in WordCloud format.
- **Room-based interaction**: Users join rooms based on topics and see comments from others in the same room.
- **Scalable architecture**: Redis for fast data retrieval and third-party hosting for scalability.
- **Secure connections**: Securely manage user connections and disconnections.

## Tech Stack

- **Frontend**: Next.js, Tailwind CSS
- **Backend**: Express.js
- **Database**: Redis
- **Real-time Communication**: Socket.io

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/karthikdurai-kd/Vote-Stream-App.git
   cd Vote-Stream-App

   ```

2. **Install Frontend Dependencies**

   ```bash
   cd client
   npm install

   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install

   ```

## Running the Application

**Running Client**

    cd client
    npm run dev

**Running Server**

    cd server
    npm run dev

## Accessing the Application

Open your browser and navigate to http://localhost:3000
