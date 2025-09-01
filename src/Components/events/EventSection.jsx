import {
  FaCalendarAlt,
  FaCalendarTimes,
  FaClock,
  FaHourglassStart,
  FaHourglassEnd,
  FaAlignLeft,
  FaUserFriends,
  FaTimes,
  FaPen,
  FaUser
} from "react-icons/fa";
import { parseISO, format } from "date-fns";

const EventSection = ({ title, color, data, onDelete, onEdit }) => (
  <div
    className={`rounded-xl  max-h-[70vh] overflow-y-auto bg-gray-200 p-5 shadow-md ${color} border border-gray-200 bg-opacity-20 backdrop-blur-sm`}
  >
    <div className="flex items-center justify-between mb-6">
      <h4 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
        <FaCalendarAlt className="text-indigo-600" />
        {title}
      </h4>
      <span className="text-xs font-medium bg-white px-3 py-1 rounded-full text-gray-700 shadow-sm">
        {data.length} {data.length === 1 ? "Event" : "Events"}
      </span>
    </div>

    {data.length === 0 ? (
      <div className="text-center py-12">
        <FaCalendarTimes className="mx-auto text-gray-300 text-3xl mb-2" />
        <p className="text-sm text-gray-500">No events scheduled</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
        {data.map((event, index) => {
          if (!event || !event.title) return null; // ⛑️ Prevent crash
          return (
            <div
              key={index}
              className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 hover:border-purple-100"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 text-base flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></span>
                  <span className="line-clamp-2">{event.title}</span>
                </h3>
                <button
                  onClick={() => onDelete(event._id)}
                  className="text-gray-300 hover:text-red-500 p-1 transition-colors duration-200"
                  aria-label="Delete event"
                >
                  <FaTimes size={16} />
                </button>
              </div>

              {/* Date and Time */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaCalendarAlt className="text-purple-400 flex-shrink-0" />
                    <span className="font-medium text-gray-700">
                      {format(parseISO(event.startDateTime), "EEE, MMM d")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaClock className="text-purple-400 flex-shrink-0" />
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-700">
                        {format(parseISO(event.startDateTime), "h:mm a")}
                      </span>
                      <span className="text-gray-400">-</span>
                      <span className="font-medium text-gray-700">
                        {format(parseISO(event.endDateTime), "h:mm a")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div className="mb-4">
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <FaAlignLeft className="text-purple-400 mt-0.5 flex-shrink-0" />
                    <p className="whitespace-pre-line text-gray-700">
                      {event.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Guests */}
              {event.guestEmails?.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-start gap-3 text-sm">
                    <FaUserFriends className="text-purple-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-700 mb-2">
                        Invited Guests
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {event.guestEmails.map((email, i) => (
                          <span
                            key={i}
                            className="bg-gray-50 px-3 py-1.5 rounded-full text-xs text-gray-700 border border-gray-200 flex items-center gap-1"
                          >
                            <FaUser className="text-gray-400 text-xs" />
                            {email}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => onEdit(event)}
                  className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors duration-200"
                >
                  <FaPen size={12} />
                  <span>Edit Event</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

export default EventSection;
