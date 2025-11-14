import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/api";

function Login() {
  const [searchParams] = useSearchParams();
  const mensagem = searchParams.get("mensagem");
  const navigate = useNavigate();

  function handleForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const senha = formData.get("senha");

    api.post("/login", { email, senha })
      .then((response) => {
        if (response.status === 200) {
          localStorage.setItem("token", response?.data?.token); 
          navigate("/");
        }
      })
      .catch((error: any) => {
        const msg =
          error?.response?.data?.mensagem ??
          error?.message ??
          "Erro Desconhecido.";
        navigate(`/login?mensagem=${encodeURIComponent(msg)}`);
      });
  }

  return (
    <div className="login-page">
      <div className="header">
        <img src="./logo.png" alt="Floricultura Logo" className="logo" />
      </div>

      <div className="login-container">
        <h2 className="login-title">🌸Bem-vindo à Floricultura</h2>
        {mensagem && <p className="login-message">{mensagem}</p>}

        <form onSubmit={handleForm} className="login-form">
          <input type="text" name="email" placeholder="Email" required />
          <input type="password" name="senha" placeholder="Senha" required />
          <input type="submit" value="Entrar" className="login-btn" />
        </form>

      </div>
    </div>
  );
}

export default Login;
