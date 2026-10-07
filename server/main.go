package main

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"server/pkg/websocket"
)

func serveWs(pool *websocket.Pool, w http.ResponseWriter, r *http.Request) {
	fmt.Println("WebSocket Endpoint Hit")
	conn, err := websocket.Upgrade(w, r)
	if err != nil {
		fmt.Fprintf(w, "%+v\n", err)
		return
	}

	client := &websocket.Client{
		Conn: conn,
		Pool: pool,
	}

	pool.Register <- client
	client.Read()
}

func setupRoutes() {
	pool := websocket.NewPool()
	go pool.Start()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(pool, w, r)
	})
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8085"
	}
	if !strings.HasPrefix(port, ":") {
		port = ":" + port
	}

	fmt.Printf("Standalone Mock Chat Server running on %s (Port 8080 is reserved for nadrical-compro-be)\n", port)
	setupRoutes()
	if err := http.ListenAndServe(port, nil); err != nil {
		fmt.Printf("Server failed to start: %v\n", err)
	}
}
