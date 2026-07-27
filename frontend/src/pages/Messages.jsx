import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/messages.css";

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [contenu, setContenu] = useState("");

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/messages/conversations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setConversations(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get(`/messages/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessages(res.data);
      setSelectedConversation(conversationId);

    } catch (error) {
      console.log(error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!contenu.trim()) return;

    try {
      const token = localStorage.getItem("token");

      const destinataire = conversations
        .find(c => c._id === selectedConversation)
        ?.participants.find(
          p => p._id !== JSON.parse(localStorage.getItem("user")).id
        );

      await api.post(
        "/messages",
        {
          destinataireId: destinataire._id,
          contenu,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setContenu("");

      fetchMessages(selectedConversation);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="messages-page">

      <div className="conversations">

        <h2>Conversations</h2>

        {conversations.map((conv) => {

          const otherUser = conv.participants.find(
            p => p._id !== JSON.parse(localStorage.getItem("user")).id
          );

          return (
            <div
              key={conv._id}
              className="conversation"
              onClick={() => fetchMessages(conv._id)}
            >
              {otherUser?.nom}
            </div>
          );
        })}
      </div>

      <div className="chat">

        <h2>Messages</h2>

        <div className="messages-list">

          {messages.map((msg) => (
            <div
              key={msg._id}
              className="message"
            >
              <strong>{msg.expediteur.nom} :</strong>
              <p>{msg.contenu}</p>
            </div>
          ))}

        </div>

        {selectedConversation && (
          <form onSubmit={sendMessage} className="message-form">

            <input
              type="text"
              placeholder="Votre message..."
              value={contenu}
              onChange={(e) => setContenu(e.target.value)}
            />

            <button type="submit">
              Envoyer
            </button>

          </form>
        )}

      </div>

    </div>
  );
}

export default Messages;