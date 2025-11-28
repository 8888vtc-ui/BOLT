import RoomCard from './RoomCard';

export default function RoomList({ rooms, onJoinRoom }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          onJoin={() => onJoinRoom(room.id)}
        />
      ))}
    </div>
  );
}
