import React, { useState } from 'react';
import Map from './components/Map';
import { Plus, Edit, Trash } from 'lucide-react';

interface Waypoint {
  latitude: number;
  longitude: number;
}

const App: React.FC = () => {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [isAddingWaypoint, setIsAddingWaypoint] = useState(false);
  const [isEditingWaypoint, setIsEditingWaypoint] = useState(false);
  const [isDeletingWaypoint, setIsDeletingWaypoint] = useState(false);

  const initialCenter = { latitude: 13.7563, longitude: 100.5018 }; // Bangkok coordinates

  const toggleAddWaypoint = () => {
    const newState = !isAddingWaypoint;
    setIsAddingWaypoint(newState);
    setIsEditingWaypoint(false);
    setIsDeletingWaypoint(false);
    console.log('isAddingWaypoint toggled:', newState);
  };

  const toggleEditWaypoint = () => {
    const newState = !isEditingWaypoint;
    setIsEditingWaypoint(newState);
    setIsAddingWaypoint(false);
    setIsDeletingWaypoint(false);
    console.log('isEditingWaypoint toggled:', newState);
  };

  const toggleDeleteWaypoint = () => {
    const newState = !isDeletingWaypoint;
    setIsDeletingWaypoint(newState);
    setIsAddingWaypoint(false);
    setIsEditingWaypoint(false);
    console.log('isDeletingWaypoint toggled:', newState);
  };

  const handleAddWaypoint = (waypoint: Waypoint) => {
    setWaypoints((prevWaypoints) => [...prevWaypoints, waypoint]);
    console.log('New waypoint added:', waypoint);
    console.log('Updated waypoints:', [...waypoints, waypoint]);
  };

  const handleUpdateWaypoint = (index: number, updatedWaypoint: Waypoint) => {
    setWaypoints((prevWaypoints) => {
      const newWaypoints = [...prevWaypoints];
      newWaypoints[index] = updatedWaypoint;
      console.log(`Waypoint at index ${index} updated:`, updatedWaypoint);
      console.log('Updated waypoints:', newWaypoints);
      return newWaypoints;
    });
  };

  const handleDeleteWaypoint = (index: number) => {
    setWaypoints((prevWaypoints) => {
      const newWaypoints = prevWaypoints.filter((_, i) => i !== index);
      console.log(`Waypoint at index ${index} deleted.`);
      console.log('Updated waypoints:', newWaypoints);
      return newWaypoints;
    });
  };

  return (
    <div className="relative h-screen w-screen">
      <div className="absolute top-4 left-4 z-10 flex flex-row space-x-4">
        <button
          onClick={toggleAddWaypoint}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
            isAddingWaypoint ? 'bg-red-500' : 'bg-blue-500'
          } text-white`}
        >
          <Plus size={16} /> {/* ไอคอน Plus */}
          <span>
            {isAddingWaypoint ? 'Cancel Adding Waypoint' : 'Add Waypoint'}
          </span>
        </button>
        <button
          onClick={toggleEditWaypoint}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
            isEditingWaypoint ? 'bg-red-500' : 'bg-green-500'
          } text-white`}
        >
          <Edit size={16} /> {/* ไอคอน Edit */}
          <span>
            {isEditingWaypoint ? 'Stop Editing' : 'Edit Waypoints'}
          </span>
        </button>
        <button
          onClick={toggleDeleteWaypoint}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
            isDeletingWaypoint ? 'bg-red-500' : 'bg-yellow-500'
          } text-white`}
        >
          <Trash size={16} /> {/* ไอคอน Trash */}
          <span>
            {isDeletingWaypoint ? 'Cancel Delete Mode' : 'Delete Waypoints'}
          </span>
        </button>
      </div>
      <Map
        waypoints={waypoints}
        isAddingWaypoint={isAddingWaypoint}
        isEditingWaypoint={isEditingWaypoint}
        isDeletingWaypoint={isDeletingWaypoint}
        onAddWaypoint={handleAddWaypoint}
        onUpdateWaypoint={handleUpdateWaypoint}
        onDeleteWaypoint={handleDeleteWaypoint}
        initialCenter={initialCenter} // Pass initial center to Map
      />
    </div>
  );
};

export default App;