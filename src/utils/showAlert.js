import Swal from "sweetalert2";

export const showAlert = (options) => {
  document.activeElement?.blur(); // fix aria error

  return Swal.fire({
    returnFocus: false,
    confirmButtonColor: "#f97316",
    ...options,
  });
};