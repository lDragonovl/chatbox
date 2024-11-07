using ChatWebApplication.Models;

namespace ChatWebApplication.Hubs;

public interface IChatClient
{
    Task ReceiveMessage(string username, string msg, string? timestamp = null, string? state = null);
    Task ReceiveImage(string username, string url, string? timestamp = null, string? state = null);
    Task ReceiveChatLog(MessageContent[] chatLog);
    Task UserJoined(string username);
    Task UserLeft(string username);
    Task UserDisconnected(string username);
}