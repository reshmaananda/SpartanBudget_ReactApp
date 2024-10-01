import { toast } from 'react-toastify';

export const sendAlert = (message, type) => {
    switch (type) {
        case "Success":
            toast.success(message, {
                position: "top-center",
                autoClose: 700,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light"
            });
            break;
        case "Failure":
            toast.error(message, {
                position: "top-center",
                autoClose: 700,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light"
            });
            break;
    }
};
