using System;

namespace ChatWebApplication.Models;

public class MessageContent
{
    public string Username { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;

    public MessageContent() { }

    public MessageContent(string username, string contentType, string content)
    {
        Username = username;
        ContentType = contentType;
        Content = content;
    }
}
