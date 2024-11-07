let hub;

const initChat = async () => {
    console.log("connecting to chat hub...");

    hub = await new ChatHubConnection("/chat", "Minh", "default")
        .onReceiveMessage(function (username, msg, timestamp, state) {
            let currentUser = document.querySelector("#username").value;

            if (currentUser != username) {
                let item = $('<div class="message secondary-msg"></div>');
                let formattedTime = new Date(timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                });
                let info = `${formattedTime} • ${state}`;
                item.html(`<div class="message-content"><p>${msg}</p>
                    <span class="message-info">${state ? info : "on_dev"}</span>
                    </div>`);
                $(".messages-container").append(item);
            } else {
                let messagesContainer = document.querySelector(
                    ".messages-container"
                );
                let item = document.createElement("div");
                item.className = "message primary-msg";
                item.innerHTML = `<div class="message-content"><p>${msg}</p><span class="message-info">You • ${new Date().toLocaleTimeString()}</span></div>`;
                messagesContainer.appendChild(item);
            }

            document
                .querySelector(".messages-container")
                .lastElementChild.scrollIntoView({
                    behavior: "smooth",
                    block: "end",
                });
        })
        .onReceiveImage(function (username, url, timestamp, state) {
            let currentUser = document.querySelector("#username").value;
            if (currentUser != username) {
                let item = $('<div class="message secondary-msg"></div>');
                let formattedTime = new Date(timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                });
                let info = `${formattedTime} • ${state}`;
                item.html(`<div class="message-content"><img id="image" src="${url}" alt="image" />
                    <span class="message-info">${state ? info : "on_dev"}</span>
                    </div>`);
                $(".messages-container").append(item);
            } else {
                let messagesContainer = document.querySelector(
                    ".messages-container"
                );
                let item = document.createElement("div");
                item.className = "message primary-msg";
                item.innerHTML = `<div class="message-content"><img id="image" src="${url}" /><span class="message-info">You • ${new Date().toLocaleTimeString()}</span></div>`;
                messagesContainer.appendChild(item);
            }

            document
                .querySelector(".messages-container")
                .lastElementChild.scrollIntoView({
                    behavior: "smooth",
                    block: "end",
                });
        })
        .init();
    window.chatHub = hub;
    document.dispatchEvent(new Event("hubReady"));
    console.log("hub is ready");
};

document.addEventListener("DOMContentLoaded", initChat);
