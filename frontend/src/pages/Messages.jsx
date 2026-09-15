import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "../css/messages.css";

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [contenu, setContenu] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // ==================================================
  // UTILISATEUR CONNECTÉ
  // ==================================================

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  }, []);

  const currentUserId = currentUser?.id || currentUser?._id;

  // ==================================================
  // RÉCUPÉRER LES CONVERSATIONS
  // ==================================================

  const fetchConversations = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const res = await api.get("/messages/conversations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setConversations(res.data || []);
      setError("");
    } catch (error) {
      console.error(
        "Erreur récupération conversations :",
        error.response?.data || error.message
      );

      setError("Impossible de récupérer les conversations.");
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  // ==================================================
  // RÉCUPÉRER LES MESSAGES
  // ==================================================

  const fetchMessages = useCallback(
    async (conversationId, silent = false) => {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        if (!silent) {
          setLoadingMessages(true);
        }

        const res = await api.get(
          `/messages/${conversationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMessages(res.data || []);
        setError("");
      } catch (error) {
        console.error(
          "Erreur récupération messages :",
          error.response?.data || error.message
        );
      } finally {
        if (!silent) {
          setLoadingMessages(false);
        }
      }
    },
    []
  );

  // ==================================================
  // CHARGEMENT INITIAL
  // ==================================================

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ==================================================
  // RAFRAÎCHISSEMENT AUTOMATIQUE
  // ==================================================

  useEffect(() => {
    if (!selectedConversation) return;

    // Première récupération
    fetchMessages(selectedConversation);

    // Vérification automatique toutes les 2 secondes
    const interval = setInterval(() => {
      fetchMessages(selectedConversation, true);
      fetchConversations();
    }, 2000);

    return () => clearInterval(interval);
  }, [
    selectedConversation,
    fetchMessages,
    fetchConversations,
  ]);

  // ==================================================
  // SÉLECTION CONVERSATION
  // ==================================================

  const handleSelectConversation = (conversationId) => {
    if (conversationId === selectedConversation) return;

    setSelectedConversation(conversationId);
    setMessages([]);
  };

  // ==================================================
  // DESTINATAIRE
  // ==================================================

  const getOtherUser = (conversation) => {
    if (!conversation?.participants) return null;

    return conversation.participants.find(
      (participant) =>
        participant._id?.toString() !==
        currentUserId?.toString()
    );
  };

  // ==================================================
  // ENVOYER MESSAGE
  // ==================================================

  const sendMessage = async (e) => {
    e.preventDefault();

    const messageText = contenu.trim();

    if (!messageText || !selectedConversation || sending) {
      return;
    }

    const conversation = conversations.find(
      (c) => c._id === selectedConversation
    );

    const destinataire = getOtherUser(conversation);

    if (!destinataire?._id) {
      alert("Destinataire introuvable.");
      return;
    }

    try {
      setSending(true);

      const token = localStorage.getItem("token");

      const res = await api.post(
        "/messages",
        {
          destinataireId: destinataire._id,
          contenu: messageText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setContenu("");

      // Ajouter immédiatement le message envoyé
      // si le backend retourne le message créé.
      if (res.data) {
        const newMessage =
          res.data.message || res.data;

        if (newMessage?._id) {
          setMessages((prev) => {
            const alreadyExists = prev.some(
              (msg) => msg._id === newMessage._id
            );

            if (alreadyExists) {
              return prev;
            }

            return [...prev, newMessage];
          });
        }
      }

      // Synchronisation avec le backend
      await fetchMessages(selectedConversation, true);
      await fetchConversations();

    } catch (error) {
      console.error(
        "Erreur envoi message :",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Impossible d'envoyer le message."
      );
    } finally {
      setSending(false);
    }
  };

  // ==================================================
  // ENTRÉE CLAVIER
  // ==================================================

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (contenu.trim()) {
        e.currentTarget.form?.requestSubmit();
      }
    }
  };

  // ==================================================
  // CONVERSATION SÉLECTIONNÉE
  // ==================================================

  const selectedConv = conversations.find(
    (conv) => conv._id === selectedConversation
  );

  const selectedUser = getOtherUser(selectedConv);

  // ==================================================
  // AFFICHAGE
  // ==================================================

  return (
    <div className="messages-page">

      {/* =============================================
          SIDEBAR
      ============================================= */}

      <aside className="conversations">

        <div className="conversations-header">
          <div>
            <h2>Messages</h2>
            <p>
              {conversations.length}{" "}
              conversation
              {conversations.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {loadingConversations ? (
          <div className="messages-loading">
            <div className="conversation-skeleton"></div>
            <div className="conversation-skeleton"></div>
            <div className="conversation-skeleton"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="empty-conversations">
            <div className="empty-icon">💬</div>

            <h3>Aucune conversation</h3>

            <p>
              Vos conversations avec les
              vendeurs et acheteurs apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="conversation-list">

            {conversations.map((conv) => {
              const otherUser = getOtherUser(conv);

              const isActive =
                conv._id === selectedConversation;

              return (
                <button
                  key={conv._id}
                  type="button"
                  className={`conversation ${
                    isActive ? "active" : ""
                  }`}
                  onClick={() =>
                    handleSelectConversation(conv._id)
                  }
                >

                  <div className="conversation-avatar">
                    {otherUser?.photo ? (
                      <img
                        src={otherUser.photo}
                        alt={otherUser.nom}
                      />
                    ) : (
                      otherUser?.nom
                        ?.charAt(0)
                        ?.toUpperCase() || "U"
                    )}
                  </div>

                  <div className="conversation-info">

                    <div className="conversation-top">
                      <strong>
                        {otherUser?.nom ||
                          "Utilisateur"}
                      </strong>
                    </div>

                    <p>
                      {conv.lastMessage?.contenu ||
                        "Nouvelle conversation"}
                    </p>

                  </div>

                </button>
              );
            })}

          </div>
        )}

      </aside>

      {/* =============================================
          CHAT
      ============================================= */}

      <main className="chat">

        {!selectedConversation ? (

          <div className="empty-chat">

            <div className="empty-chat-icon">
              💬
            </div>

            <h2>Vos messages</h2>

            <p>
              Sélectionnez une conversation pour
              commencer à discuter.
            </p>

          </div>

        ) : (

          <>

            {/* HEADER CHAT */}

            <header className="chat-header">

              <div className="chat-user-avatar">

                {selectedUser?.photo ? (
                  <img
                    src={selectedUser.photo}
                    alt={selectedUser.nom}
                  />
                ) : (
                  selectedUser?.nom
                    ?.charAt(0)
                    ?.toUpperCase() || "U"
                )}

              </div>

              <div className="chat-user-info">

                <h2>
                  {selectedUser?.nom ||
                    "Utilisateur"}
                </h2>

                <span className="online-status">
                  ● Conversation active
                </span>

              </div>

            </header>

            {/* LISTE DES MESSAGES */}

            <div className="messages-list">

              {loadingMessages ? (

                <div className="chat-loading">
                  <div className="message-skeleton left"></div>
                  <div className="message-skeleton right"></div>
                  <div className="message-skeleton left"></div>
                </div>

              ) : messages.length === 0 ? (

                <div className="empty-messages">

                  <div>👋</div>

                  <h3>
                    Aucun message
                  </h3>

                  <p>
                    Commencez la conversation.
                  </p>

                </div>

              ) : (

                messages.map((msg) => {

                  const isMine =
                    msg.expediteur?._id?.toString() ===
                    currentUserId?.toString();

                  return (
                    <div
                      key={msg._id}
                      className={`message-row ${
                        isMine
                          ? "mine"
                          : "received"
                      }`}
                    >

                      <div className="message">

                        {!isMine && (
                          <strong>
                            {msg.expediteur?.nom ||
                              "Utilisateur"}
                          </strong>
                        )}

                        <p>
                          {msg.contenu}
                        </p>

                        <small>
                          {msg.createdAt
                            ? new Date(
                                msg.createdAt
                              ).toLocaleTimeString(
                                "fr-FR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : ""}
                        </small>

                      </div>

                    </div>
                  );
                })

              )}

            </div>

            {/* FORMULAIRE */}

            <form
              onSubmit={sendMessage}
              className="message-form"
            >

              <input
                type="text"
                placeholder="Écrivez votre message..."
                value={contenu}
                onChange={(e) =>
                  setContenu(e.target.value)
                }
                onKeyDown={handleKeyDown}
                disabled={sending}
                autoComplete="off"
              />

              <button
                type="submit"
                disabled={
                  sending || !contenu.trim()
                }
                aria-label="Envoyer le message"
              >
                {sending ? "..." : "➤"}
              </button>

            </form>

          </>
        )}

      </main>

      {error && (
        <div className="messages-error">
          {error}
        </div>
      )}

    </div>
  );
}

export default Messages;