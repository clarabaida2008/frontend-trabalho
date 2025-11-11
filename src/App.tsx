import './App.css'
import api from './api/api'
import { jwtDecode } from "jwt-decode";
import React, { useState, useEffect } from 'react'

// Tipos
type ProdutoType = {
  _id: string,
  nome: string,
  preco: number,
  descricao: string,
  urlfoto: string
}

type CarrinhoItemType = {
  produtoId: string,
  quantidade: number
}

type CarrinhoType = {
  _id: string,
  usuarioId: string,
  itens: CarrinhoItemType[],
  dataAtualizacao: Date,
  total: number
}

function App() {
  // Estados
  const [produtos, setProdutos] = useState<ProdutoType[]>([]);
  const [carrinho, setCarrinho] = useState<CarrinhoType | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Busca os produtos cadastrados
  useEffect(() => {
    api.get("/produtos")
      .then((response) => {
        setProdutos(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar produtos:", error);
        alert("Erro ao buscar produtos. Veja o console.");
      });
  }, []);

  // Busca o carrinho do usuário logado
  useEffect(() => {
    api.get("/carrinho")
      .then((response) => {
        const carrinhoUsuario = response.data
        setCarrinho(carrinhoUsuario);
      })
      .catch((error) => {
        console.error("Erro ao buscar carrinho:", error);
        alert("Erro ao buscar carrinho. Veja o console.");
      });
  }, []);

  // Função para adicionar produto ao carrinho
  function adicionarItemCarrinho(produtoId: string) {
    api.post("/adicionarItem", { produtoId, quantidade: 1 })
      .then(() => {
        alert("Produto adicionado com sucesso!");

        // Atualiza o carrinho após adicionar
        api.get("/carrinho")
          .then((response) => {
            const carrinhoUsuario = response.data
            setCarrinho(carrinhoUsuario);
          });
      })
      .catch((error) => {
        if (error.response) {
          console.error(`Servidor respondeu mas com o erro: ${error.response.data.mensagem ?? error.response.data}`);
          alert(`Erro: ${error.response.data.mensagem ?? "Veja o console para mais informações"}`);
        } else {
          console.error(`Erro Axios: ${error.message}`);
          alert(`Servidor não respondeu. Erro: ${error.message ?? "Erro desconhecido"}`);
        }
      });
  }

  const produtosFiltrados = produtos.filter((p) => {
    const term = searchTerm.toLowerCase();
    return p.nome.toLowerCase().includes(term) || p.descricao.toLowerCase().includes(term);
  });

  return (
    <>
      <div className="header">
        <img src="./imagens/logo.png" alt="Floricultura Logo" className="logo" />
      </div>

      <div className="container">
        {/* Seção de Produtos */}
        <section className="products-section">
          <h2 className="section-title">Nossos Produtos</h2>
        {/* Campo de busca */}
          <input
            type="text"
             className="search-input"
            placeholder="Buscar pelo nome do produto"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="products-grid">
            {produtos.length > 0 ? (
              produtosFiltrados.map((produto) => (
                <div key={produto._id} className="product-card">
                  <img src={produto.urlfoto} alt={produto.nome} className="product-image" />
                  <div className="product-info">
                    <h3 className="product-name">{produto.nome}</h3>
                    <p className="product-description">{produto.descricao}</p>
                    <p className="product-price">R$ {produto.preco.toFixed(2)}</p>
                    <button
                      className="add-to-cart-btn"
                      onClick={() => adicionarItemCarrinho(produto._id)}
                    >
                      Adicionar ao Carrinho
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>Nenhum produto cadastrado.</p>
            )}
          </div>
        </section>

        {/* Seção do Carrinho */}
        <section className="cart-section">
          <h2 className="cart-title">
            Seu Carrinho ({carrinho?.itens?.length ?? 0})
          </h2>

          <div className="cart-items">
            {carrinho && carrinho.itens.length > 0 ? (
              carrinho.itens.map((item, index) => {
                const produto = produtos.find((p) => p._id === item.produtoId);
                return (
                  <div key={index} className="cart-item">
                    {produto ? (
                      <>
                        <img
                          src={produto.urlfoto}
                          alt={produto.nome}
                          className="cart-item-image"
                        />
                        <div className="cart-item-info">
                          <h4>{produto.nome}</h4>
                          <p>Qtd: {item.quantidade}</p>
                          <p>R$ {(produto.preco * item.quantidade).toFixed(2)}</p>
                        </div>
                      </>
                    ) : (
                      <p>Produto não encontrado.</p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="empty-cart-message">Seu carrinho está vazio</div>
            )}
          </div>

          <div className="cart-total">
            Total: R$ {carrinho ? carrinho.total.toFixed(2) : "0,00"}
          </div>

          <button className="checkout-btn">Finalizar Compra</button>
        </section>
      </div>
    </>
  );
}



export default App;
