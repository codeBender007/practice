import { Button } from "@chakra-ui/react";
import { useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import { FiLogOut } from "react-icons/fi";
import API_BASE_URL from "../App"

export default function LogoutButton() {

    const setUser = useSetRecoilState(userAtom);
    const showToast = useShowToast();


    const handleLogout = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();
            // Check if the response status is not OK
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }



            localStorage.removeItem("user-threads");
            setUser(null);
        } catch (err) {
            console.error("Logout error:", err);
            showToast("Error", err.message);
        }
    };


  return (
    <Button position={"fixed"} top={"30px"} right={"30px"} size={"sm"} onClick={handleLogout} >
        <FiLogOut size={20} />
    </Button>
  )
}
