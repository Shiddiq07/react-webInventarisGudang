"use client";
import { useUserRole } from '../../../context/UserContext'; // Import custom Hook yang benar


export default function Dashboard() {
  const { role, setRole } = useUserRole(); // Gunakan custom Hook untuk mendapatkan role dan setRole
    console.log(role);
    return (
      <>
        Have A Nice Day!
      </>
    );
}
  