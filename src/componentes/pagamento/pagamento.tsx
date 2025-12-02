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


  return (
    <div>
      <div>
        <div>
          <label htmlFor="card-number">Número do cartão</label>
          <CardNumberElement id="card-number" />
        </div>

        <div>
          <div>
            <label htmlFor="card-expiry">Validade</label>
            <CardExpiryElement id="card-expiry" />
          </div>

          <div>
            <label htmlFor="card-cvc">CVC</label>
            <CardCvcElement id="card-cvc" />
          </div>
        </div>
      </div>
      <div style={{ margin: "10px 0" }}>
        <strong>Valor a pagar:</strong>{" "}
        {cartTotal !== null ? `R$ ${cartTotal.toFixed(2)}` : "—"}
      </div>

      <button onClick={pagar} disabled={loading} >
        {loading ? "Processando..." : "Pagar"}
      </button>
      {status && <p>{status}</p>}
    </div>
  );
}
