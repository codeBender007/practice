import React from 'react'
import { useRecoilState } from 'recoil';
import userAtom from '../atoms/userAtom';
import useShowToast from './useShowToast';
import API_BASE_URL from "../App"

export default function useLogout() {

    const [user ,setUser] = useRecoilState(userAtom);
    const showToast = useShowToast();

    const logout = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });


            const data = await res.json();

            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }

            // Remove user data and clear state
            localStorage.removeItem("user-threads");
            setUser(null);
        } catch (err) {
            console.error("Logout error:", err);
            showToast("Error", err.message);
        }
    };
    return logout;
}
