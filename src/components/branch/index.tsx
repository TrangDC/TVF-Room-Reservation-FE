// import React, { useEffect, useState } from "react";
// import { useOffices } from "../../api/office/query";
// import { ISelectRoom } from "../../types/interfaces/selectRoom";
// interface BranchSelectorProps {
//   onRoomSelect: (room: ISelectRoom) => void;
//   initialBranch?: string;
//   initialRoom?: string;
// }

// const BranchSelector: React.FC<BranchSelectorProps> = ({
//   onRoomSelect,
//   initialBranch = "",
//   initialRoom = ""
// }) => {
//   const [selectedBranch, setSelectedBranch] = useState<string>(initialBranch);
//   const [selectedRoom, setSelectedRoom] = useState<string>(initialRoom);
//   const { data: offices = [], isLoading, isError, error } = useOffices();

//   useEffect(() => {
//     if (initialBranch) {
//       setSelectedBranch(initialBranch);
//     }
//     if (initialRoom) {
//       setSelectedRoom(initialRoom);
//     }
//   }, [initialBranch, initialRoom]);

//   // Reset selected office and room when offices change
//   useEffect(() => {
//     setSelectedBranch("");
//     setSelectedRoom("");
//   }, [offices]);

//   // Handle office selection change
//   const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const branchId = e.target.value;
//     setSelectedBranch(branchId);

//     if (branchId === "") {
//       setSelectedRoom("");
//       return;
//     }

//     const office = offices?.find((office) => office.id === branchId);
//     if (office) {
//       const defaultRoom = office.rooms[0];
//       setSelectedRoom(defaultRoom.id);
//       onRoomSelect({
//         roomName: defaultRoom.room_name,
//         description: defaultRoom.description,
//         roomImage: defaultRoom.room_img,
//         roomID: defaultRoom.id,
//         branchID: branchId,
//         branchColor: office.color
//       });
//     }
//   };

//   // Handle room selection change
//   const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const roomId = e.target.value;
//     setSelectedRoom(roomId);
//     const office = offices.find((office) => office.id === selectedBranch);
//     const room = office?.rooms.find((room) => room.id === roomId);

//     if (room && office) {
//       onRoomSelect({
//         roomName: room.room_name,
//         description: room.description,
//         roomImage: room.room_img,
//         roomID: room.id,
//         branchID: office.id,
//         branchColor: office.color
//       });
//     }
//   };

//   if (isLoading) return <div>Loading...</div>;
//   if (isError) return <div>Error: {error?.message}</div>;

//   return (
//     <div className='flex flex-col my-[20px]'>
//       <label htmlFor='office' className='block mb-2 text-sm font-medium text-gray-900'>
//         Select a office
//       </label>
//       <select
//         id='office'
//         className='cursor-pointer font-semibold bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 '
//         value={selectedBranch}
//         onChange={handleBranchChange}
//       >
//         <option value='' disabled>
//           Please choose a office
//         </option>
//         {offices.map((office) => (
//           <option className='cursor-pointer font-semibold' key={office.id} value={office.id}>
//             {office.branch_name}
//           </option>
//         ))}
//       </select>

//       {selectedBranch && (
//         <div className='mt-4'>
//           <label htmlFor='room' className='block mb-2 text-sm font-medium text-gray-900'>
//             Select a room
//           </label>
//           <select
//             id='room'
//             className='cursor-pointer text-green-500 font-semibold bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 '
//             value={selectedRoom}
//             onChange={handleRoomChange}
//             disabled={selectedBranch === ""}
//           >
//             {offices
//               .find((office) => office.id === selectedBranch)
//               ?.rooms.map((room) => (
//                 <option key={room.id} value={room.id}>
//                   {room.room_name}
//                 </option>
//               ))}
//           </select>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BranchSelector;
