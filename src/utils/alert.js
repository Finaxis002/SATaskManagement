import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// Optional: enable React content rendering
const MySwal = withReactContent(Swal);

export const showAlert = (title = "Success", text = "", icon = "success") => {
  MySwal.fire({
    title: `<div style="font-size:18px; font-weight:600;">${title}</div>`,
    html: `<div style="font-size:16px;">${text}</div>`,
    icon: icon, // You can also pass 'success', 'error', 'warning', 'question'
    customClass: {
      popup: 'custom-alert-popup',
      confirmButton: 'custom-alert-button',
    },
    buttonsStyling: false,
    confirmButtonText: "OK",
  });
};
