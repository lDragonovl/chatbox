function ChatHub() {
    let connection = null;
    let connectionId = null;
    let username = null;

    this.Connect = (url, username) => {
        this.username = username;
        connection = new signalR.HubConnectionBuilder().withUrl(url).build();

        connection
            .start()
            .then(() => {
                // Logs
                console.log(`${this.username} is connected to chatHub`);
                console.log(`Connection ID: ${connection.connectionId}`);
                this.connectionId = connection.connectionId;
                console.log("Loading chat logs...");
                this.GetChatLogs();
            })
            .catch((err) => console.error(err.toString()));

        return connection;
    };

    this.SendMessage = (message) => {
        if (message.trim() === "") return;

        connection
            .invoke("SendMessage", this.username, message)
            .catch((err) => console.error(err.toString()));
    };

    this.GetChatLogs = () => {
        connection
            .invoke("GetChatLogs")
            .catch((err) => console.error(err.toString()));
    }

    this.OnReceiveMessage = (callback) => {
        console.log("OnReceiveMessage");
        connection.on("ReceiveMessage", (sender, message) => {
            callback(sender, message);
        });
    };

    this.OnReceiveChatLogs = (callback) => {
        console.log("OnReceiveChatLogs");
        connection.on("ReceiveChatLogs", (messages) => {
            callback(messages);
        });
    }
}
