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

type ItemCarrinho = {
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
  nome: string;
};

type CarrinhoType = {
  _id: string;
  usuarioId: string;
  nomeUsuario: string;
  itens: ItemCarrinho[];
  total: number;
  dataAtualizacao: string;
};

function Admin() {
  const [produtos, setProdutos] = useState<ProdutoType[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioType[]>([]);
  const [carrinhos, setCarrinhos] = useState<CarrinhoType[]>([]);

  // NOVOS ESTADOS PARA AS MÉTRICAS
  const [usuariosAtivos, setUsuariosAtivos] = useState(0);
  const [somaValores, setSomaValores] = useState(0);
  const [rankingItens, setRankingItens] = useState<
    { nome: string; quantidade: number }[]
  >([]);

  const [mensagemUsuarios, setMensagemUsuarios] = useState<string>("");
  const [mensagemCarrinhos, setMensagemCarrinhos] = useState<string>("");

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
    const produto = {
      nome: formData.get("nome"),
      preco: formData.get("preco"),
      descricao: formData.get("descricao"),
      urlfoto: formData.get("urlfoto"),
    };

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

  // Buscar usuários cadastrados
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

  // NOVA FUNÇÃO PARA CALCULAR MÉTRICAS DO ADMIN
  function calcularMetricas(carrinhos: CarrinhoType[]) {
    // 1. Usuários com carrinho ativo
    const usuariosUnicos = new Set(carrinhos.map((c) => c.usuarioId));
    setUsuariosAtivos(usuariosUnicos.size);

    // 2. Soma dos valores de todos os carrinhos
    const soma = carrinhos.reduce((acc, c) => acc + c.total, 0);
    setSomaValores(soma);

    // 3. Ranking dos itens mais comprados
    const contadorItens: Record<
      string,
      { nome: string; quantidade: number }
    > = {};

    carrinhos.forEach((c) => {
      c.itens.forEach((item) => {
        if (!contadorItens[item.produtoId]) {
          contadorItens[item.produtoId] = {
            nome: item.nome,
            quantidade: 0,
          };
        }
        contadorItens[item.produtoId].quantidade += item.quantidade;
      });
    });

    const ranking = Object.values(contadorItens)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);

    setRankingItens(ranking);
  }

  // Buscar todos os carrinhos (ADMIN)
  function listarCarrinhos() {
    setMensagemCarrinhos("Carregando carrinhos...");
    const token = localStorage.getItem("token");
    if (!token) {
      setMensagemCarrinhos("Usuário não autenticado. Faça login.");
      return;
    }

    // Decodifica o payload do JWT para inspecionar o tipo/role (apenas para debug)
    try {
      const payloadPart = token.split(".")[1] || "";
      const padded = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(padded)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      const payload = JSON.parse(jsonPayload);
      console.log("JWT payload (debug):", payload);
      // Se quiser forçar uma mensagem caso não seja admin, descomente abaixo:
      // if (!payload?.tipo && !payload?.role && !payload?.isAdmin) setMensagemCarrinhos('Aviso: token sem claim de admin.');
    } catch (e) {
      console.warn("Não foi possível decodificar o JWT para debug", e);
    }

    // Envia explicitamente o header Authorization para garantir que o backend receba o token
    api
      .get("/carrinhos", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        setCarrinhos(response.data);
        calcularMetricas(response.data); // <-- CHAMANDO AS MÉTRICAS
        setMensagemCarrinhos("");
      })
      .catch((error) => {
        console.error("Erro ao buscar carrinhos:", error);
        const status = error?.response?.status;
        const msgFromBackend = error?.response?.data?.mensagem;
        const msg =
          msgFromBackend ||
          (status === 403
            ? "Acesso negado: apenas administradores podem listar carrinhos. (403)"
            : "Erro ao buscar carrinhos. Verifique console e se o token é de admin.");
        setMensagemCarrinhos(msg);
      });
  }

  // Função para rolar para uma seção
  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header className="header admin-header">
        <img src="./logo.png" alt="Floricultura Logo" className="logo" />

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

          <button onClick={() => scrollToSection("carrinhos")} className="nav-btn">
            Listar Carrinhos
          </button>
        </nav>
      </header>

      <main className="admin-container">

        {/* CADASTRO */}
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

        {/* LISTA PRODUTOS */}
        <section id="lista" className="admin-section">
          <h1 className="admin-title">Lista de Produtos</h1>

          <div className="admin-produtos-grid">
            {produtos.map((produto) => (
              <div key={produto._id} className="admin-produto-card">
                <img src={produto.urlfoto} alt={produto.nome} />
                <h3>{produto.nome}</h3>
                <p>R$ {produto.preco}</p>
                <p>{produto.descricao}</p>
              </div>
            ))}
          </div>
        </section>

        {/* LISTA USUÁRIOS */}
        <section id="usuarios" className="admin-section">
          <h1 className="admin-title">Usuários Cadastrados</h1>

          <button onClick={listarUsuarios} className="admin-btn">
            Listar Usuários Cadastrados
          </button>

          {mensagemUsuarios && <p className="admin-info">{mensagemUsuarios}</p>}

          {!!usuarios.length && (
            <div className="admin-usuarios-lista">
              {usuarios.map((user) => (
                <div key={user._id} className="admin-usuario-card">
                  <h3>{user.nome}</h3>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Tipo:</strong> {user.tipo}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* LISTA CARRINHOS */}
        <section id="carrinhos" className="admin-section">
          <h1 className="admin-title">Carrinhos Criados</h1>

          <button onClick={listarCarrinhos} className="admin-btn">
            Listar Todos os Carrinhos
          </button>

          {mensagemCarrinhos && <p className="admin-info">{mensagemCarrinhos}</p>}

          {/* ESTATÍSTICAS / MÉTRICAS */}
          {!!carrinhos.length && (
            <div className="admin-metricas">
              <h2 className="admin-title">📊 Estatísticas do Sistema</h2>

              <div className="admin-metricas-grid">

                <div className="admin-metrica-card">
                  <h3>Usuários com carrinho ativo</h3>
                  <p className="valor-metrica">{usuariosAtivos}</p>
                </div>

                <div className="admin-metrica-card">
                  <h3>Soma total dos carrinhos</h3>
                  <p className="valor-metrica">R$ {somaValores.toFixed(2)}</p>
                </div>

                <div className="admin-metrica-card" style={{ gridColumn: "1 / -1" }}>
                  <h3>Ranking dos itens mais presentes</h3>

                  {rankingItens.length ? (
                    <ol>
                      {rankingItens.map((item, index) => (
                        <li key={index}>
                          {item.nome} — {item.quantidade} unidades
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p>Nenhum item registrado.</p>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* LISTA DOS CARRINHOS */}
          {!!carrinhos.length && (
            <div className="admin-carrinhos-lista">
              {carrinhos.map((c) => (
                <div key={c._id} className="admin-carrinho-card">
                  <h3>Carrinho de {c.nomeUsuario}</h3>

                  <p>
                    <strong>Última atualização:</strong>{" "}
                    {new Date(c.dataAtualizacao).toLocaleString()}
                  </p>
                  <p><strong>Total:</strong> R$ {c.total}</p>
                  <p><strong>Itens:</strong> {c.itens.length}</p>

                  <hr style={{ margin: "10px 0" }} />

                  {c.itens.map((item, i) => (
                    <p key={i}>• {item.nome} — {item.quantidade} un</p>
                  ))}
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
