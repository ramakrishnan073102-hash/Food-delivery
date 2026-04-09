import Swal from "sweetalert2";

export const showAlert = (options) => {
  // 🔥 Fix aria-hidden + focus issue
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  return Swal.fire({
    returnFocus: false, // 🔥 FIX ERROR
    confirmButtonColor: "#f97316",
    ...options,
  });
};