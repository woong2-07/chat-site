"use client";

import { useState, useEffect, useRef } from "react";
import {
  createRoom,
  getPublicRooms,
  getPrivateRooms,
  addMessage,
  getRoomMessages,
  generateRandomKey,
  verifyRoomPassword,
  deleteRoomById,
  getAllRooms,
} from "@/lib/database";
import { Room, Message } from "@/lib/supabaseClient";
import { supabase } from "@/lib/supabaseClient";

export default function ChatPage() {
  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [privateRooms, setPrivateRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [selectedPrivateRoom, setSelectedPrivateRoom] = useState<Room | null>(
    null
  );
  const [roomType, setRoomType] = useState<"public" | "private">("public");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [allRooms, setAllRooms] = useState<Room[]>([]);

  // 페이지 로드 시 방 목록 가져오기
  useEffect(() => {
    loadRooms();
    const interval = setInterval(loadRooms, 5000); // 5초마다 새로고침
    return () => clearInterval(interval);
  }, []);

  // 메시지가 업데이트되면 스크롤
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 선택된 방의 메시지 로드
  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
      const interval = setInterval(() => loadMessages(selectedRoom.id), 2000);
      return () => clearInterval(interval);
    }
  }, [selectedRoom]);

  const loadRooms = async () => {
    try {
      const [pubRooms, privRooms] = await Promise.all([
        getPublicRooms(),
        getPrivateRooms(),
      ]);
      setPublicRooms(pubRooms);
      setPrivateRooms(privRooms);
    } catch (error) {
      console.error("방 로드 실패:", error);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const msgs = await getRoomMessages(roomId);
      setMessages(msgs);
    } catch (error) {
      console.error("메시지 로드 실패:", error);
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      alert("방 이름을 입력하세요.");
      return;
    }

    try {
      const newRoom = await createRoom(newRoomName, roomType === "private");
      if (newRoom) {
        if (roomType === "private") {
          alert(`방이 생성되었습니다!\n비밀번호: ${newRoom.password_key}`);
        } else {
          alert("공개 방이 생성되었습니다!");
        }
        setNewRoomName("");
        setShowCreateRoom(false);
        loadRooms();
      }
    } catch (error) {
      console.error("방 생성 실패:", error);
      alert("방 생성에 실패했습니다.");
    }
  };

  const handleSelectPublicRoom = (room: Room) => {
    setSelectedRoom(room);
    setShowKeyInput(false);
  };

  const handleSelectPrivateRoom = (room: Room) => {
    setSelectedPrivateRoom(room);
    setShowKeyInput(true);
    setPrivateKey("");
  };

  const handleVerifyPrivateRoom = async () => {
    if (!selectedPrivateRoom) return;

    try {
      const isValid = await verifyRoomPassword(selectedPrivateRoom.id, privateKey);
      if (isValid) {
        setSelectedRoom(selectedPrivateRoom);
        setShowKeyInput(false);
      } else {
        alert("비밀번호가 잘못되었습니다.");
      }
    } catch (error) {
      console.error("비밀번호 확인 실패:", error);
      alert("비밀번호 확인에 실패했습니다.");
    }
  };

  const handleSendMessage = async () => {
    if (!selectedRoom || !messageInput.trim()) return;

    try {
      await addMessage(selectedRoom.id, messageInput);
      setMessageInput("");
      loadMessages(selectedRoom.id);
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      alert("메시지 전송에 실패했습니다.");
    }
  };

  const handleAdminAuth = async () => {
    if (adminPassword === "10024610!Qqwaert") {
      setShowAdminAuth(false);
      setShowAdminPanel(true);
      setAdminPassword("");
      try {
        const rooms = await getAllRooms();
        setAllRooms(rooms);
      } catch (error) {
        console.error("방 목록 조회 실패:", error);
      }
    } else {
      alert("비밀번호가 잘못되었습니다.");
      setAdminPassword("");
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (window.confirm("이 방을 삭제하시겠습니까?")) {
      try {
        await deleteRoomById(roomId);
        const rooms = await getAllRooms();
        setAllRooms(rooms);
        alert("방이 삭제되었습니다.");
      } catch (error) {
        console.error("방 삭제 실패:", error);
        alert("방 삭제에 실패했습니다.");
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 왼쪽: 공개 방 */}
      <div className="w-1/2 border-r border-gray-300 bg-white flex flex-col">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 font-bold text-lg flex justify-between items-center">
          <span>🌐 공개방</span>
          <button
            onClick={() => setShowAdminAuth(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-3 rounded text-sm transition"
            title="개발자 전용"
          >
            🔧 개발자
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {publicRooms.length === 0 ? (
            <div className="text-gray-400 text-center py-8">방이 없습니다</div>
          ) : (
            publicRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => handleSelectPublicRoom(room)}
                className={`p-3 rounded cursor-pointer transition ${
                  selectedRoom?.id === room.id
                    ? "bg-blue-100 border-2 border-blue-500"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <div className="font-semibold text-gray-800">{room.name}</div>
                <div className="text-xs text-gray-500">
                  생성: {new Date(room.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-gray-300 p-4 space-y-2">
          <button
            onClick={() => {
              setShowCreateRoom(true);
              setRoomType("public");
            }}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition"
          >
            ➕ 공개방 만들기
          </button>
          <div className="text-xs text-gray-600 bg-yellow-50 p-3 rounded border border-yellow-200">
            ⚠️ <strong>사용 주의사항:</strong>
            <br />
            • 음담패설 금지
            <br />
            • 욕설 금지
            <br />
            • 존중하는 마음으로 소통해주세요
          </div>
        </div>
      </div>

      {/* 오른쪽: 비공개 방 */}
      <div className="w-1/2 bg-white flex flex-col">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 font-bold text-lg">
          🔒 비공개방
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {privateRooms.length === 0 ? (
            <div className="text-gray-400 text-center py-8">방이 없습니다</div>
          ) : (
            privateRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => handleSelectPrivateRoom(room)}
                className="p-3 rounded cursor-pointer transition bg-gray-100 hover:bg-gray-200"
              >
                <div className="font-semibold text-gray-800">{room.name}</div>
                <div className="text-xs text-gray-500">
                  🔑 비밀번호 필요
                </div>
                <div className="text-xs text-gray-500">
                  생성: {new Date(room.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-gray-300 p-4 space-y-2">
          <button
            onClick={() => {
              setShowCreateRoom(true);
              setRoomType("private");
            }}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition"
          >
            ➕ 비공개방 만들기
          </button>
          <div className="text-xs text-gray-600 bg-yellow-50 p-3 rounded border border-yellow-200">
            ⚠️ <strong>사용 주의사항:</strong>
            <br />
            • 음담패설 금지
            <br />
            • 욕설 금지
            <br />
            • 존중하는 마음으로 소통해주세요
          </div>
        </div>
      </div>

      {/* 채팅 영역 - 화면에 방이 선택되었을 때 표시 */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl flex flex-col w-4/5 h-4/5 max-w-2xl">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4 flex justify-between items-center rounded-t-lg">
              <div>
                <h2 className="text-xl font-bold">{selectedRoom.name}</h2>
                <div className="text-sm opacity-90">
                  {selectedRoom.type === "private" ? "🔒 비공개" : "🌐 공개"}
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedRoom(null);
                  setMessages([]);
                }}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition"
              >
                ✕ 닫기
              </button>
            </div>

            {/* 메시지 영역 */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
              {messages.length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                  아직 메시지가 없습니다
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-indigo-500"
                  >
                    <div className="text-xs text-gray-500 mb-1">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </div>
                    <div className="text-gray-800 break-words">{msg.content}</div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 입력 영역 */}
            <div className="border-t p-4 bg-white rounded-b-lg flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                placeholder="메시지를 입력하세요... (텍스트만 가능)"
                style={{color: '#000000'}}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSendMessage}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                📤 전송
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 방 생성 모달 */}
      {showCreateRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {roomType === "public" ? "🌐 공개방 만들기" : "🔒 비공개방 만들기"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  방 이름
                </label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleCreateRoom();
                  }}
                  placeholder="방 이름을 입력하세요"
                  style={{color: '#000000'}}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {roomType === "private" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    <strong>ℹ️ 비공개방:</strong> 방을 만들면 랜덤 비밀번호가
                    생성되며, 이 비밀번호를 입력해야만 방에 들어올 수 있습니다.
                  </p>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-700">
                  <strong>⏰ 유효기간:</strong> 24시간 후 자동으로 삭제됩니다.
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCreateRoom}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition"
              >
                ✓ 만들기
              </button>
              <button
                onClick={() => {
                  setShowCreateRoom(false);
                  setNewRoomName("");
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition"
              >
                ✕ 취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 비밀번호 입력 모달 */}
      {showKeyInput && selectedPrivateRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">🔐 비밀번호 입력</h2>
            <p className="text-gray-600 mb-4">
              "{selectedPrivateRoom.name}" 방에 들어가려면 비밀번호를
              입력하세요.
            </p>

            <div className="mb-4">
              <input
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleVerifyPrivateRoom();
                }}
                style={{color: '#000000'}}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 text-black"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleVerifyPrivateRoom}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition"
              >
                ✓ 입장
              </button>
              <button
                onClick={() => {
                  setShowKeyInput(false);
                  setPrivateKey("");
                  setSelectedPrivateRoom(null);
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition"
              >
                ✕ 취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 광고 배너 */}
      <div className="fixed bottom-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 p-4 rounded-lg shadow-lg max-w-sm">
        <div className="font-bold text-sm mb-2">📢 광고</div>
        <div className="text-xs">
          익명으로 자유롭게 소통할 수 있는 공간입니다. 모두의 배려로 건강한
          커뮤니티를 만들어요!
        </div>
      </div>

      {/* 개발자 통로 버튼 - 맨 위 */}
      <button
        onClick={() => setShowAdminAuth(true)}
        className="fixed top-4 left-4 text-xs text-gray-400 hover:text-gray-600 opacity-30 hover:opacity-100 transition"
        title="개발자 전용"
      >
        ⚙️
      </button>

      {/* 관리자 인증 모달 */}
      {showAdminAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">🔑 개발자 인증</h2>
            <p className="text-gray-600 mb-4">비밀번호를 입력하세요.</p>

            <div className="mb-4">
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleAdminAuth();
                }}
                placeholder="비밀번호"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAdminAuth}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition"
              >
                ✓ 확인
              </button>
              <button
                onClick={() => {
                  setShowAdminAuth(false);
                  setAdminPassword("");
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition"
              >
                ✕ 취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 관리자 패널 모달 */}
      {showAdminPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl flex flex-col w-11/12 h-5/6 max-w-4xl">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 flex justify-between items-center rounded-t-lg">
              <h2 className="text-2xl font-bold">🛠️ 운영자 패널</h2>
              <button
                onClick={() => {
                  setShowAdminPanel(false);
                  setAllRooms([]);
                }}
                className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded transition"
              >
                ✕ 닫기
              </button>
            </div>

            {/* 방 목록 */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {allRooms.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">
                    방이 없습니다
                  </div>
                ) : (
                  allRooms.map((room) => (
                    <div
                      key={room.id}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">
                          {room.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          유형: {room.type === "public" ? "🌐 공개" : "🔒 비공개"}
                          {room.password_key && ` | 비밀번호: ${room.password_key}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          생성: {new Date(room.created_at).toLocaleString()}
                          <br />
                          만료: {new Date(room.expires_at).toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="ml-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition"
                      >
                        🗑️ 삭제
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 하단 액션 바 */}
            <div className="border-t p-4 bg-gray-50 rounded-b-lg">
              <button
                onClick={async () => {
                  try {
                    const rooms = await getAllRooms();
                    setAllRooms(rooms);
                  } catch (error) {
                    console.error("새로고침 실패:", error);
                  }
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition"
              >
                🔄 새로고침
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
