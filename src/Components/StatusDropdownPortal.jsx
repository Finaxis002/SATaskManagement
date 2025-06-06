import ReactDOM from "react-dom";

const StatusDropdownPortal = ({ children }) => {
  return ReactDOM.createPortal(
    children,
    document.getElementById("dropdown-root") // Add this div in index.html
  );
};

export default StatusDropdownPortal;
