"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiContext, IAPIResponse } from "./APIContext";
import { redirect, usePathname } from "next/navigation";
import { ResponseStatus } from "@/enums/APIStatus";

export interface IUser {
    username: string;
    email: string;
    profilePicture?: string;
}

interface IUserContextType {
    user: IUser | null;
    setUser: (user: IUser | null) => void;
    loading: boolean;
}

export const UserContext = createContext<IUserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const pathname = usePathname();

    useEffect(() => {
        const fetchUser = () => {
            const publicRoutes = ['/auth/signin', '/auth/signup'];
            if (publicRoutes.includes(pathname)) {
                setLoading(false);
                return;
            }

            let reDirectPath: string | undefined = undefined;
            apiContext.get("/v1/auth/me")
                .then((response) => {
                    const res = response.data as IAPIResponse;
                    if (res.status === ResponseStatus.Success) {
                        setUser(res.data as IUser);
                    }
                })
                .catch(() => {
                    setUser(null);
                    reDirectPath = "/auth/signin";
                })
                .finally(() => {
                    setLoading(false);
                    if (reDirectPath) {
                        redirect(reDirectPath);
                    }
                });
        }

        fetchUser();
    }, [pathname]);

    return (
        <UserContext.Provider value={{ user, setUser, loading }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within a UserProvider');
    return context;
};

export const useAuthRedirect = (user: IUser | null, loading: boolean) => {
    useEffect(() => {
        if (!loading && !user) {
            redirect('/auth/signin');
        }
    }, [loading, user]);
}