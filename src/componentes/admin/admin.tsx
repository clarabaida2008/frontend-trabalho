import api from "../../api/api";
import React, { useState, useEffect } from "react";

type ProdutoType = {
  _id: string;
  nome: string;
  preco: number;
  descricao: string;
  urlfoto: string;
};

type UsuarioType = {
  _id: string;
  nome: string;
  email: string;
  tipo: string;
};

function Admin() {
  const [produtos, setProdutos] = useState<ProdutoType[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioType[]>([]);
  const [mensagemUsuarios, setMensagemUsuarios] = useState<string>("");

  // Carrega produtos cadastrados
  useEffect(() => {
    api
      .get("/produtos")
      .then((response) => setProdutos(response.data))
      .catch((error) => {
        console.error("Erro ao buscar produtos:", error);
        alert("Erro ao buscar produtos.");
      });
  }, []);

  // Cadastro de produto
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nome = formData.get("nome");
    const preco = formData.get("preco");
    const descricao = formData.get("descricao");
    const urlfoto = formData.get("urlfoto");
    const produto = { nome, preco, descricao, urlfoto };

    api
      .post("/produtos", produto)
      .then((response) => setProdutos([...produtos, response.data]))
      .catch((error) => {
        console.error("Erro ao cadastrar produto:", error);
        const msg =
          error?.response?.data?.mensagem ??
          "Erro ao cadastrar produto. Verifique as permissões.";
        alert(msg);
      });
  }

  // Buscar usuários cadastrados (apenas backend decide se pode)
  function listarUsuarios() {
    setMensagemUsuarios("Carregando usuários...");
    api
      .get("/usuarios")
      .then((response) => {
        setUsuarios(response.data);
        setMensagemUsuarios("");
      })
      .catch((error) => {
        console.error("Erro ao buscar usuários:", error);
        const msg =
          error?.response?.data?.mensagem ??
          "Acesso negado: apenas administradores podem listar usuários.";
        setMensagemUsuarios(msg);
      });
  }

  // Função para rolar suavemente até uma seção
  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <header className="header admin-header">
        <img src="./imagens/logo.png" alt="Floricultura Logo" className="logo" />
        <nav className="admin-nav">
          <button onClick={() => scrollToSection("cadastro")} className="nav-btn">
            Cadastrar Produto
          </button>
          <button onClick={() => scrollToSection("lista")} className="nav-btn">
            Lista de Produtos
          </button>
          <button onClick={() => scrollToSection("usuarios")} className="nav-btn">
            Listar Usuários
          </button>
        </nav>
      </header>

      <main className="admin-container">
        <section id="cadastro" className="admin-section">
          <h1 className="admin-title">Cadastro de Produtos</h1>
          <form onSubmit={handleSubmit} className="admin-form">
            <input type="text" placeholder="Nome" name="nome" required />
            <input type="number" placeholder="Preço" name="preco" required />
            <input type="text" placeholder="Descrição" name="descricao" required />
            <input type="text" placeholder="URL da Foto" name="urlfoto" required />
            <button type="submit" className="admin-btn">Cadastrar</button>
          </form>
        </section>

        <section id="lista" className="admin-section">
          <h1 className="admin-title">Lista de Produtos</h1>
          <div className="admin-produtos-grid">
            {produtos.map((produto) => (
              <div key={produto._id} className="admin-produto-card">
                <img src={produto.urlfoto} alt={produto.nome} />
                <div>
                  <h3>{produto.nome}</h3>
                  <p>R$ {produto.preco}</p>
                  <p>{produto.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="usuarios" className="admin-section">
          <h1 className="admin-title">Usuários Cadastrados</h1>
          <button onClick={listarUsuarios} className="admin-btn">Listar Usuários Cadastrados</button>

          {mensagemUsuarios && (
            <p className="admin-info">{mensagemUsuarios}</p>
          )}

          {usuarios.length > 0 && (
            <div className="admin-usuarios-lista">
              {usuarios.map((usuario) => (
                <div key={usuario._id} className="admin-usuario-card">
                  <h3>{usuario.nome}</h3>
                  <p><strong>Email:</strong> {usuario.email}</p>
                  <p><strong>Tipo:</strong> {usuario.tipo}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default Admin;
