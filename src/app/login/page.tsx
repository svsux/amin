// filepath: src/app/login/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // Используем next/navigation для App Router

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false, // Мы сами будем управлять редиректом
        email,
        password,
      });

      if (result?.error) {
        setError(result.error === "CredentialsSignin" ? "Неверный email или пароль." : result.error);
        setIsLoading(false);
      } else if (result?.ok) {
        // Ждем обновления сессии и получаем роль пользователя
        const session = await getSession();
        if (session?.user?.role === "ADMIN") {
          router.replace("/admin");
        } else if (session?.user?.role === "CASHIER") {
          router.replace("/cashier");
        } else {
          router.replace("/");
        }
      } else {
        setError("Произошла неизвестная ошибка. Попробуйте снова.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Произошла ошибка при попытке входа.");
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h1>Вход</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="email" style={{ display: "block", marginBottom: "5px" }}>Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="password" style={{ display: "block", marginBottom: "5px" }}>Пароль:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={isLoading} style={{ padding: "10px 15px", cursor: "pointer" }}>
          {isLoading ? "Вход..." : "Войти"}
        </button>
      </form>
      {/* Можно добавить ссылку на страницу регистрации здесь, когда она будет создана */}
      {/* <p>Нет аккаунта? <a href="/register">Зарегистрироваться</a></p> */}
    </div>
  );
}