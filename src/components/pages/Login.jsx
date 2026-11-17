import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { BookOpen, Moon, Sun } from "lucide-react";
import { apiLogin } from "../../api";

export default function Login({ onLoginSuccess, theme, onToggleTheme }) {
  const [error, setError] = useState("");

  const handleGoogleLogin = async (response) => {
    try {
      setError("");
      if (!response.credential) throw new Error("Google did not return an ID token. Check the configured OAuth client ID.");
      const result = await apiLogin(response.credential);
      onLoginSuccess(result.token, result.user);
    } catch (loginError) {
      setError(loginError.message || "Sign-in failed. Try again.");
    }
  };

  return <section className="login-page">
    <div className="login-panel">
      <div className="login-topline"><a className="brand" href="/" aria-label="Skillhub home"><BookOpen size={18} strokeWidth={1.5} /><span>Skillhub</span></a><button className="icon-button" onClick={onToggleTheme} aria-label="Toggle theme">{theme === "light" ? <Moon size={18} strokeWidth={1.5} /> : <Sun size={18} strokeWidth={1.5} />}</button></div>
      <p className="eyebrow">Air University · Student access</p>
      <h1>Coursework, in one place</h1>
      <p className="login-description">Sign in with your university Google account to view courses, record progress, and see your class profile.</p>
      <div className="google-signin"><GoogleLogin onSuccess={handleGoogleLogin} onError={() => setError("Google sign-in failed. Try again.")} text="continue_with" shape="rectangular" theme="outline" /></div>
      {error && <p role="alert" className="form-error">{error}</p>}
      <p className="login-footnote">Access is limited to @students.au.edu.pk accounts.</p>
    </div>
    <p className="credit">UI refined with unslop by @heydamir · CC BY 4.0</p>
  </section>;
}
