import { useRoomContext } from "@/context/RoomContext";
import Navbar from "@/layout/Navbar";

export default function GlobalNavbar() {
  const {
    roomCode,
    setRoomCode,
    username,
    setUsername,
    isConnected,
    hasPeer,
    connectToChatRoom,
    disconnectFromChatRoom,
  } = useRoomContext();

  return (
    <Navbar
      roomId={roomCode}
      setRoomId={setRoomCode}
      username={username}
      setUsername={setUsername}
      handleConnectSocket={connectToChatRoom}
      handleDisconnectSocket={disconnectFromChatRoom}
      isConnected={isConnected}
      hasPeer={hasPeer}
    />
  );
}
