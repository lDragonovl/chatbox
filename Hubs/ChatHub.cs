using System;
using System.Collections.Concurrent;
using ChatWebApplication.Models;
using DataAccess.BusinessObjects;
using Microsoft.AspNetCore.SignalR;

namespace ChatWebApplication.Hubs;

public class ChatHub : Hub<IChatClient>
{
    private static readonly ConcurrentDictionary<string, UserConnection> UserConnections = new();

    public async Task JoinRoom(UserConnection uc)
    {
        var connectionId = Context.ConnectionId;
        UserConnections[connectionId] = uc;
        await Groups.AddToGroupAsync(connectionId, uc.Room);
        await Clients.Group(uc.Room).UserJoined(uc.Username);
    }

    public async Task SendMessage(string msg)
    {
        var connectionId = Context.ConnectionId;
        if (UserConnections.TryGetValue(connectionId, out var conn))
        {
            await Clients.GroupExcept(conn.Room, Context.ConnectionId).ReceiveMessage(conn.Username, msg);
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
