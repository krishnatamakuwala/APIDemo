import axios from "axios";
import { HttpStatus, ResponseStatus } from "@/enums/APIStatus";
import { redirect } from "next/navigation";

export interface IAPIResponse {
    status: ResponseStatus;
    message: string;
    data: unknown | unknown[];
}

export const apiContext = axios.create({
    baseURL: process.env.API_URL + "/api",
    headers: {
        "Content-Type": "application/json; charset=utf-8"
    },
    withCredentials: true,
});

apiContext.interceptors.response.use(
    (response) => response, // Pass through successful responses
    (error) => {
        const { config, response } = error;
        // Check for 401 status and absence of the `skipAuthRedirect` flag
        if (response && response.status === HttpStatus.UnAuthorised && !config?.skipAuthRedirect) {
            // Redirect to signin if the flag is not set
            redirect("/auth/signin");
        }
        return Promise.reject(error); // Reject all other errors
    }
);