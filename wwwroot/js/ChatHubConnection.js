class ChatHubConnection {
    constructor(url, username, chatroom) {
        this.url = url;
        this.username = username;
        this.chatroom = chatroom;
        this.connected = false;
        this.onReceiveMessageCallback = () => {};
        this.onUserJoinedCallback = () => {};
        this.onUserLeftCallback = () => {};
        this.onUserDisconnectedCallback = () => {};
    }

    async init() {
        try {
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl("/chat")
                .configureLogging("Information")
                .build();

            let username = this.username;
            let chatroom = this.chatroom;

            this.connection.on("ReceiveMessage", (username, message) => {
                // Handle received message
                this.onReceiveMessageCallback(username, message);
            });

            this.connection.on("ReceiveImage", (username, url) => {
                // Handle received image
                this.onReceiveImageCallback(username, url);
            });

            this.connection.on("ReceiveChatLog", (chatLog) => {
                // Handle received chat log
                console.log(chatLog);
                chatLog.forEach((chat) => {
                    if (chat.contentType === "text") {
                        this.onReceiveMessageCallback(
                            chat.username,
                            chat.content
                        );
                    } else if (chat.contentType === "image") {
                        this.onReceiveImageCallback(
                            chat.username,
                            chat.content
                        );
                    }
                });
            });

            this.connection.on("UserJoined", (username) => {
                // Handle user joined event
                this.onUserJoinedCallback(username);
            });

            this.connection.on("UserLeft", (username) => {
                // Handle user left event
                this.onUserLeftCallback(username);
            });

            this.connection.on("UserDisconnected", (username) => {
                // Handle user disconnected event
                this.onUserDisconnectedCallback(username);
            });

            // Start the connection
            await this.connection.start();
            await this.connection.invoke("JoinRoom", { username, chatroom });

            this.connected = true;

            return this;
        } catch (e) {
            console.log(e);
        }
    }

    async sendAsync(msg) {
        if (!this.connection) {
            console.log("Connection null. You must call init().");
            return;
        }
        try {
            await this.connection.invoke("SendMessage", msg);
        } catch (e) {
            console.error(e);
        }
    }

    async sendImageAsync(url) {
        if (!this.connection) {
            console.log("Connection null. You must call init().");
            return;
        }
        try {
            await this.connection.invoke("SendImage", url);
        } catch (e) {
            console.error(e);
        }
    }

    onConnected(callback) {
        if (!this.connected) return;
        callback(this);
    }

    onReceiveMessage(callback) {
        this.onReceiveMessageCallback = callback;
        return this;
    }

    onReceiveImage(callback) {
        this.onReceiveImageCallback = callback;
        return this;
    }

    onUserJoined(callback) {
        this.onUserJoinedCallback = callback;
        return this;
    }

    onUserLeft(callback) {
        this.onUserLeftCallback = callback;
        return this;
    }

    onUserDisconnected(callback) {
        this.onUserDisconnectedCallback = callback;
        return this;
    }
}
