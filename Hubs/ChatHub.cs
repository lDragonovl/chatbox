using System;
using System.Collections.Concurrent;
using ChatWebApplication.Models;
using Microsoft.AspNetCore.SignalR;

namespace ChatWebApplication.Hubs;

public class ChatHub : Hub<IChatClient>
{
    private static readonly ConcurrentDictionary<string, UserConnection> UserConnections = new();
    private static readonly ConcurrentDictionary<string, MessageContent[]> ChatLogs = new();

    public async Task JoinRoom(UserConnection uc)
    {
        var connectionId = Context.ConnectionId;
        UserConnections[connectionId] = uc;
        ChatLogs.TryAdd(uc.Room, Array.Empty<MessageContent>());
        await Groups.AddToGroupAsync(connectionId, uc.Room);
        await Clients.Group(uc.Room).UserJoined(uc.Username);
        await Clients.Caller.ReceiveChatLog(ChatLogs[uc.Room]);
    }

    public async Task SendMessage(string msg)
    {
        var connectionId = Context.ConnectionId;
        if (UserConnections.TryGetValue(connectionId, out var conn))
        {
            ChatLogs[conn.Room] = ChatLogs[conn.Room].Append(new MessageContent(conn.Username, "text", msg)).ToArray();
            await Clients.GroupExcept(conn.Room, Context.ConnectionId).ReceiveMessage(conn.Username, msg);
        }
    }

    public async Task SendImage(string url)
    {
        var connectionId = Context.ConnectionId;
        if (UserConnections.TryGetValue(connectionId, out var conn))
        {
            ChatLogs[conn.Room] = ChatLogs[conn.Room].Append(new MessageContent(conn.Username, "image", url)).ToArray();
            await Clients.GroupExcept(conn.Room, Context.ConnectionId).ReceiveImage(conn.Username, url);
        }
    }

    public async Task LeaveRoom()
    {
        var connectionId = Context.ConnectionId;
        if (UserConnections.TryGetValue(connectionId, out var conn))
        {
            await Groups.RemoveFromGroupAsync(connectionId, conn.Room);
            await Clients.Group(conn.Room).UserLeft(conn.Username);
            UserConnections.TryRemove(connectionId, out _);
        }
    }

    public override async Task OnDisconnectedAsync(System.Exception? exception)
    {
        var connectionId = Context.ConnectionId;
        if (UserConnections.TryGetValue(connectionId, out var conn))
        {
            await Clients.Group(conn.Room).UserDisconnected(conn.Username);
            UserConnections.TryRemove(connectionId, out _);
        }
        await base.OnDisconnectedAsync(exception);
    }
}
