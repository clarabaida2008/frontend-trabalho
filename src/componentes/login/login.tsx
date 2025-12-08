import { useNavigate, useSearchParams } from "react-router-dom";
import { useRef } from "react";
import api from "../../api/api";

function Login() {
  const [searchParams] = useSearchParams();
  const mensagem = searchParams.get("mensagem");
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement | null>(null);

  function parseJwt(token: string) {
    try {
      const payload = token.split(".")[1];
      const padded = payload.padEnd(payload.length + (4 - (payload.length % 4)) % 4, "=");
      const json = decodeURIComponent(
        atob(padded)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  function doLogin(email: FormDataEntryValue | null, senha: FormDataEntryValue | null, asAdmin: boolean) {
    api
      .post("/login", { email, senha })
      .then((response) => {
        if (response.status === 200) {
          const token = response?.data?.token;
          localStorage.setItem("token", token);

          const payload = parseJwt(token);

          // se tentou entrar como admin mas não for admin, mostrar erro
          if (asAdmin) {
            if (payload && payload.tipo === "admin") {
              navigate("/admin");
            } else {
              const msg = "Acesso negado: somente admins podem entrar como admin.";
              navigate(`/login?mensagem=${encodeURIComponent(msg)}`);
            }
          } else {
            // entrar como cliente (qualquer tipo de usuário pode entrar como cliente)
            navigate("/");
          }
        }
      })
      .catch((error: any) => {
        const msg =
          error?.response?.data?.mensagem ?? error?.message ?? "Erro Desconhecido.";
        navigate(`/login?mensagem=${encodeURIComponent(msg)}`);
      });
  }

  function handleForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const senha = formData.get("senha");

    // submissão via Enter -> login como cliente
    doLogin(email, senha, false);
  }

  function handleClick(asAdmin: boolean) {
    const current = formRef.current;
    if (!current) return;
    const formData = new FormData(current);
    const email = formData.get("email");
    const senha = formData.get("senha");
    doLogin(email, senha, asAdmin);
  }

  return (
    <div className="login-page">
      <div className="header">
        <img src="./logo.png" alt="Floricultura Logo" className="logo" />
      </div>

      <div className="login-container">
        <h2 className="login-title">🌸Bem-vindo à Floricultura</h2>
        {mensagem && <p className="login-message">{mensagem}</p>}

        <form ref={formRef} onSubmit={handleForm} className="login-form">
          <input type="text" name="email" placeholder="Email" required />
          <input type="password" name="senha" placeholder="Senha" required />

          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" className="login-btn" onClick={() => handleClick(false)}>
              Entrar como cliente
            </button>
            <button type="button" className="login-btn" onClick={() => handleClick(true)}>
              Entrar como admin
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default Login;
