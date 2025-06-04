
const convertSlotToTimeRange = (slot) => {
  console.log("Received slot:", slot); // Debugging

  // Ensure slot is a string and parse it properly
  let hours, minutes;

  if (typeof slot === "string") {
    let parsedSlot = slot.split(".");
    hours = parseInt(parsedSlot[0], 10);
    minutes = parsedSlot[1] === "5" ? 30 : 0; // "6.5" → 6:30, "6.0" → 6:00
  } else if (Array.isArray(slot) && slot.length === 2) {
    hours = slot[0];
    minutes = slot[1] === 5 ? 30 : 0;
  } else {
    console.error("Invalid slot format:", slot);
    return "Invalid Slot";
  }

  // Compute end time
  let endHours = hours;
  let endMinutes = minutes + 30;
  
  if (endMinutes === 60) {
    endMinutes = 0;
    endHours += 1;
  }

  // Convert to 12-hour format and determine AM/PM
  const formatTime = (hr, min) => {
    let period = hr < 12 ? "AM" : "PM";
    let formattedHour = hr % 12 || 12; // 0 → 12 for AM
    let formattedMinute = min.toString().padStart(2, "0"); // Ensure two-digit minutes
    return `${formattedHour}:${formattedMinute} ${period}`;
  };

  console.log(`Converted Time: ${formatTime(hours, minutes)} - ${formatTime(endHours, endMinutes)}`);

  return `${formatTime(hours, minutes)} - ${formatTime(endHours, endMinutes)}`;
};

export default convertSlotToTimeRange;