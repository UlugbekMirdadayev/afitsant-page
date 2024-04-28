import React from 'react';
import { Link } from 'react-router-dom';
import { useRooms } from '../redux/selectors';

const Rooms = () => {
  const rooms = useRooms();

  return (
    <div className="container-md">
      <div className="row-header">
        <h1 className="full">joylar royxati</h1>
      </div>
      <div className="grid">
        {rooms?.map((room) => (
          <Link
            to={room?.is_active ? (room?.is_belongs_to_user ? `/order/${room?.id}` : undefined) : `/order/${room?.id}`}
            key={room?.id}
            className={`room ${room?.is_active ? 'busy' : ''} ${room?.is_active ? (room?.is_belongs_to_user ? '' : 'disabled') : ''}`}
          >
            <p>{room?.name}-stol</p>
            <p>{room?.places}-kishilik</p>
            {room?.is_active ? <p>band stol</p> : null}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Rooms;
