import { useEffect, useState, useRef, useCallback } from "react";
import cookies from "react-cookies";
import { authApis, endpoints } from "../configs/Apis";
import {
    connectWS,
    sendMessageWS,
    subscribeToChat,
    disconnectWS,
} from "../configs/Websocket";

import {
    ChatBubbleOvalLeftEllipsisIcon,
    MagnifyingGlassIcon,
    PaperAirplaneIcon,
    UserGroupIcon,
} from "@heroicons/react/24/solid";

const PAGE_SIZE = 10;

export default function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState("");
    const [readers, setReaders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeUser, setActiveUser] = useState(null);
    const [senderId, setSenderId] = useState(null);

    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // 📌 Add state for readers pagination
    const [readerPage, setReaderPage] = useState(0);
    const [hasMoreReaders, setHasMoreReaders] = useState(true);
    const [loadingMoreReaders, setLoadingMoreReaders] = useState(false);

    const chatContainerRef = useRef(null);
    const readersContainerRef = useRef(null); // 📌 Ref for readers container

    // 📌 Lấy danh sách độc giả với phân trang
    const fetchReaders = useCallback(async (pageToLoad = 0) => {
        setLoading(pageToLoad === 0);
        setLoadingMoreReaders(pageToLoad > 0);
        try {
            const res = await authApis().get(
                `${endpoints.readers}?page=${pageToLoad}&size=${PAGE_SIZE}&sortBy=id`,
                { headers: { "Cache-Control": "no-cache" } }
            );
            const newReaders = res.data.content || [];
            if (pageToLoad === 0) {
                setReaders(newReaders);
            } else {
                setReaders((prev) => [...prev, ...newReaders]);
            }
            setHasMoreReaders(newReaders.length === PAGE_SIZE);
            setReaderPage(pageToLoad);
        } catch (err) {
            console.error("❌ Lỗi khi lấy độc giả:", err);
        } finally {
            setLoading(false);
            setLoadingMoreReaders(false);
        }
    }, []);

    // 📌 Tải thêm độc giả khi cuộn
    const loadMoreReaders = async () => {
        if (!readersContainerRef.current || loadingMoreReaders || !hasMoreReaders) return;

        const container = readersContainerRef.current;
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
            setLoadingMoreReaders(true);
            await fetchReaders(readerPage + 1);
        }
    };

    const fetchMessages = useCallback(async (userId, pageToLoad = 0) => {
        if (!userId) return;
        try {
            const res = await authApis().get(
                `${endpoints["conversation-user"](userId)}?page=${pageToLoad}&size=${PAGE_SIZE}`
            );
            const data = res.data || [];
            const ordered = [...data].reverse();

            if (pageToLoad === 0) {
                setMessages(ordered);
            } else {
                setMessages((prev) => [...ordered, ...prev]);
            }

            setHasMore(data.length === PAGE_SIZE);
            setPage(pageToLoad);
        } catch (err) {
            console.error("❌ Lỗi khi lấy tin nhắn:", err);
        }
    }, []);

    const loadMoreMessages = async () => {
        if (!chatContainerRef.current || loadingMore || !hasMore || !activeUser) return;

        const container = chatContainerRef.current;
        if (container.scrollTop === 0) {
            setLoadingMore(true);
            const prevScrollHeight = container.scrollHeight;

            await fetchMessages(activeUser.id, page + 1);

            setTimeout(() => {
                if (!chatContainerRef.current) {
                    setLoadingMore(false);
                    return;
                }
                const newScrollHeight = chatContainerRef.current.scrollHeight;
                chatContainerRef.current.scrollTop = newScrollHeight - prevScrollHeight;
                setLoadingMore(false);
            }, 0);
        }
    };

    // 📌 Gửi tin nhắn
    const sendMessage = () => {
        if (!newMsg.trim() || !activeUser || !senderId) return;

        const msgObj = {
            content: newMsg,
            receiverId: activeUser.id,
            chatId: `user_${activeUser.id}`,
            senderId,
        };

        sendMessageWS(msgObj);

        setTimeout(() => {
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
        }, 50);

        setNewMsg("");
    };

    // 📌 Lần đầu: fetch readers + connect WS
    useEffect(() => {
        fetchReaders(0);

        const token = cookies.load("token");
        connectWS({
            token,
            onMessage: (msg) => {
                setMessages((prev) => {
                    if (!msg || !msg.id) return [...prev, msg];
                    if (prev.some((m) => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });

                setTimeout(() => {
                    if (!chatContainerRef.current) return;
                    const container = chatContainerRef.current;
                    const distanceFromBottom =
                        container.scrollHeight - container.scrollTop - container.clientHeight;
                    if (distanceFromBottom < 100) {
                        container.scrollTop = container.scrollHeight;
                    }
                }, 50);
            },
        }).then((userId) => {
            setSenderId(userId);
        });

        return () => disconnectWS();
    }, [fetchReaders]);

    // 📌 Khi chọn user: load page 0 + subscribe
    useEffect(() => {
        if (!activeUser) return;

        let cancelled = false;
        setPage(0);
        setHasMore(true);

        (async () => {
            await fetchMessages(activeUser.id, 0);
            if (cancelled) return;
            setTimeout(() => {
                if (chatContainerRef.current) {
                    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                }
            }, 50);
        })();

        const unsubscribe = subscribeToChat(activeUser.id, (msg) => {
            setMessages((prev) => {
                if (msg && msg.id && prev.some((m) => m.id === msg.id)) return prev;
                return [...prev, msg];
            });

            setTimeout(() => {
                if (!chatContainerRef.current) return;
                const container = chatContainerRef.current;
                const distanceFromBottom =
                    container.scrollHeight - container.scrollTop - container.clientHeight;
                if (distanceFromBottom < 100) {
                    container.scrollTop = container.scrollHeight;
                }
            }, 50);
        });

        return () => {
            cancelled = true;
            if (typeof unsubscribe === "function") unsubscribe();
        };
    }, [activeUser, fetchMessages]);

    return (
        <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
            {/* Sidebar */}
            <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-800">
                    <UserGroupIcon className="h-7 w-7 text-blue-500" />
                    Độc giả
                </div>

                <div className="relative mb-4">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        placeholder="Tìm kiếm hội thoại..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                </div>

                <div
                    className="flex-1 overflow-y-auto space-y-2"
                    ref={readersContainerRef}
                    onScroll={loadMoreReaders}
                >
                    {loading && <p className="text-gray-500 text-center py-4">Đang tải...</p>}
                    {loadingMoreReaders && (
                        <p className="text-gray-500 text-center py-4">Đang tải thêm...</p>
                    )}
                    {!loading &&
                        readers.map((r) => (
                            <div
                                key={r.id}
                                onClick={() => setActiveUser(r)}
                                className={`p-3 rounded-xl cursor-pointer transition-colors duration-200 flex items-center justify-between ${
                                    activeUser?.id === r.id
                                        ? "bg-blue-100 text-blue-700 font-semibold"
                                        : "hover:bg-gray-100 text-gray-800"
                                }`}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="bg-gray-200 rounded-full h-10 w-10 flex items-center justify-center text-lg font-bold text-gray-600">
                                        {r.name?.charAt(0) || "?"}
                                    </div>
                                    <span className="truncate">{r.name}</span>
                                </div>
                                {r.isMember && (
                                    <span className="text-xs font-medium bg-green-500 text-white px-2 py-1 rounded-full">
                                        Member
                                    </span>
                                )}
                            </div>
                        ))}
                </div>
            </div>

            {/* Main Chat */}
            <div className="flex flex-col flex-1 min-w-0">
                {activeUser ? (
                    <>
                        {/* Header */}
                        <div className="bg-white border-b border-gray-200 p-4 shadow-sm flex items-center gap-3 overflow-hidden">
                            <div className="bg-gray-200 rounded-full h-10 w-10 flex items-center justify-center text-lg font-bold text-gray-600">
                                {activeUser.name?.charAt(0) || "?"}
                            </div>
                            <div className="font-semibold text-xl text-gray-800 truncate">
                                {activeUser.name}
                            </div>
                            {activeUser.isMember && (
                                <span className="text-xs font-medium bg-green-500 text-white px-2 py-1 rounded-full">
                                    Member
                                </span>
                            )}
                        </div>

                        {/* Messages */}
                        <div
                            className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50"
                            ref={chatContainerRef}
                            onScroll={loadMoreMessages}
                        >
                            {loadingMore && (
                                <p className="text-center text-gray-500 text-sm">Đang tải thêm...</p>
                            )}
                            {messages.map((msg) => (
                                <div
                                    key={msg.id || `msg-${Date.now()}-${Math.random()}`}
                                    className={`flex ${
                                        msg.senderType === "LIBRARIAN" ? "justify-end" : "justify-start"
                                    }`}
                                >
                                    <div
                                        className={`p-3 rounded-2xl max-w-sm break-words whitespace-pre-wrap overflow-hidden ${
                                            msg.senderType === "LIBRARIAN"
                                                ? "bg-blue-500 text-white rounded-br-none shadow-md"
                                                : "bg-gray-300 text-gray-800 rounded-bl-none shadow-sm"
                                        }`}
                                    >
                                        <p className="text-sm break-words">{msg.content}</p>
                                        <span
                                            className={`block text-right mt-1 text-xs ${
                                                msg.senderType === "LIBRARIAN"
                                                    ? "text-blue-200"
                                                    : "text-gray-500"
                                            }`}
                                        >
                                            {msg.createdAt
                                                ? new Date(msg.createdAt).toLocaleString()
                                                : ""}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="bg-white p-4 border-t border-gray-200 flex items-center gap-3">
                            <input
                                value={newMsg}
                                onChange={(e) => setNewMsg(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                                placeholder="Nhập tin nhắn..."
                                className="flex-1 py-2 px-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all overflow-hidden"
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                <PaperAirplaneIcon className="h-5 w-5 rotate-90" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 p-6">
                        <ChatBubbleOvalLeftEllipsisIcon className="h-24 w-24 text-gray-300 mb-4" />
                        <p className="text-lg font-medium">Chọn một người để bắt đầu trò chuyện</p>
                    </div>
                )}
            </div>
        </div>
    );
}