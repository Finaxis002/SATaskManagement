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
} from "react-icons/fa";
import { parseISO, format } from "date-fns";

const EventSection = ({ title, color, data, onDelete }) => (
  <div
    className={`rounded-xl relative !w-[160vh] h-[45vh] overflow-auto  p-5 shadow-md ${color} border border-gray-200 bg-opacity-20 backdrop-blur-sm`}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {data.map((event, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-xl shadow hover:shadow-md border border-gray-200 transition-all"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900 pr-4 text-sm">
                {event.summary}
              </h3>
              <button
                onClick={() => onDelete(event._id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                title="Delete event"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div className="flex flex-col gap-1 text-xs text-gray-600 mb-3">
              <div className="flex items-center gap-1.5">
                <FaClock className="text-gray-400" />
                <span>
                  {format(parseISO(event.startDateTime), "EEE, MMM d")}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaHourglassStart className="text-gray-400" />
                <span>{format(parseISO(event.startDateTime), "h:mm a")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaHourglassEnd className="text-gray-400" />
                <span>{format(parseISO(event.endDateTime), "h:mm a")}</span>
              </div>
            </div>

            {event.description && (
              <div className="flex items-start gap-2 text-xs text-gray-600 mb-3">
                <FaAlignLeft className="text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="whitespace-pre-line">{event.description}</span>
              </div>
            )}

            {event.guestEmails?.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="flex items-start gap-2 text-xs text-gray-600">
                  <FaUserFriends className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-700 mb-1">
                      Invited Guests:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {event.guestEmails.map((email, i) => (
                        <span
                          key={i}
                          className="bg-gray-100 px-2 py-1 rounded-full text-xs"
                        >
                          {email}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
              <button
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                onClick={() => {
                  // Add edit functionality here
                }}
              >
                <FaPen size={10} /> Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default EventSection;
