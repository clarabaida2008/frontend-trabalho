import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from "@stripe/react-stripe-js";
import { useState, useEffect } from "react";
import api from "../../api/api";

export default function CartaoPagamento() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [cartTotal, setCartTotal] = useState<number | null>(null);

  const pagar = async () => {
    if (!stripe || !elements) return;

    setLoading(true);

    const { data } = await api.post("/pagamento");
    const { clientSecret, amount } = data; // amount vem em centavos

    // Se obtivermos o amount do backend, mostramos para o usuário (em reais) e verificamos
    if (amount && cartTotal !== null) {
      const amountReais = (amount / 100).toFixed(2);
      if (Number(amountReais) !== Number(cartTotal?.toFixed(2))) {
        setStatus(`Atenção: o valor de pagamento (${amountReais}) difere do total do carrinho (${cartTotal?.toFixed(2)}).`);
      }
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardNumberElement)!,
      },
    });

    if (result.error) {
      setStatus("Erro: " + result.error.message);
    } else if (result.paymentIntent?.status === "succeeded") {
      setStatus("Pagamento aprovado!");
    }

    setLoading(false);
  };

  // busca o carrinho para mostrar o total
  useEffect(() => {
    api
      .get("/carrinho")
      .then((resp) => setCartTotal(resp.data.total))
      .catch(() => setCartTotal(null));
  }, []);

  const getStatusClass = () => {
    if (status.includes("Erro") || status.includes("erro")) return "error";
    if (status.includes("aprovado")) return "success";
    return "info";
  };

  return (
    <div className="pagamento-page">
      <div className="pagamento-container">
        <h2 className="pagamento-title">Pagamento com Cartão</h2>
        
        <div className="pagamento-form">
          <div className="form-group">
            <label htmlFor="card-number">Número do cartão</label>
            <CardNumberElement 
              id="card-number" 
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#333',
                    '::placeholder': {
                      color: '#999',
                    },
                  },
                },
              }}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="card-expiry">Validade</label>
              <CardExpiryElement 
                id="card-expiry" 
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#333',
                      '::placeholder': {
                        color: '#999',
                      },
                    },
                  },
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="card-cvc">CVC</label>
              <CardCvcElement 
                id="card-cvc" 
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#333',
                      '::placeholder': {
                        color: '#999',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div className="pagamento-total">
          <div><strong>Valor a pagar:</strong></div>
          <div className="pagamento-total-valor">
            {cartTotal !== null ? `R$ ${cartTotal.toFixed(2)}` : "—"}
          </div>
        </div>

        <button 
          className="pagamento-btn" 
          onClick={pagar} 
          disabled={loading || !stripe}
        >
          {loading ? "Processando..." : "Confirmar Pagamento"}
        </button>

        {status && (
          <div className={`pagamento-status ${getStatusClass()}`}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}