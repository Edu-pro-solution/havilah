import useFetch from "@/hooks/useFetch";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Mail, Send, Inbox as InboxIcon, ArrowLeft, Reply, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Inbox = () => {
  useFetch("/sessions");

  const { messages, sendMessage, markMessageRead } = useAuth();
  const [tab, setTab] = useState<"inbox" | "sent">("inbox");
  const [selectedMsg, setSelectedMsg] = useState<typeof messages[0] | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [composeForm, setComposeForm] = useState({ to: "", subject: "", body: "" });
  const [replyBody, setReplyBody] = useState("");
  const [showReply, setShowReply] = useState(false);

  const inboxMessages = messages.filter((m) => m.type === "inbox");
  const sentMessages = messages.filter((m) => m.type === "sent");
  const displayMessages = tab === "inbox" ? inboxMessages : sentMessages;
  const unread = inboxMessages.filter((m) => !m.read).length;

  const openMessage = (msg: typeof messages[0]) => {
    setSelectedMsg(msg);
    if (!msg.read && msg.type === "inbox") markMessageRead(msg.id);
  };

  const handleSend = () => {
    if (!composeForm.to || !composeForm.subject || !composeForm.body) {
      toast.error("Please fill in all fields");
      return;
    }
    sendMessage(composeForm.to, composeForm.subject, composeForm.body);
    toast.success("Message sent");
    setComposeForm({ to: "", subject: "", body: "" });
    setShowCompose(false);
  };

  const handleReply = () => {
    if (!selectedMsg || !replyBody) return;
    sendMessage(selectedMsg.from, `Re: ${selectedMsg.subject}`, replyBody);
    toast.success("Reply sent");
    setReplyBody("");
    setShowReply(false);
  };

  const recipients = [
    "Dr. Adebayo Ogundimu",
    "Dr. Funke Akindele",
    "Mr. Chukwudi Obi",
    "Mrs. Binta Hassan",
    "Mr. Tunde Bakare",
    "Mrs. Adaeze Uche",
    "CEO",
  ];

  if (selectedMsg) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedMsg(null)}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
          <h1 className="text-xl font-bold truncate">{selectedMsg.subject}</h1>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{selectedMsg.type === "inbox" ? selectedMsg.from : `To: ${selectedMsg.to}`}</p>
                <p className="text-xs text-muted-foreground">{selectedMsg.fromRole} · {selectedMsg.time}</p>
              </div>
              {selectedMsg.type === "inbox" && (
                <Button size="sm" variant="outline" onClick={() => setShowReply(true)}>
                  <Reply className="h-3.5 w-3.5 mr-1" />Reply
                </Button>
              )}
            </div>
            <div className="border-t pt-4">
              <p className="text-sm whitespace-pre-wrap">{selectedMsg.body}</p>
            </div>
          </CardContent>
        </Card>

        {/* Reply */}
        <Dialog open={showReply} onOpenChange={setShowReply}>
          <DialogContent>
            <DialogHeader><DialogTitle>Reply to {selectedMsg.from}</DialogTitle><DialogDescription>Re: {selectedMsg.subject}</DialogDescription></DialogHeader>
            <div className="space-y-4">
              <Textarea placeholder="Write your reply..." rows={6} value={replyBody} onChange={(e) => setReplyBody(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReply(false)}>Cancel</Button>
              <Button onClick={handleReply}><Send className="h-4 w-4 mr-1" />Send Reply</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inbox</h1>
          <p className="text-sm text-muted-foreground">
            {unread > 0 ? `${unread} unread message${unread > 1 ? "s" : ""}` : "No unread messages"}
          </p>
        </div>
        <Button onClick={() => setShowCompose(true)}><Mail className="h-4 w-4 mr-1" />Compose</Button>
      </div>

      <div className="flex gap-2">
        <Button variant={tab === "inbox" ? "default" : "outline"} size="sm" onClick={() => setTab("inbox")}>
          <InboxIcon className="h-3.5 w-3.5 mr-1" />Inbox {unread > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{unread}</Badge>}
        </Button>
        <Button variant={tab === "sent" ? "default" : "outline"} size="sm" onClick={() => setTab("sent")}>
          <Send className="h-3.5 w-3.5 mr-1" />Sent
        </Button>
      </div>

      <div className="space-y-2">
        {displayMessages.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No messages</CardContent></Card>
        ) : (
          displayMessages.map((msg) => (
            <Card
              key={msg.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${!msg.read && msg.type === "inbox" ? "border-primary/30 bg-primary/5" : ""}`}
              onClick={() => openMessage(msg)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {!msg.read && msg.type === "inbox" && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                      <p className={`text-sm truncate ${!msg.read && msg.type === "inbox" ? "font-semibold" : "font-medium"}`}>
                        {msg.type === "inbox" ? msg.from : `To: ${msg.to}`}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{msg.fromRole}</span>
                    </div>
                    <p className="text-sm font-medium mt-0.5 truncate">{msg.subject}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{msg.body}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{msg.time}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Compose */}
      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Message</DialogTitle><DialogDescription>Send a message</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>To</Label>
              <Select value={composeForm.to} onValueChange={(v) => setComposeForm({ ...composeForm, to: v })}>
                <SelectTrigger><SelectValue placeholder="Select recipient" /></SelectTrigger>
                <SelectContent>{recipients.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Subject</Label><Input placeholder="Message subject" value={composeForm.subject} onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })} /></div>
            <div className="space-y-2"><Label>Message</Label><Textarea placeholder="Write your message..." rows={6} value={composeForm.body} onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompose(false)}>Cancel</Button>
            <Button onClick={handleSend}><Send className="h-4 w-4 mr-1" />Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inbox;
